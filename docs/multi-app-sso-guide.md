# Multi-App SSO Integration Guide

## Overview

This guide shows how to integrate OAuth 2.0 Single Sign-On (SSO) with your internal Replit apps, enabling seamless authentication across the Teamified Portal and all integrated applications. The Portal acts as the Identity Provider (IdP), managing authentication and authorization for all SSO-enabled apps.

## Architecture

The Portal implements OAuth 2.0 Authorization Code Flow for secure SSO:

```
┌──────────────────────────────────────────────────────────────┐
│                    Teamified Portal (IdP)                     │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐    │
│  │  Supabase  │  │   OAuth    │  │   User Database     │    │
│  │    Auth    │  │  Endpoints │  │   + RBAC Roles      │    │
│  └────────────┘  └────────────┘  └─────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
         │                 │                 │
         │  1. Login      │  2. SSO Launch  │  3. Token Exchange
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────┐    ┌────────────┐    ┌────────────┐
│ Team       │    │  App 2     │    │  App 3     │
│ Connect    │    │ (Future)   │    │ (Future)   │
└────────────┘    └────────────┘    └────────────┘
```

### Portal OAuth 2.0 Endpoints

The Portal provides these SSO endpoints:

1. **Launch Endpoint (Recommended)**: `GET /api/v1/sso/launch/:clientId`
   - **Simplified SSO initiation** - automatically selects redirect URI
   - Validates user session
   - Creates short-lived auth code (60s TTL)
   - Redirects to SSO app with auth code
   - **Use this for Portal-initiated SSO flows**

2. **Authorization Endpoint (Advanced)**: `GET /api/v1/sso/authorize`
   - Full OAuth 2.0 authorization endpoint
   - Requires manual redirect_uri, state, and optional PKCE parameters
   - Supports optional `intent` parameter for user type filtering
   - Use when you need custom redirect URIs or state management
   - **Use this for app-initiated SSO flows with custom parameters**

3. **Token Exchange Endpoint**: `POST /api/v1/sso/token`
   - Exchanges auth code for Portal JWT
   - Returns user profile with roles
   - Supports PKCE for public clients
   - **Required by all SSO apps to complete the flow**

4. **Frontend Launch Route**: `/sso/launch/:clientId`
   - UI route that redirects to backend launch endpoint
   - Used by Portal navigation (e.g., Team Connect button)

## Portal-Managed OAuth 2.0 Flow

When a user clicks "Team Connect" in the Portal navigation:

```
1. Portal validates user is logged in
   │
2. Portal generates auth code (60s expiry, single-use)
   │
3. Portal redirects to Team Connect with code
   │   → https://team-connect.../auth/callback?code=xyz123&state=abc
   │
4. Team Connect calls Portal token exchange endpoint
   │   POST /api/v1/sso/token
   │   Body: { code, client_id, client_secret, redirect_uri }
   │
5. Portal validates code and returns JWT + user data
   │   { access_token, refresh_token, user: {...} }
   │
6. Team Connect stores JWT and logs user in
   │
✓  User is now authenticated in Team Connect without re-entering credentials
```

### Security Features

- ✅ **60-second auth code expiry** - Prevents code replay
- ✅ **Single-use codes** - Each code can only be exchanged once
- ✅ **State parameter** - CSRF protection
- ✅ **PKCE support** - Enhanced security for public clients
- ✅ **Client secret validation** - For confidential apps
- ✅ **Redirect URI validation** - Prevents code interception
- ✅ **Audit logging** - All SSO attempts are logged
- ✅ **Intent-based access control** - Restrict access by user type

## Intent Parameter (User Type Filtering)

The SSO authorization endpoint supports an optional `intent` parameter that allows you to restrict which type of users can authenticate through your application.

### Intent Values

| Intent | Description |
|--------|-------------|
| `client` | Only users associated with client organizations can authenticate |
| `candidate` | Only candidate users can authenticate |
| `both` | Both client and candidate users can authenticate (default) |

### How Intent Works

1. **OAuth Client Default Intent**: Each registered OAuth client has a `default_intent` setting configured in the Portal admin. This acts as the baseline access control for the application.

2. **Runtime Intent (Optional)**: Client apps can pass an `intent` parameter at authorization time to further narrow access. The runtime intent can only be **equal to or more restrictive** than the default intent - it cannot widen access.

