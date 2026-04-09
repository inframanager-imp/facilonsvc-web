import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DelegationBanner.scss';

interface Props {
  investorName: string;
  investorEmail?: string;
  scope: string;
  canViewProfile: boolean;
  canEditKyc: boolean;
  canUploadDocuments: boolean;
  canSubmitForms: boolean;
  validTo?: string;
  backUrl?: string;
}

const SCOPE_LABELS: Record<string, string> = {
  CKYC_ONLY: 'CKYC Only',
  ONBOARDING_ONLY: 'Onboarding Only',
  FULL_ONBOARDING: 'Full Access',
  VIEW_ONLY: 'View Only',
};

export const DelegationBanner: React.FC<Props> = ({
  investorName,
  investorEmail,
  scope,
  canViewProfile,
  canEditKyc,
  canUploadDocuments,
  canSubmitForms,
  validTo,
  backUrl = '/service-agent/dashboard',
}) => {
  const navigate = useNavigate();
  const activePerms = [
    canViewProfile && 'View',
    canEditKyc && 'Edit KYC',
    canUploadDocuments && 'Upload Docs',
    canSubmitForms && 'Submit Forms',
  ].filter(Boolean) as string[];

  return (
    <div className="delegation-banner">
      <div className="delegation-banner__left">
        <span className="badge-acting">Acting on behalf of</span>
        <span className="investor-name">{investorName}</span>
        {investorEmail && <span style={{ opacity: 0.75 }}>({investorEmail})</span>}
      </div>

      <div className="delegation-banner__meta">
        <span className="scope-badge">{SCOPE_LABELS[scope] ?? scope}</span>
        {activePerms.map(p => (
          <span key={p} className="perm-chip">{p}</span>
        ))}
        {validTo && (
          <span style={{ opacity: 0.7 }}>
            Valid until: {new Date(validTo).toLocaleDateString()}
          </span>
        )}
      </div>

      <button
        type="button"
        className="delegation-banner__back"
        onClick={() => navigate(backUrl)}
      >
        ← Back to Investors
      </button>
    </div>
  );
};

export default DelegationBanner;
