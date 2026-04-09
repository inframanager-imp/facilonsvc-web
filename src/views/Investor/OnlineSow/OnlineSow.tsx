import React, { useState, useEffect, useRef } from 'react';
import { sowService, SowTemplateDto, InvestorSowDto, SowSection, SowField } from '../../../services/sow.service';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import './OnlineSow.scss';

interface OnlineSowProps {
    investorId: number;
    applicableFor?: string;
}

export const OnlineSow: React.FC<OnlineSowProps> = ({ investorId, applicableFor = 'All' }) => {
    const [loading, setLoading] = useState(true);
    const [template, setTemplate] = useState<SowTemplateDto | null>(null);
    const [currentSow, setCurrentSow] = useState<InvestorSowDto | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        loadSowData();
    }, []);

    const loadSowData = async () => {
        setLoading(true);
        try {
            // Get template
            const templateData = await sowService.getTemplate(applicableFor);
            setTemplate(templateData);

            // Check if investor has existing draft
            const sows = await sowService.listSows(investorId);
            const draft = sows.find(s => s.status === 'draft');

            if (draft) {
                setCurrentSow(draft);
                setFormData(draft.sowData || {});
                if (draft.digitalSignature) {
                    setSignature(draft.digitalSignature);
                }
            } else {
                // Create new draft
                const newSow = await sowService.createSow({
                    investorId,
                    templateId: templateData.id,
                    sowData: {}
                });
                setCurrentSow(newSow);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load SOW');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSaveDraft = async () => {
        if (!currentSow) return;

        setSaving(true);
        try {
            await sowService.updateSow(currentSow.id, {
                sowData: formData,
                digitalSignature: signature || undefined
            });
            toast.success('Draft saved successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save draft');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!currentSow) return;

        if (!signature) {
            toast.error('Please provide your digital signature');
            setShowSignaturePad(true);
            return;
        }

        // Validate required fields
        if (template) {
            for (const section of template.content.sections) {
                if (section.fields) {
                    for (const field of section.fields) {
                        if (field.required && !formData[field.name]) {
                            toast.error(`${field.label} is required`);
                            return;
                        }
                    }
                }
            }
        }

        setSaving(true);
        try {
            // Save final data
            await sowService.updateSow(currentSow.id, {
                sowData: formData,
                digitalSignature: signature
            });

            // Submit for approval
            const result = await sowService.submitSow(currentSow.id);
            toast.success(result.message);
            setCurrentSow(result.sow);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit SOW');
        } finally {
            setSaving(false);
        }
    };

    // Signature pad functions
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature(null);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL();
        setSignature(dataUrl);
        setShowSignaturePad(false);
        toast.success('Signature saved');
    };

    const renderField = (field: SowField) => {
        const value = formData[field.name] || field.value || '';

        switch (field.type) {
            case 'text':
            case 'number':
                return (
                    <input
                        type={field.type}
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        readOnly={field.readonly}
                        className="form-control"
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        readOnly={field.readonly}
                        className="form-control"
                        rows={4}
                    />
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        disabled={field.readonly}
                        className="form-control"
                    >
                        <option value="">Select...</option>
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                            required={field.required}
                            disabled={field.readonly}
                        />
                        <span>{field.label}</span>
                    </label>
                );

            default:
                return <input type="text" value={value} onChange={(e) => handleFieldChange(field.name, e.target.value)} className="form-control" />;
        }
    };

    const renderSection = (section: SowSection, index: number) => {
        return (
            <div key={index} className="sow-section">
                <h3>{section.title}</h3>

                {section.type === 'static' && section.content && (
                    <div className="static-content" dangerouslySetInnerHTML={{ __html: section.content }} />
                )}

                {section.fields && (
                    <div className="form-fields">
                        {section.fields.map((field, idx) => (
                            <div key={idx} className={`form-group ${field.type === 'checkbox' ? 'checkbox-group' : ''}`}>
                                {field.type !== 'checkbox' && <label>{field.label} {field.required && <span className="required">*</span>}</label>}
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Header />
                <div className="dashboard-main-content">
                    <div className="online-sow">
                        <div className="loading">Loading Statement of Work...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!template || !currentSow) {
        return (
            <div className="dashboard-layout">
                <Header />
                <div className="dashboard-main-content">
                    <div className="online-sow">
                        <div className="error">No SOW template available</div>
                    </div>
                </div>
            </div>
        );
    }

    const isReadOnly = currentSow.status !== 'draft';

    return (
        <div className="dashboard-layout">
            <Header />
            <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
                <div className="online-sow">
                    <div className="sow-header">
                        <h2>Statement of Work</h2>
                        <div className="sow-status">
                            <span className={`badge ${sowService.getStatusBadgeClass(currentSow.status)}`}>
                                {sowService.getStatusText(currentSow.status)}
                            </span>
                        </div>
                    </div>

                    {currentSow.rejectionReason && (
                        <div className="rejection-notice">
                            <strong>Rejection Reason:</strong> {currentSow.rejectionReason}
                        </div>
                    )}

                    <div className="sow-content">
                        {template.content.sections.map((section, index) => renderSection(section, index))}

                        {/* Digital Signature Section */}
                        <div className="sow-section signature-section">
                            <h3>Digital Signature</h3>
                            {signature ? (
                                <div className="signature-display">
                                    <img src={signature} alt="Digital Signature" />
                                    {!isReadOnly && (
                                        <button className="btn btn-sm btn-secondary" onClick={() => setShowSignaturePad(true)}>
                                            Change Signature
                                        </button>
                                    )}
                                </div>
                            ) : (
                                !isReadOnly && (
                                    <button className="btn btn-primary" onClick={() => setShowSignaturePad(true)}>
                                        Add Signature
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {!isReadOnly && (
                        <div className="sow-actions">
                            <button className="btn btn-secondary" onClick={handleSaveDraft} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                                {saving ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        </div>
                    )}

                    {/* Signature Pad Modal */}
                    {showSignaturePad && (
                        <div className="signature-modal">
                            <div className="modal-content">
                                <h3>Draw Your Signature</h3>
                                <canvas
                                    ref={canvasRef}
                                    width={500}
                                    height={200}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    className="signature-canvas"
                                />
                                <div className="modal-actions">
                                    <button className="btn btn-secondary" onClick={clearSignature}>Clear</button>
                                    <button className="btn btn-primary" onClick={saveSignature}>Save Signature</button>
                                    <button className="btn btn-outline" onClick={() => setShowSignaturePad(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
