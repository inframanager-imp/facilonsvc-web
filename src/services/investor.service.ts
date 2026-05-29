import { apiClient } from '../utils/apiClient';
import { getSAProxyInvestorId, saProxyApiClient } from './saProxyAdapter';

export interface DocumentResponseDto {
  id?: number;
  documentType: string;
  documentCategory: string;
  fileName: string;
  documentUrl?: string;
  contentType?: string;
  fileSize?: number;
  status: string;
  uploadedAt?: string;
  description?: string;
  rejectionReason?: string;
}

// New Registration Flow DTOs
export interface EmailRegistrationDto {
  email: string;
  registerAs: number; // 1=Individual, 2=Legal Entity
}

export interface EmailRegistrationResponseDto {
  success: boolean;
  message: string;
  uniqueCode?: string;
  emailAlreadyExists?: boolean;
  otpSent?: boolean;
  expiresInMinutes?: number;
}

export interface OtpConsentVerificationDto {
  uniqueCode: string;
  emailOtp: string;
  consentGiven: boolean;
}

export interface OtpVerificationResponseDto {
  success: boolean;
  message: string;
  uniqueCode?: string;
  registerAs?: number;
}

export interface IndividualRegistrationDto {
  interestedInIndianMarket: boolean;
  title?: number; // Optional: Reference to master_title
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: number;
  countryOfResidence: number;
  hasPanCard: boolean;
  residencyType?: string; // "resident_indian" or "non_resident_indian"
  isPersonOfIndianOrigin?: boolean;
  hasOciCard?: boolean;
  termsAccepted: boolean;
}

export interface LegalEntityRegistrationDto {
  entityName: string;
  countryOfIncorporation: number;
  hasPanCard?: boolean;
  entityRepresentativeName: string;
  representativeCapacity: string;
  isSecuritiesRegulated: boolean;
  termsAccepted: boolean;
}

export interface RegistrationCompletionResponseDto {
  success: boolean;
  message: string;
  uniqueCode?: string;
  investorId?: number;
  email?: string;
  requiresPanCard?: boolean;
}

// Legacy DTOs (keeping for backward compatibility)
export interface MainStepDto {
  fullName: string;
  registerAs: number;
  market: number;
  countryOfIncorporation?: number;
  countryOfTaxResidency?: number;
  entityWebsite?: string;
}

export interface Step1Dto {
  title: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber?: string;
  countryCode: number;
  gender?: number;
  userDob?: string;
  representativeCapacity?: string;
}

export interface OtpVerificationDto {
  uniqueCode: string;
  emailOtp: string;
  smsOtp: string;
}

export interface Step3RegistrationDetailsDto {
  citizenship: number;
  countryOfResidence: number;
  nationality: number;
  residenceType: string;
  pancardStatus?: string;
  ociCardStatus?: string;
  indianOrigin?: string;
  confirmation: boolean;
  privacyPolicyAccepted: boolean;
  notificationConsent: boolean;
  whatsappConsent?: boolean;
}

export interface OtpResponseDto {
  message: string;
  emailSent: boolean;
  smsSent: boolean;
  expiresInMinutes: number;
}

export interface VerificationResponseDto {
  success: boolean;
  message: string;
  investorId?: number;
  uniqueCode?: string;
}

export interface SectionStatus {
  completed: boolean;
  required: boolean;
  lastUpdated?: string;
}

export interface InvestorProgressDto {
  currentStep: string;
  completedSteps: string[];
  pendingSteps: string[];
  progressPercentage: number;
  sections: Record<string, SectionStatus>;
}

export interface InvestorBasicInfo {
  name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  nationality: string;
  countryOfResidence: string;
  investorType: string;
  uniqueCode: string;
  status: number;
  registerAs: string;
}

export interface ActivityItem {
  action: string;
  timestamp: string;
  description: string;
}

export interface InvestorDashboardDto {
  investor: InvestorBasicInfo;
  progress: InvestorProgressDto;
  recentActivity: ActivityItem[];
  nextSteps: string[];
  accountSummary?: AccountSummary; // Option 2: Enhanced dashboard
  accountSnapshot?: AccountSnapshot;
  actionsAlerts?: ActionsAlerts;
  productAssignment?: ProductAssignment;
  applications?: ApplicationItem[];
  consentCenter?: ConsentItem[];
  delegation?: DelegationInfo;
  /** True once the investor has agreed to their SOW. The onboarding journey is gated on this. */
  sowAgreed?: boolean;
}

