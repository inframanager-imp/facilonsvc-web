import { apiClient } from '../utils/apiClient';
import { getSAProxyInvestorId, saProxyApiClient } from './saProxyAdapter';

export interface UserPersonalInformationDto {
  id?: number;
  investorUniqueId?: string;
  investorId?: string;

  // Name
  nameTitle?: string;
  investorFirstName?: string;
  investorMiddleName?: string;
  investorLastName?: string;

  // Demographics
  userDob?: string;
  gender?: string;
  maritalStatus?: string;

  // Maiden Name
  maidenTitle?: string;
  maidenName?: string;
  maidenMiddleName?: string;
  maidenLastName?: string;

  // Birth Details
  cityOfDob?: string;
  countryDob?: string;
  citizenship?: string;
  /** Country name as text (not a numeric master id; legacy -1 is treated as empty in the UI) */
  countryOfResidence?: string;

  // Parents/Spouse
  fatherNameTitle?: string;
  fathersFirstName?: string;
  fathersMiddleName?: string;
  fathersLastName?: string;
  motherNameTitle?: string;
  motherFirstName?: string;
  motherMiddleName?: string;
  motherLastName?: string;
  spouseNameTitle?: string;
  spouseName?: string;
  spouseMiddleName?: string;
  spouseLastName?: string;
  spouseMaidenName?: string;

  // IDs
  panNumber?: string;

  // Address (Permanent)
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  userCity?: string;
  userState?: string;
  userCountry?: string;
  userZipCode?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface UserPassportDetailsDto {
  id?: number;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  passportPlaceOfIssue?: string;
  passportCountryOfIssue?: string;
  passportNationality?: string;
  passportDateNonResident?: string;
  passportNoYearsAbroad?: number;
  documentType?: string;
}

export interface InvestorExperienceDto {
  educationalQualification?: string;
  /** UI / Laravel-style gross income band (e.g. "100000"); API may serialize as `annualIncome`. */
  grossIncome?: string;
  /** Backend `InvestorExperience` field (same meaning as gross income band). */
  annualIncome?: string;
  netWorth?: string;
  occupation?: string;
  employerName?: string;
  designation?: string;
  investmentExperienceIn?: string[];
  riskProfile?: string; // conservative/moderate/aggressive
  investmentObjective?: string;
  investmentHorizon?: string;
  riskTolerance?: string;
  previousInvestments?: string;

  yearsOfInvestmentExperience?: number;
  investmentExperienceYears?: string; // Laravel: "Less than 2 years" | "2-5 year" | "More than 5 year"

  // Legacy / extra fields mapping
  sourceOfFunds?: string;
  sourceOfFundsDetails?: string;
  expectedInvestmentAmount?: number;
  sourceOfWealth?: string;
  lineOfBusiness?: string;
  natureOfOrganisation?: string;
  polExposed?: boolean;
  polExposedRelated?: boolean;
  activity?: boolean;
  moneyChangeService?: boolean;
  gamblingService?: boolean;
  pawningService?: boolean;
  instanceViolation?: boolean;
}

export interface InvestorConsentsDto {
  termsAccepted?: boolean;
  privacyPolicyAccepted?: boolean;
  informationCorrectConsent?: boolean;
  legalCapacityConsent?: boolean;
  modificationAwarenessConsent?: boolean;
  marketingConsent?: boolean;
  dataSharingConsent?: boolean;
}

export interface UserResidentialStatusDto {
  // Top-level residential status selector (NRI / Resident / Foreign National / PIO)
  residentialStatus?: string;

  // Person of Indian Origin flag
  personOrigin?: string; // "yes" | "no"

  // Proof of address
  proofOfAddress?: string;

  // Aadhaar (Indian KYC)
  aadharNumberOption?: string; // "yes" | "no" (has Aadhaar?)
  aadharNumber?: string;
  userAadharNo?: string;
  /** Name as printed on the Aadhaar card (RI flow captures this). */
  nameOnAadhaar?: string;

  // OCI availability + date-of-OCI (Laravel: oci_available, date_of_oci)
  ociAvailable?: string; // "yes" | "no"
  dateOfOci?: string;

  // Type of Proof - For Foreign Nationals
  userTypeOfProof?: string; // "Visa" or "Resident Proof"

