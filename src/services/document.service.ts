import { apiClient } from './api.client';
import { getSAProxyInvestorId, saProxyApiClient } from './saProxyAdapter';

export interface DocumentDto {
  id: number;
  documentType: string;
  fileName: string;
  originalFileName: string;
  fileExtension: string;
  fileSize: number;
  sharePointItemId: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  remarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface DocumentUploadResponse {
  documentId: number | null;
  fileName: string;
  documentType: string | null;
  status: string;
  message: string;
}

export const DOCUMENT_TYPES = {
  PASSPORT: 'PASSPORT',
  PAN_CARD: 'PAN_CARD',
  ADDRESS_PROOF: 'ADDRESS_PROOF',
  PHOTO: 'PHOTO',
  BANK_STATEMENT: 'BANK_STATEMENT',
  INCOME_PROOF: 'INCOME_PROOF',
  OTHER: 'OTHER'
} as const;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  PASSPORT: 'Passport',
  PAN_CARD: 'PAN Card',
  ADDRESS_PROOF: 'Address Proof',
  PHOTO: 'Passport Photo',
  BANK_STATEMENT: 'Bank Statement',
  INCOME_PROOF: 'Income Proof',
  OTHER: 'Other Document'
};

class DocumentService {
  private baseUrl = '/api/clients/documents';

  private get client() {
    return getSAProxyInvestorId() !== null ? saProxyApiClient : apiClient;
  }

  /**
   * Upload one or more documents
   */
  async uploadDocuments(
    documentType: string,
    files: File[]
  ): Promise<DocumentUploadResponse[]> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post<DocumentUploadResponse[]>(
      `${this.baseUrl}/upload?documentType=${documentType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  }

  /**
   * Get all documents for current investor
   */
  async getMyDocuments(): Promise<DocumentDto[]> {
    const response = await this.client.get<DocumentDto[]>(this.baseUrl);
    return response.data;
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: number): Promise<DocumentDto> {
    const response = await this.client.get<DocumentDto>(`${this.baseUrl}/${documentId}`);
    return response.data;
  }

  /**
   * Download document file
   */
  async downloadDocument(documentId: number): Promise<Blob> {
    const response = await this.client.get<Blob>(`${this.baseUrl}/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: number): Promise<void> {
    await this.client.delete(`${this.baseUrl}/${documentId}`);
  }

  /**
   * Get document type label
   */
  getDocumentTypeLabel(type: string): string {
    return DOCUMENT_TYPE_LABELS[type] || type;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate file
   */
  validateFile(file: File): string | null {
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    
    if (file.size > maxSize) {
      return 'File size must not exceed 10 MB';
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`;
    }

    return null; // Valid
  }
}

export const documentService = new DocumentService();
