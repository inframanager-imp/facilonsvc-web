import { apiClient } from '../utils/apiClient';

export interface NextholderDto {
    id?: number;
    investorId?: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    relationship: string;
    dateOfBirth: string; // ISO date
    email?: string;
    mobile?: string;
    pan?: string;
    aadhaar?: string;
    isMinor: boolean;
    guardianName?: string;
    guardianRelationship?: string;
    guardianPan?: string;
    status: number;
}

export interface DataConsentDto {
    id?: number;
    consentType: string;
    isGiven: boolean;
    consentDate?: string;
    ipAddress?: string;
    userAgent?: string;
    revokedAt?: string;
}

export interface EmailInvitationDto {
    id?: number;
    investorId?: number;
    recipientEmail: string;
    recipientName: string;
    invitationType: string;
    invitationToken?: string;
    status?: string;
    sentDate?: string;
    expiryDate?: string;
    message?: string;
    resendCount?: number;
    lastResendDate?: string;
    openedDate?: string;
    acceptedDate?: string;
}

class NextholderService {
    private baseUrl = '/api/clients/me/nextholders';

    async getNextholders(): Promise<NextholderDto[]> {
        const response = await apiClient.get<NextholderDto[]>(this.baseUrl);
        return response.data;
    }

    async getNextholder(id: number): Promise<NextholderDto> {
        const response = await apiClient.get<NextholderDto>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async createNextholder(data: NextholderDto): Promise<NextholderDto> {
        const response = await apiClient.post<NextholderDto>(this.baseUrl, data);
        return response.data;
    }

    async updateNextholder(id: number, data: NextholderDto): Promise<NextholderDto> {
        const response = await apiClient.put<NextholderDto>(`${this.baseUrl}/${id}`, data);
        return response.data;
    }

    async deleteNextholder(id: number): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${id}`);
    }

    async getInvitations(): Promise<EmailInvitationDto[]> {
        const response = await apiClient.get<EmailInvitationDto[]>(`${this.baseUrl}/invitations`);
        return response.data;
    }

    async sendInvitation(data: EmailInvitationDto): Promise<EmailInvitationDto> {
        const response = await apiClient.post<EmailInvitationDto>(`${this.baseUrl}/invitations`, data);
        return response.data;
    }

    async resendInvitation(id: number): Promise<EmailInvitationDto> {
        const response = await apiClient.put<EmailInvitationDto>(`${this.baseUrl}/invitations/${id}/resend`, {});
        return response.data;
    }

    async recordConsent(data: DataConsentDto): Promise<DataConsentDto> {
        const response = await apiClient.post<DataConsentDto>(`${this.baseUrl}/consent`, data);
        return response.data;
    }

    async getConsents(): Promise<DataConsentDto[]> {
        const response = await apiClient.get<DataConsentDto[]>(`${this.baseUrl}/consent`);
        return response.data;
    }
}

export const nextholderService = new NextholderService();
