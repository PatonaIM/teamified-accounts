# Teamified Accounts SSO Integration Guide

> **For AI Assistants**: This document contains everything needed to integrate Teamified Accounts Single Sign-On (SSO) into a web application using OAuth 2.0 Authorization Code Flow with PKCE.

## Overview

Teamified Accounts is a centralized authentication platform that provides secure SSO across applications. It uses industry-standard OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure authentication.

## Prerequisites

Before integrating, you need:

1. **OAuth Client Credentials** (provided by Teamified Portal admin):
   - `client_id` - Your application's unique identifier
   - `client_secret` - Your application's secret key (keep secure, backend only!)
   - `redirect_uri` - Your callback URL (must be registered in Portal)

2. **Portal Base URL**: The Teamified Portal API endpoint

## Integration Architecture

```
┌─────────────────┐         ┌─────────────────────┐         ┌─────────────────┐
│   Your App      │ ──1──►  │  Teamified Portal   │ ──2──►  │   Your App      │
│ (Login Button)  │         │  (Authorization)    │         │ (/auth/callback)│
└─────────────────┘         └─────────────────────┘         └─────────────────┘
        │                                                            │
        │                                                            ▼
        │                                                   ┌─────────────────┐
        │                                                   │  Exchange Code  │
        │                                                   │  for JWT Token  │
        │                                                   └─────────────────┘
        │                                                            │
        └────────────────────── 3. User Authenticated ◄──────────────┘
```

**Flow:**
1. User clicks login → Redirect to Teamified Portal with PKCE challenge
2. User authenticates → Portal redirects back with authorization code
3. Your app exchanges code for JWT → User is authenticated

## Configuration Constants

Replace these placeholders with your actual values:

```typescript
const TEAMIFIED_CONFIG = {
  // Provided by Teamified Portal admin
  CLIENT_ID: 'client_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  CLIENT_SECRET: 'your_client_secret_here', // BACKEND ONLY - never expose!
  REDIRECT_URI: 'https://your-app.com/auth/callback',
  
  // Teamified Portal endpoints
  PORTAL_BASE_URL: 'https://teamified-portal.example.com',
  AUTHORIZE_ENDPOINT: '/api/v1/sso/authorize',
  TOKEN_ENDPOINT: '/api/v1/sso/token',
  USER_ENDPOINT: '/api/v1/sso/me',
};
```

## Step 1: PKCE Helper Functions

PKCE provides additional security for public clients. Implement these helpers:

```typescript
// Generate a random code verifier
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Generate code challenge from verifier (SHA-256)
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Generate random state for CSRF protection
function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}
```

## Step 2: Login Initiation (Frontend)

Create a login handler that redirects to Teamified Portal:

```typescript
async function initiateLogin(intent?: 'client' | 'candidate' | 'both') {
  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Store for verification after callback
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('pkce_state', state);

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: TEAMIFIED_CONFIG.CLIENT_ID,
    redirect_uri: TEAMIFIED_CONFIG.REDIRECT_URI,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  // Optional: Add intent parameter to filter user types
  // - 'client': Only allow client organization users
  // - 'candidate': Only allow candidate users  
  // - 'both': Allow all users (default if omitted)
  if (intent && intent !== 'both') {
    params.append('intent', intent);
  }

  const authUrl = `${TEAMIFIED_CONFIG.PORTAL_BASE_URL}${TEAMIFIED_CONFIG.AUTHORIZE_ENDPOINT}?${params}`;
  
  // Redirect to Teamified Portal for authentication
  window.location.href = authUrl;
}
```

## Step 3: Callback Handler (Frontend + Backend)

### Option A: Frontend-Only Token Exchange (Public Client with PKCE)

For SPAs without a backend, exchange the code directly from frontend:

```typescript
async function handleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  const errorDescription = urlParams.get('error_description');

  // Handle errors from Portal
  if (error) {
    console.error('SSO Error:', error, errorDescription);
    // Handle specific errors
    if (error === 'access_denied') {
      // User type doesn't match intent - show appropriate message
      alert(errorDescription || 'Access denied');
    }
    return;
  }

  // Verify state to prevent CSRF attacks
  const savedState = sessionStorage.getItem('pkce_state');
  if (state !== savedState) {
    throw new Error('Invalid state - possible CSRF attack');
  }

  // Get stored code verifier
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }

  // Exchange code for tokens
  const response = await fetch(
    `${TEAMIFIED_CONFIG.PORTAL_BASE_URL}${TEAMIFIED_CONFIG.TOKEN_ENDPOINT}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        client_id: TEAMIFIED_CONFIG.CLIENT_ID,
        redirect_uri: TEAMIFIED_CONFIG.REDIRECT_URI,
        code_verifier: codeVerifier, // PKCE verification
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Token exchange failed');
  }

  const tokenData = await response.json();
  
  // Clean up session storage
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('pkce_state');

  // Store tokens and user data
  localStorage.setItem('access_token', tokenData.access_token);
  localStorage.setItem('refresh_token', tokenData.refresh_token);
  localStorage.setItem('user', JSON.stringify(tokenData.user));

  // Clean URL and redirect
  window.history.replaceState({}, '', '/');
  window.location.href = '/dashboard'; // Or your protected route
}
```

### Option B: Backend Token Exchange (Confidential Client)

For apps with a backend, exchange the code server-side (more secure):

**Backend Route (Node.js/Express example):**

```typescript
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/auth/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  // Handle OAuth errors
  if (error) {
    return res.redirect(`/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(error_description || '')}`);
  }

  if (!code) {
    return res.redirect('/login?error=missing_code');
  }

  try {
    // Exchange code for tokens (with client_secret)
    const tokenResponse = await axios.post(
      `${TEAMIFIED_CONFIG.PORTAL_BASE_URL}${TEAMIFIED_CONFIG.TOKEN_ENDPOINT}`,
      {
        grant_type: 'authorization_code',
        code: code,
        client_id: TEAMIFIED_CONFIG.CLIENT_ID,
        client_secret: TEAMIFIED_CONFIG.CLIENT_SECRET, // Server-side only!
        redirect_uri: TEAMIFIED_CONFIG.REDIRECT_URI,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );

    const { access_token, refresh_token, user } = tokenResponse.data;

    // Store in httpOnly cookie (recommended for security)
    res.cookie('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to app with user info
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.redirect('/login?error=authentication_failed');
  }
});

