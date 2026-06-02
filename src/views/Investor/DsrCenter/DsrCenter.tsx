import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  'DATA_COPY',
  'CORRECTION',
  'ERASURE',
  'CONSENT_WITHDRAWAL',
  'GRIEVANCE',
  'NOMINATION',
  'MARKETING_OPTOUT',
  'COOKIE_TRACKING',
  'RESTRICT',
  'OTHER'
];

const JURISDICTIONS = ['INDIA', 'CANADA', 'UK', 'UAE', 'HONG_KONG', 'SINGAPORE'];

const DATA_AREAS: { code: string; label: string }[] = [
  { code: 'INVESTOR_ACCOUNT', label: 'My Facilon account' },
  { code: 'APPOINT', label: 'Facilon Appoint' },
  { code: 'ONBOARD', label: 'Facilon Onboard' },
  { code: 'STATUS', label: 'Facilon Status' },
  { code: 'REPORT', label: 'Facilon Report' },
  { code: 'INSTRUCT', label: 'Facilon Instruct' },
  { code: 'CONSENTS', label: 'Consents' },
  { code: 'SERVICE_AGENT', label: 'Service Agent / Referrer' },
  { code: 'WEBSITE_MARKETING', label: 'Website / marketing data' },
  { code: 'DOCUMENTS', label: 'Uploaded documents' },
  { code: 'NOT_SURE', label: 'I am not sure' }
];

const DECLARATION_TEXT =
  'I confirm that this request is being submitted through my Facilon Investor Account. I understand that ' +
  'Facilon may need to verify my identity, clarify the request, or coordinate with the relevant Service ' +
  'Provider before taking action. I also understand that certain requests may be subject to legal, ' +
  'regulatory, contractual, security, audit, or retention requirements.';

export const DsrCenter: React.FC = () => {
  const { isProxyMode } = useSAProxyNavigation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cases, setCases] = useState<DsrCaseResponseDto[]>([]);
  const [supportingFile, setSupportingFile] = useState<File | undefined>(undefined);
  const [dataAreas, setDataAreas] = useState<string[]>([]);
  const [declaration, setDeclaration] = useState(false);
  const [form, setForm] = useState<DsrCaseCreateDto>({
    requestType: 'ACCESS',
    jurisdiction: 'INDIA',
    requestDescription: '',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    requesterRole: 'INVESTOR'
  });

  const toggleDataArea = (code: string) => {
    setDataAreas((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  useEffect(() => {
    loadCases();
    prefillFromProfile();
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

  const prefillFromProfile = async () => {
    try {
      const data = await investorService.getDashboard();
      const inv = data?.investor;
      if (!inv) return;
      const fullName = [inv.firstName, inv.middleName, inv.lastName]
        .filter((p) => p && p.trim())
        .join(' ') || inv.name || '';
      setForm((prev) => ({
        ...prev,
        requesterName: prev.requesterName || fullName,
        requesterEmail: prev.requesterEmail || inv.email || '',
        requesterPhone: prev.requesterPhone || inv.mobileNumber || ''
      }));
    } catch (error) {
      console.error('[DsrCenter] Failed prefilling requester details from profile:', error);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.requestDescription || form.requestDescription.trim().length < 20) {
      alert('Please enter at least 20 characters in request description.');
      return;
    }
    if (dataAreas.length === 0) {
      alert('Please select at least one data area (or choose "I am not sure").');
      return;
    }
    if (!declaration) {
      alert('Please confirm the declaration before submitting.');
      return;
    }

    try {
      setSaving(true);
      await investorService.submitDsrCase({ ...form, dataArea: dataAreas.join(',') }, supportingFile);
      setForm((prev) => ({ ...prev, requestDescription: '' }));
      setSupportingFile(undefined);
      setDataAreas([]);
      setDeclaration(false);
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
          <button className="btn btn-link px-0 mb-2" onClick={() => navigate('/investor/dashboard')}>
            ← Back to Dashboard
          </button>
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
                <div className="col-md-12">
                  <label className="form-label d-block">Data Area (what does this request relate to?)</label>
                  <div className="d-flex flex-wrap gap-3">
                    {DATA_AREAS.map((area) => (
                      <div className="form-check" key={area.code}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`dsr-data-area-${area.code}`}
                          checked={dataAreas.includes(area.code)}
                          onChange={() => toggleDataArea(area.code)}
                        />
                        <label className="form-check-label" htmlFor={`dsr-data-area-${area.code}`}>
                          {area.label}
                        </label>
                      </div>
                    ))}
                  </div>
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
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="dsr-declaration"
                      checked={declaration}
                      onChange={(e) => setDeclaration(e.target.checked)}
                    />
                    <label className="form-check-label small text-muted" htmlFor="dsr-declaration">
                      {DECLARATION_TEXT}
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
                    <tr
                      key={item.caseId}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/investor/dsr-center/${item.caseId}`)}
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
        </div>
      </main>
      {!isProxyMode && <Footer />}
    </div>
  );
};
