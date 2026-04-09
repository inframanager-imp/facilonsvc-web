import React, { useState, useEffect } from 'react';
import { sessionService, SessionDto, SessionStatusDto } from '../../../services/session.service';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import './SessionManagement.scss';

export const SessionManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [sessionStatus, setSessionStatus] = useState<SessionStatusDto | null>(null);
    const [activeSessions, setActiveSessions] = useState<SessionDto[]>([]);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

    useEffect(() => {
        loadSessionData();

        // Check session status every minute
        const interval = setInterval(() => {
            checkSessionTimeout();
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, []);

    const loadSessionData = async () => {
        setLoading(true);
        try {
            const [status, sessions] = await Promise.all([
                sessionService.getSessionStatus(),
                sessionService.getActiveSessions()
            ]);

            setSessionStatus(status);
            setActiveSessions(sessions);

            // Check if we should show timeout warning
            if (status && sessionService.shouldShowTimeoutWarning(status.expiresInSeconds)) {
                setShowTimeoutWarning(true);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load session data');
        } finally {
            setLoading(false);
        }
    };

    const checkSessionTimeout = async () => {
        try {
            const status = await sessionService.getSessionStatus();
            setSessionStatus(status);

            if (sessionService.shouldShowTimeoutWarning(status.expiresInSeconds)) {
                setShowTimeoutWarning(true);
            } else {
                setShowTimeoutWarning(false);
            }
        } catch (error) {
            console.error('Error checking session timeout:', error);
        }
    };

    const handleExtendSession = async () => {
        // Making any API call extends the session
        await loadSessionData();
        setShowTimeoutWarning(false);
        toast.success('Session extended');
    };

    const handleLogoutSession = async (sessionId: string) => {
        if (!window.confirm('Are you sure you want to logout this session?')) {
            return;
        }

        try {
            await sessionService.logoutSession(sessionId);
            toast.success('Session logged out successfully');
            loadSessionData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to logout session');
        }
    };

    const handleLogoutAllDevices = async () => {
        if (!window.confirm('Are you sure you want to logout from all other devices? This will end all your other active sessions.')) {
            return;
        }

        try {
            const result = await sessionService.logoutAllDevices();
            toast.success(`Logged out from ${result.count} device(s)`);
            loadSessionData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to logout all devices');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getDeviceInfo = (userAgent: string) => {
        const { browser, os, device } = sessionService.parseUserAgent(userAgent);
        return `${browser} on ${os} (${device})`;
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Header />
                <div className="dashboard-main-content">
                    <div className="session-management">
                        <div className="loading">Loading session information...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Header />
            <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
                <div className="session-management">
                    <h2>Session Management</h2>

                    {/* Timeout Warning Modal */}
                    {showTimeoutWarning && sessionStatus && (
                        <div className="timeout-warning-modal">
                            <div className="modal-content">
                                <h3>⚠️ Session Expiring Soon</h3>
                                <p>
                                    Your session will expire in{' '}
                                    <strong>{sessionService.formatTimeRemaining(sessionStatus.expiresInSeconds)}</strong>
                                </p>
                                <p>Click "Extend Session" to continue working, or you will be automatically logged out.</p>
                                <div className="modal-actions">
                                    <button className="btn btn-primary" onClick={handleExtendSession}>
                                        Extend Session
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setShowTimeoutWarning(false)}>
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Current Session Card */}
                    {sessionStatus && (
                        <div className="session-card current-session">
                            <h3>Current Session</h3>
                            <div className="session-details">
                                <div className="detail-row">
                                    <label>Login Method:</label>
                                    <span className="badge">{sessionStatus.loginMethod === 'azure-b2c' ? 'Azure AD B2C' : 'Local'}</span>
                                </div>
                                <div className="detail-row">
                                    <label>Login Time:</label>
                                    <span>{formatDate(sessionStatus.loginTime)}</span>
                                </div>
                                <div className="detail-row">
                                    <label>Last Activity:</label>
                                    <span>{formatDate(sessionStatus.lastActivityTime)}</span>
                                </div>
                                <div className="detail-row">
                                    <label>Expires In:</label>
                                    <span className={sessionStatus.expiresInSeconds < 300 ? 'expiring-soon' : ''}>
                                        {sessionService.formatTimeRemaining(sessionStatus.expiresInSeconds)}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <label>Status:</label>
                                    <span className={`status-badge ${sessionStatus.isActive ? 'active' : 'inactive'}`}>
                                        {sessionStatus.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Sessions List */}
                    <div className="sessions-section">
                        <div className="section-header">
                            <h3>Active Sessions ({activeSessions.length})</h3>
                            {activeSessions.length > 1 && (
                                <button className="btn btn-danger" onClick={handleLogoutAllDevices}>
                                    Logout All Other Devices
                                </button>
                            )}
                        </div>

                        <div className="sessions-list">
                            {activeSessions.length === 0 ? (
                                <div className="empty-state">
                                    <p>No active sessions found</p>
                                </div>
                            ) : (
                                activeSessions.map((session) => (
                                    <div key={session.sessionId} className={`session-item ${session.isCurrent ? 'current' : ''}`}>
                                        <div className="session-item-header">
                                            <div className="device-info">
                                                <span className="device-icon">
                                                    {session.userAgent.includes('Mobile') ? '📱' : '💻'}
                                                </span>
                                                <div>
                                                    <h4>{getDeviceInfo(session.userAgent)}</h4>
                                                    {session.isCurrent && <span className="current-badge">Current Session</span>}
                                                </div>
                                            </div>
                                            {!session.isCurrent && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleLogoutSession(session.sessionId)}
                                                >
                                                    Logout
                                                </button>
                                            )}
                                        </div>
                                        <div className="session-item-details">
                                            <div className="detail">
                                                <label>IP Address:</label>
                                                <span>{session.ipAddress || 'Unknown'}</span>
                                            </div>
                                            <div className="detail">
                                                <label>Login Time:</label>
                                                <span>{new Date(session.loginTime).toLocaleString()}</span>
                                            </div>
                                            <div className="detail">
                                                <label>Last Activity:</label>
                                                <span>{new Date(session.lastActivityTime).toLocaleString()}</span>
                                            </div>
                                            <div className="detail">
                                                <label>Method:</label>
                                                <span>{session.loginMethod === 'azure-b2c' ? 'Azure AD B2C' : 'Local'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Security Tips */}
                    <div className="security-tips">
                        <h4>🔒 Security Tips</h4>
                        <ul>
                            <li>Always logout when using a shared or public computer</li>
                            <li>Review your active sessions regularly</li>
                            <li>If you see an unfamiliar session, logout that device immediately</li>
                            <li>Your session will automatically expire after 30 minutes of inactivity</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
