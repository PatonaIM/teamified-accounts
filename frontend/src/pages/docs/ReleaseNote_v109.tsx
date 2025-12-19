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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
} from '@mui/material';
import {
  ArrowBack,
  NewReleases,
  CheckCircle,
  AutoAwesome,
  SyncAlt,
  Security,
  Code,
  Settings,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function ReleaseNote_v109() {
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
                  <Chip label="v1.0.9" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    December 19, 2025
                  </Typography>
                  <Chip label="3 min read" size="small" variant="outlined" />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Service-to-Service (S2S) Authentication
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity="info" icon={<AutoAwesome />}>
            <Typography variant="body2">
              <strong>What's New:</strong> Backend systems like HRIS integrations can now authenticate 
              directly with Teamified Accounts APIs using OAuth 2.0 Client Credentials Grant. Administrators 
              can enable S2S and configure granular scopes through the OAuth Configuration admin interface.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              1-Minute Summary
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="OAuth 2.0 Client Credentials Grant for machine-to-machine auth" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Admin UI toggle to enable S2S per OAuth client" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Granular scope selection for fine-grained access control" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Visual S2S badge indicator in OAuth clients table" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, border: 1, borderColor: 'primary.200' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Code fontSize="small" color="primary" />
              Developer Documentation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              For complete implementation details, code examples, and security best practices:
            </Typography>
            <Link 
              component={RouterLink} 
              to="/docs/developer/s2s-authentication"
              sx={{ fontWeight: 600 }}
            >
              View S2S Authentication Developer Guide →
            </Link>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <SyncAlt color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                1. What is Service-to-Service Authentication?
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Service-to-Service (S2S) authentication enables backend systems to access Teamified Accounts 
              APIs without requiring a user to be logged in. This is essential for:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="HRIS Integrations" 
                  secondary="Sync employee data between HR systems and Teamified Accounts"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Automated User Provisioning" 
                  secondary="Create and manage users programmatically from external systems"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Background Jobs" 
                  secondary="Run scheduled tasks that need API access without user context"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Internal Service Integration" 
                  secondary="Connect microservices within your organization's infrastructure"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Settings color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. Admin Configuration
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              S2S authentication is configured through the OAuth Configuration admin page:
            </Typography>
            
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Enabling S2S for an OAuth Client:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Chip label="1" size="small" /></ListItemIcon>
                  <ListItemText primary="Go to Admin > Tools > OAuth Configuration" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Chip label="2" size="small" /></ListItemIcon>
                  <ListItemText primary="Click the edit icon on the target OAuth client" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Chip label="3" size="small" /></ListItemIcon>
                  <ListItemText primary="Toggle 'Enable Service-to-Service (S2S)'" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Chip label="4" size="small" /></ListItemIcon>
                  <ListItemText primary="Select which API scopes the client can request" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Chip label="5" size="small" /></ListItemIcon>
                  <ListItemText primary="Save — the client now shows an 'S2S' badge" />
                </ListItem>
              </List>
            </Paper>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. Available Scopes
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Administrators can select from six granular scopes to control what data the S2S client can access:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Scope</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><code>read:users</code></TableCell>
                    <TableCell>View user profiles and list users</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code>write:users</code></TableCell>
                    <TableCell>Create users, update profiles, change status</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code>read:organizations</code></TableCell>
                    <TableCell>View organizations and list members</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code>write:organizations</code></TableCell>
                    <TableCell>Create/update organizations, manage members</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code>read:invitations</code></TableCell>
                    <TableCell>View pending invitations</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code>write:invitations</code></TableCell>
                    <TableCell>Send and revoke invitations</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Code color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                4. Token Endpoint
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Request an access token using the Client Credentials Grant:
            </Typography>
            
            <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 2 }}>
              <pre style={{ margin: 0, fontSize: '0.85rem' }}>
{`POST /api/v1/sso/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=read:users read:organizations`}
              </pre>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Response:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
              <pre style={{ margin: 0, fontSize: '0.85rem' }}>
{`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:users read:organizations"
}`}
              </pre>
            </Paper>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Client Credentials Grant does not return a refresh token. 
                Request a new access token when the current one expires.
              </Typography>
            </Alert>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Technical Details
            </Typography>
            <List dense>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Database fields" 
                  secondary={<><code>allow_client_credentials</code> (boolean), <code>allowed_scopes</code> (simple-array)</>}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Token endpoint" 
                  secondary={<code>POST /api/v1/sso/token</code>}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Guard" 
                  secondary="ClientCredentialsGuard validates S2S tokens on protected endpoints"
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
