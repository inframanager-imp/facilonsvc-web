import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { serviceAgentService, DelegationCreateDto } from '../../../services/serviceAgent.service';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import '../InvestorProfile/InvestorProfile.scss';
import './GrantDelegation.scss';

interface FormData {
  serviceAgentCode: string;
  scope: string;
  canViewProfile: boolean;
  canEditKyc: boolean;
  canUploadDocuments: boolean;
  canSubmitForms: boolean;
  validFrom: string;
  validTo: string;
  consentAgreed: boolean;
}

const SCOPES = [
  { value: 'CKYC_ONLY',       label: 'CKYC Only',              desc: 'CKYC forms, KYC, Personal Info, Tax Info' },
  { value: 'ONBOARDING_ONLY', label: 'Onboarding Only',         desc: 'Bank details, Nomination, Onboarding forms, Risk Profile' },
  { value: 'FULL_ONBOARDING', label: 'Full Onboarding Access',  desc: 'All modules — CKYC + Onboarding + everything' },
  { value: 'VIEW_ONLY',       label: 'View Only (read-only)',   desc: 'All modules in read-only mode; no edits or submissions' },
];

export const GrantDelegation: React.FC = () => {
  const { isProxyMode } = useSAProxyNavigation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      canViewProfile: true,
      canEditKyc: false,
      canUploadDocuments: false,
      canSubmitForms: false,
    },
  });

  const selectedScope = watch('scope');
  const consentAgreed = watch('consentAgreed');

  const onSubmit = async (data: FormData) => {
    if (!data.consentAgreed) {
      toast.error('Please read and agree to the consent statement');
      return;
    }

    setSubmitting(true);
    try {
      const dto: DelegationCreateDto = {
        serviceAgentCode:   data.serviceAgentCode.toUpperCase().trim(),
        scope:              data.scope as DelegationCreateDto['scope'],
        canViewProfile:     data.canViewProfile,
        canEditKyc:         data.canEditKyc,
        canUploadDocuments: data.canUploadDocuments,
        canSubmitForms:     data.canSubmitForms,
        validFrom:          data.validFrom || undefined,
        validTo:            data.validTo   || undefined,
        consentVersion:     '1.0',
      };
      await serviceAgentService.grantDelegation(dto);
      toast.success('Delegation granted successfully');
      navigate('/investor/delegations');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to grant delegation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="facilon-dashboard-wrapper">
      {!isProxyMode && <Header />}
      <main className="container-fluid dashboard-container-main">
        <div className="grant-delegation">
          <div className="grant-delegation__header mb-3">
            <h1 className="dashboard-title-modern">Grant Service Agent Access</h1>
            <p className="dashboard-subtitle text-muted">Authorise a Service Agent to assist you with your onboarding journey.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Agent Code */}
            <div className="card">
              <div className="card-body">
                <h6 className="card-title mb-3">Service Agent Details</h6>
                <div className="mb-3">
                  <label className="form-label">Service Agent Code <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control ${errors.serviceAgentCode ? 'is-invalid' : ''}`}
                    placeholder="e.g. SA-AB1234CD"
                    {...register('serviceAgentCode', { required: 'Agent code is required' })}
                  />
                  {errors.serviceAgentCode && (
                    <div className="error-message">{errors.serviceAgentCode.message}</div>
                  )}
                  <small className="text-muted">Ask your Service Agent for their unique agent code.</small>
                </div>
              </div>
            </div>

            {/* Scope */}
            <div className="card">
              <div className="card-body">
                <h6 className="card-title mb-3">Access Scope <span className="text-danger">*</span></h6>
                <p className="text-muted small mb-3">Choose what areas of your account the service agent can access.</p>
                {SCOPES.map(s => (
                  <div key={s.value} className="form-check mb-2">
                    <input
                      type="radio"
                      id={`scope-${s.value}`}
                      value={s.value}
                      className="form-check-input"
                      {...register('scope', { required: 'Please select a scope' })}
                    />
                    <label htmlFor={`scope-${s.value}`} className="form-check-label">
                      <span className="fw-semibold">{s.label}</span>
                      <span className="text-muted small ms-2">— {s.desc}</span>
                    </label>
                  </div>
                ))}
                {errors.scope && <div className="error-message">{errors.scope.message}</div>}
              </div>
            </div>

            {/* Permissions */}
            {selectedScope && (
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title mb-3">Granular Permissions</h6>
                  <p className="text-muted small mb-3">
                    Within the selected scope, choose what the service agent can do.
                  </p>
                  <div className="permission-group">
                    {[
                      { field: 'canViewProfile'    as const, label: 'View Profile',    desc: 'See your data and documents' },
                      { field: 'canEditKyc'        as const, label: 'Edit KYC / Info', desc: 'Update your KYC and personal info' },
                      { field: 'canUploadDocuments'as const, label: 'Upload Documents',desc: 'Upload documents on your behalf' },
                      { field: 'canSubmitForms'    as const, label: 'Submit Forms',    desc: 'Submit CKYC, onboarding forms' },
                    ].map(({ field, label, desc }) => {
                      const checked = watch(field);
                      return (
                        <div key={field} className={`permission-item ${checked ? 'selected' : ''}`}>
                          <input
                            id={`perm-${field}`}
                            type="checkbox"
                            {...register(field)}
                          />
                          <div>
                            <label htmlFor={`perm-${field}`} className="perm-label">{label}</label>
                            <div className="perm-desc">{desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Validity Period */}
            <div className="card">
              <div className="card-body">
                <h6 className="card-title mb-3">Validity Period (Optional)</h6>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" {...register('validFrom')} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" {...register('validTo')} />
                    <small className="text-muted">Leave empty for no automatic expiry.</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent */}
            <div className="card">
              <div className="card-body">
                <h6 className="card-title mb-3">Consent Statement</h6>
                <div className="consent-box mb-3">
                  <p>By granting this consent, I authorise the selected Service Agent to act on my behalf for
                  the scope and permissions specified above, solely for the purpose of completing my
                  onboarding / KYC / CKYC / related regulatory formalities. I understand that:</p>
                  <ul>
                    <li>All actions taken by the Service Agent on my account will be logged and visible to me.</li>
                    <li>I can revoke this access at any time.</li>
                    <li>The Service Agent is bound by Facilon's privacy policy and data protection terms.</li>
                    <li>I remain responsible for the accuracy of information submitted.</li>
                  </ul>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="consentAgreed"
                    className={`form-check-input ${errors.consentAgreed ? 'is-invalid' : ''}`}
                    {...register('consentAgreed', { required: 'You must agree to the consent statement' })}
                  />
                  <label htmlFor="consentAgreed" className="form-check-label">
                    I have read, understood, and agree to the above consent statement.
                  </label>
                  {errors.consentAgreed && (
                    <div className="error-message">{errors.consentAgreed.message}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !consentAgreed}
              >
                {submitting ? 'Granting...' : 'Confirm & Grant Access'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/investor/delegations')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      {!isProxyMode && <Footer />}
    </div>
  );
};

export default GrantDelegation;
