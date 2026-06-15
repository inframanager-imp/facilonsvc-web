import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  serviceProviderService,
  SpUserPrefillDto,
} from '../../services/serviceProvider.service';
import './ServiceProvider.scss';
import { CompactHeader } from '../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../components/CompactFooter/CompactFooter';
import { RegistrationStepper } from '../../components/RegistrationStepper/RegistrationStepper';
import { RegistrationVisualCard } from '../../components/RegistrationVisualCard/RegistrationVisualCard';

/**
 * Pixel-faithful port of `service-provider/services_provider_user_register.blade.php`.
 *
 * Entry: /service-provider/user-register?serviceProviderEmail=<encrypted>
 * Submit POST → /api/clients/sp/user-register
 *   → on success, navigate to /service-provider/thank-you
 *   (Laravel: `redirect()->route('service_provider_register_thank_you_show')`).
 */
const SpUserRegister: React.FC = () => {
  const [params] = useSearchParams();
  const spEmail = params.get('serviceProviderEmail') ?? '';
  const navigate = useNavigate();

  const [prefill, setPrefill] = useState<SpUserPrefillDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [designation, setDesignation] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [officialPhone, setOfficialPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!spEmail) {
      setError('Invalid service provider link.');
      return;
    }
    serviceProviderService
      .getUserPrefill(spEmail)
      .then((p) => {
        setPrefill(p);
        setFirstName(p.complianceName || '');
        setLastName(p.complianceLastName || '');
        setOfficialEmail(p.complianceEmail && p.complianceEmail !== 'NA' ? p.complianceEmail : '');
        setOfficialPhone(
          p.compliancePhoneNo && p.compliancePhoneNo !== 'NA' ? p.compliancePhoneNo : '',
        );
      })
      .catch(() => setError('Invalid service provider link.'));
  }, [spEmail]);

  const validate = (): string | null => {
    if (!firstName.trim() || !lastName.trim() || !designation.trim() ||
        !officialEmail.trim() || !officialPhone.trim() || !consent) {
      return 'Please fill all required fields and accept consent.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail.trim())) {
      return 'Please enter a valid email';
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const v = validate();
    if (v) {
      setSubmitError(v);
      return;
    }
    if (!prefill) return;

    setSubmitting(true);
    try {
      const resp = await serviceProviderService.registerUser({
        serviceProviderEmail: spEmail,
        serviceProviderNameHidden: prefill.fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        designation: designation.trim() || undefined,
        officialEmail: officialEmail.trim(),
        officialPhone: officialPhone.trim(),
        consent,
      });
      if (resp.success) {
        navigate('/service-provider/thank-you');
      } else {
        setSubmitError(resp.message || 'Could not register. Please try again.');
        setSubmitting(false);
      }
    } catch {
      setSubmitError('Could not register. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <CompactHeader />
      <section className="login-form-style4 steps4-sec section-padding align-items-center">
        <div className="container">
          <div className="registration-split-layout">
            {/* Left Panel: Form & Stepper */}
            <div className="left-panel">
              {/* Stepper Progress */}
              <RegistrationStepper currentStep={5} title="Registration Details" maxWidth="550px" />

              {/* Card */}
              <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '550px', margin: '0 auto', textAlign: 'left' }}>
                <div className="login-form-style3-main_full">
                  <div className="login-register3-form-middle">
                    {error && <div style={{ color: '#be1717', marginBottom: 12 }}>{error}</div>}
                    {submitError && <div style={{ color: '#be1717', marginBottom: 12 }}>{submitError}</div>}

                    <form onSubmit={onSubmit}>
                      <div className="single-field full-row">
                        <label>
                          Service Provider Name <span className="star-color">*</span>
                        </label>
                        <input type="text" value={prefill?.fullName ?? ''} readOnly />
                      </div>

                      <div className="single-field">
                        <label>
                          First Name <span className="star-color">*</span>
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="single-field">
                        <label>
                          Last Name <span className="star-color">*</span>
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="single-field">
                        <label>
                          Designation <span className="star-color">*</span>
                        </label>
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          required
                        />
                      </div>

                      <div className="single-field">
                        <label>
                          Official Email <span className="star-color">*</span>
                        </label>
                        <input
                          type="email"
                          value={officialEmail}
                          onChange={(e) => setOfficialEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="single-field">
                        <label>
                          Official Phone <span className="star-color">*</span>
                        </label>
                        <input
                          type="tel"
                          value={officialPhone}
                          onChange={(e) => setOfficialPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="full-row highlight">
                        <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            required
                            className="w-4 h-4 text-[#be1717] bg-white border-slate-300 rounded focus:ring-[#be1717] cursor-pointer align-middle"
                            style={{ marginRight: '0.5rem', marginTop: '0.2rem', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                            I confirm that I have read and agree to the Service Provider User
                            Privacy &amp; Consent Notice
                          </span>
                        </label>
                        <p className="consent-note" style={{ paddingLeft: '1.7rem', margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
                          Consent is mandatory for registration and platform access.
                        </p>
                      </div>

                      <div className="actions mb-0 text-center border-t pt-3 mt-3 flex justify-center gap-2">
                        <button
                          className="button-2"
                          type="button"
                          onClick={() => window.history.back()}
                          disabled={submitting}
                        >
                          Cancel
                        </button>
                        <button className="button-1" type="submit" disabled={submitting}>
                          {submitting ? 'Submitting...' : 'Submit Registration'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Creative Illustration Panel */}
            <div className="right-panel">
              <RegistrationVisualCard step="details" />
            </div>
          </div>
        </div>
      </section>
      <CompactFooter />
    </>
  );
};

export default SpUserRegister;
