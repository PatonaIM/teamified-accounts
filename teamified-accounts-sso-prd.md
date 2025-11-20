# Teamified Accounts SSO - Product Requirements Document

## Document Information

- **Document Version:** 1.0
- **Last Updated:** November 14, 2025
- **Status:** Implemented
- **Owner:** Engineering Team
- **Stakeholders:** Product, Engineering, Security

## 1. Executive Summary

### 1.1 Purpose

The Teamified Accounts SSO (Single Sign-On) system provides secure, seamless authentication across multiple Teamified internal applications using the Teamified Portal as the central Identity Provider (IdP). This eliminates the need for users to log in separately to each application, improving user experience while maintaining enterprise-grade security.

### 1.2 Problem Statement

Internal Teamified applications previously required separate authentication flows, leading to:

- Poor user experience with multiple login prompts
- Increased credential management overhead
- Inconsistent security policies across applications
- Fragmented user session management
- Duplicated authentication code across applications

### 1.3 Solution Overview

The Teamified Accounts SSO implements OAuth 2.0 Authorization Code Flow with PKCE support, enabling:

- Single sign-on across all Teamified applications
- Centralized user authentication and authorization
- Role-based access control (RBAC) from Portal database
- Secure token exchange with JWT-based authentication
- Standardized authentication library (@teamified/sso package)

## 2. Goals & Objectives

### 2.1 Business Goals

- **Improve User Experience:** Reduce authentication friction for internal users
- **Enhance Security:** Centralize authentication policies and token management
- **Reduce Development Time:** Provide reusable SSO integration package
- **Enable Multi-App Ecosystem:** Support seamless navigation between Teamified applications
- **Maintain Compliance:** Implement industry-standard OAuth 2.0 security practices

### 2.2 Success Metrics

- **Authentication Time:** < 2 seconds for SSO login after initial authentication
- **Security:** 0 security incidents related to token exposure or session hijacking
- **Developer Experience:** < 1 hour to integrate SSO into new application using shared package
- **User Satisfaction:** 90%+ users prefer SSO over separate login
- **Uptime:** 99.9% availability for SSO endpoints

### 2.3 Non-Goals

- ❌ Public-facing consumer authentication (B2C)
- ❌ Multi-factor authentication (MFA) implementation (handled by Supabase/Google OAuth)
- ❌ Social login providers beyond Google
- ❌ SAML or other enterprise federation protocols
- ❌ Password-based authentication (delegated to Supabase)
- ❌ Confidential OAuth clients with client secrets

### 2.4 Architectural Decision: PKCE-Only Public Clients

**Decision:** All OAuth clients are now public clients using PKCE exclusively. Client secrets are no longer generated or supported.

**Rationale:**

- **Browser-Based Security:** All Teamified applications are browser-based SPAs (Single Page Applications). Client secrets cannot be securely stored in browser environments as they would be exposed in JavaScript source code.
- **PKCE Equivalence:** PKCE (Proof Key for Code Exchange) provides equivalent security to client secrets by cryptographically binding the authorization request to the token request through a dynamically generated code verifier.
- **Reduced Attack Surface:** Eliminating client secrets removes the risk of secret exposure, rotation complexity, and secret management overhead.
- **Industry Best Practice:** OAuth 2.1 (upcoming standard) mandates PKCE for all OAuth flows and deprecates client secrets for public clients.
- **Simplified Developer Experience:** No need to securely store or rotate secrets - just implement PKCE code generation.

**Impact:**

- All new OAuth clients created through the system are public clients (is_public: true, client_secret: null)
- Secret regeneration endpoint throws an error explaining PKCE-only architecture
- Frontend UI removed all secret display, generation, and management functionality
- Existing clients migrated to public client architecture
- Integration documentation updated to reflect PKCE-only flow

**Migration:** All existing OAuth clients (Candidate Portal, HRIS Portal, ATS Portal) have been converted to public clients and must use PKCE in their authorization flows.

## 3. Architecture Overview

### 3.1 System Components

