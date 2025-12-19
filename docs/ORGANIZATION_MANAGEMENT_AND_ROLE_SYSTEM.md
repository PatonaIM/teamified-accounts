# Organization Management & Role System API Guide

This comprehensive guide covers the Teamified Accounts APIs for organization management, user management, role-based access control, and multitenancy integration. Use this guide to integrate your client applications with Teamified Accounts.

**Base URL:** `https://accounts.teamified.com/api`  
**API Version:** `v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Role System](#role-system)
3. [Organization Management](#organization-management)
4. [User Management](#user-management)
5. [Invitation Management](#invitation-management)
6. [User Emails (Multi-Identity)](#user-emails-multi-identity)
7. [SSO Integration](#sso-integration)
8. [Error Handling](#error-handling)

---

## Authentication

All API endpoints require JWT authentication unless otherwise specified. Include the access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Refresh

Access tokens expire. Use the refresh endpoint to obtain new tokens:

```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token",
  "expiresIn": 900
}
```

---

## Role System

Teamified Accounts uses a hierarchical role-based access control (RBAC) system with scoped permissions.

### Role Types

| Role Type | Scope | Description |
|-----------|-------|-------------|
| `super_admin` | global | Full system access, can manage all organizations and users |
| `internal_hr` | global | Internal Teamified HR staff |
| `internal_finance` | global | Internal Teamified finance staff |
| `internal_account_manager` | global | Internal account managers for client organizations |
| `internal_recruiter` | global | Internal Teamified recruiters |
| `internal_marketing` | global | Internal Teamified marketing staff |
| `internal_member` | global | General internal team member |
| `client_admin` | organization | Organization administrator, full org access |
| `client_hr` | organization | Organization HR manager |
| `client_finance` | organization | Organization finance manager |
| `client_recruiter` | organization | Organization recruiter |
| `client_employee` | organization | Standard organization employee |
| `candidate` | global | Job seeker without organization affiliation |

### Role Scopes

| Scope | Description |
|-------|-------------|
| `global` | Access applies system-wide |
| `organization` | Access limited to specific organization(s) |
| `individual` | Access limited to own resources |

### Get User Roles

```http
GET /v1/roles/user/:userId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "roles": [
    {
      "id": "role-uuid",
      "roleType": "client_admin",
      "scope": "organization",
      "scopeEntityId": "org-uuid",
      "grantedBy": "admin-user-uuid",
      "expiresAt": null,
      "createdAt": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

### Assign Role

```http
POST /v1/roles/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "role": "client_hr",
  "scope": "organization",
  "scopeId": "org-uuid",
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "role": {
    "id": "new-role-uuid",
    "roleType": "client_hr",
    "scope": "organization",
    "scopeEntityId": "org-uuid",
    "userId": "user-uuid",
    "grantedBy": "admin-uuid",
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "createdAt": "2025-12-18T10:00:00.000Z"
  }
}
```

### Update Role

```http
PUT /v1/roles/:roleId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "client_finance",
  "expiresAt": null
}
```

### Remove Role

```http
DELETE /v1/roles/:roleId
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## Organization Management

### Create Organization

> **Authorization:** `super_admin` only

```http
POST /v1/organizations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "description": "Leading technology company",
  "website": "https://acme.com",
  "industry": "Technology",
  "size": "51-100"
}
```

**Response:**
```json
{
  "id": "org-uuid",
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "description": "Leading technology company",
  "website": "https://acme.com",
  "industry": "Technology",
  "size": "51-100",
  "tier": "free",
  "status": "active",
  "logoUrl": null,
  "createdAt": "2025-12-18T10:00:00.000Z",
  "updatedAt": "2025-12-18T10:00:00.000Z"
}
```

### List Organizations

> **Authorization:** `super_admin`, `internal_*` roles

```http
GET /v1/organizations?page=1&limit=20&search=acme
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `search` | string | Search by name or slug |
| `status` | string | Filter by status (active, inactive, archived) |

**Response:**
```json
{
  "data": [
    {
      "id": "org-uuid",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "status": "active",
      "memberCount": 25
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get Organization by ID

```http
GET /v1/organizations/:id
Authorization: Bearer <token>
```

### Get Organization by Slug

```http
GET /v1/organizations/by-slug/:slug
Authorization: Bearer <token>
```

### Get My Organizations

Returns organizations the current user is a member of.

```http
GET /v1/organizations/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "organizations": [
    {
      "id": "org-uuid",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "role": "client_admin",
      "logoUrl": "https://..."
    }
  ]
}
```

### Update Organization

> **Authorization:** `super_admin` or `client_admin` of the organization

```http
PUT /v1/organizations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corp International",
  "description": "Global technology leader",
  "website": "https://acme-corp.com"
}
```

### Delete Organization

> **Authorization:** `super_admin` only

```http
DELETE /v1/organizations/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Check Slug Availability

