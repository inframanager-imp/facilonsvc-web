import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { KycSmartDocumentDto } from '../../../../../services/kycDocuments.service';

interface Props {
  doc: KycSmartDocumentDto;
  onClose: () => void;
  onConfirm?: (id: number) => Promise<void> | void;
  onReject?: (id: number) => Promise<void> | void;
}

const FIELD_LABELS: Record<string, string> = {
  'user_personal_information.investor_first_name': 'First name',
  'user_personal_information.investor_middle_name': 'Middle name',
  'user_personal_information.investor_last_name': 'Last name',
  'user_personal_information.investor_gender': 'Gender',
  'user_personal_information.user_dob': 'Date of birth',
  'user_personal_information.user_pan_no': 'PAN number',
  'user_personal_information.user_aadhar_no': 'Aadhaar number',
};

function prettyFieldName(raw: string): string {
  return FIELD_LABELS[raw] || raw;
}

export const ExtractedFieldsReview: React.FC<Props> = ({ doc, onClose, onConfirm, onReject }) => {
  const [submitting, setSubmitting] = useState<'confirm' | 'reject' | null>(null);
  const blocking = doc.discrepancies.filter((d) => d.severity === 'BLOCKING');
  const warnings = doc.discrepancies.filter(
    (d) => d.severity === 'WARNING' && d.canonicalSource !== 'OCR_INFRA'
  );
  const ocrInfra = doc.discrepancies.filter((d) => d.canonicalSource === 'OCR_INFRA');

  // Confirm/Reject only offered when the upload actually made it through
  // (blocking = transaction rolled back, nothing to confirm against).
  const canDecide = !!(onConfirm && onReject) && blocking.length === 0 && !!doc.id;
  const alreadyConfirmed = !!doc.confirmedAt;

  const handleConfirm = async () => {
    if (!onConfirm || !doc.id) return;
    setSubmitting('confirm');
    try { await onConfirm(doc.id); } finally { setSubmitting(null); }
  };
  const handleReject = async () => {
    if (!onReject || !doc.id) return;
    setSubmitting('reject');
    try { await onReject(doc.id); } finally { setSubmitting(null); }
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fs-6">
          Extracted details - {doc.documentType}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <div className="d-flex gap-2 flex-wrap">
            {doc.validationStatus && (
              <span
                className={`badge ${
                  doc.validationStatus === 'VALID'
                    ? 'bg-success'
                    : doc.validationStatus === 'DISCREPANCY' || doc.validationStatus === 'OCR_FAILED'
                    ? 'bg-warning text-dark'
                    : doc.validationStatus === 'EXPIRED'
                    ? 'bg-danger'
                    : 'bg-secondary'
                }`}
              >
                {doc.validationStatus}
              </span>
            )}
            {doc.documentNumber && <span className="badge bg-light text-dark">#{doc.documentNumber}</span>}
            {doc.expiryDate && (
              <span className="badge bg-light text-dark">Expires {doc.expiryDate}</span>
            )}
            {typeof doc.ocrConfidence === 'number' && (
              <span className="badge bg-light text-dark">
                Avg confidence {(doc.ocrConfidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        {ocrInfra.length > 0 && (
          <div className="alert alert-warning">
            <strong>OCR could not read this document</strong>
            <ul className="mb-0 small">
              {ocrInfra.map((d) => (
                <li key={d.id}>{d.observedValue}</li>
              ))}
            </ul>
            <div className="small mt-2">
              Please make sure the document reader service is running and try again.
              If the problem persists, contact support with the time and document type.
            </div>
          </div>
        )}

        {blocking.length > 0 && (
          <div className="alert alert-danger">
            <strong>Upload blocked</strong>
            <ul className="mb-0 small">
              {blocking.map((d) => (
                <li key={d.id}>
                  {d.fieldName || d.canonicalSource}: expected "{d.expectedValue}", got "{d.observedValue}"
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="alert alert-warning">
            <strong>Review flags</strong>
            <ul className="mb-0 small">
              {warnings.map((d) => (
                <li key={d.id}>
                  {d.fieldName || d.canonicalSource}: expected "{d.expectedValue}", got "{d.observedValue}"
                </li>
              ))}
            </ul>
          </div>
        )}

        {doc.profileConflicts && doc.profileConflicts.length > 0 && (
          <div className="alert alert-info">
            <strong>Some fields were not imported into your profile</strong>
            <ul className="mb-0 small">
              {doc.profileConflicts.map((c) => (
                <li key={c.targetField}>
                  <span className="text-muted">{prettyFieldName(c.targetField)}:</span>{' '}
                  your profile says "<strong>{c.existingValue}</strong>",
                  document says "<strong>{c.documentValue}</strong>".
                  {c.reason ? ` ${c.reason}.` : ''}
                </li>
              ))}
            </ul>
            <div className="small mt-2">
              Please open your profile and update these values if the document is correct.
            </div>
          </div>
        )}

        <h6 className="mt-3 mb-2">Extracted fields</h6>
        {doc.fields.length === 0 ? (
          <p className="text-muted small mb-0">No fields were extracted. You may need to re-upload a clearer scan.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                  <th className="text-end">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {doc.fields.map((f, i) => (
                  <tr key={`${f.fieldName}-${i}`}>
                    <td>{f.fieldName}</td>
                    <td>{f.fieldValue}</td>
                    <td className="text-end">
                      {typeof f.confidence === 'number' ? `${Math.round(f.confidence * 100)}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {canDecide && !alreadyConfirmed && (
          <>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleReject}
              disabled={submitting !== null}
            >
              {submitting === 'reject' ? "Removing..." : "Something's wrong"}
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleConfirm}
              disabled={submitting !== null}
            >
              {submitting === 'confirm' ? 'Saving...' : 'Looks right'}
            </button>
          </>
        )}
        {alreadyConfirmed && (
          <span className="text-success small me-2">Confirmed {doc.confirmedAt?.slice(0, 10)}</span>
        )}
        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExtractedFieldsReview;
