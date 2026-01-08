# Single Sign-Out (SLO) Implementation Guide

This guide explains how to implement Single Sign-Out for client applications integrating with Teamified Accounts SSO.

## Overview

Single Sign-Out ensures that when a user logs out from **any** Teamified application, they are automatically logged out from **all** connected applications. This is achieved through front-channel logout using hidden iframes.

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Single Sign-Out Flow                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User clicks "Logout" in any Teamified app                       │
│     └── App clears local storage                                    │
│     └── App redirects to /api/v1/sso/logout                        │
│                                                                      │
│  2. Teamified Accounts SSO:                                         │
│     └── Revokes all user sessions in database                       │
│     └── Sets globalLogoutAt timestamp                               │
│     └── Clears httpOnly cookies on .teamified.com                  │
│     └── Renders front-channel logout page                          │
│                                                                      │
│  3. Front-channel logout page:                                      │
│     └── Loads hidden iframes for each registered client app        │
│     └── Each iframe calls the client's logout_uri                  │
│     └── Client apps clear their local tokens                       │
│     └── Redirects to final destination after 3s or all frames load │
│                                                                      │
│  4. User lands on logged-out page                                   │
│     └── ALL Teamified apps are now logged out                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Register Your Logout URI

Each OAuth client must register a `logout_uri` - the endpoint that will be called via iframe during logout.

**Via API (admin only):**

```javascript
await fetch('https://accounts.teamified.com/api/v1/oauth-clients/{id}', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    logout_uri: 'https://yourapp.teamified.com/auth/logout/callback',
  }),
});
```

**Via Admin UI:**
1. Go to Teamified Accounts Admin Panel
2. Navigate to OAuth Clients
3. Edit your client
4. Add the `logout_uri` field

### Step 2: Implement the Logout Callback

Create an endpoint that clears local tokens when loaded. This endpoint will be called via a hidden iframe.

**React Example:**

```tsx
// src/pages/LogoutCallback.tsx
import { useEffect } from 'react';

export function LogoutCallback() {
  useEffect(() => {
    // Clear ALL local tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    sessionStorage.clear();
    
    console.log('[SSO] Front-channel logout received - tokens cleared');
  }, []);

  // Return minimal HTML (this page is loaded in hidden iframe)
  return <div>Logged out</div>;
}
```

**Add the route:**

```tsx
// React Router
<Route path="/auth/logout/callback" element={<LogoutCallback />} />

// Next.js - pages/auth/logout/callback.tsx
export default function LogoutCallback() {
  // Same implementation as above
}
```

**Express.js Backend Example:**

```javascript
app.get('/auth/logout/callback', (req, res) => {
  // Clear any server-side session
  req.session?.destroy?.();
  
  // Clear cookies if applicable
  res.clearCookie('session_id');
  res.clearCookie('access_token');
  
  res.send('OK');
});
```

### Step 3: Implement Logout Initiation

When the user clicks logout in your app, redirect them to the central SSO logout endpoint.

```javascript
function clearLocalSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('oauth_state');
}

function logout(redirectAfterLogout = '/') {
  // Step 1: Clear local storage FIRST (prevents redirect loops)
  clearLocalSession();
  
  // Step 2: Build logout URL with redirect
  const logoutUrl = new URL('https://accounts.teamified.com/api/v1/sso/logout');
  logoutUrl.searchParams.set('post_logout_redirect_uri', 
    `${window.location.origin}${redirectAfterLogout}`);
  logoutUrl.searchParams.set('client_id', 'YOUR_CLIENT_ID');
  
  // Step 3: Redirect to SSO logout (triggers front-channel logout)
  window.location.href = logoutUrl.toString();
}
```

### Step 4: Session Validation on App Load (Safety Net)

Always validate the session when your app loads to catch any logouts that happened in other apps:

