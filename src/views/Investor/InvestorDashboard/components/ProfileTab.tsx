import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InvestorDashboardDto } from '../../../../services/investor.service';

interface ProfileTabProps {
  dashboardData: InvestorDashboardDto;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ dashboardData }) => {
  const navigate = useNavigate();

  return (
    <div className="profile-tab">
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="card p-3 h-100">
            <h5 className="mb-3">
              <i className="bi bi-person-circle me-2"></i>
              Account Snapshot
            </h5>
            <p className="mb-1">
              <strong>Full Name:</strong>{' '}
              {dashboardData?.investor?.name ||
                [
                  dashboardData?.investor?.firstName,
                  dashboardData?.investor?.middleName,
                  dashboardData?.investor?.lastName,
                ]
                  .filter(Boolean)
                  .join(' ') ||
                '-'}
            </p>
            <p className="mb-1">
              <strong>Email:</strong> {dashboardData?.investor?.email || '-'}
            </p>
            <p className="mb-1">
              <strong>Investor ID:</strong> {dashboardData?.accountSnapshot?.investorId || '-'}
            </p>
            <p className="mb-1">
              <strong>Investor Type:</strong> {dashboardData?.investor?.investorType || '-'}
            </p>
            <p className="mb-1">
              <strong>Primary Jurisdiction:</strong>{' '}
              {dashboardData?.accountSnapshot?.primaryJurisdiction || '-'}
            </p>
            <p className="mb-0">
              <strong>Last Activity:</strong> {dashboardData?.accountSnapshot?.lastActivity || '-'}
            </p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 h-100">
            <h5 className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Actions / Alerts
            </h5>
            <p className="mb-1">
              <strong>Action Required:</strong> {dashboardData?.actionsAlerts?.actionRequired || '-'}
            </p>
            <p className="mb-1">
              <strong>Onboarding Status:</strong>{' '}
              {dashboardData?.actionsAlerts?.onboardingStatus || '-'}
            </p>
            <p className="mb-3">
              <strong>Restrictions:</strong> {dashboardData?.actionsAlerts?.restrictions || '-'}
            </p>
            <div className="dashboard-action-buttons">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate('/investor/profile')}
              >
                <i className="bi bi-pencil me-1"></i>
                Edit Profile
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate('/investor/progress')}
              >
                <i className="bi bi-graph-up me-1"></i>
                View Progress
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate('/investor/account-details')}
              >
                <i className="bi bi-gear me-1"></i>
                Account Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {dashboardData?.progress && (
        <div className="card p-3 mb-3">
          <h5 className="mb-3">
            <i className="bi bi-clipboard-check me-2"></i>
            KYC & Onboarding Progress
          </h5>
          <div className="row">
            <div className="col-md-12">
              <p className="text-muted">
                Your onboarding journey is in progress. Visit the Progress page for detailed step tracking.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/investor/progress')}
              >
                View Detailed Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