```http
GET /v1/organizations/check-slug/:slug
Authorization: Bearer <token>
```

**Response:**
```json
{
  "available": true,
  "slug": "acme-corp"
}
```

---

## Organization Members

### Get Organization Members

```http
GET /v1/organizations/:id/members
Authorization: Bearer <token>
```

**Response:**
```json
{
  "members": [
    {
      "id": "user-uuid",
      "email": "john@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "profilePictureUrl": "https://...",
      "role": "client_admin",
      "status": "active",
      "joinedAt": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

### Add Member to Organization

> **Authorization:** `super_admin` or `client_admin` of the organization

```http
POST /v1/organizations/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "roleType": "client_hr"
}
```

**Valid Role Types for Members:**
- `client_admin`
- `client_hr`
- `client_finance`
- `client_recruiter`
- `client_employee`

### Update Member Role

```http
PUT /v1/organizations/:id/members/:userId/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "roleType": "client_admin"
}
```

### Remove Member from Organization

```http
DELETE /v1/organizations/:id/members/:userId
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Convert Candidate to Employee

Convert an existing candidate user to an organization employee.

```http
POST /v1/organizations/:id/convert-candidate
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "candidate-user-uuid",
  "workEmail": "john@acme.com",
  "roleType": "client_employee"
}
```

---

## User Management

### Get Paginated User List

> **Authorization:** `admin`, `timesheet_approver`

