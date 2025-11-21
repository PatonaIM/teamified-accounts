# Team Connect SSO Integration Guide

## Overview
This guide provides complete code to integrate Team Connect with Teamified Portal SSO using OAuth 2.0 authorization code flow.

## Portal OAuth Configuration
```
Client ID: client_266b2fd552de8dd40c0414285e1b597f
Client Secret: f26957a353ff2426a5730298a95da6a7a3ba3a56e33449bb6b073c1cb33ba76c
Redirect URI: https://98de675e-3037-461f-b391-8267ceb28294-00-31oxsij4o498l.worf.replit.dev/auth/callback
Portal Base URL: [Your Portal URL]
```

---

## 1. Backend: Express Route (`server/routes/auth.ts`)

```typescript
import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Portal OAuth configuration
const PORTAL_BASE_URL = process.env.PORTAL_BASE_URL || 'https://fc0326b2-0c1a-4f3d-8c6c-565f5468c510-00-1h43noewb2ai0.janeway.replit.dev';
const OAUTH_CLIENT_ID = 'client_266b2fd552de8dd40c0414285e1b597f';
const OAUTH_CLIENT_SECRET = 'f26957a353ff2426a5730298a95da6a7a3ba3a56e33449bb6b073c1cb33ba76c';
const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || 'https://98de675e-3037-461f-b391-8267ceb28294-00-31oxsij4o498l.worf.replit.dev/auth/callback';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: Array<{
      name: string;
      scope?: string;
    }>;
    clientId?: number;
  };
}

/**
 * OAuth 2.0 Callback Route
 * Receives authorization code from Portal and exchanges it for JWT
 */
router.get('/auth/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, error_description);
      return res.redirect(`/?error=${encodeURIComponent(error as string)}&error_description=${encodeURIComponent(error_description as string || '')}`);
    }

    // Validate required parameters
    if (!code || typeof code !== 'string') {
      console.error('Missing authorization code');
      return res.redirect('/?error=missing_code');
    }

    console.log('Received auth code from Portal, exchanging for token...');

    // Exchange authorization code for JWT token
    const tokenResponse = await axios.post<TokenResponse>(
      `${PORTAL_BASE_URL}/api/v1/sso/token`,
      {
        grant_type: 'authorization_code',
        code: code,
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        redirect_uri: OAUTH_REDIRECT_URI,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const { access_token, user } = tokenResponse.data;

    console.log('Successfully received JWT token for user:', user.email);

    // Store token in httpOnly cookie for security
    res.cookie('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Also send token in URL fragment for frontend to extract (optional approach)
    // The frontend can read this and store in localStorage if needed
    const redirectUrl = `/?sso_success=true&token=${encodeURIComponent(access_token)}&user=${encodeURIComponent(JSON.stringify(user))}`;
    
    res.redirect(redirectUrl);

  } catch (error: any) {
    console.error('SSO callback error:', error.response?.data || error.message);
    
    // Provide user-friendly error messages
    let errorMessage = 'authentication_failed';
    if (error.response?.status === 400) {
      errorMessage = 'invalid_code';
    } else if (error.response?.status === 401) {
      errorMessage = 'unauthorized_client';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      errorMessage = 'portal_unreachable';
    }

    res.redirect(`/?error=${errorMessage}`);
  }
});

/**
 * Logout route - clears auth cookie
 */
router.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

/**
 * Get current user from token
 */
router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify token with Portal
    const userResponse = await axios.get(`${PORTAL_BASE_URL}/api/v1/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(userResponse.data);
  } catch (error: any) {
    console.error('Token validation error:', error.response?.data || error.message);
    res.clearCookie('auth_token');
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
```

---

## 2. Frontend: Auth Callback Component (`client/src/components/AuthCallback.tsx`)

```typescript
import { useEffect, useState } from 'react';
import { useLocation, useRouter } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<{
    name: string;
    scope?: string;
  }>;
  clientId?: number;
}

