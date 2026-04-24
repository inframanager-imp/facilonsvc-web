import React, { useState, useEffect } from 'react';
import { profileService, UserBankDetailsDto, PreferredBankDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validateBankDetails } from '../../../../utils/investorValidation';
import { SharedFormContext } from '../shared/types';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';
import { PremiumSelect } from '../../../../components/PremiumSelect/PremiumSelect';
import { isResidentIndividual, isFieldVisible } from '../../../../config/profileVisibility';

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'savings', label: 'Savings' },
  { value: 'current', label: 'Current' },
  { value: 'nro', label: 'NRO' },
  { value: 'nre', label: 'NRE' },
];

const COUNTRY_OPTIONS = [
  { value: 'India', label: 'INDIA' },
];

/** Indian states & UTs — Laravel populates this from master_states filtered to India. */
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const STATE_OPTIONS = INDIAN_STATES.map(s => ({ value: s, label: s.toUpperCase() }));

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
  const [preferredBank, setPreferredBank] = useState<PreferredBankDto | null>(null);

  // RI profile rules: hide NRE/NRO/PIS block + Country, prefill beneficiary
  // name from registration, and skip the settlement-account-type gate that
  // otherwise blocks the rest of the form.
  const investorType = sharedContext.dashboardData?.investor?.investorType ?? undefined;
  const isRi = isResidentIndividual(investorType);
  const showSettlementQuestion = isFieldVisible(investorType, 'bank.haveNreAccount');
  const showSettlementAccountType = isFieldVisible(investorType, 'bank.settlementAccountType');
  const showPisBlock = isFieldVisible(investorType, 'bank.rbiApproval');

  useEffect(() => {
    if (initialData) {
      const hydrated: Partial<UserBankDetailsDto> = { ...initialData };
      if (isRi) {
        // Beneficiary name defaults to the registered name when empty.
        const dash = sharedContext.dashboardData?.investor;
        const full = [dash?.firstName, dash?.lastName]
          .filter((s) => s && s.trim() !== '')
          .join(' ')
          .trim();
        if ((!hydrated.beneficiaryName || hydrated.beneficiaryName.trim() === '') && full) {
          hydrated.beneficiaryName = full;
        }
        if (!hydrated.bankDetailsCountry) {
          hydrated.bankDetailsCountry = 'India';
        }
      }
      setFormData(hydrated);
    }
  }, [initialData, isRi, sharedContext.dashboardData]);

  // Load broker's preferred bank (Laravel parity) and prefill bankName when empty
  useEffect(() => {
    let cancelled = false;
    profileService.getPreferredBank()
      .then((pb) => {
        if (cancelled || !pb) return;
        setPreferredBank(pb);
        if (pb.isBroker && pb.bankName) {
          setFormData((prev) => ({
            ...prev,
            bankName: prev.bankName && prev.bankName.trim() !== '' ? prev.bankName : pb.bankName ?? '',
          }));
        }
      })
      .catch((err) => {
        // Non-fatal — the form still works without the preferred-bank hint
        console.warn('[BankDetailsForm] failed to load preferred bank:', err);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // settlementAccountType is now an explicit radio the user answers (Laravel parity).
    // Require it before submit — except for RI, where the question is hidden
    // because NRE/NRO accounts don't apply.
    if (!isRi && !formData.settlementAccountType) {
      setErrors({ settlementAccountType: 'Please answer the NRE-account question.' });
      toast.error('Please answer: Do you already have a NRE account?');
      return;
    }
    const payload = { ...formData } as UserBankDetailsDto;

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
      {/* <h3>Bank Details</h3> */}
      {showSettlementQuestion && (
        <div className="investor-profile__grid">
          {/* Laravel parity: settlement_account_type — gate the bank fields on this answer.
              When the broker has a preferred bank configured, the question names the bank
              (matches Laravel: "Do you already have a NRE account with {bank}?").
              RI hides this entirely — NRE/NRO accounts don't apply. */}
          <div className="form-group form-group--full">
            <label>
              {preferredBank?.isBroker && preferredBank.bankName
                ? `Do you already have a NRE account with ${preferredBank.bankName}?`
                : 'Do you already have a NRE account?'}
              {' '}<span className="text-danger">*</span>
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'normal' }}>
                <input
                  type="radio"
                  name="settlementAccountType"
                  value="yes"
                  checked={formData.settlementAccountType === 'yes'}
                  onChange={() => setFormData({ ...formData, settlementAccountType: 'yes' })}
                /> Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'normal' }}>
                <input
                  type="radio"
                  name="settlementAccountType"
                  value="no"
                  checked={formData.settlementAccountType === 'no'}
                  onChange={() => setFormData({ ...formData, settlementAccountType: 'no' })}
                /> No
              </label>
            </div>
            {errors.settlementAccountType && <div className="invalid-feedback">{errors.settlementAccountType}</div>}
          </div>
        </div>
      )}

      {/* Laravel equivalent of #show_account_type_div — show the remaining bank fields
          only once the settlement-account question has been answered. For RI the
          question is hidden, so the fields render unconditionally. */}
      {(isRi
        || formData.settlementAccountType === 'yes'
        || formData.settlementAccountType === 'no') && (
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
            <PremiumSelect
              value={formData.accountType ?? ''}
              onChange={(val) => setFormData({ ...formData, accountType: val })}
              // RI: only Savings / Current are valid account types; NRE/NRO options hidden.
              options={showSettlementAccountType
                ? ACCOUNT_TYPE_OPTIONS
                : ACCOUNT_TYPE_OPTIONS.filter(o => o.value !== 'nre' && o.value !== 'nro')}
              error={errors.accountType}
            />
            {errors.accountType && <div className="invalid-feedback">{errors.accountType}</div>}
          </div>

          {/* PIS fields — Laravel shows only for NRE (line 1922); additionally
              gated by the RI visibility rule so the block can never render. */}
          {showPisBlock && formData.accountType === 'nre' && (
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

          <div className="form-group">
            <label>MICR No. <span className="text-danger">*</span></label>
            <input
              value={formData.bankDetailsMicr ?? ''}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 9);
                setFormData({ ...formData, bankDetailsMicr: v });
              }}
              placeholder="Enter 9-digit MICR Number"
              maxLength={9}
              pattern="\d{9}"
              inputMode="numeric"
              className={errors.bankDetailsMicr ? 'form-control is-invalid' : 'form-control'}
            />
            {errors.bankDetailsMicr && <div className="invalid-feedback">{errors.bankDetailsMicr}</div>}
          </div>

          <div className="form-group">
            <label>Country <span className="text-danger">*</span></label>
            <PremiumSelect
              value={formData.bankDetailsCountry ?? 'India'}
              onChange={(val) => setFormData({ ...formData, bankDetailsCountry: val })}
              options={COUNTRY_OPTIONS}
            />
          </div>

          <div className="form-group">
            <label>State <span className="text-danger">*</span></label>
            <PremiumSelect
              value={formData.bankDetailsState ?? ''}
              onChange={(val) => setFormData({ ...formData, bankDetailsState: val })}
              options={STATE_OPTIONS}
              error={errors.bankDetailsState}
            />
            {errors.bankDetailsState && <div className="invalid-feedback">{errors.bankDetailsState}</div>}
          </div>

          <div className="form-group">
            <label>City <span className="text-danger">*</span></label>
            <input
              value={formData.bankDetailsCity ?? ''}
              onChange={(e) => setFormData({ ...formData, bankDetailsCity: e.target.value })}
              className={errors.bankDetailsCity ? 'form-control is-invalid' : 'form-control'}
            />
            {errors.bankDetailsCity && <div className="invalid-feedback">{errors.bankDetailsCity}</div>}
          </div>

          <div className="form-group">
            <label>Postal / Zip code <span className="text-danger">*</span></label>
            <input
              value={formData.bankDetailsZipCode ?? ''}
              onChange={(e) => setFormData({ ...formData, bankDetailsZipCode: e.target.value })}
              className={errors.bankDetailsZipCode ? 'form-control is-invalid' : 'form-control'}
            />
            {errors.bankDetailsZipCode && <div className="invalid-feedback">{errors.bankDetailsZipCode}</div>}
          </div>
        </div>
      )}

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
