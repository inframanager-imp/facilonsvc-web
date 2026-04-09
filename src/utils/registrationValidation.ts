/**
 * Robust validation utilities for investor registration.
 * Validates each field with proper rules, formats, and user-friendly error messages.
 */

/** India country ID (from master_country - commonly 1) */
const INDIA_COUNTRY_ID = 1;

/** Personal email domains not allowed for legal entity registration */
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
  'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com',
  'yandex.com', 'gmx.com', 'inbox.com', 'mail.ru', 'qq.com',
  '163.com', '126.com', 'rediffmail.com', 'yahoo.co.in', 'yahoo.co.uk',
];

/** Valid website format: www.xxx.xxx */
const WEBSITE_REGEX = /^(www\.)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

/** Standard email regex (RFC 5322 simplified) */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Name: letters, spaces, hyphens, apostrophes; 2-100 chars */
const NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'.-]{2,100}$/;

/** Digits only for phone */
const PHONE_DIGITS_REGEX = /^\d+$/;

/** OTP: exactly 4 digits */
const OTP_REGEX = /^\d{4}$/;

export interface MainStepErrors {
  fullName?: string;
  registerAs?: string;
  market?: string;
  countryOfIncorporation?: string;
  countryOfTaxResidency?: string;
  entityWebsite?: string;
}

export interface Step1Errors {
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  userDob?: string;
  representativeCapacity?: string;
}

export interface OtpErrors {
  emailOtp?: string;
  smsOtp?: string;
}

export interface Step3Errors {
  citizenship?: string;
  countryOfResidence?: string;
  nationality?: string;
  residenceType?: string;
  pancardStatus?: string;
  ociCardStatus?: string;
  indianOrigin?: string;
  confirmation?: string;
  privacyPolicyAccepted?: string;
  notificationConsent?: string;
}

/** Validate full name (individual or legal entity) */
function validateFullName(value: string, isLegalEntity: boolean): string | undefined {
  const trimmed = (value || '').trim();
  if (!trimmed) return 'Full name is required';
  if (trimmed.length < 2) return 'Full name must be at least 2 characters';
  if (trimmed.length > 150) return 'Full name must not exceed 150 characters';
  if (!NAME_REGEX.test(trimmed)) {
    return 'Full name may only contain letters, spaces, hyphens, and apostrophes';
  }
  if (isLegalEntity && trimmed.length < 3) {
    return 'Legal entity name must be at least 3 characters';
  }
  return undefined;
}

/** Validate website URL format (www.example.com) */
function validateEntityWebsite(value: string | undefined): string | undefined {
  if (!value || !value.trim()) return undefined; // optional
  const trimmed = value.trim();
  if (!WEBSITE_REGEX.test(trimmed)) {
    return 'Invalid website format. Expected format: www.example.com';
  }
  if (trimmed.length > 255) return 'Website URL must not exceed 255 characters';
  return undefined;
}

/** Validate email format and optionally enforce corporate email */
function validateEmail(value: string, requireCorporate: boolean): string | undefined {
  const trimmed = (value || '').trim();
  if (!trimmed) return 'Email is required';
  if (trimmed.length > 254) return 'Email is too long';
  if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address';
  if (requireCorporate) {
    const domain = trimmed.toLowerCase().split('@')[1];
    if (PERSONAL_EMAIL_DOMAINS.some(d => domain === d)) {
      return 'Corporate email required. Personal email domains (gmail, yahoo, etc.) are not allowed.';
    }
  }
  return undefined;
}

/** Validate first/middle/last name */
function validateNameField(value: string, fieldName: string, required: boolean): string | undefined {
  const trimmed = (value || '').trim();
  if (!trimmed) return required ? `${fieldName} is required` : undefined;
  if (trimmed.length < 2) return `${fieldName} must be at least 2 characters`;
  if (trimmed.length > 50) return `${fieldName} must not exceed 50 characters`;
  if (!NAME_REGEX.test(trimmed)) {
    return `${fieldName} may only contain letters, spaces, hyphens, and apostrophes`;
  }
  return undefined;
}

