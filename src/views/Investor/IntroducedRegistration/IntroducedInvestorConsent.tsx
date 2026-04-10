import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import introducedInvestorService from '../../../services/introducedInvestorService';
import './IntroducedInvestorRegistration.scss';

/**
 * Step 1: Data Consent Management Page
 * Matches Laravel: data-consent-management.blade.php
 */
const IntroducedInvestorConsent: React.FC = () => {
  const { investorId: investorIdParam } = useParams<{ investorId: string }>();
  const investorId = investorIdParam ? decodeURIComponent(investorIdParam) : '';
  const navigate = useNavigate();
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getCurrentDate = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date();
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleAgree = async () => {
    if (!consent1 || !consent2) {
      alert('Please accept both consents to continue.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await introducedInvestorService.recordConsent(investorId!);

      if (response.data.success && response.data.uniqueCode) {
        navigate(`/investor/introduced/step1/${response.data.uniqueCode}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record consent');
      console.error('Error recording consent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoNotAgree = () => {
    alert('You must agree to continue.');
  };

  return (
    <>
      <div className="consent-page-wrapper">
        <div className="consent-container">
          <h1>Individual Investor Privacy & Consent Notice</h1>
          <p className="meta">Version 1.0 &nbsp;|&nbsp; Effective Date: {getCurrentDate()}</p>

          <div className="highlight">
            This Privacy & Consent Notice explains how Facilon Services Private Limited ("Facilon", "we", "us")
            processes your personal data when you register as an <strong>individual investor</strong> and when you use any of our portals. This Notice should be read together with our
            <a href="/privacy-policy"> Privacy Policy</a>. If there is any inconsistency, the Privacy Policy will prevail.
          </div>

          <h2>Table of Purpose Name, Information collected, Usage and Consent</h2>
          <p className="section-note">
            By giving consent below, you authorise Facilon to process the categories of personal data listed here for the
            corresponding purposes.
          </p>

          <table>
            <thead>
              <tr>
                <th></th>
                <th className="col-narrow">Purpose Name</th>
                <th>Personal Information Collected</th>
                <th>Usage</th>
                <th className="consent-col">Consent Coverage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Investor Profile Creation & Account Management</td>
                <td>First Name, Middle Name, Last Name, Email ID, mobile number, landline number, WhatsApp number, Username /
                  Login ID, Nationality, Country of Residence, Gender, Date of Birth, Legal Name, type of entity,
                  incorporation details, Registered address, tax identifiers, contact persons, Authorized Signatory /
                  Representative name (for Legal Entities).</td>
                <td>Used by Facilon to register investors and establish investor accounts, manage access credentials, manage authentication, associate users with applicable entities and relevant services and enable interaction with Platform services</td>
                <td>Included in your consent below</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Platform Usage, Monitoring & Audit Logs</td>
                <td>Login timestamps, IP/device identifiers, actions on investor records, status changes, document views/downloads/uploads, activity logs, access records, historical actions.</td>
                <td>Used by Facilon to ensure platform security, detect anomalies, frauds, investigate incidents, regulatory reviews, maintain evidentiary audit trails, and support compliance /forensic analysis and dispute resolution</td>
                <td>Included in your consent below</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Support, Communications & Operational Assistance</td>
                <td>Helpdesk tickets, chat transcripts, call logs and notes, email correspondence, messages, workflow actions.</td>
                <td>Used by Facilon to provide timely support, manage service requests, improve operational effectiveness, traceability of actions, deliver support services and maintain records for audit and quality assurance purposes and legal and regulatory requirements.</td>
                <td>Included in your consent below</td>
              </tr>
              <tr>
                <td>4</td>
                <td>KYC / CKYC Processing</td>
                <td>Citizenship, Country of Birth, Country/ies of Residence, Passport, Aadhaar, PAN, Election ID, Driving License, MGNREGA Card, Govt issued ID, RBI Approval Reference (if applicable), Certificate of Incorporation, constitutional documents, registration number, licenses.</td>
                <td>Used by Service Providers to complete regulatory onboarding, verify identity, and facilitate compliant access to financial services</td>
                <td>Included in your consent below</td>
              </tr>
              <tr>
                <td>5</td>
                <td>FATCA / CRS & Tax Compliance</td>
                <td>Tax residence, Tax Identification Number, FATCA classification, CRS declarations.</td>
                <td>Used by Service Providers for classification, reporting, and ongoing tax compliance monitoring</td>
                <td>Included in your consent below</td>
              </tr>
              <tr>
                <td>6</td>
                <td>Financial suitability assessment and regulatory risk profiling</td>
                <td>Occupation, Line of Business, Annual Income Range, Net Worth, Educational Qualification.</td>
                <td>Used by Service Providers under regulatory frameworks to assess financial suitability, risk profiling, and account categorization</td>
                <td>Included in your consent below</td>
              </tr>
              <tr>
                <td>7</td>
                <td>Anti-Money Laundering (AML), Risk Monitoring & Financial Crime Prevention</td>
                <td>Source of Funds, Source of Wealth, Politically Exposed Persons ("PEP") status and related information, Relationship to PEPs, High-value transaction disclosures, Nature and purpose of business relationship, Regulatory violations (if any).</td>
                <td>Used by Service Providers for AML screening, transaction monitoring, suspicious activity detection, and reporting obligations required under PMLA, SEBI and international AML guidelines</td>
                <td>Included in your consent below</td>
              </tr>
              <tr>
                <td>8</td>
                <td>Bank & Payment Details Processing</td>
                <td>Bank account details, IFSC, payment references, cancelled cheque.</td>
                <td>Used by Service Providers to support payment processing, reconciliation, and transaction-related communications</td>
                <td>Included in your consent below</td>
              </tr>
              <tr>
                <td>9</td>
                <td>Analytics & Product Improvement</td>
                <td>Page views, navigation paths, feature usage, anonymized metrics.</td>
                <td>Used by Facilon to evaluate system performance, enhance usability, and guide product improvements</td>
                <td>Included in your consent below</td>
              </tr>
              <tr>
                <td>10</td>
                <td>Enquiries & Contact Requests</td>
                <td>Name, email, message content.</td>
                <td>Used by Facilon to respond to user queries and manage communications</td>
                <td>Included in your consent below</td>
              </tr>
              <tr>
                <td>11</td>
                <td>Third-Party Disclosures & Operational Enablement</td>
                <td>Data Collected for providing services as mentioned under rows 1 to 11.</td>
                <td>Used by Facilon to ensure service continuity, security, compliance, and operational effectiveness</td>
                <td>Included in your consent below</td>
              </tr>
            </tbody>
          </table>

          <h2>Consent Declaration</h2>
          <p className="section-note">
            Please review the table above carefully before you give consent. You need to provide consent before we can process and provide data to your chosen Service Provider.
            Your consent is mandatory and until you do not provide such consent, our services will not be available.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="ack">
            <label>
              <input
                type="checkbox"
                id="consent1"
                checked={consent1}
                onChange={(e) => setConsent1(e.target.checked)}
                required
              />
              I provide <strong>free, specific, informed, unconditional and unambiguous consent</strong> to Facilon Services Private Limited
              to collect and process my personal data as described in the table above, and to share it with my selected Service Providers
              for the stated purposes, in accordance with the Digital Personal Data Protection Act, 2023 and applicable regulations.
            </label>
          </div>
          <div className="ack">
            <label>
              <input
                type="checkbox"
                id="consent2"
                checked={consent2}
                onChange={(e) => setConsent2(e.target.checked)}
                required
              />
              I confirm that I have been provided <strong> access to, reviewed and understood </strong> the <a href="/privacy-policy">Privacy Policy</a>, which in addition to the above table, describes our rights and the available grievance redressal mechanisms.
            </label>
          </div>
          <div className="ack">
            <small>
              I understand that:<br />
              • I may withdraw this consent at any time by following the process described in the Privacy Policy (subject to legal / regulatory retention obligations).<br />
              • Even if I withdraw consent, Facilon and Service Providers may retain certain data where required under law (for example, SEBI, CKYC, FATCA / CRS and record‑keeping rules).<br />
              • Withdrawal of consent or failure to provide required data may affect or restrict my ability to use Facilon portals and interact with Service Providers.
            </small>
          </div>

          <div className="actions">
            <button
              className="primary"
              onClick={handleAgree}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'I Agree & Continue'}
            </button>

            <button
              className="secondary"
              type="button"
              onClick={handleDoNotAgree}
              disabled={loading}
            >
              I Do Not Agree
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default IntroducedInvestorConsent;