export interface AccountSnapshot {
  investorId?: string;
  primaryJurisdiction?: string;
  eligibility?: string;
  lastActivity?: string;
}

export interface ActionsAlerts {
  actionRequired?: string;
  onboardingStatus?: string;
  restrictions?: string;
}

export interface ProductAssignment {
  assigned?: boolean;
  source?: string;
  serviceProviderName?: string;
  serviceProviderType?: string;
  productName?: string;
  productCode?: string;
  planName?: string;
  routeName?: string;
  message?: string;
}

export interface ApplicationItem {
  code?: string;
  name?: string;
  status?: string;
  enabled?: boolean;
  blockReason?: string;
  actionRoute?: string;
}

export interface ConsentItem {
  consent?: string;
  scope?: string;
  status?: string; // "Active" | "Inactive"
  actionRequired?: boolean;
  action?: string; // "ACTIVATE" | "UPDATE" | "REVOKE" | "NONE"
  key?: string;    // "sow" | "marketing" | "whatsapp" | "privacy" | "platformTerms"
}

export interface DelegationInfo {
  serviceAgent?: string;
  scope?: string;
  expiry?: string;
  status?: string;
  note?: string;
}

export interface DsrCaseCreateDto {
  requestType: string;
  jurisdiction: string;
  requestDescription: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  requesterRole?: string;
}

export interface DsrCaseResponseDto {
  caseId: string;
  investorUniqueCode: string;
  requestType: string;
  jurisdiction: string;
  requestDescription: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  requesterRole?: string;
  status: string;
  supportingFilePath?: string;
  submittedAt?: string;
  slaDeadline?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface AccountSummary {
  accountOpeningStatus: boolean;
  verificationDone: boolean;
  physicalSubmissionDone: boolean;
  kycDocumentsUploaded: number;
  kycDocumentsRequired: number;
  onboardingDocumentsUploaded: number;
  onboardingDocumentsRequired: number;
  bankInfo?: BankInfo;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string; // Masked
  ifscCode: string;
  hasBankDetails: boolean;
}

export interface VerificationStatusDto {
  currentStatus: string; // "pending", "in_progress", "completed", "rejected"
  physicalSubmission: PhysicalSubmissionInfo;
  appointment: VerificationAppointmentInfo;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  nextSteps: string;
}

export interface PhysicalSubmissionInfo {
  submitted: boolean;
  submittedAt?: string;
  trackingNumber?: string;
  status: string;
  // Additional fields for form pre-filling
  physicalSubmission?: 'inperson' | 'courier';
  courierName?: string;
  dispatchDate?: string;
}

export interface VerificationAppointmentInfo {
  scheduled: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  verificationType?: string;
  location?: string;
  status: string;
}

export interface VerificationAppointmentDto {
  appointmentDate: string;
  appointmentTime: string;
  verificationType: string;
  location?: string;
  notes?: string;
}

export interface RequiredDocument {
  dynamicsId: string;
  description: string;
  documentTypeCode?: string;
  documentType?: number; // Numeric ss_documenttype from Dataverse (e.g., 100000012 for downloadable forms)
  mandatory?: boolean;
  localRecordExists?: boolean;
  localStatus?: string;
  reason?: string;
  localDocumentId?: number;
  fileName?: string;
  documentUrl?: string;
  documentMasterUrl?: string; // SharePoint URL from ss_documentmasters.ss_documenturl (for downloadable templates)
  uploadedAt?: string;
  acceptedFormats?: string[] | string;
  maxSize?: string;
  inputId?: string;
  spanId?: string;
  errorId?: string;
  fileInputName?: string;
}

export interface KycDocumentRequirementDto {
  totalRequired: number;
  uploaded: number;
  pending: number;
  approved: number;
  rejected: number;
  completionPercentage: number;
  serviceProviderName?: string;
  documents: RequiredDocument[];
}

export interface BankAccountDetails {
  // Standard bank details (from Dataverse ss_productsvisitorses)
  bankName?: string; // ss_nameofbank
  branchAddress?: string; // ss_bankaddress
  accountNumber?: string; // ss_bankaccountnumber (masked)
  swiftCode?: string; // ss_swiftcode
  ifscCode?: string; // ss_ifsccode
  
