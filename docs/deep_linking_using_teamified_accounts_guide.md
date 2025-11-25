# Deep Linking Using Teamified Accounts

This guide explains how to implement session persistence and deep linking in your client application using Teamified SSO. With proper implementation, users can access any page in your app directly without being forced to re-authenticate if they already have an active session.

## Overview

Teamified SSO uses a JWT-based authentication system with:
- **Access tokens**: Short-lived (15 minutes) tokens for API authentication
- **Refresh tokens**: Long-lived (30 days) tokens for session renewal
- **48-hour inactivity timeout**: Sessions expire after 48 hours of no activity

## API Endpoints

### Base URL
```
Production: https://api.teamified.com
Development: [Your development URL]
```

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/sso/me` | GET | Validate session and get user info |
| `/api/v1/auth/refresh` | POST | Refresh expired access token |
| `/api/v1/sso/authorize` | GET | Initiate SSO authorization flow |
| `/api/v1/sso/token` | POST | Exchange auth code for tokens |

## Session Persistence Flow

When a user accesses a deep link (e.g., `/dashboard/reports` instead of your landing page):

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Accesses Deep Link                       │
│                   (e.g., /dashboard/reports)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Check for Stored Access Token                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
        Has Token               No Token
              │                       │
              ▼                       ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  Validate Token via     │   │  Redirect to SSO Login  │
│  GET /api/v1/sso/me     │   │  with returnUrl param   │
└───────────┬─────────────┘   └─────────────────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
  Valid          Invalid/Expired
    │               │
    ▼               ▼
┌───────────┐   ┌─────────────────────────┐
│  Proceed  │   │  Try Refresh Token      │
│  to Page  │   │  POST /api/v1/auth/     │
└───────────┘   │  refresh                │
                └───────────┬─────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
                  Success        Failed
                    │               │
                    ▼               ▼
             ┌───────────┐   ┌─────────────────┐
             │  Proceed  │   │  Redirect to    │
             │  to Page  │   │  SSO Login      │
             └───────────┘   └─────────────────┘
```

## Implementation Guide

### Step 1: Token Storage

Store tokens securely in your application:

```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'teamified_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'teamified_refresh_token';
  private static readonly EXPIRES_AT_KEY = 'teamified_expires_at';

  static saveTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, tokens.expiresAt.toString());
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    return Date.now() >= parseInt(expiresAt, 10);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }
}
```

### Step 2: Session Validation Service

Create a service to validate and refresh sessions:

```typescript
interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async validateSession(): Promise<UserInfo | null> {
    const accessToken = TokenStorage.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/sso/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 401) {
        return await this.tryRefreshToken();
      }

      return null;
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  private async tryRefreshToken(): Promise<UserInfo | null> {
    const refreshToken = TokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      TokenStorage.clearTokens();
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        TokenStorage.clearTokens();
        return null;
      }

      const data: RefreshResponse = await response.json();
      
      TokenStorage.saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });

      return await this.validateSession();
    } catch (error) {
      console.error('Token refresh failed:', error);
      TokenStorage.clearTokens();
      return null;
    }
  }

  redirectToLogin(returnUrl: string): void {
    const clientId = 'YOUR_CLIENT_ID';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const state = encodeURIComponent(returnUrl);
    
    window.location.href = 
      `${this.baseUrl}/api/v1/sso/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `state=${state}&` +
      `response_type=code`;
  }
}
```

### Step 3: Route Protection

Implement route protection that checks sessions on page load:

```typescript
class RouteGuard {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async checkAccess(): Promise<boolean> {
    const user = await this.authService.validateSession();
    
    if (user) {
      return true;
    }

    const currentPath = window.location.pathname + window.location.search;
    this.authService.redirectToLogin(currentPath);
    return false;
  }
}

