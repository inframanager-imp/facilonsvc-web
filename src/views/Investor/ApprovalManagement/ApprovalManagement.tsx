import React, { useState, useEffect } from 'react';
import { approvalService, ApprovalRequestDto, ApprovalResponseDto } from '../../../services/approval.service';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import { PremiumSelect } from '../../../components/PremiumSelect/PremiumSelect';
import './ApprovalManagement.scss';

interface ApprovalManagementProps {
    investorId: number;
    isAdmin?: boolean;
}

export const ApprovalManagement: React.FC<ApprovalManagementProps> = ({
    investorId,
    isAdmin = false
}) => {
    const [loading, setLoading] = useState(false);
    const [approvals, setApprovals] = useState<ApprovalResponseDto[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

    const [newRequest, setNewRequest] = useState<Partial<ApprovalRequestDto>>({
        investorId,
        requestType: 'status_change',
        reason: ''
    });

    useEffect(() => {
        loadApprovals();
    }, [activeTab, investorId]);

    const loadApprovals = async () => {
        setLoading(true);
        try {
            let data: ApprovalResponseDto[];
            if (isAdmin) {
                data = await approvalService.getAllPendingRequests();
            } else if (activeTab === 'pending') {
                data = await approvalService.getPendingApprovalRequests(investorId);
            } else {
                data = await approvalService.getApprovalRequests(investorId);
            }
            setApprovals(data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async () => {
        if (!newRequest.requestType || !newRequest.reason) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await approvalService.createApprovalRequest(newRequest as ApprovalRequestDto);
            toast.success('Approval request created successfully');
            setShowCreateModal(false);
            setNewRequest({
                investorId,
                requestType: 'status_change',
                reason: ''
            });
            loadApprovals();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (approvalId: number) => {
        if (!window.confirm('Are you sure you want to approve this request?')) {
            return;
        }

        setLoading(true);
        try {
            await approvalService.approveRequest(approvalId, 'Admin'); // TODO: Get actual user name
            toast.success('Request approved successfully');
            loadApprovals();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve request');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (approvalId: number) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        setLoading(true);
        try {
            await approvalService.rejectRequest(approvalId, 'Admin', reason); // TODO: Get actual user name
            toast.success('Request rejected');
            loadApprovals();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reject request');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'pending': return 'badge-warning';
            case 'approved': return 'badge-success';
            case 'rejected': return 'badge-danger';
            default: return 'badge-secondary';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <div className="dashboard-main-content">
                <div className="approval-management">
                    <div className="approval-header">
                        <h2>Approval Management</h2>
                        {!isAdmin && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                                disabled={loading}
                            >
                                + New Request
                            </button>
                        )}
                    </div>

                    {!isAdmin && (
                        <div className="approval-tabs">
                            <button
                                className={activeTab === 'pending' ? 'active' : ''}
                                onClick={() => setActiveTab('pending')}
                            >
                                Pending ({approvals.filter(a => a.status === 'pending').length})
                            </button>
                            <button
                                className={activeTab === 'all' ? 'active' : ''}
                                onClick={() => setActiveTab('all')}
                            >
                                All Requests
                            </button>
                        </div>
                    )}

                    <div className="approvals-list">
                        {loading && approvals.length === 0 ? (
                            <div className="loading">Loading approvals...</div>
                        ) : approvals.length === 0 ? (
                            <div className="empty-state">
                                <p>No approval requests found</p>
                            </div>
                        ) : (
                            approvals.map((approval) => (
                                <div key={approval.id} className="approval-card">
                                    <div className="approval-card-header">
                                        <div>
                                            <h4>{approval.requestType.replace('_', ' ').toUpperCase()}</h4>
                                            <span className={`badge ${getStatusBadgeClass(approval.status)}`}>
                                                {approval.status}
                                            </span>
                                        </div>
                                        {isAdmin && approval.status === 'pending' && (
                                            <div className="approval-actions">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleApprove(approval.id)}
                                                    disabled={loading}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleReject(approval.id)}
                                                    disabled={loading}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="approval-card-body">
                                        <div className="approval-detail">
                                            <label>Reason:</label>
                                            <p>{approval.reason}</p>
                                        </div>

                                        {approval.currentStatus && (
                                            <div className="approval-detail">
                                                <label>Current Status:</label>
                                                <p>{approval.currentStatus}</p>
                                            </div>
                                        )}

                                        {approval.requestedStatus && (
                                            <div className="approval-detail">
                                                <label>Requested Status:</label>
                                                <p>{approval.requestedStatus}</p>
                                            </div>
                                        )}

                                        <div className="approval-meta">
                                            <span>Requested: {formatDate(approval.requestedAt)}</span>
                                            {approval.requestedBy && <span>By: {approval.requestedBy}</span>}
                                        </div>

                                        {approval.status !== 'pending' && (
                                            <div className="approval-result">
                                                <div className="approval-detail">
                                                    <label>{approval.status === 'approved' ? 'Approved' : 'Rejected'} By:</label>
                                                    <p>{approval.approvedBy || 'N/A'}</p>
                                                </div>
                                                <div className="approval-detail">
                                                    <label>Date:</label>
                                                    <p>{formatDate(approval.approvedAt)}</p>
                                                </div>
                                                {approval.rejectionReason && (
                                                    <div className="approval-detail">
                                                        <label>Rejection Reason:</label>
                                                        <p>{approval.rejectionReason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Create Request Modal */}
                    {showCreateModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h3>Create Approval Request</h3>

                                <div className="form-group">
                                    <label>Request Type *</label>
                                    <PremiumSelect
                                        value={newRequest.requestType ?? ''}
                                        onChange={(val) => setNewRequest({ ...newRequest, requestType: val })}
                                        options={[
                                            { value: 'status_change', label: 'Status Change' },
                                            { value: 'document_approval', label: 'Document Approval' },
                                            { value: 'profile_update', label: 'Profile Update' },
                                        ]}
                                        placeholder="Select Type"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Current Status</label>
                                    <input
                                        type="text"
                                        value={newRequest.currentStatus || ''}
                                        onChange={(e) => setNewRequest({ ...newRequest, currentStatus: e.target.value })}
                                        className="form-control"
                                        placeholder="e.g., Pending Verification"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Requested Status</label>
                                    <input
                                        type="text"
                                        value={newRequest.requestedStatus || ''}
                                        onChange={(e) => setNewRequest({ ...newRequest, requestedStatus: e.target.value })}
                                        className="form-control"
                                        placeholder="e.g., Approved"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Reason *</label>
                                    <textarea
                                        value={newRequest.reason}
                                        onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                                        className="form-control"
                                        rows={4}
                                        placeholder="Please explain why you need this approval..."
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setNewRequest({
                                                investorId,
                                                requestType: 'status_change',
                                                reason: ''
                                            });
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleCreateRequest}
                                        disabled={loading || !newRequest.reason}
                                    >
                                        {loading ? 'Creating...' : 'Create Request'}
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
