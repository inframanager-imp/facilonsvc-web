import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InvestorDashboardDto } from '../../../../services/investor.service';
import { DelegationDto } from '../../../../models/DelegationDto';

interface ConsentCentreTabProps {
  dashboardData: InvestorDashboardDto;
  pendingDelegations: DelegationDto[];
  onAcceptDelegation: (delegation: DelegationDto) => void;
  onRejectDelegation: (delegation: DelegationDto) => void;
  processingDelegation: number | null;
}

export const ConsentCentreTab: React.FC<ConsentCentreTabProps> = ({
  dashboardData,
  pendingDelegations,
  onAcceptDelegation,
  onRejectDelegation,
  processingDelegation,
}) => {
  const navigate = useNavigate();
  const consentItems = dashboardData?.consentCenter || [];

  return (
    <div className="consent-centre-tab">
      {pendingDelegations.length > 0 && (
        <div className="card border-warning p-3 mb-4">
          <h5 className="mb-3 text-warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Pending Service Agent Assignment
          </h5>
          <p className="mb-3">
            Your Service Provider has assigned a Service Agent to assist with your onboarding. Please
            review and accept/reject below.
          </p>
          {pendingDelegations.map((delegation) => (
            <div key={delegation.id} className="border rounded p-3 mb-2 bg-light">
              <div className="row align-items-center">
                <div className="col-md-7">
                  <p className="mb-1">
                    <strong>Service Agent:</strong> {delegation.serviceAgentName}
                  </p>
                  <p className="mb-1">
                    <strong>Email:</strong> {delegation.serviceAgentEmail}
                  </p>
                  <p className="mb-1">
                    <strong>Scope:</strong>{' '}
                    <span className="badge bg-info">{delegation.scope}</span>
                  </p>
                  <p className="mb-0">
                    <strong>Permissions:</strong>{' '}
                    {[
                      delegation.canViewProfile && 'View',
                      delegation.canEditKyc && 'Edit',
                      delegation.canUploadDocuments && 'Upload',
                      delegation.canSubmitForms && 'Submit',
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
                <div className="col-md-5 text-end">
                  <p className="small text-muted mb-2">
                    Review and customize permissions before accepting.
                  </p>
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => onAcceptDelegation(delegation)}
                      disabled={processingDelegation === delegation.id}
                    >
                      <i className="bi bi-check-lg me-1"></i>
                      Review & Accept
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onRejectDelegation(delegation)}
                      disabled={processingDelegation === delegation.id}
                    >
                      <i className="bi bi-x-lg me-1"></i>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-md-7">
          <div className="card p-3 h-100">
            <h5 className="mb-3">
              <i className="bi bi-check2-square me-2"></i>
              Consent Management
            </h5>
            {consentItems.length === 0 ? (
              <p className="text-muted">No consent records available.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Consent</th>
                      <th>Scope</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consentItems.map((c, i) => (
                      <tr key={`${c.consent || 'consent'}-${i}`}>
                        <td>{c.consent || '-'}</td>
                        <td>{c.scope || '-'}</td>
                        <td>
                          <span className={`badge ${c.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                            {c.status || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-3">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate('/investor/consents')}
              >
                <i className="bi bi-gear me-1"></i>
                Open Consent Centre
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="card p-3 h-100">
            <h5 className="mb-3">
              <i className="bi bi-people me-2"></i>
              Service Agent Access
            </h5>
            <p className="small text-muted mb-2">
              <strong>Service Agent:</strong>{' '}
              {dashboardData?.delegation?.serviceAgent || 'None assigned'}
            </p>
            <p className="small text-muted mb-2">
              <strong>Scope:</strong> {dashboardData?.delegation?.scope || '-'}
            </p>
            <p className="small text-muted mb-2">
              <strong>Expiry:</strong> {dashboardData?.delegation?.expiry || '-'}
            </p>
            <p className="small text-muted mb-2">
              <strong>Status:</strong>{' '}
              <span
                className={`badge ${
                  dashboardData?.delegation?.status === 'Active' ? 'bg-success' : 'bg-secondary'
                }`}
              >
                {dashboardData?.delegation?.status || 'No active service agent'}
              </span>
            </p>
            {dashboardData?.delegation?.note && (
              <p className="small text-muted mb-2">{dashboardData.delegation.note}</p>
            )}
            {pendingDelegations.length > 0 && (
              <div className="alert alert-warning small mb-3">
                <i className="bi bi-exclamation-triangle me-1"></i>
                {pendingDelegations.length} pending assignment(s) - See above to accept/reject
              </div>
            )}
            <button
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => navigate('/investor/delegations')}
            >
              <i className="bi bi-list-ul me-1"></i>
              View All Delegations
            </button>
            <button
              className="btn btn-outline-secondary btn-sm w-100 mt-2"
              onClick={() => navigate('/investor/service-agent-activity')}
            >
              <i className="bi bi-clock-history me-1"></i>
              Service Agent Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
