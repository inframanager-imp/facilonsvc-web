import { apiClient } from '../utils/apiClient';
import { AuthorizedUserDto } from '../models/AuthorizedUserDto';

class UserService {
  registerUser(userDto: AuthorizedUserDto) {
    return apiClient.post<AuthorizedUserDto>('/api/users/register', userDto);
  }

  forgotPassword(email: string) {
    return apiClient.post(`/api/users/forgot-password?email=${email}`, null);
  }

  resetPassword(token: string, newPassword: string) {
    const params = new URLSearchParams({ token, newPassword }).toString();
    return apiClient.post('/api/users/reset-password', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  changePassword(oldPassword: string, newPassword: string) {
    return apiClient.post('/api/users/change-password', { oldPassword, newPassword });
  }

  checkEmailExists(email: string) {
    return apiClient.get(`/api/users/checkEmail?email=${email}`);
  }
}

export const userService = new UserService();