  // Visa Details (when userTypeOfProof = "Visa")
  userVisaType?: string;
  userVisaNumber?: string;
  userVisaIssuerDate?: string;
  userVisaExpiryDate?: string;

  // Resident Card Details (when userTypeOfProof = "Resident Proof")
  userVisaDateOfIssue?: string;
  userVisaValidUpto?: string;

  // OCI Details (for NRI investors)
  userOciCardNo?: string;
  userOciIssueDate?: string;
  userOciValidUpto?: string;
}

export interface UserTaxInfoDto {
  taxResidencyCountry?: number | string;
  /** When set by API, numeric country id (takes precedence on backend over taxResidencyCountry string). */
  taxResidencyCountryId?: number;
  panNumber?: string;
  tinNumber?: string;
  taxIdentificationNumberType?: string;
  fatcaStatus?: string;
  crsDeclaration?: string;
  usCitizen?: boolean;
  usResident?: boolean;
  incomeSource?: string;
  annualIncome?: string;
  taxIdNumber?: string;
  taxResidencyStatus?: string;
  gstNumber?: string;
  taxPanFirstName?: string;
  taxPanFatherName?: string;
  taxResidencyCertificateNo?: string;
  taxResidencyCertificateDate?: string;

  // Laravel parity fields
  /** Top-level tax info selector (Laravel: tax_info) */
  taxInfo?: string;
  /** Separate tax PAN number (Laravel: tax_pan_no — distinct from personal panNumber) */
  taxPanNo?: string;
  /** Explicit US-person FATCA yes/no (Laravel: us_person_fatca) */
  usPersonFatca?: string;
}

export interface PreferredBankDto {
  /** true when service_provider_type == "100000000" (Broker) */
  isBroker: boolean;
  /** Broker's preferred-bank display name, or null if not resolvable */
  bankName?: string | null;
}

export interface UserBankDetailsDto {
  settlementAccountType?: string; // "yes"/"no"
  beneficiaryName?: string;

  bankName?: string;
  bankAccountNumber?: string;
  accountType?: string;
  bankIfscCode?: string;
  branchName?: string;
  bankBranchAddress?: string;
  bankCountry?: number;
  isPrimaryAccount?: boolean;

  // Structured bank branch address (Laravel parity: bank_details_*)
  bankDetailsCity?: string;
  bankDetailsState?: string;
  bankDetailsCountry?: string;
  bankDetailsZipCode?: string;
  bankDetailsMicr?: string;

  // RBI
  rbiApproval?: string;
  rbiApprovalOrderNumber?: string;
  rbiApprovalDate?: string;
}

export interface UserContactDetailsDto {
  // Address Fields
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  userCity?: string;
  userState?: string;
  userCountry?: string;
  userZipCode?: string;
  proofOfAddress?: string;

  // Correspondence
  corrAddressSameAsPerm?: string; // "true"/"false", "1"/"0", or "yes"/"no" (Laravel: corr_address)
  addressType?: string;
  corrAddressLine1?: string;
  corrAddressLine2?: string;
  corrAddressLine3?: string;
  corrUserCity?: string;
  corrUserState?: string;
  corrUserCountry?: string;
  corrUserZipCode?: string;

  // Contact
  isdCode?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  whatsappNumber?: string;
  email?: string;
  alternateEmail?: string;
  preferredContactMethod?: string;
  preferredContactTime?: string;
}

export interface UserNominationDto {
  appointNominee?: boolean | string; // Laravel: "yes" | "no"
  /** API / Laravel alternate field names (merged with nomineeName1, etc. on server). */
  nomineeFirstName?: string;
  nomineeRelationship?: string;
  nomineeDob?: string;
  nomineeEmail?: string;
  nomineeMobile?: string;
  nomineeShare?: number;
  guardianName?: string;
  nomineeMiddleName?: string;
  nomineeLastName?: string;
  nomineeAddress?: string;
  nomineeCity?: string;
  nomineeState?: string;
  nomineePostalCode?: string;
  isMinor?: boolean;
  guardianRelationship?: string;

