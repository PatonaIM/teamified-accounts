# Team Connect OAuth Setup - Quick Reference

## ✅ Portal OAuth Endpoints

The Portal now has a **public OAuth 2.0 authorization endpoint** that handles the complete SSO flow:

### Authorization Endpoint (Public)
```
GET https://fc0326b2-0c1a-4f3d-8c6c-565f5468c510-00-1h43noewb2ai0.janeway.replit.dev/api/v1/sso/authorize
```

**Parameters:**
- `client_id`: `client_266b2fd552de8dd40c0414285e1b597f`
- `redirect_uri`: `https://98de675e-3037-461f-b391-8267ceb28294-00-31oxsij4o498l.worf.replit.dev/auth/callback`
- `response_type`: `code`
- `state`: Random UUID for CSRF protection

**Behavior:**
- ✅ Works for unauthenticated users
- ✅ Redirects to Portal login if not logged in
- ✅ Returns to authorization flow after login
- ✅ Generates auth code and redirects to Team Connect

### Token Exchange Endpoint
```
POST https://fc0326b2-0c1a-4f3d-8c6c-565f5468c510-00-1h43noewb2ai0.janeway.replit.dev/api/v1/sso/token
```

**Body:**
```json
{
  "grant_type": "authorization_code",
  "code": "<auth_code>",
  "client_id": "client_266b2fd552de8dd40c0414285e1b597f",
  "client_secret": "f26957a353ff2426a5730298a95da6a7a3ba3a56e33449bb6b073c1cb33ba76c",
  "redirect_uri": "https://98de675e-3037-461f-b391-8267ceb28294-00-31oxsij4o498l.worf.replit.dev/auth/callback"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 604800,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [...]
  }
}
```

---

## 🔧 Team Connect Protected Route Implementation

When a user tries to access a protected page in Team Connect without authentication:

```typescript
// client/src/components/ProtectedRoute.tsx
const PORTAL_BASE_URL = 'https://fc0326b2-0c1a-4f3d-8c6c-565f5468c510-00-1h43noewb2ai0.janeway.replit.dev';
const OAUTH_CLIENT_ID = 'client_266b2fd552de8dd40c0414285e1b597f';
const OAUTH_REDIRECT_URI = 'https://98de675e-3037-461f-b391-8267ceb28294-00-31oxsij4o498l.worf.replit.dev/auth/callback';

export function ProtectedRoute({ component: Component }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Generate CSRF state
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    
    // Build OAuth authorization URL
    const authUrl = new URL(`${PORTAL_BASE_URL}/api/v1/sso/authorize`);
    authUrl.searchParams.set('client_id', OAUTH_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    
    // Redirect to Portal for authentication
    window.location.href = authUrl.toString();
    return null;
  }

  return <Component />;
}
```

---

## 🔄 Complete OAuth Flow

### 1. User Accesses Protected Page
```
User visits: https://team-connect.repl.co/dashboard
Team Connect: User not authenticated
```

### 2. Redirect to Portal Authorization
```
Team Connect redirects to:
https://portal.repl.co/api/v1/sso/authorize?
  client_id=client_266b2fd552de8dd40c0414285e1b597f&
  redirect_uri=https://team-connect.repl.co/auth/callback&
  response_type=code&
  state=abc-123
```

### 3. Portal Checks Authentication
```
Portal checks: Is user logged in?

IF NOT LOGGED IN:
  Portal redirects to:
  https://portal.repl.co/login?returnUrl=/api/v1/sso/authorize?client_id=...

IF LOGGED IN:
  Portal generates auth code and redirects to:
  https://team-connect.repl.co/auth/callback?code=xyz789&state=abc-123
```

### 4. User Logs In (if needed)
```
User enters credentials on Portal login page
Portal validates credentials
Portal redirects back to:
  /api/v1/sso/authorize?client_id=...
```

### 5. Portal Generates Auth Code
```
Portal creates 60-second auth code
Portal redirects to:
  https://team-connect.repl.co/auth/callback?code=xyz789&state=abc-123
```

### 6. Team Connect Exchanges Code for Token
```
Team Connect backend calls:
POST https://portal.repl.co/api/v1/sso/token
{
  "grant_type": "authorization_code",
  "code": "xyz789",
  "client_id": "client_266b2fd552de8dd40c0414285e1b597f",
  "client_secret": "f26957a353ff2426a5730298a95da6a7a3ba3a56e33449bb6b073c1cb33ba76c",
  "redirect_uri": "https://team-connect.repl.co/auth/callback"
}
```

### 7. Portal Returns JWT
```
Portal validates:
  ✅ Auth code is valid and not expired (60s TTL)
  ✅ Auth code hasn't been used (single-use)
  ✅ Client ID and secret match
  ✅ Redirect URI matches registered URI

Portal returns:
{
  "access_token": "eyJhbGc...",
  "user": { ... }
}
```

### 8. Team Connect Stores Token
```
Team Connect:
  - Stores JWT in httpOnly cookie
  - Redirects user to dashboard
  - User is now logged in! 🎉
```

---

## 🧪 Testing the Flow

1. **Clear all cookies/localStorage** in Team Connect
2. **Visit a protected page** (e.g., `/dashboard`)
3. **Expected behavior:**
   - Redirects to Portal `/api/v1/sso/authorize`
   - If not logged into Portal, shows login page
   - After login, generates auth code
   - Redirects back to Team Connect `/auth/callback`
   - Team Connect exchanges code for JWT
   - User logged into Team Connect automatically

---

## ⚠️ Important Notes

1. **Portal URL:** Update `PORTAL_BASE_URL` to actual production Portal URL when deploying
2. **State Parameter:** Always validate state parameter to prevent CSRF attacks
3. **Auth Code:** Valid for 60 seconds, single-use only
4. **Token Storage:** Use httpOnly cookies for maximum security
5. **Error Handling:** Always handle OAuth errors gracefully

---

## 🔐 Security Features

- ✅ **CSRF Protection:** State parameter validation
- ✅ **Auth Code TTL:** 60-second expiration
- ✅ **Single-Use Codes:** Auth codes can only be exchanged once
- ✅ **Client Secret:** Required for token exchange
- ✅ **Redirect URI Validation:** Must match registered URI
- ✅ **HttpOnly Cookies:** Prevents XSS attacks

---

## 📝 Environment Variables for Team Connect

```bash
# .env
PORTAL_BASE_URL=https://fc0326b2-0c1a-4f3d-8c6c-565f5468c510-00-1h43noewb2ai0.janeway.replit.dev
OAUTH_REDIRECT_URI=https://98de675e-3037-461f-b391-8267ceb28294-00-31oxsij4o498l.worf.replit.dev/auth/callback
```

For frontend (`.env.local`):
```bash
VITE_PORTAL_BASE_URL=https://fc0326b2-0c1a-4f3d-8c6c-565f5468c510-00-1h43noewb2ai0.janeway.replit.dev
VITE_OAUTH_REDIRECT_URI=https://98de675e-3037-461f-b391-8267ceb28294-00-31oxsij4o498l.worf.replit.dev/auth/callback
```
