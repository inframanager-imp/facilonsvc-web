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
          <div className="bg-surface p-4 rounded-xl border border-neutral-200 shadow-sm h-100">
            <h5 className="mb-3 font-bold text-neutral-800">
              <i className="bi bi-person-circle me-2 text-primary-500"></i>
              Account Snapshot
            </h5>
            <p className="mb-1 text-neutral-600">
              <strong className="text-neutral-800">Full Name:</strong>{' '}
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
            <p className="mb-1 text-neutral-600">
              <strong className="text-neutral-800">Email:</strong> {dashboardData?.investor?.email || '-'}
            </p>
            <p className="mb-1 text-neutral-600">
              <strong className="text-neutral-800">Investor ID:</strong> {dashboardData?.accountSnapshot?.investorId || '-'}
            </p>
            <p className="mb-1 text-neutral-600">
              <strong className="text-neutral-800">Investor Type:</strong> {dashboardData?.investor?.investorType || '-'}
            </p>
            <p className="mb-1 text-neutral-600">
              <strong className="text-neutral-800">Primary Jurisdiction:</strong>{' '}
              {dashboardData?.accountSnapshot?.primaryJurisdiction || '-'}
            </p>
            <p className="mb-0 text-neutral-600">
              <strong className="text-neutral-800">Last Activity:</strong> {dashboardData?.accountSnapshot?.lastActivity || '-'}
            </p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="bg-surface p-4 rounded-xl border border-neutral-200 shadow-sm h-100">
            <h5 className="mb-3 font-bold text-neutral-800">
              <i className="bi bi-exclamation-triangle me-2 text-warning-500"></i>
              Actions / Alerts
            </h5>
            <p className="mb-1 text-neutral-600">
              <strong className="text-neutral-800">Action Required:</strong> {dashboardData?.actionsAlerts?.actionRequired || '-'}
            </p>
            <p className="mb-1 text-neutral-600">
              <strong className="text-neutral-800">Onboarding Status:</strong>{' '}
              {dashboardData?.actionsAlerts?.onboardingStatus || '-'}
            </p>
            <p className="mb-3 text-neutral-600">
              <strong className="text-neutral-800">Restrictions:</strong> {dashboardData?.actionsAlerts?.restrictions || '-'}
            </p>
            <div className="dashboard-action-buttons d-flex gap-2">
              <button
                className="bg-white border border-primary-500 text-primary-500 hover:bg-primary-50 px-3 py-1.5 rounded-md text-sm font-bold transition-all"
                onClick={() => navigate('/investor/journey')}
              >
                <i className="bi bi-pencil me-1"></i>
                Edit Profile
              </button>
              <button
                className="bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50 px-3 py-1.5 rounded-md text-sm font-bold transition-all"
                onClick={() => navigate('/investor/progress')}
              >
                <i className="bi bi-graph-up me-1"></i>
                View Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      {dashboardData?.progress && (
        <div className="bg-surface p-4 rounded-xl border border-neutral-200 shadow-sm mb-3">
          <h5 className="mb-3 font-bold text-neutral-800">
            <i className="bi bi-clipboard-check me-2 text-success-500"></i>
            KYC & Onboarding Progress
          </h5>
          <div className="row">
            <div className="col-md-12">
              <p className="text-neutral-500 mb-4">
                Your onboarding journey is in progress. Visit the Progress page for detailed step tracking.
              </p>
              <button
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-all"
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
