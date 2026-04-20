import React, { useState, useEffect } from 'react';
import { profileService, InvestorExperienceDto } from '../../../../services/profile.service';
import { toast } from 'react-toastify';
import { validateRiskProfile } from '../../../../utils/investorValidation';
import { SharedFormContext } from '../shared/types';
import {
  OTHER_SOURCE_OF_FUNDS_OPTIONS,
  OTHER_EDUCATION_OPTIONS,
  OTHER_GROSS_INCOME_OPTIONS,
  OTHER_NET_WORTH_OPTIONS,
  OTHER_OCCUPATION_OPTIONS,
  OTHER_INVESTMENT_EXPERIENCE_YEARS_OPTIONS,
  OTHER_INVESTMENT_EXPERIENCE_IN
} from '../shared/constants';
import { useDelegationPermissions } from '../../../../contexts/DelegationPermissionsContext';
import { getPermissionErrorMessage } from '../../../../utils/apiClient';
import { PremiumSelect } from '../../../../components/PremiumSelect/PremiumSelect';

interface RiskProfileFormProps {
  initialData: InvestorExperienceDto | null;
  onSave: () => void;
  canEdit: boolean;
  canSubmit: boolean;
  isProxyMode: boolean;
  sharedContext: SharedFormContext;
}

export const RiskProfileForm: React.FC<RiskProfileFormProps> = ({
  initialData,
  onSave,
  canEdit,
  isProxyMode,
  sharedContext
}) => {
  const delegationPerms = useDelegationPermissions();
  const [formData, setFormData] = useState<Partial<InvestorExperienceDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateRiskProfile(formData as InvestorExperienceDto);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await profileService.updateExperience(formData as InvestorExperienceDto);
      toast.success('Risk profile updated');
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
      {/* <h3>Other Information</h3> */}
      <div className="investor-profile__grid">
        <div className="form-group">
          <label>Source of Funds <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.sourceOfFunds ?? ''}
            onChange={(val) => setFormData({ ...formData, sourceOfFunds: val })}
            options={OTHER_SOURCE_OF_FUNDS_OPTIONS}
            error={errors.sourceOfFunds}
          />
          {errors.sourceOfFunds && <div className="invalid-feedback">{errors.sourceOfFunds}</div>}
        </div>

        <div className="form-group">
          <label>Source of Wealth</label>
          <input
            className="form-control"
            value={formData.sourceOfWealth ?? ''}
            onChange={(e) => setFormData({ ...formData, sourceOfWealth: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Education Qualification <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.educationalQualification ?? ''}
            onChange={(val) => setFormData({ ...formData, educationalQualification: val })}
            options={OTHER_EDUCATION_OPTIONS}
            error={errors.educationalQualification}
          />
          {errors.educationalQualification && <div className="invalid-feedback">{errors.educationalQualification}</div>}
        </div>

        <div className="form-group">
          <label>Gross Annual Income (In INR) <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.grossIncome ?? ''}
            onChange={(val) => setFormData({ ...formData, grossIncome: val })}
            options={OTHER_GROSS_INCOME_OPTIONS}
            error={errors.grossIncome}
          />
          {errors.grossIncome && <div className="invalid-feedback">{errors.grossIncome}</div>}
        </div>

        <div className="form-group">
          <label>Net Worth <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.netWorth ?? ''}
            onChange={(val) => setFormData({ ...formData, netWorth: val })}
            options={OTHER_NET_WORTH_OPTIONS}
            error={errors.netWorth}
          />
          {errors.netWorth && <div className="invalid-feedback">{errors.netWorth}</div>}
        </div>

        <div className="form-group">
          <label>Occupation <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.occupation ?? ''}
            onChange={(val) => setFormData({ ...formData, occupation: val })}
            options={OTHER_OCCUPATION_OPTIONS}
            error={errors.occupation}
          />
          {errors.occupation && <div className="invalid-feedback">{errors.occupation}</div>}
        </div>

        <div className="form-group">
          <label>Line of Business / Industry</label>
          <input
            className="form-control"
            value={formData.lineOfBusiness ?? ''}
            onChange={(e) => setFormData({ ...formData, lineOfBusiness: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Name of Organisation</label>
          <input
            className="form-control"
            value={formData.natureOfOrganisation ?? ''}
            onChange={(e) => setFormData({ ...formData, natureOfOrganisation: e.target.value })}
          />
        </div>
      </div>

      <div className="investor-profile__grid" style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label>Are you a politically exposed person? <span className="text-danger">*</span></label>
          <div>
            <label style={{ marginRight: '1rem' }}>
              <input
                type="radio"
                name="polExposed"
                checked={formData.polExposed === true}
                onChange={() => setFormData({ ...formData, polExposed: true })}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="polExposed"
                checked={formData.polExposed !== true}
                onChange={() => setFormData({ ...formData, polExposed: false })}
              /> No
            </label>
          </div>
          {errors.polExposed && <div className="invalid-feedback d-block">{errors.polExposed}</div>}
        </div>

        <div className="form-group">
          <label>Are you related to a politically exposed person? <span className="text-danger">*</span></label>
          <div>
            <label style={{ marginRight: '1rem' }}>
              <input
                type="radio"
                name="polExposedRelated"
                checked={formData.polExposedRelated === true}
                onChange={() => setFormData({ ...formData, polExposedRelated: true })}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="polExposedRelated"
                checked={formData.polExposedRelated !== true}
                onChange={() => setFormData({ ...formData, polExposedRelated: false })}
              /> No
            </label>
          </div>
          {errors.polExposedRelated && <div className="invalid-feedback d-block">{errors.polExposedRelated}</div>}
        </div>

        <div className="form-group">
          <label>Are you involved in any of the following activities? <span className="text-danger">*</span></label>
          <div>
            <label style={{ marginRight: '1rem' }}>
              <input
                type="radio"
                name="activity"
                checked={formData.activity === true}
                onChange={() => setFormData({ ...formData, activity: true })}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="activity"
                checked={formData.activity !== true}
                onChange={() => setFormData({ ...formData, activity: false })}
              /> No
            </label>
          </div>
          {errors.activity && <div className="invalid-feedback d-block">{errors.activity}</div>}
        </div>

        <div className="form-group">
          <label>Foreign Exchange / Money Changer Services <span className="text-danger">*</span></label>
          <div>
            <label style={{ marginRight: '1rem' }}>
              <input
                type="radio"
                name="moneyChangeService"
                checked={formData.moneyChangeService === true}
                onChange={() => setFormData({ ...formData, moneyChangeService: true })}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="moneyChangeService"
                checked={formData.moneyChangeService !== true}
                onChange={() => setFormData({ ...formData, moneyChangeService: false })}
              /> No
            </label>
          </div>
          {errors.moneyChangeService && <div className="invalid-feedback d-block">{errors.moneyChangeService}</div>}
        </div>

        <div className="form-group">
          <label>Gaming / Gambling / Lottery Services <span className="text-danger">*</span></label>
          <div>
            <label style={{ marginRight: '1rem' }}>
              <input
                type="radio"
                name="gamblingService"
                checked={formData.gamblingService === true}
                onChange={() => setFormData({ ...formData, gamblingService: true })}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="gamblingService"
                checked={formData.gamblingService !== true}
                onChange={() => setFormData({ ...formData, gamblingService: false })}
              /> No
            </label>
          </div>
          {errors.gamblingService && <div className="invalid-feedback d-block">{errors.gamblingService}</div>}
        </div>

        <div className="form-group">
          <label>Money Lending / Pawning Services <span className="text-danger">*</span></label>
          <div>
            <label style={{ marginRight: '1rem' }}>
              <input
                type="radio"
                name="pawningService"
                checked={formData.pawningService === true}
                onChange={() => setFormData({ ...formData, pawningService: true })}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="pawningService"
                checked={formData.pawningService !== true}
                onChange={() => setFormData({ ...formData, pawningService: false })}
              /> No
            </label>
          </div>
          {errors.pawningService && <div className="invalid-feedback d-block">{errors.pawningService}</div>}
        </div>

        <div className="form-group form-group--full">
          <label>Any instance of violation or non-adherence to the securities laws, code of ethics / conduct, code of business rules <span className="text-danger">*</span></label>
          <div>
            <label style={{ marginRight: '1rem' }}>
              <input
                type="radio"
                name="instanceViolation"
                checked={formData.instanceViolation === true}
                onChange={() => setFormData({ ...formData, instanceViolation: true })}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="instanceViolation"
                checked={formData.instanceViolation !== true}
                onChange={() => setFormData({ ...formData, instanceViolation: false })}
              /> No
            </label>
          </div>
          {errors.instanceViolation && <div className="invalid-feedback d-block">{errors.instanceViolation}</div>}
        </div>

        <div className="form-group">
          <label>No of Years of Investment Experience <span className="text-danger">*</span></label>
          <PremiumSelect
            value={formData.investmentExperienceYears ?? ''}
            onChange={(val) =>
              setFormData({
                ...formData,
                investmentExperienceYears: val || undefined,
                yearsOfInvestmentExperience: undefined,
              })
            }
            options={OTHER_INVESTMENT_EXPERIENCE_YEARS_OPTIONS}
            error={errors.investmentExperienceYears}
          />
          {errors.investmentExperienceYears && <div className="invalid-feedback">{errors.investmentExperienceYears}</div>}
        </div>

        <div className="form-group form-group--full">
          <label htmlFor="investment_experience_in">Investment Experience in <span className="text-danger">*</span></label>
          <select
            id="investment_experience_in"
            multiple
            size={OTHER_INVESTMENT_EXPERIENCE_IN.length}
            value={formData.investmentExperienceIn ?? []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (o) => o.value);
              setFormData({ ...formData, investmentExperienceIn: selected });
            }}
            className={errors.investmentExperienceIn ? 'form-control is-invalid investor-profile__multiselect' : 'form-control investor-profile__multiselect'}
          >
            {OTHER_INVESTMENT_EXPERIENCE_IN.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.investmentExperienceIn && <div className="invalid-feedback d-block">{errors.investmentExperienceIn}</div>}
        </div>
      </div>

      <button type="submit" className="btn-save" disabled={saving || !canEdit}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      {!canEdit && delegationPerms.isProxyMode && (
        <small className="text-warning d-block mt-2">
          You don't have permission to edit this information. Contact the investor to update delegation permissions.
        </small>
      )}
    </form>
  );
};