  // Nominee 1
  nomineeName1?: string;
  nomineeRelation1?: string;
  nomineeMobile1?: string;
  nomineeEmail1?: string;
  nomineeDob1?: string;
  nomineeDocType1?: string;
  nomineeDocNo1?: string;
  nomineeShare1?: number;
  nomineeCountrycode1?: number;
  nomineeAddress1?: string;
  nomineeCity1?: string;
  nomineeState1?: string;
  nomineeCountry1?: string;
  nomineePincode1?: string;
  guardianName1?: string;
  guardianPanNo1?: string;
  guardianDocType1?: string;
  guardianDocNo1?: string;
  guardianCountrycode1?: number;
  guardianMobile1?: string;
  guardianEmail1?: string;
  guardianDob1?: string;

  // Nominee 2
  nomineeName2?: string;
  nomineeRelation2?: string;
  nomineeMobile2?: string;
  nomineeEmail2?: string;
  nomineeDob2?: string;
  nomineeShare2?: number;
  nomineeDocType2?: string;
  nomineeDocNo2?: string;
  nomineeCountrycode2?: number;
  nomineeAddress2?: string;
  nomineeCity2?: string;
  nomineeState2?: string;
  nomineeCountry2?: string;
  nomineePincode2?: string;
  guardianName2?: string;
  guardianPanNo2?: string;
  guardianDocType2?: string;
  guardianDocNo2?: string;
  guardianCountrycode2?: number;
  guardianMobile2?: string;
  guardianEmail2?: string;
  guardianDob2?: string;

  // Nominee 3
  nomineeName3?: string;
  nomineeRelation3?: string;
  nomineeMobile3?: string;
  nomineeEmail3?: string;
  nomineeDob3?: string;
  nomineeShare3?: number;
  nomineeDocType3?: string;
  nomineeDocNo3?: string;
  nomineeCountrycode3?: number;
  nomineeAddress3?: string;
  nomineeCity3?: string;
  nomineeState3?: string;
  nomineeCountry3?: string;
  nomineePincode3?: string;
  guardianName3?: string;
  guardianPanNo3?: string;
  guardianDocType3?: string;
  guardianDocNo3?: string;
  guardianCountrycode3?: number;
  guardianMobile3?: string;
  guardianEmail3?: string;
  guardianDob3?: string;
}

export interface UserRiskProfileDto {
  // Merged with ExperienceDto often, but keeping as per backend DTO
  investmentExperience?: string;
  investmentHorizon?: string;
  riskTolerance?: string;
  investmentObjective?: string;
  sourceOfFunds?: string;
  expectedInvestmentAmount?: number;
  educationalQualification?: string;
  grossIncome?: string;
  netWorth?: string;
  occupation?: string;
  investmentExperienceIn?: string[];
  investmentExperienceYears?: number;
  sourceOfWealth?: string;
  lineOfBusiness?: string;
  natureOfOrganisation?: string;
  polExposed?: boolean;
  polExposedRelated?: boolean;
  activity?: boolean;
  moneyChangeService?: boolean;
  gamblingService?: boolean;
  pawningService?: boolean;
  instanceViolation?: boolean;
}

export interface OnboardingStatusDto {
  totalSteps: number;
  completedSteps: number;
  percentageComplete: number;
  personalInfoComplete: boolean;
  passportComplete: boolean;
  experienceComplete: boolean;
  consentsComplete: boolean;
  kycDocumentsComplete: boolean;
  kycDocumentsUploaded: number;
  kycDocumentsRequired: number;
  nextSteps: string[];
}

class ProfileService {
  private baseUrl = '/api/clients/profile';

  private get client() {
    return getSAProxyInvestorId() !== null ? saProxyApiClient : apiClient;
  }