```
┌──────────────────────────────────────────────────────────────┐
│              Teamified Portal (Identity Provider)             │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐    │
│  │  Supabase  │  │   OAuth    │  │   User Database     │    │
│  │    Auth    │  │  Endpoints │  │   + RBAC Roles      │    │
│  │  (Google)  │  │            │  │                     │    │
│  └────────────┘  └────────────┘  └─────────────────────┘    │
│       │                 │                 │                  │
│       │                 │                 │                  │
└───────┼─────────────────┼─────────────────┼──────────────────┘
        │                 │                 │
        │ 1. Google OAuth │ 2. SSO Launch  │ 3. Token Exchange
        │                 │                 │
        ▼                 ▼                 ▼
┌────────────┐    ┌────────────┐    ┌────────────┐
│ Team       │    │  Internal  │    │  Internal  │
│ Connect    │    │   App 2    │    │   App 3    │
│            │    │  (Future)  │    │  (Future)  │
└────────────┘    └────────────┘    └────────────┘
```

### 3.2 Technology Stack

**Identity Provider (Portal):**
- NestJS backend
- TypeORM + PostgreSQL
- JWT (jsonwebtoken)
- OAuth 2.0 implementation
- Supabase Auth (Google OAuth)

**SSO Client Applications:**
- @teamified/sso shared package
- React/Vite frontend
- Axios HTTP client
- Multiple storage strategies (localStorage, sessionStorage, memory)

**Security:**
- OAuth 2.0 Authorization Code Flow
- PKCE (Proof Key for Code Exchange)
- JWT with RS256 signing
- HttpOnly cookies (optional)
- CSRF protection via state parameter

## 4. OAuth 2.0 Flow Implementation

### 4.1 Standard OAuth 2.0 Flow with PKCE

The Portal implements OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange):

```
┌──────────┐                                       ┌──────────┐
│   User   │                                       │  Portal  │
│          │                                       │   (IdP)  │
└─────┬────┘                                       └────┬─────┘
      │                                                 │
      │ 1. Click "Login" in SSO App                    │
      │    Generate code_verifier + code_challenge     │
      │────────────────────────────────────────────────▶│
      │                                                 │
      │ 2. Redirect to /api/v1/sso/authorize           │
      │◀────────────────────────────────────────────────│
      │    ?client_id=xxx&redirect_uri=yyy&state=zzz   │
      │    &code_challenge=...&code_challenge_method=S256│
      │                                                 │
      │ 3. User not authenticated?                     │
      │    Redirect to /login?returnUrl=...            │
      │◀────────────────────────────────────────────────│
      │                                                 │
      │ 4. User enters credentials (Google OAuth)      │
      │────────────────────────────────────────────────▶│
      │                                                 │
      │ 5. After login, return to authorize endpoint   │
      │────────────────────────────────────────────────▶│
      │                                                 │
      │ 6. Generate auth code (60s TTL, single-use)    │
      │    Store code_challenge for verification       │
      │    Redirect to SSO App callback                │
      │◀────────────────────────────────────────────────│
      │    ?code=abc123&state=zzz                      │
      │                                                 │
┌─────▼────┐                                       ┌────┴─────┐
│ SSO App  │                                       │  Portal  │
└─────┬────┘                                       └────┬─────┘
      │                                                 │
      │ 7. POST /api/v1/sso/token                      │
      │    { code, client_id, code_verifier, ... }     │
      │────────────────────────────────────────────────▶│
      │                                                 │
      │ 8. Verify code_challenge matches code_verifier │
      │    Return JWT + user data                      │
      │    { access_token, refresh_token, user: {...} }│
      │◀────────────────────────────────────────────────│
      │                                                 │
      │ 9. Store JWT, redirect to dashboard            │
      │                                                 │
      ▼                                                 │
   ✅ User logged in                                   │
```

### 4.2 Portal-Initiated SSO Flow (Simplified)

For Portal-to-App navigation, a simplified launch endpoint automatically handles redirect URI selection:

```
User in Portal → Click "Team Connect" → Portal generates auth code 
→ Redirect to Team Connect with code → Auto token exchange → Logged in
```

### 4.3 PKCE Flow for Public Clients

Public clients (browser-based apps) use PKCE instead of client secrets:

1. Client generates `code_verifier` (random string)
2. Client creates `code_challenge = SHA256(code_verifier)`
3. Client sends `code_challenge` in authorization request
4. Portal stores `code_challenge` with auth code
5. Client sends `code_verifier` during token exchange
6. Portal validates `SHA256(code_verifier) == code_challenge`

## 5. API Specifications

### 5.1 SSO Launch Endpoint (Recommended for Portal-Initiated SSO)

**Endpoint:** `GET /api/v1/sso/launch/:clientId`

**Authentication:** Required (JWT)

