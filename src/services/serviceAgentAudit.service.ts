import { apiClient } from '../utils/apiClient';
import { AuditLogDto, PageResponse } from '../models/AuditLogDto';

class ServiceAgentAuditService {
  private readonly base = '/api/service-agents/me/audit-logs';

  async getMyAuditLogs(page = 0, size = 20): Promise<PageResponse<AuditLogDto>> {
    const res = await apiClient.get<PageResponse<AuditLogDto>>(this.base, {
      params: { page, size },
    });
    return res.data;
  }

  async getAuditLogsForInvestor(investorId: number, page = 0, size = 20): Promise<PageResponse<AuditLogDto>> {
    const res = await apiClient.get<PageResponse<AuditLogDto>>(
      `${this.base}/investor/${investorId}`,
      { params: { page, size } }
    );
    return res.data;
  }
}

export const serviceAgentAuditService = new ServiceAgentAuditService();