```http
GET /v1/users?page=1&limit=20&search=john&status=active
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search by name or email |
| `status` | string | Filter: active, inactive, archived |
| `role` | string | Filter by role type |
| `sortBy` | string | Sort field (createdAt, email, firstName) |
| `sortOrder` | string | ASC or DESC |

**Response:**
```json
{
  "data": [
    {
      "id": "user-uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "active",
      "emailVerified": true,
      "roles": ["client_admin"],
      "createdAt": "2025-12-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Get User by ID

```http
GET /v1/users/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "active",
    "emailVerified": true,
    "profilePictureUrl": "https://...",
    "profile": {
      "phoneNumber": "+1234567890",
      "timezone": "Australia/Sydney"
    },
    "roles": [
      {
        "roleType": "client_admin",
        "scope": "organization",
        "scopeEntityId": "org-uuid"
      }
    ],
    "organizations": [
      {
        "id": "org-uuid",
        "name": "Acme Corporation",
        "slug": "acme-corp",
        "role": "client_admin"
      }
    ],
    "createdAt": "2025-12-01T00:00:00.000Z"
  }
}
```

### Get Current User

```http
GET /v1/users/me
Authorization: Bearer <token>
```

### Update User

```http
PATCH /v1/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "profile": {
    "phoneNumber": "+61412345678"
  }
}
```

### Update User Status

```http
PATCH /v1/users/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "inactive"
}
```

**Valid Statuses:** `active`, `inactive`, `archived`

### Bulk Update User Status

```http
POST /v1/users/bulk/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["user-uuid-1", "user-uuid-2"],
  "status": "inactive"
}
```

### Bulk Assign Role

```http
POST /v1/users/bulk/assign-role
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["user-uuid-1", "user-uuid-2"],
  "role": "client_employee",
  "scope": "organization",
  "scopeId": "org-uuid"
}
```

### Delete User

> **Authorization:** `admin` only

```http
DELETE /v1/users/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Get User Activity

```http
GET /v1/users/:id/activity?timeRange=7d
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `timeRange` | string | 1h, 3h, 6h, 12h, 24h, 3d, 7d, 30d |

**Response:**
```json
{
  "loginHistory": [
    {
      "timestamp": "2025-12-18T10:00:00.000Z",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "deviceType": "Desktop"
    }
  ],
  "lastAppsUsed": [
    {
      "appName": "ATS Portal",
      "clientId": "ats-portal",
      "lastUsed": "2025-12-18T09:30:00.000Z"
    }
  ],
  "recentActions": [
    {
      "action": "user.login",
      "entityType": "session",
      "timestamp": "2025-12-18T10:00:00.000Z"
    }
  ]
}
```

---

## Invitation Management

### Create Organization Invitation

> **Authorization:** `super_admin`, `client_admin`, `client_hr`

```http
POST /v1/invitations
Authorization: Bearer <token>
Content-Type: application/json

{
  "organizationId": "org-uuid",
  "roleType": "client_hr",
  "maxUses": 1
}
```

**Response:**
```json
{
  "id": "invitation-uuid",
  "code": "abc123xyz",
  "inviteUrl": "https://accounts.teamified.com/invitations/accept/abc123xyz",
  "organizationId": "org-uuid",
  "roleType": "client_hr",
  "status": "pending",
  "maxUses": 1,
  "useCount": 0,
  "expiresAt": "2025-12-25T00:00:00.000Z",
  "createdBy": "admin-uuid",
  "createdAt": "2025-12-18T10:00:00.000Z"
}
```

### Send Email Invitation

```http
POST /v1/invitations/send-email
Authorization: Bearer <token>
Content-Type: application/json

{
  "organizationId": "org-uuid",
  "email": "newuser@example.com",
  "roleType": "client_employee",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### Generate Shareable Invite Link

```http
POST /v1/invitations/generate-link
Authorization: Bearer <token>
Content-Type: application/json

{
  "organizationId": "org-uuid",
  "roleType": "client_employee",
  "maxUses": 10,
  "expiresInHours": 168
}
```

### Get Invitation Details (Public)

```http
GET /v1/invitations/organization/:code
```

**Response:**
```json
{
  "isValid": true,
  "organizationName": "Acme Corporation",
  "organizationSlug": "acme-corp",
  "roleType": "client_employee",
  "inviterName": "John Doe",
  "invitedEmail": "jane@example.com",
  "hasCompletedSignup": false
}
```

### Accept Invitation (Create Account)

```http
POST /v1/invitations/accept
Content-Type: application/json

{
  "inviteCode": "abc123xyz",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Optional Account Linking:**
```json
{
  "inviteCode": "abc123xyz",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "personalEmail": "jane.personal@gmail.com"
}
```

### Accept Invitation (Authenticated User)

```http
POST /v1/invitations/accept-authenticated
Authorization: Bearer <token>
Content-Type: application/json

{
  "inviteCode": "abc123xyz"
}
```

### List Invitations

```http
GET /v1/invitations?organizationId=org-uuid&status=pending
Authorization: Bearer <token>
```

### Cancel Invitation

```http
DELETE /v1/invitations/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## User Emails (Multi-Identity)

Teamified supports linking multiple email addresses to a single user identity. Users can sign in with any linked email using a single password.

### List User Emails

```http
GET /user-emails
Authorization: Bearer <token>
```

**Response:**
```json
{
  "emails": [
    {
      "id": "email-uuid",
      "email": "john.personal@gmail.com",
      "emailType": "personal",
      "isPrimary": true,
      "isVerified": true,
      "organizationId": null,
      "createdAt": "2025-12-01T00:00:00.000Z"
    },
    {
      "id": "email-uuid-2",
      "email": "john@acme.com",
      "emailType": "work",
      "isPrimary": false,
      "isVerified": true,
      "organizationId": "org-uuid",
      "createdAt": "2025-12-10T00:00:00.000Z"
    }
  ]
}
```

### Add Personal Email

> **Note:** Work emails can only be added through organization invitations.

```http
POST /user-emails
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "john.alt@gmail.com",
  "emailType": "personal"
}
```

### Set Primary Email

```http
PUT /user-emails/:id/set-primary
Authorization: Bearer <token>
```

### Verify Email

```http
POST /user-emails/verify
Content-Type: application/json

{
  "token": "verification-token"
}
```

### Resend Verification

```http
POST /user-emails/:id/resend-verification
Authorization: Bearer <token>
```

### Remove Email

> **Note:** Cannot remove primary email or last remaining email.

```http
DELETE /user-emails/:id
Authorization: Bearer <token>
```

---

## SSO Integration

### OAuth 2.0 Authorization Flow

**Step 1: Redirect to Authorization**

```
GET /v1/sso/authorize?
  client_id=your-client-id&
  redirect_uri=https://your-app.com/callback&
  response_type=code&
  state=random-state-value&
  code_challenge=BASE64URL(SHA256(code_verifier))&
  code_challenge_method=S256
```

**Step 2: Exchange Code for Tokens**

```http
POST /v1/sso/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "auth-code-from-callback",
  "redirect_uri": "https://your-app.com/callback",
  "client_id": "your-client-id",
  "client_secret": "your-client-secret",
  "code_verifier": "original-code-verifier"
}
```

**Response:**
```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "refresh-token",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["client_admin"]
  }
}
```

### SSO Launch (Simplified)

For authenticated users, launch SSO to a connected app:

```http
GET /v1/sso/launch/:clientId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "redirectUrl": "https://app.example.com/callback?code=abc123&state=xyz"
}
```

### Record User Activity

Client apps can send activity data back to Teamified Accounts:

```http
POST /v1/sso/activity
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "your-client-id",
  "userId": "user-uuid",
  "activityType": "feature_usage",
  "metadata": {
    "feature": "job_posting",
    "action": "create"
  }
}
```

### SSO Logout

```http
POST /v1/sso/logout
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "your-client-id"
}
```

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful delete) |
| `400` | Bad Request - Invalid input data |
| `401` | Unauthorized - Missing or invalid token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Duplicate resource |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

### Rate Limiting

API endpoints are rate-limited:
- Standard endpoints: 100 requests per minute
- Auth endpoints: 10 requests per minute
- Invitation endpoints: 5 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702900000
```

