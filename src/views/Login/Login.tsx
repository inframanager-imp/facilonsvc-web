import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '../../config/authConfig';
import { useAuth } from '../../contexts/AuthContext';
import { authenticationService } from '../../services/authentication.service';
import { toast } from 'react-toastify';
import './Login.scss';

/** Backend returned "user not found" for this B2C account; avoid redirect loop */
function isB2CUserNotFoundError(err: any): boolean {
  const status = err?.response?.status;
  const msg = (err?.response?.data?.error || err?.response?.data?.message || err?.message || '').toLowerCase();
  return status === 400 && (msg.includes('not found') || msg.includes('contact administrator'));
}

function getHostedSignInUrl(): string {
  const hostedUrl = (process.env.REACT_APP_HOSTED_SIGNIN_URL || '').trim();
  return hostedUrl || window.location.origin;
}

const Login: React.FC = () => {
  console.log('[Login] COMPONENT RENDER - URL:', window.location.href);
  
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const b2cUserNotFoundRef = useRef(false);
  const { login, userRoles, isAuthenticated, checkAuth } = useAuth();
  const { instance, inProgress } = useMsal();
  const navigate = useNavigate();
  useTranslation();

  // Handle MSAL cached account on mount
  useEffect(() => {
    const accounts = instance.getAllAccounts();
    console.log('[Login] MOUNT - MSAL accounts:', accounts.length, accounts.map(a => ({ username: a.username, homeAccountId: a.homeAccountId })));
    console.log('[Login] MOUNT - localStorage.JwtToken exists:', !!localStorage.getItem('JwtToken'));
    console.log('[Login] MOUNT - Clearing any stale redirect guards');
    sessionStorage.removeItem('msal_redirect_in_progress');

    // If MSAL has a cached account but we don't have a backend JWT, handle it
    if (accounts.length > 0 && !localStorage.getItem('JwtToken')) {
      console.log('[Login] MOUNT - MSAL account exists but no backend JWT - will let MSAL handle redirect');
      // MSAL will automatically call handleRedirectPromise and process the cached account
      // Our callback page will handle the token exchange
    }
  }, [instance]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    console.log('[Login] Dashboard redirect check - isAuthenticated:', isAuthenticated, 'userRoles:', userRoles);
    
    if (isAuthenticated) {
      const roles = userRoles.length > 0 ? userRoles : authenticationService.getUserRoles();
      console.log('[Login] User is authenticated, checking roles:', roles);

      const isSuperAdmin = roles.some(role =>
        role === 'PLATFORM_SUPER_ADMIN' ||
        role.toUpperCase().includes('SUPER_ADMIN')
      );

      const isAdmin = !isSuperAdmin && roles.some(role =>
        role === 'ADMIN' || role.toUpperCase().includes('ADMIN')
      );

      const isServiceAgent = !isSuperAdmin && !isAdmin && roles.some(role =>
        role === 'SERVICE_AGENT' || role.toUpperCase() === 'SERVICE_AGENT'
      );

      if (isSuperAdmin) {
        console.log('[Login] *** NAVIGATING to /super-admin/dashboard ***');
        navigate('/super-admin/dashboard', { replace: true });
      } else if (isAdmin) {
        console.log('[Login] *** NAVIGATING to /admin/dashboard ***');
        navigate('/admin/dashboard', { replace: true });
      } else if (isServiceAgent) {
        console.log('[Login] *** NAVIGATING to /service-agent/dashboard ***');
        navigate('/service-agent/dashboard', { replace: true });
      } else {
        console.log('[Login] *** NAVIGATING to /investor/dashboard ***');
        navigate('/investor/dashboard', { replace: true });
      }
      return;
    }
  }, [isAuthenticated, navigate, userRoles]);

  // Handle MSAL silent authentication or redirect to Azure B2C
  useEffect(() => {
    console.log('[Login] Auth useEffect START - isAuthenticated:', isAuthenticated, 'inProgress:', inProgress);
    
    if (isAuthenticated) {
      console.log('[Login] Already authenticated, skipping B2C redirect');
      return;
    }
    
    if (inProgress !== InteractionStatus.None) {
      console.log('[Login] MSAL interaction in progress, waiting... inProgress:', inProgress);
      return;
    }

    // Check if MSAL has a cached account (from previous login)
    const accounts = instance.getAllAccounts();
    console.log('[Login] MSAL accounts found:', accounts.length);

    let cancelled = false;

    const handleAuthentication = async () => {
      if (b2cUserNotFoundRef.current) {
        console.log('[Login] Backend previously returned user not found; skipping B2C to avoid loop');
        setLoading(false);
        return;
      }

      try {
        // If MSAL has a cached account, try silent token acquisition first
        if (accounts.length > 0) {
          console.log('[Login] *** MSAL cached account detected, attempting silent token acquisition ***');
          const account = accounts[0];
          
          try {
            const tokenResponse = await instance.acquireTokenSilent({
              ...loginRequest,
              account
            });
            
            console.log('[Login] Silent token acquisition SUCCESS - has idToken:', !!tokenResponse.idToken);
            
            if (tokenResponse && tokenResponse.idToken) {
              console.log('[Login] Sending token to backend...');
              await authenticationService.handleAzureB2CCallbackWithMSAL(tokenResponse.idToken);
              console.log('[Login] Backend validated token, calling checkAuth()...');
              checkAuth();
              console.log('[Login] *** Navigation will happen via dashboard redirect useEffect ***');
              return;
            }
          } catch (silentError: any) {
            if (isB2CUserNotFoundError(silentError)) {
              console.warn('[Login] Backend rejected user (not in system); stopping to avoid redirect loop');
              b2cUserNotFoundRef.current = true;
              const backendMsg = silentError?.response?.data?.error || 'User not found in system. Please contact administrator.';
              toast.error(backendMsg);
              // Do not show this message on /login page; move user to hosted sign-in/logout landing.
              await instance.logoutRedirect({ postLogoutRedirectUri: getHostedSignInUrl() });
              return;
            }
            console.warn('[Login] Silent token acquisition failed:', silentError);
            console.log('[Login] Falling back to interactive login...');
            // Fall through to interactive login
          }
        }

        // No cached account or silent acquisition failed - do interactive redirect
        console.log('[Login] *** REDIRECTING TO AZURE B2C (interactive) ***');
        await instance.loginRedirect(loginRequest);
        console.log('[Login] loginRedirect returned (should NOT see this if redirect worked)');
        
      } catch (error) {
        console.error('[Login] Authentication error:', error);
        const errorCode = (error as { errorCode?: string })?.errorCode;
        
        if (errorCode === 'interaction_in_progress') {
          console.log('[Login] Interaction already in progress, will retry when inProgress becomes None');
          return;
        }
        
        if (!cancelled) {
          console.log('[Login] Setting loading to false due to error');
          setLoading(false);
        }
      }
    };

    console.log('[Login] Calling handleAuthentication()...');
    handleAuthentication();

    return () => {
      console.log('[Login] useEffect cleanup');
      cancelled = true;
    };
  }, [isAuthenticated, instance, inProgress, checkAuth]);

  // Local database login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginId || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      await login(loginId, password);

      setTimeout(() => {
        // Check if user must change password (temporary password)
        const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true';

        if (mustChangePassword) {
          toast.warning('Please change your temporary password to continue');
          navigate('/change-password');
          return;
        }

        const roles = userRoles.length > 0 ? userRoles : authenticationService.getUserRoles();

        const isSuperAdmin = roles.some(role =>
          role === 'PLATFORM_SUPER_ADMIN' ||
          role.toUpperCase().includes('SUPER_ADMIN') ||
          role.toUpperCase() === 'SUPER_ADMIN'
        );

        const isAdmin = !isSuperAdmin && roles.some(role =>
          role === 'ADMIN' ||
          role.toUpperCase().includes('ADMIN') ||
          role.toUpperCase() === 'ADMIN'
        );

        const isServiceAgent = !isSuperAdmin && !isAdmin && roles.some(role =>
          role === 'SERVICE_AGENT' || role.toUpperCase() === 'SERVICE_AGENT'
        );

        if (isSuperAdmin) {
          navigate('/super-admin/dashboard');
        } else if (isAdmin) {
          navigate('/admin/dashboard');
        } else if (isServiceAgent) {
          navigate('/service-agent/dashboard');
        } else {
          // Default for everyone else (including Investors)
          navigate('/investor/dashboard');
        }

        toast.success('Login successful');
      }, 100);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'User details not found';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  // Show loading spinner while redirecting to Azure B2C
  if (loading) {
    return (
      <section className="login-form-style4 section-padding">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 text-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p style={{ marginTop: '20px', fontSize: '18px' }}>Redirecting to Facilon Login...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="login-form-style4 section-padding">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-7 col-md-7 col-sm-12">
            <div className="lgf4_Left_content">
              <h3>Welcome to <span>Facilon Services</span> ('Facilon') Login Process</h3>
            </div>
          </div>
          <div className="col-lg-5 col-md-5 col-sm-12">
            <div className="login-form-style3-main">
              <div className="login-form-style3-main_full">
                <div className="login-register_style3-head">
                  <h2>Investor Login</h2>
                </div>
                <div className="login-register3-form-middle">
                  <form onSubmit={handleSubmit}>
                    <div className="single-field">
                      <label htmlFor="loginId">
                        Email ID / Username: <span className="star-color">*</span>
                      </label>
                      <input
                        type="text"
                        id="loginId"
                        name="loginId"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        required
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                    <div className="single-field">
                      <label htmlFor="password">
                        Password: <span className="star-color">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="single-field">
                      <div className="checkbox-wrapper-33">
                        <label className="checkbox">
                          <input
                            className="checkbox__trigger visuallyhidden"
                            type="checkbox"
                            name="remember"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <span className="checkbox__symbol">
                            <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4 14l8 7L24 7"></path>
                            </svg>
                          </span>
                          <p className="checkbox__textwrapper">Remember Me</p>
                        </label>
                      </div>
                    </div>
                    <div className="single-field mb-0">
                      <button className="button-1" type="submit" name="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Submit'}
                      </button>
                    </div>

                    <div className="login-links">
                      <Link className="btn btn-link" to="/investor/register">
                        Register
                      </Link>
                      {' | '}
                      <Link className="btn btn-link" to="/forgot-password">
                        Forgot Your Password?
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
