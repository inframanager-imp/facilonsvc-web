import React, { useState, useEffect } from 'react';
import { profileService, UserBankDetailsDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validateBankDetails } from '../../../../utils/investorValidation';
import { SharedFormContext } from '../shared/types';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';

interface BankDetailsFormProps {
  initialData: UserBankDetailsDto | null;
  onSave: () => void;
  canEdit: boolean;
  canSubmit: boolean;
  isProxyMode: boolean;
  sharedContext: SharedFormContext;
}

export const BankDetailsForm: React.FC<BankDetailsFormProps> = ({
  initialData,
  onSave,
  canEdit,
  isProxyMode,
  sharedContext
}) => {
  const delegationPerms = useDelegationPermissions();
  const [formData, setFormData] = useState<Partial<UserBankDetailsDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      settlementAccountType: formData.settlementAccountType || (formData.accountType ? 'yes' : ''),
    } as UserBankDetailsDto;
    
    const newErrors = validateBankDetails(payload);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }
    
    setErrors({});
    setSaving(true);
    
    try {
      await profileService.updateBankDetails(payload);
      toast.success('Bank details updated');
      onSave();
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      if (permissionError) {
        toast.error(permissionError);
      } else {
        toast.error(err.response?.data?.message || 'Failed to update');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="investor-profile__card" onSubmit={handleSubmit}>
      <h3>Bank Details</h3>
      <div className="investor-profile__grid">
        <div className="form-group">
          <label>Bank Name <span className="text-danger">*</span></label>
          <input
            value={formData.bankName ?? ''}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            className={errors.bankName ? 'form-control is-invalid' : ''}
          />
          {errors.bankName && <div className="invalid-feedback">{errors.bankName}</div>}
        </div>
        
        <div className="form-group">
          <label>Account Type <span className="text-danger">*</span></label>
          <select
            value={formData.accountType ?? ''}
            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
            className={errors.accountType ? 'form-control is-invalid' : ''}
          >
            <option value="">Select</option>
            <option value="savings">Savings</option>
            <option value="current">Current</option>
            <option value="nro">NRO</option>
            <option value="nre">NRE</option>
          </select>
          {errors.accountType && <div className="invalid-feedback">{errors.accountType}</div>}
        </div>

        {/* PIS fields — visible only for NRO / NRE accounts */}
        {(formData.accountType === 'nro' || formData.accountType === 'nre') && (
          <>
            <div className="form-group form-group--full">
              <label>Do you have PIS Approval? <span className="text-danger">*</span></label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'normal' }}>
                  <input
                    type="radio"
                    name="rbiApproval"
                    value="yes"
                    checked={formData.rbiApproval === 'yes'}
                    onChange={() => setFormData({ ...formData, rbiApproval: 'yes' })}
                  /> Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'normal' }}>
                  <input
                    type="radio"
                    name="rbiApproval"
                    value="no"
                    checked={formData.rbiApproval === 'no'}
                    onChange={() => setFormData({ ...formData, rbiApproval: 'no' })}
                  /> No
                </label>
              </div>
            </div>

            {formData.rbiApproval === 'yes' && (
              <>
                <div className="form-group">
                  <label>PIS Approval No <span className="text-danger">*</span></label>
                  <input
                    value={formData.rbiApprovalOrderNumber ?? ''}
                    onChange={(e) => setFormData({ ...formData, rbiApprovalOrderNumber: e.target.value })}
                    placeholder="e.g., PIS/2024/001"
                  />
                </div>
                <div className="form-group">
                  <label>PIS Approval Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    value={formData.rbiApprovalDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, rbiApprovalDate: e.target.value })}
                  />
                </div>
              </>
            )}
          </>
        )}
        
        <div className="form-group">
          <label>Beneficiary Name <span className="text-danger">*</span></label>
          <input
            value={formData.beneficiaryName ?? ''}
            onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
            className={errors.beneficiaryName ? 'form-control is-invalid' : ''}
          />
          {errors.beneficiaryName && <div className="invalid-feedback">{errors.beneficiaryName}</div>}
        </div>
        
        <div className="form-group">
          <label>Bank Account Number <span className="text-danger">*</span></label>
          <input
            value={formData.bankAccountNumber ?? ''}
            onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
            className={errors.bankAccountNumber ? 'form-control is-invalid' : ''}
          />
          {errors.bankAccountNumber && <div className="invalid-feedback">{errors.bankAccountNumber}</div>}
        </div>
        
        <div className="form-group">
          <label>IFSC Code <span className="text-danger">*</span></label>
          <input
            value={formData.bankIfscCode ?? ''}
            onChange={(e) => setFormData({ ...formData, bankIfscCode: e.target.value })}
            placeholder="e.g., SBIN0001234"
            className={errors.bankIfscCode ? 'form-control is-invalid' : ''}
          />
          {errors.bankIfscCode && <div className="invalid-feedback">{errors.bankIfscCode}</div>}
        </div>
        
        <div className="form-group">
          <label>Branch name <span className="text-danger">*</span></label>
          <input
            value={formData.branchName ?? ''}
            onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
            className={errors.branchName ? 'form-control is-invalid' : ''}
          />
          {errors.branchName && <div className="invalid-feedback">{errors.branchName}</div>}
        </div>
        
        <div className="form-group form-group--full">
          <label>Bank Address (Branch Address)</label>
          <input
            value={formData.bankBranchAddress ?? ''}
            onChange={(e) => setFormData({ ...formData, bankBranchAddress: e.target.value })}
          />
        </div>
      </div>
      
      <button type="submit" className="btn-save" disabled={saving || !canEdit}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      {!canEdit && delegationPerms.isProxyMode && (
        <small className="text-warning d-block mt-2">
          You don't have permission to edit KYC information. Contact the investor to update delegation permissions.
        </small>
      )}
    </form>
  );
};
