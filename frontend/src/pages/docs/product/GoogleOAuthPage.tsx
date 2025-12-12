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
  ListItemIcon,
  Divider,
} from '@mui/material';
import { Google, CheckCircle, Security, Speed, Lock } from '@mui/icons-material';

export default function GoogleOAuthPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Google color="primary" />
        Google Sign-In
      </Typography>
      
      <Typography variant="body1" paragraph>
        Teamified Accounts supports signing in with Google, providing users a fast and secure way to 
        authenticate using their existing Google account. This feature works alongside traditional 
        email and password login.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>One Account, Multiple Sign-In Options:</strong> Users can sign in with Google or 
          email/password. If you sign in with Google using an email that already has an account, 
          your accounts are automatically linked.
        </Typography>
      </Alert>

      <Stack spacing={3}>
        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            How Google Sign-In Works
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="1. Click 'Continue with Google'" 
                secondary="On the login page, click the Google sign-in button"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="2. Choose your Google account" 
                secondary="Select which Google account you want to use (if you have multiple)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="3. Grant permission" 
                secondary="Allow Teamified to access your basic profile information (name, email, profile picture)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="4. You're signed in!" 
                secondary="You're automatically logged in and redirected to your dashboard"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Speed color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Benefits of Google Sign-In
            </Typography>
          </Stack>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Faster login" 
                secondary="No need to remember or type your password - just one click"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Automatic profile setup" 
                secondary="Your name and profile picture are imported from your Google account"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="No new password to create" 
                secondary="Use your existing Google account security instead of creating another password"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Works with Google Workspace" 
                secondary="Sign in with your company Google account if your organization uses Google Workspace"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Security color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Security & Privacy
            </Typography>
          </Stack>
          <List>
            <ListItem>
              <ListItemIcon><Lock color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="We never see your Google password" 
                secondary="Authentication happens directly with Google - we only receive a secure token"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Lock color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Limited data access" 
                secondary="We only request your name, email, and profile picture - nothing else"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Lock color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Revoke access anytime" 
                secondary="You can disconnect Google from your account in your Google account settings"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Lock color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Two-factor authentication supported" 
                secondary="If you have 2FA enabled on your Google account, it works with our sign-in too"
              />
            </ListItem>
          </List>
        </Paper>

        <Divider />

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Frequently Asked Questions
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Can I use both Google and email/password to sign in?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yes! If your email address is the same, both methods will log you into the same account. 
                You can use whichever is more convenient at the time.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                What if I already have an account with my email?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                When you sign in with Google using an email that already has an account, we automatically 
                link your Google account to your existing account. All your data and settings are preserved.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Can I disconnect Google from my account later?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yes, you can revoke Teamified's access from your Google Account settings at any time. 
                You'll still be able to sign in using email and password.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Is Google Sign-In available for work accounts?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yes! If your organization uses Google Workspace (formerly G Suite), you can sign in with 
                your work Google account. Your administrator may have additional security policies that apply.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Alert severity="success">
          <Typography variant="body2">
            <strong>Tip:</strong> For the fastest login experience, use Google Sign-In with a Google account 
            that stays logged in on your browser. You'll be signed in with just one click!
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
}
