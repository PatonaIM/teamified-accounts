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
} from '@mui/icons-material';

export default function UserEmailsApiPage() {
  const apiUrl = window.location.origin;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Email color="primary" />
        User Emails API
      </Typography>

      <Typography variant="body1" paragraph>
        The User Emails API enables the <strong>Candidate + Employee Model</strong> - allowing users to link multiple email addresses (personal and work emails for different organizations) that all resolve to a single user identity. Users can log in with any linked email using a single password.
      </Typography>

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
              <li><strong>Organization Linking:</strong> Work emails can be associated with a specific organization for proper access control</li>
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
            Step 2: Provision Work Email on Organization Onboarding
          </Typography>
          <Typography variant="body1" paragraph>
            When an employee joins an organization, automatically create a work email linked to that organization. This is typically done during the organization member creation process.
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`// When adding a new employee to an organization
const addEmployeeToOrg = async (userId: string, orgId: string, workEmail: string) => {
  // 1. Add the work email to the user's account
  const response = await fetch('${apiUrl}/api/user-emails', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: workEmail,
      emailType: 'work',
      organizationId: orgId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to provision work email');
  }

  return response.json();
};`}
            </pre>
          </Paper>

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
                  <TableCell>Email already verified</TableCell>
                  <TableCell>Cannot resend verification for already verified email</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="400" color="warning" size="small" /></TableCell>
                  <TableCell>Token expired</TableCell>
                  <TableCell>Verification token has expired, request a new one</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="404" color="error" size="small" /></TableCell>
                  <TableCell>Email not found</TableCell>
                  <TableCell>The specified email ID does not exist or belong to the user</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="404" color="error" size="small" /></TableCell>
                  <TableCell>Invalid token</TableCell>
                  <TableCell>Verification token is invalid or not found</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="409" color="error" size="small" /></TableCell>
                  <TableCell>Email already exists</TableCell>
                  <TableCell>This email is already linked to a user account</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
}
