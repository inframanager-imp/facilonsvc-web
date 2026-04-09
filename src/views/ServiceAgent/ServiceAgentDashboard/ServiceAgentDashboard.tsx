import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceAgentService, ServiceAgentInvestorDto } from '../../../services/serviceAgent.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import PostLoginHeader from '../../../components/PostLoginHeader/PostLoginHeader';
import { getPermissionErrorMessage } from '../../../utils/apiClient';
import './ServiceAgentDashboard.scss';

const SCOPE_LABELS: Record<string, string> = {
  FULL_ONBOARDING: 'Full Access',
  CKYC_ONLY:       'CKYC Only',
  ONBOARDING_ONLY: 'Onboarding Only',
  VIEW_ONLY:       'View Only',
};

export const ServiceAgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState<ServiceAgentInvestorDto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      const data = await serviceAgentService.getMyInvestors();
      setInvestors(data);
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      if (permissionError) {
        toast.error(permissionError);
      } else {
        toast.error('Failed to load investors');
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = investors.filter(inv =>
    inv.investorName.toLowerCase().includes(search.toLowerCase()) ||
    inv.investorEmail.toLowerCase().includes(search.toLowerCase()) ||
    (inv.investorUniqueCode || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount  = investors.filter(i => i.delegationActive).length;
  const fullCount    = investors.filter(i => i.delegationScope === 'FULL_ONBOARDING').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="layout-wrapper">
      <PostLoginHeader />

      <div className="main-content">
        <div className="sa-dashboard">
          {/* Header */}
          <div className="sa-dashboard__header">
            <div>
              <h2>Service Agent Dashboard</h2>
              <p>Manage investors assigned to you via active delegations.</p>
            </div>
            <div className="sa-dashboard__header-actions">
              <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/service-agent/investors')}>
                All Investors
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/service-agent/audit-logs')}>
                Audit Logs
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/service-agent/profile')}>
                My Profile
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="sa-dashboard__stats">
            <div className="sa-dashboard__stat-card">
              <div className="stat-label">Total Investors</div>
              <div className="stat-value">{investors.length}</div>
            </div>
            <div className="sa-dashboard__stat-card">
              <div className="stat-label">Active Delegations</div>
              <div className="stat-value">{activeCount}</div>
            </div>
            <div className="sa-dashboard__stat-card">
              <div className="stat-label">Full Access</div>
              <div className="stat-value">{fullCount}</div>
            </div>
          </div>

          {/* Investor table */}
          <div className="sa-dashboard__table-card">
            <div className="card-header-bar">
              <h5>My Investors</h5>
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: 280 }}
                placeholder="Search by name, email, code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="p-4 text-center text-muted">
                {investors.length === 0
                  ? 'No investors have delegated access to you yet.'
                  : 'No investors match your search.'}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Investor</th>
                      <th>Code</th>
                      <th>Scope</th>
                      <th>Permissions</th>
                      <th>Valid Until</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(inv => (
                      <tr key={inv.investorId}>
                        <td>
                          <div className="fw-semibold">{inv.investorName}</div>
                          <small className="text-muted">{inv.investorEmail}</small>
                        </td>
                        <td>
                          <code className="small">{inv.investorUniqueCode || '—'}</code>
                        </td>
                        <td>
                          <span className={`scope-badge scope-badge--${inv.delegationScope}`}>
                            {SCOPE_LABELS[inv.delegationScope] || inv.delegationScope}
                          </span>
                        </td>
                        <td>
                          <div className="permission-icons">
                            {inv.canViewProfile     && <span title="View Profile">👁 View</span>}
                            {inv.canEditKyc         && <span title="Edit KYC">✏️ Edit</span>}
                            {inv.canUploadDocuments && <span title="Upload Docs">📎 Upload</span>}
                            {inv.canSubmitForms     && <span title="Submit Forms">✅ Submit</span>}
                          </div>
                        </td>
                        <td>
                          <small className={inv.validTo && new Date(inv.validTo) < new Date() ? 'text-danger' : 'text-muted'}>
                            {inv.validTo ? new Date(inv.validTo).toLocaleDateString() : 'No expiry'}
                          </small>
                        </td>
                        <td>
                          {inv.delegationActive
                            ? <span className="badge bg-success">Active</span>
                            : <span className="badge bg-secondary">Inactive</span>}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary action-btn"
                            onClick={() => navigate(`/service-agent/investors/${inv.investorId}`)}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceAgentDashboard;
