import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  serviceProviderService,
  SpUserPrefillDto,
} from '../../services/serviceProvider.service';
import './ServiceProvider.scss';

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
    <div className="sp-user-register">
      <div className="page">
        <div className="card">
          <h1>Service Provider User Registration</h1>
          <p className="meta">Authorised users of registered Service Providers</p>

          <div className="info">
            Please complete this form to register as an authorised user of your
            organisation (Service Provider) on the Facilon platform.
          </div>

          {error && <div className="info error">{error}</div>}
          {submitError && <div className="info error">{submitError}</div>}

          <form onSubmit={onSubmit}>
            <div className="full-row">
              <label>
                Service Provider Name <span className="required">*</span>
              </label>
              <input type="text" value={prefill?.fullName ?? ''} readOnly />
            </div>

            <div>
              <label>
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div>
              <label>
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div>
              <label>
                Designation <span className="required">*</span>
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />
            </div>

            <div>
              <label>
                Official Email <span className="required">*</span>
              </label>
              <input
                type="email"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label>
                Official Phone <span className="required">*</span>
              </label>
              <input
                type="tel"
                value={officialPhone}
                onChange={(e) => setOfficialPhone(e.target.value)}
                required
              />
            </div>

            <div className="full-row">
              <label>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />{' '}
                I confirm that I have read and agree to the Service Provider User
                Privacy &amp; Consent Notice
              </label>
              <p className="consent-note">
                Consent is mandatory for registration and platform access.
              </p>
            </div>

            <div className="actions">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SpUserRegister;
