import React, { useState, useEffect } from 'react';
import { profileService, UserNominationDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validateNominationDetails } from '../../../../utils/investorValidation';
import { isShareFilled, updateNomineeShare1, updateNomineeShare2 } from '../../../../utils/formHelpers';
import { SharedFormContext } from '../shared/types';
import { NOMINATION_RELATIONSHIP_OPTIONS, NOMINATION_DOC_TYPE_OPTIONS } from '../shared/constants';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';

interface NominationFormProps {
  initialData: UserNominationDto | null;
  onSave: () => void;
  canEdit: boolean;
  canSubmit: boolean;
  isProxyMode: boolean;
  sharedContext: SharedFormContext;
}

export const NominationForm: React.FC<NominationFormProps> = ({
  initialData,
  onSave,
  canEdit,
  isProxyMode,
  sharedContext
}) => {
  const delegationPerms = useDelegationPermissions();
  const [formData, setFormData] = useState<Partial<UserNominationDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const showNominee2Section = isShareFilled(formData.nomineeShare1) && (formData.nomineeShare1 ?? 0) < 100;
  const showNominee3Section = isShareFilled(formData.nomineeShare2) &&
    (formData.nomineeShare1 ?? 0) + (formData.nomineeShare2 ?? 0) < 100;

  const updateNomineeShare1FromInput = (val: string) => {
    updateNomineeShare1(val, formData, setFormData);
  };

  const updateNomineeShare2FromInput = (val: string) => {
    updateNomineeShare2(val, formData, setFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateNominationDetails(formData as UserNominationDto);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }
    
    setErrors({});
    setSaving(true);
    
    try {
      await profileService.updateNomination(formData as UserNominationDto);
      toast.success('Nomination details updated');
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
      <h3>Nomination Details</h3>
      <div className="form-group form-group--full" style={{ marginBottom: '1rem' }}>
        <span className="d-block mb-1">Do you wish to register nomination? <span className="text-danger">*</span></span>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <label className="mb-0">
            <input
              type="radio"
              name="appointNominee"
              checked={formData.appointNominee === true}
              onChange={() => setFormData({ ...formData, appointNominee: true })}
            />{' '}
            Yes
          </label>
          <label className="mb-0">
            <input
              type="radio"
              name="appointNominee"
              checked={formData.appointNominee === false}
              onChange={() => setFormData({ ...formData, appointNominee: false })}
            />{' '}
            No
          </label>
        </div>
      </div>
      {errors.totalShare && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
          {errors.totalShare}
        </div>
      )}
      {formData.appointNominee === true && (
      <div className="investor-profile__grid">
        {/* Nominee 1 */}
        <div className="form-group form-group--full">
          <h4 style={{ margin: '0.25rem 0 0.5rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '0.35rem' }}>
            Nominee 1
          </h4>
        </div>
        <div className="form-group">
          <label>Name of the Nominee <span className="text-danger">*</span></label>
          <input
            value={formData.nomineeName1 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeName1: e.target.value })}
            className={errors.nomineeName1 ? 'form-control is-invalid' : 'form-control'}
          />
          {errors.nomineeName1 && <div className="invalid-feedback">{errors.nomineeName1}</div>}
        </div>
        <div className="form-group">
          <label>Nominee Middle Name</label>
          <input
            className="form-control"
            value={formData.nomineeMiddleName ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeMiddleName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Nominee Last Name</label>
          <input
            className="form-control"
            value={formData.nomineeLastName ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeLastName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Relationship with Applicant <span className="text-danger">*</span></label>
          <select
            value={formData.nomineeRelation1 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeRelation1: e.target.value })}
            className={errors.nomineeRelation1 ? 'form-control is-invalid' : 'form-control'}
          >
            {NOMINATION_RELATIONSHIP_OPTIONS.map((o) => (
              <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.nomineeRelation1 && <div className="invalid-feedback">{errors.nomineeRelation1}</div>}
        </div>
        <div className="form-group">
          <label>Date of Birth of Nominee <span className="text-danger">*</span></label>
          <input
            type="date"
            value={formData.nomineeDob1 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeDob1: e.target.value })}
            className={errors.nomineeDob1 ? 'form-control is-invalid' : 'form-control'}
          />
          {errors.nomineeDob1 && <div className="invalid-feedback">{errors.nomineeDob1}</div>}
        </div>
        <div className="form-group">
          <label>Email Address of Nominee</label>
          <input
            type="email"
            className="form-control"
            value={formData.nomineeEmail1 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeEmail1: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>ISD Code</label>
          <select
            value={formData.nomineeCountrycode1 ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                nomineeCountrycode1: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="form-control"
          >
            <option value="">Select ISD</option>
            {sharedContext.isdCodes.map((c) => {
              const cid = c.id ?? c.myRowId;
              if (cid == null) return null;
              return (
                <option key={cid} value={cid}>
                  {c.countryName ?? c.nationality ?? '—'}
                  {c.codeValue != null ? ` (+${c.codeValue})` : ''}
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-group">
          <label>Mobile Number of Nominee</label>
          <input
            type="tel"
            className="form-control"
            value={formData.nomineeMobile1 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeMobile1: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Nominee Document Type</label>
          <select
            value={formData.nomineeDocType1 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeDocType1: e.target.value })}
            className="form-control"
          >
            {NOMINATION_DOC_TYPE_OPTIONS.map((o) => (
              <option key={`d1-${o.value || 'x'}`} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Document Number</label>
          <input
            className="form-control"
            value={formData.nomineeDocNo1 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeDocNo1: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Nominee Share (%) <span className="text-danger">*</span></label>
          <input
            type="number"
            min={1}
            max={100}
            value={formData.nomineeShare1 ?? ''}
            onChange={(e) => updateNomineeShare1FromInput(e.target.value)}
            className={errors.nomineeShare1 ? 'form-control is-invalid' : 'form-control'}
          />
          {errors.nomineeShare1 && <div className="invalid-feedback">{errors.nomineeShare1}</div>}
        </div>
        <div className="form-group form-group--full">
          <label>Nominee Address</label>
          <input
            className="form-control"
            value={formData.nomineeAddress1 ?? formData.nomineeAddress ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeAddress1: e.target.value, nomineeAddress: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            className="form-control"
            value={formData.nomineeCity1 ?? formData.nomineeCity ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeCity1: e.target.value, nomineeCity: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>State</label>
          <input
            className="form-control"
            value={formData.nomineeState1 ?? formData.nomineeState ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeState1: e.target.value, nomineeState: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Country</label>
          <input
            className="form-control"
            value={formData.nomineeCountry1 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeCountry1: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Pincode</label>
          <input
            className="form-control"
            value={formData.nomineePincode1 ?? formData.nomineePostalCode ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineePincode1: e.target.value, nomineePostalCode: e.target.value })}
          />
        </div>

        {/* Nominee 2 - Show only if nominee 1 share is less than 100% */}
        {showNominee2Section && (
        <>
        <div className="form-group form-group--full">
          <h4 style={{ margin: '1rem 0 0.5rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '0.35rem' }}>
            Nominee 2
          </h4>
        </div>
        <div className="form-group">
          <label>Name of Nominee 2</label>
          <input
            className="form-control"
            value={formData.nomineeName2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeName2: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Relationship</label>
          <select
            className={errors.nomineeRelation2 ? 'form-control is-invalid' : 'form-control'}
            value={formData.nomineeRelation2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeRelation2: e.target.value })}
          >
            {NOMINATION_RELATIONSHIP_OPTIONS.map((o) => (
              <option key={`n2-${o.value || 'empty'}`} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.nomineeRelation2 && <div className="invalid-feedback">{errors.nomineeRelation2}</div>}
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            className={errors.nomineeDob2 ? 'form-control is-invalid' : 'form-control'}
            value={formData.nomineeDob2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeDob2: e.target.value })}
          />
          {errors.nomineeDob2 && <div className="invalid-feedback">{errors.nomineeDob2}</div>}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={formData.nomineeEmail2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeEmail2: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>ISD</label>
          <select
            className="form-control"
            value={formData.nomineeCountrycode2 ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                nomineeCountrycode2: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          >
            <option value="">Select ISD</option>
            {sharedContext.isdCodes.map((c) => {
              const cid = c.id ?? c.myRowId;
              if (cid == null) return null;
              return (
                <option key={`n2isd-${cid}`} value={cid}>
                  {c.countryName ?? c.nationality ?? '—'}
                  {c.codeValue != null ? ` (+${c.codeValue})` : ''}
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-group">
          <label>Mobile</label>
          <input
            type="tel"
            className="form-control"
            value={formData.nomineeMobile2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeMobile2: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Document Type</label>
          <select
            className="form-control"
            value={formData.nomineeDocType2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeDocType2: e.target.value })}
          >
            {NOMINATION_DOC_TYPE_OPTIONS.map((o) => (
              <option key={`d2-${o.value || 'x'}`} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Document Number</label>
          <input
            className="form-control"
            value={formData.nomineeDocNo2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeDocNo2: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Share (%)</label>
          <input
            type="number"
            min={1}
            max={100}
            className={errors.nomineeShare2 ? 'form-control is-invalid' : 'form-control'}
            value={formData.nomineeShare2 ?? ''}
            onChange={(e) => updateNomineeShare2FromInput(e.target.value)}
          />
          {errors.nomineeShare2 && <div className="invalid-feedback">{errors.nomineeShare2}</div>}
        </div>
        <div className="form-group form-group--full">
          <label>Nominee 2 Address</label>
          <input
            className="form-control"
            value={formData.nomineeAddress2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeAddress2: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            className="form-control"
            value={formData.nomineeCity2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeCity2: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>State</label>
          <input
            className="form-control"
            value={formData.nomineeState2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeState2: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Country</label>
          <input
            className="form-control"
            value={formData.nomineeCountry2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeCountry2: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Pincode</label>
          <input
            className="form-control"
            value={formData.nomineePincode2 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineePincode2: e.target.value })}
          />
        </div>
        </>
        )}

        {/* Nominee 3 - Show only if nominee 1 + 2 shares are less than 100% */}
        {showNominee3Section && (
        <>
        <div className="form-group form-group--full">
          <h4 style={{ margin: '1rem 0 0.5rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '0.35rem' }}>
            Nominee 3
          </h4>
        </div>
        <div className="form-group">
          <label>Name of Nominee 3</label>
          <input
            className="form-control"
            value={formData.nomineeName3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeName3: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Relationship</label>
          <select
            className={errors.nomineeRelation3 ? 'form-control is-invalid' : 'form-control'}
            value={formData.nomineeRelation3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeRelation3: e.target.value })}
          >
            {NOMINATION_RELATIONSHIP_OPTIONS.map((o) => (
              <option key={`n3-${o.value || 'empty'}`} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.nomineeRelation3 && <div className="invalid-feedback">{errors.nomineeRelation3}</div>}
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            className={errors.nomineeDob3 ? 'form-control is-invalid' : 'form-control'}
            value={formData.nomineeDob3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeDob3: e.target.value })}
          />
          {errors.nomineeDob3 && <div className="invalid-feedback">{errors.nomineeDob3}</div>}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={formData.nomineeEmail3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeEmail3: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>ISD</label>
          <select
            className="form-control"
            value={formData.nomineeCountrycode3 ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                nomineeCountrycode3: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          >
            <option value="">Select ISD</option>
            {sharedContext.isdCodes.map((c) => {
              const cid = c.id ?? c.myRowId;
              if (cid == null) return null;
              return (
                <option key={`n3isd-${cid}`} value={cid}>
                  {c.countryName ?? c.nationality ?? '—'}
                  {c.codeValue != null ? ` (+${c.codeValue})` : ''}
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-group">
          <label>Mobile</label>
          <input
            type="tel"
            className="form-control"
            value={formData.nomineeMobile3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeMobile3: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Document Type</label>
          <select
            className="form-control"
            value={formData.nomineeDocType3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeDocType3: e.target.value })}
          >
            {NOMINATION_DOC_TYPE_OPTIONS.map((o) => (
              <option key={`d3-${o.value || 'x'}`} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Document Number</label>
          <input
            className="form-control"
            value={formData.nomineeDocNo3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeDocNo3: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Share (%)</label>
          <input
            type="number"
            min={1}
            max={100}
            className={errors.nomineeShare3 ? 'form-control is-invalid' : 'form-control'}
            value={formData.nomineeShare3 ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                nomineeShare3: e.target.value ? Number.parseInt(e.target.value, 10) : undefined,
              })
            }
          />
          {errors.nomineeShare3 && <div className="invalid-feedback">{errors.nomineeShare3}</div>}
        </div>
        <div className="form-group form-group--full">
          <label>Nominee 3 Address</label>
          <input
            className="form-control"
            value={formData.nomineeAddress3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeAddress3: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            className="form-control"
            value={formData.nomineeCity3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeCity3: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>State</label>
          <input
            className="form-control"
            value={formData.nomineeState3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeState3: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Country</label>
          <input
            className="form-control"
            value={formData.nomineeCountry3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineeCountry3: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Pincode</label>
          <input
            className="form-control"
            value={formData.nomineePincode3 ?? ''}
            onChange={(e) => setFormData({ ...formData, nomineePincode3: e.target.value })}
          />
        </div>
        </>
        )}

        {/* Guardian Details - Show if nominee is a minor */}
        <div className="form-group form-group--checkbox">
          <label>
            <input
              type="checkbox"
              checked={formData.isMinor ?? false}
              onChange={(e) => setFormData({ ...formData, isMinor: e.target.checked })}
            />
            Nominee is a Minor
          </label>
        </div>
        {formData.isMinor && (
          <>
            <div className="form-group form-group--full">
              <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#333' }}>Guardian Details (Nominee 1)</h4>
            </div>
            <div className="form-group">
              <label>Name of Guardian <span className="text-danger">*</span></label>
              <input
                className={errors.guardianName1 ? 'form-control is-invalid' : 'form-control'}
                value={formData.guardianName1 ?? ''}
                onChange={(e) => setFormData({ ...formData, guardianName1: e.target.value })}
              />
              {errors.guardianName1 && <div className="invalid-feedback">{errors.guardianName1}</div>}
            </div>
            <div className="form-group">
              <label>Relationship of Guardian to Nominee <span className="text-danger">*</span></label>
              <select
                className={errors.guardianRelationship ? 'form-control is-invalid' : 'form-control'}
                value={formData.guardianRelationship ?? ''}
                onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value })}
              >
                {NOMINATION_RELATIONSHIP_OPTIONS.map((o) => (
                  <option key={`gr-${o.value || 'empty'}`} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.guardianRelationship && <div className="invalid-feedback">{errors.guardianRelationship}</div>}
            </div>
            <div className="form-group">
              <label>Guardian Identification Document Type</label>
              <select
                className="form-control"
                value={formData.guardianDocType1 ?? ''}
                onChange={(e) => setFormData({ ...formData, guardianDocType1: e.target.value })}
              >
                {NOMINATION_DOC_TYPE_OPTIONS.map((o) => (
                  <option key={`gdt-${o.value || 'x'}`} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Document Number</label>
              <input
                className="form-control"
                value={formData.guardianDocNo1 ?? ''}
                onChange={(e) => setFormData({ ...formData, guardianDocNo1: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>ISD Code</label>
              <select
                className="form-control"
                value={formData.guardianCountrycode1 ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    guardianCountrycode1: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">Select ISD</option>
                {sharedContext.isdCodes.map((c) => {
                  const cid = c.id ?? c.myRowId;
                  if (cid == null) return null;
                  return (
                    <option key={`gisd-${cid}`} value={cid}>
                      {c.countryName ?? c.nationality ?? '—'}
                      {c.codeValue != null ? ` (+${c.codeValue})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input
                type="tel"
                className="form-control"
                value={formData.guardianMobile1 ?? ''}
                onChange={(e) => setFormData({ ...formData, guardianMobile1: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Guardian Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.guardianEmail1 ?? ''}
                onChange={(e) => setFormData({ ...formData, guardianEmail1: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Guardian Date of Birth</label>
              <input
                type="date"
                className="form-control"
                value={formData.guardianDob1 ?? ''}
                onChange={(e) => setFormData({ ...formData, guardianDob1: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Guardian PAN</label>
              <input
                className="form-control"
                value={formData.guardianPanNo1 ?? ''}
                onChange={(e) => setFormData({ ...formData, guardianPanNo1: e.target.value })}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </div>

            {/* Guardian 2 (if nominee 2 is also a minor) */}
            {showNominee2Section && (
              <>
                <div className="form-group form-group--full">
                  <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#333' }}>Guardian Details (Nominee 2)</h4>
                </div>
                <div className="form-group">
                  <label>Name of Guardian</label>
                  <input
                    className="form-control"
                    value={formData.guardianName2 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianName2: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Guardian Document Type</label>
                  <select
                    className="form-control"
                    value={formData.guardianDocType2 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianDocType2: e.target.value })}
                  >
                    {NOMINATION_DOC_TYPE_OPTIONS.map((o) => (
                      <option key={`g2dt-${o.value || 'x'}`} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Document Number</label>
                  <input
                    className="form-control"
                    value={formData.guardianDocNo2 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianDocNo2: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>ISD Code</label>
                  <select
                    className="form-control"
                    value={formData.guardianCountrycode2 ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardianCountrycode2: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  >
                    <option value="">Select ISD</option>
                    {sharedContext.isdCodes.map((c) => {
                      const cid = c.id ?? c.myRowId;
                      if (cid == null) return null;
                      return (
                        <option key={`g2isd-${cid}`} value={cid}>
                          {c.countryName ?? c.nationality ?? '—'}
                          {c.codeValue != null ? ` (+${c.codeValue})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.guardianMobile2 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianMobile2: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.guardianEmail2 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianEmail2: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.guardianDob2 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianDob2: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>PAN</label>
                  <input
                    className="form-control"
                    value={formData.guardianPanNo2 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianPanNo2: e.target.value })}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
              </>
            )}

            {/* Guardian 3 (if nominee 3 is also a minor) */}
            {showNominee3Section && (
              <>
                <div className="form-group form-group--full">
                  <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#333' }}>Guardian Details (Nominee 3)</h4>
                </div>
                <div className="form-group">
                  <label>Name of Guardian</label>
                  <input
                    className="form-control"
                    value={formData.guardianName3 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianName3: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Guardian Document Type</label>
                  <select
                    className="form-control"
                    value={formData.guardianDocType3 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianDocType3: e.target.value })}
                  >
                    {NOMINATION_DOC_TYPE_OPTIONS.map((o) => (
                      <option key={`g3dt-${o.value || 'x'}`} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Document Number</label>
                  <input
                    className="form-control"
                    value={formData.guardianDocNo3 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianDocNo3: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>ISD Code</label>
                  <select
                    className="form-control"
                    value={formData.guardianCountrycode3 ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardianCountrycode3: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  >
                    <option value="">Select ISD</option>
                    {sharedContext.isdCodes.map((c) => {
                      const cid = c.id ?? c.myRowId;
                      if (cid == null) return null;
                      return (
                        <option key={`g3isd-${cid}`} value={cid}>
                          {c.countryName ?? c.nationality ?? '—'}
                          {c.codeValue != null ? ` (+${c.codeValue})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.guardianMobile3 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianMobile3: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.guardianEmail3 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianEmail3: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.guardianDob3 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianDob3: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>PAN</label>
                  <input
                    className="form-control"
                    value={formData.guardianPanNo3 ?? ''}
                    onChange={(e) => setFormData({ ...formData, guardianPanNo3: e.target.value })}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
              </>
            )}
          </>
        )}
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