  async getPersonalInfo(): Promise<UserPersonalInformationDto | null> {
    const response = await this.client.get<UserPersonalInformationDto>(`${this.baseUrl}/personal-info`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async updatePersonalInfo(data: UserPersonalInformationDto): Promise<UserPersonalInformationDto> {
    const response = await this.client.put<UserPersonalInformationDto>(`${this.baseUrl}/personal-info`, data);
    return response.data;
  }

  async getPassport(): Promise<UserPassportDetailsDto | null> {
    const response = await this.client.get<UserPassportDetailsDto>(`${this.baseUrl}/passport`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async updatePassport(data: UserPassportDetailsDto): Promise<UserPassportDetailsDto> {
    const response = await this.client.put<UserPassportDetailsDto>(`${this.baseUrl}/passport`, data);
    return response.data;
  }

  async getExperience(): Promise<InvestorExperienceDto | null> {
    const response = await this.client.get<InvestorExperienceDto>(`${this.baseUrl}/experience`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async updateExperience(data: InvestorExperienceDto): Promise<InvestorExperienceDto> {
    const response = await this.client.put<InvestorExperienceDto>(`${this.baseUrl}/experience`, data);
    return response.data;
  }

  async getConsents(): Promise<InvestorConsentsDto | null> {
    const response = await this.client.get<InvestorConsentsDto>(`${this.baseUrl}/consents`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async recordConsent(data: InvestorConsentsDto): Promise<InvestorConsentsDto> {
    const response = await this.client.post<InvestorConsentsDto>(`${this.baseUrl}/consents`, data);
    return response.data;
  }

  async getOnboardingStatus(): Promise<OnboardingStatusDto> {
    const response = await this.client.get<OnboardingStatusDto>(`${this.baseUrl}/onboarding-status`);
    return response.data;
  }

  async getResidentialStatus(): Promise<UserResidentialStatusDto | null> {
    const response = await this.client.get<UserResidentialStatusDto>(`${this.baseUrl}/residential`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async updateResidentialStatus(data: UserResidentialStatusDto): Promise<UserResidentialStatusDto> {
    const response = await this.client.put<UserResidentialStatusDto>(`${this.baseUrl}/residential`, data);
    return response.data;
  }

  async getTaxInfo(): Promise<UserTaxInfoDto | null> {
    const response = await this.client.get<UserTaxInfoDto>(`${this.baseUrl}/tax-info`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async updateTaxInfo(data: UserTaxInfoDto): Promise<UserTaxInfoDto> {
    const response = await this.client.put<UserTaxInfoDto>(`${this.baseUrl}/tax-info`, data);
    return response.data;
  }

  async getBankDetails(): Promise<UserBankDetailsDto | null> {
    const response = await this.client.get<UserBankDetailsDto>(`${this.baseUrl}/bank-details`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async updateBankDetails(data: UserBankDetailsDto): Promise<UserBankDetailsDto> {
    const response = await this.client.put<UserBankDetailsDto>(`${this.baseUrl}/bank-details`, data);
    return response.data;
  }

  /** Fetch the broker's preferred-bank display name (Laravel parity). */
  async getPreferredBank(): Promise<PreferredBankDto | null> {
    const response = await this.client.get<PreferredBankDto>(`${this.baseUrl}/bank-details/preferred-bank`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async getContactDetails(): Promise<UserContactDetailsDto | null> {
    const response = await this.client.get<UserContactDetailsDto>(`${this.baseUrl}/contact-details`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async updateContactDetails(data: UserContactDetailsDto): Promise<UserContactDetailsDto> {
    const response = await this.client.put<UserContactDetailsDto>(`${this.baseUrl}/contact-details`, data);
    return response.data;
  }

  async getNomination(): Promise<UserNominationDto | null> {
    const response = await this.client.get<UserNominationDto>(`${this.baseUrl}/nomination`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async updateNomination(data: UserNominationDto): Promise<UserNominationDto> {
    const response = await this.client.put<UserNominationDto>(`${this.baseUrl}/nomination`, data);
    return response.data;
  }

  async getRiskProfile(): Promise<UserRiskProfileDto | null> {
    const response = await this.client.get<UserRiskProfileDto>(`${this.baseUrl}/risk-profile`);
    return response.status === 204 || !response.data ? null : response.data;
  }

  async updateRiskProfile(data: UserRiskProfileDto): Promise<UserRiskProfileDto> {
    const response = await this.client.put<UserRiskProfileDto>(`${this.baseUrl}/risk-profile`, data);
    return response.data;
  }

  async finalSubmit(consents: InvestorConsentsDto): Promise<OnboardingStatusDto> {
    const response = await this.client.post<OnboardingStatusDto>(`${this.baseUrl}/final-submit`, consents);
    return response.data;
  }

  async changePassword(email: string, data: ChangePasswordDto): Promise<{ message: string; status: string }> {
    const response = await this.client.post<{ message: string; status: string }>(
      `/api/investor/profile/change-password?email=${encodeURIComponent(email)}`,
      data
    );
    return response.data;
  }
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const profileService = new ProfileService();
