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

const MultiSelectDropdown: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
  options: readonly string[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}> = ({ value, onChange, options, placeholder = 'Select Options', error, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [disabled]);

  const handleToggle = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((val) => val !== option)
      : [...value, option];
    onChange(newValue);
  };

  const selectedDisplay = value.length > 0 ? value.join(', ') : '';

  return (
    <div
      className={`premium-select-container ${isOpen ? 'is-open' : ''} ${error ? 'is-invalid' : ''} ${disabled ? 'is-disabled' : ''}`}
      ref={dropdownRef}
    >
      <div
        className="premium-select-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ textTransform: 'uppercase' }}
      >
        <span className={`selected-value ${!selectedDisplay ? 'placeholder' : ''}`}>
          {selectedDisplay || placeholder}
        </span>
        <i className={`bi bi-chevron-down arrow-icon ${isOpen ? 'rotate' : ''}`}></i>
      </div>

      {isOpen && (
        <div className="premium-select-dropdown">
          <ul className="premium-select-options" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {options.map((option) => {
              const isSelected = value.includes(option);
              return (
                <li
                  key={option}
                  className={`premium-select-option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleToggle(option)}
                  style={{ textTransform: 'uppercase' }}
                >
                  {option}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

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
          <div className="profile-radio-group">
            <label>
              <input
                type="radio"
                name="polExposed"
                checked={formData.polExposed === true}
                onChange={() => setFormData({ ...formData, polExposed: true })}
                disabled={!canEdit}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="polExposed"
                checked={formData.polExposed !== true}
                onChange={() => setFormData({ ...formData, polExposed: false })}
                disabled={!canEdit}
              /> No
            </label>
          </div>
          {errors.polExposed && <div className="invalid-feedback d-block">{errors.polExposed}</div>}
        </div>

        <div className="form-group">
          <label>Are you related to a politically exposed person? <span className="text-danger">*</span></label>
          <div className="profile-radio-group">
            <label>
              <input
                type="radio"
                name="polExposedRelated"
                checked={formData.polExposedRelated === true}
                onChange={() => setFormData({ ...formData, polExposedRelated: true })}
                disabled={!canEdit}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="polExposedRelated"
                checked={formData.polExposedRelated !== true}
                onChange={() => setFormData({ ...formData, polExposedRelated: false })}
                disabled={!canEdit}
              /> No
            </label>
          </div>
          {errors.polExposedRelated && <div className="invalid-feedback d-block">{errors.polExposedRelated}</div>}
        </div>

        <div className="form-group">
          <label>Are you involved in any of the following activities? <span className="text-danger">*</span></label>
          <div className="profile-radio-group">
            <label>
              <input
                type="radio"
                name="activity"
                checked={formData.activity === true}
                onChange={() => setFormData({ ...formData, activity: true })}
                disabled={!canEdit}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="activity"
                checked={formData.activity !== true}
                onChange={() => setFormData({ ...formData, activity: false })}
                disabled={!canEdit}
              /> No
            </label>
          </div>
          {errors.activity && <div className="invalid-feedback d-block">{errors.activity}</div>}
        </div>

        <div className="form-group">
          <label>Foreign Exchange / Money Changer Services <span className="text-danger">*</span></label>
          <div className="profile-radio-group">
            <label>
              <input
                type="radio"
                name="moneyChangeService"
                checked={formData.moneyChangeService === true}
                onChange={() => setFormData({ ...formData, moneyChangeService: true })}
                disabled={!canEdit}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="moneyChangeService"
                checked={formData.moneyChangeService !== true}
                onChange={() => setFormData({ ...formData, moneyChangeService: false })}
                disabled={!canEdit}
              /> No
            </label>
          </div>
          {errors.moneyChangeService && <div className="invalid-feedback d-block">{errors.moneyChangeService}</div>}
        </div>

        <div className="form-group">
          <label>Gaming / Gambling / Lottery Services <span className="text-danger">*</span></label>
          <div className="profile-radio-group">
            <label>
              <input
                type="radio"
                name="gamblingService"
                checked={formData.gamblingService === true}
                onChange={() => setFormData({ ...formData, gamblingService: true })}
                disabled={!canEdit}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="gamblingService"
                checked={formData.gamblingService !== true}
                onChange={() => setFormData({ ...formData, gamblingService: false })}
                disabled={!canEdit}
              /> No
            </label>
          </div>
          {errors.gamblingService && <div className="invalid-feedback d-block">{errors.gamblingService}</div>}
        </div>

        <div className="form-group">
          <label>Money Lending / Pawning Services <span className="text-danger">*</span></label>
          <div className="profile-radio-group">
            <label>
              <input
                type="radio"
                name="pawningService"
                checked={formData.pawningService === true}
                onChange={() => setFormData({ ...formData, pawningService: true })}
                disabled={!canEdit}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="pawningService"
                checked={formData.pawningService !== true}
                onChange={() => setFormData({ ...formData, pawningService: false })}
                disabled={!canEdit}
              /> No
            </label>
          </div>
          {errors.pawningService && <div className="invalid-feedback d-block">{errors.pawningService}</div>}
        </div>

        <div className="form-group form-group--full">
          <label>Any instance of violation or non-adherence to the securities laws, code of ethics / conduct, code of business rules <span className="text-danger">*</span></label>
          <div className="profile-radio-group">
            <label>
              <input
                type="radio"
                name="instanceViolation"
                checked={formData.instanceViolation === true}
                onChange={() => setFormData({ ...formData, instanceViolation: true })}
                disabled={!canEdit}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="instanceViolation"
                checked={formData.instanceViolation !== true}
                onChange={() => setFormData({ ...formData, instanceViolation: false })}
                disabled={!canEdit}
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
          <MultiSelectDropdown
            value={formData.investmentExperienceIn ?? []}
            onChange={(selected) => setFormData({ ...formData, investmentExperienceIn: selected })}
            options={OTHER_INVESTMENT_EXPERIENCE_IN}
            error={errors.investmentExperienceIn}
            disabled={!canEdit}
          />
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
