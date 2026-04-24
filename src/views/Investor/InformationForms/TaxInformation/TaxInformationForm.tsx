import React, { useState, useEffect } from 'react';
import { profileService, UserTaxInfoDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validateTaxInformation } from '../../../../utils/investorValidation';
import { getTaxResidencyCountrySelectValue } from '../../../../utils/formHelpers';
import { SharedFormContext } from '../shared/types';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';
import { PremiumSelect } from '../../../../components/PremiumSelect/PremiumSelect';

// Dropdown values are UPPERCASE — see convention in shared/constants.ts.
const YES_NO_OPTIONS = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
];

const TIN_TYPE_OPTIONS = [
  { value: 'PAN', label: 'PAN' },
  { value: 'TAN', label: 'TAN' },
  { value: 'TIN', label: 'TIN' },
  { value: 'OTHER', label: 'Other' },
];

const CRS_DECLARATION_OPTIONS = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
  { value: 'NOT-APPLICABLE', label: 'Not Applicable' },
];

const RESIDENCY_STATUS_OPTIONS = [
  { value: 'RESIDENT', label: 'Resident' },
  { value: 'NON-RESIDENT', label: 'Non-Resident' },
];

const ANNUAL_INCOME_OPTIONS = [
  { value: 'BELOW-5LAKH', label: 'Below ₹5 Lakh' },
  { value: '5-10LAKH', label: '₹5-10 Lakh' },
  { value: '10-25LAKH', label: '₹10-25 Lakh' },
  { value: '25-50LAKH', label: '₹25-50 Lakh' },
  { value: '50LAKH-1CR', label: '₹50 Lakh - 1 Crore' },
  { value: 'ABOVE-1CR', label: 'Above ₹1 Crore' },
];

interface TaxInformationFormProps {
  initialData: UserTaxInfoDto | null;
  onSave: () => void;
  canEdit: boolean;
  canSubmit: boolean;
  isProxyMode: boolean;
  sharedContext: SharedFormContext;
}

