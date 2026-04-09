import React, { useState, useEffect } from 'react';
import { profileService, InvestorConsentsDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { SharedFormContext } from '../shared/types';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';

interface FinalSubmissionFormProps {
  onSave: () => void;
  canSubmit: boolean;
  isProxyMode: boolean;
  sharedContext: SharedFormContext;
}

export const FinalSubmissionForm: React.FC<FinalSubmissionFormProps> = ({
  onSave,
  canSubmit,
  isProxyMode,
  sharedContext
}) => {
  const delegationPerms = useDelegationPermissions();
  const [formData, setFormData] = useState({
    agreementComplete: false,
    agreementLegal: false,
    agreementModification: false,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Load existing consents data
  useEffect(() => {
    const loadConsents = async () => {
      try {
        const consents = await profileService.getConsents();
        if (consents) {
          setFormData({
            agreementComplete: consents.informationCorrectConsent || false,
            agreementLegal: consents.legalCapacityConsent || false,
            agreementModification: consents.modificationAwarenessConsent || false,
          });
        }
        
        // Backend maps investor.verifyStatus to InvestorBasicInfo.status
        const dashboardData = sharedContext.dashboardData;
        if (dashboardData?.investor?.status === 1) {
          setAlreadySubmitted(true);
        }
      } catch (error) {
        console.error('Error loading consents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConsents();
  }, [sharedContext.dashboardData]);

  const handlePrintPreview = () => {
    window.open('/investor/profile-pdf', '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreementComplete || !formData.agreementLegal || !formData.agreementModification) {
      toast.error('Please check all agreement boxes to submit');
      return;
    }
    
    setSaving(true);
    
    try {
      const consents: InvestorConsentsDto = {
        informationCorrectConsent: formData.agreementComplete,
        legalCapacityConsent: formData.agreementLegal,
        modificationAwarenessConsent: formData.agreementModification,
      };
      await profileService.finalSubmit(consents);
      toast.success('Profile submitted successfully');
      onSave();
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      if (permissionError) {
        toast.error(permissionError);
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="investor-profile__card">
        <h3>Final Submit</h3>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <form className="investor-profile__card" onSubmit={handleSubmit}>
      <h3>Final Submit</h3>
      
      {alreadySubmitted ? (
        <>
          <div className="alert alert-success" style={{ margin: '1rem 0', padding: '1rem', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px', color: '#155724' }}>
            <strong>✓ Profile Already Submitted</strong>
            <p style={{ marginBottom: 0, marginTop: '0.5rem' }}>Your profile has been successfully submitted. Any modifications will require a Request for Change.</p>
          </div>
          
          <div className="investor-profile__grid investor-profile__final-submit">
            <div className="form-group form-group--checkbox form-group--full">
              <label>
                <input
                  type="checkbox"
                  checked={formData.agreementComplete}
                  disabled={true}
                />
                I confirm that all information provided is true, complete and up to date.
              </label>
            </div>
            <div className="form-group form-group--checkbox form-group--full">
              <label>
                <input
                  type="checkbox"
                  checked={formData.agreementLegal}
                  disabled={true}
                />
                I am acting on my own behalf and have legal capacity to contract.
              </label>
            </div>
            <div className="form-group form-group--checkbox form-group--full">
              <label>
                <input
                  type="checkbox"
                  checked={formData.agreementModification}
                  disabled={true}
                />
                I am aware that once I click <strong>Submit</strong>, any modification thereafter will require me to submit Request for Change.
              </label>
            </div>
          </div>

          <div className="investor-profile__buttons">
            <button
              type="button"
              className="btn-preview"
              onClick={handlePrintPreview}
            >
              View PDF
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="investor-profile__hint">
            <strong>Step 1:</strong> Click "Generate PDF Preview" to review all your profile information in a new window.<br />
            <strong>Step 2:</strong> After reviewing, check the boxes below and click "Submit Profile".<br />
            You can also submit directly from the preview window.
          </p>
          
          <div className="investor-profile__grid investor-profile__final-submit">
            <div className="form-group form-group--checkbox form-group--full">
              <label>
                <input
                  type="checkbox"
                  checked={formData.agreementComplete}
                  onChange={(e) => setFormData({ ...formData, agreementComplete: e.target.checked })}
                />
                I confirm that all information provided is true, complete and up to date.
              </label>
            </div>
            <div className="form-group form-group--checkbox form-group--full">
              <label>
                <input
                  type="checkbox"
                  checked={formData.agreementLegal}
                  onChange={(e) => setFormData({ ...formData, agreementLegal: e.target.checked })}
                />
                I am acting on my own behalf and have legal capacity to contract.
              </label>
            </div>
            <div className="form-group form-group--checkbox form-group--full">
              <label>
                <input
                  type="checkbox"
                  checked={formData.agreementModification}
                  onChange={(e) => setFormData({ ...formData, agreementModification: e.target.checked })}
                />
                I am aware that once I click <strong>Submit</strong>, any modification thereafter will require me to submit Request for Change.
              </label>
            </div>
          </div>

          <div className="investor-profile__buttons">
            <button
              type="button"
              className="btn-preview"
              onClick={handlePrintPreview}
              disabled={saving}
            >
              Generate PDF Preview
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={saving || !canSubmit || !formData.agreementComplete || !formData.agreementLegal || !formData.agreementModification}
            >
              {saving ? 'Submitting...' : 'Submit Profile'}
            </button>
            {!canSubmit && delegationPerms.isProxyMode && (
              <small className="text-warning d-block mt-2">
                You don't have permission to submit forms on behalf of this investor. Contact them to update delegation permissions.
              </small>
            )}
          </div>
        </>
      )}
    </form>
  );
};
