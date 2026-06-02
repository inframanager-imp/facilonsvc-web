import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  adminDsrService,
  DsrAdminCaseDto,
  DsrDashboardSummaryDto
} from '../../../services/admin-dsr.service';
import './DsrConsole.scss';

export const AdminDsrDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DsrDashboardSummaryDto | null>(null);
  const [recent, setRecent] = useState<DsrAdminCaseDto[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [s, cases] = await Promise.all([
        adminDsrService.getDashboard(),
        adminDsrService.listCases()
      ]);
      setSummary(s);
      setRecent(cases.slice(0, 8));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load DSR dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Open Cases', value: summary?.open ?? 0, tone: 'open' },
    { label: 'Overdue (SLA)', value: summary?.overdue ?? 0, tone: 'overdue' },
    { label: 'Awaiting Verification', value: summary?.awaitingVerification ?? 0, tone: 'verify' },
    { label: 'Closed This Month', value: summary?.closedThisMonth ?? 0, tone: 'closed' },
    { label: 'Total Cases', value: summary?.total ?? 0, tone: 'total' }
  ];

  return (
    <div className="facilon-dashboard-wrapper">
      <Header />
      <main className="container-fluid dashboard-container-main">
        <div className="dsr-console">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="dashboard-title-modern">Admin Center — Privacy Ops</h1>
              <p className="dashboard-subtitle text-muted mb-0">
                Data Subject Rights case management.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/admin/dsr')}>
              Open Case Queue
            </button>
          </div>

          <div className="row g-3 mb-4">
            {cards.map((c) => (
              <div className="col-6 col-md" key={c.label}>
                <div className={`dsr-card dsr-card--${c.tone}`}>
                  <div className="dsr-card__value">{c.value}</div>
                  <div className="dsr-card__label">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3">
            <div className="col-md-7">
              <div className="card p-3 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Recent Cases</h5>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/admin/dsr')}>
                    View all
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Case ID</th>
                        <th>Requester</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>SLA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.length === 0 && (
                        <tr><td colSpan={5} className="text-muted">No DSR cases yet.</td></tr>
                      )}
                      {recent.map((c) => (
                        <tr key={c.caseId} style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/admin/dsr/${c.caseId}`)}>
                          <td>{c.caseId}</td>
                          <td>{c.requesterName}</td>
                          <td>{c.requestType}</td>
                          <td><span className="badge bg-light text-dark">{c.status}</span></td>
                          <td className={c.slaOverdue ? 'text-danger fw-semibold' : ''}>
                            {c.slaOverdue ? 'Overdue' : (c.slaDeadline?.split('T')[0] || '-')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card p-3 mb-3">
                <h6 className="mb-3">By Request Type</h6>
                {Object.keys(summary?.byRequestType || {}).length === 0 && (
                  <p className="text-muted mb-0">No data.</p>
                )}
                {Object.entries(summary?.byRequestType || {}).map(([k, v]) => (
                  <div className="d-flex justify-content-between border-bottom py-1" key={k}>
                    <span>{k}</span><span className="fw-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="card p-3">
                <h6 className="mb-3">Quick Links</h6>
                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/admin/clients')}>Investors</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/admin/document-verification')}>Documents</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/admin/appointments')}>Appointments</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
