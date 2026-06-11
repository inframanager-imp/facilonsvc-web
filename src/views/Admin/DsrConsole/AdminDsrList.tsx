import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { PremiumSelect } from '../../../components/PremiumSelect/PremiumSelect';
import { toast } from 'react-toastify';
import { adminDsrService, DsrAdminCaseDto, DsrListFilters } from '../../../services/admin-dsr.service';
import './DsrConsole.scss';

const STATUSES = [
  'NEW', 'SUBMITTED', 'ACKNOWLEDGED', 'VERIFICATION_PENDING', 'CLARIFICATION_PENDING', 'UNDER_REVIEW',
  'DATA_SEARCH_IN_PROGRESS', 'LEGAL_REVIEW', 'ACTION_IN_PROGRESS', 'RESPONSE_SENT',
  'PARTIALLY_FULFILLED', 'REJECTED', 'CLOSED', 'REOPENED'
];
const REQUEST_TYPES = [
  'ACCESS', 'DATA_COPY', 'CORRECTION', 'ERASURE', 'CONSENT_WITHDRAWAL', 'GRIEVANCE',
  'NOMINATION', 'MARKETING_OPTOUT', 'COOKIE_TRACKING', 'RESTRICT', 'OTHER'
];
const JURISDICTIONS = ['INDIA', 'CANADA', 'UK', 'UAE', 'HONG_KONG', 'SINGAPORE'];

export const AdminDsrList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<DsrAdminCaseDto[]>([]);
  const [filters, setFilters] = useState<DsrListFilters>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const load = async () => {
    setLoading(true);
    try {
      setCases(await adminDsrService.listCases(filters));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load DSR cases');
    } finally {
      setLoading(false);
    }
  };

  const filtered = cases.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return c.caseId.toLowerCase().includes(q)
      || c.requesterEmail?.toLowerCase().includes(q)
      || c.requesterName?.toLowerCase().includes(q);
  });

  const opt = (arr: string[]) => [{ value: '', label: 'All' }, ...arr.map((v) => ({ value: v, label: v }))];

  return (
    <div>
      <div>
        <div className="dsr-console">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="dashboard-title-modern mb-0">DSR Case Queue</h1>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/dsr-admins')}>
              Back to DSR Dashboard
            </button>
          </div>

          <div className="card p-3 mb-3">
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <PremiumSelect value={filters.status || ''}
                  onChange={(v) => setFilters({ ...filters, status: v || undefined })}
                  options={opt(STATUSES)} placeholder="All" />
              </div>
              <div className="col-md-3">
                <label className="form-label">Request Type</label>
                <PremiumSelect value={filters.requestType || ''}
                  onChange={(v) => setFilters({ ...filters, requestType: v || undefined })}
                  options={opt(REQUEST_TYPES)} placeholder="All" />
              </div>
              <div className="col-md-2">
                <label className="form-label">Jurisdiction</label>
                <PremiumSelect value={filters.jurisdiction || ''}
                  onChange={(v) => setFilters({ ...filters, jurisdiction: v || undefined })}
                  options={opt(JURISDICTIONS)} placeholder="All" />
              </div>
              <div className="col-md-2">
                <label className="form-label">Search</label>
                <input className="form-control" placeholder="Case ID / email"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="col-md-2">
                <div className="form-check mt-4">
                  <input className="form-check-input" type="checkbox" id="overdueOnly"
                    checked={!!filters.overdueOnly}
                    onChange={(e) => setFilters({ ...filters, overdueOnly: e.target.checked || undefined })} />
                  <label className="form-check-label" htmlFor="overdueOnly">Overdue only</label>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-3">
            {loading ? <LoadingSpinner /> : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Requester</th>
                      <th>Type</th>
                      <th>Jurisdiction</th>
                      <th>Submitted</th>
                      <th>SLA Deadline</th>
                      <th>Status</th>
                      <th>Assigned</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={9} className="text-muted">No matching cases.</td></tr>
                    )}
                    {filtered.map((c) => (
                      <tr key={c.caseId}>
                        <td>{c.caseId}</td>
                        <td>{c.requesterName}<br /><small className="text-muted">{c.requesterEmail}</small></td>
                        <td>{c.requestType}</td>
                        <td>{c.jurisdiction}</td>
                        <td>{c.submittedAt?.split('T')[0] || '-'}</td>
                        <td className={c.slaOverdue ? 'text-danger fw-semibold' : ''}>
                          {c.slaDeadline?.split('T')[0] || '-'}{c.slaOverdue ? ' (overdue)' : ''}
                        </td>
                        <td><span className="badge bg-light text-dark">{c.status}</span></td>
                        <td>{c.assignedTo || <span className="text-muted">—</span>}</td>
                        <td>
                          <button className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/admin/dsr/${c.caseId}`)}>Open</button>
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
