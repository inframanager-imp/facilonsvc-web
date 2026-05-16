import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { investorService, SetPasswordDetailsDto } from '../../../services/investor.service';

/**
 * FISP-style first-login landing page.
 *
 * <p>Invoked from the registration email link {@code /investor/setpassword/:azureUserId}. Reads
 * the per-tenant B2C config from the backend, picks the reset-password policy when the user has
 * never signed in (or the signin policy for returning users), and triggers
 * {@code msal.loginRedirect()} against that policy. Microsoft B2C then walks the user through
 * password set / login, and the existing {@code /login/callback} handler issues the Facilon JWT.</p>
 *
 * <p>Mirrors FISP {@code SetpasswordComponent.ts}.</p>
 */
export const InvestorSetPassword: React.FC = () => {
  const { azureUserId } = useParams<{ azureUserId: string }>();
  const navigate = useNavigate();
  const { instance, inProgress } = useMsal();
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<SetPasswordDetailsDto | null>(null);
  // Guards against React StrictMode double-mount and any other accidental
  // re-entry; MSAL's loginRedirect must not be called twice in flight.
  const startedRef = useRef(false);

  useEffect(() => {
    if (!azureUserId) {
      setError('Missing user identifier in link.');
      return;
    }

    // Wait until MSAL has finished consuming any leftover interaction state from a
    // prior visit. Calling loginRedirect while inProgress !== 'none' throws
    // `interaction_in_progress`.
    if (inProgress !== InteractionStatus.None) {
      return;
    }

    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    let cancelled = false;

    async function go() {
      try {
        // If we're returning here after B2C processed the auth code, MSAL's default
        // navigateToLoginRequestUrl=true will have sent us back to this setpassword URL
        // instead of staying at /login/callback. Detect that case and hand off.
        const redirectResult = await instance.handleRedirectPromise().catch(() => undefined);
        if (cancelled) return;
        if (redirectResult || instance.getAllAccounts().length > 0) {
          // Auth already completed — go to the callback page to finish the Facilon JWT exchange.
          navigate('/login/callback', { replace: true });
          return;
        }

        const data = await investorService.getSetPasswordDetails(azureUserId!);
        if (cancelled) return;
        setDetails(data);

        const policy = data.hasLoggedInBefore ? data.signupSigninPolicy : data.resetPasswordPolicy;
        if (!policy) {
          setError(
            data.hasLoggedInBefore
              ? 'Sign-in user flow is not configured for this tenant.'
              : 'Password-reset user flow is not configured for this tenant.'
          );
          return;
        }

        const authority = `https://${data.b2cTenantName}.b2clogin.com/${data.b2cTenantName}.onmicrosoft.com/${policy}`;
        const scopes = (data.scope || 'openid profile email offline_access').split(/\s+/).filter(Boolean);

        // FISP-parity: always redirect through the standard /login/callback (whatever the
        // tenant's redirect_uri says). The B2C reset-password user flow is expected to issue
        // sign-in tokens at the end of its orchestration; LoginCallback then exchanges those
        // tokens for a Facilon JWT and routes to the dashboard. There is no separate /done
        // page — if the user has set a password, they are immediately signed in.

        localStorage.setItem('facilon.setpassword.inProgress', '1');

        await instance.loginRedirect({
          scopes,
          authority,
          redirectUri: data.redirectUri,
          extraQueryParameters: {
            // FISP passes the Azure user id so B2C custom UI can correlate; harmless if unused.
            userId: data.azureUserId,
          },
        });
      } catch (e: any) {
        if (cancelled) return;
        // Reset the guard so a manual retry (button click) can fire again if it was a
        // transient state error rather than a config problem.
        startedRef.current = false;
        const msg = e?.response?.data?.message
          || e?.message
          || 'Could not start the password-setup flow.';
        setError(msg);
      }
    }

    go();
    return () => { cancelled = true; };
  }, [azureUserId, instance, inProgress]);

  if (error) {
    const isInteractionInProgress = error.toLowerCase().includes('interaction_in_progress');
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <h3>We couldn't open your setup link</h3>
          <p>{error}</p>
          {isInteractionInProgress && (
            <p style={{ fontSize: 13, color: '#666' }}>
              A previous sign-in attempt is still being processed. Click the button below to clear it and try again.
            </p>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                // Clear any MSAL state left from an interrupted prior flow, then retry.
                try {
                  Object.keys(localStorage)
                    .filter((k) => k.startsWith('msal.') || k.includes('interaction.status') || k === 'facilon.setpassword.inProgress')
                    .forEach((k) => localStorage.removeItem(k));
                } catch {}
                window.location.reload();
              }}
              style={{ padding: '10px 18px', cursor: 'pointer' }}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{ padding: '10px 18px', cursor: 'pointer' }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p>{details ? `Welcome ${details.displayName}, redirecting you to set your password…` : 'Loading…'}</p>
      </div>
    </div>
  );
};

export default InvestorSetPassword;
