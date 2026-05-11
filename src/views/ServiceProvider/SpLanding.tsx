import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { serviceProviderService, SpLandingDto } from '../../services/serviceProvider.service';
import './ServiceProvider.scss';

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
    <section className="sp-landing">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-5 col-md-12 col-sm-12">
            <div className="lgf4-left-content">
              <h3>
                Service Provider <span>Registration</span>
              </h3>
            </div>
          </div>

          <div className="col-lg-7 col-md-12 col-sm-12">
            <div className="login-form-style3-main">
              <div className="login-register3-form-middle">
                {error && (
                  <div style={{ color: '#be1717', marginBottom: 12 }}>{error}</div>
                )}

                <h4>Dear {greetingName},</h4>
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

                <div className="consent-row">
                  <input
                    type="checkbox"
                    id="consentCheckbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                  />
                  <label htmlFor="consentCheckbox" style={{ marginBottom: 0 }}>
                    I confirm that I am duly authorized to register and bind my
                    organization and agree to proceed with registration.
                  </label>
                </div>

                <div style={{ marginTop: 20 }}>
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
      </div>
    </section>
  );
};

export default SpLanding;
