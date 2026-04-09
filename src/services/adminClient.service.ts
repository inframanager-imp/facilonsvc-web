import { apiClient } from '../utils/apiClient';

export interface InvestorDto {
  id: number;
  authorizedUserId: number;
  tenantId: number;
  firstName?: string;
  lastName?: string;
  emailId?: string;
  mobilePhone?: string;
  uniqueCode?: string;
  registerAs?: number;
  market?: number;
  nationality?: number;
  residenceType?: string;
  verifyStatus?: number;
  verifyStatusLabel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KycDocumentDto {
  id: number;
  investorUniqueId?: string;
  status?: string;
  documentType?: string;
  docDescription?: string;
  documentUrl?: string;
  reason?: string;
  createdAt?: string;
}

export interface InvestorFullProfileDto {
  personalInfo?: any;
  passport?: any;
  experience?: any;
  consents?: any;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

class AdminClientService {
  private baseUrl = '/api/admin/clients';

  async listClients(page = 0, size = 10): Promise<PageResponse<InvestorDto>> {
    const response = await apiClient.get<PageResponse<InvestorDto>>(this.baseUrl, {
      params: { page, size },
    });
    return response.data;
  }

  async searchClients(searchTerm: string, page = 0, size = 10): Promise<PageResponse<InvestorDto>> {
    const response = await apiClient.get<PageResponse<InvestorDto>>(`${this.baseUrl}/search`, {
      params: { searchTerm, page, size },
    });
    return response.data;
  }

  async getClient(clientId: number): Promise<InvestorDto> {
    const response = await apiClient.get<InvestorDto>(`${this.baseUrl}/${clientId}`);
    return response.data;
  }

  async getClientProfile(clientId: number): Promise<InvestorFullProfileDto> {
    const response = await apiClient.get<InvestorFullProfileDto>(`${this.baseUrl}/${clientId}/profile`);
    return response.data;
  }

  async getClientDocuments(clientId: number): Promise<KycDocumentDto[]> {
    const response = await apiClient.get<KycDocumentDto[]>(`${this.baseUrl}/${clientId}/documents`);
    return response.data;
  }

  async verifyDocument(documentId: number): Promise<KycDocumentDto> {
    const response = await apiClient.put<KycDocumentDto>(`${this.baseUrl}/documents/${documentId}/verify`);
    return response.data;
  }

  async rejectDocument(documentId: number, reason?: string): Promise<KycDocumentDto> {
    const response = await apiClient.put<KycDocumentDto>(
      `${this.baseUrl}/documents/${documentId}/reject`,
      reason ? { status: 'Rejected', reason } : {}
    );
    return response.data;
  }

  async downloadDocument(documentId: number): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${this.baseUrl}/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  async updateVerificationStatus(clientId: number, verifyStatus: number): Promise<InvestorDto> {
    const response = await apiClient.put<InvestorDto>(`${this.baseUrl}/${clientId}/verify`, {
      verifyStatus,
    });
    return response.data;
  }
}

export const adminClientService = new AdminClientService();
