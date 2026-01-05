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
  Link,
} from '@mui/material';
import {
  Email,
  PersonAdd,
  Work,
  Business,
  OpenInNew,
  Security,
  CheckCircle,
  AdminPanelSettings,
} from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# User Emails API

The User Emails API enables the **Candidate + Employee Model** - allowing users to link multiple email addresses (personal and work emails for different organizations) that all resolve to a single user identity. Users can log in with any linked email using a single password.

> **Employer-Driven Work Emails:** Work emails are provisioned exclusively through employer invitations during onboarding - users cannot self-add work emails. This ensures proper organizational control and identity verification.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | \`/api/user-emails\` | Get all emails linked to the current user | Bearer Token |
| POST | \`/api/user-emails\` | Add a new email to the current user account | Bearer Token |
| DELETE | \`/api/user-emails/:id\` | Remove an email from the current user account | Bearer Token |
| PUT | \`/api/user-emails/:id/set-primary\` | Set an email as the primary email | Bearer Token |
| POST | \`/api/user-emails/verify\` | Verify an email using verification token | None |
| POST | \`/api/user-emails/:id/resend-verification\` | Resend verification email | Bearer Token |

## Add Email

Add a new email address to the authenticated user's account. The email will require verification before it can be used for login.

\`\`\`
POST /api/user-emails
Authorization: Bearer <access_token>
Content-Type: application/json
\`\`\`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`email\` | string | Yes | Email address to add (e.g., "john.doe@company.com") |
| \`emailType\` | string | No | Type of email: \`"personal"\` (default) or \`"work"\` |
| \`organizationId\` | uuid | No | Organization ID to link work emails (required for work emails) |

### Example Request

\`\`\`json
{
  "email": "john.doe@acmecorp.com",
  "emailType": "work",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000"
}
\`\`\`

### Response (201 Created)

\`\`\`json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "john.doe@acmecorp.com",
  "emailType": "work",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "organizationName": "Acme Corporation",
  "isPrimary": false,
  "isVerified": false,
  "verifiedAt": null,
  "addedAt": "2025-12-13T10:30:00.000Z"
}
\`\`\`

## Response Schema

All email endpoints return or work with the following UserEmail object structure:

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | uuid | Unique identifier for the email record |
| \`email\` | string | The email address |
| \`emailType\` | enum | \`"personal"\` or \`"work"\` |
| \`organizationId\` | uuid \\| null | Associated organization ID for work emails |
| \`organizationName\` | string \\| null | Organization name (populated for work emails) |
| \`isPrimary\` | boolean | Whether this is the user's primary email |
| \`isVerified\` | boolean | Whether the email has been verified |
| \`verifiedAt\` | datetime \\| null | When the email was verified |
| \`addedAt\` | datetime | When the email was added to the account |

## Candidate + Employee Model

The Multi-Identity system enables users to have both a **Candidate** identity (personal email) and an **Employee** identity (work email linked to an organization) while maintaining a single account with one password.

### How It Works

1. **Single Password:** Users maintain one password that works with any of their linked email addresses
2. **Smart Identity Resolution:** When a user logs in, the system automatically resolves any linked email to the correct user account
3. **Email Types:** Personal emails are for individual/candidate use; work emails are linked to organizations
4. **Employer-Driven Work Emails:** Work emails are provisioned only via employer invitations, ensuring organizational control
5. **Account Linking:** When accepting a work email invitation, users can link to an existing personal account by providing their personal email and verifying with their password

## Enforcing the Candidate + Employee Model

### Step 1: Understand Email Types

\`\`\`typescript
type EmailType = "personal" | "work";

// Personal email: Used for candidate/individual identity
// Work email: Linked to an organization for employee identity
\`\`\`

### Step 2: Provision Work Email via Employer Invitation

Work emails are provisioned through the invitation acceptance flow:

\`\`\`json
// Employer sends invitation to work email
POST /api/v1/invitations
{
  "email": "john.doe@company.com",
  "organizationId": "org-uuid",
  "roleType": "employee"
}

// Employee accepts invitation - can optionally link existing account
POST /api/v1/invitations/accept
{
  "inviteCode": "abc123",
  "email": "john.doe@company.com",
  "password": "existingPassword123!",
  "confirmPassword": "existingPassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "personalEmail": "john.doe@gmail.com"
}
\`\`\`

### Step 3: Determine User Context Based on Login Email

\`\`\`typescript
const determineUserContext = async (accessToken: string) => {
  const emailsResponse = await fetch('/api/user-emails', {
    headers: { 'Authorization': \`Bearer \${accessToken}\` },
  });
  const emails = await emailsResponse.json();

  const userinfoResponse = await fetch('/sso/userinfo', {
    headers: { 'Authorization': \`Bearer \${accessToken}\` },
  });
  const userinfo = await userinfoResponse.json();
  const loginEmail = userinfo.email;

  const loginEmailRecord = emails.find(e => e.email === loginEmail);

  if (loginEmailRecord?.emailType === 'work') {
    return {
      context: 'employee',
      organizationId: loginEmailRecord.organizationId,
      organizationName: loginEmailRecord.organizationName,
    };
  } else {
    return {
      context: 'candidate',
      organizationId: null,
      organizationName: null,
    };
  }
};
\`\`\`

### Step 4: Route Users Based on Identity Context

\`\`\`typescript
const handlePostAuth = async (accessToken: string) => {
  const context = await determineUserContext(accessToken);

  switch (context.context) {
    case 'employee':
      window.location.href = \`/org/\${context.organizationId}/dashboard\`;
      break;
    case 'candidate':
      window.location.href = '/jobs';
      break;
  }
};
\`\`\`

## Security Considerations

- **Email Verification Required:** Newly added emails must be verified before they can be used for login or set as primary
- **Primary Email Protection:** The primary email cannot be removed until another verified email is set as primary
- **Organization Ownership:** Work emails should only be provisioned by organization administrators during onboarding
- **Single Password Policy:** Users maintain one password for all linked emails, simplifying credential management
- **Audit Trail:** All email additions, removals, and primary changes are logged for security auditing

## Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Cannot remove primary email | Set another email as primary before removing |
| 400 | Email not verified | Only verified emails can be set as primary |
| 400 | Email already exists | Email is already linked to an account |
| 404 | Email not found | The specified email ID doesn't exist |
`;

