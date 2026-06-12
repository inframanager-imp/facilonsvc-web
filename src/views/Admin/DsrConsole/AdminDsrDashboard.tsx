import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { PremiumSelect } from '../../../components/PremiumSelect/PremiumSelect';
import { toast } from 'react-toastify';
import {
  adminDsrService,
  DsrAdminCaseDto,
  DsrAdminUserDto,
  DsrDashboardSummaryDto,
  DsrTriageBucket
} from '../../../services/admin-dsr.service';
import { formatDate } from '../../../utils/dateFormat';
import './DsrConsole.scss';

const REQUEST_TYPES = [
  'ACCESS', 'DATA_COPY', 'CORRECTION', 'ERASURE', 'CONSENT_WITHDRAWAL', 'GRIEVANCE',
  'NOMINATION', 'MARKETING_OPTOUT', 'COOKIE_TRACKING', 'RESTRICT', 'OTHER'
];
const PAGE_SIZE = 10;

export const AdminDsrDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userRoles } = useAuth();
  // Platform admins manage DSR admin users; DSR admins themselves cannot.
  const canManageDsrAdmins = userRoles.some((r) => r === 'ADMIN' || r === 'PLATFORM_SUPER_ADMIN');
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [profile, setProfile] = useState<DsrAdminUserDto | null>(null);
  const [summary, setSummary] = useState<DsrDashboardSummaryDto | null>(null);
  const [cases, setCases] = useState<DsrAdminCaseDto[]>([]);
  const [requestType, setRequestType] = useState('');
  const [bucket, setBucket] = useState<DsrTriageBucket | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    adminDsrService.getMyAdminProfile().then(setProfile).catch(() => setProfile(null));
    adminDsrService.getDashboard()
      .then(setSummary)
      .catch((err: any) => toast.error(err?.response?.data?.message || 'Failed to load DSR dashboard'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestType, bucket, page]);

  const loadPage = async () => {
    setTableLoading(true);
    try {
      const data = await adminDsrService.listCasesPaged(
        { requestType: requestType || undefined, bucket },
        page,
        PAGE_SIZE
      );
      setCases(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load DSR cases');
    } finally {
      setTableLoading(false);
    }
  };

  const onFilterChange = (value: string) => {
    setPage(0);
    setRequestType(value);
  };

  /** Clicking the active bucket again clears the filter. */
  const onBucketClick = (b?: DsrTriageBucket) => {
    setPage(0);
    setBucket((current) => (current === b ? undefined : b));
  };

  const opt = (arr: string[]) => [{ value: '', label: 'All' }, ...arr.map((v) => ({ value: v, label: v }))];

  if (loading) return <LoadingSpinner />;

  const cards: { label: string; value: number; tone: string; bucket?: DsrTriageBucket }[] = [
    { label: 'Open Cases', value: summary?.open ?? 0, tone: 'open' },
    { label: 'Overdue (SLA)', value: summary?.overdue ?? 0, tone: 'overdue', bucket: 'OVERDUE' },
    { label: 'New (Today)', value: summary?.newToday ?? 0, tone: 'new', bucket: 'NEW_TODAY' },
    { label: 'Not Worked', value: summary?.notWorked ?? 0, tone: 'notworked', bucket: 'NOT_WORKED' },
    { label: 'Within TAT', value: summary?.withinTat ?? 0, tone: 'tat', bucket: 'WITHIN_TAT' }
  ];

  const rangeStart = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE + cases.length, totalElements);

  return (
    <div className="font-sans text-gray-800">
      <div>
        <div className="dsr-console">
          {/* Welcome Banner - same style as the investor dashboard */}
          <div className="bg-gradient-to-r from-[#2c5e6a] to-[#355f69] text-white rounded shadow-sm mb-3 px-4 py-3 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col justify-between items-start mb-0">
                <h1 className="text-[16px] font-bold text-white flex items-center tracking-tight mb-0">
                  Welcome {profile ? `${profile.firstName} ${profile.lastName}` : 'Admin'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-[12px] opacity-90 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-70">Email:</span>
                    <span className="font-semibold">{profile?.emailId || '—'}</span>
                  </div>
                  |
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-70">Role:</span>
                    <span className="font-semibold">{profile?.roles?.join(', ') || '—'}</span>
                  </div>
                  |
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-70">Last Login:</span>
                    <span className="font-semibold">{formatDate(profile?.lastLogin)}</span>
                  </div>
                  |
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-70">DSR case management</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canManageDsrAdmins && (
                  <button
                    className="bg-white/10 border border-white/25 rounded px-2.5 py-1 text-[11px] text-white hover:bg-white/20 transition-colors"
                    onClick={() => navigate('/admin/dashboard')}>
                    Admin Dashboard
                  </button>
                )}
                <button
                  className="bg-white text-[#2c5e6a] font-semibold rounded px-2.5 py-1 text-[11px] hover:bg-white/90 transition-colors border border-white"
                  onClick={() => navigate('/admin/dsr')}>
                  Open Case Queue
                </button>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {cards.map((c) => (
              <div className="col-6 col-md" key={c.label}>
                <div
                  className={`dsr-card dsr-card--${c.tone} dsr-card--clickable${
                    (c.bucket ? bucket === c.bucket : bucket === undefined) ? ' dsr-card--active' : ''
                  }`}
                  role="button"
                  title={c.bucket ? 'Filter the table to these cases' : 'Show all cases'}
                  onClick={() => onBucketClick(c.bucket)}>
                  <div className="dsr-card__value">{c.value}</div>
                  <div className="dsr-card__label">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-3 mb-3">
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Request Type</label>
                <PremiumSelect value={requestType}
                  onChange={onFilterChange}
                  options={opt(REQUEST_TYPES)} placeholder="All" />
              </div>
            </div>
          </div>

          <div className="card p-3">
            {tableLoading ? <LoadingSpinner /> : (
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
                    {cases.length === 0 && (
                      <tr><td colSpan={9} className="text-muted">
                        {bucket || requestType ? 'No cases match the current filter.' : 'No DSR cases yet.'}
                      </td></tr>
                    )}
                    {cases.map((c) => (
                      <tr key={c.caseId}>
                        <td>{c.caseId}</td>
                        <td>{c.requesterName}<br /><small className="text-muted">{c.requesterEmail}</small></td>
                        <td>{c.requestType}</td>
                        <td>{c.jurisdiction}</td>
                        <td>{formatDate(c.submittedAt)}</td>
                        <td className={c.slaOverdue ? 'text-danger fw-semibold' : ''}>
                          {formatDate(c.slaDeadline)}{c.slaOverdue ? ' (overdue)' : ''}
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

            <div className="d-flex justify-content-between align-items-center mt-2">
              <small className="text-muted">
                {totalElements === 0 ? 'No cases' : `Showing ${rangeStart}–${rangeEnd} of ${totalElements}`}
              </small>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-sm btn-outline-secondary"
                  disabled={page <= 0 || tableLoading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  Previous
                </button>
                <span className="small text-muted">
                  Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
                </span>
                <button className="btn btn-sm btn-outline-secondary"
                  disabled={page >= totalPages - 1 || tableLoading}
                  onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
