import { apiClient } from '../utils/apiClient';

let saProxyInvestorId: number | null = null;

export const setSAProxyMode = (investorId: number | null) => {
  saProxyInvestorId = investorId;
};

export const getSAProxyInvestorId = (): number | null => {
  return saProxyInvestorId;
};

export const adaptUrl = (originalUrl: string): string => {
  if (saProxyInvestorId === null) {
    return originalUrl;
  }

  const baseProxy = `/api/service-agents/me/investors/${saProxyInvestorId}`;

  // Onboarding/registration endpoints - don't proxy these (public endpoints)
  if (originalUrl.includes('/onboarding/register/')) {
    return originalUrl;
  }

  // Investor specific endpoints (password change, etc.)
  if (originalUrl.startsWith('/api/investor/')) {
    return originalUrl;
  }

  // Profile endpoints: /api/clients/profile/* → /api/service-agents/me/investors/{id}/*
  if (originalUrl.startsWith('/api/clients/profile/')) {
    const path = originalUrl.replace('/api/clients/profile/', '/');
    return `${baseProxy}${path}`;
  }

  // Dashboard, progress, etc: /api/clients/me/* → /api/service-agents/me/investors/{id}/*
  if (originalUrl.startsWith('/api/clients/me/')) {
    const path = originalUrl.replace('/api/clients/me/', '/');
    return `${baseProxy}${path}`;
  }

  // Direct me endpoint: /api/clients/me → /api/service-agents/me/investors/{id}/profile
  if (originalUrl === '/api/clients/me') {
    return `${baseProxy}/profile`;
  }

  // KYC endpoints: /api/clients/kyc/* → /api/service-agents/me/investors/{id}/kyc/*
  if (originalUrl.startsWith('/api/clients/kyc/')) {
    const path = originalUrl.replace('/api/clients/kyc/', '/kyc/');
    return `${baseProxy}${path}`;
  }

  // Document endpoints: /api/clients/me/documents → /api/service-agents/me/investors/{id}/documents
  // Includes /documents, /documents/kyc/requirements, /documents/onboarding/list, etc.
  if (originalUrl.startsWith('/api/clients/me/documents')) {
    const path = originalUrl.replace('/api/clients/me/documents', '/documents');
    return `${baseProxy}${path}`;
  }

  // Fallback for direct /api/clients/documents (less common)
  if (originalUrl.startsWith('/api/clients/documents')) {
    const path = originalUrl.replace('/api/clients/documents', '/documents');
    return `${baseProxy}${path}`;
  }

  return originalUrl;
};

export const saProxyApiClient = {
  async get<T = any>(url: string, config?: any): Promise<{ data: T; status: number }> {
    const adaptedUrl = adaptUrl(url);
    console.log('[SAProxy] GET:', url, '→', adaptedUrl);
    return apiClient.get<T>(adaptedUrl, config);
  },

  async post<T = any>(url: string, data?: any, config?: any): Promise<{ data: T; status: number }> {
    const adaptedUrl = adaptUrl(url);
    console.log('[SAProxy] POST:', url, '→', adaptedUrl);
    return apiClient.post<T>(adaptedUrl, data, config);
  },

  async put<T = any>(url: string, data?: any, config?: any): Promise<{ data: T; status: number }> {
    const adaptedUrl = adaptUrl(url);
    console.log('[SAProxy] PUT:', url, '→', adaptedUrl);
    return apiClient.put<T>(adaptedUrl, data, config);
  },

  async delete<T = any>(url: string, config?: any): Promise<{ data: T; status: number }> {
    const adaptedUrl = adaptUrl(url);
    console.log('[SAProxy] DELETE:', url, '→', adaptedUrl);
    return apiClient.delete<T>(adaptedUrl, config);
  },
};
