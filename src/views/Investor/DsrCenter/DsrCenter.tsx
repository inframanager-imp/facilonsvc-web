import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, DsrCaseCreateDto, DsrCaseResponseDto } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { PremiumSelect } from '../../../components/PremiumSelect/PremiumSelect';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import '../InvestorProfile/InvestorProfile.scss';
import './DsrCenter.scss';

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
  const { isProxyMode } = useSAProxyNavigation();
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
    <div className="facilon-dashboard-wrapper">
      {!isProxyMode && <Header />}
      <main className="container-fluid dashboard-container-main">
        <div className="dsr-center">
          <div className="dsr-center__header mb-3">
            <h1 className="dashboard-title-modern">Data Subject Rights Center</h1>
            <p className="dashboard-subtitle text-muted">Submit and track your data privacy and rights requests here.</p>
          </div>

          <div className="card p-3 mb-3">
            <h5 className="mb-3">Submit a DSR Request</h5>
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label" htmlFor="dsr-request-type">Right Exercised</label>
                  <PremiumSelect
                    value={form.requestType}
                    onChange={(val) => setForm({ ...form, requestType: val })}
                    options={REQUEST_TYPES.map((type) => ({ value: type, label: type }))}
                    placeholder="Select Right"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="dsr-jurisdiction">Jurisdiction</label>
                  <PremiumSelect
                    value={form.jurisdiction}
                    onChange={(val) => setForm({ ...form, jurisdiction: val })}
                    options={JURISDICTIONS.map((jurisdiction) => ({ value: jurisdiction, label: jurisdiction }))}
                    placeholder="Select Jurisdiction"
                  />
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
                  <div className="custom-file-upload">
                    <input
                      id="dsr-supporting-file"
                      type="file"
                      className="d-none"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={(e) => setSupportingFile(e.target.files?.[0])}
                    />
                    <label htmlFor="dsr-supporting-file" className="btn btn-outline-primary custom-file-label">
                      {supportingFile ? supportingFile.name : 'Choose File'}
                    </label>
                  </div>
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
      </main>
      {!isProxyMode && <Footer />}
    </div>
  );
};
