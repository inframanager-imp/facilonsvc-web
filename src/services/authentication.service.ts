import { apiClient } from '../utils/apiClient';
import { jwtDecode } from 'jwt-decode';

let b2cLoginUrlFetchStarted = false;
export function hasB2CLoginUrlBeenFetched() {
  return b2cLoginUrlFetchStarted;
}
export function setB2CLoginUrlFetched() {
  b2cLoginUrlFetchStarted = true;
}
export function resetB2CLoginUrlFetchState() {
  b2cLoginUrlFetchStarted = false;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  mustChangePassword?: boolean;
}

export interface DecodedToken {
  sub: string;
  tenantId: number;
  roles: string[];
  authorities: string[];
  exp: number;
  iat: number;
  name?: string;
  given_name?: string;
  family_name?: string;
}

export interface AzureB2CConfig {
  loginUrl: string;
  logoutUrl: string;
  enabled: boolean;
}

class AuthenticationService {
  // Local database login (JWT)
  login(loginId: string, password: string) {
    return apiClient.post<LoginResponse>('/api/login', {
      loginId,
      password,
    }).then((response) => {
      const accessToken = response.data?.accessToken || (response.data as any)?.accessToken;
      const tokenType = response.data?.tokenType || 'Bearer';
      const mustChangePassword = response.data?.mustChangePassword || false;

      if (accessToken) {
        const tokenStr = `${tokenType} ${accessToken}`;
        const decoded = jwtDecode<DecodedToken>(accessToken);

        localStorage.setItem('JwtToken', tokenStr);
        localStorage.setItem('tenantId', decoded.tenantId?.toString() || '');
        localStorage.setItem('currentUser.id', decoded.sub);
        localStorage.setItem('currentUser.roles', JSON.stringify(decoded.roles || []));
        localStorage.setItem('currentUser.authoritylist', JSON.stringify(decoded.authorities || []));
        localStorage.setItem('currentUser.name', decoded.given_name || decoded.name || decoded.sub);
        localStorage.setItem('loginMethod', 'local');
        localStorage.setItem('mustChangePassword', mustChangePassword.toString());

        return response.data;
      }
      throw new Error('Invalid response from server');
    });
  }

  // Azure B2C OAuth2 login - Get login URL
  async getAzureB2CLoginUrl(): Promise<AzureB2CConfig | null> {
    try {
      debugger
      const response = await apiClient.get<{ loginUrl: string; enabled: boolean | string }>('/api/auth/azure-b2c/login-url');
      // Backend returns enabled as boolean true, not string 'true'
      const enabled = response.data.enabled === true || response.data.enabled === 'true';
      const config = {
        loginUrl: response.data.loginUrl,
        logoutUrl: '', // Will be fetched on logout
        enabled
      };
      console.log('[Auth] Azure B2C login-url response:', { loginUrl: config.loginUrl?.substring(0, 60) + '...', enabled: config.enabled });
      return config;
    } catch (error) {
      console.error('[Auth] Failed to get Azure B2C login URL:', error);
      return null;
    }
  }

  // Azure B2C OAuth2 callback - Exchange code for JWT
  async handleAzureB2CCallback(code: string, state?: string): Promise<LoginResponse> {
    const payload: { code: string; state?: string } = { code };
    if (state) payload.state = state;
    const response = await apiClient.post<LoginResponse>('/api/auth/azure-b2c/callback', payload);

    const accessToken = response.data?.accessToken || (response.data as any)?.accessToken;
    const tokenType = response.data?.tokenType || 'Bearer';

    if (accessToken) {
      const tokenStr = `${tokenType} ${accessToken}`;
      const decoded = jwtDecode<DecodedToken>(accessToken);

      localStorage.setItem('JwtToken', tokenStr);
      localStorage.setItem('tenantId', decoded.tenantId?.toString() || '');
      localStorage.setItem('currentUser.id', decoded.sub);
      localStorage.setItem('currentUser.roles', JSON.stringify(decoded.roles || []));
      localStorage.setItem('currentUser.authoritylist', JSON.stringify(decoded.authorities || []));
      localStorage.setItem('currentUser.name', decoded.given_name || decoded.name || decoded.sub);
      localStorage.setItem('loginMethod', 'azure-b2c');

      return response.data;
    }
    throw new Error('Invalid response from server');
  }