**Purpose:** Simplified SSO initiation with automatic redirect URI selection

**Parameters:**
- `clientId` (path): OAuth client ID (e.g., `client_abc123`)

**Response:**
```json
{
  "redirectUrl": "https://team-connect.repl.co/auth/callback?code=xyz789&state=abc-123"
}
```

**Flow:**
1. Validates user session
2. Validates OAuth client exists and is active
3. Selects first registered redirect URI
4. Generates CSRF state parameter
5. Creates auth code (60s TTL, single-use)
6. Returns redirect URL for frontend navigation

**Frontend Usage:**
```javascript
const response = await fetch('/api/v1/sso/launch/client_abc123', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { redirectUrl } = await response.json();
window.location.href = redirectUrl; // Navigate to SSO app
```

### 5.2 Authorization Endpoint (Standard OAuth 2.0)

**Endpoint:** `GET /api/v1/sso/authorize`

**Authentication:** Optional (public endpoint)

**Purpose:** Standard OAuth 2.0 authorization endpoint for app-initiated SSO

**Query Parameters:**
- `client_id` (required): OAuth client ID
- `redirect_uri` (required): Callback URL (must match registered URI)
- `response_type` (required): Must be "code"
- `state` (recommended): CSRF protection token
- `code_challenge` (required): PKCE code challenge (SHA256 hash)
- `code_challenge_method` (required): PKCE method (must be "S256")

**Response:**
- If authenticated: `302 Redirect to redirect_uri?code=xyz&state=abc`
- If not authenticated: `302 Redirect to /login?returnUrl=/api/v1/sso/authorize?...`

**Behavior:**
- Checks for valid JWT in Authorization header or cookie
- If not authenticated, redirects to Portal login with return URL
- After login, returns to authorize endpoint
- Validates OAuth client and redirect URI
- Requires PKCE code_challenge (mandatory for all clients)
- Generates auth code and redirects to SSO app

**Example Request:**
```
GET /api/v1/sso/authorize?client_id=client_abc123
    &redirect_uri=https://team-connect.repl.co/auth/callback
    &response_type=code
    &state=random-uuid-123
    &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
    &code_challenge_method=S256
```

### 5.3 Token Exchange Endpoint

**Endpoint:** `POST /api/v1/sso/token`

**Authentication:** None (uses PKCE verification)

**Purpose:** Exchange authorization code for JWT access token

**Request Body:**
```json
{
  "grant_type": "authorization_code",
  "code": "auth_code_xyz789",
  "client_id": "client_abc123",
  "redirect_uri": "https://team-connect.repl.co/auth/callback",
  "code_verifier": "random-string-for-pkce"
}
```

