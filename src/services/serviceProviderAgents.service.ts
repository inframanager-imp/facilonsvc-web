import { apiClient } from '../utils/apiClient';
import { ServiceAgentDto } from '../models/ServiceAgentDto';

/**
 * Service-Provider-side APIs for managing the SAs they employ:
 * listing, assigning to investors, and deactivating.
 *
 * Backend routes: {@code /api/service-provider/assignments/...}
 */
class ServiceProviderAgentsService {
  private readonly base = '/api/service-provider/assignments';

  async listAgents(serviceProviderId: number): Promise<ServiceAgentDto[]> {
    const res = await apiClient.get<ServiceAgentDto[]>(`${this.base}/agents`, {
      params: { serviceProviderId },
    });
    return res.data;
  }

  async deactivateAgent(agentId: number, reason?: string): Promise<DeactivationResponse> {
    const res = await apiClient.post<DeactivationResponse>(
      `${this.base}/agents/${agentId}/deactivate`,
      { reason: reason || '' }
    );
    return res.data;
  }
}

export interface DeactivationResponse {
  agentId: number;
  status: string;
  revokedDelegations: number;
}

export const serviceProviderAgentsService = new ServiceProviderAgentsService();
