# Teamified Accounts SSO Integration Guide

This guide covers login, logout, session management, and cross-app SSO implementation for OAuth 2.0 client applications integrating with Teamified Accounts SSO.

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/sso/authorize` | GET | Start OAuth authorization flow |
| `/api/v1/sso/token` | POST | Exchange auth code for tokens |
| `/api/v1/sso/me` | GET | Get current user info |
| `/api/v1/sso/session` | GET | Check for existing SSO session (cross-app) |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/sso/logout` | GET | Centralized logout (RP-initiated) |
| `/api/v1/sso/clear-session` | POST | Clear SSO cookies (testing) |

## Token Lifetimes

- **Access Token**: 72 hours (259200 seconds)
- **Refresh Token**: 30 days
- **Session Timeout**: 72 hours inactivity / 30 days absolute

---

## 1. Cross-App SSO with Shared Cookies

Teamified uses httpOnly cookies to enable seamless single sign-on across all Teamified applications. When a user logs in to any Teamified app, they're automatically authenticated across all apps.

### How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Cookie-Based SSO Flow                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User logs into accounts.teamified.com                           │
│     └── Server sets httpOnly cookies on .teamified.com domain       │
│                                                                      │
│  2. User visits hris.teamified.com                                  │
│     └── Browser automatically sends cookies (same parent domain)   │
│     └── App calls /api/v1/sso/session with credentials: 'include'  │
│     └── If valid → User is already logged in!                      │
│                                                                      │
│  3. User visits ats.teamified.com                                   │
│     └── Same flow → Instant authentication                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Environment-Aware Cookie Behavior

The SSO system automatically adjusts cookie settings based on the environment:

| Environment | Cookie Domain | SameSite | How Cross-App SSO Works |
|-------------|--------------|----------|-------------------------|
| **Production** (*.teamified.com) | `.teamified.com` | `lax` | Cookies shared across all subdomains automatically |
| **Staging** (*.replit.app) | Host-only (not set) | `none` | Cross-origin API calls with `credentials: 'include'` |

**Why the difference?**
- `.replit.app` is on the Public Suffix List (PSL), so browsers block setting parent domain cookies
- In staging, each app has its own cookies, but can still check SSO session via API calls

---

## 2. Session Check for Client Apps

Before initiating a full OAuth flow, client apps should check if the user already has an active SSO session. This enables instant login without redirects.

### Session Check Endpoint

**GET** `/api/v1/sso/session`

```javascript
async function checkExistingSession() {
  try {
    const response = await fetch('https://accounts.teamified.com/api/v1/sso/session', {
      method: 'GET',
      credentials: 'include', // CRITICAL: Include cookies in cross-origin request
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const session = await response.json();
      // User is already authenticated!
      return session;
      // Returns: { authenticated: true, user: { id, email, firstName, lastName, roles } }
    }
    
    // No valid session - user needs to login
    return null;
  } catch (error) {
    console.error('Session check failed:', error);
    return null;
  }
}
```

### Response Format

**Success (200)**:
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["client_employee"]
  }
}
```

**No Session (401)**:
```json
{
  "statusCode": 401,
  "message": "No session found"
}
```

---

## 3. Recommended App Initialization Pattern

Use this pattern to seamlessly handle both returning users and new logins:

```javascript
async function initializeApp() {
  // Step 1: Check for existing SSO session (cross-app cookie)
  const existingSession = await checkExistingSession();
  
  if (existingSession?.authenticated) {
    // User already logged in via another Teamified app!
    console.log('SSO session found, user:', existingSession.user.email);
    loadApp(existingSession.user);
    return;
  }
  
  // Step 2: Check for local tokens (returning to this specific app)
  const localToken = localStorage.getItem('access_token');
  
  if (localToken && isTokenValid(localToken)) {
    // Validate with server
    const user = await validateLocalToken(localToken);
    if (user) {
      loadApp(user);
      return;
    }
  }
  
  // Step 3: Try token refresh if we have a refresh token
  const refreshToken = localStorage.getItem('refresh_token');
  if (refreshToken) {
    try {
      await refreshTokens();
      const user = await validateLocalToken(localStorage.getItem('access_token'));
      if (user) {
        loadApp(user);
        return;
      }
    } catch (e) {
      console.log('Token refresh failed, redirecting to login');
    }
  }
  
  // Step 4: No valid session - redirect to login
  redirectToLogin();
}

