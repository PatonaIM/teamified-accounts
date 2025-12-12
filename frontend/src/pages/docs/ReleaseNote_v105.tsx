import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  NewReleases,
  CheckCircle,
  Security,
  Google,
  Cookie,
  Speed,
  Code,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v105() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <NewReleases color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label="v1.0.5" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    December 12, 2025
                  </Typography>
                  <Chip label="1 min read" size="small" variant="outlined" />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Direct Google SSO Login Features
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity="info" icon={<Google />}>
            <Typography variant="body2">
              <strong>What's New:</strong> Users can now sign in with their Google account directly, 
              without any third-party vendor dependency. This provides a faster, more secure, and 
              seamless authentication experience.
            </Typography>
          </Alert>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Google color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                1. Direct Google OAuth Integration
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Replaced the Supabase-based Google OAuth flow with a direct integration using Google's 
              OAuth 2.0 APIs. This eliminates vendor dependency and gives us full control over the 
              authentication process.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Continue with Google Button" 
                  secondary="New Google sign-in button on the login page for one-click authentication"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Automatic Account Creation" 
                  secondary="New users signing in with Google get accounts created automatically with their Google profile data"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Account Linking" 
                  secondary="Existing users with matching email addresses are automatically linked to their Google account"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Google User ID Tracking" 
                  secondary="New google_user_id column in user entity for reliable identity linking"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. Secure Token Exchange Pattern
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Implemented a secure temporary code exchange system that ensures tokens are never 
              exposed in URLs or browser history, protecting against token theft.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="One-Time Codes" 
                  secondary="Server generates short-lived codes (60s TTL) that can only be exchanged once"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="CSRF Protection" 
                  secondary="State parameter validation prevents cross-site request forgery attacks"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Race Condition Prevention" 
                  secondary="useRef-based duplicate request prevention in the callback handler"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Cookie color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. httpOnly Cookie Token Storage
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Authentication tokens are now stored in httpOnly cookies during Google OAuth flows, 
              providing enhanced security against XSS attacks.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="XSS Protection" 
                  secondary="Tokens stored in httpOnly cookies cannot be accessed by JavaScript, preventing theft via XSS"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Automatic Cookie Handling" 
                  secondary="Browser automatically includes cookies in requests - no manual token management needed"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Secure Flag Enabled" 
                  secondary="Cookies are marked secure in production, ensuring HTTPS-only transmission"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Code color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                4. New API Endpoints
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Backend endpoints for the complete Google OAuth flow:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="GET /api/v1/auth/google/status" 
                  secondary="Check if Google OAuth is configured and available"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="GET /api/v1/auth/google" 
                  secondary="Initiate Google OAuth flow with state and redirect parameters"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="GET /api/v1/auth/google/callback" 
                  secondary="Handle Google's OAuth callback and generate temporary code"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="POST /api/v1/auth/google/exchange" 
                  secondary="Exchange temporary code for access and refresh tokens"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Speed color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                5. Configuration Requirements
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              To enable Google Sign-in, the following secrets must be configured:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="GOOGLE_CLIENT_ID" 
                  secondary="OAuth 2.0 Client ID from Google Cloud Console"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="GOOGLE_CLIENT_SECRET" 
                  secondary="OAuth 2.0 Client Secret from Google Cloud Console"
                />
              </ListItem>
            </List>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> The authorized redirect URI in Google Cloud Console must be set to: 
                <code style={{ marginLeft: 8 }}>{'{BASE_URL}'}/api/v1/auth/google/callback</code>
              </Typography>
            </Alert>
          </Box>

          <Divider />

          <Box sx={{ pt: 1 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/docs/release-notes')}
              variant="outlined"
            >
              Back to Release Notes
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