**Field Requirements:**
- `grant_type`: Must be "authorization_code"
- `code`: Authorization code from authorize endpoint
- `client_id`: OAuth client ID
- `redirect_uri`: Must match URI used in authorization request
- `code_verifier`: Required (PKCE verification)
- `client_secret`: NOT SUPPORTED - will be rejected

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_xyz",
  "user": {
    "id": "uuid-123",
    "email": "user@teamified.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["EOR", "admin"],
    "clientId": "uuid-456"
  }
}
```

**Validation:**
- Validates `grant_type` is "authorization_code"
- Retrieves and validates auth code (must not be expired or used)
- Validates PKCE `code_verifier` matches stored `code_challenge`
- Verifies `client_id` matches auth code
- Verifies `redirect_uri` matches auth code
- Marks auth code as consumed (single-use enforcement)
- Generates JWT access token and refresh token
- Returns token with user profile and roles

**Error Responses:**
- `400 Bad Request`: Invalid grant_type, missing required fields, client_secret provided
- `401 Unauthorized`: Invalid code, expired code, PKCE validation failure

### 5.4 Token Validation Endpoint

**Endpoint:** `GET /api/v1/sso/validate`

**Authentication:** Required (JWT)

**Purpose:** Validate access token and return user information

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "uuid-123",
    "email": "user@teamified.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "https://...",
    "secondaryEmail": "john.doe@personal.com"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

## 6. OAuth Client Management

### 6.1 OAuth Client Entity

**Database Table:** `oauth_clients`

**Fields:**
```typescript
{
  id: string;                    // UUID primary key
  client_id: string;             // Unique, auto-generated (client_xxx)
  client_secret: string | null;  // Always null for PKCE-only architecture
  name: string;                  // Display name (e.g., "Team Connect")
  description: string;           // Purpose/description
  redirect_uris: string[];       // Allowed callback URLs
  is_active: boolean;            // Enable/disable client
  metadata: {
    owner?: string;              // Owner/maintainer
    environment?: string;        // dev | staging | production
    is_public: true;             // Always true (PKCE-only)
  };
  created_at: Date;              // Creation timestamp
  updated_at: Date;              // Last update timestamp
  created_by: string;            // Admin user UUID
}
```

### 6.2 Client Registration

OAuth clients are registered via Portal Admin UI:

1. Navigate to Settings → OAuth Clients (SSO Apps)
2. Click "Add New OAuth Client"
3. Fill in details:
   - Name: Application name
   - Description: Purpose
   - Redirect URI: Callback URL
   - Environment: dev/staging/production
4. Save and receive `client_id`

**Security Notes:**
- All clients are public clients using PKCE
- No client secrets are generated
- PKCE is mandatory for all authorization flows
- Redirect URIs are strictly validated during authorization

## 7. Security Features

### 7.1 Authorization Code Security

**60-Second Time-to-Live (TTL):**
- Auth codes expire after 60 seconds
- Prevents replay attacks
- Forces immediate token exchange

**Single-Use Enforcement:**
- Each auth code can only be exchanged once
- Subsequent attempts return 401 Unauthorized
- Prevents code interception attacks

**Storage:** In-memory Redis cache with automatic expiration

### 7.2 CSRF Protection

**State Parameter:**
- Client generates random state (UUID recommended)
- State included in authorization URL
- Portal returns state in callback
- Client validates state matches original
- Prevents CSRF attacks during authorization

**Implementation:**
```javascript
// Client generates state
const state = crypto.randomUUID();
sessionStorage.setItem('oauth_state', state);

