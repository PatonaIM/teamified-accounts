# Organization Management & Role System API Guide

**Document Version:** 3.0  
**Date:** December 19, 2025  
**Status:** Current Implementation

This comprehensive guide covers the Teamified Accounts APIs for organization management, user management, role-based access control, and multitenancy integration. Use this guide to integrate your client applications with Teamified Accounts.

**Base URL:** `https://accounts.teamified.com/api`  
**API Version:** `v1`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Organization Types](#organization-types)
3. [Role System](#role-system)
4. [Authentication](#authentication)
5. [Organization Management API](#organization-management-api)
6. [Organization Members API](#organization-members-api)
7. [User Management API](#user-management-api)
8. [Invitation Management API](#invitation-management-api)
9. [User Emails (Multi-Identity)](#user-emails-multi-identity)
10. [SSO Integration](#sso-integration)
11. [Error Handling](#error-handling)
12. [Code Examples](#code-examples)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)

---

## Executive Summary

The Teamified Accounts platform provides a centralized authentication and user management system offering Single Sign-On (SSO), multi-organization support, and granular role-based access control. The system supports both client organizations and an internal Teamified organization with distinct role types and subscription tiers.

---

## Organization Types

### 1. Client Organizations

Client organizations are external companies that use Teamified services for their employment needs.

**Subscription Tiers:**
| Tier | Description |
|------|-------------|
| `free` | Basic tier with limited features |
| `basic` | Standard tier with core features |
| `professional` | Advanced tier with enhanced features |
| `enterprise` | Premium tier with full feature access |

**Characteristics:**
- Can have multiple team members
- Subject to billing and subscription management
- Have organization-specific roles (client_* roles)
- Can be managed through Organization Management interface

### 2. Internal Organization (Teamified)

The Teamified organization is a special internal organization for platform staff.

**Details:**
- **Name:** Teamified
- **Slug:** `teamified-internal`
- **Industry:** Recruitment
- **Website:** https://teamified.com/
- **Subscription Tier:** `internal` (exclusive tier not available to client organizations)

**Characteristics:**
- Always appears first in organization lists
- Has internal-specific roles (internal_* roles)
- Billing Details tab is hidden in UI
- Cannot be deleted or have subscription changed

---

## Role System

Teamified Accounts uses a hierarchical role-based access control (RBAC) system with scoped permissions.

### Role Types

#### Client Roles
Used for members of client organizations:

| Role Type | Label | Description | Scope |
|-----------|-------|-------------|-------|
| `client_admin` | Admin | Full access to organization management | organization |
| `client_hr` | HR | Manage users and HR functions | organization |
| `client_finance` | Finance | Manage financial operations | organization |
| `client_recruiter` | Recruiter | Manage recruitment processes | organization |
| `client_employee` | Employee | Standard user access | organization |

#### Internal Roles
Used for Teamified internal staff:

| Role Type | Label | Description | Scope |
|-----------|-------|-------------|-------|
| `super_admin` | Super Admin | Full system access and control | global |
| `internal_hr` | Internal HR | Internal HR operations | global |
| `internal_finance` | Internal Finance | Internal finance operations | global |
| `internal_account_manager` | Account Manager | Manage client accounts | global |
| `internal_recruiter` | Internal Recruiter | Internal recruitment | global |
| `internal_marketing` | Internal Marketing | Internal marketing operations | global |
| `internal_member` | Internal Employee | Standard internal team member | global |

#### Other Roles

| Role Type | Label | Description | Scope |
|-----------|-------|-------------|-------|
| `candidate` | Candidate | Job seeker without organization affiliation | global |

### Role Scopes

| Scope | Description |
|-------|-------------|
| `global` | Access applies system-wide |
| `organization` | Access limited to specific organization(s) |
| `individual` | Access limited to own resources |

### Default Roles

- **Client Organizations:** `client_employee` (default for new users)
- **Internal Organization:** `internal_member` (default for new internal staff)
- **Self-Registered Candidates:** `candidate` (global scope)

### Role Assignment Rules

1. **Organization Type Validation:**
   - Client organizations can only assign client roles
   - Teamified organization can only assign internal roles
   - Backend validation enforces these constraints

2. **Role Filtering in UI:**
   - Organization Invitation Modal shows appropriate roles based on organization type
   - Internal roles displayed for Teamified organization
   - Client roles displayed for all other organizations

3. **Legacy Compatibility:**
   - `client_member` → maps to `client_employee`
   - `admin` → maps to `client_admin`
   - `account_manager` → maps to `internal_account_manager`

---

## Authentication

All API endpoints require JWT authentication unless otherwise specified. Include the access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Refresh

Access tokens expire after 15 minutes. Use the refresh endpoint to obtain new tokens:

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

### Session Management

- **Inactivity Timeout:** 72 hours
- **Absolute Expiry:** 30 days
- Sessions are stored in Redis for high availability

---

## Organization Management API

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
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "description": "Leading technology company",
  "website": "https://acme.com",
  "industry": "Technology",
  "size": "51-100",
  "subscriptionTier": "free",
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
| `subscriptionTier` | string | Filter by tier (free, basic, professional, enterprise, internal) |

**Sorting:**
1. Teamified organization always appears first (when not filtered out)
2. Then sorted by subscription tier priority (internal > enterprise > professional > basic > free)
3. Then by member count (descending)

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "status": "active",
      "subscriptionTier": "professional",
      "memberCount": 25,
      "logoUrl": "https://..."
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
      "id": "550e8400-e29b-41d4-a716-446655440000",
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
> **Note:** Teamified organization (`teamified-internal`) cannot be deleted

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

### Upload Organization Logo

**Step 1: Get Upload URL**
```http
POST /v1/organizations/:id/logo/upload-url
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentType": "image/png",
  "filename": "logo.png"
}
```

**Step 2: Upload to Signed URL**
```http
PUT <signed-url>
Content-Type: image/png

<binary file data>
```

---

## Organization Members API

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

**Valid Role Types for Client Organization Members:**
- `client_admin`
- `client_hr`
- `client_finance`
- `client_recruiter`
- `client_employee`

**Valid Role Types for Internal Organization Members:**
- `super_admin`
- `internal_hr`
- `internal_finance`
- `internal_account_manager`
- `internal_recruiter`
- `internal_marketing`
- `internal_member`

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

## User Management API

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

## Role Management API

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

> **Authorization:** `admin` only

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

## Invitation Management API

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

### Create Internal Invitation

> **Authorization:** `super_admin` only

```http
POST /v1/invitations/internal
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newstaff@teamified.com",
  "roleType": "internal_hr",
  "maxUses": 1
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

### Generate Internal Invite Link

> **Authorization:** `super_admin` only

```http
POST /v1/invitations/internal/generate-link
Authorization: Bearer <token>
Content-Type: application/json

{
  "roleType": "internal_member",
  "maxUses": 5,
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

### Get Internal Invitation Details

```http
GET /v1/invitations/internal/:code
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

### Accept Internal Invitation

```http
POST /v1/invitations/internal/accept
Content-Type: application/json

{
  "inviteCode": "internal-abc123",
  "email": "staff@teamified.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "firstName": "Staff",
  "lastName": "Member"
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

### List Internal Invitations

> **Authorization:** `super_admin` only

```http
GET /v1/invitations/internal
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

### Email Types

| Type | Description |
|------|-------------|
| `personal` | Personal email address, self-managed by user |
| `work` | Work email tied to an organization, provisioned through invitations |

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

### OAuth 2.0 Authorization Flow (PKCE)

**Step 1: Generate PKCE Values**
```javascript
const codeVerifier = generateRandomString(128);
const codeChallenge = base64URLEncode(sha256(codeVerifier));
```

**Step 2: Redirect to Authorization**

```
GET /v1/sso/authorize?
  client_id=your-client-id&
  redirect_uri=https://your-app.com/callback&
  response_type=code&
  state=random-state-value&
  code_challenge=BASE64URL(SHA256(code_verifier))&
  code_challenge_method=S256
```

**Step 3: Exchange Code for Tokens**

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

### Marketing Redirect

For users coming from marketing site signup:

```http
GET /v1/sso/marketing-redirect?source=marketing
Authorization: Bearer <token>
```

**Query Parameters:**
- `source=marketing` - Redirect to production portal
- `source=marketing-dev` - Redirect to staging portal

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

### JavaScript/TypeScript - API Client Setup

```typescript
class TeamifiedAccountsClient {
  private baseUrl = 'https://accounts.teamified.com/api/v1';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: object
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async getMyOrganizations() {
    return this.request<{ organizations: Organization[] }>('GET', '/organizations/me');
  }

  async getOrganizationMembers(orgId: string) {
    return this.request<{ members: Member[] }>('GET', `/organizations/${orgId}/members`);
  }

  async inviteUserToOrganization(
    organizationId: string,
    email: string,
    roleType: string
  ) {
    return this.request('POST', '/invitations/send-email', {
      organizationId,
      email,
      roleType,
    });
  }
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

function hasGlobalRole(roles: UserRole[], requiredRoles: string[]): boolean {
  return roles.some(role =>
    requiredRoles.includes(role.roleType) &&
    role.scope === 'global'
  );
}

function isSuperAdmin(roles: UserRole[]): boolean {
  return hasGlobalRole(roles, ['super_admin']);
}
```

### JavaScript/TypeScript - Role Display Logic

```typescript
const isInternalOrg = organization.subscriptionTier === 'internal';

const availableRoles = isInternalOrg
  ? [
      { value: 'super_admin', label: 'Super Admin' },
      { value: 'internal_hr', label: 'Internal HR' },
      { value: 'internal_finance', label: 'Internal Finance' },
      { value: 'internal_account_manager', label: 'Account Manager' },
      { value: 'internal_recruiter', label: 'Internal Recruiter' },
      { value: 'internal_marketing', label: 'Internal Marketing' },
      { value: 'internal_member', label: 'Internal Employee' },
    ]
  : [
      { value: 'client_admin', label: 'Admin' },
      { value: 'client_hr', label: 'HR' },
      { value: 'client_finance', label: 'Finance' },
      { value: 'client_recruiter', label: 'Recruiter' },
      { value: 'client_employee', label: 'Employee' },
    ];
```

### Python - Organization Management

```python
import requests
from typing import Optional, Dict, Any

class TeamifiedAccountsClient:
    def __init__(self, access_token: str, base_url: str = 'https://accounts.teamified.com/api/v1'):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
    
    def get_my_organizations(self) -> Dict[str, Any]:
        response = requests.get(
            f'{self.base_url}/organizations/me',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def get_organization_members(self, org_id: str) -> Dict[str, Any]:
        response = requests.get(
            f'{self.base_url}/organizations/{org_id}/members',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def invite_user(
        self,
        organization_id: str,
        email: str,
        role_type: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None
    ) -> Dict[str, Any]:
        payload = {
            'organizationId': organization_id,
            'email': email,
            'roleType': role_type,
        }
        if first_name:
            payload['firstName'] = first_name
        if last_name:
            payload['lastName'] = last_name
            
        response = requests.post(
            f'{self.base_url}/invitations/send-email',
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def update_member_role(
        self,
        organization_id: str,
        user_id: str,
        role_type: str
    ) -> Dict[str, Any]:
        response = requests.put(
            f'{self.base_url}/organizations/{organization_id}/members/{user_id}/role',
            headers=self.headers,
            json={'roleType': role_type}
        )
        response.raise_for_status()
        return response.json()
```

---

## Best Practices

### For Developers

1. **Creating Organizations:**
   - Always validate subscription tier constraints
   - Check organization slug uniqueness before creation
   - Set appropriate default roles for users

2. **Assigning Roles:**
   - Validate organization type before role assignment
   - Use type-safe role enums
   - Check user's organization membership before assigning org-scoped roles

3. **UI Development:**
   - Always filter roles based on organization type
   - Handle Teamified organization as special case
   - Maintain consistent subscription tier badge styling

4. **Security:**
   - Never expose refresh tokens in client-side code
   - Validate permissions server-side, don't rely on client-side checks
   - Use PKCE for OAuth flows

### For Administrators

1. **Managing Internal Staff:**
   - Add all internal team members to Teamified organization
   - Assign appropriate internal roles based on responsibilities
   - Use `internal_member` as default for general staff

2. **Managing Client Organizations:**
   - Choose appropriate subscription tier based on client needs
   - Assign `client_admin` role to primary contact
   - Use `client_employee` for general team members

---

## Troubleshooting

### Common Issues

**Issue:** User can't access organization features  
**Solution:** Check that user has appropriate role and organization membership

**Issue:** Wrong roles showing in invitation modal  
**Solution:** Verify `subscriptionTier` prop is passed correctly to modal; internal orgs show internal_* roles

**Issue:** 403 Forbidden when calling API  
**Solution:** Check user has required role for the endpoint; verify JWT token is valid

**Issue:** Invitation link not working  
**Solution:** Check invitation hasn't expired; verify maxUses hasn't been reached

**Issue:** Can't remove last admin from organization  
**Solution:** This is by design; every organization must have at least one admin

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

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-19 | 3.0 | Complete API reference with code examples, merged documentation |
| 2025-11-22 | 2.0 | Added subscription tier system and Teamified organization |
| 2024-12-19 | 1.0 | Initial organization and role system implementation |

---

*This document is maintained by the Teamified development team and should be updated whenever organization or role-related changes are made to the system.*
