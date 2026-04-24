import React, { useState, useEffect } from 'react';
import { profileService, UserResidentialStatusDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validateResidentialStatus } from '../../../../utils/investorValidation';
import { SharedFormContext } from '../shared/types';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';
import { PremiumSelect } from '../../../../components/PremiumSelect/PremiumSelect';
import { isResidentIndividual } from '../../../../config/profileVisibility';

const RESIDENTIAL_STATUS_OPTIONS = [
  { value: 'Resident Indian', label: 'Resident Indian' },
  { value: 'NRI', label: 'NRI' },
  { value: 'OCI', label: 'OCI' },
  { value: 'PIO', label: 'PIO' },
  { value: 'Foreign National', label: 'Foreign National' },
];

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const PROOF_OF_ADDRESS_OPTIONS = [
  { value: 'Passport', label: 'Passport' },
  { value: 'Driving License', label: 'Driving License' },
  { value: 'Aadhaar', label: 'Aadhaar' },
  { value: 'Voter ID', label: 'Voter ID' },
  { value: 'Utility Bill issued within 2 months', label: 'Utility Bill (within 2 months)' },
  { value: 'Bank Statement', label: 'Bank Statement' },
];

const TYPE_OF_PROOF_OPTIONS = [
  { value: 'Visa', label: 'Visa' },
  { value: 'Resident Proof', label: 'Resident Card' },
];

/** RI-only validation: Aadhaar Number is required and must be 12 digits. */
function validateRiAadhaar(formData: Partial<UserResidentialStatusDto>): Record<string, string> {
  const errors: Record<string, string> = {};
  const aadhaar = (formData.aadharNumber ?? '').replace(/\s+/g, '');
  if (!aadhaar) {
    errors.aadharNumber = 'Aadhaar Number is required.';
  } else if (!/^\d{12}$/.test(aadhaar)) {
    errors.aadharNumber = 'Aadhaar Number must be 12 digits.';
  }
  return errors;
}

interface ResidentialStatusFormProps {
  initialData: UserResidentialStatusDto | null;
  onSave: () => void;
  canEdit: boolean;
  canSubmit: boolean;
  isProxyMode: boolean;
  sharedContext: SharedFormContext;
}