// Portal returns state in callback
const receivedState = searchParams.get('state');
const expectedState = sessionStorage.getItem('oauth_state');
if (receivedState !== expectedState) {
  throw new Error('CSRF validation failed');
}
```

### 7.3 PKCE for All Clients

**Purpose:** Secure browser-based apps without client secrets

**Flow:**
1. Generate `code_verifier`: 43-128 character random string
2. Create `code_challenge`: base64url(SHA256(code_verifier))
3. Send `code_challenge` in authorization request
4. Send `code_verifier` in token exchange
5. Portal validates: `SHA256(code_verifier) == code_challenge`

**Enforcement:**
- All clients MUST use PKCE
- Client secrets are NOT supported
- Portal rejects requests without PKCE
- Portal rejects requests with client_secret

**Implementation:**
```javascript
// Generate PKCE values
function generatePKCE() {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

const { verifier, challenge } = generatePKCE();
sessionStorage.setItem('pkce_verifier', verifier);

// Authorization request
const authUrl = `/api/v1/sso/authorize?code_challenge=${challenge}&code_challenge_method=S256&...`;

// Token exchange
await axios.post('/api/v1/sso/token', {
  code_verifier: sessionStorage.getItem('pkce_verifier'),
  ...
});
```

### 7.4 Redirect URI Validation

**Strict Matching:**
- Redirect URI in token exchange must exactly match authorization request
- Redirect URI must be pre-registered in OAuth client configuration
- No wildcard or pattern matching allowed
- Prevents authorization code interception

**Example:**
```javascript
// Registered redirect URIs
redirect_uris: [
  'https://team-connect.repl.co/auth/callback',
  'http://localhost:5173/auth/callback' // Dev only
]

// ✅ Valid: Exact match
redirect_uri: 'https://team-connect.repl.co/auth/callback'

// ❌ Invalid: Different path
redirect_uri: 'https://team-connect.repl.co/different/path'

// ❌ Invalid: Different domain
redirect_uri: 'https://malicious-site.com/auth/callback'
```

### 7.5 JWT Token Security

**Signing Algorithm:** RS256 (RSA + SHA256)
- Asymmetric key pair (public/private)
- Private key stored securely on Portal
- Public key can be shared for verification
- Prevents token forgery

**Token Claims:**
```json
{
  "sub": "user-uuid-123",           // User ID
  "email": "user@teamified.com",    // User email
  "roles": ["EOR", "admin"],        // User roles
  "clientId": "client-uuid",        // User's client (company)
  "iat": 1699999999,                // Issued at timestamp
  "exp": 1699999999,                // Expiration (1 hour)
  "aud": "Team Connect"             // Audience (app name)
}
```

**Access Token Expiration:** 1 hour (3600 seconds)

**Refresh Token:**
- Long-lived token for obtaining new access tokens
- Stored with token family for rotation
- Not yet fully implemented for SSO apps

### 7.6 Rate Limiting

**Token Exchange Endpoint:**
- 20 requests per 60 seconds per IP
- Prevents brute force attacks
- Uses @nestjs/throttler

**Other Endpoints:** Standard Portal rate limits apply

### 7.7 Audit Logging

**Events Logged:**
- SSO authorization requests
- Auth code generation
- Token exchange requests (success/failure)
- Invalid client credentials
- Expired/reused auth codes
- PKCE validation failures

**Log Details:**
- User ID
- OAuth client ID
- Timestamp
- IP address
- Success/failure status
- Error details (if applicable)

## 8. Shared SSO Package (@teamified/sso)

### 8.1 Purpose

Eliminate code duplication and provide consistent SSO integration across all Teamified applications.

### 8.2 Features

- ✅ Pre-configured Supabase client for Google OAuth
- ✅ Automatic token exchange with Portal
- ✅ Multiple secure storage strategies
- ✅ TypeScript support with type definitions
- ✅ Simple, consistent API
- ✅ Session management helpers

### 8.3 Installation

```bash
npm install @teamified/sso @supabase/supabase-js axios
```

### 8.4 Basic Usage

```typescript
import { createTeamifiedAuth, SessionStorageStrategy } from '@teamified/sso';

// Initialize auth client
const auth = createTeamifiedAuth({
  supabaseUrl: process.env.VITE_SUPABASE_URL!,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY!,
  portalApiUrl: process.env.VITE_PORTAL_API_URL!,
  tokenStorage: new SessionStorageStrategy(), // Recommended
});

// Login with Google
await auth.signInWithGoogle();

// Handle OAuth callback
await auth.handleCallback(); // Exchanges Supabase token for Portal JWT

// Get current user
const user = await auth.getCurrentUser(); // Returns user with roles

// Sign out
await auth.signOut();
```

### 8.5 Storage Strategies

**LocalStorageStrategy (Default):**
- Persists across page refreshes
- Vulnerable to XSS attacks
- Use for: Development, low-security apps

**SessionStorageStrategy (Recommended):**
- Cleared when tab closes
- More secure than localStorage
- Re-authentication via Supabase session on page refresh
- Use for: Most production apps

**MemoryStorageStrategy (Highest Security):**
- Only in memory, lost on page refresh
- No XSS vulnerability
- User must re-authenticate on refresh
- Use for: High-security apps, admin panels

### 8.6 API Reference

**Methods:**
- `signInWithGoogle()`: Initiates Google OAuth via Supabase
- `handleCallback()`: Processes OAuth callback, exchanges tokens
- `isAuthenticated()`: Checks for valid Supabase session
- `getCurrentUser()`: Fetches user from Portal API with roles
- `signOut()`: Signs out from Supabase and clears tokens
- `getSession()`: Gets current Supabase session

**Types:**
```typescript
interface TeamifiedAuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  portalApiUrl: string;
  tokenStorage?: TokenStorageStrategy;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  clientId?: string;
}
```

## 9. Integration Guide for New Applications

### 9.1 Quick Start (Using OAuth 2.0 Flow with PKCE)

**Step 1: Register OAuth Client in Portal**
1. Login to Portal as admin
2. Navigate to Settings → OAuth Clients
3. Create new client with app's callback URL
4. Save `client_id` (no client secret needed)

**Step 2: Add Environment Variables**
```env
VITE_PORTAL_API_URL=https://portal.teamified.com/api
VITE_OAUTH_CLIENT_ID=client_abc123
```

**Step 3: Create Auth Service with PKCE**
```typescript
// src/services/authService.ts
import axios from 'axios';
import crypto from 'crypto';

function generatePKCE() {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(
    crypto.createHash('sha256').update(verifier).digest()
  );
  return { verifier, challenge };
}

