import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { DelegationDto, DelegationScope } from '../../models/DelegationDto';
import './AcceptDelegationModal.scss';

interface AcceptDelegationModalProps {
  delegation: DelegationDto;
  show: boolean;
  onClose: () => void;
  onAccept: (delegationId: number, customizations: ConsentCustomization) => void;
  processing: boolean;
  mode?: 'accept' | 'edit';
}

export interface ConsentCustomization {
  scope: string;
  canViewProfile: boolean;
  canEditKyc: boolean;
  canUploadDocuments: boolean;
  canSubmitForms: boolean;
}

const SCOPE_OPTIONS = [
  { value: 'VIEW_ONLY', label: 'View Only (No edits)', description: 'Service Agent can only view your information' },
  { value: 'CKYC_ONLY', label: 'CKYC Only', description: 'Access to CKYC, passport, tax info only' },
  { value: 'ONBOARDING_ONLY', label: 'Onboarding Only', description: 'Access to bank, nomination, risk profile only' },
  { value: 'FULL_ONBOARDING', label: 'Full Onboarding', description: 'Complete access to all modules' },
];

export const AcceptDelegationModal: React.FC<AcceptDelegationModalProps> = ({
  delegation,
  show,
  onClose,
  onAccept,
  processing,
  mode = 'accept'
}) => {
  const [scope, setScope] = useState<DelegationScope>(() => delegation.scope as DelegationScope);
  const [canViewProfile, setCanViewProfile] = useState(delegation.canViewProfile ?? true);
  const [canEditKyc, setCanEditKyc] = useState(delegation.canEditKyc ?? false);
  const [canUploadDocuments, setCanUploadDocuments] = useState(delegation.canUploadDocuments ?? false);
  const [canSubmitForms, setCanSubmitForms] = useState(delegation.canSubmitForms ?? false);
  const [consentGiven, setConsentGiven] = useState(mode === 'edit');

  const handleSubmit = () => {
    if (mode === 'accept' && !consentGiven) {
      alert('You must give consent to proceed');
      return;
    }

    onAccept(delegation.id, {
      scope,
      canViewProfile,
      canEditKyc,
      canUploadDocuments,
      canSubmitForms
    });
  };

  const isViewOnly = scope === 'VIEW_ONLY';
  const isEditMode = mode === 'edit';

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      backdrop="static"
      container={typeof document === 'undefined' ? undefined : document.body}
      className="accept-delegation-modal-root"
      dialogClassName="accept-delegation-modal-dialog"
    >
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Service Agent Permissions' : 'Accept Service Agent Assignment'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="accept-delegation-modal">
          {!isEditMode && (
            <div className="alert alert-info">
              <strong>Service Provider Assignment</strong>
              <p className="mb-0 mt-1">Your Service Provider has assigned <strong>{delegation.serviceAgentName}</strong> to assist with your onboarding journey.</p>
            </div>
          )}
          {isEditMode && (
            <div className="alert alert-primary">
              <strong>Update Permissions</strong>
              <p className="mb-0 mt-1">Modify the access level and permissions for <strong>{delegation.serviceAgentName}</strong>.</p>
            </div>
          )}

          <div className="sa-details mb-4">
            <h6>Service Agent Details</h6>
            <p className="mb-1"><strong>Name:</strong> {delegation.serviceAgentName}</p>
            <p className="mb-1"><strong>Email:</strong> {delegation.serviceAgentEmail}</p>
            <p className="mb-1"><strong>Code:</strong> {delegation.serviceAgentCode}</p>
          </div>

          <div className="scope-selection mb-4">
            <h6>Choose Access Level</h6>
            {!isEditMode && (
              <p className="text-muted small mb-3">
                You can customize what the Service Agent can do. The Service Provider suggested "<strong>{delegation.scope}</strong>", 
                but you can change it below.
              </p>
            )}
            {isEditMode && (
              <p className="text-muted small mb-3">
                Adjust the access level to match your current needs.
              </p>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Scope</Form.Label>
              <Form.Select
                value={scope}
                onChange={(e) => setScope(e.target.value as DelegationScope)}
              >
                {SCOPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} - {opt.description}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          <div className="permissions-selection mb-4">
            <h6>Specific Permissions</h6>
            <p className="text-muted small mb-3">
              Control what actions the Service Agent can perform on your behalf.
            </p>

            <Form.Check
              type="checkbox"
              id="canViewProfile"
              label="Can View Profile & Documents"
              checked={canViewProfile}
              onChange={(e) => setCanViewProfile(e.target.checked)}
              className="mb-2"
            />

            <Form.Check
              type="checkbox"
              id="canEditKyc"
              label="Can Edit KYC Information"
              checked={canEditKyc}
              onChange={(e) => setCanEditKyc(e.target.checked)}
              disabled={isViewOnly}
              className="mb-2"
            />

            <Form.Check
              type="checkbox"
              id="canUploadDocuments"
              label="Can Upload Documents on My Behalf"
              checked={canUploadDocuments}
              onChange={(e) => setCanUploadDocuments(e.target.checked)}
              disabled={isViewOnly}
              className="mb-2"
            />

            <Form.Check
              type="checkbox"
              id="canSubmitForms"
              label="Can Submit Forms on My Behalf"
              checked={canSubmitForms}
              onChange={(e) => setCanSubmitForms(e.target.checked)}
              disabled={isViewOnly}
              className="mb-2"
            />

            {isViewOnly && (
              <div className="alert alert-warning small mt-2">
                <strong>View Only Mode:</strong> Edit, Upload, and Submit permissions are disabled for VIEW_ONLY scope.
              </div>
            )}
          </div>

          <div className="validity-info mb-4">
            <h6>Validity Period</h6>
            <p className="mb-1"><strong>From:</strong> {delegation.validFrom ? new Date(delegation.validFrom).toLocaleDateString() : 'Immediately'}</p>
            <p className="mb-0"><strong>Until:</strong> {delegation.validTo ? new Date(delegation.validTo).toLocaleDateString() : 'No expiry'}</p>
          </div>

          {delegation.notes && (
            <div className="alert alert-secondary">
              <strong>Notes from Service Provider:</strong>
              <p className="mb-0 mt-1">{delegation.notes}</p>
            </div>
          )}

          <div className="consent-section">
            <Form.Check
              type="checkbox"
              id="consentGiven"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              label={
                <span>
                  I hereby consent to <strong>{delegation.serviceAgentName}</strong> accessing my data 
                  as per the scope and permissions selected above. I understand they will act on my behalf 
                  and all their actions will be logged for transparency.
                </span>
              }
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button 
          variant={isEditMode ? 'primary' : 'success'} 
          onClick={handleSubmit} 
          disabled={processing || (!isEditMode && !consentGiven)}
        >
          {processing ? 'Processing...' : (isEditMode ? '✓ Update Permissions' : '✓ Accept & Give Consent')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
