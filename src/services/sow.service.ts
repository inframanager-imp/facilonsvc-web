import { apiClient } from '../utils/apiClient';

export interface SowTemplateDto {
    id: number;
    name: string;
    version: string;
    applicableFor: string;
    content: {
        sections: SowSection[];
    };
    isActive: boolean;
}

export interface SowSection {
    title: string;
    type?: string; // 'static' or undefined (for form fields)
    content?: string; // Static content
    fields?: SowField[];
}

export interface SowField {
    name: string;
    label: string;
    type: string; // 'text', 'number', 'select', 'checkbox', 'textarea'
    required?: boolean;
    readonly?: boolean;
    value?: any;
    options?: string[];
}

export interface InvestorSowDto {
    id: number;
    investorId: number;
    templateId: number;
    sowData: Record<string, any>;
    status: string; // 'draft', 'submitted', 'approved', 'rejected'
    submittedDate?: string;
    approvedDate?: string;
    approvedBy?: number;
    rejectionReason?: string;
    digitalSignature?: string;
    signedDate?: string;
    createdDate: string;
}

export interface CreateSowDto {
    investorId: number;
    templateId: number;
    sowData?: Record<string, any>;
}

export interface UpdateSowDto {
    sowData: Record<string, any>;
    digitalSignature?: string;
}

class SowService {
    /**
     * Whether the current investor has agreed to their SOW (drives the journey gate).
     */
    async getMyAgreed(): Promise<boolean> {
        const response = await apiClient.get<{ agreed: boolean }>('/api/investor/sow/me/agreed');
        return !!response.data?.agreed;
    }

    /**
     * Record the current investor's agreement to the SOW.
     */
    async agreeMe(): Promise<void> {
        await apiClient.post('/api/investor/sow/me/agree');
    }

    /**
     * Revoke the current investor's SOW agreement (re-closes the journey gate).
     */
    async revokeMe(): Promise<void> {
        await apiClient.post('/api/investor/sow/me/revoke');
    }

    /**
     * Get active SOW template
     */
    async getTemplate(applicableFor: string = 'All'): Promise<SowTemplateDto> {
        const response = await apiClient.get<SowTemplateDto>(`/api/investor/sow/template`, {
            params: { applicableFor }
        });
        return response.data;
    }

    /**
     * Create new SOW from template
     */
    async createSow(dto: CreateSowDto): Promise<InvestorSowDto> {
        const response = await apiClient.post<InvestorSowDto>('/api/investor/sow/create', dto);
        return response.data;
    }

    /**
     * Update SOW (draft only)
     */
    async updateSow(id: number, dto: UpdateSowDto): Promise<InvestorSowDto> {
        const response = await apiClient.put<InvestorSowDto>(`/api/investor/sow/${id}`, dto);
        return response.data;
    }

    /**
     * Submit SOW for approval
     */
    async submitSow(id: number): Promise<{ message: string; sow: InvestorSowDto }> {
        const response = await apiClient.post<{ message: string; sow: InvestorSowDto }>(`/api/investor/sow/${id}/submit`);
        return response.data;
    }

    /**
     * Get SOW by ID
     */
    async getSow(id: number): Promise<InvestorSowDto> {
        const response = await apiClient.get<InvestorSowDto>(`/api/investor/sow/${id}`);
        return response.data;
    }

    /**
     * List all SOWs for investor
     */
    async listSows(investorId: number): Promise<InvestorSowDto[]> {
        const response = await apiClient.get<InvestorSowDto[]>('/api/investor/sow/list', {
            params: { investorId }
        });
        return response.data;
    }

    /**
     * Approve SOW (admin)
     */
    async approveSow(id: number, approvedBy: number): Promise<{ message: string; sow: InvestorSowDto }> {
        const response = await apiClient.post<{ message: string; sow: InvestorSowDto }>(`/api/investor/sow/${id}/approve`, null, {
            params: { approvedBy }
        });
        return response.data;
    }

    /**
     * Reject SOW (admin)
     */
    async rejectSow(id: number, reason: string): Promise<{ message: string; sow: InvestorSowDto }> {
        const response = await apiClient.post<{ message: string; sow: InvestorSowDto }>(`/api/investor/sow/${id}/reject`, null, {
            params: { reason }
        });
        return response.data;
    }

    /**
     * Get SOW PDF data
     */
    async getSowPdfData(id: number): Promise<Record<string, any>> {
        const response = await apiClient.get<Record<string, any>>(`/api/investor/sow/${id}/pdf-data`);
        return response.data;
    }

    /**
     * Get status badge class
     */
    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'draft':
                return 'badge-secondary';
            case 'submitted':
                return 'badge-warning';
            case 'approved':
                return 'badge-success';
            case 'rejected':
                return 'badge-danger';
            default:
                return 'badge-secondary';
        }
    }

    /**
     * Get status display text
     */
    getStatusText(status: string): string {
        switch (status) {
            case 'draft':
                return 'Draft';
            case 'submitted':
                return 'Pending Approval';
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            default:
                return status;
        }
    }
}

export const sowService = new SowService();