export const authService = {
  async initiateLogin() {
    const { verifier, challenge } = generatePKCE();
    sessionStorage.setItem('pkce_verifier', verifier);
    
    const authUrl = new URL(`${process.env.VITE_PORTAL_API_URL}/v1/sso/authorize`);
    authUrl.searchParams.set('client_id', process.env.VITE_OAUTH_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', crypto.randomUUID());
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    
    window.location.href = authUrl.toString();
  },

  async exchangeCodeForToken(code: string, redirectUri: string) {
    const response = await axios.post(
      `${process.env.VITE_PORTAL_API_URL}/v1/sso/token`,
      {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.VITE_OAUTH_CLIENT_ID,
        redirect_uri: redirectUri,
        code_verifier: sessionStorage.getItem('pkce_verifier'),
      }
    );
    return response.data;
  },
  
  storeTokens(tokenData) {
    sessionStorage.setItem('access_token', tokenData.access_token);
    sessionStorage.setItem('user', JSON.stringify(tokenData.user));
  },
  
  getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated() {
    return !!sessionStorage.getItem('access_token');
  },
};
```

**Step 4: Create Auth Callback Handler**
```typescript
// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      authService
        .exchangeCodeForToken(code, `${window.location.origin}/auth/callback`)
        .then((data) => {
          authService.storeTokens(data);
          navigate('/dashboard');
        })
        .catch(() => navigate('/login'));
    }
  }, [searchParams, navigate]);

  return <div>Completing sign-in...</div>;
}
```

**Step 5: Add Routes**
```typescript
// src/App.tsx
<Routes>
  <Route path="/auth/callback" element={<AuthCallback />} />
  <Route path="/dashboard" element={<Dashboard />} />
</Routes>
```

**Step 6: Test SSO**
1. Login to Portal
2. Click navigation link to your app
3. App receives auth code and exchanges for token using PKCE
4. User logged in automatically ✅

## 10. Frontend Portal Integration

### 10.1 SSO Launch Button

Portal frontend includes navigation to SSO-enabled apps:

```typescript
// frontend/src/components/Navigation.tsx
<button onClick={() => launchSSOApp('client_abc123')}>
  Team Connect
</button>

