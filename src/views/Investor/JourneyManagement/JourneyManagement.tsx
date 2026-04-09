import React, { useState, useEffect } from 'react';
import { journeyService, JourneyDiscontinueDto, AbandonJourneyDto } from '../../../services/journey.service';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import './JourneyManagement.scss';

interface JourneyManagementProps {
    uniqueCode: string;
    investorId?: number;
    brokerId?: number;
    productId?: number;
}

export const JourneyManagement: React.FC<JourneyManagementProps> = ({
    uniqueCode,
    investorId,
    brokerId,
    productId
}) => {
    const [loading, setLoading] = useState(false);
    const [journeyStatus, setJourneyStatus] = useState<string>('');
    const [showDiscontinueModal, setShowDiscontinueModal] = useState(false);
    const [showAbandonModal, setShowAbandonModal] = useState(false);
    const [discontinueReason, setDiscontinueReason] = useState('');
    const [discontinueComments, setDiscontinueComments] = useState('');
    const [abandonReason, setAbandonReason] = useState('');

    useEffect(() => {
        loadJourneyStatus();
    }, [uniqueCode]);

    const loadJourneyStatus = async () => {
        try {
            const status = await journeyService.getJourneyStatus(uniqueCode);
            setJourneyStatus(status.status);
        } catch (error) {
            console.error('Error loading journey status:', error);
        }
    };

    const handleDiscontinue = async () => {
        if (!discontinueReason.trim()) {
            toast.error('Please provide a reason for discontinuation');
            return;
        }

        if (!window.confirm('Are you sure you want to discontinue your journey? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            const data: JourneyDiscontinueDto = {
                reason: discontinueReason,
                comments: discontinueComments || undefined
            };

            const response = await journeyService.discontinueJourney(uniqueCode, data);
            toast.success(response.message || 'Journey discontinued successfully');
            setShowDiscontinueModal(false);
            setDiscontinueReason('');
            setDiscontinueComments('');
            loadJourneyStatus();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to discontinue journey');
        } finally {
            setLoading(false);
        }
    };

    const handleAbandon = async () => {
        if (!investorId || !brokerId || !productId) {
            toast.error('Missing required information for abandoning journey');
            return;
        }

        if (!window.confirm('Are you sure you want to abandon your journey? This will permanently close your application.')) {
            return;
        }

        setLoading(true);
        try {
            const data: AbandonJourneyDto = {
                investorId,
                brokerId,
                productId,
                abandonReason: abandonReason || undefined
            };

            const response = await journeyService.abandonJourney(data);
            toast.success(response.message || 'Journey abandoned successfully');
            setShowAbandonModal(false);
            setAbandonReason('');
            loadJourneyStatus();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to abandon journey');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <div className="dashboard-main-content">
                <div className="journey-management">
                    <h2>Journey Management</h2>

                    <div className="journey-status-card">
                        <h3>Current Status</h3>
                        <p className="status-badge">{journeyStatus || 'Loading...'}</p>
                    </div>

                    <div className="journey-actions">
                        <div className="action-card">
                            <h4>Discontinue Journey</h4>
                            <p>Temporarily pause your onboarding journey. You can resume later.</p>
                            <button
                                className="btn btn-warning"
                                onClick={() => setShowDiscontinueModal(true)}
                                disabled={loading}
                            >
                                Discontinue Journey
                            </button>
                        </div>

                        <div className="action-card">
                            <h4>Abandon Journey</h4>
                            <p>Permanently close your application. This action cannot be undone.</p>
                            <button
                                className="btn btn-danger"
                                onClick={() => setShowAbandonModal(true)}
                                disabled={loading || !investorId || !brokerId || !productId}
                            >
                                Abandon Journey
                            </button>
                        </div>
                    </div>

                    {/* Discontinue Modal */}
                    {showDiscontinueModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h3>Discontinue Journey</h3>
                                <div className="form-group">
                                    <label>Reason *</label>
                                    <select
                                        value={discontinueReason}
                                        onChange={(e) => setDiscontinueReason(e.target.value)}
                                        className="form-control"
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="Need more time">Need more time</option>
                                        <option value="Missing documents">Missing documents</option>
                                        <option value="Changed mind">Changed my mind</option>
                                        <option value="Technical issues">Technical issues</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Additional Comments</label>
                                    <textarea
                                        value={discontinueComments}
                                        onChange={(e) => setDiscontinueComments(e.target.value)}
                                        className="form-control"
                                        rows={4}
                                        placeholder="Please provide any additional details..."
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowDiscontinueModal(false);
                                            setDiscontinueReason('');
                                            setDiscontinueComments('');
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-warning"
                                        onClick={handleDiscontinue}
                                        disabled={loading || !discontinueReason}
                                    >
                                        {loading ? 'Processing...' : 'Confirm Discontinue'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Abandon Modal */}
                    {showAbandonModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h3>Abandon Journey</h3>
                                <div className="alert alert-danger">
                                    <strong>Warning:</strong> This action is permanent and cannot be undone.
                                    Your application will be permanently closed.
                                </div>
                                <div className="form-group">
                                    <label>Reason (Optional)</label>
                                    <textarea
                                        value={abandonReason}
                                        onChange={(e) => setAbandonReason(e.target.value)}
                                        className="form-control"
                                        rows={4}
                                        placeholder="Please tell us why you're abandoning your journey..."
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowAbandonModal(false);
                                            setAbandonReason('');
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={handleAbandon}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Confirm Abandon'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
