import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { environment } from '../config/environment';

/**
 * Checks if error is a 403 permission denied error and returns user-friendly message
 */
export function getPermissionErrorMessage(error: any): string | null {
  if (error?.response?.status === 403) {
    const errorData = error.response?.data as { error?: string; message?: string } | undefined;
    const errorMsg = errorData?.message || errorData?.error || '';
    
    if (errorMsg.includes('Delegation does not grant permission')) {
      const permission = errorMsg.match(/permission: (\w+)/)?.[1];
      const friendlyPermission = permission
        ? permission.replace('can_', '').replace(/_/g, ' ')
        : 'this action';
      return `You don't have permission to ${friendlyPermission}. Please contact the investor to update delegation permissions.`;
    }
    
    if (errorMsg.includes('No active delegation')) {
      return 'No active delegation found for this investor. The delegation may have been revoked or expired.';
    }
    
    if (errorMsg.includes('expired') || errorMsg.includes('DELEGATION_EXPIRED')) {
      return 'This delegation has expired. Please request a new delegation from the investor.';
    }
    
    if (errorMsg.includes('SCOPE_VIOLATION')) {
      return 'This action is outside the scope of your delegation permissions.';
    }
    
    return errorMsg || 'You do not have permission to perform this action.';
  }
  return null;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: environment.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('JwtToken');
        console.log('[ApiClient] REQUEST - url:', config.url, 'hasToken:', !!token);
        if (token) {
          config.headers.Authorization = token;
        }
        return config;
      },
      (error) => {
        console.error('[ApiClient] REQUEST ERROR:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('[ApiClient] RESPONSE SUCCESS - url:', response.config.url, 'status:', response.status);
        return response;
      },
      (error: AxiosError) => {
        console.log('[ApiClient] RESPONSE ERROR - url:', error.config?.url, 'status:', error.response?.status);
        
        if (error.response?.status === 401) {
          const path = window.location.pathname;
          const isAuthScreen = path.startsWith('/login');
          const guardKey = 'auth_401_redirect_at';
          const lastRedirectAt = Number(sessionStorage.getItem(guardKey) || '0');
          const inCooldown = Number.isFinite(lastRedirectAt) && Date.now() - lastRedirectAt < 8000;

          console.log('[ApiClient] 401 Unauthorized - path:', path, 'isAuthScreen:', isAuthScreen, 'inCooldown:', inCooldown);

          // Avoid redirect loops from repeated 401s while auth flow is already in progress.
          if (!isAuthScreen && !inCooldown) {
            console.log('[ApiClient] Clearing localStorage and redirecting to /login');
            localStorage.clear();
            sessionStorage.setItem(guardKey, Date.now().toString());
            window.location.replace('/login');
          } else {
            console.log('[ApiClient] Skipping redirect (already on auth screen or in cooldown)');
          }
        }
        
        if (error.response?.status === 403) {
          const errorData = error.response?.data as { error?: string; message?: string } | undefined;
          const errorMsg = errorData?.error || errorData?.message || 'Access denied';
          console.log('[ApiClient] 403 Forbidden -', errorMsg);
          
          // Don't show toast here - let the calling component handle it gracefully
          // Just log and pass through so components can show contextual messages
        }
        
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
