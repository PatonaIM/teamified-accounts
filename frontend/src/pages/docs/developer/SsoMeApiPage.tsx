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
import { Person, Key, Security, CheckCircle } from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# SSO User Info API (/api/v1/sso/me)

The \`/api/v1/sso/me\` endpoint returns the authenticated user's profile information from their JWT access token. This is the primary endpoint for client applications to retrieve user details after SSO authentication.

> **Token-Based Response:** This endpoint decodes the JWT access token and returns all user profile fields directly from the token payload, making it extremely fast with no database lookups required.

## Endpoint

\`\`\`
GET /api/v1/sso/me
Authorization: Bearer <access_token>
\`\`\`

### Authentication

Requires a valid JWT access token obtained from the OAuth 2.0 token exchange. Pass the token in the \`Authorization\` header with the \`Bearer\` scheme.

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| \`sub\` | string | User's unique identifier (UUID) |
| \`email\` | string | User's primary email address |
| \`firstName\` | string | User's first name |
| \`lastName\` | string | User's last name |
| \`fullName\` | string | Pre-formatted full name ("FirstName LastName"). Falls back to email username if name is empty. |
| \`initials\` | string | User's initials (e.g., "JD" for John Doe). Useful for avatar fallbacks. |
| \`profilePicture\` | string \\| null | URL to the user's profile picture, or null if not set |
| \`phoneNumber\` | string \\| null | User's phone number, or null if not set |
| \`emailVerified\` | boolean | Whether the user's email has been verified |
| \`isActive\` | boolean | Whether the user's account is active |
| \`roles\` | string[] | Array of user's roles (e.g., ["candidate", "employee", "client_admin"]) |
| \`clientName\` | string | Name of the OAuth client that issued the token (optional) |
| \`mustChangePassword\` | boolean | If true, user must change password before accessing protected resources |
| \`iat\` | number | Token issued-at timestamp (Unix epoch seconds) |
| \`exp\` | number | Token expiration timestamp (Unix epoch seconds) |
| \`jti\` | string | Unique token identifier (JWT ID) |

## Example Response

\`\`\`json
{
  "sub": "650e8400-e29b-41d4-a716-446655440001",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "initials": "JD",
  "profilePicture": "https://storage.example.com/avatars/john.jpg",
  "phoneNumber": "+1234567890",
  "emailVerified": true,
  "isActive": true,
  "roles": ["candidate", "employee"],
  "clientName": "HRIS Portal",
  "mustChangePassword": false,
  "iat": 1703206800,
  "exp": 1703466000,
  "jti": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
\`\`\`

## Usage Examples

### cURL

\`\`\`bash
curl -X GET "https://accounts.teamified.com/api/v1/sso/me" \\
  -H "Authorization: Bearer <access_token>"
\`\`\`

### JavaScript / Fetch

\`\`\`javascript
const response = await fetch('/api/v1/sso/me', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
});

const user = await response.json();
console.log(user.fullName); // "John Doe"
console.log(user.initials); // "JD"
\`\`\`

### Teamified SDK

\`\`\`javascript
import { TeamifiedSDK } from '@teamified/sso-sdk';

const sdk = new TeamifiedSDK({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback'
});

// After OAuth flow completes
const user = await sdk.getCurrentUser();
console.log(user.email);      // john.doe@example.com
console.log(user.fullName);   // John Doe
console.log(user.roles);      // ['candidate', 'employee']
\`\`\`

## Common Use Cases

### Display User Profile in Header
Use \`fullName\`, \`initials\`, and \`profilePicture\` to render user avatars and names in your application header or navigation.

### Role-Based UI Rendering
Check the \`roles\` array to conditionally show/hide features based on user permissions.

### Email Verification Prompts
Use \`emailVerified\` to prompt users to verify their email if not yet confirmed.

### Forced Password Change
Check \`mustChangePassword\` and redirect users to a password change page if required.

## Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | Unauthorized | Missing or invalid access token |
| 401 | Token Expired | Access token has expired - use refresh token to get a new one |

> **Token Refresh:** If you receive a 401 error, use your refresh token to obtain a new access token via \`POST /api/v1/sso/token\` with \`grant_type=refresh_token\`.
`;

