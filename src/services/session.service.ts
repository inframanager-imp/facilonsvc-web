import { apiClient } from '../utils/apiClient';

export interface SessionDto {
    sessionId: string;
    loginTime: string;
    lastActivityTime: string;
    loginMethod: string;
    ipAddress: string;
    userAgent: string;
    isCurrent: boolean;
    expiresInSeconds: number;
}

export interface SessionStatusDto {
    sessionId: string;
    loginTime: string;
    lastActivityTime: string;
    loginMethod: string;
    expiresInSeconds: number;
    isActive: boolean;
}

class SessionService {
    /**
     * Logout from current session
     */
    async logout(): Promise<{ message: string; success: boolean }> {
        const response = await apiClient.post<{ message: string; success: boolean }>('/api/investor/session/logout');
        return response.data;
    }

    /**
     * Get current session status
     */
    async getSessionStatus(): Promise<SessionStatusDto> {
        const response = await apiClient.get<SessionStatusDto>('/api/investor/session/status');
        return response.data;
    }

    /**
     * Get all active sessions for current investor
     */
    async getActiveSessions(): Promise<SessionDto[]> {
        const response = await apiClient.get<SessionDto[]>('/api/investor/session/active');
        return response.data;
    }

    /**
     * Logout from all devices except current
     */
    async logoutAllDevices(): Promise<{ message: string; count: number; success: boolean }> {
        const response = await apiClient.post<{ message: string; count: number; success: boolean }>('/api/investor/session/logout-all');
        return response.data;
    }

    /**
     * Logout specific session by ID
     */
    async logoutSession(sessionId: string): Promise<{ message: string; success: boolean }> {
        const response = await apiClient.post<{ message: string; success: boolean }>(`/api/investor/session/logout/${sessionId}`);
        return response.data;
    }

    /**
     * Check if session is about to expire (warning threshold: 5 minutes)
     */
    shouldShowTimeoutWarning(expiresInSeconds: number): boolean {
        const warningThresholdSeconds = 5 * 60; // 5 minutes
        return expiresInSeconds > 0 && expiresInSeconds <= warningThresholdSeconds;
    }

    /**
     * Format time remaining
     */
    formatTimeRemaining(seconds: number): string {
        if (seconds <= 0) return 'Expired';

        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        }
        return `${secs}s`;
    }

    /**
     * Parse user agent to get device info
     */
    parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
        // Simple user agent parsing
        let browser = 'Unknown';
        let os = 'Unknown';
        let device = 'Desktop';

        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';

        if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
            device = 'Mobile';
        } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
            device = 'Tablet';
        }

        return { browser, os, device };
    }
}

export const sessionService = new SessionService();