/** Validate mobile number - supports India (10 digits) and international */
function validateMobileNumber(value: string, countryCode?: number): string | undefined {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return 'Mobile number is required';
  if (!PHONE_DIGITS_REGEX.test(digits)) return 'Mobile number must contain only digits';
  // India (countryCode 240 in your data) typically uses 10 digits
  if (countryCode === 240 || countryCode === 1) {
    // India-like: 10 digits
    if (digits.length < 10) return 'Mobile number must be at least 10 digits';
    if (digits.length > 15) return 'Mobile number must not exceed 15 digits';
  } else {
    if (digits.length < 7) return 'Mobile number must be at least 7 digits';
    if (digits.length > 15) return 'Mobile number must not exceed 15 digits';
  }
  return undefined;
}

/** Validate optional WhatsApp number */
function validateWhatsAppNumber(value: string): string | undefined {
  if (!value || !value.trim()) return undefined;
  const digits = value.replace(/\D/g, '');
  if (!digits) return undefined;
  if (!PHONE_DIGITS_REGEX.test(digits)) return 'WhatsApp number must contain only digits';
  if (digits.length < 7 || digits.length > 15) return 'WhatsApp number must be 7-15 digits';
  return undefined;
}

/** Validate date of birth - must be in the past, 18+ years */
function validateDateOfBirth(value: string | undefined): string | undefined {
  if (!value || !value.trim()) return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Invalid date of birth';
  const today = new Date();
  if (date > today) return 'Date of birth cannot be in the future';
  const age = (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 18) return 'You must be at least 18 years old to register';
  if (age > 120) return 'Please enter a valid date of birth';
  return undefined;
}

/** Validate OTP - 4 digits */
function validateOtp(value: string, fieldName: string): string | undefined {
  const trimmed = (value || '').trim();
  if (!trimmed) return `${fieldName} is required`;
  if (!OTP_REGEX.test(trimmed)) return `${fieldName} must be exactly 4 digits`;
  return undefined;
}

/** Validate select field has valid value (not 0 or empty) */
function validateSelect(value: number | undefined, fieldName: string): string | undefined {
  if (value === undefined || value === null) return `${fieldName} is required`;
  if (value === 0) return `Please select ${fieldName}`;
  return undefined;
}

/** Validate residence type */
function validateResidenceType(value: string): string | undefined {
  if (!value || !value.trim()) return 'Residence type is required';
  if (!['resident', 'non-resident'].includes(value.trim().toLowerCase())) {
    return 'Please select a valid residence type';
  }
  return undefined;
}

/** Validate yes/no select for India market (pancardStatus, ociCardStatus, indianOrigin) */
function validateYesNoSelect(value: string | undefined, fieldName: string, required: boolean): string | undefined {
  if (!value || !value.trim()) return required ? `Please select ${fieldName}` : undefined;
  if (!['yes', 'no'].includes(value.trim().toLowerCase())) return `Please select Yes or No for ${fieldName}`;
  return undefined;
}

export interface MainStepData {
  fullName: string;
  registerAs: number;
  market: number;
  countryOfIncorporation?: number;
  countryOfTaxResidency?: number;
  entityWebsite?: string;
}

export function validateMainStep(data: MainStepData): MainStepErrors {
  const errors: MainStepErrors = {};
  const isLegalEntity = data.registerAs === 2;

  const fullNameErr = validateFullName(data.fullName, isLegalEntity);
  if (fullNameErr) errors.fullName = fullNameErr;

  if (!data.registerAs || (data.registerAs !== 1 && data.registerAs !== 2)) {
    errors.registerAs = 'Please select registration type';
  }

  if (!data.market || data.market === 0) {
    errors.market = 'Please select market';
  }

  if (isLegalEntity) {
    if (!data.countryOfIncorporation) {
      errors.countryOfIncorporation = 'Country of incorporation is required for legal entity';
    }
    if (!data.countryOfTaxResidency) {
      errors.countryOfTaxResidency = 'Country of tax residency is required for legal entity';
    }
    const websiteErr = validateEntityWebsite(data.entityWebsite);
    if (websiteErr) errors.entityWebsite = websiteErr;
  }

  return errors;
}

export interface Step1Data {
  title: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber?: string;
  countryCode: number;
  userDob?: string;
  representativeCapacity?: string;
  isLegalEntity?: boolean;
}

