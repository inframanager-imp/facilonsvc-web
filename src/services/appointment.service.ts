import { apiClient } from './api.client';

export interface AppointmentDto {
  id: number;
  investorCode: string;
  investorName: string;
  investorEmail: string;
  investorMobile: string;
  officeLocation: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  purpose: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy?: string;
}

export interface AppointmentRequest {
  officeLocation: string;
  appointmentDate: string;
  timeSlot: string;
  notes?: string;
}

export const OFFICE_LOCATIONS = {
  MUMBAI: 'MUMBAI',
  DELHI: 'DELHI',
  BANGALORE: 'BANGALORE'
} as const;

export const OFFICE_DETAILS = {
  MUMBAI: {
    name: 'Mumbai Office (Head Office)',
    address: 'Nariman Point, Mumbai - 400021, Maharashtra, India',
    phone: '+91 22 1234 5678',
    email: 'mumbai@facilon.com'
  },
  DELHI: {
    name: 'Delhi Office',
    address: 'Connaught Place, New Delhi - 110001, Delhi, India',
    phone: '+91 11 1234 5678',
    email: 'delhi@facilon.com'
  },
  BANGALORE: {
    name: 'Bangalore Office',
    address: 'MG Road, Bangalore - 560001, Karnataka, India',
    phone: '+91 80 1234 5678',
    email: 'bangalore@facilon.com'
  }
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
} as const;

class AppointmentService {
  private baseUrl = '/api/clients/appointments';

  /**
   * Create new appointment
   */
  async createAppointment(request: AppointmentRequest): Promise<AppointmentDto> {
    const response = await apiClient.post<AppointmentDto>(this.baseUrl, request);
    return response.data;
  }

  /**
   * Get my appointments
   */
  async getMyAppointments(): Promise<AppointmentDto[]> {
    const response = await apiClient.get<AppointmentDto[]>(this.baseUrl);
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
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: number): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${appointmentId}/cancel`);
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(
    appointmentId: number,
    request: AppointmentRequest
  ): Promise<AppointmentDto> {
    const response = await apiClient.put<AppointmentDto>(
      `${this.baseUrl}/${appointmentId}/reschedule`,
      request
    );
    return response.data;
  }

  /**
   * Get available time slots
   */
  async getAvailableSlots(officeLocation: string, date: string): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      `${this.baseUrl}/available-slots?officeLocation=${officeLocation}&date=${date}`
    );
    return response.data;
  }

  /**
   * Format appointment date for display
   */
  formatAppointmentDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format date for API (YYYY-MM-DD)
   */
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'status-badge status-badge--success';
      case 'COMPLETED':
        return 'status-badge status-badge--info';
      case 'CANCELLED':
        return 'status-badge status-badge--secondary';
      case 'NO_SHOW':
        return 'status-badge status-badge--danger';
      default:
        return 'status-badge';
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'NO_SHOW':
        return 'No Show';
      default:
        return status;
    }
  }

  /**
   * Check if appointment can be cancelled
   */
  canCancel(appointment: AppointmentDto): boolean {
    return appointment.status === 'SCHEDULED';
  }

  /**
   * Check if appointment can be rescheduled
   */
  canReschedule(appointment: AppointmentDto): boolean {
    return appointment.status === 'SCHEDULED';
  }

  /**
   * Get minimum bookable date (tomorrow)
   */
  getMinBookableDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Get maximum bookable date (30 days from now)
   */
  getMaxBookableDate(): Date {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    maxDate.setHours(23, 59, 59, 999);
    return maxDate;
  }

  /**
   * Check if date is a weekend
   */
  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  /**
   * Check if date is bookable
   */
  isDateBookable(date: Date): boolean {
    const min = this.getMinBookableDate();
    const max = this.getMaxBookableDate();
    return date >= min && date <= max && !this.isWeekend(date);
  }
}

export const appointmentService = new AppointmentService();
