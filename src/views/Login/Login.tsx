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
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const b2cUserNotFoundRef = useRef(false);
  const { login, userRoles, isAuthenticated, checkAuth } = useAuth();
  const { instance, inProgress } = useMsal();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Handle MSAL cached account on mount
  useEffect(() => {
    const accounts = instance.getAllAccounts();
    sessionStorage.removeItem('msal_redirect_in_progress');

    if (accounts.length > 0 && !localStorage.getItem('JwtToken')) {
      // MSAL will handle redirect via handleRedirectPromise
    }
  }, [instance]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const roles = userRoles.length > 0 ? userRoles : authenticationService.getUserRoles();
      const isSuperAdmin = roles.some(role => role === 'PLATFORM_SUPER_ADMIN' || role.toUpperCase().includes('SUPER_ADMIN'));
      const isAdmin = !isSuperAdmin && roles.some(role => role === 'ADMIN' || role.toUpperCase().includes('ADMIN'));
      const isServiceAgent = !isSuperAdmin && !isAdmin && roles.some(role => role === 'SERVICE_AGENT');

      if (isSuperAdmin) navigate('/super-admin/dashboard', { replace: true });
      else if (isAdmin) navigate('/admin/dashboard', { replace: true });
      else if (isServiceAgent) navigate('/service-agent/dashboard', { replace: true });
      else navigate('/investor/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, userRoles]);

  // Handle MSAL silent authentication or redirect to Azure B2C
  useEffect(() => {
    if (isAuthenticated || inProgress !== InteractionStatus.None) return;

    const accounts = instance.getAllAccounts();
    let cancelled = false;

    const handleAuthentication = async () => {
      if (b2cUserNotFoundRef.current) {
        setLoading(false);
        return;
      }

      try {
        if (accounts.length > 0) {
          const account = accounts[0];
          try {
            const tokenResponse = await instance.acquireTokenSilent({ ...loginRequest, account });
            if (tokenResponse && tokenResponse.idToken) {
              await authenticationService.handleAzureB2CCallbackWithMSAL(tokenResponse.idToken);
              checkAuth();
              return;
            }
          } catch (silentError: any) {
            if (isB2CUserNotFoundError(silentError)) {
              b2cUserNotFoundRef.current = true;
              toast.error(silentError?.response?.data?.error || 'User not found in system.');
              await instance.logoutRedirect({ postLogoutRedirectUri: getHostedSignInUrl() });
              return;
            }
          }
        }
        await instance.loginRedirect(loginRequest);
      } catch (error) {
        const errorCode = (error as { errorCode?: string })?.errorCode;
        if (errorCode !== 'interaction_in_progress' && !cancelled) setLoading(false);
      }
    };

    handleAuthentication();
    return () => { cancelled = true; };
  }, [isAuthenticated, instance, inProgress, checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      await login(loginId, password);
      const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true';
      if (mustChangePassword) {
        toast.warning('Please change your temporary password to continue');
        navigate('/change-password');
        return;
      }

      const roles = userRoles.length > 0 ? userRoles : authenticationService.getUserRoles();
      const isSuperAdmin = roles.some(role => role === 'PLATFORM_SUPER_ADMIN' || role.toUpperCase().includes('SUPER_ADMIN'));
      const isAdmin = !isSuperAdmin && roles.some(role => role === 'ADMIN' || role.toUpperCase().includes('ADMIN'));
      const isServiceAgent = !isSuperAdmin && !isAdmin && roles.some(role => role === 'SERVICE_AGENT');

      if (isSuperAdmin) navigate('/super-admin/dashboard');
      else if (isAdmin) navigate('/admin/dashboard');
      else if (isServiceAgent) navigate('/service-agent/dashboard');
      else navigate('/investor/dashboard');

      toast.success('Login successful');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="facilon-page-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Connecting to Facilon Services...</p>
      </div>
    );
  }

  return (
    <main className="facilon-login-page">
      <div className="login-background-overlay"></div>

      <div className="container login-container">
        <div className="login-wrapper">
          <div className="login-info-section">
            <div className="brand-logo-large">
              <img src="/assets/images/facilon-main-logo.png" alt="Facilon Services" />
            </div>
            <h1>The smarter way to <br/><span>manage your investments</span></h1>
            <p>Access your professional console to track progress, submit documents, and engage with service providers.</p>
          </div>

          <div className="login-form-section">
            <div className="premium-login-card">
              <div className="card-header-modern">
                <span className="welcome-label">Ready to get started?</span>
                <h2>Investor Login</h2>
              </div>

              <form onSubmit={handleSubmit} className="modern-form">
                <div className="form-group mb-4">
                  <label className="custom-label" htmlFor="loginId">Email or Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="loginId"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="custom-label" htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-5">
                  <div className="form-check custom-checkbox">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="remember">Keep me logged in</label>
                  </div>
                  <Link to="/forgot-password" id="forgot-password-link">Forgot?</Link>
                </div>

                <button className="btn w-100 mb-4" type="submit" disabled={loading}>
                  {loading ? 'Entering...' : 'Continue'}
                </button>

                <div className="login-footer-links">
                  <span>New to Facilon?</span>
                  <Link to="/investor/register" className="register-link ms-2">Register Now</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
