import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { Email, Link as LinkIcon, PersonAdd, Security } from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# Invitations API

API reference for managing invitations, including email invitations, shareable links, and invitation lifecycle management.

## Overview

The Invitations API provides two primary methods for inviting users to join organizations:

1. **Email Invitations** - Send personalized invitation emails directly to specific users
2. **Shareable Links** - Generate reusable invitation URLs for distribution via any channel

Both methods support role assignment and configurable expiration.

## Invitation Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | \`/v1/invitations/send-email\` | Send email invitation | Super Admin, Client Admin (own org) |
| POST | \`/v1/invitations/generate-link\` | Generate shareable link | Super Admin, Client Admin (own org) |
| GET | \`/v1/invitations\` | List organization invitations | Super Admin, Client Admin (own org) |
| GET | \`/v1/invitations/:id\` | Get invitation by ID | Super Admin, Client Admin (own org) |
| DELETE | \`/v1/invitations/:id\` | Revoke/delete invitation | Super Admin, Client Admin (own org) |
| GET | \`/v1/invitations/preview/:code\` | Preview invitation (public) | None (public endpoint) |
| POST | \`/v1/invitations/accept\` | Accept invitation | None (public endpoint) |

## Send Email Invitation

Send a personalized email invitation to a specific user.

### Request

\`\`\`http
POST /v1/invitations/send-email
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roleType": "client_employee"
}
\`\`\`

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`organizationId\` | string (UUID) | Required | Target organization ID |
| \`email\` | string | Required | Recipient's email address |
| \`firstName\` | string | Optional | Recipient's first name (for personalization) |
| \`lastName\` | string | Optional | Recipient's last name (for personalization) |
| \`roleType\` | string | Required | Role to assign upon acceptance |

### Available Role Types

| Role | Description |
|------|-------------|
| \`client_admin\` | Full administrative access to the organization |
| \`client_hr\` | HR management permissions |
| \`client_finance\` | Finance and payroll access |
| \`client_recruiter\` | Recruitment and hiring access |
| \`client_employee\` | Standard employee access |
| \`candidate\` | Job candidate access |

### Response

\`\`\`json
{
  "id": "inv-uuid-123",
  "email": "john.doe@example.com",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "organizationName": "Acme Corporation",
  "roleType": "client_employee",
  "status": "pending",
  "expiresAt": "2025-12-29T14:30:00.000Z",
  "createdAt": "2025-12-22T14:30:00.000Z",
  "inviteUrl": "https://accounts.teamified.com/invitations/accept/abc123xyz"
}
\`\`\`

### Features

- **7-day expiration** - Invitations expire after 7 days
- **Single use** - Each email invitation can only be used once
- **Personalized emails** - Include recipient's name for a professional touch
- **Audit logging** - All invitations are logged for compliance

## Generate Shareable Link

Generate a reusable invitation link that can be shared anywhere.

### Request

\`\`\`http
POST /v1/invitations/generate-link
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "roleType": "client_employee",
  "maxUses": 10
}
\`\`\`

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`organizationId\` | string (UUID) | Required | Target organization ID |
| \`roleType\` | string | Required | Role to assign upon acceptance |
| \`maxUses\` | number | Optional | Maximum number of uses (default: 1) |

### Response

\`\`\`json
{
  "id": "inv-uuid-456",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "organizationName": "Acme Corporation",
  "roleType": "client_employee",
  "status": "pending",
  "maxUses": 10,
  "currentUses": 0,
  "expiresAt": "2025-12-29T14:30:00.000Z",
  "createdAt": "2025-12-22T14:30:00.000Z",
  "inviteUrl": "https://accounts.teamified.com/invitations/accept/xyz789abc"
}
\`\`\`

### Use Cases

| Scenario | Recommended maxUses |
|----------|---------------------|
| Individual onboarding | 1 (default) |
| Team onboarding (known size) | Exact team size |
| Bulk recruitment campaign | 50-100 |
| Job posting with open applications | 100+ |

### Features

- **7-day expiration** - Links expire after 7 days
- **Configurable usage** - Set max uses for controlled distribution
- **Usage tracking** - Monitor how many times a link has been used
- **Shareable anywhere** - Post on job boards, Slack, email, social media

## List Invitations

Retrieve all invitations for an organization.

### Request

\`\`\`http
GET /v1/invitations?organizationId=123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer ACCESS_TOKEN
\`\`\`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`organizationId\` | string (UUID) | Required | Filter by organization |
| \`status\` | string | Optional | Filter by status: pending, accepted, expired, revoked |
| \`page\` | number | Optional | Page number (default: 1) |
| \`limit\` | number | Optional | Items per page (default: 20) |

### Response

\`\`\`json
{
  "items": [
    {
      "id": "inv-uuid-123",
      "email": "john.doe@example.com",
      "organizationId": "123e4567-e89b-12d3-a456-426614174000",
      "roleType": "client_employee",
      "status": "pending",
      "maxUses": 1,
      "currentUses": 0,
      "expiresAt": "2025-12-29T14:30:00.000Z",
      "createdAt": "2025-12-22T14:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
\`\`\`

## Preview Invitation

Public endpoint to preview invitation details before accepting.

### Request

\`\`\`http
GET /v1/invitations/preview/abc123xyz
\`\`\`

### Response

\`\`\`json
{
  "organizationName": "Acme Corporation",
  "organizationLogo": "https://storage.example.com/logos/acme.png",
  "roleType": "client_employee",
  "inviterName": "Jane Smith",
  "expiresAt": "2025-12-29T14:30:00.000Z",
  "isValid": true
}
\`\`\`

> **Note:** This endpoint does not require authentication and is safe to call from public pages.

## Accept Invitation

Accept an invitation to join an organization.

### Request (New User)

\`\`\`http
POST /v1/invitations/accept
Content-Type: application/json

{
  "code": "abc123xyz",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
\`\`\`

### Request (Existing User - Link to Account)

\`\`\`http
POST /v1/invitations/accept-authenticated
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "code": "abc123xyz"
}
\`\`\`

### Response

\`\`\`json
{
  "success": true,
  "message": "Invitation accepted successfully",
  "user": {
    "id": "user-uuid-123",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "organization": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Acme Corporation"
  }
}
\`\`\`

## Revoke Invitation

Delete/revoke an invitation to prevent further use.

### Request

\`\`\`http
DELETE /v1/invitations/inv-uuid-123
Authorization: Bearer ACCESS_TOKEN
\`\`\`

### Response

\`\`\`json
{
  "success": true,
  "message": "Invitation revoked successfully"
}
\`\`\`

## S2S Authentication

All invitation endpoints support Service-to-Service (S2S) authentication for programmatic access.

### Required Scopes

| Endpoint | Required Scope |
|----------|----------------|
| POST /send-email | \`write:invitations\` |
| POST /generate-link | \`write:invitations\` |
| GET /invitations | \`read:invitations\` |
| DELETE /invitations/:id | \`write:invitations\` |

### Example S2S Request

\`\`\`http
POST /v1/invitations/send-email
Authorization: Bearer SERVICE_TOKEN
Content-Type: application/json

{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "new.hire@example.com",
  "roleType": "client_employee"
}
\`\`\`

> **Note:** S2S tokens with organization-level bindings can only create invitations for their bound organizations.

## Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions or organization access denied |
| 404 | Not Found | Invitation not found |
| 409 | Conflict | Email already has a pending invitation |
| 410 | Gone | Invitation has expired |
| 429 | Too Many Requests | Rate limit exceeded (10 requests/minute) |

### Error Response Format

\`\`\`json
{
  "statusCode": 400,
  "message": "Email already has a pending invitation for this organization",
  "error": "Bad Request"
}
\`\`\`

## Best Practices

1. **Use email invitations** for formal onboarding with known recipients
2. **Use shareable links** for open recruitment or bulk onboarding
3. **Set appropriate maxUses** to control link distribution
4. **Monitor invitation status** to track onboarding progress
5. **Revoke unused invitations** to maintain security
6. **Include recipient names** in email invitations for a professional experience
`;

