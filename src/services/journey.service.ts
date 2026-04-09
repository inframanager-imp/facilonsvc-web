import { apiClient } from '../utils/apiClient';

export interface JourneyDiscontinueDto {
    reason: string;
    comments?: string;
}

export interface AbandonJourneyDto {
    investorId: number;
    brokerId: number;
    productId: number;
    abandonReason?: string;
}

export interface JourneyStatusDto {
    uniqueCode: string;
    status: string;
}

class JourneyService {
    private baseUrl = '/api/investor/journey';

    async discontinueJourney(uniqueCode: string, data: JourneyDiscontinueDto): Promise<{ message: string; status: string }> {
        const response = await apiClient.post<{ message: string; status: string }>(
            `${this.baseUrl}/discontinue/${uniqueCode}`,
            data
        );
        return response.data;
    }

    async abandonJourney(data: AbandonJourneyDto): Promise<{ message: string; status: string }> {
        const response = await apiClient.post<{ message: string; status: string }>(
            `${this.baseUrl}/abandon`,
            data
        );
        return response.data;
    }

    async getJourneyStatus(uniqueCode: string): Promise<JourneyStatusDto> {
        const response = await apiClient.get<JourneyStatusDto>(`${this.baseUrl}/status/${uniqueCode}`);
        return response.data;
    }
}

export const journeyService = new JourneyService();
