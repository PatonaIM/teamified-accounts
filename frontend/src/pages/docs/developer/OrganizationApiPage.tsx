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
import { Business, Email, Add } from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# Organization API

API reference for managing organizations, including creation with optional admin invitation, member management, and organization settings.

## Organization Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | \`/v1/organizations\` | Create new organization | Super Admin, Internal HR, Internal Account Manager |
| GET | \`/v1/organizations\` | List all organizations (paginated) | Super Admin, Internal roles |
| GET | \`/v1/organizations/check-slug/:slug\` | Check if slug is available | Any authenticated user |
| GET | \`/v1/organizations/by-slug/:slug\` | Get organization by slug | Super Admin, Internal roles, Client roles (own org) |
| GET | \`/v1/organizations/:id\` | Get organization by ID | Super Admin, Internal roles, Client Admin (own org) |
| GET | \`/v1/organizations/me\` | Get my organization | Client roles |
| PUT | \`/v1/organizations/:id\` | Update organization | Super Admin, Internal HR, Internal Account Manager, Client Admin (own org) |
| DELETE | \`/v1/organizations/:id\` | Delete organization | Super Admin, Internal HR, Internal Account Manager |

## Check Slug Availability

Check if an organization slug is available for use. This is useful for real-time validation during organization creation or client admin signup flows.

### Request

\`\`\`http
GET /v1/organizations/check-slug/:slug
Authorization: Bearer ACCESS_TOKEN
\`\`\`

### Response

\`\`\`json
{
  "available": true,
  "slug": "acme-corp"
}
\`\`\`

If the slug is already taken, \`available\` will be \`false\`.

## Get Organization by Slug

Retrieve organization details using the URL-friendly slug instead of the UUID.

### Request

\`\`\`http
GET /v1/organizations/by-slug/:slug
Authorization: Bearer ACCESS_TOKEN
\`\`\`

### Response

Returns the full organization response object (see below).

## Create Organization

Create a new organization. Super Admin, Internal HR, and Internal Account Manager roles can create organizations.

### Request Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`name\` | string | Required | Organization name (2-255 characters) |
| \`slug\` | string | Required | URL-friendly identifier (lowercase, alphanumeric, hyphens only) |
| \`industry\` | string | Optional | Industry of the organization |
| \`companySize\` | string | Optional | Size range (e.g., "1-10", "11-50", "51-200") |
| \`logoUrl\` | string | Optional | URL to organization logo |
| \`website\` | string | Optional | Organization website URL |
| \`subscriptionTier\` | enum | Optional | Subscription tier: free, basic, professional, enterprise, internal |
| \`subscriptionStatus\` | enum | Optional | Subscription status: active, inactive, suspended, cancelled |

### Example Request

\`\`\`http
POST /v1/organizations
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "industry": "Technology",
  "companySize": "51-200",
  "website": "https://acme.com",
  "subscriptionTier": "professional"
}
\`\`\`

> **Note:** Organizations are created empty (no members). Use the Add Member endpoint or the Invitations API to add team members after creation.

## Create Organization with Admin Invitation

You can streamline onboarding by creating an organization and sending a Client Admin invitation in a single flow. After creating the organization, immediately send an invitation using the Invitations API.

### Recommended Workflow

1. **Step 1: Create the Organization** - POST to \`/v1/organizations\` with organization details
2. **Step 2: Send Admin Invitation** - POST to \`/v1/invitations\` with the organization ID and admin email

### Example: Complete Onboarding Flow

\`\`\`javascript
// Step 1: Create Organization
POST /v1/organizations
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "name": "New Client Corp",
  "slug": "new-client-corp",
  "industry": "Finance"
}

// Response: { "id": "org-uuid-123", "name": "New Client Corp", ... }

// Step 2: Send Client Admin Invitation
POST /v1/invitations
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "email": "admin@newclientcorp.com",
  "organizationId": "org-uuid-123",
  "roleType": "client_admin",
  "sendEmail": true
}
\`\`\`

The invited user will receive an email with a link to set up their account and become the Client Admin for the new organization.

## Member Management Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | \`/v1/organizations/:id/members\` | List organization members | Super Admin, Internal HR, Internal Account Manager, Client Admin (own org) |
| POST | \`/v1/organizations/:id/members\` | Add member to organization | Super Admin, Internal HR, Internal Account Manager, Client Admin (own org) |
| PUT | \`/v1/organizations/:id/members/:userId\` | Update member role | Super Admin, Internal HR, Internal Account Manager, Client Admin (own org) |
| DELETE | \`/v1/organizations/:id/members/:userId\` | Remove member from organization | Super Admin, Internal HR, Internal Account Manager, Client Admin (own org) |

## Organization Response Object

\`\`\`json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "logoUrl": "https://storage.example.com/logos/acme.png",
  "industry": "Technology",
  "companySize": "51-200",
  "website": "https://acme.com",
  "settings": {},
  "subscriptionTier": "professional",
  "subscriptionStatus": "active",
  "memberCount": 25,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-11-20T14:45:00Z"
}
\`\`\`

## List Organization Members

Retrieve all members of an organization, including their role within the organization.

### Request

\`\`\`http
GET /v1/organizations/:id/members
Authorization: Bearer ACCESS_TOKEN
\`\`\`

### Response

\`\`\`json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "a0000000-0000-0000-0000-000000000001",
    "userEmail": "john.doe@acme.com",
    "userName": "John Doe",
    "profilePicture": "/objects/images/users/123_456.jpg",
    "roleType": "client_admin",
    "status": "active",
    "joinedAt": "2024-01-15T10:30:00Z",
    "invitedBy": "a0000000-0000-0000-0000-000000000002",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
\`\`\`

## Member Response Object

Each member object in the response contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | uuid | Member record unique identifier |
| \`organizationId\` | uuid | Organization ID this member belongs to |
| \`userId\` | uuid | User's unique identifier |
| \`userEmail\` | string | User's email address |
| \`userName\` | string | User's full name |
| \`profilePicture\` | string/null | URL to user's profile picture |
| \`roleType\` | enum | User's role in this organization (see Role Types below) |
| \`status\` | enum | Membership status: active, invited, or nlwf (no longer with firm) |
| \`joinedAt\` | datetime | When the user joined the organization |
| \`invitedBy\` | uuid/null | User ID of who invited this member |
| \`createdAt\` | datetime | Member record creation timestamp |

### Role Types

**Internal Roles** (Teamified organization):
- \`super_admin\` - Full system access
- \`internal_hr\` - HR management
- \`internal_finance\` - Finance operations
- \`internal_account_manager\` - Client relationship management
- \`internal_recruiter\` - Recruitment operations
- \`internal_marketing\` - Marketing operations
- \`internal_member\` - Basic internal access

**Client Roles** (Client organizations):
- \`client_admin\` - Organization administrator
- \`client_hr\` - HR management within organization
- \`client_finance\` - Finance operations within organization
- \`client_recruiter\` - Recruitment operations
- \`client_employee\` - Basic employee access
`;