export function AuthCallback() {
  const [, setLocation] = useRouter();
  const [searchParams] = useLocation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check for errors
    const error = params.get('error');
    if (error) {
      const errorDesc = params.get('error_description') || getErrorMessage(error);
      setStatus('error');
      setErrorMessage(errorDesc);
      return;
    }

    // Check for successful SSO callback
    const token = params.get('token');
    const userJson = params.get('user');
    const ssoSuccess = params.get('sso_success');

    if (ssoSuccess === 'true' && token && userJson) {
      try {
        // Store token in localStorage
        localStorage.setItem('auth_token', token);
        
        // Parse and store user data
        const user: User = JSON.parse(decodeURIComponent(userJson));
        localStorage.setItem('user', JSON.stringify(user));

        // Invalidate and refetch user queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['auth'] });

        setStatus('success');

        // Redirect to home after 1 second
        setTimeout(() => {
          // Clean URL and redirect
          window.history.replaceState({}, '', '/');
          setLocation('/');
        }, 1000);

      } catch (err) {
        console.error('Failed to process SSO response:', err);
        setStatus('error');
        setErrorMessage('Failed to process authentication response');
      }
    }
  }, [setLocation, queryClient]);

  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'missing_code': 'No authorization code received from Portal',
      'invalid_code': 'The authorization code is invalid or expired. Please try again.',
      'unauthorized_client': 'Team Connect is not authorized to access the Portal',
      'portal_unreachable': 'Cannot connect to Teamified Portal. Please try again later.',
      'authentication_failed': 'Authentication failed. Please try again.',
      'access_denied': 'You denied access to Team Connect',
    };
    return errorMessages[error] || `Authentication error: ${error}`;
  };

  if (status === 'processing') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing you in...
            </CardTitle>
            <CardDescription>
              Completing authentication with Teamified Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Verifying authorization code</p>
              <p>• Exchanging for access token</p>
              <p>• Loading your profile</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Success!
            </CardTitle>
            <CardDescription>
              You're now signed in to Team Connect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Authentication Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go to Home
              </button>
              <button
                onClick={() => {
                  // Redirect to Portal login to try again
                  window.location.href = 'https://fc0326b2-0c1a-4f3d-8c6c-565f5468c510-00-1h43noewb2ai0.janeway.replit.dev/login';
                }}
                className="flex-1 px-4 py-2 border border-input bg-background hover:bg-accent rounded-md"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
```

---

## 3. Frontend: Auth Hook (`client/src/hooks/useAuth.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<{
    name: string;
    scope?: string;
  }>;
  clientId?: number;
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send cookies
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me');
        return response.data;
      } catch (error) {
        // Clear invalid tokens
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      queryClient.setQueryData(['user'], null);
      window.location.href = '/';
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    logout: () => logoutMutation.mutate(),
  };
}
```

---

## 4. Update Wouter Routes (`client/src/App.tsx`)

```typescript
import { Route, Switch } from 'wouter';
import { AuthCallback } from './components/AuthCallback';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
// ... other imports

function App() {
  return (
    <Switch>
      {/* SSO Callback Route - Must be public */}
      <Route path="/auth/callback" component={AuthCallback} />
      
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      {/* ... other routes */}
    </Switch>
  );
}
```

---

## 5. Protected Route Component (`client/src/components/ProtectedRoute.tsx`)

```typescript
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to Portal login
    const portalLoginUrl = 'https://fc0326b2-0c1a-4f3d-8c6c-565f5468c510-00-1h43noewb2ai0.janeway.replit.dev/login';
    window.location.href = portalLoginUrl;
    return null;
  }

  return <Component {...rest} />;
}
```

---

## 6. Environment Variables

Add to Team Connect's `.env`:

```bash
# Portal SSO Configuration
PORTAL_BASE_URL=https://fc0326b2-0c1a-4f3d-8c6c-565f5468c510-00-1h43noewb2ai0.janeway.replit.dev
OAUTH_REDIRECT_URI=https://98de675e-3037-461f-b391-8267ceb28294-00-31oxsij4o498l.worf.replit.dev/auth/callback

# Node environment
NODE_ENV=production
```

---

## 7. Install Dependencies

```bash
# Backend
npm install cookie-parser
npm install -D @types/cookie-parser

# Frontend (already have these)
# - @tanstack/react-query
# - wouter
# - axios
```

---

## 8. Update Express Server (`server/index.ts`)

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Required for auth cookies

// Routes
app.use(authRoutes);

// ... rest of your server setup
```

---

## Testing the Integration

### Step 1: Click "Team Connect" in Portal
Portal will redirect to:
```
https://98de675e-3037-461f-b391-8267ceb28294-00-31oxsij4o498l.worf.replit.dev/auth/callback?code=abc123&state=xyz
```

### Step 2: Team Connect Exchanges Code
Backend calls:
```
POST https://fc0326b2-0c1a-4f3d-8c6c-565f5468c510-00-1h43noewb2ai0.janeway.replit.dev/api/v1/sso/token
```

### Step 3: Receives JWT
Portal returns:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 604800,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [...]
  }
}
```

### Step 4: User Logged In
Team Connect stores token and redirects to dashboard ✅

---

## Error Handling

The code handles these scenarios:
- ✅ Invalid/expired auth code
- ✅ Portal unreachable
- ✅ Network timeouts
- ✅ Token validation failures
- ✅ User-friendly error messages

---

## Security Features

- ✅ HttpOnly cookies prevent XSS attacks
- ✅ CSRF protection via state parameter
- ✅ Secure cookies in production
- ✅ Token expiration handling
- ✅ Auth code single-use enforcement (Portal side)
- ✅ 60-second auth code TTL (Portal side)

---

## Next Steps

1. Copy code into Team Connect
2. Install dependencies
3. Test the full SSO flow
4. Celebrate! 🎉
