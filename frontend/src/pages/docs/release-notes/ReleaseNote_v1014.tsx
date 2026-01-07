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
  AutoAwesome,
  Login,
  RouteOutlined,
  Storage,
  Logout,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v1014() {
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
                  <Chip label="v1.0.14" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    January 7, 2026
                  </Typography>
                  <Chip label="4 min read" size="small" variant="outlined" />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Role-Based Redirects & Global SSO Logout
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity="info" icon={<AutoAwesome />}>
            <Typography variant="body2">
              <strong>What's New:</strong> Users are now automatically redirected to the appropriate 
              portal based on login context. Plus, logging out from any Teamified app now terminates 
              sessions across ALL connected applications for enhanced security.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Summary
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Login with personal email redirects to Jobseeker Portal" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Login with work email redirects to ATS Portal for employers" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Teamified internal super admins stay in Teamified Accounts" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Persistent portal routing keeps users in their appropriate portal" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Global SSO logout terminates sessions across all connected apps" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Portal URLs now use environment variables for flexible deployment" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Login color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Smart Login Redirects
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              After successful login, users are now automatically redirected to the portal that matches 
              the email address they used to sign in. This eliminates confusion and streamlines the 
              user experience for multi-identity users.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Redirect Rules:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Personal Email Login" 
                  secondary="Redirects to Jobseeker Portal for job seekers browsing opportunities" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Work Email Login" 
                  secondary="Redirects to ATS Portal for employers managing their hiring pipeline" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Teamified Internal + Super Admin" 
                  secondary="Stays in Teamified Accounts for platform administration" 
                />
              </ListItem>
            </List>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Deep links and specific returnUrl destinations are always honored, ensuring SSO authorize 
              flows and bookmarked pages work as expected.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <RouteOutlined color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Persistent Portal Routing
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Authenticated users are now always redirected to their appropriate portal when accessing 
              any Teamified Accounts page, not just after initial login. This ensures a consistent 
              experience across browser refreshes, direct URL access, and tab switches.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              How It Works:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Session-Aware Routing" 
                  secondary="Each protected route checks the user's login context and redirects accordingly" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Seamless Experience" 
                  secondary="No UI flashes or intermediate pages - users go directly to their portal" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Browser History Clean" 
                  secondary="Redirects use replace navigation to avoid cluttered back button history" 
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Storage color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Login Context Persistence
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              The system now remembers which email address was used during login, enabling consistent 
              portal routing across the entire session. This context is stored securely in the user 
              record and used to determine the preferred portal destination.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Technical Details:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Email Type Tracking" 
                  secondary="Stores whether login was via personal or work email" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Organization Context" 
                  secondary="Tracks the organization slug when logging in with a work email" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Fallback Logic" 
                  secondary="Uses primary email for routing when login context is unavailable" 
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Logout color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Global SSO Logout
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Logging out from any Teamified application (Jobseeker Portal, ATS, HRIS, etc.) now 
              immediately terminates the user's session across ALL connected clients. No more 
              phantom sessions remaining active after logout.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              How It Works:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Instant Session Termination" 
                  secondary="Logout from any app invalidates tokens across all connected applications" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Automatic Detection" 
                  secondary="Other apps detect the logout on their next request and redirect to login" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Clean State" 
                  secondary="Local storage and cookies are cleared automatically across all apps" 
                />
              </ListItem>
            </List>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This ensures enhanced security for users who may forget to log out of individual 
              applications, preventing unauthorized access to their accounts.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Settings color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Environment-Based Portal URLs
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Portal redirect URLs are now configured via environment variables instead of hardcoded 
              values, enabling seamless support for both development and production environments.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Configuration:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="VITE_PORTAL_URL_JOBSEEKER" 
                  secondary="URL of the Jobseeker Portal for candidate redirects" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="VITE_PORTAL_URL_ATS" 
                  secondary="URL of the ATS Portal for employer redirects" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Validation & Fallback" 
                  secondary="Portal redirects are disabled with error logging if URLs are missing" 
                />
              </ListItem>
            </List>
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