---

## Code Examples

### JavaScript/TypeScript - Fetch User's Organizations

```typescript
async function getMyOrganizations(accessToken: string) {
  const response = await fetch('https://accounts.teamified.com/api/v1/organizations/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

### JavaScript/TypeScript - Invite User to Organization

```typescript
async function inviteUserToOrganization(
  accessToken: string,
  organizationId: string,
  email: string,
  roleType: string
) {
  const response = await fetch('https://accounts.teamified.com/api/v1/invitations/send-email', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      organizationId,
      email,
      roleType,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

### JavaScript/TypeScript - Check User Permissions

```typescript
interface UserRole {
  roleType: string;
  scope: string;
  scopeEntityId: string | null;
}

function hasOrganizationRole(
  roles: UserRole[],
  orgId: string,
  requiredRoles: string[]
): boolean {
  return roles.some(role =>
    requiredRoles.includes(role.roleType) &&
    role.scope === 'organization' &&
    role.scopeEntityId === orgId
  );
}

function isOrganizationAdmin(roles: UserRole[], orgId: string): boolean {
  return hasOrganizationRole(roles, orgId, ['client_admin']);
}

function canManageUsers(roles: UserRole[], orgId: string): boolean {
  return hasOrganizationRole(roles, orgId, ['client_admin', 'client_hr']);
}
```

### Python - Get Organization Members

```python
import requests

def get_organization_members(access_token: str, org_id: str) -> dict:
    response = requests.get(
        f'https://accounts.teamified.com/api/v1/organizations/{org_id}/members',
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
    )
    response.raise_for_status()
    return response.json()
```

---

## Webhook Events (Coming Soon)

Teamified Accounts will support webhook notifications for:
- `user.created` - New user registered
- `user.updated` - User profile updated
- `user.deleted` - User removed
- `organization.created` - New organization created
- `organization.member.added` - Member added to organization
- `organization.member.removed` - Member removed from organization
- `invitation.accepted` - Invitation accepted

---

## Support

For API support and integration assistance:
- **Email:** hello@teamified.com
- **Documentation:** https://accounts.teamified.com/docs
