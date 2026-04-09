import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InvestorDashboardDto } from '../../../../services/investor.service';

interface ApplicationsTabProps {
  dashboardData: InvestorDashboardDto;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ dashboardData }) => {
  const navigate = useNavigate();

  const EXCLUDED_APP_NAMES = new Set(['Facilon Onboard', 'Facilon Report', 'Data Subject Rights']);
  const appItems = (dashboardData?.applications || []).filter(
    (app) => !EXCLUDED_APP_NAMES.has(app.name || '')
  );

  return (
    <div className="applications-tab">
      <div className="mb-4">
        <h5>
          <i className="bi bi-grid-3x3-gap me-2"></i>
          Available Applications
        </h5>
        <p className="text-muted small">
          Access your available applications below. Click "Open" to launch an application.
        </p>
      </div>

      {appItems.length === 0 ? (
        <div className="card p-5 text-center">
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <p className="text-muted mt-3 mb-0">No applications available at this time.</p>
        </div>
      ) : (
        <div className="row g-3">
          {appItems.map((app, idx) => (
            <div className="col-md-4 col-lg-3" key={`${app.code || 'app'}-${idx}`}>
              <div className="card h-100 application-card">
                <div className="card-body d-flex flex-column">
                  <div className="mb-3 text-center">
                    <div
                      className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                      style={{ width: '60px', height: '60px' }}
                    >
                      <i className="bi bi-app" style={{ fontSize: '1.5rem', color: '#0d6efd' }}></i>
                    </div>
                  </div>

                  <h6 className="card-title text-center mb-2">{app.name || 'Untitled'}</h6>

                  <div className="mb-2 text-center">
                    <span
                      className={`badge ${
                        app.enabled ? 'bg-success' : 'bg-secondary'
                      }`}
                    >
                      {app.status || 'Unknown'}
                    </span>
                  </div>

                  {app.blockReason && (
                    <div className="alert alert-danger small py-1 px-2 mb-2" role="alert">
                      {app.blockReason}
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    <button
                      className="btn btn-primary btn-sm w-100"
                      disabled={!app.enabled || !app.actionRoute}
                      onClick={() => app.actionRoute && navigate(app.actionRoute)}
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i>
                      Open
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
