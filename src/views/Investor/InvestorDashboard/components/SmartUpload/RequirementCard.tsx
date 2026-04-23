import React from 'react';
import {
  KycRequirementSlotDto,
  KycRequirementState,
} from '../../../../../services/kycDocuments.service';

interface Props {
  slot: KycRequirementSlotDto;
  onUpload: () => void;
  onReview: () => void;
}

const STATE_LABEL: Record<KycRequirementState, string> = {
  NOT_UPLOADED: 'Not uploaded',
  PENDING: 'Processing...',
  PENDING_REVIEW: 'Awaiting your confirmation',
  VALID: 'Valid',
  DISCREPANCY: 'Discrepancy',
  EXPIRED: 'Expired',
  EXPIRES_SOON: 'Expires soon',
  OCR_FAILED: 'Needs review',
};

const STATE_BADGE: Record<KycRequirementState, string> = {
  NOT_UPLOADED: 'bg-secondary',
  PENDING: 'bg-info',
  PENDING_REVIEW: 'bg-info',
  VALID: 'bg-success',
  DISCREPANCY: 'bg-warning text-dark',
  EXPIRED: 'bg-danger',
  EXPIRES_SOON: 'bg-warning text-dark',
  OCR_FAILED: 'bg-warning text-dark',
};

export const RequirementCard: React.FC<Props> = ({ slot, onUpload, onReview }) => {
  const uploaded = slot.state !== 'NOT_UPLOADED';
  const actionLabel = uploaded ? 'Re-upload' : 'Upload';
  const needsReview = slot.state === 'DISCREPANCY' || slot.state === 'OCR_FAILED';
  const needsConfirm = slot.state === 'PENDING_REVIEW';
  const reviewLabel = needsConfirm ? 'Confirm details' : needsReview ? 'Review details' : 'View';

  return (
    <div className="requirement-card card p-3">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
        <div>
          <h6 className="mb-1">{slot.label}</h6>
          <div className="d-flex flex-wrap gap-2">
            <span
              className={`badge ${
                slot.requirement === 'MANDATORY'
                  ? 'bg-dark'
                  : slot.requirement === 'CONDITIONAL'
                  ? 'bg-light text-dark border'
                  : 'bg-light text-dark'
              }`}
            >
              {slot.requirement}
            </span>
            <span className={`badge ${STATE_BADGE[slot.state]}`}>{STATE_LABEL[slot.state]}</span>
          </div>
        </div>
      </div>

      {slot.note && <div className="small text-muted mb-2">{slot.note}</div>}

      {slot.expiryDate && (
        <div className="small text-muted mb-2">
          Expires: {slot.expiryDate}
          {typeof slot.daysUntilExpiry === 'number' && (
            <> ({slot.daysUntilExpiry} days)</>
          )}
        </div>
      )}

      <div className="mt-auto d-flex gap-2 flex-nowrap">
        <button
          type="button"
          className="btn btn-primary btn-sm text-nowrap"
          onClick={onUpload}
        >
          {actionLabel}
        </button>
        {uploaded && (
          <button
            type="button"
            className={`btn btn-sm text-nowrap ${needsConfirm ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={onReview}
          >
            {reviewLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default RequirementCard;
