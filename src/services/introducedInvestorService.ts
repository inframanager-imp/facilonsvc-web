import { apiClient } from '../utils/apiClient';

export interface IntroducedInvestorDetailsDto {
  uniqueCode?: string;
  dataverseInvestorId: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  mobile: string;
  brokerName: string;
  serviceProviderType: string;
  productName: string;
  planName: string;
  schemeName: string;
  nationalityName: string;
  countryOfResidenceName?: string;
  investorTypeName: string;
  emailAlreadyExists: boolean;
}

export interface Step1RequestDto {
  uniqueCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // Format: yyyy-MM-dd
  gender: string;
  email: string;
  mobileNumber: string;
  countryCode: string;
  agreeForOtp: boolean;
}

export interface Step2OtpVerificationDto {
  uniqueCode: string;
  emailOtp: string;
}

export interface Step4CompletionDto {
  uniqueCode: string;
  selfOrLegalEntity: string; // "Self" or "Legal Entity"
  nationality: string;
  countryOfResidence?: string;
  panCardStatus?: string;
  indianOrigin?: string;
  ociCardStatus?: string;
  entityName?: string;
  legalPanCard?: string;
  representativeCapacity?: string;
  securityRegulated?: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  agreeForWhatsapp?: boolean;
  agreeForMarketing?: boolean;
  whatsappNumber?: string;
}

export interface ApiResponseDto {
  success: boolean;
  message: string;
  uniqueCode?: string;
  nextStep?: string;
  data?: any;
  b2cAccountCreated?: boolean;
  investorId?: number;
}

export const introducedInvestorService = {
  /**
   * Step 0: Initiate — plain Dataverse ss_name (e.g. INV-1744) or Laravel-encrypted token from introduce-investor1/...
   */
  initiateRegistration: (investorRef: string) =>
    apiClient.get<IntroducedInvestorDetailsDto>('/api/investor/introduced/initiate', {
      params: { investorRef }
    }),

  /**
   * Step 1: Record data consent
   */
  recordConsent: (dataverseInvestorId: string) =>
    apiClient.post<ApiResponseDto>('/api/investor/introduced/consent', null, {
      params: { dataverseInvestorId }
    }),

  /**
   * Step 2: Submit personal details and send OTP
   */
  submitStep1: (data: Step1RequestDto) =>
    apiClient.post<ApiResponseDto>('/api/investor/introduced/step1', data),

  /**
   * Step 3: Verify OTP
   */
  verifyOtp: (data: Step2OtpVerificationDto) =>
    apiClient.post<ApiResponseDto>('/api/investor/introduced/verify-otp', data),

  /**
   * Step 4: Complete registration
   */
  completeRegistration: (data: Step4CompletionDto) =>
    apiClient.post<ApiResponseDto>('/api/investor/introduced/complete', data),

  /**
   * Resend OTP
   */
  resendOtp: (uniqueCode: string) =>
    apiClient.post<ApiResponseDto>('/api/investor/introduced/resend-otp', null, {
      params: { uniqueCode }
    }),

  /**
   * Get session prefill data (email, name) for Step1 form
   */
  getSessionPrefill: (uniqueCode: string) =>
    apiClient.get<IntroducedInvestorDetailsDto>(`/api/investor/introduced/session/${uniqueCode}`)
};

export default introducedInvestorService;
