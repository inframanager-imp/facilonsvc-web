import React, { useCallback, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import {
  AddressProofType,
  KycRequirementSlotDto,
  UploadRequest,
} from '../../../../../services/kycDocuments.service';

interface Props {
  slot: KycRequirementSlotDto;
  investorType: string;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (req: UploadRequest) => void;
}

const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024;

const ADDRESS_PROOF_TYPES: AddressProofType[] = [
  'Utility Bill',
  'Rent Agreement',
  'Bank Statement',
  'Driving License',
  'Passport',
  'Aadhaar',
  'Other',
];

export const UploadDialog: React.FC<Props> = ({ slot, investorType, submitting, onCancel, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [addressProofType, setAddressProofType] = useState<AddressProofType | ''>('');
  const [usesAadhaarForAddress, setUsesAadhaarForAddress] = useState<boolean | undefined>(undefined);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isAddressProof = slot.documentType === 'ADDRESS_PROOF';
  const isAadhaar = slot.documentType === 'AADHAR_CARD';
  const isNriAadhaar = isAadhaar && /NRI/i.test(investorType);

  const canSubmit = useMemo(() => {
    if (!file) return false;
    if (isAddressProof && !addressProofType) return false;
    return true;
  }, [file, isAddressProof, addressProofType]);

  const handleFileChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0] || null;
    if (!f) {
      setFile(null);
      return;
    }
    if (!ALLOWED_MIME.includes(f.type) && !f.type.startsWith('image/')) {
      setValidationError('Please upload a PDF, JPG, JPEG, or PNG file');
      setFile(null);
      return;
    }
    if (f.size > MAX_SIZE) {
      setValidationError('File must be smaller than 10 MB');
      setFile(null);
      return;
    }
    setValidationError(null);
    setFile(f);
  }, []);

  const handleSubmit = () => {
    if (!file) return;
    onSubmit({
      file,
      documentType: slot.documentType,
      addressProofType: isAddressProof ? (addressProofType as AddressProofType) : undefined,
      usesAadhaarForAddress:
        isAddressProof && addressProofType === 'Aadhaar'
          ? true
          : isAddressProof
          ? false
          : usesAadhaarForAddress,
    });
  };

  return (
    <Modal show onHide={onCancel} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-6">
          {slot.currentDocumentId ? 'Re-upload' : 'Upload'}: {slot.label}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label className="form-label">File (PDF, JPG, JPEG, PNG; max 10 MB)</label>
          <input
            type="file"
            className="form-control"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={handleFileChange}
            disabled={submitting}
          />
          {validationError && <div className="text-danger small mt-1">{validationError}</div>}
        </div>

        {isAddressProof && (
          <div className="mb-3">
            <label className="form-label">Type of address proof</label>
            <select
              className="form-select"
              value={addressProofType}
              onChange={(e) => setAddressProofType(e.target.value as AddressProofType)}
              disabled={submitting}
            >
              <option value="">Select...</option>
              {ADDRESS_PROOF_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {isNriAadhaar && (
          <div className="form-check mb-3">
            <input
              id="uses-aadhaar-esign"
              className="form-check-input"
              type="checkbox"
              checked={!!usesAadhaarForAddress}
              onChange={(e) => setUsesAadhaarForAddress(e.target.checked)}
              disabled={submitting}
            />
            <label className="form-check-label" htmlFor="uses-aadhaar-esign">
              I plan to use Aadhaar e-sign
            </label>
          </div>
        )}

        <p className="small text-muted mb-0">
          We will run OCR on the file via our document reader and validate key fields against your
          PAN and registration data.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? 'Uploading...' : 'Upload'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadDialog;
