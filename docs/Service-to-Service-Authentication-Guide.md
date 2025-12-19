# Service-to-Service (S2S) Authentication Guide

This guide covers backend-to-backend authentication for systems that need to interact with the Teamified Accounts API without user intervention.

## Overview

Service-to-Service authentication uses the OAuth 2.0 Client Credentials Grant, allowing backend systems to authenticate directly using their client credentials. This is ideal for:

> **Unified Endpoints (v1.0.10+)**: S2S tokens now work on the same API endpoints as user JWT tokens. No more separate `/api/v1/s2s/*` paths - simply use your S2S token on standard endpoints like `/api/v1/users`, `/api/v1/organizations`, and `/api/v1/invitations`.

Use cases:

- Background jobs and scheduled tasks
- Microservice communication
- Data synchronization processes
- Administrative automation scripts
- Integration pipelines

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/sso/token` | POST | Get S2S access token |
| `/api/v1/users` | GET | List users (requires `read:users`) |
| `/api/v1/organizations` | GET | List organizations (requires `read:organizations`) |
| `/api/v1/invitations` | POST | Create invitations (requires `write:invitations`) |

---

## 1. Prerequisites

### Enable Client Credentials Grant

Before using S2S authentication, you must enable it for your OAuth client:

1. Log in to Teamified Accounts as an admin
2. Navigate to **Admin > OAuth Configuration**
3. Find or create your OAuth client
4. Enable **"Allow Client Credentials Grant"**
5. Select the required scopes for your integration
6. Save changes

Your client will display an "S2S" badge indicating it's enabled for service-to-service authentication.

### Secure Your Credentials

Your `client_id` and `client_secret` are your service's identity. Treat them like passwords:

- Store in environment variables or a secrets manager
- Never commit to version control
- Rotate periodically
- Use different credentials for dev/staging/production

---

## 2. Getting an Access Token

### Token Request

```bash
curl -X POST https://accounts.teamified.com/api/v1/sso/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "scope": ["read:users", "read:organizations"]
  }'
```

### Request Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `grant_type` | Yes | Must be `client_credentials` |
| `client_id` | Yes | Your OAuth client ID |
| `client_secret` | Yes | Your OAuth client secret |
| `scope` | No | Array of requested scopes (e.g., `["read:users", "read:organizations"]`) |

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": ["read:users", "read:organizations"]
}
```

### Response Fields

| Field | Description |
|-------|-------------|
| `access_token` | JWT token to use for API calls |
| `token_type` | Always "Bearer" |
| `expires_in` | Token lifetime in seconds (typically 1 hour) |
| `scope` | Granted scopes (may be subset of requested) |

---

## 3. Available Scopes

| Scope | Description | Example Use Case |
|-------|-------------|------------------|
| `read:users` | Read user profiles and lists | User directory sync |
| `write:users` | Create and update users | Automated onboarding |
| `read:organizations` | Read organization data | Org structure sync |
| `write:organizations` | Create and update orgs | Automated org provisioning |
| `read:invitations` | Read invitation status | Invitation tracking |
| `write:invitations` | Create and manage invitations | Bulk invitation systems |

### Scope Validation

- Only scopes enabled for your client will be granted
- Requesting unavailable scopes will result in a reduced scope set
- The response `scope` field shows what was actually granted

### Security: Write Operations

> **Important (v1.0.10+)**: Write operations (POST, PUT, DELETE) are blocked for S2S clients by default. S2S authentication is designed primarily for read-only data access. Endpoints must explicitly enable S2S write access using the `@RequiredScopes` decorator.

If you need write access for specific use cases (e.g., automated user provisioning), contact your administrator to ensure the endpoint supports S2S write operations.

---

## 4. Using the Access Token

### Making API Calls

Include the token in the `Authorization` header:

