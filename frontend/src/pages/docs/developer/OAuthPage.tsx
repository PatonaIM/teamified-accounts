import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
  Divider,
} from '@mui/material';
import { Settings, OpenInNew } from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# OAuth 2.0 Configuration

Complete reference for OAuth 2.0 endpoints, scopes, and configuration options.

> **Interactive API Documentation:** See the Swagger/OpenAPI Reference at \`/api/docs\`

## OAuth Endpoints

| Endpoint | URL | Description |
|----------|-----|-------------|
| Authorization | \`/sso/authorize\` | Initiate OAuth flow, get authorization code |
| Token | \`/sso/token\` | Exchange code for access/refresh tokens |
| UserInfo | \`/sso/userinfo\` | Get authenticated user profile data |
| Token Refresh | \`/sso/token\` | Refresh access token using refresh token |
| Revoke | \`/sso/revoke\` | Revoke refresh token and end session |

## Available Scopes

| Scope | Description | Data Returned |
|-------|-------------|---------------|
| \`openid\` | Required for OIDC compliance | User ID (sub claim) |
| \`profile\` | Basic profile information | name, profile picture, job title |
| \`email\` | Email address access | email, email_verified |
| \`roles\` | User roles and permissions | roles array, permissions |
| \`organizations\` | Organization membership | organization IDs, names, roles per org |

## Token Response

\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "scope": "openid profile email"
}
\`\`\`

## UserInfo Response

\`\`\`json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://example.com/avatar.jpg",
  "roles": ["client_admin"],
  "permissions": ["users:read", "users:write"],
  "organizations": [
    {
      "id": "org-uuid",
      "name": "Acme Corp",
      "role": "client_admin"
    }
  ]
}
\`\`\`

## Security Note

Access tokens expire in 1 hour. Use refresh tokens to obtain new access tokens. Never expose client secrets in client-side code.
`;

export default function OAuthPage() {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const swaggerUrl = `${apiUrl}/api/docs`;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings color="primary" />
          OAuth 2.0 Configuration
        </Typography>
        <DownloadMarkdownButton 
          filename="oauth-configuration" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" paragraph>
        Complete reference for OAuth 2.0 endpoints, scopes, and configuration options.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Interactive API Documentation:</strong>{' '}
          <Link href={swaggerUrl} target="_blank" rel="noopener" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            Swagger/OpenAPI Reference <OpenInNew fontSize="small" />
          </Link>
        </Typography>
      </Alert>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            OAuth Endpoints
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>URL</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="Authorization" color="primary" size="small" /></TableCell>
                  <TableCell><code>{apiUrl}/sso/authorize</code></TableCell>
                  <TableCell>Initiate OAuth flow, get authorization code</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="Token" color="secondary" size="small" /></TableCell>
                  <TableCell><code>{apiUrl}/sso/token</code></TableCell>
                  <TableCell>Exchange code for access/refresh tokens</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="UserInfo" color="success" size="small" /></TableCell>
                  <TableCell><code>{apiUrl}/sso/userinfo</code></TableCell>
                  <TableCell>Get authenticated user profile data</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="Token Refresh" color="info" size="small" /></TableCell>
                  <TableCell><code>{apiUrl}/sso/token</code></TableCell>
                  <TableCell>Refresh access token using refresh token</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="Revoke" color="error" size="small" /></TableCell>
                  <TableCell><code>{apiUrl}/sso/revoke</code></TableCell>
                  <TableCell>Revoke refresh token and end session</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Available Scopes
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Scope</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Data Returned</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>openid</code></TableCell>
                  <TableCell>Required for OIDC compliance</TableCell>
                  <TableCell>User ID (sub claim)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>profile</code></TableCell>
                  <TableCell>Basic profile information</TableCell>
                  <TableCell>name, profile picture, job title</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>email</code></TableCell>
                  <TableCell>Email address access</TableCell>
                  <TableCell>email, email_verified</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>roles</code></TableCell>
                  <TableCell>User roles and permissions</TableCell>
                  <TableCell>roles array, permissions</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizations</code></TableCell>
                  <TableCell>Organization membership</TableCell>
                  <TableCell>organization IDs, names, roles per org</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Token Response
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "scope": "openid profile email"
}`}
            </pre>
          </Paper>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            UserInfo Response
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://example.com/avatar.jpg",
  "roles": ["client_admin"],
  "permissions": ["users:read", "users:write"],
  "organizations": [
    {
      "id": "org-uuid",
      "name": "Acme Corp",
      "role": "client_admin"
    }
  ]
}`}
            </pre>
          </Paper>
        </Box>

        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Security Note:</strong> Access tokens expire in 1 hour. Use refresh tokens to obtain 
            new access tokens. Never expose client secrets in client-side code.
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
}
