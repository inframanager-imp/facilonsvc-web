import { apiClient } from '../utils/apiClient';
import { ServiceAgentDto, ServiceAgentInvestorDto } from '../models/ServiceAgentDto';
import { DelegationDto, DelegationCreateDto } from '../models/DelegationDto';
import { AuditLogDto, PageResponse } from '../models/AuditLogDto';

export type { ServiceAgentDto, ServiceAgentInvestorDto };
export type { DelegationDto, DelegationCreateDto };
export type { AuditLogDto, PageResponse };

class ServiceAgentService {
  private readonly saBase = '/api/service-agents/me';

  // ── Service Agent profile ────────────────────────────────────────────────

  async getMyProfile(): Promise<ServiceAgentDto> {
    const res = await apiClient.get<ServiceAgentDto>(`${this.saBase}/profile`);
    return res.data;
  }

  async getMyInvestors(): Promise<ServiceAgentInvestorDto[]> {
    const res = await apiClient.get<ServiceAgentInvestorDto[]>(`${this.saBase}/investors`);
    return res.data;
  }

  async getMyAuditLogs(page = 0, size = 20): Promise<PageResponse<AuditLogDto>> {
    const res = await apiClient.get<PageResponse<AuditLogDto>>(`${this.saBase}/audit-logs`, {
      params: { page, size },
    });
    return res.data;
  }

  async getAuditLogsForInvestor(investorId: number, page = 0, size = 20): Promise<PageResponse<AuditLogDto>> {
    const res = await apiClient.get<PageResponse<AuditLogDto>>(
      `${this.saBase}/audit-logs/investor/${investorId}`,
      { params: { page, size } }
    );
    return res.data;
  }

  // ── Delegation APIs (investor-facing, kept here for convenience) ─────────

  async getMyDelegations(): Promise<DelegationDto[]> {
    const res = await apiClient.get<DelegationDto[]>('/api/clients/me/delegations');
    return res.data;
  }

  async grantDelegation(dto: DelegationCreateDto): Promise<DelegationDto> {
    const res = await apiClient.post<DelegationDto>('/api/clients/me/delegations', dto);
    return res.data;
  }

  async revokeDelegation(delegationId: number): Promise<void> {
    await apiClient.post(`/api/clients/me/delegations/${delegationId}/revoke`);
  }

  async getServiceAgentActivity(page = 0, size = 20): Promise<PageResponse<AuditLogDto>> {
    const res = await apiClient.get<PageResponse<AuditLogDto>>(
      '/api/clients/me/service-agent-activity',
      { params: { page, size } }
    );
    return res.data;
  }

  // ── SA proxy: investor data (all under /service-agents/me/investors/{id}) ─

  private inv(investorId: number) {
    return `${this.saBase}/investors/${investorId}`;
  }

  async getInvestorDashboard(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/dashboard`)).data;
  }

  async getInvestorProfile(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/profile`)).data;
  }

  async getInvestorProgress(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/progress`)).data;
  }

  async getInvestorPersonalInfo(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/personal-info`)).data;
  }

  async updateInvestorPersonalInfo(investorId: number, data: unknown) {
    return (await apiClient.put(`${this.inv(investorId)}/personal-info`, data)).data;
  }

  async getInvestorContactDetails(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/contact-details`)).data;
  }

  async updateInvestorContactDetails(investorId: number, data: unknown) {
    return (await apiClient.put(`${this.inv(investorId)}/contact-details`, data)).data;
  }

  async getInvestorPassport(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/passport`)).data;
  }

  async updateInvestorPassport(investorId: number, data: unknown) {
    return (await apiClient.put(`${this.inv(investorId)}/passport`, data)).data;
  }

  async getInvestorTaxInfo(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/tax-info`)).data;
  }

  async updateInvestorTaxInfo(investorId: number, data: unknown) {
    return (await apiClient.put(`${this.inv(investorId)}/tax-info`, data)).data;
  }

  async getInvestorBankDetails(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/bank-details`)).data;
  }

  async updateInvestorBankDetails(investorId: number, data: unknown) {
    return (await apiClient.put(`${this.inv(investorId)}/bank-details`, data)).data;
  }

  async getInvestorNomination(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/nomination`)).data;
  }

  async updateInvestorNomination(investorId: number, data: unknown) {
    return (await apiClient.put(`${this.inv(investorId)}/nomination`, data)).data;
  }

  async getInvestorRiskProfile(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/risk-profile`)).data;
  }

  async updateInvestorRiskProfile(investorId: number, data: unknown) {
    return (await apiClient.put(`${this.inv(investorId)}/risk-profile`, data)).data;
  }

  async getInvestorOnboarding(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/onboarding`)).data;
  }

  async submitInvestorOnboarding(investorId: number, data: unknown) {
    return (await apiClient.post(`${this.inv(investorId)}/onboarding/submit`, data)).data;
  }

  async getInvestorKycDocuments(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/kyc/documents`)).data;
  }

  async uploadInvestorKycDocument(investorId: number, file: File, documentType: string, description = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('description', description);
    return (await apiClient.post(`${this.inv(investorId)}/kyc/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  }

  async getInvestorDocuments(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/documents`)).data;
  }

  async uploadInvestorDocument(investorId: number, file: File, documentType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return (await apiClient.post(`${this.inv(investorId)}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  }

  async getInvestorPhysicalSubmission(investorId: number) {
    return (await apiClient.get(`${this.inv(investorId)}/physical-submission`)).data;
  }
}

export const serviceAgentService = new ServiceAgentService();
