import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '../../config/authConfig';
import { useAuth } from '../../contexts/AuthContext';
import { authenticationService } from '../../services/authentication.service';

function getRoleBasedDashboard(roles: string[]): string {
  const isSuperAdmin = roles.some(r => r === 'PLATFORM_SUPER_ADMIN' || r.toUpperCase().includes('SUPER_ADMIN'));
  if (isSuperAdmin) return '/super-admin/dashboard';
  const isAdmin = roles.some(r => r === 'ADMIN' || r.toUpperCase().includes('ADMIN'));
  if (isAdmin) return '/admin/dashboard';
  const isServiceAgent = roles.some(r => r === 'SERVICE_AGENT' || r.toUpperCase() === 'SERVICE_AGENT');
  if (isServiceAgent) return '/service-agent/dashboard';
  return '/investor/dashboard';
}

const LoginCallback: React.FC = () => {
  console.log('[LoginCallback] ===== COMPONENT MOUNTING ===== URL:', window.location.href);
  
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const processedRef = React.useRef(false);

  console.log('[LoginCallback] RENDER - inProgress:', inProgress, 'isAuthenticated:', isAuthenticated, 'processedRef:', processedRef.current, 'URL:', window.location.href);

  useEffect(() => {
    console.log('[LoginCallback] useEffect START - processedRef:', processedRef.current, 'inProgress:', inProgress, 'isAuthenticated:', isAuthenticated);
    
    if (processedRef.current) {
      console.log('[LoginCallback] Already processed, skipping');
      return;
    }

    // OAuth2 code flow: URL has ?code= (e.g. from backend login URL redirect)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (code) {
      processedRef.current = true;
      const handleCodeFlow = async () => {
        try {
          await authenticationService.handleAzureB2CCallback(code, state || undefined);
          checkAuth();
          setStatus('success');
          const roles = authenticationService.getUserRoles();
          window.location.replace(getRoleBasedDashboard(roles));
        } catch (err: any) {
          setStatus('error');
          setErrorMsg(err.response?.data?.error || err.response?.data?.message || err.message || 'Authentication failed.');
          processedRef.current = false;
        }
      };
      handleCodeFlow();
      return;
    }
    
    if (inProgress !== InteractionStatus.None) {
      console.log('[LoginCallback] Waiting for MSAL to complete redirect, inProgress:', inProgress);
      return;
    }
    
    if (!isAuthenticated) {
      console.log('[LoginCallback] MSAL redirect complete but not authenticated');
      setStatus('error');
      setErrorMsg('Authentication failed. Please try again.');
      return;
    }

    console.log('[LoginCallback] All checks passed, marking as processed');
    processedRef.current = true;
    sessionStorage.removeItem('msal_redirect_in_progress');

    const handleCallback = async () => {
      try {
        console.log('[LoginCallback] handleCallback START');
        
        const accounts = instance.getAllAccounts();
        console.log('[LoginCallback] MSAL accounts count:', accounts.length);

        if (accounts.length === 0) {
          console.error('[LoginCallback] No MSAL accounts found!');
          setStatus('error');
          setErrorMsg('No MSAL account found after redirect. Please try again.');
          processedRef.current = false;
          return;
        }

        const account = accounts[0];
        console.log('[LoginCallback] Using account - username:', account.username, 'homeAccountId:', account.homeAccountId);

        console.log('[LoginCallback] Acquiring token silently...');
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account
        });

        console.log('[LoginCallback] acquireTokenSilent SUCCESS - hasIdToken:', !!tokenResponse.idToken, 'hasAccessToken:', !!tokenResponse.accessToken);
        
        if (tokenResponse && tokenResponse.idToken) {
          console.log('[LoginCallback] Calling backend with idToken...');
          await authenticationService.handleAzureB2CCallbackWithMSAL(tokenResponse.idToken);
          
          console.log('[LoginCallback] Backend call SUCCESS, calling checkAuth()...');
          checkAuth();
          
          setStatus('success');
          const roles = authenticationService.getUserRoles();
          const destination = getRoleBasedDashboard(roles);
          console.log('[LoginCallback] Redirecting to:', destination);
          window.location.replace(destination);
        } else {
          console.error('[LoginCallback] No ID token in token response!');
          setStatus('error');
          setErrorMsg('No ID token received from MSAL');
          processedRef.current = false;
        }
      } catch (err: any) {
        console.error('[LoginCallback] handleCallback ERROR:', err);
        console.error('[LoginCallback] Error details:', {
          message: err.message,
          response: err.response?.data,
          stack: err.stack
        });
        setStatus('error');
        setErrorMsg(err.response?.data?.error || err.response?.data?.message || err.message || 'Authentication failed');
        processedRef.current = false;
      }
    };

    console.log('[LoginCallback] Calling handleCallback()...');
    handleCallback();
  }, [instance, inProgress, isAuthenticated, navigate, checkAuth]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '48px' }}>
        {status === 'loading' && <p>Completing sign in...</p>}
        {status === 'success' && <p>Sign in successful! Redirecting...</p>}
        {status === 'error' && (
          <>
            <p style={{ color: 'red' }}>{errorMsg}</p>
            <button onClick={() => navigate('/login')}>Back to Login</button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginCallback;
