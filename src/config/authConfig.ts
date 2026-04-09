import { Configuration, PopupRequest } from "@azure/msal-browser";

/**
 * B2C config as returned by GET /api/auth/b2c-config (from backend TenantB2CConfig).
 */
export interface B2CConfigFromApi {
  enabled: boolean;
  b2cTenantName: string;
  b2cTenantId?: string;
  clientId: string;
  signupSigninPolicy: string;
  logoutPolicy: string;
  resetPasswordPolicy?: string | null;
  redirectUri: string;
  postLogoutRedirectUri: string;
  scope?: string;
}

/**
 * Fallback B2C values when API is unavailable (env or defaults).
 */
function getFallbackValues() {
  return {
    tenantName: process.env.REACT_APP_B2C_TENANT || "facilonservices",
    clientId: process.env.REACT_APP_B2C_CLIENT_ID || "54e55d9e-551a-4db4-b1e1-92fdb3e38c01",
    signInPolicy: process.env.REACT_APP_B2C_SIGNIN_POLICY || "B2C_1_2Signin",
    resetPasswordPolicy: process.env.REACT_APP_B2C_RESET_PASSWORD_POLICY || "B2C_1_PasswordReset",
    redirectUri: process.env.REACT_APP_REDIRECT_URI || `${window.location.origin}/login/callback`,
    postLogoutRedirectUri: process.env.REACT_APP_POST_LOGOUT_URI || window.location.origin,
    scope: "openid profile email offline_access",
  };
}

/**
 * Build MSAL Configuration and b2cPolicies from backend TenantB2CConfig (API response).
 */
export function buildMsalConfigFromApi(api: B2CConfigFromApi): {
  msalConfig: Configuration;
  b2cPolicies: {
    names: { signUpSignIn: string; forgotPassword: string };
    authorities: {
      signUpSignIn: { authority: string };
      forgotPassword: { authority: string };
    };
    authorityDomain: string;
  };
} {
  const tenantName = api.b2cTenantName;
  const signInPolicy = api.signupSigninPolicy;
  const resetPasswordPolicy = api.resetPasswordPolicy || api.logoutPolicy;
  const authorityDomain = `${tenantName}.b2clogin.com`;
  const baseAuthority = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com`;

  const b2cPolicies = {
    names: { signUpSignIn: signInPolicy, forgotPassword: resetPasswordPolicy },
    authorities: {
      signUpSignIn: { authority: `${baseAuthority}/${signInPolicy}` },
      forgotPassword: { authority: `${baseAuthority}/${resetPasswordPolicy}` },
    },
    authorityDomain,
  };

  const msalConfig: Configuration = {
    auth: {
      clientId: api.clientId,
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      knownAuthorities: [b2cPolicies.authorityDomain],
      redirectUri: api.redirectUri,
      postLogoutRedirectUri: api.postLogoutRedirectUri,
    },
    cache: { cacheLocation: "localStorage" },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          switch (level) {
            case 0: console.error(message); return;
            case 1: console.warn(message); return;
            case 2: console.info(message); return;
            case 3: console.debug(message); return;
            default: return;
          }
        },
      },
    },
  };

  return { msalConfig, b2cPolicies };
}

/**
 * Build MSAL Configuration and b2cPolicies from fallback (env/defaults).
 */
export function getFallbackMsalConfig(): {
  msalConfig: Configuration;
  b2cPolicies: {
    names: { signUpSignIn: string; forgotPassword: string };
    authorities: {
      signUpSignIn: { authority: string };
      forgotPassword: { authority: string };
    };
    authorityDomain: string;
  };
} {
  const f = getFallbackValues();
  const authorityDomain = `${f.tenantName}.b2clogin.com`;
  const baseAuthority = `https://${f.tenantName}.b2clogin.com/${f.tenantName}.onmicrosoft.com`;
  const b2cPolicies = {
    names: { signUpSignIn: f.signInPolicy, forgotPassword: f.resetPasswordPolicy },
    authorities: {
      signUpSignIn: { authority: `${baseAuthority}/${f.signInPolicy}` },
      forgotPassword: { authority: `${baseAuthority}/${f.resetPasswordPolicy}` },
    },
    authorityDomain,
  };
  const msalConfig: Configuration = {
    auth: {
      clientId: f.clientId,
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      knownAuthorities: [b2cPolicies.authorityDomain],
      redirectUri: f.redirectUri,
      postLogoutRedirectUri: f.postLogoutRedirectUri,
    },
    cache: { cacheLocation: "localStorage" },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          switch (level) {
            case 0: console.error(message); return;
            case 1: console.warn(message); return;
            case 2: console.info(message); return;
            case 3: console.debug(message); return;
            default: return;
          }
        },
      },
    },
  };
  return { msalConfig, b2cPolicies };
}

// Default export for consumers that still need a static config (e.g. fallback only)
const fallback = getFallbackMsalConfig();
export const msalConfig: Configuration = fallback.msalConfig;
export const b2cPolicies = fallback.b2cPolicies;

/**
 * Scopes for login (used with API scope string when building from API).
 */
export const loginRequest: PopupRequest = {
  scopes: ["openid", "profile", "email", "offline_access"],
};

export const silentRequest = {
  scopes: ["openid", "profile"],
  loginHint: "user@example.com",
};
