import React from 'react';
import { KycRequirementSlotDto } from '../../../../../services/kycDocuments.service';

interface Props {
  slots: KycRequirementSlotDto[];
}

export const ExpiryNotice: React.FC<Props> = ({ slots }) => {
  const attention = slots.filter(
    (s) => s.state === 'EXPIRED' || s.state === 'EXPIRES_SOON'
  );
  if (attention.length === 0) return null;

  const expired = attention.filter((s) => s.state === 'EXPIRED');

  return (
    <div className={`alert ${expired.length > 0 ? 'alert-danger' : 'alert-warning'} mb-3`}>
      <strong className="d-block mb-1">
        {expired.length > 0 ? 'Action required' : 'Heads up'}
      </strong>
      <ul className="mb-0 small">
        {attention.map((s) => (
          <li key={s.documentType}>
            {s.label}: {s.state === 'EXPIRED' ? 'expired' : `expires in ${s.daysUntilExpiry ?? '?'} days`}
            {s.expiryDate ? ` (${s.expiryDate})` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpiryNotice;