  // Specialized account numbers (from Dataverse)
  safeKeepingAccountNo?: string; // ss_safekeepingcustodyaccountno
  tradingAccountNo?: string; // ss_tradingaccountno
  pmsAccountFolioNo?: string; // ss_pmsaccountfoliono
  
  // Depository account numbers (NEW - from Dataverse ss_productsvisitorses)
  nsdlDpId?: string; // ss_depositorynsdldpid
  nsdlAccountNo?: string; // ss_depositorynsdlaccountno
  cdslAccountNo?: string; // ss_depositorycsdlaccountno
  
  accountType?: string;
  isPrimary?: boolean;
}

export interface ProgressInfo {
  personalInfoComplete: boolean;
  passportComplete: boolean;
  residentialComplete: boolean;
  taxInfoComplete: boolean;
  bankDetailsComplete: boolean;
  contactDetailsComplete: boolean;
  nominationComplete: boolean;
  riskProfileComplete: boolean;
  kycDocumentsUploaded: number;
  kycDocumentsRequired: number;
  onboardingDocumentsUploaded: number;
  onboardingDocumentsRequired: number;
  verificationDone: boolean;
  verificationDoneBy?: string;
  verificationDateTime?: string;
  physicalSubmissionDone: boolean;
  physicalSubmissionMethod?: string;
  courierName?: string;
  dispatchDate?: string;
  awbNumber?: string;
  completionPercentage: number;
}

export interface AccountDetailsDto {
  uniqueCode: string;
  fullName: string;
  email: string;
  mobile: string;
  registrationType: string; // Self, Introduced, PMS
  investorCategory?: string;
  investorCategoryCode: string;
  registrationDate: string;
  lastUpdated: string;

  // Account Opening Status
  accountOpeningStatus: boolean; // true = Completed, false/null = Pending

  // Progress tracking
  progress: ProgressInfo;

  // Bank and Account Details
  bankAccount?: BankAccountDetails;
}

export interface SetPasswordDetailsDto {
  azureUserId: string;
  b2cTenantName: string;
  clientId: string;
  signupSigninPolicy: string;
  resetPasswordPolicy: string;
  redirectUri: string;
  scope: string;
  hasLoggedInBefore: boolean;
  displayName: string;
}


export interface JourneyListItem {
  journeyId?: string;
  serviceProviderName?: string;
  product?: string;
  productCode?: string;
  scheme?: string;
  plan?: string;
  status?: string;
  progress?: number;
  actionRoute?: string;
}

class InvestorService {
  private readonly baseUrl = '/api/clients';

  private get client() {
    return getSAProxyInvestorId() !== null ? saProxyApiClient : apiClient;
  }

  // New Registration Flow APIs
  async submitEmail(data: EmailRegistrationDto): Promise<EmailRegistrationResponseDto> {
    const response = await this.client.post<EmailRegistrationResponseDto>(
      `${this.baseUrl}/onboarding/register/email`,
      data
    );
    return response.data;
  }

  async verifyOtpWithConsent(data: OtpConsentVerificationDto): Promise<OtpVerificationResponseDto> {
    const response = await this.client.post<OtpVerificationResponseDto>(
      `${this.baseUrl}/onboarding/register/verify-otp`,
      data
    );
    return response.data;
  }

  async resendOtp(uniqueCode: string): Promise<OtpResponseDto> {
    const response = await this.client.post<OtpResponseDto>(
      `${this.baseUrl}/onboarding/register/resend-otp/${uniqueCode}`,
      {}
    );
    return response.data;
  }

  async completeIndividualRegistration(uniqueCode: string, data: IndividualRegistrationDto): Promise<RegistrationCompletionResponseDto> {
    const response = await this.client.post<RegistrationCompletionResponseDto>(
      `${this.baseUrl}/onboarding/register/individual/${uniqueCode}`,
      data
    );
    return response.data;
  }

  async completeLegalEntityRegistration(uniqueCode: string, data: LegalEntityRegistrationDto): Promise<RegistrationCompletionResponseDto> {
    const response = await this.client.post<RegistrationCompletionResponseDto>(
      `${this.baseUrl}/onboarding/register/legal-entity/${uniqueCode}`,
      data
    );
    return response.data;
  }

