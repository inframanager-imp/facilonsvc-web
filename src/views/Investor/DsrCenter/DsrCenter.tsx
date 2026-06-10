import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investorService, DsrCaseCreateDto } from '../../../services/investor.service';
import { PremiumSelect } from '../../../components/PremiumSelect/PremiumSelect';
import { FiChevronLeft, FiClock, FiPaperclip, FiTrash2, FiCheck } from 'react-icons/fi';
import '../InvestorProfile/InvestorProfile.scss';
import './DsrCenter.scss';

const ChevronLeftIcon = FiChevronLeft as any;
const ClockIcon = FiClock as any;
const PaperclipIcon = FiPaperclip as any;
const TrashIcon = FiTrash2 as any;
const CheckIcon = FiCheck as any;

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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

  const handleFieldChange = (field: keyof DsrCaseCreateDto, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prevErr) => {
        const next = { ...prevErr };
        delete next[field];
        return next;
      });
    }
  };

  const toggleDataArea = (code: string) => {
    setDataAreas((prev) => {
      const updated = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      if (errors.dataAreas) {
        setErrors((prevErr) => {
          const next = { ...prevErr };
          delete next.dataAreas;
          return next;
        });
      }
      return updated;
    });
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

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.requestType || !form.requestType.trim()) {
      newErrors.requestType = 'Please select a right.';
    }
    if (!form.jurisdiction || !form.jurisdiction.trim()) {
      newErrors.jurisdiction = 'Please select a jurisdiction.';
    }
    if (!form.requesterName || !form.requesterName.trim()) {
      newErrors.requesterName = 'Requester Name is required.';
    }
    if (!form.requesterEmail || !form.requesterEmail.trim()) {
      newErrors.requesterEmail = 'Requester Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.requesterEmail)) {
        newErrors.requesterEmail = 'Please enter a valid email address.';
      }
    }
    if (!form.requestDescription || !form.requestDescription.trim()) {
      newErrors.requestDescription = 'Request Description is required.';
    } else if (form.requestDescription.trim().length < 20) {
      newErrors.requestDescription = 'Please enter at least 20 characters.';
    }
    if (dataAreas.length === 0) {
      newErrors.dataAreas = 'Please select at least one data area.';
    }
    if (!declaration) {
      newErrors.declaration = 'Please confirm the declaration.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      await investorService.submitDsrCase({ ...form, dataArea: dataAreas.join(',') }, supportingFile);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('[DsrCenter] Failed submitting DSR case:', error);
      alert('Failed to submit DSR request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="facilon-dashboard-wrapper">
      <main className="container-fluid dashboard-container-main p-0">
        <div className="investor-profile dsr-page">

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
            {/* Blue Header Banner */}
            <div className="bg-gradient-to-r from-[#2c5e6a] to-[#355f69] p-3 flex justify-between items-center text-white">

              <div>
                <h2 className="m-0 text-base font-bold text-white tracking-tight">Data Subject Rights Center</h2>
                <p className="m-0 text-[11.5px] font-normal text-white/80 mt-0.5">Manage your data requests and privacy preferences.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center bg-white text-[#3e6f7c] border-0 text-[11px] font-bold h-[30px] px-3.5 rounded-md transition-colors hover:bg-white/90 cursor-pointer shadow-sm text-decoration-none"
                  onClick={() => navigate('/investor/dsr-center/requests')}
                >
                  <ClockIcon size={12} className="me-1.5 flex-shrink-0" />
                  Request Status
                </button>
                <button
                  type="button"
                  className="inline-flex items-center bg-white/10 border border-white/20 text-white text-[11px] font-semibold h-[30px] px-3 rounded-md transition-colors hover:bg-white/20 hover:border-white/30 cursor-pointer text-decoration-none"
                  onClick={() => navigate('/investor/dashboard')}
                >
                  <ChevronLeftIcon size={12} className="me-1 flex-shrink-0" />
                  Back
                </button>
              </div>
            </div>

            {/* Dsr Card Body */}
            <div className="p-3 bg-white">
              <form className="bg-transparent border-0 rounded-none mb-0 pt-2.5 p-0" onSubmit={onSubmit} noValidate>
                <div className="investor-profile__grid">
                  <div className="form-group">
                    <label htmlFor="dsr-request-type">Right Exercised <span className="text-danger">*</span></label>
                    <PremiumSelect
                      value={form.requestType}
                      onChange={(val) => handleFieldChange('requestType', val)}
                      options={REQUEST_TYPES.map((type) => ({ value: type, label: type }))}
                      placeholder="Select Right"
                    />
                    {errors.requestType && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.requestType}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="dsr-jurisdiction">Jurisdiction <span className="text-danger">*</span></label>
                    <PremiumSelect
                      value={form.jurisdiction}
                      onChange={(val) => handleFieldChange('jurisdiction', val)}
                      options={JURISDICTIONS.map((jurisdiction) => ({ value: jurisdiction, label: jurisdiction }))}
                      placeholder="Select Jurisdiction"
                    />
                    {errors.jurisdiction && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.jurisdiction}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="dsr-role">Role</label>
                    <input
                      id="dsr-role"
                      className="form-control"
                      value={form.requesterRole || ''}
                      onChange={(e) => handleFieldChange('requesterRole', e.target.value)}
                      placeholder="INVESTOR"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dsr-requester-name">Requester Name <span className="text-danger">*</span></label>
                    <input
                      id="dsr-requester-name"
                      className="form-control"
                      value={form.requesterName}
                      onChange={(e) => handleFieldChange('requesterName', e.target.value)}
                    />
                    {errors.requesterName && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.requesterName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="dsr-requester-email">Requester Email <span className="text-danger">*</span></label>
                    <input
                      id="dsr-requester-email"
                      type="email"
                      className="form-control"
                      value={form.requesterEmail}
                      onChange={(e) => handleFieldChange('requesterEmail', e.target.value)}
                    />
                    {errors.requesterEmail && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.requesterEmail}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="dsr-requester-phone">Requester Phone</label>
                    <input
                      id="dsr-requester-phone"
                      className="form-control"
                      value={form.requesterPhone || ''}
                      onChange={(e) => handleFieldChange('requesterPhone', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dsr-supporting-file">Supporting Evidence <span className="text-[10px] italic text-muted">(pdf/jpg/jpeg, max 5MB)</span></label>
                    <div className="mt-1">
                      <input
                        id="dsr-supporting-file"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSupportingFile(file);
                          }
                          e.target.value = '';
                        }}
                      />

                      {!supportingFile ? (
                        <label
                          htmlFor="dsr-supporting-file"
                          className="inline-flex items-center justify-center border border-[#3e6f7c] text-[#3e6f7c] font-bold text-[10px] h-[28px] px-3.5 rounded-md cursor-pointer transition-colors bg-transparent hover:bg-[#3e6f7c]/5 select-none w-auto max-w-max"
                        >
                          Choose File
                        </label>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-md max-w-max">
                          <PaperclipIcon size={14} className="text-slate-400 flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[160px]">{supportingFile.name}</span>
                          <button
                            type="button"
                            className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors border-0 cursor-pointer bg-transparent"
                            onClick={() => setSupportingFile(undefined)}
                          >
                            <TrashIcon size={14} className="flex-shrink-0" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group form-group--full">
                    <label htmlFor="dsr-request-description">Request Description <span className="text-danger">*</span></label>
                    <textarea
                      id="dsr-request-description"
                      className="form-control"
                      rows={4}
                      value={form.requestDescription}
                      onChange={(e) => handleFieldChange('requestDescription', e.target.value)}
                    />
                    {errors.requestDescription && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.requestDescription}</span>}
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
                    {errors.dataAreas && <span className="text-[10px] text-red-500 font-semibold mt-1.5 block">{errors.dataAreas}</span>}
                  </div>



                  <div className="form-group form-group--full">
                    <div className={`form-group--checkbox ${declaration ? 'checked' : ''}`}>
                      <label htmlFor="dsr-declaration">
                        <input
                          type="checkbox"
                          id="dsr-declaration"
                          checked={declaration}
                          onChange={(e) => {
                            setDeclaration(e.target.checked);
                            if (errors.declaration) {
                              setErrors((prevErr) => {
                                const next = { ...prevErr };
                                delete next.declaration;
                                return next;
                              });
                            }
                          }}
                        />
                        <span>{DECLARATION_TEXT}</span>
                      </label>
                    </div>
                    {errors.declaration && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.declaration}</span>}
                  </div>

                  <div className="form-group form-group--full">
                    <button type="submit" className="btn-save" disabled={saving}>
                      {saving ? 'Submitting...' : 'Submit DSR Request'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckIcon size={32} className="text-emerald-600 flex-shrink-0" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-2">Request Submitted</h3>
            <p className="text-[12px] text-slate-500 mb-3 max-w-[280px]">
              Your Data Subject Rights request has been submitted successfully and is now being processed.
            </p>
            <button
              type="button"
              className="w-full py-2 bg-[#3e6f7c] hover:bg-[#355f69] text-white text-[12px] font-bold rounded-md transition-colors cursor-pointer border-0 shadow-sm"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/investor/dsr-center/requests');
              }}
            >
              View Requests
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
