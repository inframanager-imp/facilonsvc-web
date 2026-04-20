import { apiClient } from '../utils/apiClient';

let saProxyInvestorId: number | null = null;

/** Optional boot-out callback set by the ServiceAgentProxyWrapper — invoked when
 *  the server returns 403 on a proxied request, indicating the delegation was
 *  revoked or expired mid-session.  The wrapper uses this to navigate away
 *  from the proxy screen and show an inline toast. */
let proxyRevokedCallback: (() => void) | null = null;

export const setSAProxyMode = (investorId: number | null) => {
  saProxyInvestorId = investorId;
};

export const getSAProxyInvestorId = (): number | null => {
  return saProxyInvestorId;
};

/**
 * Register a callback that fires when a proxied request returns 403.
 * The ServiceAgentProxyWrapper registers this on mount so that a revoke /
 * expiry taking effect mid-session causes the SA to be evicted from the
 * investor view instead of hammering the server with forbidden calls.
 */
export const setProxyRevokedCallback = (fn: (() => void) | null) => {
  proxyRevokedCallback = fn;
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

/**
 * Shared handler for proxy-mode responses.  When the server returns 403 on a
 * request that was actually proxied (i.e. the URL was adapted), we treat it
 * as revocation-in-progress: fire the boot-out callback, clear proxy mode,
 * and re-throw so the caller still sees the error.
 *
 * <p>This is the client-side half of "revocation session invalidation" —
 * the server-side half is the per-request check in
 * {@code ServiceAgentAccessControlService} which already refuses forbidden
 * requests the moment {@code isActive = false} is written.  The SA's JWT
 * itself stays valid (we do not maintain a server-side blacklist), but
 * every subsequent proxy call will 403, so the SA's effective access
 * window after revocation is one request, not the JWT lifetime.
 */
function handleProxyError(err: any, wasProxied: boolean): never {
  const status = err?.response?.status;
  if (wasProxied && status === 403 && saProxyInvestorId !== null) {
    saProxyInvestorId = null;
    if (proxyRevokedCallback) {
      try { proxyRevokedCallback(); } catch { /* swallow callback errors */ }
    }
  }
  throw err;
}

export const saProxyApiClient = {
  async get<T = any>(url: string, config?: any): Promise<{ data: T; status: number }> {
    const adaptedUrl = adaptUrl(url);
    const wasProxied = adaptedUrl !== url;
    console.log('[SAProxy] GET:', url, '→', adaptedUrl);
    try {
      return await apiClient.get<T>(adaptedUrl, config);
    } catch (err) {
      handleProxyError(err, wasProxied);
    }
  },

  async post<T = any>(url: string, data?: any, config?: any): Promise<{ data: T; status: number }> {
    const adaptedUrl = adaptUrl(url);
    const wasProxied = adaptedUrl !== url;
    console.log('[SAProxy] POST:', url, '→', adaptedUrl);
    try {
      return await apiClient.post<T>(adaptedUrl, data, config);
    } catch (err) {
      handleProxyError(err, wasProxied);
    }
  },

  async put<T = any>(url: string, data?: any, config?: any): Promise<{ data: T; status: number }> {
    const adaptedUrl = adaptUrl(url);
    const wasProxied = adaptedUrl !== url;
    console.log('[SAProxy] PUT:', url, '→', adaptedUrl);
    try {
      return await apiClient.put<T>(adaptedUrl, data, config);
    } catch (err) {
      handleProxyError(err, wasProxied);
    }
  },

  async delete<T = any>(url: string, config?: any): Promise<{ data: T; status: number }> {
    const adaptedUrl = adaptUrl(url);
    const wasProxied = adaptedUrl !== url;
    console.log('[SAProxy] DELETE:', url, '→', adaptedUrl);
    try {
      return await apiClient.delete<T>(adaptedUrl, config);
    } catch (err) {
      handleProxyError(err, wasProxied);
    }
  },
};