export default function OrganizationApiPage() {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business color="primary" />
          Organization API
        </Typography>
        <DownloadMarkdownButton 
          filename="organization-api" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" paragraph>
        API reference for managing organizations, including creation with optional admin invitation, 
        member management, and organization settings.
      </Typography>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Organization Endpoints
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Required Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations</code></TableCell>
                  <TableCell>Create new organization</TableCell>
                  <TableCell>Super Admin, Internal HR, Internal Account Manager</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations</code></TableCell>
                  <TableCell>List all organizations (paginated)</TableCell>
                  <TableCell>Super Admin, Internal roles</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/check-slug/:slug</code></TableCell>
                  <TableCell>Check if slug is available</TableCell>
                  <TableCell>Any authenticated user</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/by-slug/:slug</code></TableCell>
                  <TableCell>Get organization by slug</TableCell>
                  <TableCell>Super Admin, Internal roles, Client roles (own org)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/:id</code></TableCell>
                  <TableCell>Get organization by ID</TableCell>
                  <TableCell>Super Admin, Internal roles, Client Admin (own org)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/me</code></TableCell>
                  <TableCell>Get my organization</TableCell>
                  <TableCell>Client roles</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="PUT" color="warning" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/:id</code></TableCell>
                  <TableCell>Update organization</TableCell>
                  <TableCell>Super Admin, Internal HR, Internal Account Manager, Client Admin (own org)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="DELETE" color="error" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/:id</code></TableCell>
                  <TableCell>Delete organization</TableCell>
                  <TableCell>Super Admin, Internal HR, Internal Account Manager</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Check Slug Availability
          </Typography>
          
          <Typography variant="body1" paragraph>
            Check if an organization slug is available for use. This is useful for real-time validation 
            during organization creation or client admin signup flows.
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`GET ${apiUrl}/v1/organizations/check-slug/acme-corp
Authorization: Bearer ACCESS_TOKEN`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Response
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`{
  "available": true,
  "slug": "acme-corp"
}`}
            </pre>
          </Paper>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              If the slug is already taken, <code>available</code> will be <code>false</code>.
            </Typography>
          </Alert>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Get Organization by Slug
          </Typography>
          
          <Typography variant="body1" paragraph>
            Retrieve organization details using the URL-friendly slug instead of the UUID. 
            Useful for building user-friendly URLs in client applications.
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`GET ${apiUrl}/v1/organizations/by-slug/acme-corp
Authorization: Bearer ACCESS_TOKEN`}
            </pre>
          </Paper>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Returns the full organization response object. Client roles can only access organizations they are a member of.
            </Typography>
          </Alert>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add color="primary" fontSize="small" />
            Create Organization
          </Typography>
          
          <Typography variant="body1" paragraph>
            Create a new organization. Super Admin, Internal HR, and Internal Account Manager roles can create organizations.
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Request Body Parameters
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Required</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>name</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell><Chip label="Required" color="error" size="small" /></TableCell>
                  <TableCell>Organization name (2-255 characters)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>slug</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell><Chip label="Required" color="error" size="small" /></TableCell>
                  <TableCell>URL-friendly identifier (lowercase, alphanumeric, hyphens only)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>industry</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell><Chip label="Optional" size="small" /></TableCell>
                  <TableCell>Industry of the organization</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>companySize</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell><Chip label="Optional" size="small" /></TableCell>
                  <TableCell>Size range (e.g., "1-10", "11-50", "51-200")</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>logoUrl</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell><Chip label="Optional" size="small" /></TableCell>
                  <TableCell>URL to organization logo</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>website</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell><Chip label="Optional" size="small" /></TableCell>
                  <TableCell>Organization website URL</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>subscriptionTier</code></TableCell>
                  <TableCell>enum</TableCell>
                  <TableCell><Chip label="Optional" size="small" /></TableCell>
                  <TableCell>Subscription tier: free, basic, professional, enterprise, internal</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>subscriptionStatus</code></TableCell>
                  <TableCell>enum</TableCell>
                  <TableCell><Chip label="Optional" size="small" /></TableCell>
                  <TableCell>Subscription status: active, inactive, suspended, cancelled</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Example Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/v1/organizations
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "industry": "Technology",
  "companySize": "51-200",
  "website": "https://acme.com",
  "subscriptionTier": "professional"
}`}
            </pre>
          </Paper>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Organizations are created empty (no members). Use the Add Member endpoint 
              or the Invitations API to add team members after creation.
            </Typography>
          </Alert>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email color="primary" fontSize="small" />
            Create Organization with Admin Invitation
          </Typography>
          
          <Typography variant="body1" paragraph>
            You can streamline onboarding by creating an organization and sending a Client Admin invitation in a single flow. 
            After creating the organization, immediately send an invitation using the Invitations API.
          </Typography>

          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>New in v1.0.0:</strong> This workflow enables internal users to onboard new client organizations 
              more efficiently by combining organization creation with admin invitation.
            </Typography>
          </Alert>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Recommended Workflow
          </Typography>
          
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Step 1: Create the Organization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                POST to <code>/v1/organizations</code> with organization details
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Step 2: Send Admin Invitation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                POST to <code>/v1/invitations</code> with the organization ID and admin email
              </Typography>
            </Paper>
          </Stack>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Example: Complete Onboarding Flow
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`// Step 1: Create Organization
POST ${apiUrl}/v1/organizations
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "name": "New Client Corp",
  "slug": "new-client-corp",
  "industry": "Finance"
}