  // Azure B2C MSAL callback - Send ID token to backend for validation
  async handleAzureB2CCallbackWithMSAL(idToken: string): Promise<LoginResponse> {
    console.log('[AuthService] handleAzureB2CCallbackWithMSAL START - idToken length:', idToken.length);
    
    try {
      console.log('[AuthService] Calling backend /api/auth/azure-b2c/msal-callback...');
      const response = await apiClient.post<LoginResponse>('/api/auth/azure-b2c/msal-callback', { idToken });
      console.log('[AuthService] Backend response received:', { status: response.status, hasAccessToken: !!response.data?.accessToken });

      const accessToken = response.data?.accessToken || (response.data as any)?.accessToken;
      const tokenType = response.data?.tokenType || 'Bearer';

      if (accessToken) {
        console.log('[AuthService] Decoding JWT and storing to localStorage...');
        const tokenStr = `${tokenType} ${accessToken}`;
        const decoded = jwtDecode<DecodedToken>(accessToken);

        console.log('[AuthService] Decoded token - sub:', decoded.sub, 'roles:', decoded.roles, 'tenantId:', decoded.tenantId);

        localStorage.setItem('JwtToken', tokenStr);
        localStorage.setItem('tenantId', decoded.tenantId?.toString() || '');
        localStorage.setItem('currentUser.id', decoded.sub);
        localStorage.setItem('currentUser.roles', JSON.stringify(decoded.roles || []));
        localStorage.setItem('currentUser.authoritylist', JSON.stringify(decoded.authorities || []));
        localStorage.setItem('currentUser.name', decoded.given_name || decoded.name || decoded.sub);
        localStorage.setItem('loginMethod', 'azure-b2c-msal');

        console.log('[AuthService] Token stored successfully in localStorage');
        return response.data;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('[AuthService] handleAzureB2CCallbackWithMSAL ERROR:', error);
      throw error;
    }
  }

  // Azure B2C logout - Get logout URL (passes tenantId when user is logged in)
  async getAzureB2CLogoutUrl(): Promise<string | null> {
    try {
      const tenantId = this.getTenantId();
      const params = tenantId ? { tenantId } : {};
      const response = await apiClient.get<{ logoutUrl: string }>('/api/auth/azure-b2c/logout-url', { params });
      return response.data.logoutUrl;
    } catch (error) {
      console.error('Failed to get Azure B2C logout URL:', error);
      return null;
    }
  }

  // Get login method
  getLoginMethod(): string {
    return localStorage.getItem('loginMethod') || 'local';
  }

  getUserName(): string | null {
    return localStorage.getItem('currentUser.name');
  }

  isAuthorized(): boolean {
    const token = localStorage.getItem('JwtToken');
    console.log('[AuthService] isAuthorized - token exists:', !!token);
    
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token.replace('Bearer ', ''));
      const currentTime = Date.now() / 1000;
      const isValid = decoded.exp > currentTime;
      console.log('[AuthService] isAuthorized - token valid:', isValid, 'exp:', decoded.exp, 'now:', currentTime);
      return isValid;
    } catch (error) {
      console.error('[AuthService] isAuthorized - decode error:', error);
      return false;
    }
  }

  getUserRoles(): string[] {
    const rolesStr = localStorage.getItem('currentUser.roles');
    if (rolesStr) {
      try {
        return JSON.parse(rolesStr);
      } catch {
        return [];
      }
    }
    return [];
  }

  getTenantId(): number | null {
    const tenantId = localStorage.getItem('tenantId');
    return tenantId ? parseInt(tenantId, 10) : null;
  }

  getUserId(): string | null {
    return localStorage.getItem('currentUser.id');
  }

  logout(): void {
    console.log('[AuthService] logout - clearing localStorage and sessionStorage');
    localStorage.clear();
    sessionStorage.clear();
  }

  /**
   * Clears only app-owned keys, preserving MSAL's own cache entries (msal.*, b2c-*).
   * Use this before calling instance.logoutRedirect() so MSAL can still build the
   * logout request from its cache, while ensuring our JwtToken / loginMethod /
   * currentUser keys are gone before the post-logout redirect lands back on /login.
   */
  clearAppStorage(): void {
    console.log('[AuthService] clearAppStorage - removing app keys (preserving MSAL cache)');
    const isMsalKey = (k: string) =>
      k.startsWith('msal.') ||
      k.startsWith('b2c.') ||
      k.startsWith('{') /* MSAL stores some entries as JSON-keyed objects */;

    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !isMsalKey(key)) toRemove.push(key);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  }

  getToken(): string | null {
    return localStorage.getItem('JwtToken');
  }
}

export const authenticationService = new AuthenticationService();