export const TaxInformationForm: React.FC<TaxInformationFormProps> = ({
  initialData,
  onSave,
  canEdit,
  isProxyMode,
  sharedContext
}) => {
  const delegationPerms = useDelegationPermissions();
  const [formData, setFormData] = useState<Partial<UserTaxInfoDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map form fields to DTO for validation
    const validationData = {
      ...formData,
      tinNumber: formData.taxIdNumber,
      taxIdentificationNumberType: formData.taxIdentificationNumberType,
      fatcaStatus: formData.fatcaStatus,
      crsDeclaration: formData.crsDeclaration,
    };

    const newErrors = validateTaxInformation(validationData as UserTaxInfoDto);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const trimmedCountry =
        formData.taxResidencyCountry !== undefined && formData.taxResidencyCountry !== null
          ? String(formData.taxResidencyCountry).trim()
          : '';
      const payload: any = {
        ...formData,
        tinNumber: formData.taxIdNumber,
        taxResidencyCountry: trimmedCountry || undefined,
        taxIdentificationNumberType: formData.taxIdentificationNumberType,
        fatcaStatus: formData.fatcaStatus,
        crsDeclaration: formData.crsDeclaration,
      };
      await profileService.updateTaxInfo(payload);
      toast.success('Tax information updated');
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

  const taxResidencyCountrySelectValue = getTaxResidencyCountrySelectValue(formData);

  return (
    <form className="investor-profile__card" onSubmit={handleSubmit}>
      {/* <h3>Tax Information</h3> */}
      <div className="investor-profile__grid">
        <div className="form-group">
          <label>Tax Info</label>
          <PremiumSelect
            value={formData.taxInfo ?? ''}
            onChange={(val) => setFormData({ ...formData, taxInfo: val })}
            options={YES_NO_OPTIONS}
          />
        </div>

        <div className="form-group">
          <label>Are you a US Person (FATCA)?</label>
          <PremiumSelect
            value={formData.usPersonFatca ?? ''}
            onChange={(val) => setFormData({ ...formData, usPersonFatca: val })}
            options={YES_NO_OPTIONS}
          />
        </div>

        <div className="form-group">
          <label>PAN Number</label>
          <input
            value={formData.panNumber ?? ''}
            onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
            placeholder="ABCDE1234F"
          />
        </div>

        <div className="form-group">
          <label>Tax PAN No</label>
          <input
            value={formData.taxPanNo ?? ''}
            onChange={(e) => setFormData({ ...formData, taxPanNo: e.target.value })}
            placeholder="Tax PAN (if different)"
          />
        </div>

        <div className="form-group">
          <label>Name as per PAN Card</label>
          <input
            value={formData.taxPanFirstName ?? ''}
            onChange={(e) => setFormData({ ...formData, taxPanFirstName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Father name as per PAN Card</label>
          <input
            value={formData.taxPanFatherName ?? ''}
            onChange={(e) => setFormData({ ...formData, taxPanFatherName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="investor-tax-residency-country">
            Current Country of Residence for TAX <span className="text-danger">*</span>
          </label>
          <PremiumSelect
            id="investor-tax-residency-country"
            value={taxResidencyCountrySelectValue}
            onChange={(val) => {
              setFormData({
                ...formData,
                taxResidencyCountry: val || undefined,
                taxResidencyCountryId: val ? Number(val) : undefined,
              });
            }}
            options={sharedContext.taxResidencyCountries.map((c) => ({
              value: String(c.id ?? c.myRowId ?? ''),
              label: c.ssName ?? c.ssCountry ?? `Country ${c.id}`
            }))}
            error={errors.taxResidencyCountry}
            placeholder="Select country"
          />
          {errors.taxResidencyCountry && <div className="invalid-feedback">{errors.taxResidencyCountry}</div>}
        </div>

        <div className="form-group">
          <label>Taxpayer Identification Number in the country <span className="text-danger">*</span></label>
          <input
            value={formData.taxIdNumber ?? ''}
            onChange={(e) => setFormData({ ...formData, taxIdNumber: e.target.value })}
            className={errors.tinNumber ? 'form-control is-invalid' : ''}
          />
          {errors.tinNumber && <div className="invalid-feedback">{errors.tinNumber}</div>}
        </div>

        <div className="form-group">
          <label>Taxpayer Identification Number type <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.taxIdentificationNumberType ?? ''}
            onChange={(val) => setFormData({ ...formData, taxIdentificationNumberType: val })}
            options={TIN_TYPE_OPTIONS}
            error={errors.taxIdentificationNumberType}
          />
          {errors.taxIdentificationNumberType && <div className="invalid-feedback">{errors.taxIdentificationNumberType}</div>}
        </div>

        <div className="form-group">
          <label>Are you a US Person as defined under FATCA? <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.fatcaStatus ?? ''}
            onChange={(val) => setFormData({ ...formData, fatcaStatus: val })}
            options={YES_NO_OPTIONS}
            error={errors.fatcaStatus}
          />
          {errors.fatcaStatus && <div className="invalid-feedback">{errors.fatcaStatus}</div>}
        </div>

        <div className="form-group">
          <label>CRS Declaration <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.crsDeclaration ?? ''}
            onChange={(val) => setFormData({ ...formData, crsDeclaration: val })}
            options={CRS_DECLARATION_OPTIONS}
            error={errors.crsDeclaration}
          />
          {errors.crsDeclaration && <div className="invalid-feedback">{errors.crsDeclaration}</div>}
        </div>

        <div className="form-group">
          <label>Tax Residency Status</label>
          <PremiumSelect
            value={formData.taxResidencyStatus ?? ''}
            onChange={(val) => setFormData({ ...formData, taxResidencyStatus: val })}
            options={RESIDENCY_STATUS_OPTIONS}
          />
        </div>

        <div className="form-group">
          <label>GST Number</label>
          <input
            value={formData.gstNumber ?? ''}
            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Income Source</label>
          <input
            value={formData.incomeSource ?? ''}
            onChange={(e) => setFormData({ ...formData, incomeSource: e.target.value })}
            placeholder="e.g., Salary, Business, Investment"
          />
        </div>

        <div className="form-group">
          <label>Tax Residency Certificate Number (If Available)</label>
          <input
            value={formData.taxResidencyCertificateNo ?? ''}
            onChange={(e) => setFormData({ ...formData, taxResidencyCertificateNo: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Tax Residency Certificate Date</label>
          <input
            type="date"
            value={formData.taxResidencyCertificateDate ?? ''}
            onChange={(e) => setFormData({ ...formData, taxResidencyCertificateDate: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Annual Income Range</label>
          <PremiumSelect
            value={formData.annualIncome ?? ''}
            onChange={(val) => setFormData({ ...formData, annualIncome: val })}
            options={ANNUAL_INCOME_OPTIONS}
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
