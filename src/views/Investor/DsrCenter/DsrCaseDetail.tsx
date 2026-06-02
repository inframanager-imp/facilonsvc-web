import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, DsrCaseDetailDto } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import '../InvestorProfile/InvestorProfile.scss';
import './DsrCenter.scss';

export const DsrCaseDetail: React.FC = () => {
  const { isProxyMode } = useSAProxyNavigation();
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DsrCaseDetailDto | null>(null);

  useEffect(() => {
    if (caseId) load(caseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const load = async (id: string) => {
    setLoading(true);
    try {
      setDetail(await investorService.getDsrCase(id));
    } catch (error) {
      console.error('[DsrCaseDetail] Failed loading case:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const req = detail?.request;

  return (
    <div className="facilon-dashboard-wrapper">
      {!isProxyMode && <Header />}
      <main className="container-fluid dashboard-container-main">
        <div className="dsr-center">
          <button className="btn btn-link px-0 mb-2" onClick={() => navigate('/investor/dsr-center')}>
            ← Back to DSR Center
          </button>

          {!req ? (
            <p className="text-muted">Request not found.</p>
          ) : (
            <>
              <div className="dsr-center__header mb-3">
                <h1 className="dashboard-title-modern">{req.caseId}</h1>
                <p className="dashboard-subtitle text-muted mb-0">
                  {req.requestType} · {req.jurisdiction}
                </p>
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
      </main>
      {!isProxyMode && <Footer />}
    </div>
  );
};