async function launchSSOApp(clientId: string) {
  const response = await fetch(`/api/v1/sso/launch/${clientId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const { redirectUrl } = await response.json();
  window.location.href = redirectUrl; // Navigate to SSO app
}
```

### 10.2 Super Admin OAuth Client Management Interface

- **Access Control:** Super Admin role only
- **Location:** Portal Settings → OAuth Clients (SSO Apps) tab
- **Purpose:** Provide super admins with a centralized interface to register, configure, and manage OAuth 2.0 client applications for SSO integration.
- **Note:** With PKCE-only architecture, the UI has been simplified to remove all client secret management functionality.

## 11. Error Handling

### 11.1 Authorization Errors

**Missing Authorization Code:**
- Cause: OAuth callback without code parameter
- Response: Redirect to login with error message
- User Action: Try login again

**Invalid/Expired Auth Code:**
- Cause: Code used after 60 seconds or already consumed
- Response: 401 Unauthorized with error message
- User Action: Restart SSO flow

**Missing PKCE Parameters:**
- Cause: Authorization request without code_challenge
- Response: 400 Bad Request
- Developer Action: Implement PKCE code generation

**Redirect URI Mismatch:**
- Cause: redirect_uri doesn't match registered URI
- Response: 400 Bad Request
- Developer Action: Update redirect URI in Portal admin

**PKCE Validation Failure:**
- Cause: code_verifier doesn't match code_challenge
- Response: 401 Unauthorized
- Developer Action: Ensure PKCE implementation is correct

### 11.2 Token Exchange Errors

**Unsupported Grant Type:**
- Response: 400 Bad Request: Unsupported grant_type
- Fix: Ensure grant_type is "authorization_code"

**Client Secret Provided:**
- Response: 400 Bad Request: Client secrets not supported (PKCE-only architecture)
- Fix: Remove client_secret from request, use code_verifier instead

**Client Not Active:**
- Response: 401 Unauthorized: Client is not active
- Fix: Admin must activate OAuth client in Portal

**User Not Found:**
- Response: 401 Unauthorized: User not found
- Fix: Rare case, contact support

## 12. Testing & Quality Assurance

### 12.1 Manual Testing Scenarios

**Test 1: Portal-to-App SSO with PKCE**
1. Login to Portal
2. Click app link in navigation
3. Expected: Redirect to app with auth code
4. Expected: App exchanges code for JWT using PKCE
5. Expected: User logged into app automatically

**Test 2: PKCE Validation**
1. Public client generates code_challenge
2. Request authorization with code_challenge
3. Exchange code with correct code_verifier
4. Expected: Success
5. Exchange code with incorrect code_verifier
6. Expected: 401 Unauthorized: Invalid code_verifier

**Test 3: Client Secret Rejection**
1. Attempt token exchange with client_secret
2. Expected: 400 Bad Request: Client secrets not supported

**Test 4: Auth Code Expiration**
1. Initiate SSO flow
2. Wait 61 seconds
3. Attempt token exchange
4. Expected: 401 Unauthorized: Invalid or expired authorization code

**Test 5: Auth Code Reuse**
1. Exchange auth code for token (success)
2. Attempt to exchange same code again
3. Expected: 401 Unauthorized: Invalid or expired authorization code

## 13. Security Considerations

### 13.1 PKCE-Only Architecture Benefits

**Enhanced Security:**
- ✅ No client secrets to secure or rotate
- ✅ Cryptographically bound authorization and token requests
- ✅ Protection against code interception attacks
- ✅ Reduced attack surface (no secret leakage)
- ✅ Aligned with OAuth 2.1 best practices

**Developer Experience:**
- ✅ Simpler integration (no secret management)
- ✅ Same security across all environments
- ✅ No configuration differences between dev/prod
- ✅ Consistent implementation pattern

### 13.2 Threat Model

**Threats Mitigated:**
- ✅ Authorization code interception (PKCE + 60s TTL + single-use)
- ✅ CSRF attacks (state parameter validation)
- ✅ Token forgery (RS256 JWT signing)
- ✅ Client impersonation (PKCE binding)
- ✅ XSS attacks (secure storage strategies)
- ✅ Man-in-the-middle (HTTPS required)
- ✅ Brute force (rate limiting)
- ✅ Replay attacks (auth code single-use, JWT expiration)

**Residual Risks:**
- ⚠️ XSS in SSO app (use Content Security Policy, sanitize inputs)
- ⚠️ Phishing attacks (user education, verify URLs)

### 13.3 Best Practices

- Always use PKCE for all OAuth flows
- Validate state parameter to prevent CSRF
- Use short-lived access tokens (1 hour)
- Implement refresh token rotation (future enhancement)
- Log all SSO events for audit trail
- Rotate JWT signing keys periodically
- Use HTTPS for all SSO communication
- Implement Content Security Policy (CSP)
- Regularly review OAuth client registrations
- Store code_verifier securely in sessionStorage

## 14. Future Enhancements

### 14.1 Planned Features

**Refresh Token Rotation:**
- Implement automatic refresh token rotation
- Extend user sessions without re-login
- Detect token theft via token family tracking

**Multi-Factor Authentication (MFA):**
- Integrate Supabase MFA support
- Require MFA for sensitive operations
- Admin-configurable MFA policies

**Session Management:**
- Centralized session tracking across all SSO apps
- Admin ability to revoke user sessions
- Session activity monitoring

**OAuth Scope Support:**
- Fine-grained permission scopes
- User consent for data access
- Scope-based API access control

## 15. Support & Documentation

### 15.1 Developer Resources

- Integration Guide: docs/multi-app-sso-guide.md
- Quick Start: docs/multi-app-quick-start.md
- PKCE Implementation: docs/pkce-implementation.md
- OAuth Setup: docs/TEAM_CONNECT_OAUTH_SETUP.md
- Package README: packages/teamified-sso/README.md

### 15.2 Getting Help

- Slack: #engineering-sso
- Email: engineering@teamified.com
- GitHub Issues: (internal repo)

## 16. Appendices

### Appendix A: Glossary

- **SSO:** Single Sign-On
- **IdP:** Identity Provider (Teamified Portal)
- **OAuth 2.0:** Authorization framework
- **PKCE:** Proof Key for Code Exchange
- **JWT:** JSON Web Token
- **RBAC:** Role-Based Access Control
- **CSRF:** Cross-Site Request Forgery
- **XSS:** Cross-Site Scripting
- **Auth Code:** Short-lived authorization code
- **Public Client:** Browser-based app using PKCE (all Teamified clients)
- **Code Verifier:** Random string used in PKCE flow
- **Code Challenge:** SHA256 hash of code verifier

### Appendix B: Related Documents

- docs/MASTER_PRD.md - Overall product requirements
- docs/Multitenancy_Features_PRD.md - Multi-tenancy architecture
- docs/oauth-federated-auth-plan.md - OAuth implementation plan
