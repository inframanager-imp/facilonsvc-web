import { apiClient } from '../utils/apiClient';

/**
 * Smart Upload KYC document service.
 * Mirrors the /api/clients/me/kyc REST contract in KycSmartUploadController.
 * Plan of record: KYC_DOCUMENT_PLAN.md §3.4.
 */

export type KycRequirementState =
  | 'NOT_UPLOADED'
  | 'PENDING'
  | 'PENDING_REVIEW'
  | 'VALID'
  | 'DISCREPANCY'
  | 'EXPIRED'
  | 'EXPIRES_SOON'
  | 'OCR_FAILED';

export type KycDocumentTypeCode =
  | 'PAN_CARD'
  | 'PASSPORT'
  | 'AADHAR_CARD'
  | 'OCI_CARD'
  | 'ADDRESS_PROOF';

export type AddressProofType =
  | 'Utility Bill'
  | 'Rent Agreement'
  | 'Bank Statement'
  | 'Driving License'
  | 'Passport'
  | 'Aadhaar'
  | 'Other';

export interface KycRequirementSlotDto {
  documentType: KycDocumentTypeCode;
  requirement: 'MANDATORY' | 'CONDITIONAL' | 'OPTIONAL';
  state: KycRequirementState;
  currentDocumentId?: number | null;
  expiryDate?: string | null;
  daysUntilExpiry?: number | null;
  label: string;
  note?: string | null;
}

export interface KycRequirementsResponseDto {
  investorType: string;
  usesAadhaarEsign: boolean;
  usesAadhaarForAddress: boolean;
  slots: KycRequirementSlotDto[];
  mandatoryTotal: number;
  mandatoryComplete: number;
  expiredCount: number;
  kycVerifiedAt?: string | null;
}

export interface KycDocumentFieldDto {
  fieldName: string;
  fieldValue?: string | null;
  confidence?: number | null;
  page?: number | null;
}

export interface KycDocumentDiscrepancyDto {
  id: number;
  canonicalSource: string;
  fieldName?: string | null;
  expectedValue?: string | null;
  observedValue?: string | null;
  severity: 'BLOCKING' | 'WARNING';
}

export interface KycSmartDocumentDto {
  id: number;
  investorUniqueId?: string;
  documentType: KycDocumentTypeCode;
  status?: string;
  validationStatus?: KycRequirementState;
  documentUrl?: string;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  addressProofType?: string | null;
  usesAadhaarForAddress?: boolean | null;
  ocrRunId?: string | null;
  ocrModelVersion?: string | null;
  ocrConfidence?: number | null;
  createdAt?: string;
  confirmedAt?: string | null;
  replacedByDocumentId?: number | null;
  fields: KycDocumentFieldDto[];
  discrepancies: KycDocumentDiscrepancyDto[];
  profileConflicts?: KycProfileConflictDto[];
}

export interface KycProfileConflictDto {
  targetField: string;
  existingValue?: string | null;
  documentValue?: string | null;
  reason?: string | null;
}

export interface UploadRequest {
  file: File;
  documentType: KycDocumentTypeCode;
  addressProofType?: AddressProofType;
  usesAadhaarForAddress?: boolean;
}

class KycDocumentsService {
  private baseUrl = '/api/clients/me/kyc';

  async getRequirements(): Promise<KycRequirementsResponseDto> {
    const { data } = await apiClient.get<KycRequirementsResponseDto>(
      `${this.baseUrl}/requirements`
    );
    return data;
  }

  async uploadDocument(req: UploadRequest): Promise<KycSmartDocumentDto> {
    const form = this.buildFormData(req);
    const { data } = await apiClient.post<KycSmartDocumentDto>(
      `${this.baseUrl}/documents`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  }

  async reUpload(
    previousDocumentId: number,
    req: UploadRequest
  ): Promise<KycSmartDocumentDto> {
    const form = this.buildFormData(req);
    const { data } = await apiClient.post<KycSmartDocumentDto>(
      `${this.baseUrl}/documents/${previousDocumentId}/re-upload`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  }

  async list(): Promise<KycSmartDocumentDto[]> {
    const { data } = await apiClient.get<KycSmartDocumentDto[]>(
      `${this.baseUrl}/documents`
    );
    return data;
  }

  async detail(id: number): Promise<KycSmartDocumentDto> {
    const { data } = await apiClient.get<KycSmartDocumentDto>(
      `${this.baseUrl}/documents/${id}`
    );
    return data;
  }

  async history(id: number): Promise<KycSmartDocumentDto[]> {
    const { data } = await apiClient.get<KycSmartDocumentDto[]>(
      `${this.baseUrl}/documents/${id}/history`
    );
    return data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/documents/${id}`);
  }

  async confirm(id: number): Promise<KycSmartDocumentDto> {
    const { data } = await apiClient.post<KycSmartDocumentDto>(
      `${this.baseUrl}/documents/${id}/confirm`
    );
    return data;
  }

  async reject(id: number): Promise<void> {
    await apiClient.post(`${this.baseUrl}/documents/${id}/reject`);
  }

  private buildFormData(req: UploadRequest): FormData {
    const form = new FormData();
    form.append('file', req.file);
    form.append('documentType', req.documentType);
    if (req.addressProofType) form.append('addressProofType', req.addressProofType);
    if (typeof req.usesAadhaarForAddress === 'boolean') {
      form.append('usesAadhaarForAddress', String(req.usesAadhaarForAddress));
    }
    return form;
  }
}

export const kycDocumentsService = new KycDocumentsService();