3. **Intent Resolution Logic**:
   - If no runtime `intent` is provided → Uses OAuth client's `default_intent`
   - If `default_intent` is `'both'` → Runtime intent is applied as-is
   - If runtime intent tries to widen access → Ignored, falls back to `default_intent`

### Authorization URL Examples

**Standard authorization (uses OAuth client's default intent):**
```
GET /api/v1/sso/authorize?client_id=xxx&redirect_uri=xxx&state=xxx
```

**Candidate-only authorization:**
```
GET /api/v1/sso/authorize?client_id=xxx&redirect_uri=xxx&state=xxx&intent=candidate
```

**Client-only authorization:**
```
GET /api/v1/sso/authorize?client_id=xxx&redirect_uri=xxx&state=xxx&intent=client
```

### Client-Side Implementation Example

```typescript
const handleLoginClick = async (userIntent?: 'client' | 'candidate' | 'both') => {
  const authParams: Record<string, string> = {
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    state: generateState(),
    code_challenge: await generateCodeChallenge(codeVerifier),
    code_challenge_method: 'S256',
  };

  // Only add intent if narrowing from 'both'
  if (userIntent && userIntent !== 'both') {
    authParams.intent = userIntent;
  }

  const authUrl = `${portalUrl}/api/v1/sso/authorize?${new URLSearchParams(authParams)}`;
  window.location.href = authUrl;
};
```

### Error Handling for Intent Mismatch

When a user's type doesn't match the effective intent, the Portal redirects back to the client app with an OAuth error:

```
https://your-app.com/auth/callback?error=access_denied&error_description=This+application+is+for+client+organizations+only...&state=xxx
```

Your callback handler should check for the `error` parameter and display an appropriate message to the user.

### Backward Compatibility

The `intent` parameter is fully optional. Existing client applications that don't pass the `intent` parameter will continue to work exactly as before - they will use the OAuth client's `default_intent` (which defaults to `'both'` for existing clients).

## Registering Your App for SSO

### Step 1: Register via Portal Admin UI

1. **Login to Portal** as admin
2. **Navigate to Settings** → **OAuth Clients (SSO Apps)** tab
3. **Click "Add New OAuth Client"**
4. **Fill in the form:**
   - **Name**: Team Connect
   - **Description**: Internal team collaboration platform
   - **Redirect URI**: `https://your-app.repl.co/auth/callback`
   - **Environment**: Development or Production
   - **Default Intent**: Select the target user audience:
     - `both` (default) - Allow both candidates and client users
     - `candidate` - Restrict to candidate users only
     - `client` - Restrict to client organization users only
5. **Save** and copy your credentials:
   - `client_id`: e.g., `client_266b2fd552de8dd40c0414285e1b597f`
   - `client_secret`: e.g., `secret_abc123def456...`

⚠️ **Important**: Store `client_secret` securely - it should **NEVER** be exposed in frontend code!

### Step 2: Add Credentials to Replit Secrets

In your SSO app's Replit project:

1. **Click Secrets** (🔒 icon in left sidebar)
2. **Add these secrets:**
   ```
   VITE_PORTAL_API_URL=https://your-portal.repl.co
   VITE_OAUTH_CLIENT_ID=client_266b2fd552de8dd40c0414285e1b597f
   OAUTH_CLIENT_SECRET=secret_abc123def456...
   ```

**Security Note:**
- ✅ `VITE_` prefix = exposed to frontend (safe for public data)
- ❌ NO `VITE_` prefix = backend only (required for secrets!)

## Integration Steps for Your SSO App

### Step 1: Install Dependencies

```bash
npm install axios
```

### Step 2: Create Auth Service

Create `src/services/authService.ts`:

```typescript
import axios from 'axios';

const PORTAL_API_URL = import.meta.env.VITE_PORTAL_API_URL;
const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.OAUTH_CLIENT_SECRET; // Backend only!

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    clientId?: string;
  };
}

export const authService = {
  /**
   * Exchange OAuth authorization code for Portal JWT
   * This should be called from your /auth/callback route
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenResponse> {
    try {
      const response = await axios.post(`${PORTAL_API_URL}/api/v1/sso/token`, {
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET, // Only include if calling from backend
        redirect_uri: redirectUri,
      });

      return response.data;
    } catch (error) {
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code for token');
    }
  },

  /**
   * Store tokens securely
   */
  storeTokens(tokenData: TokenResponse): void {
    // Option 1: sessionStorage (more secure, cleared on tab close)
    sessionStorage.setItem('access_token', tokenData.access_token);
    if (tokenData.refresh_token) {
      sessionStorage.setItem('refresh_token', tokenData.refresh_token);
    }
    sessionStorage.setItem('user', JSON.stringify(tokenData.user));

    // Option 2: localStorage (persists across tabs/refreshes)
    // localStorage.setItem('access_token', tokenData.access_token);
  },

  /**
   * Get current user from stored token
   */
  getCurrentUser(): any | null {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('access_token');
  },

  /**
   * Sign out
   */
  signOut(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  },
};
```

### Step 3: Create Auth Callback Handler

Create `src/pages/AuthCallback.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setError(`Authentication error: ${error}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Exchange code for token
        const redirectUri = `${window.location.origin}/auth/callback`;
        const tokenData = await authService.exchangeCodeForToken(code, redirectUri);

        // Store tokens and user data
        authService.storeTokens(tokenData);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Completing sign-in...</h2>
      <p>Please wait while we authenticate your session...</p>
    </div>
  );
}
```

### Step 4: Configure Axios Interceptor (Optional)

Add Portal JWT to all API requests:

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_PORTAL_API_URL,
});

// Add JWT to all requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 5: Add Routes

Update `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<div>Team Connect Home</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 6: Test SSO Flow

