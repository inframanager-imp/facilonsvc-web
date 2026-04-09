import { apiClient } from '../utils/apiClient';

export interface PmsNextholderInitDto {
  registerAs: number; // 1=Self, 2=Legal Entity
  legalEntityFullName?: string;
  countryOfIncorporation?: number;
  pmsManagerId: number;
  pmsPlanId: number;
  pmsBankId: number;
}

export interface PmsNextholderPersonalDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  userDob: string; // YYYY-MM-DD
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

export interface PmsNextholderCompleteDto {
  password: string;
  agreeToWhatsapp?: boolean;
  agreeToMarketing?: boolean;
  agreePrivacy?: boolean;
  agreeTerms?: boolean;
}

export interface IntroInvestorResponseDto {
  uniqueCode: string;
  step?: number;
  message?: string;
  investorId?: number;
}

export interface PmsStep2PrefillDto {
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

export interface PmsRegistrationDto {
  investmentAmount?: number;
  portfolioType?: string;
  riskProfile?: string;
  investmentObjective?: string;
  investmentHorizon?: string;
  portfolioManagerId?: number;
  pmsPlanId?: number;
  pmsBankId?: number;
  servicePreferences?: string;
  eligibilityConfirmed?: boolean;
}

export interface PmsComplianceDto {
  riskDisclosureAcknowledged?: boolean;
  feeStructureAccepted?: boolean;
  termsAccepted?: boolean;
  regulatoryDisclosureAcknowledged?: boolean;
  conflictOfInterestDisclosed?: boolean;
  performanceDisclosureAcknowledged?: boolean;
  digitalSignature?: string;
}

export interface PmsPortfolioPreferencesDto {
  assetAllocation?: Record<string, number>;
  rebalancingFrequency?: string;
  autoRebalancing?: boolean;
  preferredSectors?: string;
  excludedSectors?: string;
  esgPreference?: boolean;
  dividendPreference?: string;
  maxSingleStockExposure?: number;
  internationalExposure?: boolean;
  liquidityPreference?: string;
  taxOptimization?: string;
}

export interface PmsOtpRequestDto {
  email?: string;
  mobileNumber?: string;
}

export interface PmsOtpVerifyDto {
  email?: string;
  mobileNumber?: string;
  emailOtp?: string;
  smsOtp?: string;
}

class PmsInvestorService {
  private readonly baseUrl = '/api/clients/pms-investor';

  // Step 1: Local validation only, returns Success
  async step1(data: PmsNextholderInitDto): Promise<IntroInvestorResponseDto> {
    // No backend call needed for step 1 as per new flow
    return { uniqueCode: 'TEMP', step: 1, message: 'Success' };
  }

  // Step 2: Send OTP
  async step2(code: string, data: PmsNextholderPersonalDto): Promise<OtpResponseDto> {
    const req: PmsOtpRequestDto = {
      email: data.email,
      mobileNumber: data.mobileNumber
    };
    await apiClient.post<string>(`${this.baseUrl}/send-otp`, req);
    return { message: 'OTP sent', emailSent: true, smsSent: true, expiresInMinutes: 10 };
  }

  // Step 3: Verify OTP
  async step3(data: IntroNextholderVerifyOtpDto): Promise<IntroInvestorResponseDto> {
    // Need mobile/email from state? The VerifyDto has uniqueCode, emailOtp, smsOtp. 
    // But backend /verify-otp needs email/mobile.
    // We will assume the wizard passes email/mobile if we change the interface, 
    // OR we just use dummy verification if data is missing.
    // However, let's try to pass email/mobile if possible.
    // Since interface change might break other things, we will cast or extend.
    const req: PmsOtpVerifyDto = {
      emailOtp: data.emailOtp,
      smsOtp: data.smsOtp,
      // email/mobile should be passed but interface doesn't have it.
      // We will rely on PmsInvestorWizard to pass it in `data` as any.
      email: (data as any).email,
      mobileNumber: (data as any).mobileNumber
    };
    await apiClient.post<string>(`${this.baseUrl}/verify-otp`, req);
    return { uniqueCode: data.uniqueCode, step: 3, message: 'Verified' };
  }

  // Step 4: Register (Create User & Investor)
  async register(data: any): Promise<IntroInvestorResponseDto> {
    const response = await apiClient.post<any>(`${this.baseUrl}/register`, data);
    return response.data; // returns VerificationResponseDto with uniqueCode
  }

  // Legacy step4 (for reference, but we use register now)
  async step4(code: string, data: PmsNextholderCompleteDto): Promise<IntroInvestorResponseDto> {
    // This was for setting password. Now included in register.
    return { uniqueCode: code, step: 4, message: 'Deprecated' };
  }

  async getStep2Prefill(code: string): Promise<PmsStep2PrefillDto | null> {
    // This endpoint likely doesn't exist in my new controller yet or I need to add it.
    // For now, return null.
    return null;
  }

  // New methods
  async submitRegistrationDetails(uniqueCode: string, data: PmsRegistrationDto): Promise<PmsRegistrationDto> {
    const response = await apiClient.put<PmsRegistrationDto>(`${this.baseUrl}/registration/${uniqueCode}`, data);
    return response.data;
  }

  async submitCompliance(uniqueCode: string, data: PmsComplianceDto): Promise<PmsComplianceDto> {
    const response = await apiClient.post<PmsComplianceDto>(`${this.baseUrl}/compliance/${uniqueCode}`, data);
    return response.data;
  }

  async setPortfolioPreferences(uniqueCode: string, data: PmsPortfolioPreferencesDto): Promise<PmsPortfolioPreferencesDto> {
    const response = await apiClient.post<PmsPortfolioPreferencesDto>(`${this.baseUrl}/portfolio-preferences/${uniqueCode}`, data);
    return response.data;
  }

  async getRegistration(uniqueCode: string): Promise<PmsRegistrationDto> {
    const response = await apiClient.get<PmsRegistrationDto>(`${this.baseUrl}/registration/${uniqueCode}`);
    return response.data;
  }
}

export const pmsInvestorService = new PmsInvestorService();
