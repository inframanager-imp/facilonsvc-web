import React, { useState, useEffect } from 'react';
import { NextholderDto, nextholderService } from '../../../../services/nextholder.service';
import { toast } from 'react-toastify';
import './../NextholderManagement.scss';

interface NextholderFormProps {
    initialData?: NextholderDto;
    onSuccess: () => void;
    onCancel: () => void;
}

export const NextholderForm: React.FC<NextholderFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<NextholderDto>({
        firstName: '',
        middleName: '',
        lastName: '',
        relationship: 'Spouse',
        dateOfBirth: '',
        email: '',
        mobile: '',
        pan: '',
        aadhaar: '',
        isMinor: false,
        guardianName: '',
        guardianRelationship: '',
        guardianPan: '',
        status: 1,
        ...initialData
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (formData.dateOfBirth) {
            const dob = new Date(formData.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            setFormData(prev => ({ ...prev, isMinor: age < 18 }));
        }
    }, [formData.dateOfBirth]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: val
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.relationship || !formData.dateOfBirth) {
            toast.error('Please fill all required fields');
            return;
        }

        if (formData.isMinor && (!formData.guardianName || !formData.guardianRelationship)) {
            toast.error('Guardian details are required for minors');
            return;
        }

        setLoading(true);
        try {
            if (initialData && initialData.id) {
                await nextholderService.updateNextholder(initialData.id, formData);
                toast.success('Nextholder updated successfully');
            } else {
                await nextholderService.createNextholder(formData);
                toast.success('Nextholder created successfully');
            }
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="nextholder-form nextholder-card">
            <h3>{initialData ? 'Edit Nextholder' : 'Add New Nextholder'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="nextholder-grid">
                    <div className="form-group">
                        <label>First Name *</label>
                        <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Middle Name</label>
                        <input
                            name="middleName"
                            value={formData.middleName || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name *</label>
                        <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date of Birth *</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Relationship *</label>
                        <select
                            name="relationship"
                            value={formData.relationship}
                            onChange={handleChange}
                            required
                        >
                            <option value="Spouse">Spouse</option>
                            <option value="Child">Child</option>
                            <option value="Parent">Parent</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Transgender">Transgender</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mobile</label>
                        <input
                            name="mobile"
                            value={formData.mobile || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>PAN</label>
                        <input
                            name="pan"
                            value={formData.pan || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {formData.isMinor && (
                    <div className="nextholder-card" style={{ background: '#f9f9f9', marginTop: '10px' }}>
                        <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Guardian Details (Required for Minor)</h4>
                        <div className="nextholder-grid">
                            <div className="form-group">
                                <label>Guardian Name *</label>
                                <input
                                    name="guardianName"
                                    value={formData.guardianName || ''}
                                    onChange={handleChange}
                                    required={formData.isMinor}
                                />
                            </div>
                            <div className="form-group">
                                <label>Guardian Relationship *</label>
                                <input
                                    name="guardianRelationship"
                                    value={formData.guardianRelationship || ''}
                                    onChange={handleChange}
                                    required={formData.isMinor}
                                />
                            </div>
                            <div className="form-group">
                                <label>Guardian PAN</label>
                                <input
                                    name="guardianPan"
                                    value={formData.guardianPan || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Nextholder'}
                    </button>
                </div>
            </form>
        </div>
    );
};
