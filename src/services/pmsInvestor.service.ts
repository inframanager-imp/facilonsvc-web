import { apiClient } from '../utils/apiClient';

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

export interface IntroInvestorResponseDto {
  uniqueCode: string;
  step?: number;
  message?: string;
  investorId?: number;
}

export interface OtpResponseDto {
  message: string;
  emailSent: boolean;
  smsSent: boolean;
  expiresInMinutes: number;
}

/** Envelope returned by POST /pms-investor/send-otp and /verify-otp. */
export interface PmsOtpResponseDto {
  success: boolean;
  code: string; // "ok" | "mismatch" | "expired" | "locked" | "rate_limited" | "not_issued" | "invalid_request"
  message: string;
  emailSent?: boolean | null;
  smsSent?: boolean | null;
  expiresInMinutes?: number | null;
  remainingAttempts?: number | null;
}

/** Full payload POSTed to /pms-investor/register — mirrors Java PmsInvestorRegistrationDto. */
export interface PmsInvestorRegistrationPayload {
  // Identity
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  password: string;

  // Demographics (Laravel parity)
  userDob?: string;        // yyyy-MM-dd
  gender?: string;
  countryCodeId?: number;
  nationalityId?: number;
  nationalityName?: string;
  legalCountryId?: number;
  registerAs?: string;     // "Self" | "Legal Entity"
  legalEntityFullName?: string;
  fullName?: string;

  // Conditional KYC
  pancard?: string;        // "Yes" | "No"
  ociCard?: string;        // "Yes" | "No"
  indianOrigin?: string;   // "Yes" | "No"

  // WhatsApp / consent
  sameWhatsapp?: string;   // "Yes" | "No"
  diffMobWhatsapp?: string;
  agreeToWhatsapp?: boolean;
  agreeForOtp?: boolean;
  confirmation?: boolean;
  agreePrivacy?: boolean;
  agreeTerms?: boolean;

  // PMS required
  pmsManagerId: number;
  pmsPlanId: number;
  pmsBankId: number;
  accountNumber: string;
  agreementDate: string;   // yyyy-MM-dd
  comments?: string;
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
  firstName?: string;
}

export interface PmsOtpVerifyDto {
  email?: string;
  mobileNumber?: string;
  emailOtp?: string;
  smsOtp?: string;
}

class PmsInvestorService {
  private readonly baseUrl = '/api/clients/pms-investor';

  // Step 2: Send OTP (real Graph email + SMS delivery, rate-limited server-side)
  async step2(code: string, data: PmsNextholderPersonalDto): Promise<PmsOtpResponseDto> {
    const req: PmsOtpRequestDto & { firstName?: string } = {
      email: data.email,
      mobileNumber: data.mobileNumber,
      firstName: data.firstName,
    };
    const response = await apiClient.post<PmsOtpResponseDto>(`${this.baseUrl}/send-otp`, req);
    return response.data;
  }

  // Step 3: Verify OTP (server-side brute-force protection)
  async step3(data: IntroNextholderVerifyOtpDto & { email?: string; mobileNumber?: string }): Promise<PmsOtpResponseDto> {
    const req: PmsOtpVerifyDto = {
      emailOtp: data.emailOtp,
      smsOtp: data.smsOtp,
      email: data.email,
      mobileNumber: data.mobileNumber,
    };
    const response = await apiClient.post<PmsOtpResponseDto>(`${this.baseUrl}/verify-otp`, req);
    return response.data;
  }

  // Step 4: Register (Create User & Investor)
  async register(data: any): Promise<IntroInvestorResponseDto> {
    const response = await apiClient.post<any>(`${this.baseUrl}/register`, data);
    return response.data; // returns VerificationResponseDto with uniqueCode
  }

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
