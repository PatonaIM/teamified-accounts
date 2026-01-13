import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { VpnKey } from '@mui/icons-material';

export default function PasswordResetPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <VpnKey color="primary" />
        Password Reset & Recovery
      </Typography>

      <Typography variant="body1" paragraph>
        Teamified Accounts provides secure password reset functionality for users who have forgotten their passwords, 
        as well as administrative tools for authorized personnel to assist users with account recovery.
      </Typography>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Self-Service Password Reset (OTP Verification)
          </Typography>
          <Typography variant="body1" paragraph>
            Users can reset their own password through a secure 3-step OTP verification process without administrator assistance.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Enhanced Security:</strong> Password reset now uses a 6-digit one-time passcode (OTP) 
              sent via email instead of a clickable link. This provides better protection against phishing attacks.
            </Typography>
          </Alert>
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Step 1: Request Password Reset" 
                  secondary="Click 'Forgot Password' on the login page and enter your registered email address. A 6-digit OTP code will be sent to your email."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Step 2: Verify OTP Code" 
                  secondary="Enter the 6-digit code from your email. The code expires after 10 minutes for security. You can request a new code if needed."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Step 3: Create New Password" 
                  secondary="After successful OTP verification, create your new password. Must meet password complexity requirements (8+ characters, uppercase, lowercase, number, special character)."
                />
              </ListItem>
            </List>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Administrative Password Reset
          </Typography>
          <Typography variant="body1" paragraph>
            Authorized administrators can help users reset their passwords through two methods:
          </Typography>
          
          <Stack spacing={3}>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Option 1: Send Password Reset Link
              </Typography>
              <Typography variant="body2" paragraph>
                Administrators send a password reset link to the user's email. The user clicks the link and 
                creates their own new password. This is the recommended approach as it ensures only the user 
                knows their new password.
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Allowed Roles:</strong> Super Admin, Internal HR, Internal Account Manager, 
                  Internal Recruiter, Internal Finance, Internal Marketing, Client Admin, Client HR, 
                  Client Finance, Client Recruiter
                </Typography>
              </Alert>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
                Option 2: Set Password Directly
              </Typography>
              <Typography variant="body2" paragraph>
                Administrators set a temporary password for the user. The user must change this password 
                on their next login. This is useful for urgent situations where the user cannot access their email.
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Restricted Roles:</strong> Only Super Admin, Internal HR, and Internal Account Manager 
                  can set passwords directly. This action is logged for audit purposes.
                </Typography>
              </Alert>
            </Paper>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Forced Password Change
          </Typography>
          <Typography variant="body1" paragraph>
            When an administrator sets a user's password directly (Option 2), the system enforces a password change:
          </Typography>
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="User's mustChangePassword flag is set to true"
                  secondary="This flag is checked on every API request"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="All protected API endpoints return 403 Forbidden"
                  secondary="User cannot access any features until password is changed"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Only essential endpoints remain accessible"
                  secondary="/auth/me, /auth/force-change-password, /auth/login, and /auth/logout"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="New tokens issued after password change"
                  secondary="Previous sessions are invalidated for security"
                />
              </ListItem>
            </List>
          </Paper>
        </Box>

        <Alert severity="success">
          <Typography variant="body2">
            <strong>Password Requirements:</strong> Minimum 8 characters, at least one uppercase letter, 
            one lowercase letter, one number, and one special character.
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
}
