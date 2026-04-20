import React, { useState, useEffect } from 'react';
import { profileService, UserPassportDetailsDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validatePassportInformation } from '../../../../utils/investorValidation';
import { normalizeDateForInput } from '../../../../utils/formHelpers';
import { SharedFormContext } from '../shared/types';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';
import { PremiumSelect } from '../../../../components/PremiumSelect/PremiumSelect';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'Aadhaar', label: 'Aadhaar' },
  { value: 'PAN', label: 'PAN' },
  { value: 'Passport', label: 'Passport' },
  { value: 'Voter ID', label: 'Voter ID' },
  { value: 'Driving License', label: 'Driving License' },
  { value: 'OCI Card', label: 'OCI Card' },
];

interface PassportDetailsFormProps {
  initialData: UserPassportDetailsDto | null;
  onSave: () => void;
  canEdit: boolean;
  canSubmit: boolean;
  isProxyMode: boolean;
  sharedContext: SharedFormContext;
}

export const PassportDetailsForm: React.FC<PassportDetailsFormProps> = ({
  initialData,
  onSave,
  canEdit,
  isProxyMode,
  sharedContext
}) => {
  const delegationPerms = useDelegationPermissions();
  const [formData, setFormData] = useState<Partial<UserPassportDetailsDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        passportIssueDate: normalizeDateForInput(initialData.passportIssueDate),
        passportExpiryDate: normalizeDateForInput(initialData.passportExpiryDate),
        passportDateNonResident: normalizeDateForInput(initialData.passportDateNonResident),
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validatePassportInformation(formData as UserPassportDetailsDto);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const payload: UserPassportDetailsDto = {
        ...(formData as UserPassportDetailsDto),
        passportIssueDate: formData.passportIssueDate
          ? normalizeDateForInput(formData.passportIssueDate)
          : undefined,
        passportExpiryDate: formData.passportExpiryDate
          ? normalizeDateForInput(formData.passportExpiryDate)
          : undefined,
        passportDateNonResident: formData.passportDateNonResident
          ? normalizeDateForInput(formData.passportDateNonResident)
          : undefined,
      };
      await profileService.updatePassport(payload);
      toast.success('Passport details updated');
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
      {/* <h3>Proof of Identity</h3> */}
      <div className="investor-profile__grid">
        <div className="form-group">
          <label>Document Type <span className="text-danger">*</span></label>
          <PremiumSelect
            value={(formData as any).documentType ?? ''}
            onChange={(val) => setFormData({ ...formData, documentType: val } as any)}
            options={DOCUMENT_TYPE_OPTIONS}
          />
        </div>

        <div className="form-group">
          <label>Document Number <span className="text-danger">*</span></label>
          <input
            value={formData.passportNumber ?? ''}
            onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
            className={errors.passportNumber ? 'form-control is-invalid' : ''}
          />
          {errors.passportNumber && <div className="invalid-feedback">{errors.passportNumber}</div>}
        </div>

        <div className="form-group">
          <label>Date of Issue <span className="text-danger">*</span></label>
          <input
            type="date"
            value={formData.passportIssueDate ?? ''}
            onChange={(e) => setFormData({ ...formData, passportIssueDate: e.target.value })}
            className={errors.passportIssueDate ? 'form-control is-invalid' : ''}
          />
          {errors.passportIssueDate && <div className="invalid-feedback">{errors.passportIssueDate}</div>}
        </div>

        <div className="form-group">
          <label>Valid upto <span className="text-danger">*</span></label>
          <input
            type="date"
            value={formData.passportExpiryDate ?? ''}
            onChange={(e) => setFormData({ ...formData, passportExpiryDate: e.target.value })}
            className={errors.passportExpiryDate ? 'form-control is-invalid' : ''}
          />
          {errors.passportExpiryDate && <div className="invalid-feedback">{errors.passportExpiryDate}</div>}
        </div>

        <div className="form-group">
          <label>Place of Issue <span className="text-danger">*</span></label>
          <input
            value={formData.passportPlaceOfIssue ?? ''}
            onChange={(e) => setFormData({ ...formData, passportPlaceOfIssue: e.target.value })}
            className={errors.passportPlaceOfIssue ? 'form-control is-invalid' : ''}
          />
          {errors.passportPlaceOfIssue && <div className="invalid-feedback">{errors.passportPlaceOfIssue}</div>}
        </div>

        <div className="form-group">
          <label>Country of Issue <span className="text-danger">*</span></label>
          <input
            value={formData.passportCountryOfIssue ?? ''}
            onChange={(e) => setFormData({ ...formData, passportCountryOfIssue: e.target.value })}
            className={errors.passportCountryOfIssue ? 'form-control is-invalid' : ''}
          />
          {errors.passportCountryOfIssue && <div className="invalid-feedback">{errors.passportCountryOfIssue}</div>}
        </div>

        {/* Additional Laravel Fields */}
        <div className="form-group">
          <label>Nationality <span className="text-danger">*</span></label>
          <input
            value={formData.passportNationality ?? ''}
            onChange={(e) => setFormData({ ...formData, passportNationality: e.target.value })}
            className={errors.passportNationality ? 'form-control is-invalid' : ''}
          />
          {errors.passportNationality && <div className="invalid-feedback">{errors.passportNationality}</div>}
        </div>

        <div className="form-group">
          <label>Date of Becoming Non Resident <span className="text-danger">*</span></label>
          <input
            type="date"
            value={formData.passportDateNonResident ?? ''}
            onChange={(e) => setFormData({ ...formData, passportDateNonResident: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>No of Years Abroad <span className="text-danger">*</span></label>
          <input
            type="number"
            min="0"
            value={formData.passportNoYearsAbroad ?? ''}
            onChange={(e) => setFormData({ ...formData, passportNoYearsAbroad: e.target.value ? parseInt(e.target.value) : undefined })}
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
