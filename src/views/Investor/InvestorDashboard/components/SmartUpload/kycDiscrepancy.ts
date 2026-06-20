import { KycDocumentDiscrepancyDto, KycSmartDocumentDto } from '../../../../../services/kycDocuments.service';

export const DOC_TYPE_LABELS: Record<string, string> = {
  PAN_CARD: 'PAN card',
  PASSPORT: 'passport',
  AADHAR_CARD: 'Aadhaar',
  OCI_CARD: 'OCI card',
  ADDRESS_PROOF: 'address proof',
};

/**
 * Human-readable message for a single validation discrepancy. The document-type
 * and required-ID-field rules get a plain-language sentence; everything else
 * falls back to the generic "field: expected X, got Y" form.
 */
export function discrepancyMessage(d: KycDocumentDiscrepancyDto, documentType: string): string {
  const label = DOC_TYPE_LABELS[documentType] || documentType;
  if (d.canonicalSource === 'OCR_DOC_TYPE') {
    return `This doesn't look like a ${label}. Please upload the correct document.`;
  }
  if (d.canonicalSource === 'OCR_ID_FIELD') {
    return `We couldn't read ${d.expectedValue || 'a valid ID number'} on this document. Please upload a clear ${label}.`;
  }
  if (d.canonicalSource === 'OCR_INFRA') {
    return 'Document verification is temporarily unavailable. Please try again shortly.';
  }
  return `${d.fieldName || d.canonicalSource}: expected "${d.expectedValue}", got "${d.observedValue}"`;
}

/**
 * Joined plain-language text for every BLOCKING reason on a rejected upload,
 * suitable for the shared AlertDialog popup. Returns null when there is nothing
 * blocking to show.
 */
export function blockingAlertText(doc: KycSmartDocumentDto): string | null {
  const blocking = doc.discrepancies.filter((d) => d.severity === 'BLOCKING');
  if (blocking.length === 0) return null;
  return blocking.map((d) => discrepancyMessage(d, doc.documentType)).join(' ');
}
