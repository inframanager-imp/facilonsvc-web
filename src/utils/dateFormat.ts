const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats an ISO date/datetime string as "04-Jun-2026" (date only, no time).
 * Parses the string directly to avoid timezone shifts. Returns an em dash for
 * empty values and the raw value if it doesn't look like an ISO date.
 */
export const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return value;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${m[3]}-${month}-${m[1]}` : value;
};