  /**
   * Returns the B2C config + sign-in history needed by the FISP-style setpassword page.
   * The Azure object id comes from the first-login email link.
   */
  async getSetPasswordDetails(azureUserId: string): Promise<SetPasswordDetailsDto> {
    const response = await this.client.get<SetPasswordDetailsDto>(
      `${this.baseUrl}/onboarding/setpassword/details/${encodeURIComponent(azureUserId)}`
    );
    return response.data;
  }

  // Legacy APIs (keeping for backward compatibility)
  async registerMainStep(data: MainStepDto): Promise<string> {
    const response = await this.client.post<string>(
      `${this.baseUrl}/onboarding/register/main-step`,
      data
    );
    return response.data;
  }

  async registerStep1(code: string, data: Step1Dto): Promise<OtpResponseDto> {
    const response = await this.client.post<OtpResponseDto>(
      `${this.baseUrl}/onboarding/register/step1/${code}`,
      data
    );
    return response.data;
  }

  async verifyOtp(data: OtpVerificationDto): Promise<VerificationResponseDto> {
    const response = await this.client.post<VerificationResponseDto>(
      `${this.baseUrl}/onboarding/register/step2/verify-otp`,
      data
    );
    return response.data;
  }

  async registerStep3(code: string, data: Step3RegistrationDetailsDto): Promise<VerificationResponseDto> {
    const response = await this.client.post<VerificationResponseDto>(
      `${this.baseUrl}/onboarding/register/step3/${code}`,
      data
    );
    return response.data;
  }

  async getProgress(): Promise<InvestorProgressDto> {
    const response = await this.client.get<InvestorProgressDto>(
      `${this.baseUrl}/me/progress`
    );
    return response.data;
  }

  async getDashboard(): Promise<InvestorDashboardDto> {
    const response = await this.client.get<InvestorDashboardDto>(
      `${this.baseUrl}/me/dashboard`
    );
    return response.data;
  }

  async getJourneys(): Promise<JourneyListItem[]> {
    const response = await this.client.get<JourneyListItem[]>(
      `${this.baseUrl}/me/journeys`
    );
    return response.data;
  }

  async submitDsrCase(data: DsrCaseCreateDto, supportingFile?: File): Promise<DsrCaseResponseDto> {
    const formData = new FormData();
    formData.append('requestType', data.requestType);
    formData.append('jurisdiction', data.jurisdiction);
    formData.append('requestDescription', data.requestDescription);
    formData.append('requesterName', data.requesterName);
    formData.append('requesterEmail', data.requesterEmail);
    if (data.requesterPhone) formData.append('requesterPhone', data.requesterPhone);
    if (data.requesterRole) formData.append('requesterRole', data.requesterRole);
    if (supportingFile) formData.append('supportingFile', supportingFile);

    const response = await this.client.post<DsrCaseResponseDto>(`${this.baseUrl}/me/dsr`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async getDsrCases(): Promise<DsrCaseResponseDto[]> {
    const response = await this.client.get<DsrCaseResponseDto[]>(`${this.baseUrl}/me/dsr`);
    return response.data;
  }

  async getDsrCase(caseId: string): Promise<DsrCaseResponseDto> {
    const response = await this.client.get<DsrCaseResponseDto>(`${this.baseUrl}/me/dsr/${caseId}`);
    return response.data;
  }

  async submitPersonalInformation(data: any): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/information/personal`, data);
  }

  async submitPassportInformation(data: any): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/information/passport`, data);
  }

