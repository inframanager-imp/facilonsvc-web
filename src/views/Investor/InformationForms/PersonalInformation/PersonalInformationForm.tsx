import React, { useState, useEffect } from 'react';
import { profileService, UserPersonalInformationDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validatePersonalInformation } from '../../../../utils/investorValidation';
import { normalizeDateForInput, normalizeCountryOfResidenceForForm } from '../../../../utils/formHelpers';
import { SharedFormContext } from '../shared/types';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';
import { PremiumSelect } from '../../../../components/PremiumSelect/PremiumSelect';
import { isResidentIndividual } from '../../../../config/profileVisibility';

const TITLE_OPTIONS = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' },
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Transgender', label: 'Transgender' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: '1', label: 'Single' },
  { value: '2', label: 'Married' },
  { value: '3', label: 'Widowed' },
  { value: '5', label: 'Seperated' },
  { value: '4', label: 'Divorced' },
];

const MAIDEN_TITLE_OPTIONS = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Miss', label: 'Miss' },
];

const FATHER_TITLE_OPTIONS = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Shri', label: 'Shri' },
  { value: 'Late', label: 'Late' },
];

const MOTHER_TITLE_OPTIONS = [
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Shrimati', label: 'Shrimati' },
  { value: 'Late', label: 'Late' },
];

const SPOUSE_TITLE_OPTIONS = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Miss', label: 'Miss' },
];

interface PersonalInformationFormProps {
  initialData: UserPersonalInformationDto | null;
  onSave: () => void;
  canEdit: boolean;
  canSubmit: boolean;
  isProxyMode: boolean;
  sharedContext: SharedFormContext;
}

