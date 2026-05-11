import { apiClient } from '../utils/apiClient';

/**
 * Service Provider onboarding service — public, no auth required.
 *
 * Mirrors Laravel `BrokerController` flow:
 *   1. landing(status)            → register_sp page greeting
 *   2. getUserConsent(uniqueCode) → services_provider_user (user-level Privacy & Consent)
 *   3. submitUserConsent(...)     → service_provider_step3_submit (insert + PDF + mail)
 *   4. getUserPrefill(spEmail)    → services_provider_user_register form prefill
 *   5. registerUser(...)          → service_provider_user_register_store (insert + welcome mail)
 */

export interface SpLandingDto {
  fullName: string;
  email: string;
  status: string;
}

export interface SpUserConsentLandingDto {
  uniqueCode: string;
  nameOfClient: string;
  consentVersion: string;
  effectiveDate: string;
}

export interface SpUserConsentRequest {
  uniqueCode: string;
  consentVersion: string;
  effectiveDate: string;
}

export interface SpUserConsentResponse {
  serviceProviderEmail: string;
  message: string;
  mailSent: boolean;
}

export interface SpUserPrefillDto {
  serviceProviderEmail: string;
  fullName: string;
  complianceEmail: string;
  compliancePhoneNo: string;
  complianceName: string;
  complianceLastName: string;
}

export interface SpUserRegisterRequest {
  serviceProviderEmail: string;
  serviceProviderNameHidden: string;
  firstName: string;
  lastName: string;
  designation?: string;
  officialEmail: string;
  officialPhone: string;
  consent: boolean;
}

export interface SpUserRegisterResponse {
  success: boolean;
  message: string;
  welcomeMailSent: boolean;
  b2bInviteSent: boolean;
  invitedUserId?: string;
}

class ServiceProviderService {
  private base = '/api/clients/sp';

  async landing(status: string): Promise<SpLandingDto> {
    const r = await apiClient.get<SpLandingDto>(`${this.base}/landing`, {
      params: { status },
    });
    return r.data;
  }

  async getUserConsent(uniqueCode: string): Promise<SpUserConsentLandingDto> {
    const r = await apiClient.get<SpUserConsentLandingDto>(`${this.base}/user-consent`, {
      params: { uniqueCode },
    });
    return r.data;
  }

  async submitUserConsent(body: SpUserConsentRequest): Promise<SpUserConsentResponse> {
    const r = await apiClient.post<SpUserConsentResponse>(`${this.base}/user-consent`, body);
    return r.data;
  }

  async getUserPrefill(serviceProviderEmail: string): Promise<SpUserPrefillDto> {
    const r = await apiClient.get<SpUserPrefillDto>(`${this.base}/user-register`, {
      params: { serviceProviderEmail },
    });
    return r.data;
  }

  async registerUser(body: SpUserRegisterRequest): Promise<SpUserRegisterResponse> {
    const r = await apiClient.post<SpUserRegisterResponse>(`${this.base}/user-register`, body);
    return r.data;
  }
}

export const serviceProviderService = new ServiceProviderService();