export default function UserEmailsApiPage() {
  const apiUrl = window.location.origin;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email color="primary" />
          User Emails API
        </Typography>
        <DownloadMarkdownButton 
          filename="user-emails-api" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" paragraph>
        The User Emails API enables the <strong>Candidate + Employee Model</strong> - allowing users to link multiple email addresses (personal and work emails for different organizations) that all resolve to a single user identity. Users can log in with any linked email using a single password.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Employer-Driven Work Emails:</strong> Work emails are provisioned exclusively through employer invitations during onboarding - users cannot self-add work emails. This ensures proper organizational control and identity verification.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Interactive API Documentation:</strong>{' '}
          <Link href={`${apiUrl}/api`} target="_blank" rel="noopener" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            Swagger/OpenAPI Reference <OpenInNew fontSize="small" />
          </Link>
        </Typography>
      </Alert>

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
                  <TableCell sx={{ fontWeight: 600 }}>Auth</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/api/user-emails</code></TableCell>
                  <TableCell>Get all emails linked to the current user</TableCell>
                  <TableCell><Chip label="Bearer Token" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/api/user-emails</code></TableCell>
                  <TableCell>Add a new email to the current user account</TableCell>
                  <TableCell><Chip label="Bearer Token" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="DELETE" color="error" size="small" /></TableCell>
                  <TableCell><code>/api/user-emails/:id</code></TableCell>
                  <TableCell>Remove an email from the current user account</TableCell>
                  <TableCell><Chip label="Bearer Token" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="PUT" color="warning" size="small" /></TableCell>
                  <TableCell><code>/api/user-emails/:id/set-primary</code></TableCell>
                  <TableCell>Set an email as the primary email</TableCell>
                  <TableCell><Chip label="Bearer Token" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/api/user-emails/verify</code></TableCell>
                  <TableCell>Verify an email using verification token</TableCell>
                  <TableCell><Chip label="None" color="default" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/api/user-emails/:id/resend-verification</code></TableCell>
                  <TableCell>Resend verification email</TableCell>
                  <TableCell><Chip label="Bearer Token" size="small" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettings color="primary" fontSize="small" />
            Admin API Endpoints
          </Typography>
          
          <Typography variant="body1" paragraph>
            Admin endpoints allow authorized roles to manage email addresses for other users. These endpoints support both JWT authentication and Service-to-Service (S2S) authentication for programmatic access.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Authorized Roles:</strong> super_admin, internal_hr, internal_account_manager, client_admin, client_hr
            </Typography>
          </Alert>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>S2S Scopes Required:</strong> <code>read:user-emails</code> for GET operations, <code>write:user-emails</code> for POST/PUT/DELETE operations
            </Typography>
          </Alert>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>S2S Scope</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/api/v1/users/:userId/emails</code></TableCell>
                  <TableCell>Get all emails for a specific user</TableCell>
                  <TableCell><code>read:user-emails</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/api/v1/users/:userId/emails</code></TableCell>
                  <TableCell>Add an email to a specific user</TableCell>
                  <TableCell><code>write:user-emails</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="PUT" color="warning" size="small" /></TableCell>
                  <TableCell><code>/api/v1/users/:userId/emails/:emailId</code></TableCell>
                  <TableCell>Update an email for a specific user</TableCell>
                  <TableCell><code>write:user-emails</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="DELETE" color="error" size="small" /></TableCell>
                  <TableCell><code>/api/v1/users/:userId/emails/:emailId</code></TableCell>
                  <TableCell>Remove an email from a specific user</TableCell>
                  <TableCell><code>write:user-emails</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="PUT" color="warning" size="small" /></TableCell>
                  <TableCell><code>/api/v1/users/:userId/emails/:emailId/set-primary</code></TableCell>
                  <TableCell>Set an email as primary for a specific user</TableCell>
                  <TableCell><code>write:user-emails</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="PUT" color="warning" size="small" /></TableCell>
                  <TableCell><code>/api/v1/users/:userId/emails/:emailId/verify</code></TableCell>
                  <TableCell>Manually verify an email (Admin bypass)</TableCell>
                  <TableCell><code>write:user-emails</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettings color="primary" fontSize="small" />
            Admin Add Email
          </Typography>
          
          <Typography variant="body1" paragraph>
            Add an email address to any user's account. Admins can optionally skip verification to immediately activate the email.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST /api/v1/users/:userId/emails
Authorization: Bearer <access_token or service_token>
Content-Type: application/json`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Request Body
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
                  <TableCell><code>email</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell><Chip label="Yes" color="error" size="small" /></TableCell>
                  <TableCell>Email address to add</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>emailType</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell><code>"personal"</code> (default) or <code>"work"</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizationId</code></TableCell>
                  <TableCell><Chip label="uuid" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell>Organization ID for work emails</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>isPrimary</code></TableCell>
                  <TableCell><Chip label="boolean" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell>Set as primary email (default: false)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>skipVerification</code></TableCell>
                  <TableCell><Chip label="boolean" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell>Skip email verification (default: false)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Example: Add Pre-Verified Work Email
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`{
  "email": "john.doe@company.com",
  "emailType": "work",
  "organizationId": "650e8400-e29b-41d4-a716-ee934041b3e8",
  "skipVerification": true
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettings color="primary" fontSize="small" />
            Admin Update Email
          </Typography>
          
          <Typography variant="body1" paragraph>
            Update an existing email address for any user. Unlike self-service, admins can update work emails and optionally skip re-verification.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`PUT /api/v1/users/:userId/emails/:emailId
Authorization: Bearer <access_token or service_token>
Content-Type: application/json`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Request Body
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
                  <TableCell><code>email</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell><Chip label="Yes" color="error" size="small" /></TableCell>
                  <TableCell>New email address</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>skipVerification</code></TableCell>
                  <TableCell><Chip label="boolean" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell>Skip email verification (default: false)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Example Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`{
  "email": "jane.smith@newdomain.com",
  "skipVerification": true
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettings color="primary" fontSize="small" />
            S2S Authentication Example
          </Typography>
          
          <Typography variant="body1" paragraph>
            Service-to-Service (S2S) authentication allows backend systems to manage user emails programmatically using OAuth 2.0 Client Credentials Grant.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Step 1: Obtain S2S Token
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST /api/v1/sso/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=read:user-emails write:user-emails`}
            </pre>
          </Paper>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Step 2: Use S2S Token for Admin Operations
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`// Get user emails
GET /api/v1/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890/emails
Authorization: Bearer <s2s_access_token>

// Add email to user
POST /api/v1/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890/emails
Authorization: Bearer <s2s_access_token>
Content-Type: application/json

{
  "email": "new.email@company.com",
  "emailType": "work",
  "organizationId": "650e8400-e29b-41d4-a716-ee934041b3e8",
  "skipVerification": true
}`}
            </pre>
          </Paper>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>OAuth Client Setup:</strong> Enable "Client Credentials Grant" and add the <code>read:user-emails</code> and <code>write:user-emails</code> scopes in your OAuth Client configuration.
            </Typography>
          </Alert>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd color="primary" fontSize="small" />
            Add Email
          </Typography>
          
          <Typography variant="body1" paragraph>
            Add a new email address to the authenticated user's account. The email will require verification before it can be used for login.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/api/user-emails
