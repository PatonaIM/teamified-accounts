import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import {
  Email,
  PersonAdd,
  Business,
  Security,
} from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# Invitations API

The Invitations API enables organizations to invite users to join as members with specific roles. Invitations support configurable expiry, usage limits, and can be sent via email or shared as direct links.

## API Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | \`/v1/invitations\` | List all invitations | Super Admin, Client Admin, Client HR |
| GET | \`/v1/invitations/:id\` | Get invitation by ID | Super Admin, Client Admin, Client HR |
| POST | \`/v1/invitations\` | Create a new invitation | Super Admin, Client Admin |
| DELETE | \`/v1/invitations/:id\` | Delete/cancel an invitation | Super Admin, Client Admin |
| POST | \`/v1/invitations/generate-link\` | Generate shareable invitation link | Super Admin, Client Admin |
| POST | \`/v1/invitations/send-email\` | Send invitation email | Super Admin, Client Admin |
| GET | \`/v1/invitations/preview/:code\` | Preview invitation (public) | None |
| POST | \`/v1/invitations/accept\` | Accept invitation (public) | None |
| POST | \`/v1/invitations/accept-authenticated\` | Accept invitation (authenticated) | Bearer Token |

## S2S (Service-to-Service) Access

For programmatic access via service tokens, the following scopes are available:

| Scope | Description |
|-------|-------------|
| \`read:invitations\` | List and view invitations |
| \`write:invitations\` | Create, update, and delete invitations |

## List Invitations

Retrieve all invitations. Client roles can only view invitations for their own organizations.

### Request

\`\`\`http
GET /v1/invitations
Authorization: Bearer ACCESS_TOKEN
\`\`\`

### Response

\`\`\`json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "organizationName": "Acme Corporation",
    "inviteCode": "abc123xyz",
    "invitedBy": "a0000000-0000-0000-0000-000000000001",
    "roleType": "client_hr",
    "status": "pending",
    "expiresAt": "2025-01-15T10:30:00Z",
    "maxUses": 1,
    "currentUses": 0,
    "createdAt": "2024-12-15T10:30:00Z",
    "invitationUrl": "https://accounts.teamified.com/invitations/accept/abc123xyz"
  }
]
\`\`\`

## Create Invitation

Create a new invitation to join an organization with a specific role.

### Request

\`\`\`http
POST /v1/invitations
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json
\`\`\`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`organizationId\` | uuid | Yes | Organization to invite user to |
| \`roleType\` | enum | Yes | Role to assign (see Role Types below) |
| \`maxUses\` | integer | No | Maximum uses (null for unlimited) |

### Example Request

\`\`\`json
{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "roleType": "client_hr",
  "maxUses": 1
}
\`\`\`

### Response (201 Created)

Returns the created invitation object (see Response Schema below).

## Generate Invitation Link

Generate a shareable invitation link for an existing invitation.

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

### Response

\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "inviteCode": "abc123xyz",
  "invitationUrl": "https://accounts.teamified.com/invitations/accept/abc123xyz",
  "expiresAt": "2025-01-15T10:30:00Z"
}
\`\`\`

## Send Invitation Email

Send an invitation email to a specific recipient.

### Request

\`\`\`http
POST /v1/invitations/send-email
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "roleType": "client_hr"
}
\`\`\`

## Preview Invitation (Public)

Preview invitation details before accepting. This is a public endpoint used by the invitation acceptance page.

### Request

\`\`\`http
GET /v1/invitations/preview/:code
\`\`\`

### Response

\`\`\`json
{
  "organizationName": "Acme Corporation",
  "roleType": "client_hr",
  "expiresAt": "2025-01-15T10:30:00Z",
  "isValid": true
}
\`\`\`

## Accept Invitation (Public)

Accept an invitation and create a new user account.

### Request

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

### Response (201 Created)

Returns user and authentication tokens upon successful acceptance.

## Accept Invitation (Authenticated)

Accept an invitation for an already logged-in user. This links the invitation to the existing account.

### Request

\`\`\`http
POST /v1/invitations/accept-authenticated
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "code": "abc123xyz"
}
\`\`\`

## Delete Invitation

Cancel/delete an invitation. The invitation will no longer be usable.

### Request

\`\`\`http
DELETE /v1/invitations/:id
Authorization: Bearer ACCESS_TOKEN
\`\`\`

### Response

\`\`\`json
{
  "message": "Invitation deleted successfully"
}
\`\`\`

## Invitation Response Object

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | uuid | Invitation unique identifier |
| \`organizationId\` | uuid | Target organization ID |
| \`organizationName\` | string | Target organization name |
| \`inviteCode\` | string | Unique invitation code |
| \`invitedBy\` | uuid | User ID who created the invitation |
| \`roleType\` | enum | Role to be assigned upon acceptance |
| \`status\` | enum | Invitation status (see Status Values) |
| \`expiresAt\` | datetime | Expiration timestamp |
| \`maxUses\` | integer/null | Maximum allowed uses (null = unlimited) |
| \`currentUses\` | integer | Number of times invitation has been used |
| \`createdAt\` | datetime | Creation timestamp |
| \`invitationUrl\` | string | Full shareable URL (if generated) |

## Status Values

| Status | Description |
|--------|-------------|
| \`pending\` | Invitation is active and can be accepted |
| \`accepted\` | Invitation has been used |
| \`expired\` | Invitation has passed its expiry date |
| \`cancelled\` | Invitation was manually cancelled/deleted |

## Role Types

Roles that can be assigned via invitations:

**Client Roles:**
| Role | Description |
|------|-------------|
| \`client_admin\` | Organization administrator with full access |
| \`client_hr\` | HR management within organization |
| \`client_finance\` | Finance operations within organization |
| \`client_recruiter\` | Recruitment operations |
| \`client_employee\` | Basic employee access |

**Internal Roles** (Super Admin only):
| Role | Description |
|------|-------------|
| \`internal_hr\` | Teamified HR team member |
| \`internal_finance\` | Teamified Finance team member |
| \`internal_account_manager\` | Client relationship manager |
| \`internal_recruiter\` | Teamified recruiter |
| \`internal_marketing\` | Teamified marketing team member |
| \`internal_member\` | Basic Teamified employee |

## Access Control Summary

| Action | Super Admin | Internal Roles | Client Admin | Client HR |
|--------|-------------|----------------|--------------|-----------|
| List all invitations | Yes | No | Own org only | Own org only |
| View invitation | Yes | No | Own org only | Own org only |
| Create invitation | Yes | No | Own org only | No |
| Delete invitation | Yes | No | Own org only | No |
| Generate link | Yes | No | Own org only | No |
| Send email | Yes | No | Own org only | No |

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Invalid request (missing fields, invalid role type) |
| 401 | Unauthorized (invalid or missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Invitation not found |
| 409 | Conflict (invitation already exists for this email/org) |
| 410 | Gone (invitation expired or cancelled) |
`;