const InvitationsApiPage: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Invitations API
          </Typography>
          <Typography variant="body1" color="text.secondary">
            API reference for managing invitations, email invites, and shareable links
          </Typography>
        </Box>
        <DownloadMarkdownButton
          content={markdownContent}
          filename="invitations-api.md"
        />
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Two invitation methods available:</strong> Email invitations for known recipients, 
          and shareable links for open distribution. Both support role assignment and S2S authentication.
        </Typography>
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <PersonAdd color="primary" />
          <Typography variant="h6">Invitation Endpoints</Typography>
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Method</strong></TableCell>
                <TableCell><strong>Endpoint</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Auth Required</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><Chip label="POST" color="success" size="small" /></TableCell>
                <TableCell><code>/v1/invitations/send-email</code></TableCell>
                <TableCell>Send email invitation</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="POST" color="success" size="small" /></TableCell>
                <TableCell><code>/v1/invitations/generate-link</code></TableCell>
                <TableCell>Generate shareable link</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="GET" color="primary" size="small" /></TableCell>
                <TableCell><code>/v1/invitations</code></TableCell>
                <TableCell>List invitations</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="GET" color="primary" size="small" /></TableCell>
                <TableCell><code>/v1/invitations/preview/:code</code></TableCell>
                <TableCell>Preview invitation</TableCell>
                <TableCell>No (public)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="POST" color="success" size="small" /></TableCell>
                <TableCell><code>/v1/invitations/accept</code></TableCell>
                <TableCell>Accept invitation</TableCell>
                <TableCell>No (public)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="DELETE" color="error" size="small" /></TableCell>
                <TableCell><code>/v1/invitations/:id</code></TableCell>
                <TableCell>Revoke invitation</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Email color="primary" />
          <Typography variant="h6">Send Email Invitation</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" paragraph>
          Send a personalized email invitation directly to a specific user. Ideal for formal 
          onboarding with known recipients.
        </Typography>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Request Example</Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <pre style={{ margin: 0, overflow: 'auto', fontSize: '0.85rem' }}>
{`POST /v1/invitations/send-email
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roleType": "client_employee"
}`}
          </pre>
        </Paper>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Features</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label="7-day expiration" size="small" variant="outlined" />
          <Chip label="Single use" size="small" variant="outlined" />
          <Chip label="Personalized email" size="small" variant="outlined" />
          <Chip label="Audit logging" size="small" variant="outlined" />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <LinkIcon color="primary" />
          <Typography variant="h6">Generate Shareable Link</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" paragraph>
          Generate a reusable invitation URL for distribution via any channel - job boards, 
          Slack, social media, or anywhere else.
        </Typography>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Request Example</Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <pre style={{ margin: 0, overflow: 'auto', fontSize: '0.85rem' }}>
{`POST /v1/invitations/generate-link
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "roleType": "client_employee",
  "maxUses": 10
}`}
          </pre>
        </Paper>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Use Cases</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Scenario</strong></TableCell>
                <TableCell><strong>Recommended maxUses</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Individual onboarding</TableCell>
                <TableCell>1 (default)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Team onboarding (known size)</TableCell>
                <TableCell>Exact team size</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bulk recruitment campaign</TableCell>
                <TableCell>50-100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Job posting with open applications</TableCell>
                <TableCell>100+</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Security color="primary" />
          <Typography variant="h6">S2S Authentication</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" paragraph>
          All invitation endpoints support Service-to-Service authentication for programmatic access 
          from your backend systems.
        </Typography>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Required Scopes</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Endpoint</strong></TableCell>
                <TableCell><strong>Required Scope</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>POST /send-email</TableCell>
                <TableCell><code>write:invitations</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>POST /generate-link</TableCell>
                <TableCell><code>write:invitations</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>GET /invitations</TableCell>
                <TableCell><code>read:invitations</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>DELETE /invitations/:id</TableCell>
                <TableCell><code>write:invitations</code></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            S2S tokens with organization-level bindings can only create invitations for their bound organizations.
          </Typography>
        </Alert>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Available Role Types</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><code>client_admin</code></TableCell>
                <TableCell>Full administrative access to the organization</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>client_hr</code></TableCell>
                <TableCell>HR management permissions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>client_finance</code></TableCell>
                <TableCell>Finance and payroll access</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>client_recruiter</code></TableCell>
                <TableCell>Recruitment and hiring access</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>client_employee</code></TableCell>
                <TableCell>Standard employee access</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>candidate</code></TableCell>
                <TableCell>Job candidate access</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default InvitationsApiPage;
