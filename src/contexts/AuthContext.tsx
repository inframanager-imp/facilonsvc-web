import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { authenticationService, resetB2CLoginUrlFetchState } from '../services/authentication.service';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userRoles: string[];
  tenantId: number | null;
  userId: string | null;
  userName: string | null;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { instance } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const checkAuth = () => {
    console.log('[AuthContext] checkAuth START');
    const authenticated = authenticationService.isAuthorized();
    console.log('[AuthContext] isAuthorized result:', authenticated);
    
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const roles = authenticationService.getUserRoles();
      const tenant = authenticationService.getTenantId();
      const uid = authenticationService.getUserId();
      const uname = authenticationService.getUserName();
      
      console.log('[AuthContext] Setting auth state - roles:', roles, 'tenantId:', tenant, 'userId:', uid, 'userName:', uname);
      
      setUserRoles(roles);
      setTenantId(tenant);
      setUserId(uid);
      setUserName(uname);
    } else {
      console.log('[AuthContext] Not authenticated, clearing state');
      setUserRoles([]);
      setTenantId(null);
      setUserId(null);
      setUserName(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    console.log('[AuthContext] ===== INITIAL MOUNT =====');
    console.log('[AuthContext] localStorage.JwtToken:', localStorage.getItem('JwtToken')?.substring(0, 50) + '...');
    console.log('[AuthContext] localStorage.loginMethod:', localStorage.getItem('loginMethod'));
    console.log('[AuthContext] localStorage.currentUser.roles:', localStorage.getItem('currentUser.roles'));
    console.log('[AuthContext] Running checkAuth...');
    checkAuth();
  }, []);

  const login = async (loginId: string, password: string) => {
    console.log('[AuthContext] login START - loginId:', loginId);
    setIsLoading(true);
    try {
      await authenticationService.login(loginId, password);
      console.log('[AuthContext] authenticationService.login completed');
      
      const authenticated = authenticationService.isAuthorized();
      console.log('[AuthContext] After login - isAuthorized:', authenticated);
      
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const roles = authenticationService.getUserRoles();
        console.log('[AuthContext] Setting auth state after login - roles:', roles);
        setUserRoles(roles);
        setTenantId(authenticationService.getTenantId());
        setUserId(authenticationService.getUserId());
        setUserName(authenticationService.getUserName());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('[AuthContext] logout START');
    const loginMethod = authenticationService.getLoginMethod();
    console.log('[AuthContext] loginMethod:', loginMethod);

    resetB2CLoginUrlFetchState();

    // Clear local state immediately
    authenticationService.logout();
    setIsAuthenticated(false);
    setUserRoles([]);
    setTenantId(null);
    setUserId(null);
    setUserName(null);
    console.log('[AuthContext] Cleared local state');

    // Handle Azure B2C MSAL logout
    if (loginMethod === 'azure-b2c-msal') {
      console.log('[AuthContext] Azure B2C MSAL logout - calling instance.logoutRedirect...');
      try {
        await instance.logoutRedirect({
          postLogoutRedirectUri: window.location.origin + '/login',
        });
        console.log('[AuthContext] MSAL logoutRedirect completed');
      } catch (error) {
        console.error('[AuthContext] MSAL logout error:', error);
        // Fallback to manual redirect if MSAL fails
        window.location.replace('/login');
      }
    } else if (loginMethod === 'azure-b2c') {
      // Legacy Azure B2C (non-MSAL) logout
      console.log('[AuthContext] Legacy Azure B2C logout');
      const logoutUrl = await authenticationService.getAzureB2CLogoutUrl();
      if (logoutUrl) {
        console.log('[AuthContext] Redirecting to Azure B2C logout URL');
        window.location.href = logoutUrl;
      } else {
        console.log('[AuthContext] No logout URL, redirecting to /login');
        window.location.replace('/login');
      }
    } else {
      // Local login logout
      console.log('[AuthContext] Local logout - redirecting to /login');
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userRoles,
        tenantId,
        userId,
        userName,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