// Response: { "id": "org-uuid-123", "name": "New Client Corp", ... }

// Step 2: Send Client Admin Invitation
POST ${apiUrl}/v1/invitations
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "email": "admin@newclientcorp.com",
  "organizationId": "org-uuid-123",
  "roleType": "client_admin",
  "sendEmail": true
}`}
            </pre>
          </Paper>

          <Alert severity="info">
            <Typography variant="body2">
              The invited user will receive an email with a link to set up their account and become the Client Admin 
              for the new organization.
            </Typography>
          </Alert>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Member Management Endpoints
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Required Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/:id/members</code></TableCell>
                  <TableCell>List organization members</TableCell>
                  <TableCell>Super Admin, Internal HR, Internal Account Manager, Client Admin (own org)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/:id/members</code></TableCell>
                  <TableCell>Add member to organization</TableCell>
                  <TableCell>Super Admin, Internal HR, Internal Account Manager, Client Admin (own org)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="PUT" color="warning" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/:id/members/:userId</code></TableCell>
                  <TableCell>Update member role</TableCell>
                  <TableCell>Super Admin, Internal HR, Internal Account Manager, Client Admin (own org)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="DELETE" color="error" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/:id/members/:userId</code></TableCell>
                  <TableCell>Remove member from organization</TableCell>
                  <TableCell>Super Admin, Internal HR, Internal Account Manager, Client Admin (own org)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            List Organization Members
          </Typography>
          
          <Typography variant="body1" paragraph>
            Retrieve all members of an organization, including their role within the organization.
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`GET ${apiUrl}/v1/organizations/:id/members
Authorization: Bearer ACCESS_TOKEN`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Response
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "a0000000-0000-0000-0000-000000000001",
    "userEmail": "john.doe@acme.com",
    "userName": "John Doe",
    "profilePicture": "/objects/images/users/123_456.jpg",
    "roleType": "client_admin",
    "status": "active",
    "joinedAt": "2024-01-15T10:30:00Z",
    "invitedBy": "a0000000-0000-0000-0000-000000000002",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Member Response Object
          </Typography>
          
          <Typography variant="body1" paragraph>
            Each member object in the response contains the following fields:
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>id</code></TableCell>
                  <TableCell>uuid</TableCell>
                  <TableCell>Member record unique identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizationId</code></TableCell>
                  <TableCell>uuid</TableCell>
                  <TableCell>Organization ID this member belongs to</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>userId</code></TableCell>
                  <TableCell>uuid</TableCell>
                  <TableCell>User's unique identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>userEmail</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>User's email address</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>userName</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>User's full name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>profilePicture</code></TableCell>
                  <TableCell>string/null</TableCell>
                  <TableCell>URL to user's profile picture</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>roleType</code></TableCell>
                  <TableCell>enum</TableCell>
                  <TableCell>User's role in this organization (see Role Types below)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>status</code></TableCell>
                  <TableCell>enum</TableCell>
                  <TableCell>Membership status: active, invited, or nlwf (no longer with firm)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>joinedAt</code></TableCell>
                  <TableCell>datetime</TableCell>
                  <TableCell>When the user joined the organization</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>invitedBy</code></TableCell>
                  <TableCell>uuid/null</TableCell>
                  <TableCell>User ID of who invited this member</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>createdAt</code></TableCell>
                  <TableCell>datetime</TableCell>
                  <TableCell>Member record creation timestamp</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Role Types
          </Typography>
          
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            Internal Roles (Teamified organization)
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><code>super_admin</code></TableCell>
                  <TableCell>Full system access</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_hr</code></TableCell>
                  <TableCell>HR management</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_finance</code></TableCell>
                  <TableCell>Finance operations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_account_manager</code></TableCell>
                  <TableCell>Client relationship management</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_recruiter</code></TableCell>
                  <TableCell>Recruitment operations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_marketing</code></TableCell>
                  <TableCell>Marketing operations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_member</code></TableCell>
                  <TableCell>Basic internal access</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Client Roles (Client organizations)
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><code>client_admin</code></TableCell>
                  <TableCell>Organization administrator</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>client_hr</code></TableCell>
                  <TableCell>HR management within organization</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>client_finance</code></TableCell>
                  <TableCell>Finance operations within organization</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>client_recruiter</code></TableCell>
                  <TableCell>Recruitment operations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>client_employee</code></TableCell>
                  <TableCell>Basic employee access</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Organization Response Object
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "logoUrl": "https://storage.example.com/logos/acme.png",
  "industry": "Technology",
  "companySize": "51-200",
  "website": "https://acme.com",
  "settings": {},
  "subscriptionTier": "professional",
  "subscriptionStatus": "active",
  "memberCount": 25,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-11-20T14:45:00Z"
}`}
            </pre>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
