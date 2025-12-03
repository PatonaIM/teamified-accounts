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
            Self-Service Password Reset
          </Typography>
          <Typography variant="body1" paragraph>
            Users can reset their own password through the login page without administrator assistance.
          </Typography>
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="1. Click 'Forgot Password' on the login page" 
                  secondary="Navigate to the forgot password form"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2. Enter your registered email address" 
                  secondary="The system will send a password reset link"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3. Check your email for the reset link" 
                  secondary="Link expires after 24 hours for security"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4. Click the link and create a new password" 
                  secondary="Must meet password complexity requirements"
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