Authorization: Bearer <access_token>
Content-Type: application/json`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Request Body
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
                  <TableCell><code>email</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell><Chip label="Yes" color="error" size="small" /></TableCell>
                  <TableCell>Email address to add (e.g., "john.doe@company.com")</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>emailType</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell>Type of email: <code>"personal"</code> (default) or <code>"work"</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizationId</code></TableCell>
                  <TableCell><Chip label="uuid" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell>Organization ID to link work emails (required for work emails)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Example Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`{
  "email": "john.doe@acmecorp.com",
  "emailType": "work",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000"
}`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Response (201 Created)
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "john.doe@acmecorp.com",
  "emailType": "work",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "organizationName": "Acme Corporation",
  "isPrimary": false,
  "isVerified": false,
  "verifiedAt": null,
  "addedAt": "2025-12-13T10:30:00.000Z"
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="primary" fontSize="small" />
            Response Schema
          </Typography>
          
          <Typography variant="body1" paragraph>
            All email endpoints return or work with the following UserEmail object structure:
          </Typography>

          <TableContainer component={Paper}>
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
                  <TableCell><Chip label="uuid" size="small" /></TableCell>
                  <TableCell>Unique identifier for the email record</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>email</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell>The email address</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>emailType</code></TableCell>
                  <TableCell><Chip label="enum" size="small" /></TableCell>
                  <TableCell><code>"personal"</code> or <code>"work"</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizationId</code></TableCell>
                  <TableCell><Chip label="uuid | null" size="small" /></TableCell>
                  <TableCell>Associated organization ID for work emails</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizationName</code></TableCell>
                  <TableCell><Chip label="string | null" size="small" /></TableCell>
                  <TableCell>Organization name (populated for work emails)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>isPrimary</code></TableCell>
                  <TableCell><Chip label="boolean" size="small" /></TableCell>
                  <TableCell>Whether this is the user's primary email</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>isVerified</code></TableCell>
                  <TableCell><Chip label="boolean" size="small" /></TableCell>
                  <TableCell>Whether the email has been verified</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>verifiedAt</code></TableCell>
                  <TableCell><Chip label="datetime | null" size="small" /></TableCell>
                  <TableCell>When the email was verified</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>addedAt</code></TableCell>
                  <TableCell><Chip label="datetime" size="small" /></TableCell>
                  <TableCell>When the email was added to the account</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Work color="primary" fontSize="small" />
            Candidate + Employee Model
          </Typography>
          
          <Typography variant="body1" paragraph>
            The Multi-Identity system enables users to have both a <strong>Candidate</strong> identity (personal email) and an <strong>Employee</strong> identity (work email linked to an organization) while maintaining a single account with one password.
          </Typography>

          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Key Benefit:</strong> Users can seamlessly switch between their candidate profile (for job applications) and employee profile (for workplace tools) without managing separate accounts or passwords.
            </Typography>
          </Alert>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            How It Works
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: 'background.default', mb: 3 }}>
            <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li><strong>Single Password:</strong> Users maintain one password that works with any of their linked email addresses</li>
              <li><strong>Smart Identity Resolution:</strong> When a user logs in, the system automatically resolves any linked email to the correct user account</li>
              <li><strong>Email Types:</strong> Personal emails are for individual/candidate use; work emails are linked to organizations</li>
              <li><strong>Employer-Driven Work Emails:</strong> Work emails are provisioned only via employer invitations, ensuring organizational control</li>
              <li><strong>Account Linking:</strong> When accepting a work email invitation, users can link to an existing personal account by providing their personal email and verifying with their password</li>
            </ol>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" fontSize="small" />
            Enforcing the Candidate + Employee Model
          </Typography>
          
          <Typography variant="body1" paragraph>
            Follow these steps to implement and enforce the Candidate + Employee model in your client application:
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Step 1: Understand Email Types
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`// Email types in the system
type EmailType = "personal" | "work";