export default function InvitationsApiPage() {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email color="primary" />
          Invitations API
        </Typography>
        <DownloadMarkdownButton 
          filename="invitations-api" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" paragraph>
        The Invitations API enables organizations to invite users to join as members with specific roles. 
        Invitations support configurable expiry, usage limits, and can be sent via email or shared as direct links.
      </Typography>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            API Endpoints
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
                  <TableCell><code>/v1/invitations</code></TableCell>
                  <TableCell>List all invitations</TableCell>
                  <TableCell>Super Admin, Client Admin, Client HR</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/invitations/:id</code></TableCell>
                  <TableCell>Get invitation by ID</TableCell>
                  <TableCell>Super Admin, Client Admin, Client HR</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/v1/invitations</code></TableCell>
                  <TableCell>Create a new invitation</TableCell>
                  <TableCell>Super Admin, Client Admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="DELETE" color="error" size="small" /></TableCell>
                  <TableCell><code>/v1/invitations/:id</code></TableCell>
                  <TableCell>Delete/cancel an invitation</TableCell>
                  <TableCell>Super Admin, Client Admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/v1/invitations/generate-link</code></TableCell>
                  <TableCell>Generate shareable invitation link</TableCell>
                  <TableCell>Super Admin, Client Admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/v1/invitations/send-email</code></TableCell>
                  <TableCell>Send invitation email</TableCell>
                  <TableCell>Super Admin, Client Admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/invitations/preview/:code</code></TableCell>
                  <TableCell>Preview invitation (public)</TableCell>
                  <TableCell>None (public)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/v1/invitations/accept</code></TableCell>
                  <TableCell>Accept invitation (public)</TableCell>
                  <TableCell>None (public)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/v1/invitations/accept-authenticated</code></TableCell>
                  <TableCell>Accept invitation (authenticated)</TableCell>
                  <TableCell>Bearer Token</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security fontSize="small" color="primary" />
            S2S (Service-to-Service) Access
          </Typography>
          <Typography variant="body1" paragraph>
            For programmatic access via service tokens, the following scopes are available:
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Scope</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>read:invitations</code></TableCell>
                  <TableCell>List and view invitations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>write:invitations</code></TableCell>
                  <TableCell>Create, update, and delete invitations</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            List Invitations
          </Typography>
          
          <Typography variant="body1" paragraph>
            Retrieve all invitations. Client roles can only view invitations for their own organizations.
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`GET ${apiUrl}/v1/invitations
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
    "organizationName": "Acme Corporation",
    "inviteCode": "abc123xyz",
    "invitedBy": "a0000000-0000-0000-0000-000000000001",
    "roleType": "client_hr",
    "status": "pending",
    "expiresAt": "2025-01-15T10:30:00Z",
    "maxUses": 1,
    "currentUses": 0,
    "createdAt": "2024-12-15T10:30:00Z",
    "invitationUrl": "https://accounts.teamified.com/invitations/accept/abc123xyz"
  }
]`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd fontSize="small" color="primary" />
            Create Invitation
          </Typography>
          
          <Typography variant="body1" paragraph>
            Create a new invitation to join an organization with a specific role.
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
                  <TableCell><code>organizationId</code></TableCell>
                  <TableCell>uuid</TableCell>
                  <TableCell><Chip label="Required" color="error" size="small" /></TableCell>
                  <TableCell>Organization to invite user to</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>roleType</code></TableCell>
                  <TableCell>enum</TableCell>
                  <TableCell><Chip label="Required" color="error" size="small" /></TableCell>
                  <TableCell>Role to assign (see Role Types below)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>maxUses</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell><Chip label="Optional" size="small" /></TableCell>
                  <TableCell>Maximum uses (null for unlimited)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Example Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/v1/invitations
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "roleType": "client_hr",
  "maxUses": 1
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Generate Invitation Link
          </Typography>
          
          <Typography variant="body1" paragraph>
            Generate a shareable invitation link. Useful for batch invitations or sharing via messaging platforms.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/v1/invitations/generate-link
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "roleType": "client_employee",
  "maxUses": 10
}`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Response
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "inviteCode": "abc123xyz",
  "invitationUrl": "${apiUrl}/invitations/accept/abc123xyz",
  "expiresAt": "2025-01-15T10:30:00Z"
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email fontSize="small" color="primary" />
            Send Invitation Email
          </Typography>
          
          <Typography variant="body1" paragraph>
            Send an invitation email directly to a recipient's email address.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/v1/invitations/send-email
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "roleType": "client_hr"
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Preview Invitation (Public)
          </Typography>
          
          <Typography variant="body1" paragraph>
            Preview invitation details before accepting. This endpoint is public and used by the invitation acceptance page.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`GET ${apiUrl}/v1/invitations/preview/abc123xyz`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Response
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`{
  "organizationName": "Acme Corporation",
  "roleType": "client_hr",
  "expiresAt": "2025-01-15T10:30:00Z",
  "isValid": true
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Accept Invitation (Public)
          </Typography>
          
          <Typography variant="body1" paragraph>
            Accept an invitation and create a new user account. This is used when a new user accepts an invitation.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/v1/invitations/accept
Content-Type: application/json

{
  "code": "abc123xyz",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}`}
            </pre>
          </Paper>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Upon successful acceptance, the user account is created and authentication tokens are returned.
            </Typography>
          </Alert>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Accept Invitation (Authenticated)
          </Typography>
          
          <Typography variant="body1" paragraph>
            Accept an invitation for an already logged-in user. This links the invitation to the existing account, 
            allowing users to join additional organizations.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/v1/invitations/accept-authenticated
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "code": "abc123xyz"
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Invitation Response Object
          </Typography>
          
          <Typography variant="body1" paragraph>
            All invitation endpoints return or work with the following invitation object structure:
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
                  <TableCell>Invitation unique identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizationId</code></TableCell>
                  <TableCell>uuid</TableCell>
                  <TableCell>Target organization ID</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizationName</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Target organization name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>inviteCode</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Unique invitation code</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>invitedBy</code></TableCell>
                  <TableCell>uuid</TableCell>
                  <TableCell>User ID who created the invitation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>roleType</code></TableCell>
                  <TableCell>enum</TableCell>
                  <TableCell>Role to be assigned upon acceptance</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>status</code></TableCell>
                  <TableCell>enum</TableCell>
                  <TableCell>Invitation status (see Status Values)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>expiresAt</code></TableCell>
                  <TableCell>datetime</TableCell>
                  <TableCell>Expiration timestamp</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>maxUses</code></TableCell>
                  <TableCell>integer/null</TableCell>
                  <TableCell>Maximum allowed uses (null = unlimited)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>currentUses</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Number of times invitation has been used</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>createdAt</code></TableCell>
                  <TableCell>datetime</TableCell>
                  <TableCell>Creation timestamp</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>invitationUrl</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Full shareable URL (if generated)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Status Values
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="pending" color="warning" size="small" /></TableCell>
                  <TableCell>Invitation is active and can be accepted</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="accepted" color="success" size="small" /></TableCell>
                  <TableCell>Invitation has been used</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="expired" color="default" size="small" /></TableCell>
                  <TableCell>Invitation has passed its expiry date</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="cancelled" color="error" size="small" /></TableCell>
                  <TableCell>Invitation was manually cancelled/deleted</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business fontSize="small" color="primary" />
            Role Types
          </Typography>
          
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            Client Roles
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><code>client_admin</code></TableCell>
                  <TableCell>Organization administrator with full access</TableCell>
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

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Internal Roles (Super Admin only)
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><code>internal_hr</code></TableCell>
                  <TableCell>Teamified HR team member</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_finance</code></TableCell>
                  <TableCell>Teamified Finance team member</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_account_manager</code></TableCell>
                  <TableCell>Client relationship manager</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_recruiter</code></TableCell>
                  <TableCell>Teamified recruiter</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_marketing</code></TableCell>
                  <TableCell>Teamified marketing team member</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>internal_member</code></TableCell>
                  <TableCell>Basic Teamified employee</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Access Control Summary
          </Typography>
          
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Super Admin</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Internal Roles</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Client Admin</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Client HR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>List invitations</TableCell>
                  <TableCell><Chip label="All" color="success" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell><Chip label="Own org" color="warning" size="small" /></TableCell>
                  <TableCell><Chip label="Own org" color="warning" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>View invitation</TableCell>
                  <TableCell><Chip label="All" color="success" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell><Chip label="Own org" color="warning" size="small" /></TableCell>
                  <TableCell><Chip label="Own org" color="warning" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Create invitation</TableCell>
                  <TableCell><Chip label="Yes" color="success" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell><Chip label="Own org" color="warning" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Delete invitation</TableCell>
                  <TableCell><Chip label="Yes" color="success" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell><Chip label="Own org" color="warning" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Generate link</TableCell>
                  <TableCell><Chip label="Yes" color="success" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell><Chip label="Own org" color="warning" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Send email</TableCell>
                  <TableCell><Chip label="Yes" color="success" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell><Chip label="Own org" color="warning" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Error Responses
          </Typography>
          
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="400" size="small" /></TableCell>
                  <TableCell>Invalid request (missing fields, invalid role type)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="401" size="small" /></TableCell>
                  <TableCell>Unauthorized (invalid or missing token)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="403" size="small" /></TableCell>
                  <TableCell>Forbidden (insufficient permissions)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="404" size="small" /></TableCell>
                  <TableCell>Invitation not found</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="409" size="small" /></TableCell>
                  <TableCell>Conflict (invitation already exists for this email/org)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="410" size="small" /></TableCell>
                  <TableCell>Gone (invitation expired or cancelled)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
}