```bash
curl -X GET https://accounts.teamified.com/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

class TeamifiedS2SClient {
  constructor(clientId, clientSecret, baseUrl = 'https://accounts.teamified.com') {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = baseUrl;
    this.accessToken = null;
    this.tokenExpiresAt = null;
  }

  async getToken(scopes = []) {
    // Return cached token if still valid (with 5 min buffer)
    if (this.accessToken && this.tokenExpiresAt > Date.now() + 5 * 60 * 1000) {
      return this.accessToken;
    }

    const response = await axios.post(`${this.baseUrl}/api/v1/sso/token`, {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: scopes,
    });

    this.accessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);

    return this.accessToken;
  }

  async request(method, path, data = null, scopes = ['read:users']) {
    const token = await this.getToken(scopes);

    const config = {
      method,
      url: `${this.baseUrl}${path}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    return axios(config);
  }

  // Convenience methods
  async getUsers(params = {}) {
    return this.request('GET', '/api/v1/users', null, ['read:users']);
  }

  async getUser(userId) {
    return this.request('GET', `/api/v1/users/${userId}`, null, ['read:users']);
  }

  async getOrganizations() {
    return this.request('GET', '/api/v1/organizations', null, ['read:organizations']);
  }

  async createInvitation(data) {
    return this.request('POST', '/api/v1/invitations', data, ['write:invitations']);
  }
}

// Usage
const client = new TeamifiedS2SClient(
  process.env.TEAMIFIED_CLIENT_ID,
  process.env.TEAMIFIED_CLIENT_SECRET
);

async function syncUsers() {
  const response = await client.getUsers();
  console.log('Users:', response.data);
}
```

### Python Example

```python
import requests
import time

class TeamifiedS2SClient:
    def __init__(self, client_id, client_secret, base_url='https://accounts.teamified.com'):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = base_url
        self.access_token = None
        self.token_expires_at = 0

    def get_token(self, scopes=None):
        # Return cached token if still valid (with 5 min buffer)
        if self.access_token and self.token_expires_at > time.time() + 300:
            return self.access_token

        response = requests.post(
            f'{self.base_url}/api/v1/sso/token',
            json={
                'grant_type': 'client_credentials',
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'scope': scopes or [],
            }
        )
        response.raise_for_status()
        data = response.json()

        self.access_token = data['access_token']
        self.token_expires_at = time.time() + data['expires_in']

        return self.access_token

    def request(self, method, path, data=None, scopes=None):
        token = self.get_token(scopes or ['read:users'])

        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        }

        response = requests.request(
            method,
            f'{self.base_url}{path}',
            headers=headers,
            json=data
        )
        response.raise_for_status()
        return response.json()

    def get_users(self):
        return self.request('GET', '/api/v1/users', scopes=['read:users'])

    def get_organizations(self):
        return self.request('GET', '/api/v1/organizations', scopes=['read:organizations'])


# Usage
import os

client = TeamifiedS2SClient(
    os.environ['TEAMIFIED_CLIENT_ID'],
    os.environ['TEAMIFIED_CLIENT_SECRET']
)

users = client.get_users()
print(f"Found {len(users)} users")
```

---

## 5. Token Management Best Practices

### Cache Tokens

S2S tokens are typically valid for 1 hour. Cache them to avoid unnecessary token requests:

```javascript
// Good: Cache and reuse
const token = await client.getToken(); // Returns cached if valid

// Bad: Get new token every request
const response = await fetch('/api/v1/sso/token', {...}); // Wasteful
```

### Handle Token Expiration

Implement automatic refresh when tokens expire:

```javascript
async function apiCallWithRetry(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired - clear cache and retry
      this.accessToken = null;
      return await fn();
    }
    throw error;
  }
}
```

### No Refresh Tokens

Client Credentials Grant does not issue refresh tokens. When your access token expires:
1. Simply request a new token using your client credentials
2. There's no "refresh" flow for S2S

---

## 6. Error Handling

### Common Errors

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 400 | `invalid_grant_type` | Wrong grant_type | Use `client_credentials` |
| 401 | `invalid_client` | Wrong client_id or secret | Check credentials |
| 403 | `client_credentials_not_allowed` | S2S not enabled | Enable in OAuth config |
| 403 | `insufficient_scope` | Scope not granted | Request allowed scopes |

### Error Response Format

```json
{
  "statusCode": 401,
  "message": "Invalid client credentials",
  "error": "Unauthorized"
}
```

### Handling Errors

```javascript
try {
  const token = await getS2SToken();
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Invalid credentials - check client_id and client_secret');
  } else if (error.response?.status === 403) {
    console.error('S2S not enabled or insufficient scopes');
  } else {
    console.error('Token request failed:', error.message);
  }
}
```

---

## 7. Security Considerations

### Credential Storage

```bash
# Environment variables (recommended)
export TEAMIFIED_CLIENT_ID=your-client-id
export TEAMIFIED_CLIENT_SECRET=your-client-secret