function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() < (payload.exp * 1000 - 5 * 60 * 1000); // 5 min buffer
  } catch {
    return false;
  }
}
```

---

## 4. Login Flow (OAuth 2.0 + PKCE)

### Step 1: Generate PKCE Parameters

```javascript
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

### Step 2: Redirect to Authorization

```javascript
async function initiateLogin() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = crypto.randomUUID();
  
  // Store for callback
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', state);
  
  const params = new URLSearchParams({
    client_id: 'YOUR_CLIENT_ID',
    redirect_uri: 'https://yourapp.com/callback',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: state,
    response_type: 'code',
  });
  
  window.location.href = `https://accounts.teamified.com/api/v1/sso/authorize?${params}`;
}
```

### Step 3: Handle Callback & Exchange Code

```javascript
async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const storedState = sessionStorage.getItem('oauth_state');
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  
  // Validate state to prevent CSRF
  if (state !== storedState) {
    throw new Error('State mismatch - possible CSRF attack');
  }
  
  // Exchange code for tokens
  const response = await fetch('https://accounts.teamified.com/api/v1/sso/token', {
    method: 'POST',
    credentials: 'include', // Allows server to set httpOnly cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      redirect_uri: 'https://yourapp.com/callback',
      code_verifier: codeVerifier,
    }),
  });
  
  const tokens = await response.json();
  // tokens = { access_token, refresh_token, expires_in, token_type }
  
  // Store tokens locally for this app
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  
  // Note: Server also sets httpOnly cookies for cross-app SSO
  
  // Clean up session storage
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('oauth_state');
  
  return tokens;
}
```

### Step 4: Fetch User Info

```javascript
async function getUserInfo() {
  const accessToken = localStorage.getItem('access_token');
  
  const response = await fetch('https://accounts.teamified.com/api/v1/sso/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }
  
  return response.json();
  // Returns: { id, email, firstName, lastName, roles, ... }
}
```

---

## 5. Token Refresh

```javascript
async function refreshTokens() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await fetch('https://accounts.teamified.com/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include', // Include cookies for session update
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  
  if (!response.ok) {
    clearLocalSession();
    throw new Error('Token refresh failed');
  }
  
  const tokens = await response.json();
  
  // IMPORTANT: Store BOTH new tokens (rotation)
  localStorage.setItem('access_token', tokens.accessToken);
  localStorage.setItem('refresh_token', tokens.refreshToken);
  
  return tokens;
}
```

### Automatic Token Refresh (Interceptor Pattern)

```javascript
// Axios interceptor example
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await refreshTokens();
        originalRequest.headers['Authorization'] = 
          `Bearer ${localStorage.getItem('access_token')}`;
        return api(originalRequest);
      } catch {
        clearLocalSession();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## 6. Logout Implementation

### CRITICAL: Proper Logout Flow

Logout requires TWO steps:
1. Clear local storage FIRST
2. Call SSO logout endpoint

```javascript
function clearLocalSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('oauth_state');
}

async function logout(redirectAfterLogout = '/') {
  // Step 1: Clear local storage FIRST (prevents redirect loops)
  clearLocalSession();
  
  // Step 2: Build logout URL with redirect
  const logoutUrl = new URL('https://accounts.teamified.com/api/v1/sso/logout');
  logoutUrl.searchParams.set('post_logout_redirect_uri', 
    `${window.location.origin}${redirectAfterLogout}`);
  logoutUrl.searchParams.set('client_id', 'YOUR_CLIENT_ID');
  
  // Step 3: Redirect to SSO logout (clears httpOnly cookies)
  window.location.href = logoutUrl.toString();
}
```

### SSO Logout Endpoint Details

**GET** `/api/v1/sso/logout`

| Parameter | Required | Description |
|-----------|----------|-------------|
| `post_logout_redirect_uri` | No | URL to redirect after logout |
| `client_id` | No* | OAuth client ID for redirect validation |
| `id_token_hint` | No | Access token for user identification |
| `state` | No | State parameter passed back to client |

*Required if redirecting to external URLs

**What the endpoint does:**
- Clears httpOnly authentication cookies on shared domain
- Revokes all user sessions in the database
- Invalidates all refresh token families
- Redirects to `post_logout_redirect_uri` (if valid)

---

## 7. Service-to-Service (S2S) Authentication

For backend systems that need to authenticate without user interaction, use the OAuth 2.0 Client Credentials Grant.

### Prerequisites

1. Enable "Client Credentials Grant" for your OAuth client in the Teamified Accounts admin panel
2. Select the required scopes (e.g., `read:users`, `write:organizations`)
3. Keep your `client_secret` secure

### Token Request

```javascript
async function getS2SToken() {
  const response = await fetch('https://accounts.teamified.com/api/v1/sso/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      scope: 'read:users read:organizations', // Optional: request specific scopes
    }),
  });
  
  const tokens = await response.json();
  // tokens = { access_token, expires_in, token_type, scope }
  
  return tokens;
}
```

### Using the Token

```javascript
async function callProtectedAPI() {
  const tokens = await getS2SToken();
  
  const response = await fetch('https://accounts.teamified.com/api/v1/users', {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
  });
  
  return response.json();
}
```

### Available Scopes

| Scope | Description |
|-------|-------------|
| `read:users` | Read user information |
| `write:users` | Create/update users |
| `read:organizations` | Read organization data |
| `write:organizations` | Create/update organizations |
| `read:invitations` | Read invitation data |
| `write:invitations` | Create/manage invitations |

### S2S Token Characteristics

- No refresh token issued (use client credentials again when expired)
- No httpOnly cookies set
- Shorter lifetime than user tokens
- Scopes are validated against client configuration

---

## 8. Implementation Checklist

### Cross-App SSO
- [ ] Call `/api/v1/sso/session` with `credentials: 'include'` on app init
- [ ] Handle 200 response to skip login flow for existing sessions
- [ ] Handle 401 response to proceed with normal login
- [ ] Include `credentials: 'include'` in token exchange calls

### Login Flow
- [ ] PKCE code verifier generated (43-128 chars, URL-safe)
- [ ] PKCE code challenge generated using SHA-256
- [ ] State parameter generated and validated on callback
- [ ] Code verifier stored in sessionStorage (not localStorage)
- [ ] Token exchange includes `credentials: 'include'`
- [ ] Both access_token and refresh_token stored after exchange

### Session Management
- [ ] Access token validated before API calls
- [ ] Token expiration checked with buffer time (5 min)
- [ ] Automatic token refresh on 401 responses
- [ ] New refresh token stored after each refresh (rotation)

### Logout Flow
- [ ] Local storage cleared BEFORE SSO logout call
- [ ] SSO logout endpoint called
- [ ] client_id included for redirect validation

### Security
- [ ] PKCE used for all authorization flows
- [ ] State parameter validated to prevent CSRF
- [ ] Tokens never logged or exposed in URLs
- [ ] `credentials: 'include'` used for cookie-based requests

---

## 9. Common Issues & Solutions

### Issue: Session check returns 401 even though user is logged in
**Cause**: Missing `credentials: 'include'` in fetch request
**Solution**: Add `credentials: 'include'` to all cross-origin requests to SSO

### Issue: Cookies not shared between apps in staging
**Cause**: `.replit.app` domains are on Public Suffix List
**Solution**: This is expected - use API-based session check with `credentials: 'include'`

### Issue: Infinite redirect loop after logout
**Cause**: User data cached in app state not cleared
**Solution**: Clear ALL local storage before SSO logout

### Issue: 401 errors after page refresh
**Cause**: Session not created during token exchange
**Solution**: Ensure `credentials: 'include'` in token exchange request

### Issue: Token refresh fails with "token family mismatch"
**Cause**: Old refresh token used after rotation
**Solution**: Always store new refresh token after each refresh call

### Issue: CORS error on session check
**Cause**: Origin not in CORS allowlist
**Solution**: Contact admin to add your domain to CORS configuration

---

## 10. API Response Formats

### Token Exchange Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 259200
}
```

### Session Check Response
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["client_employee"]
  }
}
```

### User Info Response (/sso/me)
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["client_employee"],
  "isActive": true,
  "emailVerified": true
}
```

### S2S Token Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:users read:organizations"
}
```

---

## 11. Environment Configuration

Required environment variables for your client application:

```env
# SSO Configuration
SSO_BASE_URL=https://accounts.teamified.com
SSO_CLIENT_ID=your-client-id
SSO_CLIENT_SECRET=your-client-secret
SSO_REDIRECT_URI=https://yourapp.com/callback
SSO_POST_LOGOUT_URI=https://yourapp.com/logged-out
```

---

## Need Help?

- **Developer Documentation**: https://accounts.teamified.com/docs/developer/session-management
- **OAuth Configuration**: https://accounts.teamified.com/docs/developer/oauth
- **SSO Integration Guide**: https://accounts.teamified.com/docs/developer/sso-integration
