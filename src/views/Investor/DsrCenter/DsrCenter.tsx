import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header/Header';
import { investorService, DsrCaseCreateDto, DsrCaseResponseDto } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';

const REQUEST_TYPES = [
  'ACCESS',
  'CORRECTION',
  'DELETION',
  'CONSENT_WITHDRAWAL',
  'OBJECTION',
  'COMPLAINT'
];

const JURISDICTIONS = ['INDIA', 'CANADA', 'UK', 'UAE', 'HONG_KONG', 'SINGAPORE'];

export const DsrCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cases, setCases] = useState<DsrCaseResponseDto[]>([]);
  const [supportingFile, setSupportingFile] = useState<File | undefined>(undefined);
  const [form, setForm] = useState<DsrCaseCreateDto>({
    requestType: 'ACCESS',
    jurisdiction: 'INDIA',
    requestDescription: '',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    requesterRole: 'INVESTOR'
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const data = await investorService.getDsrCases();
      setCases(data);
    } catch (error) {
      console.error('[DsrCenter] Failed loading DSR cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.requestDescription || form.requestDescription.trim().length < 20) {
      alert('Please enter at least 20 characters in request description.');
      return;
    }

    try {
      setSaving(true);
      await investorService.submitDsrCase(form, supportingFile);
      setForm((prev) => ({ ...prev, requestDescription: '' }));
      setSupportingFile(undefined);
      await loadCases();
      alert('DSR request submitted successfully.');
    } catch (error) {
      console.error('[DsrCenter] Failed submitting DSR case:', error);
      alert('Failed to submit DSR request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-layout investor-dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-md-12">
              <h2 style={{ color: '#be1717', fontWeight: 500, fontSize: '34px', marginTop: '3%' }}>
                Data Subject Rights Center
              </h2>
              <p className="text-muted mb-0">
                Submit rights requests (access, correction, deletion, consent withdrawal, objection, complaint).
              </p>
            </div>
          </div>

          <div className="card p-3 mb-3">
            <h5 className="mb-3">Submit a DSR Request</h5>
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label" htmlFor="dsr-request-type">Right Exercised</label>
                  <select
                    id="dsr-request-type"
                    className="form-select"
                    value={form.requestType}
                    onChange={(e) => setForm({ ...form, requestType: e.target.value })}
                  >
                    {REQUEST_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="dsr-jurisdiction">Jurisdiction</label>
                  <select
                    id="dsr-jurisdiction"
                    className="form-select"
                    value={form.jurisdiction}
                    onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
                  >
                    {JURISDICTIONS.map((jurisdiction) => (
                      <option key={jurisdiction} value={jurisdiction}>{jurisdiction}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="dsr-role">Role</label>
                  <input
                    id="dsr-role"
                    className="form-control"
                    value={form.requesterRole || ''}
                    onChange={(e) => setForm({ ...form, requesterRole: e.target.value })}
                    placeholder="INVESTOR"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="dsr-requester-name">Requester Name</label>
                  <input
                    id="dsr-requester-name"
                    className="form-control"
                    value={form.requesterName}
                    onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="dsr-requester-email">Requester Email</label>
                  <input
                    id="dsr-requester-email"
                    type="email"
                    className="form-control"
                    value={form.requesterEmail}
                    onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="dsr-requester-phone">Requester Phone</label>
                  <input
                    id="dsr-requester-phone"
                    className="form-control"
                    value={form.requesterPhone || ''}
                    onChange={(e) => setForm({ ...form, requesterPhone: e.target.value })}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label" htmlFor="dsr-request-description">Request Description</label>
                  <textarea
                    id="dsr-request-description"
                    className="form-control"
                    rows={4}
                    value={form.requestDescription}
                    onChange={(e) => setForm({ ...form, requestDescription: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="dsr-supporting-file">Supporting Evidence (PDF/JPG/JPEG, max 5MB)</label>
                  <input
                    id="dsr-supporting-file"
                    type="file"
                    className="form-control"
                    accept=".pdf,.jpg,.jpeg"
                    onChange={(e) => setSupportingFile(e.target.files?.[0])}
                  />
                </div>
                <div className="col-md-12">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Submitting...' : 'Submit DSR Request'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="card p-3 mb-3">
            <h5 className="mb-3">My DSR Requests</h5>
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
                    <tr key={item.caseId}>
                      <td>{item.caseId}</td>
                      <td>{item.requestType}</td>
                      <td>{item.jurisdiction}</td>
                      <td>{item.status}</td>
                      <td>{item.submittedAt || '-'}</td>
                      <td>{item.slaDeadline || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
