import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './PostLoginHeader.scss';

const PostLoginHeader: React.FC = () => {
  const { logout, userId, userName, userRoles } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    console.log('[PostLoginHeader] handleLogout called');
    logout();
  };

  const isServiceAgent = userRoles.some(role => role === 'SERVICE_AGENT' || role.toUpperCase() === 'SERVICE_AGENT');
  const isInvestor = !isServiceAgent;

  return (
    <header className="post-login-header">
      <div className="header-content">
        <div className="header-left">
          <h3
            onClick={() => navigate(isServiceAgent ? '/service-agent/dashboard' : '/investor/dashboard')}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate(isServiceAgent ? '/service-agent/dashboard' : '/investor/dashboard');
              }
            }}
            tabIndex={0}
            role="button"
            style={{ cursor: 'pointer' }}
          >
            Facilon Platform
          </h3>
        </div>
        <nav className="header-nav">
          {isServiceAgent && (
            <>
              <button className="nav-link" onClick={() => navigate('/service-agent/dashboard')}>Dashboard</button>
              <button className="nav-link" onClick={() => navigate('/service-agent/investors')}>My Investors</button>
              <button className="nav-link" onClick={() => navigate('/service-agent/audit-logs')}>Audit Logs</button>
              <button className="nav-link" onClick={() => navigate('/service-agent/profile')}>Profile</button>
            </>
          )}
          {isInvestor && (
            <>
              <button className="nav-link" onClick={() => navigate('/investor/dashboard')}>Dashboard</button>
              <button className="nav-link" onClick={() => navigate('/investor/delegations')}>Service Agent</button>
              <button className="nav-link" onClick={() => navigate('/investor/service-agent-activity')}>SA Activity</button>
            </>
          )}
        </nav>
        <div className="header-right">
          <span className="user-info">{userName || `User: ${userId}`}</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            {t('logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default PostLoginHeader;
