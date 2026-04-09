import React, { useState, useEffect } from 'react';
import { profileService, UserContactDetailsDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validateContactDetails } from '../../../../utils/investorValidation';
import { SharedFormContext } from '../shared/types';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';

interface ContactDetailsFormProps {
  initialData: UserContactDetailsDto | null;
  onSave: () => void;
  canEdit: boolean;
  canSubmit: boolean;
  isProxyMode: boolean;
  sharedContext: SharedFormContext;
}

export const ContactDetailsForm: React.FC<ContactDetailsFormProps> = ({
  initialData,
  onSave,
  canEdit,
  isProxyMode,
  sharedContext
}) => {
  const delegationPerms = useDelegationPermissions();
  const [formData, setFormData] = useState<Partial<UserContactDetailsDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateContactDetails(formData as UserContactDetailsDto);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }
    
    setErrors({});
    setSaving(true);
    
    try {
      await profileService.updateContactDetails(formData as UserContactDetailsDto);
      toast.success('Contact details updated');
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
      <h3>Contact Details</h3>
      <div className="investor-profile__grid">
        <div className="form-group">
          <label>Proof of Address <span className="text-danger">*</span></label>
          <select
            value={formData.proofOfAddress ?? ''}
            onChange={(e) => setFormData({ ...formData, proofOfAddress: e.target.value })}
          >
            <option value="">Select</option>
            <option value="Passport">Passport</option>
            <option value="Driving License">Driving License</option>
            <option value="Utility Bill issued within 2 months">Utility Bill issued within 2 months</option>
            <option value="Bank Statement issued within 2 months">Bank Statement issued within 2 months</option>
          </select>
        </div>
        
        <div className="form-group form-group--full">
          <label>Address Line 1 <span className="text-danger">*</span></label>
          <input
            value={formData.addressLine1 ?? ''}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
            className={errors.addressLine1 ? 'form-control is-invalid' : ''}
          />
          {errors.addressLine1 && <div className="invalid-feedback">{errors.addressLine1}</div>}
        </div>

        <div className="form-group form-group--full">
          <label>Address Line 2</label>
          <input
            value={formData.addressLine2 ?? ''}
            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          />
        </div>

        <div className="form-group form-group--full">
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
          <label>Postal/ Zip code <span className="text-danger">*</span></label>
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
          />
        </div>
        
        <div className="form-group form-group--checkbox form-group--full">
          <label>
            <input
              type="checkbox"
              checked={formData.corrAddressSameAsPerm === 'true' || formData.corrAddressSameAsPerm === '1'}
              onChange={(e) => setFormData({ ...formData, corrAddressSameAsPerm: e.target.checked ? 'true' : 'false' })}
            />
            Correspondance Address is Same As Above
          </label>
        </div>

        {/* Correspondence Address - Show only if different from permanent */}
        {!(formData.corrAddressSameAsPerm === 'true' || formData.corrAddressSameAsPerm === '1') && (
          <>
            <div className="form-group">
              <label>Address Type <span className="text-danger">*</span></label>
              <select
                value={formData.addressType ?? ''}
                onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
              >
                <option value="">Select</option>
                <option value="Office">Office</option>
                <option value="Business">Business</option>
                <option value="Residential/Business">Residential/Business</option>
                <option value="Unspecified">Unspecified</option>
              </select>
            </div>
            <div className="form-group form-group--full">
              <label>Address Line 1 <span className="text-danger">*</span></label>
              <input
                value={formData.corrAddressLine1 ?? ''}
                onChange={(e) => setFormData({ ...formData, corrAddressLine1: e.target.value })}
                className={errors.corrAddressLine1 ? 'form-control is-invalid' : ''}
              />
              {errors.corrAddressLine1 && <div className="invalid-feedback">{errors.corrAddressLine1}</div>}
            </div>
            <div className="form-group form-group--full">
              <label>Address Line 2</label>
              <input
                value={formData.corrAddressLine2 ?? ''}
                onChange={(e) => setFormData({ ...formData, corrAddressLine2: e.target.value })}
              />
            </div>
            <div className="form-group form-group--full">
              <label>Address Line 3</label>
              <input
                value={formData.corrAddressLine3 ?? ''}
                onChange={(e) => setFormData({ ...formData, corrAddressLine3: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>City <span className="text-danger">*</span></label>
              <input
                value={formData.corrUserCity ?? ''}
                onChange={(e) => setFormData({ ...formData, corrUserCity: e.target.value })}
                className={errors.corrUserCity ? 'form-control is-invalid' : ''}
              />
              {errors.corrUserCity && <div className="invalid-feedback">{errors.corrUserCity}</div>}
            </div>
            <div className="form-group">
              <label>State <span className="text-danger">*</span></label>
              <input
                value={formData.corrUserState ?? ''}
                onChange={(e) => setFormData({ ...formData, corrUserState: e.target.value })}
                className={errors.corrUserState ? 'form-control is-invalid' : ''}
              />
              {errors.corrUserState && <div className="invalid-feedback">{errors.corrUserState}</div>}
            </div>
            <div className="form-group">
              <label>Postal/ zip code<span className="text-danger">*</span></label>
              <input
                value={formData.corrUserZipCode ?? ''}
                onChange={(e) => setFormData({ ...formData, corrUserZipCode: e.target.value })}
                className={errors.corrUserZipCode ? 'form-control is-invalid' : ''}
              />
              {errors.corrUserZipCode && <div className="invalid-feedback">{errors.corrUserZipCode}</div>}
            </div>
            <div className="form-group">
              <label>Country <span className="text-danger">*</span></label>
              <input
                value={formData.corrUserCountry ?? ''}
                onChange={(e) => setFormData({ ...formData, corrUserCountry: e.target.value })}
                className={errors.corrUserCountry ? 'form-control is-invalid' : ''}
                placeholder="e.g. India"
              />
              {errors.corrUserCountry && <div className="invalid-feedback">{errors.corrUserCountry}</div>}
            </div>
          </>
        )}

        <div className="form-group">
          <label>Email ID <span className="text-danger">*</span></label>
          <input
            type="email"
            value={formData.email ?? ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={errors.email ? 'form-control is-invalid' : ''}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        
        <div className="form-group">
          <label>Country Code <span className="text-danger">*</span></label>
          <input
            value={formData.isdCode ?? ''}
            onChange={(e) => setFormData({ ...formData, isdCode: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label>Phone No <span className="text-danger">*</span></label>
          <input
            type="tel"
            value={formData.primaryPhone ?? ''}
            onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
            className={errors.primaryPhone ? 'form-control is-invalid' : ''}
          />
          {errors.primaryPhone && <div className="invalid-feedback">{errors.primaryPhone}</div>}
        </div>
        
        <div className="form-group">
          <label>Secondary Mobile</label>
          <input
            type="tel"
            value={formData.secondaryPhone ?? ''}
            onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label>WhatsApp Number</label>
          <input
            type="tel"
            value={formData.whatsappNumber ?? ''}
            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label>Preferred Contact Method <span className="text-danger">*</span></label>
          <select
            value={formData.preferredContactMethod ?? ''}
            onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
            className={errors.preferredContactMethod ? 'form-control is-invalid' : ''}
          >
            <option value="">Select</option>
            <option value="email">Email</option>
            <option value="mobile">Mobile</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="landline">Landline</option>
          </select>
          {errors.preferredContactMethod && <div className="invalid-feedback">{errors.preferredContactMethod}</div>}
        </div>
        
        <div className="form-group">
          <label>Preferred Contact Time</label>
          <input
            value={formData.preferredContactTime ?? ''}
            onChange={(e) => setFormData({ ...formData, preferredContactTime: e.target.value })}
            placeholder="e.g., 9 AM - 5 PM"
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
