import React, { useState, useEffect } from 'react';
import { EmailInvitationDto, nextholderService } from '../../../../services/nextholder.service';
import { toast } from 'react-toastify';
import './../NextholderManagement.scss';

export const InvitationManager: React.FC = () => {
    const [invitations, setInvitations] = useState<EmailInvitationDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSendForm, setShowSendForm] = useState(false);

    const [inviteForm, setInviteForm] = useState<{
        recipientEmail: string;
        recipientName: string;
        message: string;
    }>({
        recipientEmail: '',
        recipientName: '',
        message: ''
    });

    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadInvitations();
    }, []);

    const loadInvitations = async () => {
        setLoading(true);
        try {
            const data = await nextholderService.getInvitations();
            setInvitations(data);
        } catch (err: any) {
            toast.error('Failed to load invitations');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteForm.recipientEmail || !inviteForm.recipientName) {
            toast.error('Email and Name are required');
            return;
        }

        setSending(true);
        try {
            await nextholderService.sendInvitation({
                recipientEmail: inviteForm.recipientEmail,
                recipientName: inviteForm.recipientName,
                message: inviteForm.message,
                invitationType: 'nextholder_intro'
            });
            toast.success('Invitation sent successfully');
            setShowSendForm(false);
            setInviteForm({ recipientEmail: '', recipientName: '', message: '' });
            loadInvitations();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send invitation');
        } finally {
            setSending(false);
        }
    };

    const handleResend = async (id: number) => {
        if (!window.confirm('Are you sure you want to resend this invitation?')) return;

        try {
            await nextholderService.resendInvitation(id);
            toast.success('Invitation resent successfully');
            loadInvitations();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to resend invitation');
        }
    };

    return (
        <div className="invitation-manager nextholder-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Invitations</h3>
                <button
                    className="btn-primary"
                    onClick={() => setShowSendForm(!showSendForm)}
                >
                    {showSendForm ? 'Cancel' : 'Send New Invitation'}
                </button>
            </div>

            {showSendForm && (
                <form onSubmit={handleSend} style={{ marginBottom: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <h4>New Invitation</h4>
                    <div className="nextholder-grid">
                        <div className="form-group">
                            <label>Recipient Name *</label>
                            <input
                                value={inviteForm.recipientName}
                                onChange={(e) => setInviteForm({ ...inviteForm, recipientName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Recipient Email *</label>
                            <input
                                type="email"
                                value={inviteForm.recipientEmail}
                                onChange={(e) => setInviteForm({ ...inviteForm, recipientEmail: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group form-group--full">
                            <label>Message (Optional)</label>
                            <input
                                value={inviteForm.message}
                                onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                                placeholder="Personal message..."
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" disabled={sending}>
                        {sending ? 'Sending...' : 'Send Invitation'}
                    </button>
                </form>
            )}

            {loading ? (
                <div>Loading invitations...</div>
            ) : invitations.length === 0 ? (
                <div>No invitations found.</div>
            ) : (
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Recipient</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Sent Date</th>
                                <th>Expiry Date</th>
                                <th>Resends</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invitations.map(inv => (
                                <tr key={inv.id}>
                                    <td>{inv.recipientName}</td>
                                    <td>{inv.recipientEmail}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: inv.status === 'accepted' ? '#d4edda' : inv.status === 'expired' ? '#f8d7da' : '#fff3cd',
                                            color: inv.status === 'accepted' ? '#155724' : inv.status === 'expired' ? '#721c24' : '#856404',
                                            textTransform: 'capitalize'
                                        }}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>{inv.sentDate ? new Date(inv.sentDate).toLocaleDateString() : '-'}</td>
                                    <td>{inv.expiryDate ? new Date(inv.expiryDate).toLocaleDateString() : '-'}</td>
                                    <td>{inv.resendCount}</td>
                                    <td>
                                        {inv.status !== 'accepted' && (
                                            <button
                                                className="btn-secondary"
                                                onClick={() => inv.id && handleResend(inv.id)}
                                                style={{ fontSize: '12px', padding: '4px 8px' }}
                                            >
                                                Resend
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
