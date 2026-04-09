# Login URL flow (localhost:3000)

This describes how the **login URL** is constructed when you open **http://localhost:3000**.

## 1. Root → /login

- You open **http://localhost:3000**.
- `App.tsx` route `path="/"` renders **RootRedirect**.
- **RootRedirect**:
  - If the URL has `?code=` or `#code=` (e.g. B2C sent the user to the root by mistake), it redirects to **`/login/callback`** with the same query/hash so the auth code is not lost.
  - Otherwise it redirects to **`/login`**.
- So the browser ends up at **http://localhost:3000/login**.

## 2. Where the B2C login URL comes from (current flow: MSAL in the browser)

The app uses **MSAL** for Azure B2C. The **login URL** (the URL that sends the user to Azure B2C) is **built in the browser** by MSAL, not by the API.

- **Login** page: `src/views/Login/Login.tsx` calls `instance.loginRedirect(loginRequest)`.
- MSAL uses **`src/config/authConfig.ts`**:
  - **redirectUri**: `process.env.REACT_APP_REDIRECT_URI || window.location.origin + '/login/callback'`  
    → for localhost:3000 this is **`http://localhost:3000/login/callback`**.
  - **authority**: `https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com/{policy}`  
    (e.g. `https://facilonservices.b2clogin.com/facilonservices.onmicrosoft.com/B2C_1_2Signin`).
- MSAL then builds the full B2C authorize URL (authority + `client_id`, `redirect_uri`, `response_type=code`, `scope`, etc.) and redirects the browser there.

So for **localhost:3000**:

- **Login page**: `http://localhost:3000/login`
- **B2C redirect URI**: `http://localhost:3000/login/callback`
- **B2C login URL**: built by MSAL from `authConfig` (authority + redirectUri + clientId, etc.).

## 3. After B2C login (callback)

- Azure B2C redirects back to **`http://localhost:3000/login/callback`** with `?code=...` (or `#code=...`).
- **LoginCallback** (`src/views/Login/LoginCallback.tsx`) handles the code (e.g. MSAL `handleRedirectPromise` and/or backend token exchange).

## 4. API base URL (for API calls only)

- Frontend API base is set in **`src/config/environment.ts`**: `apiBaseUrl: 'http://localhost:8082/facilon'`.
- So all API calls (e.g. `POST /api/login`, `POST /api/auth/azure-b2c/callback`) go to **http://localhost:8082/facilon/...**.
- The **B2C login URL** in the current flow is **not** built by the API; it is built by MSAL in the browser. The API does expose **`GET /api/auth/azure-b2c/login-url`** (used by `authentication.service.ts`), which can return a server-built login URL for other flows (e.g. server-side redirect); that endpoint is in **Facilon-platform-API**.

## 5. 401 and logout redirects

- **apiClient** (`src/utils/apiClient.ts`): on 401, redirects to **`/login`** (with a guard to avoid loops).
- **AuthContext** logout: uses `window.location.origin + '/login'` (MSAL) or `window.location.replace('/login')`, so again **http://localhost:3000/login** when on localhost:3000.

## Summary

| Step | URL |
|------|-----|
| You open | `http://localhost:3000` |
| Root redirect | → `http://localhost:3000/login` |
| B2C redirect URI (from authConfig) | `http://localhost:3000/login/callback` |
| B2C login URL | Built by MSAL in the browser using `authConfig` (authority + redirectUri + clientId, etc.) |
| After B2C | `http://localhost:3000/login/callback?code=...` |
| API base | `http://localhost:8082/facilon` (for `/api/login`, `/api/auth/azure-b2c/callback`, etc.) |