export default router;
```

## Step 4: Token Response Structure

The token endpoint returns:

```typescript
interface TokenResponse {
  access_token: string;      // JWT for API authentication
  token_type: 'Bearer';
  expires_in: number;        // Token lifetime in seconds (typically 3600)
  refresh_token: string;     // For obtaining new access tokens
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];         // e.g., ['candidate'], ['client_admin'], etc.
  };
}
```

## Step 5: Using the Access Token

Include the JWT in API requests to authenticated endpoints:

```typescript
// Create an axios instance with auth interceptor
const api = axios.create({
  baseURL: TEAMIFIED_CONFIG.PORTAL_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fetch current user profile
async function getCurrentUser() {
  const response = await api.get('/api/v1/sso/me');
  return response.data;
}
```

## Intent Parameter (User Type Filtering)

The `intent` parameter allows you to restrict which type of users can authenticate:

| Intent | Description | Use Case |
|--------|-------------|----------|
| `client` | Only client organization users | Client portals, admin dashboards |
| `candidate` | Only candidate users | Job seeker portals, candidate apps |
| `both` | All authenticated users | General apps (default if omitted) |

### Intent Security Model

1. **OAuth Client Default Intent**: Each registered OAuth client has a `default_intent` configured in Portal admin
2. **Runtime Intent**: The `intent` query parameter can only **narrow** access, never widen it
3. **Escalation Prevention**: If `default_intent='client'`, passing `intent='both'` is ignored
4. **Internal User Bypass**: Users with `super_admin` or `internal_*` roles bypass all intent restrictions and can access any application regardless of the configured intent

### Handling Intent Errors

When a user's type doesn't match the intent, Portal redirects with an OAuth error:

```
/auth/callback?error=access_denied&error_description=This+application+is+for+client+organizations+only...&state=xxx
```

Handle this in your callback:

```typescript
if (error === 'access_denied') {
  // Show user-friendly message based on error_description
  showError(errorDescription || 'You do not have access to this application');
}
```

## React Integration Example

Complete React hook for SSO authentication:

```typescript
// hooks/useTeamifiedAuth.ts
import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export function useTeamifiedAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (intent?: 'client' | 'candidate' | 'both') => {
    await initiateLogin(intent);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
}
```

## Callback Page Component (React)

```tsx
// pages/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleAuthCallback()
      .then(() => navigate('/dashboard'))
      .catch((err) => setError(err.message));
  }, [navigate]);

  if (error) {
    return (
      <div>
        <h2>Authentication Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Completing sign-in...</h2>
      <p>Please wait while we authenticate your session.</p>
    </div>
  );
}
```

## Login Button Component (React)

```tsx
// components/TeamifiedLoginButton.tsx
import { useTeamifiedAuth } from '../hooks/useTeamifiedAuth';

interface Props {
  intent?: 'client' | 'candidate' | 'both';
  children?: React.ReactNode;
}

export function TeamifiedLoginButton({ intent, children }: Props) {
  const { login } = useTeamifiedAuth();

  return (
    <button onClick={() => login(intent)}>
      {children || 'Sign in with Teamified'}
    </button>
  );
}
```

## Environment Variables

Set these in your application:

```bash
# Required
TEAMIFIED_CLIENT_ID=client_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TEAMIFIED_CLIENT_SECRET=your_secret_here  # Backend only!
TEAMIFIED_REDIRECT_URI=https://your-app.com/auth/callback
TEAMIFIED_PORTAL_URL=https://teamified-portal.example.com

# For frontend (Vite example - prefix with VITE_)
VITE_TEAMIFIED_CLIENT_ID=client_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TEAMIFIED_PORTAL_URL=https://teamified-portal.example.com
VITE_TEAMIFIED_REDIRECT_URI=https://your-app.com/auth/callback
```

## Security Checklist

- [ ] Never expose `client_secret` in frontend code
- [ ] Always use HTTPS in production
- [ ] Validate `state` parameter to prevent CSRF
- [ ] Store tokens securely (httpOnly cookies preferred)
- [ ] Handle token expiration gracefully
- [ ] Implement proper error handling for all OAuth errors
- [ ] Register your exact `redirect_uri` with Teamified Portal

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `invalid_redirect_uri` | Redirect URI doesn't match registered value | Verify exact URI match in Portal admin |
| `invalid_client` | Wrong client_id or client_secret | Check credentials |
| `invalid_grant` | Code expired or already used | Codes expire in 60 seconds, are single-use |
| `access_denied` | User type doesn't match intent | Handle gracefully, show appropriate message |
| CORS errors | Cross-origin issues | Portal allows all origins; check your setup |

## Support

For OAuth client registration or issues, contact your Teamified Portal administrator.

---

**Document Version**: 1.0  
**Last Updated**: November 2025  
**Compatible With**: Teamified Accounts SSO v1.x
