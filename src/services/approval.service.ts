import { apiClient } from '../utils/apiClient';

export interface ApprovalRequestDto {
    investorId: number;
    requestType: string; // "status_change", "document_approval", "profile_update"
    currentStatus?: string;
    requestedStatus?: string;
    reason?: string;
    requestedBy?: string;
}

export interface ApprovalResponseDto {
    id: number;
    investorId: number;
    requestType: string;
    currentStatus?: string;
    requestedStatus?: string;
    reason?: string;
    status: string; // "pending", "approved", "rejected"
    requestedBy?: string;
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
}

class ApprovalService {
    private baseUrl = '/api/investor/approvals';

    async createApprovalRequest(data: ApprovalRequestDto): Promise<ApprovalResponseDto> {
        const response = await apiClient.post<ApprovalResponseDto>(`${this.baseUrl}/request`, data);
        return response.data;
    }

    async getApprovalRequests(investorId: number): Promise<ApprovalResponseDto[]> {
        const response = await apiClient.get<ApprovalResponseDto[]>(`${this.baseUrl}/${investorId}`);
        return response.data;
    }

    async getPendingApprovalRequests(investorId: number): Promise<ApprovalResponseDto[]> {
        const response = await apiClient.get<ApprovalResponseDto[]>(`${this.baseUrl}/${investorId}/pending`);
        return response.data;
    }

    async getAllPendingRequests(): Promise<ApprovalResponseDto[]> {
        const response = await apiClient.get<ApprovalResponseDto[]>(`${this.baseUrl}/pending`);
        return response.data;
    }

    async approveRequest(approvalId: number, approvedBy: string): Promise<ApprovalResponseDto> {
        const response = await apiClient.post<ApprovalResponseDto>(
            `${this.baseUrl}/${approvalId}/approve?approvedBy=${encodeURIComponent(approvedBy)}`
        );
        return response.data;
    }

    async rejectRequest(approvalId: number, rejectedBy: string, rejectionReason: string): Promise<ApprovalResponseDto> {
        const response = await apiClient.post<ApprovalResponseDto>(
            `${this.baseUrl}/${approvalId}/reject?rejectedBy=${encodeURIComponent(rejectedBy)}`,
            { rejectionReason }
        );
        return response.data;
    }
}

export const approvalService = new ApprovalService();
