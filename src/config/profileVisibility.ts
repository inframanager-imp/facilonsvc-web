/**
 * Profile-form visibility config.
 *
 * Drives show/hide of sections and fields on /investor/dashboard?tab=profile
 * (and the underlying Information forms) based on the investor's
 * `investor_type`. Only RESIDENT_INDIVIDUAL has overrides right now — every
 * other type (NRI / OCI / FOREIGN_NATIONAL / RESIDENT_NON_INDIVIDUAL /
 * FOREIGN_NON_INDIVIDUAL / null / undefined) falls through to "show
 * everything" so the existing NRI/OCI experience stays byte-identical.
 *
 * Adding a new investor-type ruleset later is a pure data change — add an
 * entry to VISIBILITY_RULES and the helpers below pick it up automatically.
 */

export type InvestorType =
  | 'RESIDENT_INDIVIDUAL'
  | 'NRI'
  | 'OCI'
  | 'FOREIGN_NATIONAL'
  | 'RESIDENT_NON_INDIVIDUAL'
  | 'FOREIGN_NON_INDIVIDUAL';

/**
 * Keys for tabs on the profile page. Kept as a string-literal union so a
 * typo in a caller (`'bnk'` instead of `'bank'`) is a compile error.
 */
export type ProfileSectionKey =
  | 'personal'
  | 'bank'
  | 'passport'
  | 'residential' // label becomes "Aadhaar Details" for RI
  | 'tax'
  | 'contact'
  | 'nomination'
  | 'risk'
  | 'finalSubmit';

/**
 * Field keys use dotted paths — "section.field" — so each form can look up
 * just the fields it owns without coordinating with siblings.
 */
export type ProfileFieldKey = string;

interface VisibilityRuleset {
  /** Section-level hides. A section not listed here defaults to visible. */
  sections?: Partial<Record<ProfileSectionKey, boolean>>;
  /** Field-level hides. A field not listed here defaults to visible. */
  fields?: Record<ProfileFieldKey, boolean>;
  /** Section label overrides (e.g. "Residential Status" → "Aadhaar Details"). */
  sectionLabels?: Partial<Record<ProfileSectionKey, string>>;
}

/**
 * RESIDENT_INDIVIDUAL rules per the agreed matrix. Anything not listed is
 * shown (default). `false` = hide. Sections/fields flagged here are the
 * only places UI gating fires.
 */
const RESIDENT_INDIVIDUAL_RULES: VisibilityRuleset = {
  sections: {
    passport: false, // entire Passport Details tab hidden
  },
  sectionLabels: {
    residential: 'Aadhaar Details',
  },
  fields: {
    // Personal Information — maiden fields only show when Female + Married.
    // The form also evaluates gender+maritalStatus; this key is consulted in
    // addition to that condition.
    'personal.maidenTitle': false,
    'personal.maidenName': false,
    'personal.maidenMiddleName': false,
    'personal.maidenLastName': false,

    // Bank Details — NRE / NRO / PIS not applicable to RI.
    // Country stays visible but is defaulted to India both in the form's
    // initial state and server-side on save.
    'bank.haveNreAccount': false,
    'bank.settlementAccountType': false, // NRE/NRO dropdown
    'bank.rbiApproval': false, // "Do you have PIS Approval?"
    'bank.rbiApprovalOrderNumber': false, // PIS Approval Number
    'bank.rbiApprovalDate': false, // PIS Approval Date

    // Residential Status → Aadhaar Details — gut to Aadhaar number + name.
    'residential.residentialStatus': false, // auto-set to "Resident Indian"
    'residential.personOrigin': false,
    'residential.proofOfAddress': false,
    'residential.aadharNumberOption': false, // "Do you have Aadhaar?"
    'residential.ociAvailable': false, // "Do you have OCI?"
    'residential.dateOfOci': false,
    'residential.userOciCardNo': false,
    'residential.userOciIssueDate': false,
    'residential.userOciValidUpto': false,
    'residential.userTypeOfProof': false,
    'residential.userVisaType': false,
    'residential.userVisaNumber': false,
    'residential.userVisaIssuerDate': false,
    'residential.userVisaExpiryDate': false,
    'residential.userVisaDateOfIssue': false,
    'residential.userVisaValidUpto': false,
  },
};

const VISIBILITY_RULES: Partial<Record<InvestorType, VisibilityRuleset>> = {
  RESIDENT_INDIVIDUAL: RESIDENT_INDIVIDUAL_RULES,
};

function normalise(type: string | null | undefined): InvestorType | undefined {
  if (!type) return undefined;
  const upper = type.toUpperCase();
  return upper in VISIBILITY_RULES ? (upper as InvestorType) : undefined;
}

/**
 * Section-level visibility. Returns true unless an explicit `false` exists
 * for this investor type. Used at the tab-row level in the container.
 */
export function isSectionVisible(
  investorType: string | null | undefined,
  section: ProfileSectionKey
): boolean {
  const type = normalise(investorType);
  if (!type) return true;
  const rules = VISIBILITY_RULES[type];
  return rules?.sections?.[section] !== false;
}

/**
 * Field-level visibility. Returns true unless an explicit `false` exists
 * for this investor type and field key.
 */
export function isFieldVisible(
  investorType: string | null | undefined,
  field: ProfileFieldKey
): boolean {
  const type = normalise(investorType);
  if (!type) return true;
  const rules = VISIBILITY_RULES[type];
  return rules?.fields?.[field] !== false;
}

/**
 * Section label override (e.g. RI renames "Residential Status" to
 * "Aadhaar Details" on the profile page only).
 */
export function getSectionLabel(
  investorType: string | null | undefined,
  section: ProfileSectionKey,
  fallback: string
): string {
  const type = normalise(investorType);
  if (!type) return fallback;
  return VISIBILITY_RULES[type]?.sectionLabels?.[section] ?? fallback;
}

/** True only for the RESIDENT_INDIVIDUAL investor type. */
export function isResidentIndividual(
  investorType: string | null | undefined
): boolean {
  return (investorType ?? '').toUpperCase() === 'RESIDENT_INDIVIDUAL';
}