export default function SsoMeApiPage() {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const exampleResponse = `{
  "sub": "650e8400-e29b-41d4-a716-446655440001",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "initials": "JD",
  "profilePicture": "https://storage.example.com/avatars/john.jpg",
  "phoneNumber": "+1234567890",
  "emailVerified": true,
  "isActive": true,
  "roles": ["candidate", "employee"],
  "clientName": "HRIS Portal",
  "mustChangePassword": false,
  "iat": 1703206800,
  "exp": 1703466000,
  "jti": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}`;

  const curlExample = `curl -X GET "${apiUrl}/api/v1/sso/me" \\
  -H "Authorization: Bearer <access_token>"`;

  const jsExample = `const response = await fetch('${apiUrl}/api/v1/sso/me', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
});

const user = await response.json();
console.log(user.fullName); // "John Doe"
console.log(user.initials); // "JD"`;

  const sdkExample = `import { TeamifiedSDK } from '@teamified/sso-sdk';

const sdk = new TeamifiedSDK({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback'
});

// After OAuth flow completes
const user = await sdk.getCurrentUser();
console.log(user.email);      // john.doe@example.com
console.log(user.fullName);   // John Doe
console.log(user.roles);      // ['candidate', 'employee']`;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" />
          SSO User Info API (/sso/me)
        </Typography>
        <DownloadMarkdownButton 
          filename="sso-me-api" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" paragraph>
        The <code>/api/v1/sso/me</code> endpoint returns the authenticated user's profile information 
        from their JWT access token. This is the primary endpoint for client applications to retrieve 
        user details after SSO authentication.
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Token-Based Response:</strong> This endpoint decodes the JWT access token and returns 
          all user profile fields directly from the token payload, making it extremely fast with no database lookups required.
        </Typography>
      </Alert>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Key color="primary" fontSize="small" />
            Endpoint
          </Typography>
          
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`GET ${apiUrl}/api/v1/sso/me
Authorization: Bearer <access_token>`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Authentication
          </Typography>
          <Typography variant="body1" paragraph>
            Requires a valid JWT access token obtained from the OAuth 2.0 token exchange. 
            Pass the token in the <code>Authorization</code> header with the <code>Bearer</code> scheme.
          </Typography>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="success" fontSize="small" />
            Response Fields
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
                  <TableCell><code>sub</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell>User's unique identifier (UUID)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>email</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell>User's primary email address</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>firstName</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell>User's first name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>lastName</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell>User's last name</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><code>fullName</code></TableCell>
                  <TableCell><Chip label="string" size="small" color="success" /></TableCell>
                  <TableCell>Pre-formatted full name ("FirstName LastName"). Falls back to email username if name is empty.</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><code>initials</code></TableCell>
                  <TableCell><Chip label="string" size="small" color="success" /></TableCell>
                  <TableCell>User's initials (e.g., "JD" for John Doe). Useful for avatar fallbacks.</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><code>profilePicture</code></TableCell>
                  <TableCell><Chip label="string | null" size="small" color="success" /></TableCell>
                  <TableCell>URL to the user's profile picture, or null if not set</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><code>phoneNumber</code></TableCell>
                  <TableCell><Chip label="string | null" size="small" color="success" /></TableCell>
                  <TableCell>User's phone number, or null if not set</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><code>emailVerified</code></TableCell>
                  <TableCell><Chip label="boolean" size="small" color="success" /></TableCell>
                  <TableCell>Whether the user's email has been verified</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><code>isActive</code></TableCell>
                  <TableCell><Chip label="boolean" size="small" color="success" /></TableCell>
                  <TableCell>Whether the user's account is active</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>roles</code></TableCell>
                  <TableCell><Chip label="string[]" size="small" /></TableCell>
                  <TableCell>Array of user's roles (e.g., ["candidate", "employee", "client_admin"])</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>clientName</code></TableCell>
                  <TableCell><Chip label="string" size="small" variant="outlined" /></TableCell>
                  <TableCell>Name of the OAuth client that issued the token (optional)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>mustChangePassword</code></TableCell>
                  <TableCell><Chip label="boolean" size="small" variant="outlined" /></TableCell>
                  <TableCell>If true, user must change password before accessing protected resources</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>iat</code></TableCell>
                  <TableCell><Chip label="number" size="small" /></TableCell>
                  <TableCell>Token issued-at timestamp (Unix epoch seconds)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>exp</code></TableCell>
                  <TableCell><Chip label="number" size="small" /></TableCell>
                  <TableCell>Token expiration timestamp (Unix epoch seconds)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>jti</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell>Unique token identifier (JWT ID)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Highlighted fields</strong> are commonly used for displaying user profile information 
              in client applications.
            </Typography>
          </Alert>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Example Response
          </Typography>
          <SyntaxHighlighter language="json" style={atomOneDark} customStyle={{ borderRadius: 8 }}>
            {exampleResponse}
          </SyntaxHighlighter>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Usage Examples
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            cURL
          </Typography>
          <SyntaxHighlighter language="bash" style={atomOneDark} customStyle={{ borderRadius: 8, marginBottom: 16 }}>
            {curlExample}
          </SyntaxHighlighter>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            JavaScript / Fetch
          </Typography>
          <SyntaxHighlighter language="javascript" style={atomOneDark} customStyle={{ borderRadius: 8, marginBottom: 16 }}>
            {jsExample}
          </SyntaxHighlighter>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Teamified SDK
          </Typography>
          <SyntaxHighlighter language="javascript" style={atomOneDark} customStyle={{ borderRadius: 8 }}>
            {sdkExample}
          </SyntaxHighlighter>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="warning" fontSize="small" />
            Common Use Cases
          </Typography>

          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Display User Profile in Header
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use <code>fullName</code>, <code>initials</code>, and <code>profilePicture</code> to render 
                user avatars and names in your application header or navigation.
              </Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Role-Based UI Rendering
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check the <code>roles</code> array to conditionally show/hide features based on user permissions.
              </Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Email Verification Prompts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use <code>emailVerified</code> to prompt users to verify their email if not yet confirmed.
              </Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Forced Password Change
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check <code>mustChangePassword</code> and redirect users to a password change page if required.
              </Typography>
            </Paper>
          </Stack>
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
                  <TableCell sx={{ fontWeight: 600 }}>Status Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Error</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="401" color="error" size="small" /></TableCell>
                  <TableCell>Unauthorized</TableCell>
                  <TableCell>Missing or invalid access token</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="401" color="error" size="small" /></TableCell>
                  <TableCell>Token Expired</TableCell>
                  <TableCell>Access token has expired - use refresh token to get a new one</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Token Refresh:</strong> If you receive a 401 error, use your refresh token to obtain 
            a new access token via <code>POST /api/v1/sso/token</code> with <code>grant_type=refresh_token</code>.
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
}