export function validateStep1(data: Step1Data): Step1Errors {
  const errors: Step1Errors = {};

  const titleErr = validateSelect(data.title, 'Title');
  if (titleErr) errors.title = titleErr;

  const firstNameErr = validateNameField(data.firstName, 'First name', true);
  if (firstNameErr) errors.firstName = firstNameErr;

  const middleNameErr = validateNameField(data.middleName || '', 'Middle name', false);
  if (middleNameErr) errors.middleName = middleNameErr;

  const lastNameErr = validateNameField(data.lastName, 'Last name', true);
  if (lastNameErr) errors.lastName = lastNameErr;

  const emailErr = validateEmail(data.email, !!data.isLegalEntity);
  if (emailErr) errors.email = emailErr;

  const mobileErr = validateMobileNumber(data.mobileNumber, data.countryCode);
  if (mobileErr) errors.mobileNumber = mobileErr;

  const whatsappErr = validateWhatsAppNumber(data.whatsappNumber || '');
  if (whatsappErr) errors.whatsappNumber = whatsappErr;

  const dobErr = validateDateOfBirth(data.userDob);
  if (dobErr) errors.userDob = dobErr;

  return errors;
}

export interface OtpData {
  emailOtp: string;
  smsOtp: string;
}

export function validateOtpStep(data: OtpData): OtpErrors {
  const errors: OtpErrors = {};

  const emailOtpErr = validateOtp(data.emailOtp, 'Email OTP');
  if (emailOtpErr) errors.emailOtp = emailOtpErr;

  const smsOtpErr = validateOtp(data.smsOtp, 'SMS OTP');
  if (smsOtpErr) errors.smsOtp = smsOtpErr;

  return errors;
}

export interface Step3Data {
  citizenship: number;
  countryOfResidence: number;
  nationality: number;
  residenceType: string;
  pancardStatus?: string;
  ociCardStatus?: string;
  indianOrigin?: string;
  confirmation: boolean;
  privacyPolicyAccepted: boolean;
  notificationConsent: boolean;
  market?: number; // From main step - for India-specific validation
}

export function validateStep3(data: Step3Data): Step3Errors {
  const errors: Step3Errors = {};
  const isIndiaMarket = data.market === 1 || data.market === INDIA_COUNTRY_ID;

  const citizenshipErr = validateSelect(data.citizenship, 'Citizenship');
  if (citizenshipErr) errors.citizenship = citizenshipErr;

  const residenceErr = validateSelect(data.countryOfResidence, 'Country of residence');
  if (residenceErr) errors.countryOfResidence = residenceErr;

  const nationalityErr = validateSelect(data.nationality, 'Nationality');
  if (nationalityErr) errors.nationality = nationalityErr;

  const residenceTypeErr = validateResidenceType(data.residenceType);
  if (residenceTypeErr) errors.residenceType = residenceTypeErr;

  // India market: require PAN, OCI, Indian origin to be explicitly selected
  if (isIndiaMarket) {
    const panErr = validateYesNoSelect(data.pancardStatus, 'Do you have a PAN Card?', true);
    if (panErr) errors.pancardStatus = panErr;

    const ociErr = validateYesNoSelect(data.ociCardStatus, 'Do you have an OCI Card?', true);
    if (ociErr) errors.ociCardStatus = ociErr;

    const originErr = validateYesNoSelect(data.indianOrigin, 'Are you of Indian Origin?', true);
    if (originErr) errors.indianOrigin = originErr;
  }

  if (!data.confirmation) {
    errors.confirmation = 'Please confirm that the information provided is correct';
  }
  if (!data.privacyPolicyAccepted) {
    errors.privacyPolicyAccepted = 'Please accept the Privacy Policy and Terms of Use';
  }
  if (!data.notificationConsent) {
    errors.notificationConsent = 'Please agree to receive notifications from Facilon';
  }

  return errors;
}

/** Union of all step error types for hasValidationErrors */
export type AnyValidationErrors = MainStepErrors | Step1Errors | OtpErrors | Step3Errors;

/** Check if validation errors object has any errors */
export function hasValidationErrors(errors: AnyValidationErrors): boolean {
  return Object.values(errors).some(v => v && v.length > 0);
}
