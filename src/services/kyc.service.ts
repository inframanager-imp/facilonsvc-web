import { apiClient } from '../utils/apiClient';

export interface KycDocumentDto {
  id: number;
  investorUniqueId?: string;
  status?: string;
  documentType?: string;
  docDescription?: string;
  documentUrl?: string;
  createdAt?: string;
}

class KycService {
  private baseUrl = '/api/clients/kyc';

  async uploadDocument(
    file: File,
    documentType: string,
    description?: string
  ): Promise<KycDocumentDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (description) formData.append('description', description);

    const response = await apiClient.post<KycDocumentDto>(
      `${this.baseUrl}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getDocuments(): Promise<KycDocumentDto[]> {
    const response = await apiClient.get<KycDocumentDto[]>(`${this.baseUrl}/documents`);
    return response.data;
  }

  async deleteDocument(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/documents/${id}`);
  }

  async downloadDocument(id: number): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${this.baseUrl}/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  async getRequirements(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.baseUrl}/requirements`);
    return response.data;
  }
}

export const kycService = new KycService();