1. **Login to Portal**
2. **Click "Team Connect" in navigation**
3. **Portal automatically:**
   - Validates your session
   - Creates auth code
   - Redirects to Team Connect
4. **Team Connect automatically:**
   - Receives auth code
   - Exchanges for JWT
   - Logs you in
5. **✅ You're now logged in without entering credentials!**

## Backend Proxy Pattern (If Client Secret Required)

If your SSO app needs to keep the client secret secure, use a backend proxy:

**Backend (Express.js example):**

```typescript
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post('/api/auth/exchange-code', async (req, res) => {
  const { code, redirect_uri } = req.body;

  try {
    const response = await axios.post(
      `${process.env.PORTAL_API_URL}/api/v1/sso/token`,
      {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.VITE_OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET, // Secret stays on backend!
        redirect_uri,
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(401).json({ error: 'Token exchange failed' });
  }
});

app.listen(3000);
```

**Frontend:**

```typescript
// Call your backend proxy instead of Portal directly
const response = await axios.post('/api/auth/exchange-code', {
  code,
  redirect_uri: window.location.origin + '/auth/callback',
});
```

## Legacy Integration (For Reference Only)

### Step 1: Install Shared SSO Package

```bash
npm install @teamified/sso @supabase/supabase-js axios
```

The `@teamified/sso` package eliminates code duplication and provides:
- ✅ Pre-configured Supabase client
- ✅ Token exchange logic
- ✅ Multiple secure storage strategies
- ✅ Consistent API across all apps

### Step 2: Initialize Auth Client

Create `src/auth.ts`:

```typescript
import { createTeamifiedAuth, SessionStorageStrategy } from '@teamified/sso';

export const auth = createTeamifiedAuth({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
  portalApiUrl: import.meta.env.VITE_PORTAL_API_URL!,
  tokenStorage: new SessionStorageStrategy(), // Production-recommended
});
```

**Storage Options:**
```typescript
import {
  LocalStorageStrategy,    // Simple, persists across refreshes (dev only)
  SessionStorageStrategy,  // More secure, cleared on tab close (recommended)
  MemoryStorageStrategy,   // Most secure, lost on refresh (high security)
} from '@teamified/sso';
```

### Step 3: Update Auth Service (Optional Wrapper)

If you want a custom service layer:

```typescript
import { auth } from './auth';

export const authService = {
  signInWithGoogle: () => auth.signInWithGoogle(),
  handleCallback: () => auth.handleCallback(),
  getCurrentUser: () => auth.getCurrentUser(),
  signOut: () => auth.signOut(),
  isAuthenticated: () => auth.isAuthenticated(),
};
```

Or use `auth` directly in components!

### Step 4: Create Login Component

Create `src/components/LoginButton.tsx`:

```typescript
import React, { useState } from 'react';
import { auth } from '../auth';

export const LoginButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await auth.signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

### Step 5: Create Auth Callback Page

Create `src/pages/AuthCallback.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../auth';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await auth.handleCallback();
        navigate('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div>
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Completing sign-in...</h2>
      <p>Please wait...</p>
    </div>
  );
};
```

### Step 6: Add Routes

In your `App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginButton } from './components/LoginButton';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginButton />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 7: Environment Variables