# Never do this:
const clientSecret = "hardcoded-secret"; // BAD!
```

### Network Security

- Always use HTTPS
- Consider IP allowlisting if available
- Use VPN/private networking for internal services

### Audit Trail

All S2S API calls are logged with:
- Client ID
- Requested scopes
- Timestamp
- IP address
- Endpoint accessed

Review audit logs regularly for unusual activity.

### Credential Rotation

1. Create a new OAuth client or regenerate secret
2. Deploy the new credentials to your services
3. Verify services work with new credentials
4. Disable/delete old credentials

---

## 8. Rate Limiting

S2S requests are subject to rate limiting:

| Limit Type | Value |
|------------|-------|
| Token requests | 10 per minute per client |
| API requests | 100 per minute per client |

When rate limited, you'll receive:

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "retryAfter": 60
}
```

Handle with exponential backoff:

```javascript
async function requestWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || Math.pow(2, i);
        await sleep(retryAfter * 1000);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 9. Testing

### Test Endpoint

Use the health endpoint to verify connectivity (no auth required):

```bash
curl https://accounts.teamified.com/api/health
# Returns: { "status": "ok", "timestamp": "..." }
```

### Verify Token

Decode your JWT to inspect claims:

```javascript
function decodeToken(token) {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}

const claims = decodeToken(accessToken);
console.log('Token expires at:', new Date(claims.exp * 1000));
console.log('Scopes:', claims.scope);
```

### Staging Environment

For testing, use the staging environment:

```
Base URL: https://teamified-accounts.replit.app
```

Use separate client credentials for staging.

---

## 10. Environment Configuration

```env
# Production
TEAMIFIED_BASE_URL=https://accounts.teamified.com
TEAMIFIED_CLIENT_ID=prod-client-id
TEAMIFIED_CLIENT_SECRET=prod-client-secret

# Staging
TEAMIFIED_BASE_URL=https://teamified-accounts.replit.app
TEAMIFIED_CLIENT_ID=staging-client-id
TEAMIFIED_CLIENT_SECRET=staging-client-secret
```

---

## Differences: S2S vs User Authentication

| Aspect | S2S (Client Credentials) | User Auth (Authorization Code) |
|--------|--------------------------|-------------------------------|
| Authentication | Client ID + Secret | User login + PKCE |
| Token lifetime | 1 hour | 72 hours |
| Refresh tokens | No | Yes |
| Cookies | No | Yes (httpOnly) |
| User context | No (service identity) | Yes (user identity) |
| API endpoints | Same unified endpoints | Same unified endpoints |
| Write operations | Blocked by default | Full access based on role |
| Use case | Backend automation, read-only sync | User-facing apps |

---

## Technical Details (v1.0.10+)

### Dual-Auth Guards

The backend uses dual-authentication guards that accept both user JWT tokens and S2S tokens:

- **JwtOrServiceGuard**: Validates the token and sets `req.user` or `req.serviceClient`
- **CurrentUserOrServiceGuard**: Extracts user or service identity from the request
- **RolesOrServiceGuard**: Enforces role requirements for users, scope requirements for S2S

### Endpoint Access Control

Endpoints use the `@RequiredScopes` decorator to explicitly enable S2S access:

```typescript
@Get()
@RequiredScopes('read:users')  // S2S with read:users scope can access
async findAll() { ... }

@Post()
// No @RequiredScopes = S2S blocked with 403
async create() { ... }
```

### Response Sanitization

For security, S2S responses automatically sanitize sensitive fields:
- Password hashes
- Password reset tokens
- Email verification tokens
- Internal user IDs (Supabase, Google)

---

## Need Help?

- **General Documentation**: https://accounts.teamified.com/docs
- **OAuth Setup Guide**: https://accounts.teamified.com/docs/developer/oauth
- **API Reference**: https://accounts.teamified.com/api/docs
