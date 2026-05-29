import React, { useState } from 'react';

interface SowAgreementModalProps {
  show: boolean;
  busy: boolean;
  onClose: () => void;
  onAgree: () => void;
}

/**
 * Statement of Work No. 1 agreement modal — mirrors the Laravel facilon-status SOW screen.
 * The "I Agree" button is gated on the checkbox, matching Laravel's cbtest-19 + agreeBtn behaviour.
 */
export const SowAgreementModal: React.FC<SowAgreementModalProps> = ({ show, busy, onClose, onAgree }) => {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);

  if (!show) return null;

  const handleAgree = () => {
    if (!checked) {
      setError(true);
      return;
    }
    setError(false);
    onAgree();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 10, maxWidth: 760, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="text-center mb-3">
            <h4 className="m-0"><strong>Statement of Work No. 1 (Online Agreement)</strong></h4>
          </div>

          <div style={{ background: '#fafafa', padding: 24, borderRadius: 10 }}>
            <p>
              This online Statement of Work No. 1 (“SOW No. 1”) is made pursuant to and governed by the
              Service Recipient – Terms of Use (&quot;Terms&quot;) that you have agreed upon with Facilon
              Services Private Limited.
            </p>

            <ul>
              <li>Please select and submit the form below to opt for Service(s) offered on this Platform.</li>
            </ul>

            <p><strong>1. Facilon will provide the following Basic Service on this Platform:</strong></p>

            <div style={{ display: 'flex', gap: 15, marginTop: 20, background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e5e5' }}>
              <div>
                <input
                  type="checkbox"
                  id="sow-agree-cb"
                  checked={checked}
                  onChange={(e) => { setChecked(e.target.checked); if (e.target.checked) setError(false); }}
                  style={{ width: 20, height: 20 }}
                />
              </div>
              <div>
                <p>
                  Facilon Status is a digital platform designed to provide the Investor with real-time
                  visibility into the progress of their onboarding process with Facilon and your Service
                  Provider.
                </p>
                <ul>
                  <li>The objective is to ensure transparency, clarity, and timely communication throughout the onboarding journey.</li>
                </ul>
                <p><strong>Under this service, you shall receive access for the following:</strong></p>
                <ul>
                  <li>View onboarding progress across predefined on-boarding stages of your chosen service provider.</li>
                  <li>Receive alerts and updates regarding pending actions or missing information/documents.</li>
                  <li>Access to status of submitted documentation.</li>
                  <li>Track key milestones and next steps in the onboarding process.</li>
                </ul>
                <ul>
                  <li>All information shared through Facilon Status shall be protected in accordance with Facilon's data privacy and security policies.</li>
                  <li>The Investor shall maintain the confidentiality of login credentials and related access details.</li>
                </ul>
              </div>
            </div>

            <ul style={{ marginTop: 20 }}>
              <li>In case of any conflict between the terms and conditions of this SOW No. 1 and the Terms, the terms of this SOW shall prevail.</li>
              <li>Unless the context requires otherwise, capitalised terms undefined in this SOW No. 1 will have the meaning ascribed to them in the Terms.</li>
            </ul>

            <p>
              Please note that by clicking on I Agree, you agree, accept and acknowledge that you have fully
              understood the terms and conditions of the Services and agree to be bound by the Terms, and the{' '}
              <a href="/privacy-policy" target="_blank" rel="noreferrer" style={{ color: '#0d6efd' }}>Privacy Policy</a> and{' '}
              <a href="/service-agreement" target="_blank" rel="noreferrer" style={{ color: '#0d6efd' }}>Terms of Use</a>,
              as amended from time to time.
            </p>
          </div>

          {error && (
            <p style={{ color: 'red', marginTop: 10 }}>Please select the checkbox to proceed.</p>
          )}

          <div className="d-flex justify-content-center gap-2 mt-3">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleAgree}
              disabled={busy}
              style={{ padding: '10px 32px', fontWeight: 600 }}
            >
              {busy ? 'Working…' : 'I Agree'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SowAgreementModal;
