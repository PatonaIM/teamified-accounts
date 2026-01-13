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

API reference for password reset operations, including OTP-based self-service reset, administrative reset, and forced password change handling.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/auth/password-reset/otp\` | Request password reset OTP (recommended) |
| POST | \`/auth/password-reset/otp/verify\` | Verify OTP and get reset token |
| POST | \`/auth/forgot-password\` | Request password reset email (legacy) |
| POST | \`/auth/reset-password\` | Reset password using token |
| POST | \`/users/:id/password-reset\` | Admin: send password reset link |
| PUT | \`/users/:id/password\` | Admin: set password directly |
| POST | \`/auth/force-change-password\` | User: change forced temporary password |

## OTP-Based Password Reset (Recommended)

### Step 1: Request OTP

\`\`\`
POST /auth/password-reset/otp
Content-Type: application/json

{
  "email": "user@example.com"
}
\`\`\`

Sends a 6-digit OTP code to the user's email. OTP expires after 10 minutes.

### Step 2: Verify OTP

\`\`\`
POST /auth/password-reset/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
\`\`\`

Returns a reset token upon successful verification. OTP is cleared after verification.

### Step 3: Complete Password Reset

\`\`\`
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-otp-verification",
  "newPassword": "NewSecureP@ssw0rd!"
}
\`\`\`

## Legacy: Link-Based Reset

\`\`\`
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
\`\`\`

Returns 200 OK regardless of whether the email exists (prevents user enumeration).

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
                  <TableCell><Chip label="POST" color="success" size="small" /></TableCell>
                  <TableCell><code>/auth/password-reset/otp</code></TableCell>
                  <TableCell>Request password reset OTP (recommended)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="success" size="small" /></TableCell>
                  <TableCell><code>/auth/password-reset/otp/verify</code></TableCell>
                  <TableCell>Verify OTP and get reset token</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/auth/forgot-password</code></TableCell>
                  <TableCell>Request password reset email (legacy)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/auth/reset-password</code></TableCell>
                  <TableCell>Reset password using token</TableCell>
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
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
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
            OTP-Based Password Reset (Recommended)
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Enhanced Security:</strong> The OTP-based flow provides better protection against 
              phishing attacks compared to clickable links.
            </Typography>
          </Alert>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Step 1: Request OTP
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 2 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/auth/password-reset/otp
Content-Type: application/json

{
  "email": "user@example.com"
}`}
            </pre>
          </Paper>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sends a 6-digit OTP code to the user's email. OTP expires after 10 minutes.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Step 2: Verify OTP
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 2 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/auth/password-reset/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}`}
            </pre>
          </Paper>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Returns a reset token upon successful verification. OTP is cleared after verification.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Step 3: Complete Password Reset
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-otp-verification",
  "newPassword": "NewSecureP@ssw0rd!"
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Legacy: Link-Based Reset
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
