import { apiClient } from '../utils/apiClient';

export interface IntroNextholderInitDto {
  introduceId?: string;
  registerAs: number; // 1=Self, 2=Legal Entity
  legalEntityFullName?: string;
  countryOfIncorporation?: number;
  legalEntityWebsite?: string;
}

export interface IntroNextholderPersonalDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  email: string;
  mobileNumber: string;
  countryCode?: number;
  sameWhatsapp?: string;
  diffMobWhatsapp?: string;
  agreeForOtp?: boolean;
}

export interface IntroNextholderVerifyOtpDto {
  uniqueCode: string;
  emailOtp: string;
  smsOtp: string;
}

export interface IntroNextholderCompleteDto {
  password: string;
  agreeToTerms?: boolean;
  agreeToWhatsapp?: boolean;
  confirmation?: boolean;
}

export interface IntroInvestorResponseDto {
  uniqueCode: string;
  step?: number;
  message?: string;
  investorId?: number;
}

export interface IntroInvestorStep2PrefillDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  registerAs?: string;
}

export interface OtpResponseDto {
  message: string;
  emailSent: boolean;
  smsSent: boolean;
  expiresInMinutes: number;
}

class IntroducedInvestorService {
  private baseUrl = '/api/clients/introduced-investor/nextholder/docs';

  async step1(data: IntroNextholderInitDto): Promise<IntroInvestorResponseDto> {
    const response = await apiClient.post<IntroInvestorResponseDto>(
      `${this.baseUrl}/step1`,
      data
    );
    return response.data;
  }

  async step2(code: string, data: IntroNextholderPersonalDto): Promise<OtpResponseDto> {
    const response = await apiClient.post<OtpResponseDto>(
      `${this.baseUrl}/step2/${code}`,
      data
    );
    return response.data;
  }

  async step3(data: IntroNextholderVerifyOtpDto): Promise<IntroInvestorResponseDto> {
    const response = await apiClient.post<IntroInvestorResponseDto>(
      `${this.baseUrl}/step3`,
      data
    );
    return response.data;
  }

  async step4(code: string, data: IntroNextholderCompleteDto): Promise<IntroInvestorResponseDto> {
    const response = await apiClient.post<IntroInvestorResponseDto>(
      `${this.baseUrl}/step4/${code}`,
      data
    );
    return response.data;
  }

  async getStep2Prefill(code: string): Promise<IntroInvestorStep2PrefillDto | null> {
    const response = await apiClient.get<IntroInvestorStep2PrefillDto>(
      `${this.baseUrl}/step2/${code}`
    );
    return response.status === 204 || !response.data ? null : response.data;
  }
}

export const introducedInvestorService = new IntroducedInvestorService();