export const ResidentialStatusForm: React.FC<ResidentialStatusFormProps> = ({
  initialData,
  onSave,
  canEdit,
  isProxyMode,
  sharedContext
}) => {
  const delegationPerms = useDelegationPermissions();
  const [formData, setFormData] = useState<Partial<UserResidentialStatusDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // RI renames this tab to "Aadhaar Details" and hides everything except
  // Aadhaar Number and Name on Aadhaar. Residential-status value is stamped
  // to "Resident Indian" server-side on save.
  const investorType = sharedContext.dashboardData?.investor?.investorType ?? undefined;
  const isRi = isResidentIndividual(investorType);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // RI bypasses the full residential-status validation because most of the
    // fields it checks (Residential Status dropdown, proof type, visa details)
    // are hidden and default-stamped server-side.
    const newErrors = isRi
      ? validateRiAadhaar(formData)
      : validateResidentialStatus(formData as UserResidentialStatusDto);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await profileService.updateResidentialStatus(formData as UserResidentialStatusDto);
      toast.success('Residential status updated');
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

  if (isRi) {
    // RI Aadhaar Details — minimal form. Residential status, proof of
    // address, OCI fields and visa block are all hidden; the backend stamps
    // residentialStatus = "Resident Indian" on save.
    return (
      <form className="investor-profile__card" onSubmit={handleSubmit}>
        <div className="investor-profile__grid">
          <div className="form-group">
            <label>Aadhaar Number<span className="text-danger">*</span></label>
            <input
              type="text"
              maxLength={12}
              className={errors.aadharNumber ? 'form-control is-invalid' : 'form-control'}
              value={formData.aadharNumber ?? ''}
              onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
              placeholder="12-digit Aadhaar number"
            />
            {errors.aadharNumber && <div className="invalid-feedback">{errors.aadharNumber}</div>}
          </div>
          <div className="form-group">
            <label>Name on Aadhaar</label>
            <input
              type="text"
              className="form-control"
              value={formData.nameOnAadhaar ?? ''}
              onChange={(e) => setFormData({ ...formData, nameOnAadhaar: e.target.value })}
              placeholder="Name as printed on your Aadhaar card"
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
  }

  return (
    <form className="investor-profile__card" onSubmit={handleSubmit}>
      {/* <h3>Residential Status &amp; Proof of Address</h3> */}
      <div className="investor-profile__grid">

        {/* Residential Status selector */}
        <div className="form-group">
          <label>Residential Status<span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.residentialStatus ?? ''}
            onChange={(val) => setFormData({ ...formData, residentialStatus: val })}
            options={RESIDENTIAL_STATUS_OPTIONS}
            error={errors.residentialStatus}
          />
          {errors.residentialStatus && <div className="invalid-feedback">{errors.residentialStatus}</div>}
        </div>

        {/* Person of Indian Origin */}
        <div className="form-group">
          <label>Person of Indian Origin</label>
          <PremiumSelect
            value={formData.personOrigin ?? ''}
            onChange={(val) => setFormData({ ...formData, personOrigin: val })}
            options={YES_NO_OPTIONS}
          />
        </div>

        {/* Proof of Address */}
        <div className="form-group">
          <label>Proof of Address<span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.proofOfAddress ?? ''}
            onChange={(val) => setFormData({ ...formData, proofOfAddress: val })}
            options={PROOF_OF_ADDRESS_OPTIONS}
            error={errors.proofOfAddress}
          />
          {errors.proofOfAddress && <div className="invalid-feedback">{errors.proofOfAddress}</div>}
        </div>

        {/* Aadhaar availability */}
        <div className="form-group">
          <label>Do you have an Aadhaar?</label>
          <PremiumSelect
            value={formData.aadharNumberOption ?? ''}
            onChange={(val) => setFormData({ ...formData, aadharNumberOption: val })}
            options={YES_NO_OPTIONS}
          />
        </div>

        {/* Aadhaar number (shown if aadharNumberOption = yes) */}
        {formData.aadharNumberOption === 'yes' && (
          <>
            <div className="form-group">
              <label>Aadhaar Number<span className="text-danger">*</span></label>
              <input
                type="text"
                maxLength={12}
                className={errors.aadharNumber ? 'form-control is-invalid' : 'form-control'}
                value={formData.aadharNumber ?? ''}
                onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
              />
              {errors.aadharNumber && <div className="invalid-feedback">{errors.aadharNumber}</div>}
            </div>
            <div className="form-group">
              <label>User Aadhaar No</label>
              <input
                type="text"
                maxLength={12}
                className="form-control"
                value={formData.userAadharNo ?? ''}
                onChange={(e) => setFormData({ ...formData, userAadharNo: e.target.value })}
              />
            </div>
          </>
        )}

        {/* OCI availability */}
        <div className="form-group">
          <label>Do you have OCI?</label>
          <PremiumSelect
            value={formData.ociAvailable ?? ''}
            onChange={(val) => setFormData({ ...formData, ociAvailable: val })}
            options={YES_NO_OPTIONS}
          />
        </div>

        {/* Date of OCI (shown if ociAvailable = yes) */}
        {formData.ociAvailable === 'yes' && (
          <div className="form-group">
            <label>Date of OCI</label>
            <input
              type="date"
              className="form-control"
              value={formData.dateOfOci ?? ''}
              onChange={(e) => setFormData({ ...formData, dateOfOci: e.target.value })}
            />
          </div>
        )}

        {/* OCI Fields - For NRI Investors */}
        <div className="form-group">
          <label>OCI Card No<span className="text-danger">*</span></label>
          <input
            type="text"
            className={errors.userOciCardNo ? 'form-control is-invalid' : 'form-control'}
            value={formData.userOciCardNo ?? ''}
            onChange={(e) => setFormData({ ...formData, userOciCardNo: e.target.value })}
          />
          {errors.userOciCardNo && <div className="invalid-feedback">{errors.userOciCardNo}</div>}
        </div>

        <div className="form-group">
          <label>Issue Date<span className="text-danger">*</span></label>
          <input
            type="date"
            className={errors.userOciIssueDate ? 'form-control is-invalid' : 'form-control'}
            value={formData.userOciIssueDate ?? ''}
            onChange={(e) => setFormData({ ...formData, userOciIssueDate: e.target.value })}
          />
          {errors.userOciIssueDate && <div className="invalid-feedback">{errors.userOciIssueDate}</div>}
        </div>

        <div className="form-group">
          <label>Valid Upto</label>
          <input
            type="date"
            className="form-control"
            value={formData.userOciValidUpto ?? ''}
            onChange={(e) => setFormData({ ...formData, userOciValidUpto: e.target.value })}
          />
        </div>

        {/* Type of Proof - For Foreign Nationals */}
        <div className="form-group">
          <label>Type of Proof<span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.userTypeOfProof ?? ''}
            onChange={(val) => setFormData({ ...formData, userTypeOfProof: val })}
            options={TYPE_OF_PROOF_OPTIONS}
            error={errors.userTypeOfProof}
          />
          {errors.userTypeOfProof && <div className="invalid-feedback">{errors.userTypeOfProof}</div>}
        </div>

        {/* Visa Fields - Shown when Type of Proof = "Visa" */}
        {formData.userTypeOfProof === 'Visa' && (
          <>
            <div className="form-group">
              <label>Visa Types<span className="text-danger">*</span></label>
              <input
                type="text"
                className={errors.userVisaType ? 'form-control is-invalid' : 'form-control'}
                value={formData.userVisaType ?? ''}
                onChange={(e) => setFormData({ ...formData, userVisaType: e.target.value })}
              />
              {errors.userVisaType && <div className="invalid-feedback">{errors.userVisaType}</div>}
            </div>

            <div className="form-group">
              <label>Visa Number<span className="text-danger">*</span></label>
              <input
                type="text"
                className={errors.userVisaNumber ? 'form-control is-invalid' : 'form-control'}
                value={formData.userVisaNumber ?? ''}
                onChange={(e) => setFormData({ ...formData, userVisaNumber: e.target.value })}
              />
              {errors.userVisaNumber && <div className="invalid-feedback">{errors.userVisaNumber}</div>}
            </div>

            <div className="form-group">
              <label>Visa Issuer Date<span className="text-danger">*</span></label>
              <input
                type="date"
                className={errors.userVisaIssuerDate ? 'form-control is-invalid' : 'form-control'}
                value={formData.userVisaIssuerDate ?? ''}
                onChange={(e) => setFormData({ ...formData, userVisaIssuerDate: e.target.value })}
              />
              {errors.userVisaIssuerDate && <div className="invalid-feedback">{errors.userVisaIssuerDate}</div>}
            </div>

            <div className="form-group">
              <label>Visa Expiry Date<span className="text-danger">*</span></label>
              <input
                type="date"
                className={errors.userVisaExpiryDate ? 'form-control is-invalid' : 'form-control'}
                value={formData.userVisaExpiryDate ?? ''}
                onChange={(e) => setFormData({ ...formData, userVisaExpiryDate: e.target.value })}
              />
              {errors.userVisaExpiryDate && <div className="invalid-feedback">{errors.userVisaExpiryDate}</div>}
            </div>
          </>
        )}

        {/* Resident Card Fields - Shown when Type of Proof = "Resident Proof" */}
        {formData.userTypeOfProof === 'Resident Proof' && (
          <>
            <div className="form-group">
              <label>Date Of Issue<span className="text-danger">*</span></label>
              <input
                type="date"
                className={errors.userVisaDateOfIssue ? 'form-control is-invalid' : 'form-control'}
                value={formData.userVisaDateOfIssue ?? ''}
                onChange={(e) => setFormData({ ...formData, userVisaDateOfIssue: e.target.value })}
              />
              {errors.userVisaDateOfIssue && <div className="invalid-feedback">{errors.userVisaDateOfIssue}</div>}
            </div>

            <div className="form-group">
              <label>Valid Upto</label>
              <input
                type="date"
                className="form-control"
                value={formData.userVisaValidUpto ?? ''}
                onChange={(e) => setFormData({ ...formData, userVisaValidUpto: e.target.value })}
              />
            </div>
          </>
        )}
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