async function initializeApp() {
  const authService = new AuthService('https://api.teamified.com');
  const guard = new RouteGuard(authService);
  
  const hasAccess = await guard.checkAccess();
  
  if (hasAccess) {
    renderApp();
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);
```

### Step 4: React Implementation Example

For React applications, create an auth context and hook:

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authService = new AuthService(import.meta.env.VITE_API_URL);
    
    async function checkSession() {
      const userInfo = await authService.validateSession();
      setUser(userInfo);
      setIsLoading(false);
      
      if (!userInfo) {
        const currentPath = window.location.pathname + window.location.search;
        authService.redirectToLogin(currentPath);
      }
    }
    
    checkSession();
  }, []);

  const logout = () => {
    TokenStorage.clearTokens();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}
```

### Step 5: Handle Auth Callback

After SSO login, handle the callback to exchange the auth code for tokens:

```typescript
async function handleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  if (!code) {
    console.error('No authorization code received');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/sso/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: 'YOUR_CLIENT_ID',
        client_secret: 'YOUR_CLIENT_SECRET',
        redirect_uri: window.location.origin + '/auth/callback',
      }),
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    const data = await response.json();
    
    TokenStorage.saveTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    });

    const returnUrl = state ? decodeURIComponent(state) : '/';
    window.location.href = returnUrl;
    
  } catch (error) {
    console.error('Auth callback failed:', error);
    window.location.href = '/login?error=auth_failed';
  }
}
```

## API Reference

### GET /api/v1/sso/me

Validates the access token and returns user information.

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["client_employee"]
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### POST /api/v1/auth/refresh

Refreshes an expired access token using a valid refresh token.

**Request Headers:**
```
Content-Type: application/json
User-Agent: <browser-user-agent>  # Captured for session tracking
```

**Note:** The backend automatically captures the client's IP address and User-Agent from the request for session security tracking. This information is used to detect suspicious activity (e.g., tokens used from different devices).

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**

The response also sets an `access_token` httpOnly cookie for browser-based SSO flows.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired refresh token"
}
```

## Session Timeouts

| Timeout Type | Duration | Behavior |
|--------------|----------|----------|
| Access Token | 15 minutes | Must refresh using refresh token |
| Refresh Token | 30 days | Must re-authenticate after expiry |
| Inactivity | 48 hours | Session expires if no activity |

## Token Rotation & Security

The Teamified API implements secure token rotation:

1. **Refresh Token Rotation**: Each time you refresh tokens, you receive a new refresh token. The old refresh token is immediately invalidated.
2. **Token Family Tracking**: All tokens from a single login session belong to a "token family". If a revoked token is reused (indicating potential theft), the entire token family is invalidated.
3. **Single-Use Tokens**: Refresh tokens are single-use. Attempting to reuse an old refresh token triggers security measures and revokes all related sessions.

### Handling Refresh Failures

When a refresh request fails with a 401 status, it could mean:
- The refresh token has already been used (rotation)
- The token family was revoked due to suspicious activity
- The 48-hour inactivity timeout was exceeded
- The 30-day absolute expiry was reached

**Recommended handling:**
```typescript
if (response.status === 401) {
  TokenStorage.clearTokens();
  redirectToLogin(currentPath);
}
```

## Security Best Practices

1. **Store tokens securely**: Use `localStorage` for web apps, secure storage for mobile apps
2. **Always use HTTPS**: Never transmit tokens over unencrypted connections
3. **Implement token rotation**: The API automatically rotates refresh tokens on each use
4. **Handle token reuse detection**: If you receive a "token reuse" error, clear all tokens and re-authenticate
5. **Clear tokens on logout**: Always clear stored tokens when the user logs out
6. **Set proper CORS**: Ensure your application's origin is registered with your OAuth client

## Troubleshooting

### "Unauthorized" on /sso/me

1. Check if the access token is present in the Authorization header
2. Verify the token hasn't expired (15-minute lifetime)
3. Try refreshing the token using /auth/refresh

### "Token reuse detected" error

This occurs when a refresh token is used more than once, indicating potential token theft:
1. Clear all stored tokens immediately
2. Redirect user to login
3. This is a security feature - do not attempt to bypass it

### "Session expired due to inactivity"

1. The user hasn't interacted with the system for 48+ hours
2. Redirect to login - this cannot be refreshed
3. This is expected behavior for security

## Complete Example: Next.js App Router

```typescript
// app/providers.tsx
'use client';

import { AuthProvider } from '@/lib/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/dashboard/[...slug]/page.tsx
'use client';

import { useAuth, ProtectedRoute } from '@/lib/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const { user } = useAuth();
  return <div>Welcome, {user?.firstName}!</div>;
}

// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { handleAuthCallback } from '@/lib/auth';

export default function AuthCallbackPage() {
  useEffect(() => {
    handleAuthCallback();
  }, []);

  return <div>Authenticating...</div>;
}
```

## Support

For integration support, contact the Teamified development team or refer to the [API documentation](/docs/api/api-documentation-guidelines.md).
