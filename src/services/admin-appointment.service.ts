import { apiClient } from './api.client';
import { AppointmentDto } from './appointment.service';

export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

class AdminAppointmentService {
  private baseUrl = '/api/admin/appointments';

  /**
   * Get all appointments with filters
   */
  async getAllAppointments(
    status?: string,
    officeLocation?: string
  ): Promise<AppointmentDto[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (officeLocation) params.append('officeLocation', officeLocation);

    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
    const response = await apiClient.get<AppointmentDto[]>(url);
    return response.data;
  }

  /**
   * Get today's appointments
   */
  async getTodaysAppointments(): Promise<AppointmentDto[]> {
    const response = await apiClient.get<AppointmentDto[]>(`${this.baseUrl}/today`);
    return response.data;
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId: number): Promise<AppointmentDto> {
    const response = await apiClient.get<AppointmentDto>(`${this.baseUrl}/${appointmentId}`);
    return response.data;
  }

  /**
   * Mark appointment as completed
   */
  async completeAppointment(appointmentId: number): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${appointmentId}/complete`);
  }

  /**
   * Mark appointment as no-show
   */
  async markNoShow(appointmentId: number): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${appointmentId}/no-show`);
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<AppointmentStats> {
    const response = await apiClient.get<AppointmentStats>(`${this.baseUrl}/stats`);
    return response.data;
  }
}

export const adminAppointmentService = new AdminAppointmentService();
