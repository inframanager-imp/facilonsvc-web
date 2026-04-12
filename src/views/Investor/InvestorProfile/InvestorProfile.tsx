import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, InvestorConsentsDto, InvestorExperienceDto, UserPersonalInformationDto, UserPassportDetailsDto, UserResidentialStatusDto, UserTaxInfoDto, UserBankDetailsDto, UserContactDetailsDto, UserNominationDto, UserRiskProfileDto, ChangePasswordDto } from '../../../services/profile.service';
import { pdfService } from '../../../services/pdf.service';
import { investorService, InvestorDashboardDto } from '../../../services/investor.service';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { OnboardingProgress } from '../InvestorDashboard/OnboardingProgress';
import './InvestorProfile.scss';
import {
  validatePersonalInformation,
  validatePassportInformation,
  validateResidentialStatus,
  validateTaxInformation,
  validateBankDetails,
  validateContactDetails,
  validateNominationDetails,
  validateRiskProfile
} from '../../../utils/investorValidation';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import { contentService, type MasterCountryDto, type IsdCodeValuesDto } from '../../../services/content.service';
import { getPermissionErrorMessage } from '../../../utils/apiClient';
import { useDelegationPermissions } from '../../../contexts/DelegationPermissionsContext';

/** Nomination: relationship & document options (aligned with Laravel / investor nomination forms). */
const NOMINATION_RELATIONSHIP_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

const NOMINATION_DOC_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'PAN', label: 'PAN' },
  { value: 'Aadhaar', label: 'Aadhaar' },
  { value: 'Passport', label: 'Passport' },
  { value: 'Driving License', label: 'Driving License' },
  { value: 'Voter ID', label: 'Voter ID' },
  { value: 'OCI Card', label: 'OCI Card' },
  { value: 'other', label: 'Other' },
];

/** Aligned with `information-update.blade.php` Section8 (Other Information). */
const OTHER_SOURCE_OF_FUNDS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'Salary', label: 'Salary' },
  { value: 'Business Income', label: 'Business Income' },
  { value: 'Investment Income', label: 'Investment Income' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Others', label: 'Others' },
];

const OTHER_EDUCATION_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'Under Graduate', label: 'Under-Graduate' },
  { value: 'Graduate', label: 'Graduate' },
  { value: 'Post Graduate', label: 'Post Graduate' },
  { value: 'Others', label: 'Others' },
];

const OTHER_GROSS_INCOME_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: '100000', label: 'Below 1 lakh' },
  { value: '500000', label: '1 to 5 lakhs' },
  { value: '1000000', label: '5 to 10 lakhs' },
  { value: '1500000', label: '10 to 25 lakhs' },
  { value: '2000000', label: 'Above 25 lakhs' },
];

const OTHER_NET_WORTH_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: '1000000', label: 'Less than 50 lakhs' },
  { value: '5000000', label: '50 - 100 lakhs' },
  { value: '10000000', label: 'Above 100 lakhs' },
];

const OTHER_OCCUPATION_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'Salaried - Pvt Sector', label: 'Salaried - Pvt Sector' },
  { value: 'Salaried - Public Sector', label: 'Salaried - Public Sector' },
  { value: 'Salaried - GOVT Service', label: 'Salaried - GOVT Service' },
  { value: 'Student', label: 'Student' },
  { value: 'Business', label: 'Business' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Agriiculturist', label: 'Agriiculturist' },
  { value: 'Retired', label: 'Retired' },
  { value: 'Housewife', label: 'Housewife' },
  { value: 'Others', label: 'Others' },
];

const OTHER_INVESTMENT_EXPERIENCE_YEARS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'Less than 2 years', label: 'Less than 2 years' },
  { value: '2-5 year', label: '2-5 years' },
  { value: 'More than 5 year', label: 'More than 5 years' },
];

const OTHER_INVESTMENT_EXPERIENCE_IN: readonly string[] = ['Equity', 'Debt', 'Derivative', 'Commodities', 'Others'];