  async submitResidentialStatus(data: any): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/information/residential`, data);
  }

  async submitTaxInformation(data: any): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/information/tax`, data);
  }

  async submitBankDetails(data: any): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/information/bank`, data);
  }

  async submitContactDetails(data: any): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/information/contact`, data);
  }

  async submitNominationDetails(data: any): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/information/nomination`, data);
  }

  async submitRiskProfile(data: any): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/information/risk-profile`, data);
  }

  async finalInformationSubmit(): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/information/final-submit`);
  }

  async uploadKycDocument(file: File, documentType: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await this.client.post(`${this.baseUrl}/me/documents/kyc`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadDocument(file: File, documentType: string, documentMasterId?: string): Promise<DocumentResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (documentMasterId) {
      formData.append('documentMasterId', documentMasterId);
    }

    const response = await this.client.post<DocumentResponseDto>(`${this.baseUrl}/me/documents/kyc`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getKycRequirements(): Promise<KycDocumentRequirementDto> {
    const response = await this.client.get<KycDocumentRequirementDto>(`${this.baseUrl}/me/documents/kyc/requirements`);
    return response.data;
  }

  async getOnboardingRequirements(): Promise<KycDocumentRequirementDto> {
    const response = await this.client.get<KycDocumentRequirementDto>(`${this.baseUrl}/me/documents/onboarding/requirements`);
    return response.data;
  }

  async getDocuments(): Promise<any[]> {
    const response = await this.client.get(`${this.baseUrl}/me/documents`);
    return response.data as any[];
  }

  async getDocumentStatus(documentId: number): Promise<any> {
    const response = await this.client.get(`${this.baseUrl}/me/documents/${documentId}/status`);
    return response.data;
  }

  async updateAppointmentStatus(appointmentId: number, status: string): Promise<void> {
    await this.client.put(`${this.baseUrl}/me/verification/appointment/${appointmentId}/status`, null, {
      params: { status },
    });
  }

  async getVerificationStatus(): Promise<VerificationStatusDto> {
    const response = await this.client.get<VerificationStatusDto>(`${this.baseUrl}/me/verification/status`);
    return response.data;
  }

  async scheduleVerificationAppointment(data: VerificationAppointmentDto): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/verification/appointment`, data);
  }

  async getOnboardingDocuments(): Promise<DocumentResponseDto[]> {
    const response = await this.client.get<DocumentResponseDto[]>(`${this.baseUrl}/me/documents/onboarding/list`);
    return response.data;
  }

  /**
   * @param investorDocumentId Dataverse ss_investordocumentsid (from onboarding requirements dynamicsId). Required when API has Dataverse enabled.
   */
  async uploadOnboardingDocument(
    file: File,
    documentType: string,
    investorDocumentId?: string
  ): Promise<DocumentResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (investorDocumentId) {
      formData.append('investorDocumentId', investorDocumentId);
    }

    const response = await this.client.post<DocumentResponseDto>(`${this.baseUrl}/me/documents/onboarding`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async downloadPreFilledForms(): Promise<any> {
    const response = await this.client.get(`${this.baseUrl}/me/documents/onboarding/forms/download`);
    return response.data;
  }

  /**
   * Download SharePoint document by URL (for onboarding templates)
   * @param url SharePoint document URL (from ss_doc_master_url)
   * @returns Blob containing the file
   */
  async downloadSharePointDocument(url: string): Promise<Blob> {
    const response = await this.client.get(
      `${this.baseUrl}/me/documents/sharepoint/download`,
      {
        params: { url },
        responseType: 'blob'
      }
    );
    return response.data;
  }

  async deleteDocument(documentId: number): Promise<void> {
    await this.client.delete(`${this.baseUrl}/me/documents/${documentId}`);
  }

  async getAccountDetails(): Promise<AccountDetailsDto> {
    const response = await this.client.get<AccountDetailsDto>(`${this.baseUrl}/me/account-details`);
    return response.data;
  }

  async submitPhysicalDocuments(data: PhysicalSubmissionFormData): Promise<void> {
    await this.client.post(`${this.baseUrl}/me/verification/physical-submission`, data);
  }

  async getPhysicalSubmissionStatus(): Promise<PhysicalSubmissionInfo | null> {
    try {
      const verificationStatus = await this.getVerificationStatus();
      return verificationStatus.physicalSubmission || null;
    } catch (error) {
      console.warn('[InvestorService] Failed fetching physical submission status', error);
      return null;
    }
  }

  async downloadDocumentChecklist(): Promise<string> {
    const response = await this.client.get(`${this.baseUrl}/me/verification/document-checklist`, {
      responseType: 'text'
    });
    return response.data;
  }
}

export interface PhysicalSubmissionFormData {
  physicalSubmission: 'inperson' | 'courier';
  courierName?: string;
  dispatchDate?: string;
  awbNumber?: string;
  notes?: string;
}

export const investorService = new InvestorService();
