import { apiClient } from '../utils/apiClient';

export interface UserInviteDto {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

class AdminService {
  private readonly apiUrl = '/api/admin';

  getUsers(tenantId: number, page: number = 0, size: number = 10) {
    return apiClient.get<any>(`${this.apiUrl}/users`, {
      params: { tenantId, page, size },
    });
  }

  resetUserPassword(userId: number) {
    return apiClient.post<string>(`${this.apiUrl}/users/${userId}/reset-password`, {});
  }

  deactivateUser(userId: number) {
    return apiClient.post<string>(`${this.apiUrl}/users/${userId}/deactivate`, {});
  }

  healthCheck() {
    return apiClient.get<string>(`${this.apiUrl}/health`);
  }
}

export const adminService = new AdminService();
