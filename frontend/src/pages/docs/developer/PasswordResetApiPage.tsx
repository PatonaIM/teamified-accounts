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
  Divider,
} from '@mui/material';
import { VpnKey } from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# Password Reset API

API reference for password reset operations, including self-service reset, administrative reset, and forced password change handling.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/auth/forgot-password\` | Request password reset email (self-service) |
| POST | \`/auth/reset-password\` | Reset password using token from email |
| POST | \`/users/:id/password-reset\` | Admin: send password reset link |
| PUT | \`/users/:id/password\` | Admin: set password directly |
| POST | \`/auth/force-change-password\` | User: change forced temporary password |

## Self-Service Reset Request

\`\`\`
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
\`\`\`

Returns 200 OK regardless of whether the email exists (prevents user enumeration).

## Complete Password Reset

\`\`\`
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecureP@ssw0rd!"
}
\`\`\`

## Admin: Send Reset Link

\`\`\`
POST /users/:userId/password-reset
Authorization: Bearer ADMIN_ACCESS_TOKEN

{
  "sendEmail": true
}
\`\`\`

**Allowed Roles:** Super Admin, Internal HR, Internal Account Manager, Internal Recruiter, Internal Finance, Internal Marketing, Client Admin, Client HR, Client Finance, Client Recruiter

## Admin: Set Password Directly

\`\`\`
PUT /users/:userId/password
Authorization: Bearer ADMIN_ACCESS_TOKEN
Content-Type: application/json

{
  "password": "TemporaryP@ss123!"
}
\`\`\`

> **Restricted:** Only Super Admin, Internal HR, and Internal Account Manager. Sets \`mustChangePassword: true\` on the user account.

## Forced Password Change

When \`mustChangePassword\` is true, the user receives 403 on all protected endpoints. They must call this endpoint to change their password:

\`\`\`
POST /auth/force-change-password
Authorization: Bearer USER_ACCESS_TOKEN
Content-Type: application/json

{
  "currentPassword": "TemporaryP@ss123!",
  "newPassword": "MyNewSecureP@ss!"
}
\`\`\`

Upon successful password change, new tokens are issued and \`mustChangePassword\` is set to false.
`;

export default function PasswordResetApiPage() {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKey color="primary" />
          Password Reset API
        </Typography>
        <DownloadMarkdownButton 
          filename="password-reset-api" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" paragraph>
        API reference for password reset operations, including self-service reset, 
        administrative reset, and forced password change handling.
      </Typography>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Endpoints
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/auth/forgot-password</code></TableCell>
                  <TableCell>Request password reset email (self-service)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/auth/reset-password</code></TableCell>
                  <TableCell>Reset password using token from email</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="warning" size="small" /></TableCell>
                  <TableCell><code>/users/:id/password-reset</code></TableCell>
                  <TableCell>Admin: send password reset link</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="PUT" color="error" size="small" /></TableCell>
                  <TableCell><code>/users/:id/password</code></TableCell>
                  <TableCell>Admin: set password directly</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="success" size="small" /></TableCell>
                  <TableCell><code>/auth/force-change-password</code></TableCell>
                  <TableCell>User: change forced temporary password</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Self-Service Reset Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}`}
            </pre>
          </Paper>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Returns 200 OK regardless of whether the email exists (prevents user enumeration).
          </Typography>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Complete Password Reset
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecureP@ssw0rd!"
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Admin: Send Reset Link
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/users/:userId/password-reset
Authorization: Bearer ADMIN_ACCESS_TOKEN

{
  "sendEmail": true
}`}
            </pre>
          </Paper>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Allowed Roles:</strong> Super Admin, Internal HR, Internal Account Manager, 
              Internal Recruiter, Internal Finance, Internal Marketing, Client Admin, Client HR, 
              Client Finance, Client Recruiter
            </Typography>
          </Alert>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Admin: Set Password Directly
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`PUT ${apiUrl}/users/:userId/password
Authorization: Bearer ADMIN_ACCESS_TOKEN
Content-Type: application/json

{
  "password": "TemporaryP@ss123!"
}`}
            </pre>
          </Paper>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Restricted:</strong> Only Super Admin, Internal HR, and Internal Account Manager. 
              Sets <code>mustChangePassword: true</code> on the user account.
            </Typography>
          </Alert>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Forced Password Change
          </Typography>
          <Typography variant="body1" paragraph>
            When <code>mustChangePassword</code> is true, the user receives 403 on all protected endpoints. 
            They must call this endpoint to change their password:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/auth/force-change-password
Authorization: Bearer USER_ACCESS_TOKEN
Content-Type: application/json

{
  "currentPassword": "TemporaryP@ss123!",
  "newPassword": "MyNewSecureP@ss!"
}`}
            </pre>
          </Paper>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Upon successful password change, new tokens are issued and 
              <code>mustChangePassword</code> is set to false.
            </Typography>
          </Alert>
        </Box>
      </Stack>
    </Box>
  );
}
