import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, DsrCaseResponseDto, DsrCaseDetailDto } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import '../InvestorProfile/InvestorProfile.scss';
import './DsrCenter.scss';

export const DsrRequests: React.FC = () => {
  const { isProxyMode } = useSAProxyNavigation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<DsrCaseResponseDto[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DsrCaseDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCases = async () => {
    try {
      const data = await investorService.getDsrCases();
      setCases(data || []);
      const fromUrl = searchParams.get('case');
      if (fromUrl) {
        selectCase(fromUrl);
      }
    } catch (error) {
      console.error('[DsrRequests] Failed loading DSR cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectCase = async (caseId: string) => {
    setSelectedCaseId(caseId);
    setSearchParams({ case: caseId });
    setDetailLoading(true);
    setDetail(null);
    try {
      setDetail(await investorService.getDsrCase(caseId));
    } catch (error) {
      console.error('[DsrRequests] Failed loading case detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedCaseId(null);
    setDetail(null);
    searchParams.delete('case');
    setSearchParams(searchParams);
  };

  if (loading) return <LoadingSpinner />;

  const req = detail?.request;

  return (
    <div className="facilon-dashboard-wrapper">
      {!isProxyMode && <Header />}
      <main className="container-fluid dashboard-container-main">
        <div className="dsr-center">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <button className="btn btn-link px-0" onClick={() => navigate('/investor/dashboard')}>
              ← Back to Dashboard
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/investor/dsr-center')}>
              + New Request
            </button>
          </div>
          <div className="dsr-center__header mb-3">
            <h1 className="dashboard-title-modern">My DSR Requests</h1>
            <p className="dashboard-subtitle text-muted">Track your data privacy and rights requests here.</p>
          </div>

          <div className="card p-3 mb-3">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Right</th>
                    <th>Jurisdiction</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>SLA Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-muted">No DSR requests yet.</td>
                    </tr>
                  )}
                  {cases.map((item) => (
                    <tr
                      key={item.caseId}
                      style={{ cursor: 'pointer' }}
                      className={selectedCaseId === item.caseId ? 'table-active' : ''}
                      onClick={() => selectCase(item.caseId)}
                    >
                      <td><span className="text-primary">{item.caseId}</span></td>
                      <td>{item.requestType}</td>
                      <td>{item.jurisdiction}</td>
                      <td>
                        {item.investorStatus}
                        {item.actionRequired && (
                          <span className="badge bg-warning text-dark ms-2">Action required</span>
                        )}
                      </td>
                      <td>{item.submittedAt ? item.submittedAt.split('T')[0] : '-'}</td>
                      <td>{item.slaDeadline ? item.slaDeadline.split('T')[0] : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inline case detail below the table */}
          {selectedCaseId && (
            <div className="mb-3">
              {detailLoading ? (
                <div className="card p-3"><LoadingSpinner /></div>
              ) : !req ? (
                <div className="card p-3 text-muted">Request not found.</div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 className="mb-0">{req.caseId} <span className="text-muted fs-6">· {req.requestType} · {req.jurisdiction}</span></h4>
                    <button className="btn btn-sm btn-outline-secondary" onClick={closeDetail}>Close</button>
                  </div>

                  {req.actionRequired && (
                    <div className="alert alert-warning">
                      <strong>Action required.</strong> Please review and respond — we need something from you
                      to continue ({req.investorStatus}).
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-7">
                      <div className="card p-3 mb-3">
                        <h5 className="mb-3">Request Summary</h5>
                        <dl className="row mb-0 small">
                          <dt className="col-5">Current Status</dt><dd className="col-7">{req.investorStatus}</dd>
                          <dt className="col-5">Submitted</dt><dd className="col-7">{req.submittedAt?.replace('T', ' ') || '—'}</dd>
                          <dt className="col-5">SLA Deadline</dt><dd className="col-7">{req.slaDeadline?.replace('T', ' ') || '—'}</dd>
                          <dt className="col-5">Data Area</dt><dd className="col-7">{req.dataArea || '—'}</dd>
                          <dt className="col-5">Requester</dt><dd className="col-7">{req.requesterName}</dd>
                        </dl>
                        <hr />
                        <h6>Description</h6>
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{req.requestDescription}</p>
                      </div>

                      {(req.resolutionNotes || req.finalOutcome) && (
                        <div className="card p-3">
                          <h5 className="mb-2">Outcome</h5>
                          {req.finalOutcome && <p className="mb-2"><strong>{req.finalOutcome}</strong></p>}
                          {req.resolutionNotes && (
                            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{req.resolutionNotes}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="col-md-5">
                      <div className="card p-3">
                        <h5 className="mb-3">Progress</h5>
                        <ul className="dsr-timeline">
                          {(detail?.timeline || []).length === 0 && (
                            <li className="text-muted">No updates yet.</li>
                          )}
                          {(detail?.timeline || []).map((e, i) => (
                            <li key={i} className="visible">
                              <div className="dsr-timeline__head">
                                <strong>{e.title}</strong>
                                <span className="text-muted small">{e.createdAt?.split('T')[0]}</span>
                              </div>
                              {e.note && <div className="small text-muted">{e.note}</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      {!isProxyMode && <Footer />}
    </div>
  );
};
