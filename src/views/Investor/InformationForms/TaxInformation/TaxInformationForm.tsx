import React, { useState, useEffect } from 'react';
import { profileService, UserTaxInfoDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validateTaxInformation } from '../../../../utils/investorValidation';
import { getTaxResidencyCountrySelectValue } from '../../../../utils/formHelpers';
import { SharedFormContext } from '../shared/types';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';

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
      <h3>Tax Information</h3>
      <div className="investor-profile__grid">
        <div className="form-group">
          <label>PAN Number</label>
          <input
            value={formData.panNumber ?? ''}
            onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
            placeholder="ABCDE1234F"
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
          <select
            id="investor-tax-residency-country"
            value={taxResidencyCountrySelectValue}
            onChange={(e) => {
              const v = e.target.value;
              setFormData({
                ...formData,
                taxResidencyCountry: v || undefined,
                taxResidencyCountryId: v ? Number(v) : undefined,
              });
            }}
            className={errors.taxResidencyCountry ? 'form-control is-invalid' : 'form-control'}
          >
            <option value="">Select country</option>
            {sharedContext.taxResidencyCountries.map((c) => {
              const cid = c.id ?? c.myRowId;
              if (cid == null) return null;
              return (
                <option key={cid} value={String(cid)}>
                  {c.ssName ?? c.ssCountry ?? `Country ${cid}`}
                </option>
              );
            })}
          </select>
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
          <select
            value={formData.taxIdentificationNumberType ?? ''}
            onChange={(e) => setFormData({ ...formData, taxIdentificationNumberType: e.target.value })}
            className={errors.taxIdentificationNumberType ? 'form-control is-invalid' : ''}
          >
            <option value="">Select</option>
            <option value="pan">PAN</option>
            <option value="tan">TAN</option>
            <option value="tin">TIN</option>
            <option value="other">Other</option>
          </select>
          {errors.taxIdentificationNumberType && <div className="invalid-feedback">{errors.taxIdentificationNumberType}</div>}
        </div>
        
        <div className="form-group form-group--full">
          <label>Are you a US Person as defined under FATCA? <span className="text-danger">*</span></label>
          <select
            value={formData.fatcaStatus ?? ''}
            onChange={(e) => setFormData({ ...formData, fatcaStatus: e.target.value })}
            className={errors.fatcaStatus ? 'form-control is-invalid' : 'form-control'}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.fatcaStatus && <div className="invalid-feedback">{errors.fatcaStatus}</div>}
        </div>
        
        <div className="form-group">
          <label>CRS Declaration <span className="text-danger">*</span></label>
          <select
            value={formData.crsDeclaration ?? ''}
            onChange={(e) => setFormData({ ...formData, crsDeclaration: e.target.value })}
            className={errors.crsDeclaration ? 'form-control is-invalid' : ''}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="not-applicable">Not Applicable</option>
          </select>
          {errors.crsDeclaration && <div className="invalid-feedback">{errors.crsDeclaration}</div>}
        </div>
        
        <div className="form-group">
          <label>Tax Residency Status</label>
          <select
            value={formData.taxResidencyStatus ?? ''}
            onChange={(e) => setFormData({ ...formData, taxResidencyStatus: e.target.value })}
          >
            <option value="">Select</option>
            <option value="resident">Resident</option>
            <option value="non-resident">Non-Resident</option>
          </select>
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
        
        <div className="form-group form-group--full">
          <label>Annual Income Range</label>
          <select
            value={formData.annualIncome ?? ''}
            onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
          >
            <option value="">Select</option>
            <option value="below-5lakh">Below ₹5 Lakh</option>
            <option value="5-10lakh">₹5-10 Lakh</option>
            <option value="10-25lakh">₹10-25 Lakh</option>
            <option value="25-50lakh">₹25-50 Lakh</option>
            <option value="50lakh-1cr">₹50 Lakh - 1 Crore</option>
            <option value="above-1cr">Above ₹1 Crore</option>
          </select>
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