Create `.env.development`:

```env
# Supabase Configuration (Development)
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key-here

# Portal API (Development)
VITE_PORTAL_API_URL=https://teamified-portal.username.repl.co/api
```

For production, use Replit Secrets:

```env
# Supabase Configuration (Production)
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key-here

# Portal API (Production - custom domain)
VITE_PORTAL_API_URL=https://portal.teamified.com/api
```

**Important:** Use separate Supabase projects for dev and production! See `docs/multi-app-deployment.md` for environment setup.

### Step 8: Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration, add:

```
# App 1
https://app1-name.username.repl.co/auth/callback

# App 2
https://app2-name.username.repl.co/auth/callback

# App 3
https://app3-name.username.repl.co/auth/callback

# Portal (already added)
https://portal-domain.repl.co/auth/callback
```

## Testing Multi-App SSO

### Test Scenario 1: Login from Portal

1. **Login to Portal** → `https://portal.repl.co/login`
2. **Click "Continue with Google"**
3. **After login, open App 1** → `https://app1.repl.co`
4. **Expected:** User is automatically logged in (SSO)

### Test Scenario 2: Login from App 1

1. **Login to App 1** → `https://app1.repl.co/login`
2. **Click "Continue with Google"**
3. **Open Portal** → `https://portal.repl.co`
4. **Expected:** User is automatically logged in (SSO)

### Test Scenario 3: Logout from Any App

1. **Log out from Portal**
2. **Open App 1, App 2, App 3**
3. **Expected:** User is logged out from all apps

## How SSO Works Automatically

Supabase uses **browser cookies** and **localStorage** to share sessions:

1. **First login** (any app):
   - Supabase creates session
   - Stores in browser cookies (domain-wide)
   - Stores in localStorage (app-specific)

2. **Visit another app**:
   - Supabase SDK checks for existing session
   - Finds session in cookies/localStorage
   - Auto-exchanges for Portal JWT
   - User is logged in automatically

3. **Logout** (any app):
   - Supabase clears session
   - Clears cookies (affects all apps)
   - Clears localStorage
   - User logged out everywhere

## RBAC Integration

Each app gets user roles from Portal JWT:

```typescript
// After auth callback, decode Portal JWT
const token = localStorage.getItem('teamified_access_token');
const payload = JSON.parse(atob(token.split('.')[1]));

// Check roles
if (payload.roles.includes('admin')) {
  // Show admin features
}

if (payload.roles.includes('candidate')) {
  // Show candidate features
}
```

## API Calls with Portal JWT

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_PORTAL_API_URL,
});

// Add Portal JWT to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teamified_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example: Get user data with RBAC
const response = await api.get('/v1/users/me');
console.log(response.data); // User with roles from Portal DB
```

## Common Issues & Solutions

### Issue 1: SSO not working across apps

**Cause:** Apps on different domains
**Solution:** 
- Use same root domain (e.g., `app1.yourdomain.com`, `app2.yourdomain.com`)
- Or use Supabase's session sharing via URL parameters

### Issue 2: User has session but no roles

**Cause:** Token exchange failed or skipped
**Solution:** Always call `authService.handleCallback()` after OAuth redirect

### Issue 3: Session expires quickly

**Cause:** Supabase default is 1 hour
**Solution:** 
- Configure refresh tokens in Supabase
- Set `autoRefreshToken: true` in Supabase client

### Issue 4: Redirect URLs not working

**Cause:** Replit URL changed (renamed Repl)
**Solution:** Update redirect URLs in Supabase Dashboard

## Security Best Practices

1. **Never expose Service Role Key** - Use in backend only
2. **Use ANON KEY in frontend** - Safe for public exposure
3. **Validate Portal JWT** - Always verify signature on backend
4. **Rate limit token exchange** - Prevent abuse (already implemented)
5. **Use HTTPS only** - Required for secure cookies

## Production Checklist

- [ ] All apps use same Supabase project
- [ ] Redirect URLs configured for all apps
- [ ] Environment variables set in Replit Secrets
- [ ] Portal API accessible from all apps
- [ ] Test SSO flow between all apps
- [ ] Test logout propagation
- [ ] Monitor token exchange endpoint for rate limiting

## Next Steps

1. Integrate SSO into App 1 (follow steps above)
2. Test SSO between Portal and App 1
3. Integrate SSO into App 2 and App 3
4. Test SSO across all 4 applications
5. Deploy to production with custom domains
