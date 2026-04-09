import { apiClient } from '../utils/apiClient';

export interface IntroInvestorTempDto {
  id: number;
  introFirstName?: string;
  introLastName?: string;
  introEmail?: string;
  introMobile?: string;
  uniqueCodeDb?: string;
  status?: number;
  ssBrokerValue?: string;
}

export interface InvestorDto {
  id: number;
  firstName?: string;
  lastName?: string;
  emailId?: string;
  uniqueCode?: string;
  verifyStatus?: number;
  verifyStatusLabel?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

class BrokerService {
  private baseUrl = '/api/broker';

  async listIntroducedInvestors(): Promise<IntroInvestorTempDto[]> {
    const response = await apiClient.get<IntroInvestorTempDto[]>(`${this.baseUrl}/introduced-investors`);
    return response.data;
  }

  async getIntroducedInvestorStatus(uniqueCode: string): Promise<Record<string, unknown>> {
    const response = await apiClient.get<Record<string, unknown>>(
      `${this.baseUrl}/introduced-investors/status/${encodeURIComponent(uniqueCode)}`
    );
    return response.data;
  }

  async listInvestors(page = 0, size = 10): Promise<PageResponse<InvestorDto>> {
    const response = await apiClient.get<PageResponse<InvestorDto>>(`${this.baseUrl}/investors`, {
      params: { page, size },
    });
    return response.data;
  }

  async searchInvestors(searchTerm: string, page = 0, size = 10): Promise<PageResponse<InvestorDto>> {
    const response = await apiClient.get<PageResponse<InvestorDto>>(`${this.baseUrl}/investors/search`, {
      params: { searchTerm, page, size },
    });
    return response.data;
  }
}

export const brokerService = new BrokerService();