export const InvestorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { navigate: saNavigate, isProxyMode } = useSAProxyNavigation();
  const delegationPerms = useDelegationPermissions();
  
  const canEdit = !delegationPerms.isProxyMode || delegationPerms.canEditKyc;
  const canSubmit = !delegationPerms.isProxyMode || delegationPerms.canSubmitForms;
  
  const [personalInfo, setPersonalInfo] = useState<UserPersonalInformationDto | null>(null);
  const [passport, setPassport] = useState<UserPassportDetailsDto | null>(null);
  const [experience, setExperience] = useState<InvestorExperienceDto | null>(null);
  const [consents, setConsents] = useState<InvestorConsentsDto | null>(null);
  const [residential, setResidential] = useState<UserResidentialStatusDto | null>(null);
  const [taxInfo, setTaxInfo] = useState<UserTaxInfoDto | null>(null);
  const [bankDetails, setBankDetails] = useState<UserBankDetailsDto | null>(null);
  const [contactDetails, setContactDetails] = useState<UserContactDetailsDto | null>(null);
  const [nomination, setNomination] = useState<UserNominationDto | null>(null);
  const [riskProfile, setRiskProfile] = useState<UserRiskProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'bank' | 'passport' | 'residential' | 'tax' | 'contact' | 'nomination' | 'other' | 'finalSubmit'>('personal');
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);

  const [personalForm, setPersonalForm] = useState<Partial<UserPersonalInformationDto>>({});
  const [passportForm, setPassportForm] = useState<Partial<UserPassportDetailsDto>>({});
  const [experienceForm, setExperienceForm] = useState<Partial<InvestorExperienceDto>>({});
  const [finalSubmitForm, setFinalSubmitForm] = useState({
    agreementComplete: false,
    agreementLegal: false,
    agreementModification: false
  });
  const [residentialForm, setResidentialForm] = useState<Partial<UserResidentialStatusDto>>({});
  const [taxInfoForm, setTaxInfoForm] = useState<Partial<UserTaxInfoDto>>({});
  const [bankDetailsForm, setBankDetailsForm] = useState<Partial<UserBankDetailsDto>>({});
  const [contactDetailsForm, setContactDetailsForm] = useState<Partial<UserContactDetailsDto>>({});
  const [nominationForm, setNominationForm] = useState<Partial<UserNominationDto>>({});
  const [riskProfileForm, setRiskProfileForm] = useState<Partial<UserRiskProfileDto>>({});

  // Validation Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [taxResidencyCountries, setTaxResidencyCountries] = useState<MasterCountryDto[]>([]);
  const [isdCodes, setIsdCodes] = useState<IsdCodeValuesDto[]>([]);

  const normalizeDateForInput = (value: unknown): string => {
    if (!value) return '';

    // Handles LocalDate serialized as [yyyy, mm, dd]
    if (Array.isArray(value) && value.length >= 3) {
      const year = String(value[0]);
      const month = String(value[1]).padStart(2, '0');
      const day = String(value[2]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const str = String(value).trim();
    if (!str) return '';

    // Already valid for <input type="date">
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    const parsed = new Date(str);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }

    return '';
  };

  /** Personal-info API may return legacy integer ids or "-1" sentinel; show as plain country text */
  const normalizeCountryOfResidenceForForm = (raw: unknown): string => {
    if (raw === null || raw === undefined || raw === '') return '';
    if (typeof raw === 'number') {
      if (raw < 0 || Number.isNaN(raw)) return '';
      return String(raw);
    }
    const s = String(raw).trim();
    if (s === '-1') return '';
    return s;
  };

  useEffect(() => {
    contentService
        .getCountries()
        .then((list) =>
            setTaxResidencyCountries(
                [...list].sort((a, b) =>
                    (a.ssName || '').localeCompare(b.ssName || '', undefined, { sensitivity: 'base' })
                )
            )
        )
        .catch(() => {
            /* optional master data; tax tab still works if user retries navigation */
        });
  }, []);

  useEffect(() => {
    contentService
        .getIsdCodes()
        .then((list) =>
            setIsdCodes(
                [...list].sort((a, b) =>
                    (a.countryName || '').localeCompare(b.countryName || '', undefined, { sensitivity: 'base' })
                )
            )
        )
        .catch(() => {});
  }, []);

  /** Country master id as string for the tax residency dropdown. */
  const taxResidencyCountrySelectValue = (() => {
    const id = taxInfoForm.taxResidencyCountryId;
    if (id != null && !Number.isNaN(Number(id))) return String(id);
    const raw = taxInfoForm.taxResidencyCountry;
    if (raw == null) return '';
    const s = String(raw).trim();
    if (s === '' || s === '-1') return '';
    return /^\d+$/.test(s) ? s : '';
  })();

  /** Laravel-style: Nominee 2/3 blocks only when remaining allocation needs another row (or saved data exists). */
  const nominationSharePct = (v: unknown): number => {
    if (v === undefined || v === null || v === '') return 0;
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
  };
  const s1Nom = nominationSharePct(nominationForm.nomineeShare1);
  const s2Nom = nominationSharePct(nominationForm.nomineeShare2);
  const share1FilledNom =
      nominationForm.nomineeShare1 !== undefined &&
      nominationForm.nomineeShare1 !== null &&
      String(nominationForm.nomineeShare1) !== '';
  const share2FilledNom =
      nominationForm.nomineeShare2 !== undefined &&
      nominationForm.nomineeShare2 !== null &&
      String(nominationForm.nomineeShare2) !== '';

  const hasNominee2Data =
      !!nominationForm.nomineeName2?.trim() ||
      !!nominationForm.nomineeRelation2 ||
      !!nominationForm.nomineeDob2 ||
      !!nominationForm.nomineeEmail2?.trim() ||
      !!nominationForm.nomineeMobile2?.trim() ||
      !!nominationForm.nomineeDocType2 ||
      !!nominationForm.nomineeDocNo2?.trim() ||
      nominationForm.nomineeCountrycode2 != null ||
      share2FilledNom;

  const hasNominee3Data =
      !!nominationForm.nomineeName3?.trim() ||
      !!nominationForm.nomineeRelation3 ||
      !!nominationForm.nomineeDob3 ||
      !!nominationForm.nomineeEmail3?.trim() ||
      !!nominationForm.nomineeMobile3?.trim() ||
      !!nominationForm.nomineeDocType3 ||
      !!nominationForm.nomineeDocNo3?.trim() ||
      nominationForm.nomineeCountrycode3 != null ||
      (nominationForm.nomineeShare3 !== undefined && nominationForm.nomineeShare3 !== null && String(nominationForm.nomineeShare3) !== '');

  const showNominee2Section =
      nominationForm.appointNominee === true &&
      (hasNominee2Data || hasNominee3Data || (share1FilledNom && s1Nom > 0 && s1Nom < 100));

  const showNominee3Section =
      nominationForm.appointNominee === true &&
      (hasNominee3Data || (share1FilledNom && share2FilledNom && s1Nom + s2Nom > 0 && s1Nom + s2Nom < 100));

  /** Nominee 2 share = remainder after Nominee 1; clears 2/3 when 100% or empty. */
  const updateNomineeShare1FromInput = (raw: string) => {
    if (raw === '') {
      setNominationForm((prev) => ({
        ...prev,
        nomineeShare1: undefined,
        nomineeShare2: undefined,
        nomineeShare3: undefined,
      }));
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    const s1 = Math.min(100, Math.max(0, parsed));
    if (s1 < 1) {
      setNominationForm((prev) => ({
        ...prev,
        nomineeShare1: undefined,
        nomineeShare2: undefined,
        nomineeShare3: undefined,
      }));
      return;
    }
    setNominationForm((prev) => {
      const next = { ...prev, nomineeShare1: s1 };
      if (s1 >= 100) {
        next.nomineeShare2 = undefined;
        next.nomineeShare3 = undefined;
        return next;
      }
      next.nomineeShare2 = 100 - s1;
      next.nomineeShare3 = undefined;
      return next;
    });
  };

  /** Nominee 3 share = remainder after Nominee 1 + Nominee 2. */
  const updateNomineeShare2FromInput = (raw: string) => {
    if (raw === '') {
      setNominationForm((prev) => ({
        ...prev,
        nomineeShare2: undefined,
        nomineeShare3: undefined,
      }));
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    const s2 = Math.min(100, Math.max(0, parsed));
    if (s2 < 1) {
      setNominationForm((prev) => ({
        ...prev,
        nomineeShare2: undefined,
        nomineeShare3: undefined,
      }));
      return;
    }
    setNominationForm((prev) => {
      const s1 =
          typeof prev.nomineeShare1 === 'number' && !Number.isNaN(prev.nomineeShare1)
              ? Math.min(100, Math.max(0, prev.nomineeShare1))
              : 0;
      const next = { ...prev, nomineeShare2: s2 };
      const rem = 100 - s1 - s2;
      if (rem > 0 && rem <= 100) {
        next.nomineeShare3 = rem;
      } else {
        next.nomineeShare3 = undefined;
      }
      return next;
    });
  };

  const loadData = useCallback(async () => {
    try {
      const [info, pass, exp, cons, res, tax, bank, contact, nom, risk, dashboard] = await Promise.all([
        profileService.getPersonalInfo().catch(e => { console.error('Failed to load personal info:', e); return null; }),
        profileService.getPassport().catch(e => { console.error('Failed to load passport:', e); return null; }),
        profileService.getExperience().catch(e => { console.error('Failed to load experience:', e); return null; }),
        profileService.getConsents().catch(e => { console.error('Failed to load consents:', e); return null; }),
        profileService.getResidentialStatus().catch(e => { console.error('Failed to load residential:', e); return null; }),
        profileService.getTaxInfo().catch(e => { console.error('Failed to load tax info:', e); return null; }),
        profileService.getBankDetails().catch(e => { console.error('Failed to load bank details:', e); return null; }),
        profileService.getContactDetails().catch(e => { console.error('Failed to load contact details:', e); return null; }),
        profileService.getNomination().catch(e => { console.error('Failed to load nomination:', e); return null; }),
        profileService.getRiskProfile().catch(e => { console.error('Failed to load risk profile:', e); return null; }),
        investorService.getDashboard().catch(e => { console.error('Failed to load dashboard:', e); return null; }),
      ]);
      setPersonalInfo(info ?? null);
      setPassport(pass ?? null);
      setExperience(exp ?? null);
      setConsents(cons ?? null);
      setResidential(res ?? null);
      setTaxInfo(tax ?? null);
      setBankDetails(bank ?? null);
      setContactDetails(contact ?? null);
      setNomination(nom ?? null);
      setRiskProfile(risk ?? null);
      setDashboardData(dashboard);
      setPersonalForm(
          info
              ? {
                  ...info,
                  countryOfResidence: normalizeCountryOfResidenceForForm(info.countryOfResidence),
                }
              : {}
      );
      setPassportForm(
          pass
              ? {
                ...pass,
                passportIssueDate: normalizeDateForInput(pass.passportIssueDate),
                passportExpiryDate: normalizeDateForInput(pass.passportExpiryDate),
                passportDateNonResident: normalizeDateForInput(pass.passportDateNonResident),
              }
              : {}
      );
      setExperienceForm(() => {
        if (!exp) {
          return {
            polExposed: false,
            polExposedRelated: false,
            activity: false,
            moneyChangeService: false,
            gamblingService: false,
            pawningService: false,
            instanceViolation: false,
          };
        }
        const raw = exp as InvestorExperienceDto & { annualIncome?: string };
        const invRaw: unknown = (exp as { investmentExperienceIn?: unknown }).investmentExperienceIn;
        let invList: string[] = [];
        if (Array.isArray(invRaw)) {
          invList = invRaw.filter((x): x is string => typeof x === 'string' && Boolean(x));
        } else if (typeof invRaw === 'string' && invRaw.trim()) {
          invList = invRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        return {
          ...exp,
          grossIncome: exp.grossIncome ?? raw.annualIncome ?? '',
          investmentExperienceIn: invList,
          polExposed: exp.polExposed ?? false,
          polExposedRelated: exp.polExposedRelated ?? false,
          activity: exp.activity ?? false,
          moneyChangeService: exp.moneyChangeService ?? false,
          gamblingService: exp.gamblingService ?? false,
          pawningService: exp.pawningService ?? false,
          instanceViolation: exp.instanceViolation ?? false,
        };
      });
      setResidentialForm(
          res
              ? {
                  ...res,
                  userOciIssueDate: normalizeDateForInput(res.userOciIssueDate),
                  userOciValidUpto: normalizeDateForInput(res.userOciValidUpto),
                  userVisaIssuerDate: normalizeDateForInput(res.userVisaIssuerDate),
                  userVisaExpiryDate: normalizeDateForInput(res.userVisaExpiryDate),
                  userVisaDateOfIssue: normalizeDateForInput(res.userVisaDateOfIssue),
                  userVisaValidUpto: normalizeDateForInput(res.userVisaValidUpto),
                }
              : {}
      );
      setTaxInfoForm(
          tax
              ? (() => {
                  const trc = tax.taxResidencyCountry != null ? String(tax.taxResidencyCountry).trim() : '';
                  const idFromString =
                      tax.taxResidencyCountryId == null && trc !== '' && /^\d+$/.test(trc)
                          ? Number(trc)
                          : undefined;
                  return {
                    ...tax,
                    taxResidencyCountryId: tax.taxResidencyCountryId ?? idFromString,
                  };
                })()
              : {}
      );
      setBankDetailsForm(bank ?? {});
      setContactDetailsForm(contact ?? {});
      setNominationForm(
          nom
              ? {
                  ...nom,
                  nomineeDob1: normalizeDateForInput(nom.nomineeDob1),
                  nomineeDob2: normalizeDateForInput(nom.nomineeDob2),
                  nomineeDob3: normalizeDateForInput(nom.nomineeDob3),
                  guardianDob1: normalizeDateForInput(nom.guardianDob1),
                  guardianDob2: normalizeDateForInput(nom.guardianDob2),
                  guardianDob3: normalizeDateForInput(nom.guardianDob3),
                  appointNominee:
                      nom.appointNominee === true ||
                      (nom.appointNominee !== false &&
                          (!!nom.nomineeName1 || !!nom.nomineeName2 || !!nom.nomineeName3)),
                }
              : { appointNominee: false }
      );
      setRiskProfileForm(risk ?? {});

      // Load final submit checkbox states from consents
      if (cons) {
        setFinalSubmitForm({
          agreementComplete: cons.informationCorrectConsent ?? false,
          agreementLegal: cons.legalCapacityConsent ?? false,
          agreementModification: cons.modificationAwarenessConsent ?? false
        });
      }
      
      if (!info && !dashboard && delegationPerms.isProxyMode) {
        toast.warning('Limited access: Some information may not be visible due to delegation permissions.');
      }
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      if (permissionError) {
        toast.error(permissionError);
      } else {
        toast.error(err.response?.data?.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [delegationPerms.isProxyMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validatePersonalInformation(personalForm as UserPersonalInformationDto);
    if (Object.keys(newErrors).length > 0) {
      setActiveTab('personal');
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload = personalForm as UserPersonalInformationDto;
      await profileService.updatePersonalInfo(payload);
      toast.success('Personal information updated');
      loadData();
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

  const handleSavePassport = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validatePassportInformation(passportForm as UserPassportDetailsDto);
    if (Object.keys(newErrors).length > 0) {
      setActiveTab('passport');
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload: UserPassportDetailsDto = {
        ...(passportForm as UserPassportDetailsDto),
        passportIssueDate: passportForm.passportIssueDate
            ? normalizeDateForInput(passportForm.passportIssueDate)
            : undefined,
        passportExpiryDate: passportForm.passportExpiryDate
            ? normalizeDateForInput(passportForm.passportExpiryDate)
            : undefined,
        passportDateNonResident: passportForm.passportDateNonResident
            ? normalizeDateForInput(passportForm.passportDateNonResident)
            : undefined,
      };
      await profileService.updatePassport(payload);
      toast.success('Passport details updated');
      loadData();
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

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate as Risk Profile / Experience
    const newErrors = validateRiskProfile(experienceForm as InvestorExperienceDto);
    if (Object.keys(newErrors).length > 0) {
      setActiveTab('other');
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const ef = experienceForm as InvestorExperienceDto;
      const payload: InvestorExperienceDto = {
        ...ef,
        annualIncome: ef.grossIncome || ef.annualIncome,
        investmentExperienceYears: ef.investmentExperienceYears,
        investmentExperienceIn: ef.investmentExperienceIn,
      };
      if (payload.investmentExperienceYears) {
        delete (payload as { yearsOfInvestmentExperience?: number }).yearsOfInvestmentExperience;
      }
      await profileService.updateExperience(payload);
      toast.success('Experience updated');
      loadData();
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



  const handleSaveResidential = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateResidentialStatus(residentialForm as UserResidentialStatusDto);
    if (Object.keys(newErrors).length > 0) {
      setActiveTab('residential');
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await profileService.updateResidentialStatus(residentialForm as UserResidentialStatusDto);
      toast.success('Residential status updated');
      loadData();
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

  const handleSaveTaxInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    // Map form fields to DTO for validation (do not parseInt tax country — free text or numeric id string must stay valid)
    const validationData = {
      ...taxInfoForm,
      tinNumber: taxInfoForm.taxIdNumber,
      taxIdentificationNumberType: taxInfoForm.taxIdentificationNumberType,
      fatcaStatus: taxInfoForm.fatcaStatus,
      crsDeclaration: taxInfoForm.crsDeclaration,
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
          taxInfoForm.taxResidencyCountry !== undefined && taxInfoForm.taxResidencyCountry !== null
              ? String(taxInfoForm.taxResidencyCountry).trim()
              : '';
      const payload: any = {
        ...taxInfoForm,
        tinNumber: taxInfoForm.taxIdNumber,
        taxResidencyCountry: trimmedCountry || undefined,
        taxIdentificationNumberType: taxInfoForm.taxIdentificationNumberType,
        fatcaStatus: taxInfoForm.fatcaStatus,
        crsDeclaration: taxInfoForm.crsDeclaration,
      };
      await profileService.updateTaxInfo(payload);
      toast.success('Tax information updated');
      loadData();
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

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...bankDetailsForm,
      settlementAccountType: bankDetailsForm.settlementAccountType || (bankDetailsForm.accountType ? 'yes' : ''),
    } as UserBankDetailsDto;
    const newErrors = validateBankDetails(payload);
    if (Object.keys(newErrors).length > 0) {
      setActiveTab('bank');
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await profileService.updateBankDetails(payload);
      toast.success('Bank details updated');
      loadData();
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

  const handleSaveContactDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateContactDetails(contactDetailsForm as UserContactDetailsDto);
    if (Object.keys(newErrors).length > 0) {
      setActiveTab('contact');
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await profileService.updateContactDetails(contactDetailsForm as UserContactDetailsDto);
      toast.success('Contact details updated');
      loadData();
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

  const handleSaveNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    const appoint =
        nominationForm.appointNominee === true || nominationForm.appointNominee === 'yes';

    if (!appoint) {
      setErrors({});
      setSaving(true);
      try {
        await profileService.updateNomination({ appointNominee: false });
        toast.success('Nomination preference saved');
        loadData();
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
      return;
    }

    const newErrors = validateNominationDetails({
      ...nominationForm,
      appointNominee: true,
    } as UserNominationDto);
    if (Object.keys(newErrors).length > 0) {
      setActiveTab('nomination');
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload: UserNominationDto = {
        ...nominationForm,
        appointNominee: true,
        nomineeFirstName: nominationForm.nomineeName1,
        nomineeRelationship: nominationForm.nomineeRelation1,
        nomineeRelation1: nominationForm.nomineeRelation1,
        nomineeDob: nominationForm.nomineeDob1,
        nomineeDob1: nominationForm.nomineeDob1,
        nomineeEmail: nominationForm.nomineeEmail1,
        nomineeMobile: nominationForm.nomineeMobile1,
        nomineeShare: nominationForm.nomineeShare1,
        guardianName: nominationForm.guardianName1,
      };
      await profileService.updateNomination(payload);
      toast.success('Nomination details updated');
      loadData();
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

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to submit your complete profile? This will mark your profile as complete for review.')) {
      return;
    }
    setSaving(true);
    try {
      // Send the checkbox consent states to be saved
      await profileService.finalSubmit({
        informationCorrectConsent: finalSubmitForm.agreementComplete,
        legalCapacityConsent: finalSubmitForm.agreementLegal,
        modificationAwarenessConsent: finalSubmitForm.agreementModification
      });
      toast.success('Profile submitted successfully! Your application is now under review.');
      loadData();
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      if (permissionError) {
        toast.error(permissionError);
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit');
      }
    } finally {
      setSaving(false);
    }
  };



  const handleDownloadPDF = async () => {
    try {
      await pdfService.downloadPdfFile();
      toast.success('PDF downloaded successfully');
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      if (permissionError) {
        toast.error(permissionError);
      } else {
        toast.error(err.response?.data?.message || 'Failed to download PDF');
      }
    }
  };

  const handleDownloadAccountOpeningKit = async () => {
    try {
      await pdfService.downloadKycFormFile();
      toast.success('KYC Account Opening Kit PDF downloaded successfully');
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      if (permissionError) {
        toast.error(permissionError);
      } else {
        toast.error(err.response?.data?.message || 'Failed to download KYC Account Opening Kit PDF');
      }
    }
  };

  const handlePrintPreview = async () => {
    try {
      await pdfService.openPrintPreview();
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      if (permissionError) {
        toast.error(permissionError);
      } else {
        toast.error(err.response?.data?.message || 'Failed to open print preview');
      }
    }
  };

  const handleAccountOpeningKitPreview = async () => {
    try {
      await pdfService.openKycFormPreview();
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      if (permissionError) {
        toast.error(permissionError);
      } else {
        toast.error(err.response?.data?.message || 'Failed to open Account Opening Kit preview');
      }
    }
  };

  // Progress bar - Your Journey section
  const renderProgressBar = () => {
    console.log('[InvestorProfile] renderProgressBar - dashboardData:', dashboardData);
    const progress = dashboardData?.progress;

    const isCompleted = (key: string) => progress?.sections?.[key]?.completed || false;

    const isDoneFor = (key: string) => {
      if (key === 'information') return isCompleted('personalInfo');
      if (key === 'documents') return isCompleted('kycDocuments');
      if (key === 'onboarding') return isCompleted('onboardingForms');
      if (key === 'verification') return isCompleted('inPersonVerification');
      if (key === 'physical') return isCompleted('physicalSubmission');
      if (key === 'account') return isCompleted('accountDetails');
      return false;
    };

    const stepKeys = ['information', 'documents', 'onboarding', 'verification', 'physical', 'account'] as const;
    const currentStepKey = stepKeys.find((k) => !isDoneFor(k)) ?? 'information';
    const isCurrent = (key: string) => currentStepKey === key;

    const renderStep = (label: string, route: string, stepKey: string, percent: string = "20%") => {
      const isDone = isDoneFor(stepKey);

      const handleStepClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isProxyMode) {
          saNavigate(route);
        } else {
          navigate(route);
        }
      };

      return (
        <div key={stepKey} className={`step ${isDone ? 'step-completed' : ''}`}>
          {isDone ? (
            <div className="circle-chart active-one">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : (
            <button type="button" onClick={handleStepClick} style={{ textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <div className={`circle-chart ${isCurrent(stepKey) ? 'active-three' : ''}`}>
                {isCurrent(stepKey) ? percent : 'Start'}
              </div>
            </button>
          )}
          <p>
            <button type="button" onClick={handleStepClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              {label}
            </button>
          </p>
        </div>
      );
    };

    return (
      <div className="investor-profile__progress-section">
        <div className="container-fluid">
          <center>
            <strong>
              <h2 style={{ fontSize: '36px', color: '#be1717', fontWeight: 500, marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                Your Journey
              </h2>
            </strong>
          </center>
          <div className="step-progress">
            {renderStep('Submit Information', '/investor/profile', 'information', '90%')}
            {renderStep('KYC Documents', '/investor/documents', 'documents', '50%')}
            {renderStep('Onboarding Forms', '/investor/documents', 'onboarding', '20%')}
            {renderStep('In-person Verification', '/investor/verification', 'verification', '0%')}
            {renderStep('Physical Submission', '/investor/physical-submission', 'physical', '0%')}
            {renderStep('Account Details', '/investor/account-details', 'account', '0%')}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
        <div className="dashboard-layout">
          <Header />
          <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
            <div className="investor-profile investor-profile--loading">Loading...</div>
          </div>
        </div>
    );
  }

  return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
          <div className="investor-profile">
            <div className="profile-header">
              <h1>Profile</h1>
              <div className="profile-actions">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePrintPreview}
                >
                  🖨️ Print Preview (Summary)
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleDownloadPDF}
                >
                  📄 Download PDF (Summary)
                </button>
                <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleAccountOpeningKitPreview}
                    style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                >
                  📋 Account Opening Kit Preview
                </button>
                <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleDownloadAccountOpeningKit}
                    style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                >
                  📦 Download Account Opening Kit
                </button>
              </div>
            </div>

            {delegationPerms.isProxyMode && !delegationPerms.canViewProfile && (
              <div className="alert alert-danger" role="alert" style={{ margin: '1rem 0' }}>
                <strong>Access Restricted:</strong> You don't have permission to view this investor's profile. 
                Please ask the investor to update your delegation permissions to include "View Profile" access.
              </div>
            )}
            
            {delegationPerms.isProxyMode && delegationPerms.canViewProfile && !delegationPerms.canEditKyc && (
              <div className="alert alert-warning" role="alert" style={{ margin: '1rem 0' }}>
                <strong>Read-Only Mode:</strong> You can view information but cannot make changes. 
                Ask the investor to enable "Edit KYC" permission if updates are needed.
              </div>
            )}

            {/* Onboarding Progress Widget */}
            <div style={{ margin: '2rem 0' }}>
              <OnboardingProgress />
            </div>

            {/* Your Journey Progress Section */}
            {renderProgressBar()}

            <div className="investor-profile__tabs">
              <button
                  type="button"
                  className={activeTab === 'personal' ? 'active' : ''}
                  onClick={() => setActiveTab('personal')}
              >
                Personal Information
              </button>
              <button
                  type="button"
                  className={activeTab === 'bank' ? 'active' : ''}
                  onClick={() => setActiveTab('bank')}
              >
                Bank Details
              </button>
              <button
                  type="button"
                  className={activeTab === 'passport' ? 'active' : ''}
                  onClick={() => setActiveTab('passport')}
              >
                Passport
              </button>
              <button
                  type="button"
                  className={activeTab === 'residential' ? 'active' : ''}
                  onClick={() => setActiveTab('residential')}
              >
                Residential Status
              </button>
              <button
                  type="button"
                  className={activeTab === 'tax' ? 'active' : ''}
                  onClick={() => setActiveTab('tax')}
              >
                Tax Information
              </button>
              <button
                  type="button"
                  className={activeTab === 'contact' ? 'active' : ''}
                  onClick={() => setActiveTab('contact')}
              >
                Contact Details
              </button>
              <button
                  type="button"
                  className={activeTab === 'nomination' ? 'active' : ''}
                  onClick={() => setActiveTab('nomination')}
              >
                Nomination
              </button>
              <button
                  type="button"
                  className={activeTab === 'other' ? 'active' : ''}
                  onClick={() => setActiveTab('other')}
              >
                Other Information
              </button>
              <button
                  type="button"
                  className={activeTab === 'finalSubmit' ? 'active' : ''}
                  onClick={() => setActiveTab('finalSubmit')}
              >
                Final Submit
              </button>
            </div>

            {activeTab === 'personal' && (
                <form className="investor-profile__card" onSubmit={handleSavePersonal}>
                  <h3>Personal Information</h3>
                  <div className="investor-profile__grid">
                    <div className="form-group">
                      <label>First Name <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.investorFirstName ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, investorFirstName: e.target.value })}
                          className={errors.investorFirstName ? 'form-control is-invalid' : ''}
                      />
                      {errors.investorFirstName && <div className="invalid-feedback">{errors.investorFirstName}</div>}
                    </div>
                    <div className="form-group">
                      <label>Middle Name</label>
                      <input
                          value={personalForm.investorMiddleName ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, investorMiddleName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.investorLastName ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, investorLastName: e.target.value })}
                          className={errors.investorLastName ? 'form-control is-invalid' : ''}
                      />
                      {errors.investorLastName && <div className="invalid-feedback">{errors.investorLastName}</div>}
                    </div>
                    <div className="form-group">
                      <label>Date Of Birth <span className="text-danger">*</span></label>
                      <input
                          type="date"
                          value={personalForm.userDob ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, userDob: e.target.value })}
                          className={errors.userDob ? 'form-control is-invalid' : ''}
                      />
                      {errors.userDob && <div className="invalid-feedback">{errors.userDob}</div>}
                    </div>

                    <div className="form-group">
                      <label>Gender <span className="text-danger">*</span></label>
                      <select
                          value={personalForm.gender ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                          className={errors.gender ? 'form-control is-invalid' : ''}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                      {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                    </div>
                    <div className="form-group">
                      <label>Marital Status <span className="text-danger">*</span></label>
                      <select
                          value={personalForm.maritalStatus ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, maritalStatus: e.target.value })}
                          className={errors.maritalStatus ? 'form-control is-invalid' : ''}
                      >
                        <option value="">Select</option>
                        <option value="1">Single</option>
                        <option value="2">Married</option>
                        <option value="3">Widowed</option>
                        <option value="5">Seperated</option>
                        <option value="4">Divorced</option>
                      </select>
                      {errors.maritalStatus && <div className="invalid-feedback">{errors.maritalStatus}</div>}
                    </div>

                    {(personalForm.gender === 'Female' || personalForm.maritalStatus === '2') && (
                        <>
                          <div className="form-group form-group--full">
                            <h4 style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.95rem' }}>Maiden Name (if applicable)</h4>
                          </div>
                          <div className="form-group">
                            <label>Title <span className="text-danger">*</span></label>
                            <select
                                value={personalForm.maidenTitle ?? ''}
                                onChange={(e) => setPersonalForm({ ...personalForm, maidenTitle: e.target.value })}
                            >
                              <option value="">Select</option>
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Miss">Miss</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Maiden First Name <span className="text-danger">*</span></label>
                            <input
                                value={personalForm.maidenName ?? ''}
                                onChange={(e) => setPersonalForm({ ...personalForm, maidenName: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Maiden Middle Name</label>
                            <input
                                value={personalForm.maidenMiddleName ?? ''}
                                onChange={(e) => setPersonalForm({ ...personalForm, maidenMiddleName: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Maiden Last Name <span className="text-danger">*</span></label>
                            <input
                                value={personalForm.maidenLastName ?? ''}
                                onChange={(e) => setPersonalForm({ ...personalForm, maidenLastName: e.target.value })}
                            />
                          </div>
                        </>
                    )}

                    <div className="form-group">
                      <label>City Of Birth <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.cityOfDob ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, cityOfDob: e.target.value })}
                          className={errors.cityOfDob ? 'form-control is-invalid' : ''}
                      />
                      {errors.cityOfDob && <div className="invalid-feedback">{errors.cityOfDob}</div>}
                    </div>
                    <div className="form-group">
                      <label>Country Of Birth <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.countryDob ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, countryDob: e.target.value })}
                          className={errors.countryDob ? 'form-control is-invalid' : ''}
                      />
                      {errors.countryDob && <div className="invalid-feedback">{errors.countryDob}</div>}
                    </div>
                    <div className="form-group">
                      <label>Citizenship <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.citizenship ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, citizenship: e.target.value })}
                          className={errors.citizenship ? 'form-control is-invalid' : ''}
                          placeholder="e.g. Indian"
                      />
                      {errors.citizenship && <div className="invalid-feedback">{errors.citizenship}</div>}
                    </div>
                    <div className="form-group">
                      <label>Country of Residence <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.countryOfResidence ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, countryOfResidence: e.target.value })}
                          className={errors.countryOfResidence ? 'form-control is-invalid' : ''}
                          placeholder="e.g. India"
                      />
                      {errors.countryOfResidence && <div className="invalid-feedback">{errors.countryOfResidence}</div>}
                    </div>
                    <div className="form-group">
                      <label>PAN Number <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.panNumber ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, panNumber: e.target.value })}
                      />
                    </div>

                    {/* Father's Details */}
                    <div className="form-group form-group--full">
                      <h4 style={{ margin: '1.5rem 0 0.5rem 0', color: '#333', fontSize: '1rem' }}>Father's Details</h4>
                    </div>
                    <div className="form-group">
                      <label>Title</label>
                      <select
                          value={personalForm.fatherNameTitle ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, fatherNameTitle: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option value="Mr">Mr</option>
                        <option value="Shri">Shri</option>
                        <option value="Late">Late</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Father's First Name <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.fathersFirstName ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, fathersFirstName: e.target.value })}
                          className={errors.fathersFirstName ? 'form-control is-invalid' : ''}
                      />
                      {errors.fathersFirstName && <div className="invalid-feedback">{errors.fathersFirstName}</div>}
                    </div>
                    <div className="form-group">
                      <label>Father's Middle Name</label>
                      <input
                          value={personalForm.fathersMiddleName ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, fathersMiddleName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Father's Last Name <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.fathersLastName ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, fathersLastName: e.target.value })}
                          className={errors.fathersLastName ? 'form-control is-invalid' : ''}
                      />
                      {errors.fathersLastName && <div className="invalid-feedback">{errors.fathersLastName}</div>}
                    </div>

                    {/* Mother's Details */}
                    <div className="form-group form-group--full">
                      <h4 style={{ margin: '1.5rem 0 0.5rem 0', color: '#333', fontSize: '1rem' }}>Mother's Details</h4>
                    </div>
                    <div className="form-group">
                      <label>Title</label>
                      <select
                          value={personalForm.motherNameTitle ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, motherNameTitle: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Miss">Miss</option>
                        <option value="Shrimati">Shrimati</option>
                        <option value="Late">Late</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mother's First Name <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.motherFirstName ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, motherFirstName: e.target.value })}
                          className={errors.motherFirstName ? 'form-control is-invalid' : ''}
                      />
                      {errors.motherFirstName && <div className="invalid-feedback">{errors.motherFirstName}</div>}
                    </div>
                    <div className="form-group">
                      <label>Mother's Middle Name</label>
                      <input
                          value={personalForm.motherMiddleName ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, motherMiddleName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mother's Last Name <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.motherLastName ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, motherLastName: e.target.value })}
                          className={errors.motherLastName ? 'form-control is-invalid' : ''}
                      />
                      {errors.motherLastName && <div className="invalid-feedback">{errors.motherLastName}</div>}
                    </div>

                    {/* Spouse Details - Show only if married */}
                    {personalForm.maritalStatus === '2' && (
                        <>
                          <div className="form-group form-group--full">
                            <h4 style={{ margin: '1.5rem 0 0.5rem 0', color: '#333', fontSize: '1rem' }}>Spouse Details</h4>
                          </div>
                          <div className="form-group">
                            <label>Title</label>
                            <select
                                value={personalForm.spouseNameTitle ?? ''}
                                onChange={(e) => setPersonalForm({ ...personalForm, spouseNameTitle: e.target.value })}
                            >
                              <option value="">Select</option>
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Miss">Miss</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Spouse First Name</label>
                            <input
                                value={personalForm.spouseName ?? ''}
                                onChange={(e) => setPersonalForm({ ...personalForm, spouseName: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Spouse Middle Name</label>
                            <input
                                value={personalForm.spouseMiddleName ?? ''}
                                onChange={(e) => setPersonalForm({ ...personalForm, spouseMiddleName: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Spouse Last Name</label>
                            <input
                                value={personalForm.spouseLastName ?? ''}
                                onChange={(e) => setPersonalForm({ ...personalForm, spouseLastName: e.target.value })}
                            />
                          </div>
                          <div className="form-group form-group--full">
                            <label>Spouse Maiden Name</label>
                            <input
                                value={personalForm.spouseMaidenName ?? ''}
                                onChange={(e) => setPersonalForm({ ...personalForm, spouseMaidenName: e.target.value })}
                            />
                          </div>
                        </>
                    )}

                    {/* Address Section */}
                    <div className="form-group form-group--full">
                      <h4 style={{ margin: '1.5rem 0 0.5rem 0', color: '#333', fontSize: '1rem' }}>Address</h4>
                    </div>
                    <div className="form-group form-group--full">
                      <label>Address Line 1 <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.addressLine1 ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, addressLine1: e.target.value })}
                          className={errors.addressLine1 ? 'form-control is-invalid' : ''}
                      />
                      {errors.addressLine1 && <div className="invalid-feedback">{errors.addressLine1}</div>}
                    </div>
                    <div className="form-group form-group--full">
                      <label>City <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.userCity ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, userCity: e.target.value })}
                          className={errors.userCity ? 'form-control is-invalid' : ''}
                      />
                      {errors.userCity && <div className="invalid-feedback">{errors.userCity}</div>}
                    </div>
                    <div className="form-group">
                      <label>State <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.userState ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, userState: e.target.value })}
                          className={errors.userState ? 'form-control is-invalid' : ''}
                      />
                      {errors.userState && <div className="invalid-feedback">{errors.userState}</div>}
                    </div>
                    <div className="form-group">
                      <label>ZIP / Postal Code <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.userZipCode ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, userZipCode: e.target.value })}
                          className={errors.userZipCode ? 'form-control is-invalid' : ''}
                      />
                      {errors.userZipCode && <div className="invalid-feedback">{errors.userZipCode}</div>}
                    </div>
                    <div className="form-group">
                      <label>Country <span className="text-danger">*</span></label>
                      <input
                          value={personalForm.userCountry ?? ''}
                          onChange={(e) => setPersonalForm({ ...personalForm, userCountry: e.target.value })}
                          placeholder="e.g. India"
                          className={errors.userCountry ? 'form-control is-invalid' : ''}
                      />
                      {errors.userCountry && <div className="invalid-feedback">{errors.userCountry}</div>}
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
            )}

            {activeTab === 'passport' && (
                <form className="investor-profile__card" onSubmit={handleSavePassport}>
                  <h3>Proof of Identity</h3>
                  <div className="investor-profile__grid">
                    <div className="form-group form-group--full">
                      <label>Document Type <span className="text-danger">*</span></label>
                      <select
                          value={(passportForm as any).documentType ?? ''}
                          onChange={(e) => setPassportForm({ ...passportForm, documentType: e.target.value } as any)}
                          className="form-control"
                      >
                        <option value="">Select Document Type</option>
                        <option value="Aadhaar">Aadhaar</option>
                        <option value="PAN">PAN</option>
                        <option value="Passport">Passport</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Driving License">Driving License</option>
                        <option value="OCI Card">OCI Card</option>
                      </select>
                    </div>
                    <div className="form-group form-group--full">
                      <label>Document Number <span className="text-danger">*</span></label>
                      <input
                          value={passportForm.passportNumber ?? ''}
                          onChange={(e) => setPassportForm({ ...passportForm, passportNumber: e.target.value })}
                          className={errors.passportNumber ? 'form-control is-invalid' : ''}
                      />
                      {errors.passportNumber && <div className="invalid-feedback">{errors.passportNumber}</div>}
                    </div>
                    <div className="form-group">
                      <label>Date of Issue <span className="text-danger">*</span></label>
                      <input
                          type="date"
                          value={passportForm.passportIssueDate ?? ''}
                          onChange={(e) => setPassportForm({ ...passportForm, passportIssueDate: e.target.value })}
                          className={errors.passportIssueDate ? 'form-control is-invalid' : ''}
                      />
                      {errors.passportIssueDate && <div className="invalid-feedback">{errors.passportIssueDate}</div>}
                    </div>
                    <div className="form-group">
                      <label>Valid upto <span className="text-danger">*</span></label>
                      <input
                          type="date"
                          value={passportForm.passportExpiryDate ?? ''}
                          onChange={(e) => setPassportForm({ ...passportForm, passportExpiryDate: e.target.value })}
                          className={errors.passportExpiryDate ? 'form-control is-invalid' : ''}
                      />
                      {errors.passportExpiryDate && <div className="invalid-feedback">{errors.passportExpiryDate}</div>}
                    </div>
                    <div className="form-group form-group--full">
                      <label>Place of Issue <span className="text-danger">*</span></label>
                      <input
                          value={passportForm.passportPlaceOfIssue ?? ''}
                          onChange={(e) => setPassportForm({ ...passportForm, passportPlaceOfIssue: e.target.value })}
                          className={errors.passportPlaceOfIssue ? 'form-control is-invalid' : ''}
                      />
                      {errors.passportPlaceOfIssue && <div className="invalid-feedback">{errors.passportPlaceOfIssue}</div>}
                    </div>
                    <div className="form-group form-group--full">
                      <label>Country of Issue <span className="text-danger">*</span></label>
                      <input
                          value={passportForm.passportCountryOfIssue ?? ''}
                          onChange={(e) => setPassportForm({ ...passportForm, passportCountryOfIssue: e.target.value })}
                          className={errors.passportCountryOfIssue ? 'form-control is-invalid' : ''}
                      />
                      {errors.passportCountryOfIssue && <div className="invalid-feedback">{errors.passportCountryOfIssue}</div>}
                    </div>

                    {/* Additional Laravel Fields */}
                    <div className="form-group">
                      <label>Nationality <span className="text-danger">*</span></label>
                      <input
                          value={passportForm.passportNationality ?? ''}
                          onChange={(e) => setPassportForm({ ...passportForm, passportNationality: e.target.value })}
                          className={errors.passportNationality ? 'form-control is-invalid' : ''}
                      />
                      {errors.passportNationality && <div className="invalid-feedback">{errors.passportNationality}</div>}
                    </div>
                    <div className="form-group">
                      <label>Date of Becoming Non Resident <span className="text-danger">*</span></label>
                      <input
                          type="date"
                          value={passportForm.passportDateNonResident ?? ''}
                          onChange={(e) => setPassportForm({ ...passportForm, passportDateNonResident: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>No of Years Abroad <span className="text-danger">*</span></label>
                      <input
                          type="number"
                          min="0"
                          value={passportForm.passportNoYearsAbroad ?? ''}
                          onChange={(e) => setPassportForm({ ...passportForm, passportNoYearsAbroad: e.target.value ? parseInt(e.target.value) : undefined })}
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
            )}

            {activeTab === 'other' && (
                <form className="investor-profile__card" onSubmit={handleSaveExperience}>
                  <h3>Other Information</h3>
                  <div className="investor-profile__grid">
                    {/* Row 1 — matches information-update.blade.php Section8 */}
                    <div className="form-group">
                      <label>Source of Funds <span className="text-danger">*</span></label>
                      <select
                          value={experienceForm.sourceOfFunds ?? ''}
                          onChange={(e) => setExperienceForm({ ...experienceForm, sourceOfFunds: e.target.value })}
                          className={errors.sourceOfFunds ? 'form-control is-invalid' : 'form-control'}
                      >
                        {OTHER_SOURCE_OF_FUNDS_OPTIONS.map((o) => (
                          <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {errors.sourceOfFunds && <div className="invalid-feedback">{errors.sourceOfFunds}</div>}
                    </div>
                    <div className="form-group">
                      <label>Source of Wealth</label>
                      <input
                          className="form-control"
                          value={experienceForm.sourceOfWealth ?? ''}
                          onChange={(e) => setExperienceForm({ ...experienceForm, sourceOfWealth: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Education Qualification <span className="text-danger">*</span></label>
                      <select
                          value={experienceForm.educationalQualification ?? ''}
                          onChange={(e) => setExperienceForm({ ...experienceForm, educationalQualification: e.target.value })}
                          className={errors.educationalQualification ? 'form-control is-invalid' : 'form-control'}
                      >
                        {OTHER_EDUCATION_OPTIONS.map((o) => (
                          <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {errors.educationalQualification && <div className="invalid-feedback">{errors.educationalQualification}</div>}
                    </div>

                    <div className="form-group">
                      <label>Gross Annual Income (In INR) <span className="text-danger">*</span></label>
                      <select
                          value={experienceForm.grossIncome ?? ''}
                          onChange={(e) => setExperienceForm({ ...experienceForm, grossIncome: e.target.value })}
                          className={errors.grossIncome ? 'form-control is-invalid' : 'form-control'}
                      >
                        {OTHER_GROSS_INCOME_OPTIONS.map((o) => (
                          <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {errors.grossIncome && <div className="invalid-feedback">{errors.grossIncome}</div>}
                    </div>
                    <div className="form-group">
                      <label>Net Worth <span className="text-danger">*</span></label>
                      <select
                          value={experienceForm.netWorth ?? ''}
                          onChange={(e) => setExperienceForm({ ...experienceForm, netWorth: e.target.value })}
                          className={errors.netWorth ? 'form-control is-invalid' : 'form-control'}
                      >
                        {OTHER_NET_WORTH_OPTIONS.map((o) => (
                          <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {errors.netWorth && <div className="invalid-feedback">{errors.netWorth}</div>}
                    </div>
                    <div className="form-group">
                      <label>Occupation <span className="text-danger">*</span></label>
                      <select
                          value={experienceForm.occupation ?? ''}
                          onChange={(e) => setExperienceForm({ ...experienceForm, occupation: e.target.value })}
                          className={errors.occupation ? 'form-control is-invalid' : 'form-control'}
                      >
                        {OTHER_OCCUPATION_OPTIONS.map((o) => (
                          <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {errors.occupation && <div className="invalid-feedback">{errors.occupation}</div>}
                    </div>

                    <div className="form-group">
                      <label>Line of Business / Industry</label>
                      <input
                          className="form-control"
                          value={experienceForm.lineOfBusiness ?? ''}
                          onChange={(e) => setExperienceForm({ ...experienceForm, lineOfBusiness: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Organisation</label>
                      <input
                          className="form-control"
                          value={experienceForm.natureOfOrganisation ?? ''}
                          onChange={(e) => setExperienceForm({ ...experienceForm, natureOfOrganisation: e.target.value })}
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
                              checked={experienceForm.polExposed === true}
                              onChange={() => setExperienceForm({ ...experienceForm, polExposed: true })}
                          /> Yes
                        </label>
                        <label>
                          <input
                              type="radio"
                              name="polExposed"
                              checked={experienceForm.polExposed !== true}
                              onChange={() => setExperienceForm({ ...experienceForm, polExposed: false })}
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
                              checked={experienceForm.polExposedRelated === true}
                              onChange={() => setExperienceForm({ ...experienceForm, polExposedRelated: true })}
                          /> Yes
                        </label>
                        <label>
                          <input
                              type="radio"
                              name="polExposedRelated"
                              checked={experienceForm.polExposedRelated !== true}
                              onChange={() => setExperienceForm({ ...experienceForm, polExposedRelated: false })}
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
                              checked={experienceForm.activity === true}
                              onChange={() => setExperienceForm({ ...experienceForm, activity: true })}
                          /> Yes
                        </label>
                        <label>
                          <input
                              type="radio"
                              name="activity"
                              checked={experienceForm.activity !== true}
                              onChange={() => setExperienceForm({ ...experienceForm, activity: false })}
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
                              checked={experienceForm.moneyChangeService === true}
                              onChange={() => setExperienceForm({ ...experienceForm, moneyChangeService: true })}
                          /> Yes
                        </label>
                        <label>
                          <input
                              type="radio"
                              name="moneyChangeService"
                              checked={experienceForm.moneyChangeService !== true}
                              onChange={() => setExperienceForm({ ...experienceForm, moneyChangeService: false })}
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
                              checked={experienceForm.gamblingService === true}
                              onChange={() => setExperienceForm({ ...experienceForm, gamblingService: true })}
                          /> Yes
                        </label>
                        <label>
                          <input
                              type="radio"
                              name="gamblingService"
                              checked={experienceForm.gamblingService !== true}
                              onChange={() => setExperienceForm({ ...experienceForm, gamblingService: false })}
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
                              checked={experienceForm.pawningService === true}
                              onChange={() => setExperienceForm({ ...experienceForm, pawningService: true })}
                          /> Yes
                        </label>
                        <label>
                          <input
                              type="radio"
                              name="pawningService"
                              checked={experienceForm.pawningService !== true}
                              onChange={() => setExperienceForm({ ...experienceForm, pawningService: false })}
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
                              checked={experienceForm.instanceViolation === true}
                              onChange={() => setExperienceForm({ ...experienceForm, instanceViolation: true })}
                          /> Yes
                        </label>
                        <label>
                          <input
                              type="radio"
                              name="instanceViolation"
                              checked={experienceForm.instanceViolation !== true}
                              onChange={() => setExperienceForm({ ...experienceForm, instanceViolation: false })}
                          /> No
                        </label>
                      </div>
                      {errors.instanceViolation && <div className="invalid-feedback d-block">{errors.instanceViolation}</div>}
                    </div>

                    <div className="form-group">
                      <label>No of Years of Investment Experience <span className="text-danger">*</span></label>
                      <select
                          value={experienceForm.investmentExperienceYears ?? ''}
                          onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              investmentExperienceYears: e.target.value || undefined,
                              yearsOfInvestmentExperience: undefined,
                            })
                          }
                          className={errors.investmentExperienceYears ? 'form-control is-invalid' : 'form-control'}
                      >
                        {OTHER_INVESTMENT_EXPERIENCE_YEARS_OPTIONS.map((o) => (
                          <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {errors.investmentExperienceYears && <div className="invalid-feedback">{errors.investmentExperienceYears}</div>}
                    </div>
                    <div className="form-group form-group--full">
                      <label htmlFor="investment_experience_in">Investment Experience in <span className="text-danger">*</span></label>
                      <select
                          id="investment_experience_in"
                          multiple
                          size={OTHER_INVESTMENT_EXPERIENCE_IN.length}
                          value={experienceForm.investmentExperienceIn ?? []}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                            setExperienceForm({ ...experienceForm, investmentExperienceIn: selected });
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
            )}


            {activeTab === 'finalSubmit' && (
                <form className="investor-profile__card" onSubmit={handleFinalSubmit}>
                  <h3>Final Submit</h3>
                  <p className="investor-profile__hint">
                    <strong>Step 1:</strong> Click "Generate PDF Preview" to review your profile summary, or "Account Opening Kit Preview" for the complete document package.<br />
                    <strong>Step 2:</strong> After reviewing, check the boxes below and click "Submit Profile".<br />
                    You can also submit directly from the preview window.
                  </p>
                  <div className="investor-profile__grid investor-profile__final-submit">
                    <div className="form-group form-group--checkbox form-group--full">
                      <label>
                        <input
                            type="checkbox"
                            checked={finalSubmitForm.agreementComplete}
                            onChange={(e) => setFinalSubmitForm({ ...finalSubmitForm, agreementComplete: e.target.checked })}
                        />
                        I confirm that all information provided is true, complete and up to date.
                      </label>
                    </div>
                    <div className="form-group form-group--checkbox form-group--full">
                      <label>
                        <input
                            type="checkbox"
                            checked={finalSubmitForm.agreementLegal}
                            onChange={(e) => setFinalSubmitForm({ ...finalSubmitForm, agreementLegal: e.target.checked })}
                        />
                        I am acting on my own behalf and have legal capacity to contract.
                      </label>
                    </div>
                    <div className="form-group form-group--checkbox form-group--full">
                      <label>
                        <input
                            type="checkbox"
                            checked={finalSubmitForm.agreementModification}
                            onChange={(e) => setFinalSubmitForm({ ...finalSubmitForm, agreementModification: e.target.checked })}
                        />
                        I am aware that once I click <strong>Submit</strong>, any modification thereafter will require me to submit Request for Change.
                      </label>
                    </div>
                  </div>

                  <div className="investor-profile__buttons">
                    <button
                        type="button"
                        className="btn-preview"
                        onClick={handlePrintPreview}
                        disabled={saving}
                        style={{ backgroundColor: '#6c757d' }}
                    >
                      Generate PDF Preview (Summary)
                    </button>
                    <button
                        type="button"
                        className="btn-preview"
                        onClick={handleAccountOpeningKitPreview}
                        disabled={saving}
                        style={{ backgroundColor: '#28a745' }}
                    >
                      Account Opening Kit Preview (Complete)
                    </button>
                    <button
                        type="submit"
                        className="btn-save"
                        disabled={saving || !canSubmit || !finalSubmitForm.agreementComplete || !finalSubmitForm.agreementLegal || !finalSubmitForm.agreementModification}
                    >
                      {saving ? 'Submitting...' : 'Submit Profile'}
                    </button>
                    {!canSubmit && delegationPerms.isProxyMode && (
                      <small className="text-warning d-block mt-2">
                        You don't have permission to submit forms on behalf of this investor. Contact them to update delegation permissions.
                      </small>
                    )}
                  </div>
                </form>
            )}


            {activeTab === 'residential' && (
                <form className="investor-profile__card" onSubmit={handleSaveResidential}>
                  <h3>Proof of Address</h3>
                  <div className="investor-profile__grid">

                    {/* OCI Fields - For NRI Investors (investor_type = 630bd92a-38fe-ee11-9f89-6045bde85ebe) */}
                    <div className="form-group">
                      <label>OCI Card No<span className="text-danger">*</span></label>
                      <input
                          type="text"
                          className={errors.userOciCardNo ? 'form-control is-invalid' : 'form-control'}
                          value={residentialForm.userOciCardNo ?? ''}
                          onChange={(e) => setResidentialForm({ ...residentialForm, userOciCardNo: e.target.value })}
                      />
                      {errors.userOciCardNo && <div className="invalid-feedback">{errors.userOciCardNo}</div>}
                    </div>
                    <div className="form-group">
                      <label>Issue Date<span className="text-danger">*</span></label>
                      <input
                          type="date"
                          className={errors.userOciIssueDate ? 'form-control is-invalid' : 'form-control'}
                          value={residentialForm.userOciIssueDate ?? ''}
                          onChange={(e) => setResidentialForm({ ...residentialForm, userOciIssueDate: e.target.value })}
                      />
                      {errors.userOciIssueDate && <div className="invalid-feedback">{errors.userOciIssueDate}</div>}
                    </div>
                    <div className="form-group">
                      <label>Valid Upto</label>
                      <input
                          type="date"
                          className="form-control"
                          value={residentialForm.userOciValidUpto ?? ''}
                          onChange={(e) => setResidentialForm({ ...residentialForm, userOciValidUpto: e.target.value })}
                      />
                    </div>

                    {/* Type of Proof - For Foreign Nationals (investor_type = 3fccf13c-38fe-ee11-9f89-6045bde85ebe) */}
                    <div className="form-group">
                      <label>Type of Proof<span className="text-danger">*</span></label>
                      <select
                          className={errors.userTypeOfProof ? 'form-control is-invalid' : 'form-control'}
                          value={residentialForm.userTypeOfProof ?? ''}
                          onChange={(e) => setResidentialForm({ ...residentialForm, userTypeOfProof: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option value="Visa">Visa</option>
                        <option value="Resident Proof">Resident Card</option>
                      </select>
                      {errors.userTypeOfProof && <div className="invalid-feedback">{errors.userTypeOfProof}</div>}
                    </div>

                    {/* Visa Fields - Shown when Type of Proof = "Visa" */}
                    {residentialForm.userTypeOfProof === 'Visa' && (
                        <>
                          <div className="form-group">
                            <label>Visa Types<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={errors.userVisaType ? 'form-control is-invalid' : 'form-control'}
                                value={residentialForm.userVisaType ?? ''}
                                onChange={(e) => setResidentialForm({ ...residentialForm, userVisaType: e.target.value })}
                            />
                            {errors.userVisaType && <div className="invalid-feedback">{errors.userVisaType}</div>}
                          </div>
                          <div className="form-group">
                            <label>Visa Number<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={errors.userVisaNumber ? 'form-control is-invalid' : 'form-control'}
                                value={residentialForm.userVisaNumber ?? ''}
                                onChange={(e) => setResidentialForm({ ...residentialForm, userVisaNumber: e.target.value })}
                            />
                            {errors.userVisaNumber && <div className="invalid-feedback">{errors.userVisaNumber}</div>}
                          </div>
                          <div className="form-group">
                            <label>Visa Issuer Date<span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className={errors.userVisaIssuerDate ? 'form-control is-invalid' : 'form-control'}
                                value={residentialForm.userVisaIssuerDate ?? ''}
                                onChange={(e) => setResidentialForm({ ...residentialForm, userVisaIssuerDate: e.target.value })}
                            />
                            {errors.userVisaIssuerDate && <div className="invalid-feedback">{errors.userVisaIssuerDate}</div>}
                          </div>
                          <div className="form-group">
                            <label>Visa Expiry Date<span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className={errors.userVisaExpiryDate ? 'form-control is-invalid' : 'form-control'}
                                value={residentialForm.userVisaExpiryDate ?? ''}
                                onChange={(e) => setResidentialForm({ ...residentialForm, userVisaExpiryDate: e.target.value })}
                            />
                            {errors.userVisaExpiryDate && <div className="invalid-feedback">{errors.userVisaExpiryDate}</div>}
                          </div>
                        </>
                    )}

                    {/* Resident Card Fields - Shown when Type of Proof = "Resident Proof" */}
                    {residentialForm.userTypeOfProof === 'Resident Proof' && (
                        <>
                          <div className="form-group">
                            <label>Date Of Issue<span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className={errors.userVisaDateOfIssue ? 'form-control is-invalid' : 'form-control'}
                                value={residentialForm.userVisaDateOfIssue ?? ''}
                                onChange={(e) => setResidentialForm({ ...residentialForm, userVisaDateOfIssue: e.target.value })}
                            />
                            {errors.userVisaDateOfIssue && <div className="invalid-feedback">{errors.userVisaDateOfIssue}</div>}
                          </div>
                          <div className="form-group">
                            <label>Valid Upto</label>
                            <input
                                type="date"
                                className="form-control"
                                value={residentialForm.userVisaValidUpto ?? ''}
                                onChange={(e) => setResidentialForm({ ...residentialForm, userVisaValidUpto: e.target.value })}
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
            )}

            {activeTab === 'tax' && (
                <form className="investor-profile__card" onSubmit={handleSaveTaxInfo}>
                  <h3>Tax Information</h3>
                  <div className="investor-profile__grid">
                    <div className="form-group">
                      <label>PAN Number</label>
                      <input
                          value={taxInfoForm.panNumber ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, panNumber: e.target.value })}
                          placeholder="ABCDE1234F"
                      />
                    </div>
                    <div className="form-group">
                      <label>Name as per PAN Card</label>
                      <input
                          value={taxInfoForm.taxPanFirstName ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, taxPanFirstName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Father name as per PAN Card</label>
                      <input
                          value={taxInfoForm.taxPanFatherName ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, taxPanFatherName: e.target.value })}
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
                            setTaxInfoForm({
                              ...taxInfoForm,
                              taxResidencyCountry: v || undefined,
                              taxResidencyCountryId: v ? Number(v) : undefined,
                            });
                          }}
                          className={errors.taxResidencyCountry ? 'form-control is-invalid' : 'form-control'}
                      >
                        <option value="">Select country</option>
                        {taxResidencyCountries.map((c) => {
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
                          value={taxInfoForm.taxIdNumber ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, taxIdNumber: e.target.value })}
                          className={errors.tinNumber ? 'form-control is-invalid' : ''}
                      />
                      {errors.tinNumber && <div className="invalid-feedback">{errors.tinNumber}</div>}
                    </div>
                    <div className="form-group">
                      <label>Taxpayer Identification Number type <span className="text-danger">*</span></label>
                      <select
                          value={taxInfoForm.taxIdentificationNumberType ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, taxIdentificationNumberType: e.target.value })}
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
                          value={taxInfoForm.fatcaStatus ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, fatcaStatus: e.target.value })}
                          className={errors.fatcaStatus ? 'form-control is-invalid' : ''}
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
                          value={taxInfoForm.crsDeclaration ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, crsDeclaration: e.target.value })}
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
                          value={taxInfoForm.taxResidencyStatus ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, taxResidencyStatus: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option value="resident">Resident</option>
                        <option value="non-resident">Non-Resident</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>GST Number</label>
                      <input
                          value={taxInfoForm.gstNumber ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, gstNumber: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Income Source</label>
                      <input
                          value={taxInfoForm.incomeSource ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, incomeSource: e.target.value })}
                          placeholder="e.g., Salary, Business, Investment"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tax Residency Certificate Number (If Available)</label>
                      <input
                          value={taxInfoForm.taxResidencyCertificateNo ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, taxResidencyCertificateNo: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tax Residency Certificate Date</label>
                      <input
                          type="date"
                          value={taxInfoForm.taxResidencyCertificateDate ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, taxResidencyCertificateDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group form-group--full">
                      <label>Annual Income Range</label>
                      <select
                          value={taxInfoForm.annualIncome ?? ''}
                          onChange={(e) => setTaxInfoForm({ ...taxInfoForm, annualIncome: e.target.value })}
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
            )}

            {activeTab === 'bank' && (
                <form className="investor-profile__card" onSubmit={handleSaveBankDetails}>
                  <h3>Bank Details</h3>
                  <div className="investor-profile__grid">
                    <div className="form-group">
                      <label>Bank Name <span className="text-danger">*</span></label>
                      <input
                          value={bankDetailsForm.bankName ?? ''}
                          onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bankName: e.target.value })}
                          className={errors.bankName ? 'form-control is-invalid' : ''}
                      />
                      {errors.bankName && <div className="invalid-feedback">{errors.bankName}</div>}
                    </div>
                    <div className="form-group">
                      <label>Account Type <span className="text-danger">*</span></label>
                      <select
                          value={bankDetailsForm.accountType ?? ''}
                          onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, accountType: e.target.value })}
                          className={errors.accountType ? 'form-control is-invalid' : ''}
                      >
                        <option value="">Select</option>
                        <option value="savings">Savings</option>
                        <option value="current">Current</option>
                        <option value="nro">NRO</option>
                        <option value="nre">NRE</option>
                      </select>
                      {errors.accountType && <div className="invalid-feedback">{errors.accountType}</div>}
                    </div>

                    {/* PIS fields — visible only for NRO / NRE accounts */}
                    {(bankDetailsForm.accountType === 'nro' || bankDetailsForm.accountType === 'nre') && (
                        <>
                          <div className="form-group form-group--full">
                            <label>Do you have PIS Approval? <span className="text-danger">*</span></label>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'normal' }}>
                                <input
                                    type="radio"
                                    name="rbiApproval"
                                    value="yes"
                                    checked={bankDetailsForm.rbiApproval === 'yes'}
                                    onChange={() => setBankDetailsForm({ ...bankDetailsForm, rbiApproval: 'yes' })}
                                /> Yes
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'normal' }}>
                                <input
                                    type="radio"
                                    name="rbiApproval"
                                    value="no"
                                    checked={bankDetailsForm.rbiApproval === 'no'}
                                    onChange={() => setBankDetailsForm({ ...bankDetailsForm, rbiApproval: 'no' })}
                                /> No
                              </label>
                            </div>
                          </div>

                          {bankDetailsForm.rbiApproval === 'yes' && (
                              <>
                                <div className="form-group">
                                  <label>PIS Approval No <span className="text-danger">*</span></label>
                                  <input
                                      value={bankDetailsForm.rbiApprovalOrderNumber ?? ''}
                                      onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, rbiApprovalOrderNumber: e.target.value })}
                                      placeholder="e.g., PIS/2024/001"
                                  />
                                </div>
                                <div className="form-group">
                                  <label>PIS Approval Date <span className="text-danger">*</span></label>
                                  <input
                                      type="date"
                                      value={bankDetailsForm.rbiApprovalDate ?? ''}
                                      onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, rbiApprovalDate: e.target.value })}
                                  />
                                </div>
                               
                              </>
                          )}
                        </>
                    )}
                    <div className="form-group">
                                  <label>Beneficiary Name <span className="text-danger">*</span></label>
                                  <input
                                      value={bankDetailsForm.beneficiaryName ?? ''}
                                      onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, beneficiaryName: e.target.value })}
                                      className={errors.beneficiaryName ? 'form-control is-invalid' : ''}
                                  />
                                  {errors.beneficiaryName && <div className="invalid-feedback">{errors.beneficiaryName}</div>}
                                </div>
                    <div className="form-group">
                      <label>Bank Account Number <span className="text-danger">*</span></label>
                      <input
                          value={bankDetailsForm.bankAccountNumber ?? ''}
                          onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bankAccountNumber: e.target.value })}
                          className={errors.bankAccountNumber ? 'form-control is-invalid' : ''}
                      />
                      {errors.bankAccountNumber && <div className="invalid-feedback">{errors.bankAccountNumber}</div>}
                    </div>
                    <div className="form-group">
                      <label>IFSC Code <span className="text-danger">*</span></label>
                      <input
                          value={bankDetailsForm.bankIfscCode ?? ''}
                          onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bankIfscCode: e.target.value })}
                          placeholder="e.g., SBIN0001234"
                          className={errors.bankIfscCode ? 'form-control is-invalid' : ''}
                      />
                      {errors.bankIfscCode && <div className="invalid-feedback">{errors.bankIfscCode}</div>}
                    </div>
                    <div className="form-group">
                      <label>Branch name <span className="text-danger">*</span></label>
                      <input
                          value={bankDetailsForm.branchName ?? ''}
                          onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, branchName: e.target.value })}
                          className={errors.branchName ? 'form-control is-invalid' : ''}
                      />
                      {errors.branchName && <div className="invalid-feedback">{errors.branchName}</div>}
                    </div>
                    <div className="form-group form-group--full">
                      <label>Bank Address (Branch Address)</label>
                      <input
                          value={bankDetailsForm.bankBranchAddress ?? ''}
                          onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bankBranchAddress: e.target.value })}
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
            )}

            {activeTab === 'contact' && (
                <form className="investor-profile__card" onSubmit={handleSaveContactDetails}>
                  <h3>Contact Details</h3>
                  <div className="investor-profile__grid">
                    <div className="form-group">
                      <label>Proof of Address <span className="text-danger">*</span></label>
                      <select
                          value={contactDetailsForm.proofOfAddress ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, proofOfAddress: e.target.value })}
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
                          value={contactDetailsForm.addressLine1 ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, addressLine1: e.target.value })}
                          className={errors.addressLine1 ? 'form-control is-invalid' : ''}
                      />
                      {errors.addressLine1 && <div className="invalid-feedback">{errors.addressLine1}</div>}
                    </div>
                    <div className="form-group">
                      <label>City <span className="text-danger">*</span></label>
                      <input
                          value={contactDetailsForm.userCity ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, userCity: e.target.value })}
                          className={errors.userCity ? 'form-control is-invalid' : ''}
                      />
                      {errors.userCity && <div className="invalid-feedback">{errors.userCity}</div>}
                    </div>
                    <div className="form-group">
                      <label>State <span className="text-danger">*</span></label>
                      <input
                          value={contactDetailsForm.userState ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, userState: e.target.value })}
                          className={errors.userState ? 'form-control is-invalid' : ''}
                      />
                      {errors.userState && <div className="invalid-feedback">{errors.userState}</div>}
                    </div>
                    <div className="form-group">
                      <label>Postal/ Zip code <span className="text-danger">*</span></label>
                      <input
                          value={contactDetailsForm.userZipCode ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, userZipCode: e.target.value })}
                          className={errors.userZipCode ? 'form-control is-invalid' : ''}
                      />
                      {errors.userZipCode && <div className="invalid-feedback">{errors.userZipCode}</div>}
                    </div>
                    <div className="form-group">
                      <label>Country <span className="text-danger">*</span></label>
                      <input
                          value={contactDetailsForm.userCountry ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, userCountry: e.target.value })}
                      />
                    </div>
                    <div className="form-group form-group--checkbox form-group--full">
                      <label>
                        <input
                            type="checkbox"
                            checked={contactDetailsForm.corrAddressSameAsPerm === 'true' || contactDetailsForm.corrAddressSameAsPerm === '1'}
                            onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, corrAddressSameAsPerm: e.target.checked ? 'true' : 'false' })}
                        />
                        Correspondance Address is Same As Above
                      </label>
                    </div>

                    {!(contactDetailsForm.corrAddressSameAsPerm === 'true' || contactDetailsForm.corrAddressSameAsPerm === '1') && (
                        <>
                          <div className="form-group">
                            <label>Address Type <span className="text-danger">*</span></label>
                            <select
                                value={contactDetailsForm.addressType ?? ''}
                                onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, addressType: e.target.value })}
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
                                value={contactDetailsForm.corrAddressLine1 ?? ''}
                                onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, corrAddressLine1: e.target.value })}
                                className={errors.corrAddressLine1 ? 'form-control is-invalid' : ''}
                            />
                            {errors.corrAddressLine1 && <div className="invalid-feedback">{errors.corrAddressLine1}</div>}
                          </div>
                          <div className="form-group">
                            <label>City <span className="text-danger">*</span></label>
                            <input
                                value={contactDetailsForm.corrUserCity ?? ''}
                                onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, corrUserCity: e.target.value })}
                                className={errors.corrUserCity ? 'form-control is-invalid' : ''}
                            />
                            {errors.corrUserCity && <div className="invalid-feedback">{errors.corrUserCity}</div>}
                          </div>
                          <div className="form-group">
                            <label>State <span className="text-danger">*</span></label>
                            <input
                                value={contactDetailsForm.corrUserState ?? ''}
                                onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, corrUserState: e.target.value })}
                                className={errors.corrUserState ? 'form-control is-invalid' : ''}
                            />
                            {errors.corrUserState && <div className="invalid-feedback">{errors.corrUserState}</div>}
                          </div>
                          <div className="form-group">
                            <label>Postal/ zip code<span className="text-danger">*</span></label>
                            <input
                                value={contactDetailsForm.corrUserZipCode ?? ''}
                                onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, corrUserZipCode: e.target.value })}
                                className={errors.corrUserZipCode ? 'form-control is-invalid' : ''}
                            />
                            {errors.corrUserZipCode && <div className="invalid-feedback">{errors.corrUserZipCode}</div>}
                          </div>
                        </>
                    )}

                    <div className="form-group">
                      <label>Email ID <span className="text-danger">*</span></label>
                      <input
                          type="email"
                          value={contactDetailsForm.email ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, email: e.target.value })}
                          className={errors.email ? 'form-control is-invalid' : ''}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="form-group">
                      <label>Country Code <span className="text-danger">*</span></label>
                      <input
                          value={contactDetailsForm.isdCode ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, isdCode: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone No <span className="text-danger">*</span></label>
                      <input
                          type="tel"
                          value={contactDetailsForm.primaryPhone ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, primaryPhone: e.target.value })}
                          className={errors.primaryPhone ? 'form-control is-invalid' : ''}
                      />
                      {errors.primaryPhone && <div className="invalid-feedback">{errors.primaryPhone}</div>}
                    </div>
                    <div className="form-group">
                      <label>Secondary Mobile</label>
                      <input
                          type="tel"
                          value={contactDetailsForm.secondaryPhone ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, secondaryPhone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>WhatsApp Number</label>
                      <input
                          type="tel"
                          value={contactDetailsForm.whatsappNumber ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, whatsappNumber: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Landline Number</label>
                      <input
                          type="tel"
                          value={contactDetailsForm.secondaryPhone ?? ''} // Mapping landline to secondaryPhone for now
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, secondaryPhone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Preferred Contact Method <span className="text-danger">*</span></label>
                      <select
                          value={contactDetailsForm.preferredContactMethod ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, preferredContactMethod: e.target.value })}
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
                          value={contactDetailsForm.preferredContactTime ?? ''}
                          onChange={(e) => setContactDetailsForm({ ...contactDetailsForm, preferredContactTime: e.target.value })}
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
            )}

            {activeTab === 'nomination' && (
                <form className="investor-profile__card" onSubmit={handleSaveNomination}>
                  <h3>Nomination Details</h3>
                  <div className="form-group form-group--full" style={{ marginBottom: '1rem' }}>
                    <span className="d-block mb-1">Do you wish to register nomination? <span className="text-danger">*</span></span>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <label className="mb-0">
                        <input
                            type="radio"
                            name="appointNominee"
                            checked={nominationForm.appointNominee === true}
                            onChange={() => setNominationForm({ ...nominationForm, appointNominee: true })}
                        />{' '}
                        Yes
                      </label>
                      <label className="mb-0">
                        <input
                            type="radio"
                            name="appointNominee"
                            checked={nominationForm.appointNominee === false}
                            onChange={() => setNominationForm({ ...nominationForm, appointNominee: false })}
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
                  {nominationForm.appointNominee === true && (
                  <div className="investor-profile__grid">
                    <div className="form-group form-group--full">
                      <h4 style={{ margin: '0.25rem 0 0.5rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '0.35rem' }}>
                        Nominee 1
                      </h4>
                    </div>
                    <div className="form-group">
                      <label>Name of the Nominee <span className="text-danger">*</span></label>
                      <input
                          value={nominationForm.nomineeName1 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeName1: e.target.value })}
                          className={errors.nomineeName1 ? 'form-control is-invalid' : 'form-control'}
                      />
                      {errors.nomineeName1 && <div className="invalid-feedback">{errors.nomineeName1}</div>}
                    </div>
                    <div className="form-group">
                      <label>Nominee Middle Name</label>
                      <input
                          className="form-control"
                          value={nominationForm.nomineeMiddleName ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeMiddleName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee Last Name</label>
                      <input
                          className="form-control"
                          value={nominationForm.nomineeLastName ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeLastName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Relationship with Applicant <span className="text-danger">*</span></label>
                      <select
                          value={nominationForm.nomineeRelation1 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeRelation1: e.target.value })}
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
                          value={nominationForm.nomineeDob1 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeDob1: e.target.value })}
                          className={errors.nomineeDob1 ? 'form-control is-invalid' : 'form-control'}
                      />
                      {errors.nomineeDob1 && <div className="invalid-feedback">{errors.nomineeDob1}</div>}
                    </div>
                    <div className="form-group">
                      <label>Email Address of Nominee</label>
                      <input
                          type="email"
                          className="form-control"
                          value={nominationForm.nomineeEmail1 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeEmail1: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>ISD Code</label>
                      <select
                          value={nominationForm.nomineeCountrycode1 ?? ''}
                          onChange={(e) =>
                            setNominationForm({
                              ...nominationForm,
                              nomineeCountrycode1: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="form-control"
                      >
                        <option value="">Select ISD</option>
                        {isdCodes.map((c) => {
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
                          value={nominationForm.nomineeMobile1 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeMobile1: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee Document Type</label>
                      <select
                          value={nominationForm.nomineeDocType1 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeDocType1: e.target.value })}
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
                          value={nominationForm.nomineeDocNo1 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeDocNo1: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee Share (%) <span className="text-danger">*</span></label>
                      <input
                          type="number"
                          min={1}
                          max={100}
                          value={nominationForm.nomineeShare1 ?? ''}
                          onChange={(e) => updateNomineeShare1FromInput(e.target.value)}
                          className={errors.nomineeShare1 ? 'form-control is-invalid' : 'form-control'}
                      />
                      {errors.nomineeShare1 && <div className="invalid-feedback">{errors.nomineeShare1}</div>}
                    </div>
                    <div className="form-group form-group--full">
                      <label>Nominee Address</label>
                      <input
                          className="form-control"
                          value={nominationForm.nomineeAddress ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeAddress: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                          className="form-control"
                          value={nominationForm.nomineeCity ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeCity: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                          className="form-control"
                          value={nominationForm.nomineeState ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeState: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                          className="form-control"
                          value={nominationForm.nomineePostalCode ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineePostalCode: e.target.value })}
                      />
                    </div>

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
                          value={nominationForm.nomineeName2 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeName2: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Relationship</label>
                      <select
                          className={errors.nomineeRelation2 ? 'form-control is-invalid' : 'form-control'}
                          value={nominationForm.nomineeRelation2 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeRelation2: e.target.value })}
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
                          value={nominationForm.nomineeDob2 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeDob2: e.target.value })}
                      />
                      {errors.nomineeDob2 && <div className="invalid-feedback">{errors.nomineeDob2}</div>}
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                          type="email"
                          className="form-control"
                          value={nominationForm.nomineeEmail2 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeEmail2: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>ISD</label>
                      <select
                          className="form-control"
                          value={nominationForm.nomineeCountrycode2 ?? ''}
                          onChange={(e) =>
                            setNominationForm({
                              ...nominationForm,
                              nomineeCountrycode2: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                      >
                        <option value="">Select ISD</option>
                        {isdCodes.map((c) => {
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
                          value={nominationForm.nomineeMobile2 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeMobile2: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Document Type</label>
                      <select
                          className="form-control"
                          value={nominationForm.nomineeDocType2 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeDocType2: e.target.value })}
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
                          value={nominationForm.nomineeDocNo2 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeDocNo2: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Share (%)</label>
                      <input
                          type="number"
                          min={1}
                          max={100}
                          className={errors.nomineeShare2 ? 'form-control is-invalid' : 'form-control'}
                          value={nominationForm.nomineeShare2 ?? ''}
                          onChange={(e) => updateNomineeShare2FromInput(e.target.value)}
                      />
                      {errors.nomineeShare2 && <div className="invalid-feedback">{errors.nomineeShare2}</div>}
                    </div>
                    </>
                    )}

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
                          value={nominationForm.nomineeName3 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeName3: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Relationship</label>
                      <select
                          className={errors.nomineeRelation3 ? 'form-control is-invalid' : 'form-control'}
                          value={nominationForm.nomineeRelation3 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeRelation3: e.target.value })}
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
                          value={nominationForm.nomineeDob3 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeDob3: e.target.value })}
                      />
                      {errors.nomineeDob3 && <div className="invalid-feedback">{errors.nomineeDob3}</div>}
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                          type="email"
                          className="form-control"
                          value={nominationForm.nomineeEmail3 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeEmail3: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>ISD</label>
                      <select
                          className="form-control"
                          value={nominationForm.nomineeCountrycode3 ?? ''}
                          onChange={(e) =>
                            setNominationForm({
                              ...nominationForm,
                              nomineeCountrycode3: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                      >
                        <option value="">Select ISD</option>
                        {isdCodes.map((c) => {
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
                          value={nominationForm.nomineeMobile3 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeMobile3: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Document Type</label>
                      <select
                          className="form-control"
                          value={nominationForm.nomineeDocType3 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeDocType3: e.target.value })}
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
                          value={nominationForm.nomineeDocNo3 ?? ''}
                          onChange={(e) => setNominationForm({ ...nominationForm, nomineeDocNo3: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Share (%)</label>
                      <input
                          type="number"
                          min={1}
                          max={100}
                          className={errors.nomineeShare3 ? 'form-control is-invalid' : 'form-control'}
                          value={nominationForm.nomineeShare3 ?? ''}
                          onChange={(e) =>
                            setNominationForm({
                              ...nominationForm,
                              nomineeShare3: e.target.value ? Number.parseInt(e.target.value, 10) : undefined,
                            })
                          }
                      />
                      {errors.nomineeShare3 && <div className="invalid-feedback">{errors.nomineeShare3}</div>}
                    </div>
                    </>
                    )}

                    <div className="form-group form-group--checkbox">
                      <label>
                        <input
                            type="checkbox"
                            checked={nominationForm.isMinor ?? false}
                            onChange={(e) => setNominationForm({ ...nominationForm, isMinor: e.target.checked })}
                        />
                        Nominee is a Minor
                      </label>
                    </div>
                    {nominationForm.isMinor && (
                        <>
                          <div className="form-group form-group--full">
                            <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#333' }}>Guardian Details (Nominee 1)</h4>
                          </div>
                          <div className="form-group">
                            <label>Name of Guardian <span className="text-danger">*</span></label>
                            <input
                                className={errors.guardianName1 ? 'form-control is-invalid' : 'form-control'}
                                value={nominationForm.guardianName1 ?? ''}
                                onChange={(e) => setNominationForm({ ...nominationForm, guardianName1: e.target.value })}
                            />
                            {errors.guardianName1 && <div className="invalid-feedback">{errors.guardianName1}</div>}
                          </div>
                          <div className="form-group">
                            <label>Relationship of Guardian to Nominee <span className="text-danger">*</span></label>
                            <select
                                className={errors.guardianRelationship ? 'form-control is-invalid' : 'form-control'}
                                value={nominationForm.guardianRelationship ?? ''}
                                onChange={(e) => setNominationForm({ ...nominationForm, guardianRelationship: e.target.value })}
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
                                value={nominationForm.guardianDocType1 ?? ''}
                                onChange={(e) => setNominationForm({ ...nominationForm, guardianDocType1: e.target.value })}
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
                                value={nominationForm.guardianDocNo1 ?? ''}
                                onChange={(e) => setNominationForm({ ...nominationForm, guardianDocNo1: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>ISD Code</label>
                            <select
                                className="form-control"
                                value={nominationForm.guardianCountrycode1 ?? ''}
                                onChange={(e) =>
                                  setNominationForm({
                                    ...nominationForm,
                                    guardianCountrycode1: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                            >
                              <option value="">Select ISD</option>
                              {isdCodes.map((c) => {
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
                            <label>Mobile Number of Guardian</label>
                            <input
                                type="tel"
                                className="form-control"
                                value={nominationForm.guardianMobile1 ?? ''}
                                onChange={(e) => setNominationForm({ ...nominationForm, guardianMobile1: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Email Address of Guardian</label>
                            <input
                                type="email"
                                className="form-control"
                                value={nominationForm.guardianEmail1 ?? ''}
                                onChange={(e) => setNominationForm({ ...nominationForm, guardianEmail1: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>PAN number of Guardian</label>
                            <input
                                className="form-control"
                                value={nominationForm.guardianPanNo1 ?? ''}
                                onChange={(e) => setNominationForm({ ...nominationForm, guardianPanNo1: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Date of Birth of Guardian</label>
                            <input
                                type="date"
                                className="form-control"
                                value={nominationForm.guardianDob1 ?? ''}
                                onChange={(e) => setNominationForm({ ...nominationForm, guardianDob1: e.target.value })}
                            />
                          </div>
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
            )}

          </div>
          <Footer />
        </div>
      </div >
  );
};
