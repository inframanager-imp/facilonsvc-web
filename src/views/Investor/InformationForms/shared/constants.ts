/**
 * Shared constants for investor information forms
 * Extracted from InvestorProfile.tsx
 */

/** Nomination: relationship options (aligned with Laravel / investor nomination forms). */
export const NOMINATION_RELATIONSHIP_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

export const NOMINATION_DOC_TYPE_OPTIONS: { value: string; label: string }[] = [
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
export const OTHER_SOURCE_OF_FUNDS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'Salary', label: 'Salary' },
  { value: 'Business Income', label: 'Business Income' },
  { value: 'Investment Income', label: 'Investment Income' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Others', label: 'Others' },
];

export const OTHER_EDUCATION_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'Under Graduate', label: 'Under-Graduate' },
  { value: 'Graduate', label: 'Graduate' },
  { value: 'Post Graduate', label: 'Post Graduate' },
  { value: 'Others', label: 'Others' },
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

export const OTHER_INVESTMENT_EXPERIENCE_YEARS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'Less than 2 years', label: 'Less than 2 years' },
  { value: '2-5 year', label: '2-5 years' },
  { value: 'More than 5 year', label: 'More than 5 years' },
];

export const OTHER_INVESTMENT_EXPERIENCE_IN: readonly string[] = ['Equity', 'Debt', 'Derivative', 'Commodities', 'Others'];