// Personal email: Used for candidate/individual identity
// Work email: Linked to an organization for employee identity`}
            </pre>
          </Paper>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Step 2: Provision Work Email via Employer Invitation
          </Typography>
          <Typography variant="body1" paragraph>
            Work emails are provisioned through the invitation acceptance flow. When an employer invites someone via work email, the employee can optionally link to an existing personal account during acceptance.
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`// Employer sends invitation to work email
// POST /api/v1/invitations
{
  "email": "john.doe@company.com",  // Work email
  "organizationId": "org-uuid",
  "roleType": "employee"
}

// Employee accepts invitation - can optionally link existing account
// POST /api/v1/invitations/accept
{
  "inviteCode": "abc123",
  "email": "john.doe@company.com",
  "password": "existingPassword123!",  // For linking: use existing password
  "confirmPassword": "existingPassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "personalEmail": "john.doe@gmail.com"  // Optional: link to existing account
}

// Result: Work email is automatically linked to user's account
// User can now log in with either john.doe@company.com or john.doe@gmail.com`}
            </pre>
          </Paper>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Account Linking:</strong> When the employee provides their personal email during invitation acceptance, the system verifies their existing password to prove account ownership, then links the work email to that account.
            </Typography>
          </Alert>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Step 3: Determine User Context Based on Login Email
          </Typography>
          <Typography variant="body1" paragraph>
            After authentication, check which email the user logged in with to determine their current context (candidate vs. employee).
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`// After SSO callback, check user's emails to determine context
const determineUserContext = async (accessToken: string) => {
  // Get all linked emails
  const emailsResponse = await fetch('${apiUrl}/api/user-emails', {
    headers: { 'Authorization': \`Bearer \${accessToken}\` },
  });
  const emails = await emailsResponse.json();

  // Get the email used for login from userinfo
  const userinfoResponse = await fetch('${apiUrl}/sso/userinfo', {
    headers: { 'Authorization': \`Bearer \${accessToken}\` },
  });
  const userinfo = await userinfoResponse.json();
  const loginEmail = userinfo.email;

  // Find the email record for the login email
  const loginEmailRecord = emails.find(e => e.email === loginEmail);

  if (loginEmailRecord?.emailType === 'work') {
    // User logged in as Employee
    return {
      context: 'employee',
      organizationId: loginEmailRecord.organizationId,
      organizationName: loginEmailRecord.organizationName,
    };
  } else {
    // User logged in as Candidate
    return {
      context: 'candidate',
      organizationId: null,
      organizationName: null,
    };
  }
};`}
            </pre>
          </Paper>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Step 4: Route Users Based on Identity Context
          </Typography>
          <Typography variant="body1" paragraph>
            Use the determined context to route users to the appropriate application or feature set.
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`// Route based on user context
const handlePostAuth = async (accessToken: string) => {
  const context = await determineUserContext(accessToken);

  switch (context.context) {
    case 'employee':
      // Redirect to organization-specific dashboard
      window.location.href = \`/org/\${context.organizationId}/dashboard\`;
      break;
    case 'candidate':
      // Redirect to job seeker/candidate portal
      window.location.href = '/jobs';
      break;
  }
};`}
            </pre>
          </Paper>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Step 5: Allow Identity Switching
          </Typography>
          <Typography variant="body1" paragraph>
            Provide a way for users to switch between their candidate and employee identities without re-authentication.
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`// Identity switcher component logic
const IdentitySwitcher = ({ emails, currentContext, onSwitch }) => {
  const personalEmails = emails.filter(e => e.emailType === 'personal');
  const workEmails = emails.filter(e => e.emailType === 'work');

  return (
    <div>
      {/* Show option to switch to candidate mode */}
      {currentContext !== 'candidate' && personalEmails.length > 0 && (
        <button onClick={() => onSwitch('candidate')}>
          Switch to Candidate Profile
        </button>
      )}

      {/* Show options to switch to employee mode for each organization */}
      {workEmails.map(email => (
        <button
          key={email.id}
          onClick={() => onSwitch('employee', email.organizationId)}
        >
          Switch to {email.organizationName}
        </button>
      ))}
    </div>
  );
};`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" fontSize="small" />
            Security Considerations
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li><strong>Email Verification Required:</strong> Newly added emails must be verified before they can be used for login or set as primary</li>
              <li><strong>Primary Email Protection:</strong> The primary email cannot be removed until another verified email is set as primary</li>
              <li><strong>Organization Ownership:</strong> Work emails should only be provisioned by organization administrators during onboarding</li>
              <li><strong>Single Password Policy:</strong> Users maintain one password for all linked emails, simplifying credential management</li>
              <li><strong>Audit Trail:</strong> All email additions, removals, and primary changes are logged for security auditing</li>
            </ul>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Error Responses
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Error</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="400" color="warning" size="small" /></TableCell>
                  <TableCell>Cannot remove primary email</TableCell>
                  <TableCell>Set another email as primary before removing</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="400" color="warning" size="small" /></TableCell>
                  <TableCell>Email not verified</TableCell>
                  <TableCell>Only verified emails can be set as primary</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="400" color="warning" size="small" /></TableCell>
                  <TableCell>Email already exists</TableCell>
                  <TableCell>Email is already linked to an account</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="404" color="error" size="small" /></TableCell>
                  <TableCell>Email not found</TableCell>
                  <TableCell>The specified email ID doesn't exist</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
}
