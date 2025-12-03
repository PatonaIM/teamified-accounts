import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  AlertTitle,
  Stack,
  Tooltip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  ContentCopy,
  Info,
  Code,
} from '@mui/icons-material';
import { oauthClientsService, type OAuthClient } from '../../services/oauthClientsService';
import OAuthClientDialog from './OAuthClientDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { useSnackbar } from '../../contexts/SnackbarContext';

const OAuthClientsTab: React.FC = () => {
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<OAuthClient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<OAuthClient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [togglingClient, setTogglingClient] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await oauthClientsService.getAll();
      const sortedData = data.sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      setClients(sortedData);
    } catch (error) {
      showSnackbar('Failed to load OAuth clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAddClient = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

  const handleEditClient = (client: OAuthClient) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleDeleteClick = (client: OAuthClient) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      setDeleting(true);
      await oauthClientsService.delete(clientToDelete.id);
      showSnackbar('OAuth client deleted successfully', 'success');
      loadClients();
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    } catch (error) {
      showSnackbar('Failed to delete OAuth client', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (client: OAuthClient) => {
    const previousState = client.is_active;
    
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, is_active: !c.is_active } : c
    ));
    
    try {
      await oauthClientsService.toggleActive(client.id);
      showSnackbar(`OAuth client ${previousState ? 'deactivated' : 'activated'}`, 'success');
    } catch (error) {
      setClients(prev => prev.map(c => 
        c.id === client.id ? { ...c, is_active: previousState } : c
      ));
      showSnackbar('Failed to toggle client status', 'error');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`${label} copied to clipboard`, 'success');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Documentation Section */}
      <Card sx={{ mb: 4, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Info color="primary" />
            <Typography variant="h6" fontWeight={600}>
              SSO Application Registration
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Register your internal Replit apps to enable Single Sign-On (SSO) with the Teamified Portal.
            Each app gets unique credentials for secure token exchange.
          </Typography>

          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            How to Register an App:
          </Typography>
          <List dense>
            <ListItem sx={{ pl: 0 }}>
              <ListItemText
                primary="1. Click 'Add Application' to register a new app"
                secondary="Provide app name, description, and redirect URLs (dev, staging, production)"
              />
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <ListItemText
                primary="2. Save the generated credentials"
                secondary="Client ID and Secret are shown once. Copy them immediately and store securely."
              />
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <ListItemText
                primary="3. Configure your app to use these credentials"
                secondary="Add Client ID and Secret to your app's environment variables (Replit Secrets)"
              />
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <ListItemText
                primary="4. Test the SSO flow"
                secondary="Log in via Google OAuth and verify token exchange works with the Portal"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <AlertTitle>Security Best Practices</AlertTitle>
            • Store Client ID and Secret in Replit Secrets, never commit to code
            <br />
            • Use separate apps for dev, staging, and production environments
            <br />
            • Regenerate secrets immediately if compromised
            <br />
            • Deactivate unused apps to prevent unauthorized access
          </Alert>
        </CardContent>
      </Card>

      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Registered Applications ({clients.length})
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Code />}
            onClick={() => setInstructionsOpen(true)}
          >
            Integration Guide
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadClients}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddClient}
            sx={{
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#43a047' },
            }}
          >
            Add Application
          </Button>
        </Stack>
      </Box>

      {/* Clients Table */}
      <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Environment</strong></TableCell>
              <TableCell><strong>Client ID</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No applications registered yet. Click "Add Application" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    opacity: client.is_active ? 1 : 0.6,
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {client.name}
                      </Typography>
                      {client.description && (
                        <Typography variant="caption" color="text.secondary">
                          {client.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {client.metadata?.environment && (
                      <Chip
                        label={client.metadata.environment}
                        size="small"
                        color={
                          client.metadata.environment === 'production'
                            ? 'error'
                            : client.metadata.environment === 'staging'
                            ? 'warning'
                            : 'info'
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {client.client_id.substring(0, 20)}...
                      </Typography>
                      <Tooltip title="Copy Client ID">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(client.client_id, 'Client ID')}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={client.is_active ? 'Click to deactivate' : 'Click to activate'}>
                      <Switch
                        checked={client.is_active}
                        onChange={() => handleToggleActive(client)}
                        disabled={togglingClient === client.id}
                        size="small"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#4caf50',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#4caf50',
                          },
                          '& .MuiSwitch-switchBase': {
                            color: '#9e9e9e',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: '#bdbdbd',
                          },
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(client.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(client)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogs */}
      <OAuthClientDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={loadClients}
        client={editingClient}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete OAuth Client"
        message={`Are you sure you want to delete "${clientToDelete?.name}"? This will revoke access for this application.`}
        confirmationName={clientToDelete?.name}
        loading={deleting}
      />

      {/* Integration Instructions Dialog */}
      <Dialog
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Code color="primary" />
            <Typography variant="h6" fontWeight={600}>
              SSO Integration Guide for Developers
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh' }}>
          <Stack spacing={3}>
            <Alert severity="info">
              <AlertTitle>Overview</AlertTitle>
              This guide shows how to integrate OAuth 2.0 SSO with your app to enable single sign-on across the Teamified Portal and all internal applications using the standard authorization code flow.
            </Alert>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Step 1: Register Your App
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Click "Add Application" above to register your app and receive:
              </Typography>
              <List dense>
                <ListItem><ListItemText primary="Client ID" secondary="Public identifier for your application" /></ListItem>
                <ListItem><ListItemText primary="Client Secret" secondary="Secret key for server-side token exchange (keep secure!)" /></ListItem>
                <ListItem><ListItemText primary="Redirect URI" secondary="Callback URL where Portal redirects with auth code" /></ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Step 2: Configure Environment Variables
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add these environment variables to your app:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                # Portal OAuth Configuration<br />
                PORTAL_BASE_URL=https://your-portal.replit.dev<br />
                OAUTH_CLIENT_ID=your_client_id<br />
                OAUTH_CLIENT_SECRET=your_client_secret<br />
                OAUTH_REDIRECT_URI=https://your-app.replit.dev/auth/callback
              </Paper>
              <Alert severity="error" sx={{ mt: 2 }}>
                <AlertTitle>🔒 Security Critical</AlertTitle>
                NEVER expose client_secret in frontend code! Use it only in backend API calls.
              </Alert>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Step 3: Redirect Unauthenticated Users to Portal
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                When a user needs to log in, redirect them to Portal's authorization endpoint:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
{`// Frontend: Redirect to Portal for login
const loginWithPortal = () => {
  const state = crypto.randomUUID(); // CSRF protection
  sessionStorage.setItem('oauth_state', state);
  
  const authUrl = new URL(\`\${PORTAL_BASE_URL}/api/v1/sso/authorize\`);
  authUrl.searchParams.set('client_id', OAUTH_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);
  
  window.location.href = authUrl.toString();
};`}
              </Paper>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Step 4: Handle OAuth Callback (Backend)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create a backend route to receive the authorization code and exchange it for a JWT:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
{`// Backend: Exchange auth code for JWT
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.redirect('/?error=missing_code');
  }
  
  try {
    // Exchange authorization code for JWT
    const response = await axios.post(
      \`\${PORTAL_BASE_URL}/api/v1/sso/token\`,
      {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        redirect_uri: process.env.OAUTH_REDIRECT_URI
      }
    );
    
    const { access_token, user } = response.data;
    
    // Store in httpOnly cookie for security
    res.cookie('auth_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Token exchange failed:', error);
    res.redirect('/?error=auth_failed');
  }
});`}
              </Paper>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Step 5: Use JWT for API Requests
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Attach the JWT to requests to Portal or your backend:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
{`// Backend: Middleware to verify JWT
const verifyAuth = async (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    // Verify with Portal or decode JWT locally
    const response = await axios.get(
      \`\${PORTAL_BASE_URL}/api/v1/users/me\`,
      { headers: { Authorization: \`Bearer \${token}\` } }
    );
    
    req.user = response.data;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Use in routes
app.get('/api/protected', verifyAuth, (req, res) => {
  res.json({ user: req.user });
});`}
              </Paper>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                OAuth Flow Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="1. User clicks Login"
                    secondary="Your app redirects to Portal /api/v1/sso/authorize"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="2. Portal Authentication"
                    secondary="User logs into Portal (if not already logged in)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="3. Authorization Code"
                    secondary="Portal redirects back with auth code (60-second TTL, single-use)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="4. Token Exchange"
                    secondary="Your backend exchanges code for JWT using client_secret"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="5. Authenticated Session"
                    secondary="Store JWT and use for all subsequent API requests"
                  />
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Token Exchange Response
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                The <code>/api/v1/sso/token</code> endpoint returns:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
{`{
  "access_token": "eyJhbGc...",  // JWT with 1-hour expiry
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGc...", // 7-day refresh token
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["admin", "hr_manager"],  // For RBAC
    "clientId": "123",                 // Organization support
    "clientName": "Acme Corp"
  }
}`}
              </Paper>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Portal API Endpoints
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Authorization"
                    secondary="GET /api/v1/sso/authorize - Initiates OAuth flow"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Token Exchange"
                    secondary="POST /api/v1/sso/token - Exchanges auth code for JWT"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="User Profile"
                    secondary="GET /api/v1/users/me - Verify token and get user data"
                  />
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Backend Proxy (If Client Secret Required)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                If the Portal API requires client secret for token exchange, create a backend endpoint:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
{`// Backend: server/routes/auth.js (Express example)
app.post('/api/auth/exchange', async (req, res) => {
  const { supabaseAccessToken } = req.body;
  
  try {
    const response = await axios.post(
      process.env.PORTAL_API_URL + '/api/v1/auth/supabase/exchange',
      {
        supabaseAccessToken,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET // Safe on server
      }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Token exchange failed'
    });
  }
});`}
              </Paper>
            </Box>

            <Alert severity="warning">
              <AlertTitle>🔒 Security Best Practices</AlertTitle>
              • <strong>CRITICAL:</strong> Never expose Client Secret in frontend code (no VITE_ prefix)
              <br />
              • Client Secret must only be used in backend/server-side code with proper environment variables
              <br />
              • Store tokens securely: httpOnly cookies (best) {'>'} sessionStorage {'>'} localStorage
              <br />
              • Implement token refresh logic before the 15-minute access token expires
              <br />
              • Validate roles on both frontend (UI display) and backend (security enforcement)
              <br />
              • Always use HTTPS in production - required for secure authentication
            </Alert>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                AI Prompt for Quick Setup
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Copy this prompt and paste it into an AI assistant (Claude, ChatGPT, etc.) to get help setting up SSO in your Replit app:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px dashed', borderColor: 'divider', fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
{`I need to integrate Supabase SSO into my React + Vite app on Replit to enable single sign-on with the Teamified Portal.

Requirements:
1. Install @supabase/supabase-js, axios, jwt-decode
2. Create Supabase client with autoRefreshToken and persistSession
3. Implement Google OAuth login flow
4. Create auth callback page that exchanges Supabase token for Portal JWT
5. Token exchange endpoint: POST to PORTAL_API_URL/api/v1/auth/supabase/exchange
6. Token exchange payload: { supabaseAccessToken, clientId }
   - IMPORTANT: Client secret must NOT be in frontend - only use in backend proxy if required
7. Response includes: { accessToken, refreshToken, user } where user has id, email, firstName, lastName, roles[], clientId, clientName
8. Store Portal tokens securely (prefer httpOnly cookies over localStorage)
9. Create axios instance that automatically attaches Portal JWT to requests
10. Implement logout that clears both Supabase and Portal sessions

Environment Variables (from Replit Secrets):
Frontend (VITE_ prefix - exposed to browser):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_OAUTH_CLIENT_ID
- VITE_PORTAL_API_URL

Backend only (NO VITE_ prefix - server-side only):
- OAUTH_CLIENT_SECRET (if Portal API requires it for token exchange)

Please provide:
1. File structure with clear frontend/backend separation
2. Complete code for supabase client, auth service, login component, and callback page
3. Router setup with /login and /auth/callback routes
4. Example of protected route that checks for Portal token
5. Backend proxy endpoint if client secret is needed (Express.js example)

Make the code production-ready with proper security, error handling, and TypeScript types. Ensure client secret is never exposed to frontend.`}
              </Paper>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstructionsOpen(false)} variant="contained">
            Got It
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OAuthClientsTab;
