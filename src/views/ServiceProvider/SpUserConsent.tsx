import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  serviceProviderService,
  SpUserConsentLandingDto,
} from '../../services/serviceProvider.service';
import './ServiceProvider.scss';
import { CompactHeader } from '../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../components/CompactFooter/CompactFooter';
import { RegistrationStepper } from '../../components/RegistrationStepper/RegistrationStepper';
import { RegistrationVisualCard } from '../../components/RegistrationVisualCard/RegistrationVisualCard';

/**
 * Pixel-faithful port of `service-provider/services_provider_user.blade.php` —
 * the user-level Privacy & Consent display with the 6-row purpose table.
 *
 * Entry: /service-provider/user-consent?uniqueCode=<status>
 * Submit POST → /api/clients/sp/user-consent
 *   → on success, navigate to /service-provider/user-register?serviceProviderEmail=<resp.serviceProviderEmail>
 *     (mirrors Laravel `redirect()->route('admin.services_provider_user_register', …)`).
 */
const SpUserConsent: React.FC = () => {
  const [params] = useSearchParams();
  const uniqueCode = params.get('uniqueCode') ?? '';
  const navigate = useNavigate();

  const [landing, setLanding] = useState<SpUserConsentLandingDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!uniqueCode) {
      setError('Invalid or expired link.');
      return;
    }
    serviceProviderService
      .getUserConsent(uniqueCode)
      .then(setLanding)
      .catch(() => setError('Invalid or expired link.'));
  }, [uniqueCode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (!consent1 || !consent2) {
      alert('Please accept both consents to continue.');
      return;
    }
    if (!landing) {
      setError('Cannot submit consent. Invite data is not loaded.');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await serviceProviderService.submitUserConsent({
        uniqueCode,
        consentVersion: landing.consentVersion,
        effectiveDate: landing.effectiveDate,
      });
      navigate(
        `/service-provider/user-register?serviceProviderEmail=${encodeURIComponent(
          resp.serviceProviderEmail,
        )}`,
      );
    } catch {
      setError('Could not record your consent. Please try again.');
      setSubmitting(false);
    }
  };

  const onDisagree = () => {
    alert('You need to agree to move forward with the process.');
  };

  const fmtDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <CompactHeader />
      <section className="login-form-style4 steps4-sec section-padding align-items-center">
        <div className="container">
          <div className="registration-split-layout consent-layout-split">
            {/* Left Panel: Stepper + Form */}
            <div className="left-panel">
              {/* Stepper Progress */}
              <RegistrationStepper currentStep={2} title="Data Consent Management" maxWidth="700px" />

              {/* Consent Container Card */}
              <div className="consent-container" style={{ width: '100%', maxWidth: '700px', margin: '0 auto', textAlign: 'left' }}>
                <h2 className="mt-0">Service Provider User - Privacy &amp; Consent Notice</h2>
                <p className="meta">
                  Version {landing?.consentVersion ?? '1.0'} | Effective Date:{' '}
                  {fmtDate(landing?.effectiveDate ?? '')}
                </p>

                {error && <div style={{ color: '#be1717', marginBottom: 12 }}>{error}</div>}

                <div className="highlight">
                  This Privacy &amp; Consent Notice explains how Facilon Services Private Limited
                  Facilon processes your personal data when you access and use the Facilon
                  platform as an <strong>authorised user</strong> of{' '}
                  <strong>{landing?.nameOfClient || ''}</strong>. This Notice should be read
                  together with our <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>{' '}
                  and the agreement with your organisation.
                </div>

                <h2>Table of Purpose Name, Information collected, Usage &amp; Consent</h2>
                <p className="section-note">
                  By providing consent below, you authorise Facilon to process your personal data
                  to enable onboarding, review and compliance workflows on behalf of your
                  organisation.
                </p>

                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th className="col-narrow">Purpose Name</th>
                        <th>Personal Information Collected</th>
                        <th>Usage</th>
                        <th className="consent-col">Consent Coverage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>Service Provider User Onboarding, Identity and Role Management</td>
                        <td>
                          Name, email, phone number, role, employer, user ID, assigned roles,
                          access rights, permissions, approval authority
                        </td>
                        <td>
                          Used by Facilon to register users and establish user identity, assign
                          access credentials, and associate users with the relevant Service
                          Provider entity. To enforce least privilege access, manage approvals and
                          manage actions based on role.
                        </td>
                        <td>Included in your consent below</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>Platform Usage, Monitoring &amp; Audit Logs</td>
                        <td>
                          Login timestamps, IP/device identifiers, actions on investor records,
                          status changes, document views/downloads/uploads, activity logs, access
                          records, historical actions
                        </td>
                        <td>
                          Used by Facilon to ensure platform security, detect anomalies and frauds,
                          investigate incidents, support regulatory reviews, maintain evidentiary
                          audit trails, and support compliance, forensic analysis and dispute
                          resolution
                        </td>
                        <td>Included in your consent below</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>Support, Communications &amp; Operational Assistance</td>
                        <td>
                          Helpdesk tickets, chat transcripts, call logs and notes, email
                          correspondence, messages, workflow actions
                        </td>
                        <td>
                          Used by Facilon to provide timely support, manage service requests,
                          improve operational effectiveness, ensure traceability of actions,
                          deliver support services and maintain records for audit, quality
                          assurance, legal and regulatory requirements
                        </td>
                        <td>Included in your consent below</td>
                      </tr>
                      <tr>
                        <td>4</td>
                        <td>Analytics &amp; Product Improvement</td>
                        <td>Page views, navigation paths, feature usage, anonymized metrics</td>
                        <td>
                          Used by Facilon to evaluate system performance, enhance usability and
                          guide product improvements
                        </td>
                        <td>Included in your consent below</td>
                      </tr>
                      <tr>
                        <td>5</td>
                        <td>Enquiries &amp; Contact Requests</td>
                        <td>Name, email, message content</td>
                        <td>Used by Facilon to respond to user queries and manage communications</td>
                        <td>Included in your consent below</td>
                      </tr>
                      <tr>
                        <td>6</td>
                        <td>Third-Party Disclosures &amp; Operational Enablement</td>
                        <td>Data collected for providing services as mentioned under rows 1 to 5</td>
                        <td>
                          Used by Facilon to ensure service continuity, security, compliance and
                          operational effectiveness
                        </td>
                        <td>Included in your consent below</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <form onSubmit={onSubmit}>
                  <h2>Consent Declaration</h2>

                  <div
                    className="highlight"
                    style={{
                      backgroundColor: showErrors && !consent1 ? '#ffebee' : undefined,
                      borderLeftColor: showErrors && !consent1 ? '#be1717' : undefined
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={consent1}
                        onChange={(e) => setConsent1(e.target.checked)}
                        className="w-4 h-4 text-[#be1717] bg-white border-slate-300 rounded focus:ring-[#be1717] cursor-pointer align-middle"
                        style={{ marginRight: '0.5rem', marginTop: '0.2rem', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                        I provide free, specific, informed,{' '}
                        <strong>unconditional and unambiguous consent</strong> to{' '}
                        <strong>Facilon Services Private Limited</strong> to collect and process my
                        personal data, as described in the Privacy Notice, for the purposes of
                        user account creation, secure access, activity logging, operational
                        communication, and compliance in connection with my organisation&rsquo;s
                        use of the Facilon platform, in accordance with the Digital Personal Data
                        Protection Act, 2023 and other applicable laws.
                      </span>
                    </label>
                  </div>
                  {showErrors && !consent1 && (
                    <div style={{ color: '#be1717', fontSize: '11.5px', marginTop: '-8px', marginBottom: '12px', paddingLeft: '4px', fontWeight: '500' }}>
                      <i className="bi bi-exclamation-circle-fill me-1"></i> Please accept the consent declaration to continue.
                    </div>
                  )}

                  <div
                    className="highlight"
                    style={{
                      backgroundColor: showErrors && !consent2 ? '#ffebee' : undefined,
                      borderLeftColor: showErrors && !consent2 ? '#be1717' : undefined
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={consent2}
                        onChange={(e) => setConsent2(e.target.checked)}
                        className="w-4 h-4 text-[#be1717] bg-white border-slate-300 rounded focus:ring-[#be1717] cursor-pointer align-middle"
                        style={{ marginRight: '0.5rem', marginTop: '0.2rem', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                        I confirm that I have been provided access to, reviewed and understood the{' '}
                        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>,
                        which in addition to the above table, describes my rights and the
                        available grievance redressal mechanisms.
                      </span>
                    </label>
                  </div>
                  {showErrors && !consent2 && (
                    <div style={{ color: '#be1717', fontSize: '11.5px', marginTop: '-8px', marginBottom: '12px', paddingLeft: '4px', fontWeight: '500' }}>
                      <i className="bi bi-exclamation-circle-fill me-1"></i> Please confirm that you have reviewed the Privacy Policy to continue.
                    </div>
                  )}

                  <div className="ack">
                    <small>
                      I understand that I may withdraw this consent in accordance with the
                      Privacy Policy, subject to legal, regulatory or contractual retention
                      requirements, and that withdrawal may affect my ability to access the
                      Facilon platform.
                    </small>
                  </div>

                  <div className="actions mb-0 text-center border-t pt-3 mt-3 flex justify-center gap-2">
                    <button className="primary" type="submit" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'I Agree & Continue'}
                    </button>
                    <button className="secondary" type="button" onClick={onDisagree}>
                      I Do Not Agree
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Panel: Creative Illustration Panel */}
            <div className="right-panel">
              <RegistrationVisualCard step="consent" />
            </div>
          </div>
        </div>
      </section>
      <CompactFooter />
    </>
  );
};

export default SpUserConsent;
