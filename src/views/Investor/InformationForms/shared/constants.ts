/**
 * Shared constants for investor information forms
 * Extracted from InvestorProfile.tsx
 *
 * CONVENTION: dropdown `value`s are always stored UPPERCASE so the value
 * persisted to the DB matches the UI state on round-trip without any
 * case-normalisation layer. Labels stay in readable case for display.
 * Numeric-only values (marital-status codes, income-bracket ids) stay as
 * their original codes — they're not language tokens.
 */

/** Nomination: relationship options (aligned with Laravel / investor nomination forms). */
export const NOMINATION_RELATIONSHIP_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'CHILD', label: 'Child' },
  { value: 'SIBLING', label: 'Sibling' },
  { value: 'OTHER', label: 'Other' },
];

export const NOMINATION_DOC_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'PAN', label: 'PAN' },
  { value: 'AADHAAR', label: 'Aadhaar' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING LICENSE', label: 'Driving License' },
  { value: 'VOTER ID', label: 'Voter ID' },
  { value: 'OCI CARD', label: 'OCI Card' },
  { value: 'OTHER', label: 'Other' },
];

/** Aligned with `information-update.blade.php` Section8 (Other Information). */
export const OTHER_SOURCE_OF_FUNDS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'SALARY', label: 'Salary' },
  { value: 'BUSINESS INCOME', label: 'Business Income' },
  { value: 'INVESTMENT INCOME', label: 'Investment Income' },
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'OTHERS', label: 'Others' },
];

export const OTHER_EDUCATION_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'UNDER GRADUATE', label: 'Under-Graduate' },
  { value: 'GRADUATE', label: 'Graduate' },
  { value: 'POST GRADUATE', label: 'Post Graduate' },
  { value: 'OTHERS', label: 'Others' },
];

export const OTHER_GROSS_INCOME_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: '100000', label: 'Below 1 lakh' },
  { value: '500000', label: '1 to 5 lakhs' },
  { value: '1000000', label: '5 to 10 lakhs' },
  { value: '1500000', label: '10 to 25 lakhs' },
  { value: '2000000', label: 'Above 25 lakhs' },
];

export const OTHER_NET_WORTH_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: '1000000', label: 'Less than 50 lakhs' },
  { value: '5000000', label: '50 - 100 lakhs' },
  { value: '10000000', label: 'Above 100 lakhs' },
];

export const OTHER_OCCUPATION_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'SALARIED - PVT SECTOR', label: 'Salaried - Pvt Sector' },
  { value: 'SALARIED - PUBLIC SECTOR', label: 'Salaried - Public Sector' },
  { value: 'SALARIED - GOVT SERVICE', label: 'Salaried - GOVT Service' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'AGRIICULTURIST', label: 'Agriiculturist' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'HOUSEWIFE', label: 'Housewife' },
  { value: 'OTHERS', label: 'Others' },
];

export const OTHER_INVESTMENT_EXPERIENCE_YEARS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'LESS THAN 2 YEARS', label: 'Less than 2 years' },
  { value: '2-5 YEAR', label: '2-5 years' },
  { value: 'MORE THAN 5 YEAR', label: 'More than 5 years' },
];

export const OTHER_INVESTMENT_EXPERIENCE_IN: readonly string[] = ['EQUITY', 'DEBT', 'DERIVATIVE', 'COMMODITIES', 'OTHERS'];
