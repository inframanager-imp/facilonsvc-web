import { apiClient } from '../utils/apiClient';
import { DelegationDto, DelegationCreateDto } from '../models/DelegationDto';

class DelegationService {
  private readonly base = '/api/clients/me/delegations';

  async getMyDelegations(): Promise<DelegationDto[]> {
    const res = await apiClient.get<DelegationDto[]>(this.base);
    return res.data;
  }

  async grantDelegation(dto: DelegationCreateDto): Promise<DelegationDto> {
    const res = await apiClient.post<DelegationDto>(this.base, dto);
    return res.data;
  }

  async revokeDelegation(delegationId: number): Promise<void> {
    await apiClient.post(`${this.base}/${delegationId}/revoke`);
  }

  async getPendingDelegations(): Promise<DelegationDto[]> {
    const res = await apiClient.get<DelegationDto[]>(`${this.base}/pending`);
    return res.data;
  }

  async acceptDelegation(
    delegationId: number, 
    customizations?: {
      scope?: string;
      canViewProfile?: boolean;
      canEditKyc?: boolean;
      canUploadDocuments?: boolean;
      canSubmitForms?: boolean;
    },
    consentIpAddress?: string
  ): Promise<DelegationDto> {
    const res = await apiClient.post<DelegationDto>(`${this.base}/${delegationId}/accept`, {
      delegationId,
      accept: true,
      consentGiven: true,
      consentIpAddress,
      consentVersion: '1.0',
      ...customizations
    });
    return res.data;
  }

  async rejectDelegation(delegationId: number, reason?: string): Promise<void> {
    await apiClient.post(`${this.base}/${delegationId}/reject`, {
      delegationId,
      accept: false,
      consentGiven: false,
      rejectionReason: reason
    });
  }

  async updateDelegation(
    delegationId: number,
    customizations: {
      scope?: string;
      canViewProfile?: boolean;
      canEditKyc?: boolean;
      canUploadDocuments?: boolean;
      canSubmitForms?: boolean;
    }
  ): Promise<DelegationDto> {
    const res = await apiClient.put<DelegationDto>(`${this.base}/${delegationId}`, customizations);
    return res.data;
  }

  async getServiceAgentActivity(page = 0, size = 20) {
    const res = await apiClient.get(`/api/clients/me/service-agent-activity`, {
      params: { page, size },
    });
    return res.data;
  }
}

export const delegationService = new DelegationService();
