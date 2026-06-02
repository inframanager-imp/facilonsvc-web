import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { PremiumSelect } from '../../../components/PremiumSelect/PremiumSelect';
import { toast } from 'react-toastify';
import {
  adminDsrService,
  DsrAdminCaseDto,
  DsrAdminUpdateRequest,
  DsrEvidenceFileDto
} from '../../../services/admin-dsr.service';
import './DsrConsole.scss';

const STATUSES = [
  'SUBMITTED', 'ACKNOWLEDGED', 'VERIFICATION_PENDING', 'CLARIFICATION_PENDING', 'UNDER_REVIEW',
  'DATA_SEARCH_IN_PROGRESS', 'LEGAL_REVIEW', 'ACTION_IN_PROGRESS', 'RESPONSE_SENT',
  'PARTIALLY_FULFILLED', 'REJECTED', 'CLOSED', 'REOPENED'
];
const VERIFICATION_STATUSES = ['PENDING', 'VERIFIED', 'FAILED', 'NOT_REQUIRED'];
const VERIFICATION_METHODS = ['Email', 'OTP', 'Login', 'Document', 'Other'];
const DECISIONS = ['PENDING', 'ACCEPTED', 'REJECTED', 'PARTIALLY_FULFILLED', 'ROUTED'];

export const AdminDsrCaseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<DsrAdminCaseDto | null>(null);
  const [evidence, setEvidence] = useState<DsrEvidenceFileDto[]>([]);

  // Editable working state
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [decision, setDecision] = useState('');
  const [finalOutcome, setFinalOutcome] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [note, setNote] = useState('');
  const [internalOnly, setInternalOnly] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    if (caseId) load(caseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const hydrate = (c: DsrAdminCaseDto) => {
    setItem(c);
    setStatus(c.status || '');
    setAssignedTo(c.assignedTo || '');
    setVerificationStatus(c.verificationStatus || '');
    setVerificationMethod(c.verificationMethod || '');
    setDecision(c.decision || '');
    setFinalOutcome(c.finalOutcome || '');
    setResolutionNotes(c.resolutionNotes || '');
    setNote('');
  };

  const load = async (id: string) => {
    setLoading(true);
    try {
      hydrate(await adminDsrService.getCase(id));
      await loadEvidence(id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  const loadEvidence = async (id: string) => {
    try {
      setEvidence(await adminDsrService.listEvidence(id));
    } catch {
      // evidence folder may not exist yet; leave empty
    }
  };

  const downloadEvidence = async (relativePath: string, name: string) => {
    if (!caseId) return;
    try {
      const blob = await adminDsrService.downloadEvidence(caseId, relativePath);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download file');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const save = async () => {
    if (!caseId) return;
    setSaving(true);
    try {
      const payload: DsrAdminUpdateRequest = {
        status: status || undefined,
        assignedTo: assignedTo || undefined,
        verificationStatus: verificationStatus || undefined,
        verificationMethod: verificationMethod || undefined,
        decision: decision || undefined,
        finalOutcome: finalOutcome || undefined,
        resolutionNotes: resolutionNotes || undefined,
        note: note || undefined,
        internalOnly
      };
      hydrate(await adminDsrService.updateCase(caseId, payload));
      toast.success('Case updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async () => {
    if (!caseId || !file) return;
    setSaving(true);
    try {
      hydrate(await adminDsrService.attachFile(caseId, file));
      setFile(undefined);
      await loadEvidence(caseId);
      toast.success('File attached to evidence folder');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const downloadSupporting = async () => {
    if (!caseId) return;
    try {
      const blob = await adminDsrService.downloadSupportingFile(caseId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseId}-supporting-evidence`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('No supporting file available');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!item) return (
    <div className="facilon-dashboard-wrapper"><Header />
      <main className="container-fluid dashboard-container-main">
        <p className="text-muted">Case not found.</p>
        <button className="btn btn-outline-primary" onClick={() => navigate('/admin/dsr')}>Back to queue</button>
      </main><Footer />
    </div>
  );

  const sel = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

  return (
    <div className="facilon-dashboard-wrapper">
      <Header />
      <main className="container-fluid dashboard-container-main">
        <div className="dsr-console">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="dashboard-title-modern mb-0">{item.caseId}</h1>
              <span className="text-muted">
                {item.requestType} · {item.jurisdiction} · Internal: <strong>{item.status}</strong>
                {item.slaOverdue && <span className="text-danger"> · SLA OVERDUE</span>}
              </span>
            </div>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/dsr')}>Back to queue</button>
          </div>

          <div className="row g-3">
            {/* Left: request details + timeline */}
            <div className="col-md-6">
              <div className="card p-3 mb-3">
                <h5 className="mb-3">Request</h5>
                <dl className="row mb-0 small">
                  <dt className="col-5">Requester</dt><dd className="col-7">{item.requesterName}</dd>
                  <dt className="col-5">Email</dt><dd className="col-7">{item.requesterEmail}</dd>
                  <dt className="col-5">Phone</dt><dd className="col-7">{item.requesterPhone || '—'}</dd>
                  <dt className="col-5">Role</dt><dd className="col-7">{item.requesterRole || '—'}</dd>
                  <dt className="col-5">Investor Code</dt><dd className="col-7">{item.investorUniqueCode}</dd>
                  <dt className="col-5">Data Area</dt><dd className="col-7">{item.dataArea || '—'}</dd>
                  <dt className="col-5">Submitted</dt><dd className="col-7">{item.submittedAt?.replace('T', ' ') || '—'}</dd>
                  <dt className="col-5">SLA Deadline</dt><dd className="col-7">{item.slaDeadline?.replace('T', ' ') || '—'}</dd>
                  <dt className="col-5">Investor sees</dt><dd className="col-7">{item.investorStatus}</dd>
                </dl>
                <hr />
                <h6>Description</h6>
                <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>{item.requestDescription}</p>
                {item.hasSupportingFile && (
                  <button className="btn btn-sm btn-outline-primary" onClick={downloadSupporting}>
                    Download supporting evidence
                  </button>
                )}
                {item.evidenceFolderPath && (
                  <p className="text-muted small mt-2 mb-0">Evidence folder: {item.evidenceFolderPath}</p>
                )}
              </div>

              <div className="card p-3">
                <h5 className="mb-3">Timeline & Audit</h5>
                <ul className="dsr-timeline">
                  {(item.timeline || []).length === 0 && <li className="text-muted">No events.</li>}
                  {(item.timeline || []).map((e, i) => (
                    <li key={i} className={e.investorVisible ? 'visible' : 'internal'}>
                      <div className="dsr-timeline__head">
                        <strong>{e.title}</strong>
                        <span className="text-muted small">{e.createdAt?.replace('T', ' ')}</span>
                      </div>
                      <div className="small text-muted">
                        {e.actor || 'System'}{e.actorRole ? ` (${e.actorRole})` : ''}
                        {!e.investorVisible && <span className="badge bg-secondary ms-2">internal</span>}
                      </div>
                      {e.note && <div className="small">{e.note}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: actions */}
            <div className="col-md-6">
              <div className="card p-3 mb-3">
                <h5 className="mb-3">Resolve</h5>

                <div className="mb-2">
                  <label className="form-label">Assigned To</label>
                  <input className="form-control" value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)} placeholder="Privacy Ops owner" />
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label">Verification Status</label>
                    <PremiumSelect value={verificationStatus}
                      onChange={setVerificationStatus} options={sel(VERIFICATION_STATUSES)} placeholder="Select" />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Verification Method</label>
                    <PremiumSelect value={verificationMethod}
                      onChange={setVerificationMethod} options={sel(VERIFICATION_METHODS)} placeholder="Select" />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label">Decision</label>
                    <PremiumSelect value={decision} onChange={setDecision}
                      options={sel(DECISIONS)} placeholder="Select" />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Status</label>
                    <PremiumSelect value={status} onChange={setStatus}
                      options={sel(STATUSES)} placeholder="Select" />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label">Final Outcome (short)</label>
                  <input className="form-control" value={finalOutcome}
                    onChange={(e) => setFinalOutcome(e.target.value)}
                    placeholder="e.g. Data provided / Corrected / Deleted" />
                </div>

                <div className="mb-2">
                  <label className="form-label">Resolution Notes (visible to investor on close)</label>
                  <textarea className="form-control" rows={3} value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)} />
                </div>

                <div className="mb-2">
                  <label className="form-label">Note for this change</label>
                  <textarea className="form-control" rows={2} value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Recorded on the timeline" />
                  <div className="form-check mt-1">
                    <input className="form-check-input" type="checkbox" id="internalOnly"
                      checked={internalOnly} onChange={(e) => setInternalOnly(e.target.checked)} />
                    <label className="form-check-label" htmlFor="internalOnly">
                      Internal only (hide this note/transition from investor)
                    </label>
                  </div>
                </div>

                <button className="btn btn-primary w-100" disabled={saving} onClick={save}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <p className="text-muted small mt-2 mb-0">
                  A decision must be recorded before the case can be set to CLOSED. Status changes
                  notify the investor and update their timeline automatically.
                </p>
              </div>

              <div className="card p-3 mb-3">
                <h6 className="mb-2">Evidence Files</h6>
                <p className="text-muted small mb-2">
                  Auto-generated records and uploads in this case's evidence library.
                </p>
                {evidence.length === 0 ? (
                  <p className="text-muted small mb-0">No files yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Folder</th>
                          <th>File</th>
                          <th>Size</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {evidence.map((f) => (
                          <tr key={f.relativePath}>
                            <td><span className="badge bg-light text-dark">{f.folder || '—'}</span></td>
                            <td className="small">{f.name}</td>
                            <td className="small text-muted">{formatSize(f.sizeBytes)}</td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary"
                                onClick={() => downloadEvidence(f.relativePath, f.name)}>
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card p-3">
                <h6 className="mb-2">Attach Final Response / Evidence</h6>
                <p className="text-muted small">Saved to the case's <code>09_Final_Response</code> folder.</p>
                <div className="d-flex gap-2 align-items-center">
                  <input type="file" className="form-control"
                    onChange={(e) => setFile(e.target.files?.[0])} />
                  <button className="btn btn-outline-primary" disabled={!file || saving} onClick={uploadFile}>
                    Upload
                  </button>
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