export const PersonalInformationForm: React.FC<PersonalInformationFormProps> = ({
  initialData,
  onSave,
  canEdit,
  isProxyMode,
  sharedContext
}) => {
  const delegationPerms = useDelegationPermissions();
  const [formData, setFormData] = useState<Partial<UserPersonalInformationDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Per-type profile rules. RI tightens the maiden-name visibility to
  // Female + Married (vs the default Female OR Married used elsewhere) and
  // pre-fills Citizenship / Country of Residence to India so the hidden-for-
  // RI inputs don't submit blanks.
  const investorType = sharedContext.dashboardData?.investor?.investorType ?? undefined;
  const isRi = isResidentIndividual(investorType);

  useEffect(() => {
    if (initialData) {
      const hydrated: Partial<UserPersonalInformationDto> = {
        ...initialData,
        userDob: normalizeDateForInput(initialData.userDob),
        countryOfResidence: normalizeCountryOfResidenceForForm(initialData.countryOfResidence),
      };
      if (isRi) {
        if (!hydrated.citizenship) hydrated.citizenship = 'India';
        if (!hydrated.countryOfResidence) hydrated.countryOfResidence = 'India';
      }
      setFormData(hydrated);
    }
  }, [initialData, isRi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validatePersonalInformation(formData as UserPersonalInformationDto);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await profileService.updatePersonalInfo(formData as UserPersonalInformationDto);
      toast.success('Personal information updated');
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
      {/* Personal Information */}
      <div className="form-group form-group--full">
        <h3 style={{ marginBottom: '10px' }}>Personal Information</h3>
      </div>
      <div className="investor-profile__grid">
        <div className="form-group">
          <label>Title <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.nameTitle ?? ''}
            onChange={(val) => setFormData({ ...formData, nameTitle: val })}
            options={TITLE_OPTIONS}
            error={errors.nameTitle}
          />
          {errors.nameTitle && <div className="invalid-feedback">{errors.nameTitle}</div>}
        </div>
        <div className="form-group">
          <label>First Name <span className="text-danger">*</span></label>
          <input
            value={formData.investorFirstName ?? ''}
            onChange={(e) => setFormData({ ...formData, investorFirstName: e.target.value })}
            className={errors.investorFirstName ? 'form-control is-invalid' : ''}
          />
          {errors.investorFirstName && <div className="invalid-feedback">{errors.investorFirstName}</div>}
        </div>

        <div className="form-group">
          <label>Middle Name</label>
          <input
            value={formData.investorMiddleName ?? ''}
            onChange={(e) => setFormData({ ...formData, investorMiddleName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Last Name <span className="text-danger">*</span></label>
          <input
            value={formData.investorLastName ?? ''}
            onChange={(e) => setFormData({ ...formData, investorLastName: e.target.value })}
            className={errors.investorLastName ? 'form-control is-invalid' : ''}
          />
          {errors.investorLastName && <div className="invalid-feedback">{errors.investorLastName}</div>}
        </div>

        <div className="form-group">
          <label>Date Of Birth <span className="text-danger">*</span></label>
          <input
            type="date"
            value={formData.userDob ?? ''}
            onChange={(e) => setFormData({ ...formData, userDob: e.target.value })}
            className={errors.userDob ? 'form-control is-invalid' : ''}
          />
          {errors.userDob && <div className="invalid-feedback">{errors.userDob}</div>}
        </div>

        <div className="form-group">
          <label>Gender <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.gender ?? ''}
            onChange={(val) => setFormData({ ...formData, gender: val })}
            options={GENDER_OPTIONS}
            error={errors.gender}
          />
          {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
        </div>

        <div className="form-group">
          <label>Marital Status <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.maritalStatus ?? ''}
            onChange={(val) => setFormData({ ...formData, maritalStatus: val })}
            options={MARITAL_STATUS_OPTIONS}
            error={errors.maritalStatus}
          />
          {errors.maritalStatus && <div className="invalid-feedback">{errors.maritalStatus}</div>}
        </div>

        {/* Maiden Name — default rule is Female OR Married; RI tightens to
            Female AND Married per the RI profile-visibility matrix. */}
        {(isRi
          ? formData.gender === 'Female' && formData.maritalStatus === '2'
          : formData.gender === 'Female' || formData.maritalStatus === '2') && (
          <>
            {/* Maiden Name (if applicable) */}
            <div className="form-group form-group--full">
              <h3 style={{ marginTop: '1.5rem' }}>Maiden Name (if applicable)</h3>
            </div>
            <div className="form-group">
              <label>Title <span className="text-danger">*</span></label>
              <PremiumSelect
                value={formData.maidenTitle ?? ''}
                onChange={(val) => setFormData({ ...formData, maidenTitle: val })}
                options={MAIDEN_TITLE_OPTIONS}
              />
            </div>
            <div className="form-group">
              <label>Maiden First Name <span className="text-danger">*</span></label>
              <input
                value={formData.maidenName ?? ''}
                onChange={(e) => setFormData({ ...formData, maidenName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Maiden Middle Name</label>
              <input
                value={formData.maidenMiddleName ?? ''}
                onChange={(e) => setFormData({ ...formData, maidenMiddleName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Maiden Last Name <span className="text-danger">*</span></label>
              <input
                value={formData.maidenLastName ?? ''}
                onChange={(e) => setFormData({ ...formData, maidenLastName: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>City Of Birth <span className="text-danger">*</span></label>
          <input
            value={formData.cityOfDob ?? ''}
            onChange={(e) => setFormData({ ...formData, cityOfDob: e.target.value })}
            className={errors.cityOfDob ? 'form-control is-invalid' : ''}
          />
          {errors.cityOfDob && <div className="invalid-feedback">{errors.cityOfDob}</div>}
        </div>

        <div className="form-group">
          <label>Country Of Birth <span className="text-danger">*</span></label>
          <input
            value={formData.countryDob ?? ''}
            onChange={(e) => setFormData({ ...formData, countryDob: e.target.value })}
            className={errors.countryDob ? 'form-control is-invalid' : ''}
          />
          {errors.countryDob && <div className="invalid-feedback">{errors.countryDob}</div>}
        </div>

        <div className="form-group">
          <label>Citizenship <span className="text-danger">*</span></label>
          <input
            value={formData.citizenship ?? ''}
            onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
            className={errors.citizenship ? 'form-control is-invalid' : ''}
            placeholder="e.g. Indian"
          />
          {errors.citizenship && <div className="invalid-feedback">{errors.citizenship}</div>}
        </div>

        <div className="form-group">
          <label>Country of Residence <span className="text-danger">*</span></label>
          <input
            value={formData.countryOfResidence ?? ''}
            onChange={(e) => setFormData({ ...formData, countryOfResidence: e.target.value })}
            className={errors.countryOfResidence ? 'form-control is-invalid' : ''}
            placeholder="e.g. India"
          />
          {errors.countryOfResidence && <div className="invalid-feedback">{errors.countryOfResidence}</div>}
        </div>

        <div className="form-group">
          <label>PAN Number <span className="text-danger">*</span></label>
          <input
            value={formData.panNumber ?? ''}
            onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
          />
        </div>

        {/* Father's Details */}
        <div className="form-group form-group--full">
          <h3 style={{ marginTop: '1.5rem' }}>Father's Details</h3>
        </div>
        <div className="form-group">
          <label>Title</label>
          <PremiumSelect
            value={formData.fatherNameTitle ?? ''}
            onChange={(val) => setFormData({ ...formData, fatherNameTitle: val })}
            options={FATHER_TITLE_OPTIONS}
          />
        </div>
        <div className="form-group">
          <label>Father's First Name <span className="text-danger">*</span></label>
          <input
            value={formData.fathersFirstName ?? ''}
            onChange={(e) => setFormData({ ...formData, fathersFirstName: e.target.value })}
            className={errors.fathersFirstName ? 'form-control is-invalid' : ''}
          />
          {errors.fathersFirstName && <div className="invalid-feedback">{errors.fathersFirstName}</div>}
        </div>
        <div className="form-group">
          <label>Father's Middle Name</label>
          <input
            value={formData.fathersMiddleName ?? ''}
            onChange={(e) => setFormData({ ...formData, fathersMiddleName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Father's Last Name <span className="text-danger">*</span></label>
          <input
            value={formData.fathersLastName ?? ''}
            onChange={(e) => setFormData({ ...formData, fathersLastName: e.target.value })}
            className={errors.fathersLastName ? 'form-control is-invalid' : ''}
          />
          {errors.fathersLastName && <div className="invalid-feedback">{errors.fathersLastName}</div>}
        </div>

        {/* Mother's Details */}
        <div className="form-group form-group--full">
          <h3 style={{ marginTop: '1.5rem' }}>Mother's Details</h3>
        </div>
        <div className="form-group">
          <label>Title</label>
          <PremiumSelect
            value={formData.motherNameTitle ?? ''}
            onChange={(val) => setFormData({ ...formData, motherNameTitle: val })}
            options={MOTHER_TITLE_OPTIONS}
          />
        </div>
        <div className="form-group">
          <label>Mother's First Name <span className="text-danger">*</span></label>
          <input
            value={formData.motherFirstName ?? ''}
            onChange={(e) => setFormData({ ...formData, motherFirstName: e.target.value })}
            className={errors.motherFirstName ? 'form-control is-invalid' : ''}
          />
          {errors.motherFirstName && <div className="invalid-feedback">{errors.motherFirstName}</div>}
        </div>
        <div className="form-group">
          <label>Mother's Middle Name</label>
          <input
            value={formData.motherMiddleName ?? ''}
            onChange={(e) => setFormData({ ...formData, motherMiddleName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Mother's Last Name <span className="text-danger">*</span></label>
          <input
            value={formData.motherLastName ?? ''}
            onChange={(e) => setFormData({ ...formData, motherLastName: e.target.value })}
            className={errors.motherLastName ? 'form-control is-invalid' : ''}
          />
          {errors.motherLastName && <div className="invalid-feedback">{errors.motherLastName}</div>}
        </div>

        {/* Spouse Details - Show only if married */}
        {formData.maritalStatus === '2' && (
          <>
            {/* Spouse Details */}
            <div className="form-group form-group--full">
              <h3 style={{ marginTop: '1.5rem' }}>Spouse Details</h3>
            </div>
            <div className="form-group">
              <label>Title</label>
              <PremiumSelect
                value={formData.spouseNameTitle ?? ''}
                onChange={(val) => setFormData({ ...formData, spouseNameTitle: val })}
                options={SPOUSE_TITLE_OPTIONS}
              />
            </div>
            <div className="form-group">
              <label>Spouse First Name</label>
              <input
                value={formData.spouseName ?? ''}
                onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Spouse Middle Name</label>
              <input
                value={formData.spouseMiddleName ?? ''}
                onChange={(e) => setFormData({ ...formData, spouseMiddleName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Spouse Last Name</label>
              <input
                value={formData.spouseLastName ?? ''}
                onChange={(e) => setFormData({ ...formData, spouseLastName: e.target.value })}
              />
            </div>
            <div className="form-group form-group--full">
              <label>Spouse Maiden Name</label>
              <input
                value={formData.spouseMaidenName ?? ''}
                onChange={(e) => setFormData({ ...formData, spouseMaidenName: e.target.value })}
              />
            </div>
          </>
        )}

        {/* Address */}
        <div className="form-group form-group--full">
          <h3 style={{ marginTop: '1.5rem' }}>Address</h3>
        </div>
        <div className="form-group">
          <label>Address Line 1 <span className="text-danger">*</span></label>
          <input
            value={formData.addressLine1 ?? ''}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
            className={errors.addressLine1 ? 'form-control is-invalid' : ''}
          />
          {errors.addressLine1 && <div className="invalid-feedback">{errors.addressLine1}</div>}
        </div>
        <div className="form-group">
          <label>Address Line 2</label>
          <input
            value={formData.addressLine2 ?? ''}
            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Address Line 3</label>
          <input
            value={formData.addressLine3 ?? ''}
            onChange={(e) => setFormData({ ...formData, addressLine3: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>City <span className="text-danger">*</span></label>
          <input
            value={formData.userCity ?? ''}
            onChange={(e) => setFormData({ ...formData, userCity: e.target.value })}
            className={errors.userCity ? 'form-control is-invalid' : ''}
          />
          {errors.userCity && <div className="invalid-feedback">{errors.userCity}</div>}
        </div>
        <div className="form-group">
          <label>State <span className="text-danger">*</span></label>
          <input
            value={formData.userState ?? ''}
            onChange={(e) => setFormData({ ...formData, userState: e.target.value })}
            className={errors.userState ? 'form-control is-invalid' : ''}
          />
          {errors.userState && <div className="invalid-feedback">{errors.userState}</div>}
        </div>
        <div className="form-group">
          <label>ZIP / Postal Code <span className="text-danger">*</span></label>
          <input
            value={formData.userZipCode ?? ''}
            onChange={(e) => setFormData({ ...formData, userZipCode: e.target.value })}
            className={errors.userZipCode ? 'form-control is-invalid' : ''}
          />
          {errors.userZipCode && <div className="invalid-feedback">{errors.userZipCode}</div>}
        </div>
        <div className="form-group">
          <label>Country <span className="text-danger">*</span></label>
          <input
            value={formData.userCountry ?? ''}
            onChange={(e) => setFormData({ ...formData, userCountry: e.target.value })}
            placeholder="e.g. India"
            className={errors.userCountry ? 'form-control is-invalid' : ''}
          />
          {errors.userCountry && <div className="invalid-feedback">{errors.userCountry}</div>}
        </div>
      </div>

      <button type="submit" className="btn-save mt-3" disabled={saving || !canEdit}>
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
