# Teamified Accounts SSO Integration Guide

This guide covers login, logout, and session management implementation for OAuth 2.0 client applications integrating with Teamified Accounts SSO.

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/sso/authorize` | GET | Start OAuth authorization flow |
| `/api/v1/sso/token` | POST | Exchange auth code for tokens |
| `/api/v1/sso/me` | GET | Get current user info |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/sso/logout` | GET | Centralized logout (RP-initiated) |

## Token Lifetimes

- **Access Token**: 72 hours (259200 seconds)
- **Refresh Token**: 30 days
- **Session Timeout**: 72 hours inactivity / 30 days absolute

---

## 1. Login Flow (OAuth 2.0 + PKCE)

### Step 1: Generate PKCE Parameters

```javascript
// Generate a random code verifier (43-128 characters)
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Generate code challenge from verifier
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
  
  // Store tokens
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  
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

## 2. Session Checking

### Client-Side Session Check (Quick)

```javascript
function isSessionValid() {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) return false;
  
  try {
    // Decode JWT payload (middle part)
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    
    // Check if expired (with 5 min buffer)
    return Date.now() < (expiresAt - 5 * 60 * 1000);
  } catch {
    return false;
  }
}
```

### Server-Side Session Validation (Authoritative)

```javascript
async function validateSession() {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) return null;
  
  try {
    const response = await fetch('https://accounts.teamified.com/api/v1/sso/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    
    if (!response.ok) {
      // Token invalid - clear and return null
      clearLocalSession();
      return null;
    }
    
    return await response.json();
  } catch {
    return null;
  }
}
```

### App Initialization Pattern

```javascript
async function initializeApp() {
  // Quick client-side check first
  if (!isSessionValid()) {
    // Try refresh if we have a refresh token
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await refreshTokens();
      } catch {
        redirectToLogin();
        return;
      }
    } else {
      redirectToLogin();
      return;
    }
  }
  
  // Validate with server
  const user = await validateSession();
  if (!user) {
    redirectToLogin();
    return;
  }
  
  // User authenticated - load app
  loadApp(user);
}
```

---

## 3. Token Refresh

```javascript
async function refreshTokens() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await fetch('https://accounts.teamified.com/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  
  if (!response.ok) {
    // Refresh failed - user must login again
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
        
        // Retry with new token
        originalRequest.headers['Authorization'] = 
          `Bearer ${localStorage.getItem('access_token')}`;
        return api(originalRequest);
      } catch {
        // Refresh failed - redirect to login
        clearLocalSession();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## 4. Logout Implementation

### CRITICAL: Proper Logout Flow

Logout requires TWO steps:
1. Clear local storage FIRST
2. Call SSO logout endpoint

```javascript
function clearLocalSession() {
  // Clear tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Clear cached user data
  localStorage.removeItem('user_data');
  
  // Clear session storage
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
  
  // Step 3: Redirect to SSO logout
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

*Required if redirecting to external URLs (non-Teamified domains)

**What the endpoint does:**
- Clears httpOnly authentication cookies
- Revokes all user sessions in the database
- Invalidates all refresh token families
- Redirects to `post_logout_redirect_uri` (if valid)

---

## 5. Implementation Checklist

### Login Flow
- [ ] PKCE code verifier generated (43-128 chars, URL-safe)
- [ ] PKCE code challenge generated using SHA-256
- [ ] State parameter generated and validated on callback
- [ ] Code verifier stored in sessionStorage (not localStorage)
- [ ] Token exchange includes code_verifier
- [ ] Both access_token and refresh_token stored after exchange
- [ ] Session storage cleaned up after successful login

### Session Management
- [ ] Access token validated before API calls
- [ ] Token expiration checked with buffer time (5 min recommended)
- [ ] Automatic token refresh on 401 responses
- [ ] New refresh token stored after each refresh (rotation)
- [ ] Failed refresh redirects to login

### Logout Flow
- [ ] Local storage cleared BEFORE SSO logout call
- [ ] SSO logout endpoint called with credentials: 'include'
- [ ] client_id included for redirect validation
- [ ] User redirected after logout completes

### Security
- [ ] Tokens stored in localStorage (not cookies for SPAs)
- [ ] PKCE used for all authorization flows
- [ ] State parameter validated to prevent CSRF
- [ ] Tokens never logged or exposed in URLs
- [ ] 401 responses handled gracefully

---

## 6. Common Issues & Solutions

### Issue: Infinite redirect loop after logout
**Cause**: User data cached in app state/context not cleared
**Solution**: Clear ALL local storage before SSO logout, including cached user objects

### Issue: 401 errors after page refresh
**Cause**: Session not created during token exchange
**Solution**: Ensure using latest SSO token endpoint (v1.0.4+)

### Issue: Token refresh fails with "token family mismatch"
**Cause**: Old refresh token used after rotation
**Solution**: Always store new refresh token after each refresh call

### Issue: Logout doesn't clear session on SSO portal
**Cause**: Only clearing local storage, not calling SSO logout
**Solution**: Call GET /api/v1/sso/logout with credentials: 'include'

### Issue: Redirect after logout goes to wrong URL
**Cause**: post_logout_redirect_uri not in client's registered URIs
**Solution**: Register all logout redirect URIs in OAuth client config, or use client_id parameter

---

## 7. API Response Formats

### Token Exchange Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 259200
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

### Token Refresh Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 8. Environment Configuration

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
