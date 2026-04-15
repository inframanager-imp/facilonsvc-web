import React, { useEffect, useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { environment } from './config/environment';
import {
  buildMsalConfigFromApi,
  B2CConfigFromApi,
} from './config/authConfig';
import App from './App';

type BootState =
  | { status: 'loading' }
  | { status: 'ready'; instance: PublicClientApplication }
  | { status: 'error'; message: string };

export default function Bootstrap() {
  const [state, setState] = useState<BootState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch(`${environment.apiBaseUrl}/api/auth/b2c-config`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (cancelled) return;

        if (!res.ok) {
          setState({
            status: 'error',
            message: `Failed to load B2C configuration from backend (HTTP ${res.status}).`,
          });
          return;
        }

        const data: B2CConfigFromApi = await res.json();
        if (!data.enabled) {
          setState({
            status: 'error',
            message: 'B2C authentication is disabled in backend configuration.',
          });
          return;
        }

        const { msalConfig } = buildMsalConfigFromApi(data);
        const instance = new PublicClientApplication(msalConfig);
        await instance.initialize();
        if (!cancelled) setState({ status: 'ready', instance });
      } catch (e) {
        if (cancelled) return;
        console.error('[Bootstrap] Failed to load B2C config from API:', e);
        setState({
          status: 'error',
          message: 'Unable to reach backend to load authentication configuration.',
        });
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  if (state.status === 'ready') {
    return (
      <MsalProvider instance={state.instance}>
        <App />
      </MsalProvider>
    );
  }

  if (state.status === 'error') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h3>Authentication unavailable</h3>
          <p>{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p>Loading…</p>
    </div>
  );
}
