import { apiClient } from '../utils/apiClient';

export interface BatchInvestorDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  registerAs: number;
  nationality: number;
  market?: number;
}

export interface BatchRegistrationDto {
  brokerCode: string;
  investors: BatchInvestorDto[];
}

export interface BatchSuccessItemDto {
  email: string;
  uniqueCode: string;
  investorId: number;
}

export interface BatchFailureItemDto {
  email: string;
  reason: string;
}

export interface BatchRegistrationResponseDto {
  totalCount: number;
  successCount: number;
  failureCount: number;
  successes: BatchSuccessItemDto[];
  failures: BatchFailureItemDto[];
}

class BatchRegistrationService {
  private readonly baseUrl = '/api/admin/clients';

  async registerBatch(data: BatchRegistrationDto): Promise<BatchRegistrationResponseDto> {
    const response = await apiClient.post<BatchRegistrationResponseDto>(
      `${this.baseUrl}/register-batch`,
      data
    );
    return response.data;
  }
}

export const batchRegistrationService = new BatchRegistrationService();
