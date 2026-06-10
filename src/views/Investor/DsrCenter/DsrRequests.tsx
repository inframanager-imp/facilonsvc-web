import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { investorService, DsrCaseResponseDto, DsrCaseDetailDto } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import '../InvestorProfile/InvestorProfile.scss';
import './DsrCenter.scss';

export const DsrRequests: React.FC = () => {
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

  const prettyRequestType = (t: string) =>
    (t || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const dsrStatusColor = (status?: string): string => {
    switch (status) {
      case 'Response Available':
        return 'bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20'; // green
      case 'Verification Required':
      case 'More Information Required':
      case 'Partially Completed':
        return 'bg-[#fff8f0] text-[#f59e0b] border border-[#f59e0b]/20'; // amber
      case 'Unable to Fulfil':
        return 'bg-[#fef2f2] text-[#ef4444] border border-[#ef4444]/20'; // red
      case 'Closed':
        return 'bg-[#f1f5f9] text-[#64748b] border border-slate-200'; // slate
      default:
        return 'bg-[#eff6ff] text-[#3b82f6] border border-[#3b82f6]/20'; // blue
    }
  };

  if (loading) return <LoadingSpinner />;

  const req = detail?.request;

  return (
    <div className="facilon-dashboard-wrapper">
      <main className="container-fluid dashboard-container-main px-0">
        <div className="investor-profile dsr-page">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => navigate('/investor/dashboard')}
              className="text-[11px] font-semibold text-[#3e6f7c] hover:underline hover:text-[#1f4851] transition-colors flex items-center bg-transparent border-0 p-0 cursor-pointer"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/investor/dsr-center')}
              className="btn-save"
            >
              + New Request
            </button>
          </div>

          <div className="investor-profile__card" style={{ padding: '15px' }}>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#e2e8f0]">
                    <th className="pb-3.5 px-2">Case ID</th>
                    <th className="pb-3.5 px-2">Right</th>
                    <th className="pb-3.5 px-2">Jurisdiction</th>
                    <th className="pb-3.5 px-2">Status</th>
                    <th className="pb-3.5 px-2">Submitted</th>
                    <th className="pb-3.5 px-2">SLA Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {cases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 px-2 text-center text-[12px] text-slate-400">
                        No DSR requests yet.
                      </td>
                    </tr>
                  )}
                  {cases.map((item) => (
                    <tr
                      key={item.caseId}
                      style={{ cursor: 'pointer' }}
                      className={`hover:bg-slate-50/50 transition-colors ${selectedCaseId === item.caseId ? 'bg-slate-100/80 font-semibold' : ''}`}
                      onClick={() => selectCase(item.caseId)}
                    >
                      <td className="py-3 px-2 text-[12px]"><span className="text-[#3e6f7c] hover:underline font-bold">{item.caseId}</span></td>
                      <td className="py-3 px-2 text-[12px] text-slate-700">{prettyRequestType(item.requestType)}</td>
                      <td className="py-3 px-2 text-[12px] text-slate-500">{item.jurisdiction}</td>
                      <td className="py-3 px-2 text-[12px]">
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${dsrStatusColor(item.investorStatus)}`}>
                          {item.investorStatus}
                        </span>
                        {item.actionRequired && (
                          <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-[#fff8f0] text-[#f59e0b] border border-[#f59e0b]/30 ms-2">
                            Action required
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-[12px] text-slate-500">{item.submittedAt ? item.submittedAt.split('T')[0] : '-'}</td>
                      <td className="py-3 px-2 text-[12px] text-slate-500">{item.slaDeadline ? item.slaDeadline.split('T')[0] : '-'}</td>
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
                <div className="investor-profile__card" style={{ padding: '15px' }}><LoadingSpinner /></div>
              ) : !req ? (
                <div className="investor-profile__card" style={{ padding: '15px', color: 'var(--facilon-text-muted)' }}>Request not found.</div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3 mt-4">
                    <h3 className="text-[16px] font-bold text-slate-800 mb-0">
                      {req.caseId} <span className="text-[12px] font-normal text-slate-400">· {prettyRequestType(req.requestType)} · {req.jurisdiction}</span>
                    </h3>
                    <button
                      onClick={closeDetail}
                      className="btn-outline-primary"
                    >
                      Close
                    </button>
                  </div>

                  {req.actionRequired && (
                    <div className="bg-[#fff8f0] border border-[#f59e0b]/30 text-amber-900 rounded p-3 mb-3 text-[12px]">
                      <strong>Action required.</strong> Please review and respond — we need something from you to continue ({req.investorStatus}).
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-7 flex flex-col gap-3">
                      <div className="investor-profile__card" style={{ padding: '15px' }}>
                        <h3 className="pb-2 border-b border-[#e2e8f0] mb-3">
                          Request Summary
                        </h3>
                        <dl className="grid grid-cols-12 gap-y-2.5 text-[12px] mb-0">
                          <dt className="col-span-5 font-semibold text-slate-500">Current Status</dt>
                          <dd className="col-span-7 text-slate-800 font-medium">
                            <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${dsrStatusColor(req.investorStatus)}`}>
                              {req.investorStatus}
                            </span>
                          </dd>
                          
                          <dt className="col-span-5 font-semibold text-slate-500">Submitted</dt>
                          <dd className="col-span-7 text-slate-700">{req.submittedAt?.replace('T', ' ') || '—'}</dd>

                          <dt className="col-span-5 font-semibold text-slate-500">SLA Deadline</dt>
                          <dd className="col-span-7 text-slate-700">{req.slaDeadline?.replace('T', ' ') || '—'}</dd>

                          <dt className="col-span-5 font-semibold text-slate-500">Data Area</dt>
                          <dd className="col-span-7 text-slate-700">{req.dataArea || '—'}</dd>

                          <dt className="col-span-5 font-semibold text-slate-500">Requester</dt>
                          <dd className="col-span-7 text-slate-700 font-medium">{req.requesterName}</dd>
                        </dl>
                        <hr className="my-3 border-slate-200" />
                        <h5 className="text-[12px] font-bold text-slate-800 mb-2">Description</h5>
                        <p className="text-[12px] text-slate-600 mb-0 bg-slate-50 p-2.5 rounded border border-slate-100" style={{ whiteSpace: 'pre-wrap' }}>
                          {req.requestDescription}
                        </p>
                      </div>

                      {(req.resolutionNotes || req.finalOutcome) && (
                        <div className="investor-profile__card" style={{ padding: '15px' }}>
                          <h3 className="pb-2 border-b border-[#e2e8f0] mb-3">
                            Outcome
                          </h3>
                          {req.finalOutcome && (
                            <p className="text-[12px] font-semibold text-slate-800 mb-2">
                              Status: <span className="text-slate-600">{req.finalOutcome}</span>
                            </p>
                          )}
                          {req.resolutionNotes && (
                            <p className="text-[12px] text-slate-600 mb-0 bg-slate-50 p-2.5 rounded border border-slate-100" style={{ whiteSpace: 'pre-wrap' }}>
                              {req.resolutionNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="col-span-12 md:col-span-5">
                      <div className="investor-profile__card" style={{ padding: '15px' }}>
                        <h3 className="pb-2 border-b border-[#e2e8f0] mb-3">
                          Progress Timeline
                        </h3>
                        <ul className="dsr-timeline">
                          {(detail?.timeline || []).length === 0 && (
                            <li className="text-[12px] text-slate-400 py-2">No updates yet.</li>
                          )}
                          {(detail?.timeline || []).map((e, i) => (
                            <li key={i} className="visible text-[12px] pb-3 last:pb-0">
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <strong className="font-semibold text-slate-800">{e.title}</strong>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{e.createdAt?.split('T')[0]}</span>
                              </div>
                              {e.note && <div className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100/50 mt-1">{e.note}</div>}
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
    </div>
  );
};
