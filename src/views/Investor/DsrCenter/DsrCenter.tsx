import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investorService, DsrCaseCreateDto } from '../../../services/investor.service';
import { PremiumSelect } from '../../../components/PremiumSelect/PremiumSelect';
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
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
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
    prefillFromProfile();
  }, []);

  const prefillFromProfile = async () => {
    try {
      const data = await investorService.getDashboard();
      const inv = data?.investor;
      if (inv) {
        const fullName = [inv.firstName, inv.middleName, inv.lastName]
          .filter((p) => p && p.trim())
          .join(' ') || inv.name || '';
        setForm((prev) => ({
          ...prev,
          requesterName: prev.requesterName || fullName,
          requesterEmail: prev.requesterEmail || inv.email || '',
          requesterPhone: prev.requesterPhone || inv.mobileNumber || ''
        }));
      }
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
      alert('DSR request submitted successfully.');
      navigate('/investor/dsr-center/requests');
    } catch (error) {
      console.error('[DsrCenter] Failed submitting DSR case:', error);
      alert('Failed to submit DSR request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
              onClick={() => navigate('/investor/dsr-center/requests')}
              className="text-[11px] font-semibold text-[#3e6f7c] hover:underline hover:text-[#1f4851] transition-colors flex items-center bg-transparent border-0 p-0 cursor-pointer"
            >
              View All Requests &rarr;
            </button>
          </div>

          <form className="investor-profile__card" onSubmit={onSubmit}>
            <div className="form-group form-group--full" style={{ marginBottom: '1rem' }}>
              <h3>Submit a DSR Request</h3>
            </div>

            <div className="investor-profile__grid">
              <div className="form-group">
                <label htmlFor="dsr-request-type">Right Exercised <span className="text-danger">*</span></label>
                <PremiumSelect
                  value={form.requestType}
                  onChange={(val) => setForm({ ...form, requestType: val })}
                  options={REQUEST_TYPES.map((type) => ({ value: type, label: type }))}
                  placeholder="Select Right"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dsr-jurisdiction">Jurisdiction <span className="text-danger">*</span></label>
                <PremiumSelect
                  value={form.jurisdiction}
                  onChange={(val) => setForm({ ...form, jurisdiction: val })}
                  options={JURISDICTIONS.map((jurisdiction) => ({ value: jurisdiction, label: jurisdiction }))}
                  placeholder="Select Jurisdiction"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dsr-role">Role</label>
                <input
                  id="dsr-role"
                  className="form-control"
                  value={form.requesterRole || ''}
                  onChange={(e) => setForm({ ...form, requesterRole: e.target.value })}
                  placeholder="INVESTOR"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dsr-requester-name">Requester Name <span className="text-danger">*</span></label>
                <input
                  id="dsr-requester-name"
                  className="form-control"
                  value={form.requesterName}
                  onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dsr-requester-email">Requester Email <span className="text-danger">*</span></label>
                <input
                  id="dsr-requester-email"
                  type="email"
                  className="form-control"
                  value={form.requesterEmail}
                  onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dsr-requester-phone">Requester Phone</label>
                <input
                  id="dsr-requester-phone"
                  className="form-control"
                  value={form.requesterPhone || ''}
                  onChange={(e) => setForm({ ...form, requesterPhone: e.target.value })}
                />
              </div>

              <div className="form-group form-group--full">
                <label htmlFor="dsr-request-description">Request Description <span className="text-danger">*</span></label>
                <textarea
                  id="dsr-request-description"
                  className="form-control"
                  rows={4}
                  value={form.requestDescription}
                  onChange={(e) => setForm({ ...form, requestDescription: e.target.value })}
                  required
                />
              </div>

              <div className="form-group form-group--full">
                <label>Data Area (what does this request relate to?) <span className="text-danger">*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {DATA_AREAS.map((area) => {
                    const isChecked = dataAreas.includes(area.code);
                    return (
                      <div className={`form-group--checkbox ${isChecked ? 'checked' : ''}`} key={area.code}>
                        <label htmlFor={`dsr-data-area-${area.code}`}>
                          <input
                            type="checkbox"
                            id={`dsr-data-area-${area.code}`}
                            checked={isChecked}
                            onChange={() => toggleDataArea(area.code)}
                          />
                          {area.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dsr-supporting-file">Supporting Evidence (PDF/JPG/JPEG, max 5MB)</label>
                <div className="custom-file-upload mt-1">
                  <input
                    id="dsr-supporting-file"
                    type="file"
                    className="d-none"
                    accept=".pdf,.jpg,.jpeg"
                    onChange={(e) => setSupportingFile(e.target.files?.[0])}
                  />
                  <label htmlFor="dsr-supporting-file" className="btn-outline-primary custom-file-label" style={{ width: '100%' }}>
                    {supportingFile ? supportingFile.name : 'Choose File'}
                  </label>
                </div>
              </div>

              <div className="form-group form-group--full" style={{ marginTop: '1rem' }}>
                <div className={`form-group--checkbox ${declaration ? 'checked' : ''}`}>
                  <label htmlFor="dsr-declaration">
                    <input
                      type="checkbox"
                      id="dsr-declaration"
                      checked={declaration}
                      onChange={(e) => setDeclaration(e.target.checked)}
                    />
                    <span>{DECLARATION_TEXT}</span>
                  </label>
                </div>
              </div>

              <div className="form-group form-group--full" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit DSR Request'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
