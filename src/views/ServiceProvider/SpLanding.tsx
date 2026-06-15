import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { serviceProviderService, SpLandingDto } from '../../services/serviceProvider.service';
import './ServiceProvider.scss';
import { CompactHeader } from '../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../components/CompactFooter/CompactFooter';
import { RegistrationStepper } from '../../components/RegistrationStepper/RegistrationStepper';
import { RegistrationVisualCard } from '../../components/RegistrationVisualCard/RegistrationVisualCard';

/**
 * Pixel-faithful port of `service-provider/register_sp.blade.php`.
 *
 * Entry URL: /account/investor/step?status=<Crypt::encrypt(email)>
 * Continue button → /service-provider/user-consent?uniqueCode=<status>
 * (Laravel: `route('services_provider_user', ['unique_codes' => $status])`.)
 */
const SpLanding: React.FC = () => {
  const [params] = useSearchParams();
  const status = params.get('status') ?? '';
  const navigate = useNavigate();

  const [data, setData] = useState<SpLandingDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!status) {
      setError('Missing or invalid invitation link.');
      return;
    }
    serviceProviderService
      .landing(status)
      .then(setData)
      .catch(() => setError('Invalid or expired invitation link.'));
  }, [status]);

  const onContinue = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!consentChecked || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      navigate(`/service-provider/user-consent?uniqueCode=${encodeURIComponent(status)}`);
    }, 300);
  };

  const greetingName = data?.fullName || 'Partner';
  const continueDisabled = !consentChecked || submitting;

  return (
    <>
      <CompactHeader />
      <section className="login-form-style4 steps4-sec section-padding align-items-center">
        <div className="container">
          <div className="registration-split-layout">
            {/* Left Panel: Form & Stepper */}
            <div className="left-panel">
              {/* Stepper Progress */}
              <RegistrationStepper currentStep={1} title="Service Provider Registration" maxWidth="550px" />

              {/* Card */}
              <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
                <div className="login-form-style3-main_full">
                  <div className="login-register3-form-middle" style={{ textAlign: 'left' }}>
                    {error && (
                      <div style={{ color: '#be1717', marginBottom: 12 }}>{error}</div>
                    )}

                    <h4 className="mt-0">Dear {greetingName},</h4>
                    <p>
                      Welcome to <strong>Facilon Service Provider User Registration</strong>.
                    </p>
                    <p>
                      You have been invited to create your individual user account to access
                      your organisation&rsquo;s workspace on the Facilon platform. Before
                      proceeding, please review and provide your consent to the applicable
                      Privacy Notice, Terms of Use, and related policies governing platform
                      access and the processing of your information.
                    </p>
                    <p>
                      By continuing, you confirm that you are authorised to register as a
                      user for your organisation and agree to the stated terms.
                    </p>

                    <div className="highlight">
                      <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', margin: 0 }}>
                        <input
                          type="checkbox"
                          id="consentCheckbox"
                          checked={consentChecked}
                          onChange={(e) => setConsentChecked(e.target.checked)}
                          className="w-4 h-4 text-[#be1717] bg-white border-slate-300 rounded focus:ring-[#be1717] cursor-pointer align-middle"
                          style={{ marginRight: '0.5rem', marginTop: '0.2rem', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                          I confirm that I am duly authorized to register and bind my
                          organization and agree to proceed with registration.
                        </span>
                      </label>
                    </div>

                    <div className="single-field mb-0 text-center border-t pt-3 mt-3">
                      <Link
                        to="#"
                        id="continueBtn"
                        className={`button-1${continueDisabled ? ' disabled' : ''}`}
                        onClick={onContinue}
                      >
                        {submitting ? 'Submitting...' : 'Continue'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Creative Illustration Panel */}
            <div className="right-panel">
              <RegistrationVisualCard step="interest" />
            </div>
          </div>
        </div>
      </section>
      <CompactFooter />
    </>
  );
};

export default SpLanding;