```javascript
async function initializeApp() {
  try {
    const response = await fetch('https://accounts.teamified.com/api/v1/sso/session', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      // Session invalid - user was logged out elsewhere
      clearLocalSession();
      redirectToLogin();
      return;
    }
    
    const session = await response.json();
    loadApp(session.user);
  } catch (error) {
    // Network error - fall back to local token validation
    const localToken = localStorage.getItem('access_token');
    if (localToken && isTokenValid(localToken)) {
      loadApp(getUserFromToken(localToken));
    } else {
      clearLocalSession();
      redirectToLogin();
    }
  }
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

## SSO Logout Endpoint Reference

**GET** `/api/v1/sso/logout`

| Parameter | Required | Description |
|-----------|----------|-------------|
| `post_logout_redirect_uri` | No | URL to redirect after logout completes |
| `client_id` | No* | OAuth client ID for redirect validation |
| `id_token_hint` | No | Access token for user identification |
| `state` | No | State parameter passed back to client |

*Required if redirecting to external URLs

## OAuth Client Configuration

When registering or updating an OAuth client, include the `logout_uri`:

```json
{
  "name": "My Application",
  "redirect_uris": [
    { "uri": "https://myapp.teamified.com/auth/callback", "environment": "production" }
  ],
  "logout_uri": "https://myapp.teamified.com/auth/logout/callback",
  "default_intent": "both"
}
```

## Implementation Checklist

- [ ] Register `logout_uri` for your OAuth client
- [ ] Implement logout callback endpoint (`/auth/logout/callback`)
- [ ] Update logout button to redirect to central SSO logout
- [ ] Clear local storage BEFORE redirecting to logout
- [ ] Include `client_id` in logout URL for redirect validation
- [ ] Implement session check on app load as safety net
- [ ] Test logout from your app and verify all apps are logged out
- [ ] Test logout from another app and verify your app is logged out

## Troubleshooting

### User still appears logged in after logout from another app

**Cause:** Your app is using cached local tokens without validating with SSO.

**Solution:** Implement session validation on app load (Step 4 above).

### Front-channel logout iframe fails to load

**Cause:** CORS issues or incorrect logout_uri configuration.

**Solution:** 
1. Verify `logout_uri` is correctly registered
2. Ensure the endpoint returns a valid HTML response
3. The system has a 3-second timeout and will continue even if some iframes fail

### Infinite redirect loop during logout

**Cause:** App re-initiates login before logout completes.

**Solution:** Clear local storage BEFORE redirecting to SSO logout.

### Session check returns 401 even though user just logged in

**Cause:** Missing `credentials: 'include'` in fetch request.

**Solution:** Add `credentials: 'include'` to all cross-origin requests to SSO.

## Security Considerations

1. **XSS Protection:** The logout callback should not execute any untrusted code
2. **CSRF:** The front-channel logout uses iframes, ensuring the logout is triggered by the legitimate SSO server
3. **Token Invalidation:** The `globalLogoutAt` timestamp ensures all tokens issued before logout are rejected
4. **Session Revocation:** All database sessions are revoked immediately during logout

## Logout URI Requirements

**CRITICAL:** Your `logout_uri` must meet these security requirements:

1. **HTTPS Required:** All logout URIs must use HTTPS protocol (except `localhost` for local development)
2. **Approved Domains Only:** logout_uri must be on an approved Teamified domain:
   - `*.teamified.com`
   - `*.teamified.au`
   - `*.replit.app` (development)
   - `*.replit.dev` (development)
   - `localhost` (local development only)
3. **Path Must Start With `/`:** The path component must start with a forward slash
4. **No Query Strings Recommended:** While technically allowed, avoid query strings in your logout_uri

**Example Valid logout_uri:**
```
https://ats.teamified.com/auth/logout/callback
https://jobs.teamified.au/logout/callback
http://localhost:3000/auth/logout/callback  (development only)
```

**Example Invalid logout_uri:**
```
http://ats.teamified.com/logout  (no HTTPS)
https://evil.com/logout  (not on approved domain)
https://teamified.com.evil.org/logout  (subdomain spoofing)
```

## CSP and Iframe Security

The front-channel logout page implements the following security measures:

1. **Content Security Policy (CSP):** Only validated logout URI origins are allowed as iframe sources
2. **Iframe Sandbox:** Each iframe has `sandbox="allow-scripts allow-same-origin"` to restrict capabilities
3. **No Referrer Policy:** Iframes use `referrerpolicy="no-referrer"` to prevent leaking sensitive data
4. **X-Frame-Options: DENY:** The logout page itself cannot be embedded in iframes

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | January 2026 | Initial front-channel logout implementation |

---

For questions or issues, contact the Teamified Accounts team.
