import { apiClient } from './api.client';
import { DocumentDto } from './document.service';

export interface DocumentStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

class AdminDocumentService {
  private baseUrl = '/api/admin/documents';

  /**
   * Get all documents with filters
   */
  async getAllDocuments(
    status?: string,
    documentType?: string,
    investorCode?: string
  ): Promise<DocumentDto[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (documentType) params.append('documentType', documentType);
    if (investorCode) params.append('investorCode', investorCode);

    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
    const response = await apiClient.get<DocumentDto[]>(url);
    return response.data;
  }

  /**
   * Get pending documents
   */
  async getPendingDocuments(): Promise<DocumentDto[]> {
    const response = await apiClient.get<DocumentDto[]>(`${this.baseUrl}/pending`);
    return response.data;
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: number): Promise<DocumentDto> {
    const response = await apiClient.get<DocumentDto>(`${this.baseUrl}/${documentId}`);
    return response.data;
  }

  /**
   * Download document for review
   */
  async downloadDocument(documentId: number): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${this.baseUrl}/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Verify document
   */
  async verifyDocument(documentId: number, remarks?: string): Promise<void> {
    const params = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    await apiClient.put(`${this.baseUrl}/${documentId}/verify${params}`);
  }

  /**
   * Reject document
   */
  async rejectDocument(documentId: number, remarks: string): Promise<void> {
    await apiClient.put(
      `${this.baseUrl}/${documentId}/reject?remarks=${encodeURIComponent(remarks)}`
    );
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<DocumentStats> {
    const response = await apiClient.get<DocumentStats>(`${this.baseUrl}/stats`);
    return response.data;
  }
}

export const adminDocumentService = new AdminDocumentService();
