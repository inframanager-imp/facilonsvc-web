import React, { useState, useEffect } from 'react';
import { profileService, UserResidentialStatusDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validateResidentialStatus } from '../../../../utils/investorValidation';
import { SharedFormContext } from '../shared/types';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';

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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateResidentialStatus(formData as UserResidentialStatusDto);
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

  return (
    <form className="investor-profile__card" onSubmit={handleSubmit}>
      <h3>Residential Status &amp; Proof of Address</h3>
      <div className="investor-profile__grid">

        {/* Residential Status selector */}
        <div className="form-group">
          <label>Residential Status<span className="text-danger">*</span></label>
          <select
            className={errors.residentialStatus ? 'form-control is-invalid' : 'form-control'}
            value={formData.residentialStatus ?? ''}
            onChange={(e) => setFormData({ ...formData, residentialStatus: e.target.value })}
          >
            <option value="">Select</option>
            <option value="Resident Indian">Resident Indian</option>
            <option value="NRI">NRI</option>
            <option value="OCI">OCI</option>
            <option value="PIO">PIO</option>
            <option value="Foreign National">Foreign National</option>
          </select>
          {errors.residentialStatus && <div className="invalid-feedback">{errors.residentialStatus}</div>}
        </div>

        {/* Person of Indian Origin */}
        <div className="form-group">
          <label>Person of Indian Origin</label>
          <select
            className="form-control"
            value={formData.personOrigin ?? ''}
            onChange={(e) => setFormData({ ...formData, personOrigin: e.target.value })}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* Proof of Address */}
        <div className="form-group">
          <label>Proof of Address<span className="text-danger">*</span></label>
          <select
            className={errors.proofOfAddress ? 'form-control is-invalid' : 'form-control'}
            value={formData.proofOfAddress ?? ''}
            onChange={(e) => setFormData({ ...formData, proofOfAddress: e.target.value })}
          >
            <option value="">Select</option>
            <option value="Passport">Passport</option>
            <option value="Driving License">Driving License</option>
            <option value="Aadhaar">Aadhaar</option>
            <option value="Voter ID">Voter ID</option>
            <option value="Utility Bill issued within 2 months">Utility Bill (within 2 months)</option>
            <option value="Bank Statement">Bank Statement</option>
          </select>
          {errors.proofOfAddress && <div className="invalid-feedback">{errors.proofOfAddress}</div>}
        </div>

        {/* Aadhaar availability */}
        <div className="form-group">
          <label>Do you have an Aadhaar?</label>
          <select
            className="form-control"
            value={formData.aadharNumberOption ?? ''}
            onChange={(e) => setFormData({ ...formData, aadharNumberOption: e.target.value })}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
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
          <select
            className="form-control"
            value={formData.ociAvailable ?? ''}
            onChange={(e) => setFormData({ ...formData, ociAvailable: e.target.value })}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
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
          <select
            className={errors.userTypeOfProof ? 'form-control is-invalid' : 'form-control'}
            value={formData.userTypeOfProof ?? ''}
            onChange={(e) => setFormData({ ...formData, userTypeOfProof: e.target.value })}
          >
            <option value="">Select</option>
            <option value="Visa">Visa</option>
            <option value="Resident Proof">Resident Card</option>
          </select>
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
