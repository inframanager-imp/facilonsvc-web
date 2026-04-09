/**
 * Form helper utilities for investor information forms
 * Extracted from InvestorProfile.tsx for reusability
 */

/**
 * Normalizes date values for HTML input[type="date"] format (YYYY-MM-DD)
 * Handles:
 * - LocalDate arrays [yyyy, mm, dd] from backend
 * - ISO date strings
 * - Date objects
 * - Invalid/empty values
 */
export const normalizeDateForInput = (value: unknown): string => {
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

/**
 * Normalizes country of residence for form display
 * Personal-info API may return legacy integer ids or "-1" sentinel
 */
export const normalizeCountryOfResidenceForForm = (raw: unknown): string => {
  if (raw === null || raw === undefined || raw === '') return '';
  if (typeof raw === 'number') {
    if (raw < 0 || Number.isNaN(raw)) return '';
    return String(raw);
  }
  const s = String(raw).trim();
  if (s === '-1') return '';
  return s;
};

/**
 * Calculates nomination share percentage with validation
 * Returns value between 0-100, handles invalid inputs
 */
export const nominationSharePct = (v: unknown): number => {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
};

/**
 * Checks if a nominee share field is filled
 */
export const isShareFilled = (share: unknown): boolean => {
  return share !== undefined && share !== null && share !== '' && Number(share) > 0;
};

/**
 * Updates nominee share 1 with cascade logic
 * - If share 1 is 100% or empty, clears shares 2 and 3
 * - Otherwise, sets share 2 to remainder
 */
export const updateNomineeShare1 = (
  raw: string,
  currentForm: any,
  setForm: (form: any) => void
) => {
  if (raw === '') {
    setForm((prev: any) => ({
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
    setForm((prev: any) => ({
      ...prev,
      nomineeShare1: undefined,
      nomineeShare2: undefined,
      nomineeShare3: undefined,
    }));
    return;
  }
  setForm((prev: any) => {
    const next = { ...prev, nomineeShare1: s1 };
    if (s1 >= 100) {
      next.nomineeShare2 = undefined;
      next.nomineeShare3 = undefined;
    } else {
      next.nomineeShare2 = 100 - s1;
      next.nomineeShare3 = undefined;
    }
    return next;
  });
};

/**
 * Updates nominee share 2 with cascade logic
 * - Clears share 3 if sum of 1+2 >= 100 or if share 2 is empty
 * - Otherwise, sets share 3 to remainder
 */
export const updateNomineeShare2 = (
  raw: string,
  currentForm: any,
  setForm: (form: any) => void
) => {
  if (raw === '') {
    setForm((prev: any) => ({
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
    setForm((prev: any) => ({
      ...prev,
      nomineeShare2: undefined,
      nomineeShare3: undefined,
    }));
    return;
  }
  setForm((prev: any) => {
    const s1 =
      typeof prev.nomineeShare1 === 'number' && !Number.isNaN(prev.nomineeShare1)
        ? prev.nomineeShare1
        : 0;
    const sum = s1 + s2;
    const next = { ...prev, nomineeShare2: s2 };
    if (sum >= 100) {
      next.nomineeShare3 = undefined;
    } else {
      next.nomineeShare3 = 100 - sum;
    }
    return next;
  });
};

/**
 * Gets tax residency country select value
 * Handles both taxResidencyCountryId and taxResidencyCountry fields
 */
export const getTaxResidencyCountrySelectValue = (taxInfoForm: any): string => {
  const id = taxInfoForm.taxResidencyCountryId;
  if (id != null && !Number.isNaN(Number(id))) return String(id);
  const raw = taxInfoForm.taxResidencyCountry;
  if (raw == null) return '';
  const s = String(raw).trim();
  if (s === '' || s === '-1') return '';
  return /^\d+$/.test(s) ? s : '';
};
