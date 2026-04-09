import React, { useEffect, useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { environment } from './config/environment';
import {
  buildMsalConfigFromApi,
  getFallbackMsalConfig,
  B2CConfigFromApi,
} from './config/authConfig';
import App from './App';

export default function Bootstrap() {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch(`${environment.apiBaseUrl}/api/auth/b2c-config`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (cancelled) return;

        if (res.ok) {
          const data: B2CConfigFromApi = await res.json();
          if (!data.enabled) {
            const fallback = getFallbackMsalConfig();
            const instance = new PublicClientApplication(fallback.msalConfig);
            await instance.initialize();
            if (!cancelled) setMsalInstance(instance);
            return;
          }
          const { msalConfig: config } = buildMsalConfigFromApi(data);
          const instance = new PublicClientApplication(config);
          await instance.initialize();
          if (!cancelled) setMsalInstance(instance);
          return;
        }

        const fallback = getFallbackMsalConfig();
        const instance = new PublicClientApplication(fallback.msalConfig);
        await instance.initialize();
        if (!cancelled) setMsalInstance(instance);
      } catch (e) {
        if (cancelled) return;
        console.warn('[Bootstrap] Failed to load B2C config from API, using fallback:', e);
        const fallback = getFallbackMsalConfig();
        const instance = new PublicClientApplication(fallback.msalConfig);
        await instance.initialize();
        if (!cancelled) setMsalInstance(instance);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  if (msalInstance) {
    return (
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p>Loading…</p>
    </div>
  );
}
