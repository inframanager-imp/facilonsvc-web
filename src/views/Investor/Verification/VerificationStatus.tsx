import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService } from '../../../services/investor.service';
import './VerificationStatus.scss';

interface VerificationStatusData {
    currentStatus: string;
    physicalSubmission: {
        submitted: boolean;
        submittedAt?: string;
        trackingNumber?: string;
        status: string;
    };
    appointment: {
        scheduled: boolean;
        appointmentDate?: string;
        appointmentTime?: string;
        verificationType?: string;
        location?: string;
        status: string;
    };
    verifiedBy?: string;
    verifiedAt?: string;
    rejectionReason?: string;
    nextSteps: string;
}

export const VerificationStatus: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<VerificationStatusData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVerificationStatus();
    }, []);

    const loadVerificationStatus = async () => {
        try {
            const data = await investorService.getVerificationStatus();
            setStatus(data);
        } catch (error) {
            console.error('Error loading verification status:', error);
            toast.error('Failed to load verification status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (statusValue: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            pending: { label: 'Pending', className: 'status-pending' },
            in_progress: { label: 'In Progress', className: 'status-in-progress' },
            completed: { label: 'Completed', className: 'status-completed' },
            verified: { label: 'Verified', className: 'status-verified' },
            rejected: { label: 'Rejected', className: 'status-rejected' },
        };

        const statusInfo = statusMap[statusValue] || statusMap.pending;
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Header />
                <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
                    <div className="verification-status">
                        <p>Loading verification status...</p>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Header />
            <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
                <div className="verification-status">
                    <div className="verification-status__header">
                        <h1>Verification Status</h1>
                        <div className="verification-status__current">
                            {status && getStatusBadge(status.currentStatus)}
                        </div>
                    </div>

                    {status && (
                        <>
                            <div className="status-section">
                                <div className="status-section__header">
                                    <h2>Physical Document Submission</h2>
                                    {status.physicalSubmission.submitted ? (
                                        <span className="status-icon status-icon--success">✓</span>
                                    ) : (
                                        <span className="status-icon status-icon--pending">○</span>
                                    )}
                                </div>

                                {status.physicalSubmission.submitted ? (
                                    <div className="status-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Submitted:</span>
                                            <span className="detail-value">
                                                {status.physicalSubmission.submittedAt
                                                    ? new Date(status.physicalSubmission.submittedAt).toLocaleDateString()
                                                    : 'Yes'}
                                            </span>
                                        </div>
                                        {status.physicalSubmission.trackingNumber && (
                                            <div className="detail-item">
                                                <span className="detail-label">Tracking Number:</span>
                                                <span className="detail-value">{status.physicalSubmission.trackingNumber}</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <span className="detail-label">Status:</span>
                                            <span className="detail-value">{getStatusBadge(status.physicalSubmission.status)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="status-action">
                                        <p>You haven't submitted your physical documents yet.</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate('/investor/physical-submission')}
                                        >
                                            Record Physical Submission
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="status-section">
                                <div className="status-section__header">
                                    <h2>Verification Appointment</h2>
                                    {status.appointment.scheduled ? (
                                        <span className="status-icon status-icon--success">✓</span>
                                    ) : (
                                        <span className="status-icon status-icon--pending">○</span>
                                    )}
                                </div>

                                {status.appointment.scheduled ? (
                                    <div className="status-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Date:</span>
                                            <span className="detail-value">
                                                {status.appointment.appointmentDate
                                                    ? new Date(status.appointment.appointmentDate).toLocaleDateString()
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Time:</span>
                                            <span className="detail-value">{status.appointment.appointmentTime || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Type:</span>
                                            <span className="detail-value">{status.appointment.verificationType || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Location:</span>
                                            <span className="detail-value">{status.appointment.location || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Status:</span>
                                            <span className="detail-value">{getStatusBadge(status.appointment.status)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="status-action">
                                        <p>No verification appointment scheduled yet.</p>
                                        <p className="status-note">An appointment will be scheduled after your documents are reviewed.</p>
                                    </div>
                                )}
                            </div>

                            {status.currentStatus === 'verified' && (
                                <div className="status-section status-section--success">
                                    <div className="verification-complete">
                                        <div className="verification-complete__icon">✓</div>
                                        <h2>Verification Complete!</h2>
                                        <p>Your account has been successfully verified.</p>
                                        {status.verifiedBy && (
                                            <p className="verified-by">Verified by: {status.verifiedBy}</p>
                                        )}
                                        {status.verifiedAt && (
                                            <p className="verified-at">
                                                Verified on: {new Date(status.verifiedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {status.rejectionReason && (
                                <div className="status-section status-section--error">
                                    <h2>Rejection Reason</h2>
                                    <p>{status.rejectionReason}</p>
                                </div>
                            )}

                            <div className="next-steps">
                                <h3>Next Steps</h3>
                                <p>{status.nextSteps}</p>
                            </div>
                        </>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    );
};
