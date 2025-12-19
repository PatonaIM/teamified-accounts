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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  SyncAlt, 
  OpenInNew, 
  CheckCircle, 
  Security,
  Code,
  Warning,
} from '@mui/icons-material';

export default function S2SAuthenticationPage() {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const swaggerUrl = `${apiUrl}/api/docs`;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SyncAlt color="primary" />
        Service-to-Service Authentication
      </Typography>

      <Typography variant="body1" paragraph>
        Enable backend systems like HRIS, payroll integrations, and automated services to access Teamified Accounts 
        APIs without user sessions using OAuth 2.0 Client Credentials Grant.
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
            Overview
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Service-to-Service (S2S) authentication allows backend applications to authenticate directly with 
            Teamified Accounts without requiring a user to be logged in. This is ideal for:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="HRIS integrations syncing employee data" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Automated user provisioning and deprovisioning" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Background jobs that need API access" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="System integrations between internal services" />
            </ListItem>
          </List>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            How It Works
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            S2S uses the OAuth 2.0 Client Credentials Grant flow:
          </Typography>
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label="1" color="primary" size="small" />
                <Typography variant="body2">
                  Your backend sends a token request with <code>client_id</code>, <code>client_secret</code>, and requested <code>scope</code>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label="2" color="primary" size="small" />
                <Typography variant="body2">
                  Teamified Accounts validates the credentials and checks if the client is enabled for S2S
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label="3" color="primary" size="small" />
                <Typography variant="body2">
                  If valid, an access token is returned with the granted scopes
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label="4" color="primary" size="small" />
                <Typography variant="body2">
                  Use the access token in API requests as a Bearer token
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Enabling S2S for an OAuth Client
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            To enable S2S authentication for an application:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Chip label="1" size="small" /></ListItemIcon>
              <ListItemText 
                primary="Navigate to OAuth Configuration" 
                secondary="Go to Admin > Tools > OAuth Configuration"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Chip label="2" size="small" /></ListItemIcon>
              <ListItemText 
                primary="Edit the OAuth Client" 
                secondary="Click the edit icon on the client you want to enable S2S for"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Chip label="3" size="small" /></ListItemIcon>
              <ListItemText 
                primary="Enable Client Credentials Grant" 
                secondary="Toggle on 'Enable Service-to-Service (S2S)' in the dialog"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Chip label="4" size="small" /></ListItemIcon>
              <ListItemText 
                primary="Select Allowed Scopes" 
                secondary="Choose which API scopes this client can request"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Chip label="5" size="small" /></ListItemIcon>
              <ListItemText 
                primary="Save Changes" 
                secondary="The client will now show an 'S2S' badge in the OAuth clients table"
              />
            </ListItem>
          </List>
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
                  <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>read:users</code></TableCell>
                  <TableCell>Read user data</TableCell>
                  <TableCell>View user profiles, list users, get user details</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>write:users</code></TableCell>
                  <TableCell>Modify user data</TableCell>
                  <TableCell>Create users, update profiles, change status</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>read:organizations</code></TableCell>
                  <TableCell>Read organization data</TableCell>
                  <TableCell>View organizations, list members</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>write:organizations</code></TableCell>
                  <TableCell>Modify organization data</TableCell>
                  <TableCell>Create/update organizations, manage members</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>read:invitations</code></TableCell>
                  <TableCell>Read invitation data</TableCell>
                  <TableCell>View pending invitations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>write:invitations</code></TableCell>
                  <TableCell>Manage invitations</TableCell>
                  <TableCell>Send invitations, revoke invitations</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Code color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Token Request
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Request an access token using the Client Credentials Grant:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`POST /api/v1/sso/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=read:users read:organizations`}
            </pre>
          </Paper>
        </Box>

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

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Using the Access Token
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Include the access token in API requests as a Bearer token:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`GET /api/v1/users
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Code Examples
          </Typography>
          
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Node.js / TypeScript
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`async function getS2SToken() {
  const response = await fetch('https://accounts.teamified.com/api/v1/sso/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.TEAMIFIED_CLIENT_ID,
      client_secret: process.env.TEAMIFIED_CLIENT_SECRET,
      scope: 'read:users read:organizations',
    }),
  });
  
  const data = await response.json();
  return data.access_token;
}

async function getUsers() {
  const token = await getS2SToken();
  
  const response = await fetch('https://accounts.teamified.com/api/v1/users', {
    headers: {
      'Authorization': \`Bearer \${token}\`,
    },
  });
  
  return response.json();
}`}
            </pre>
          </Paper>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Python
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`import requests
import os

def get_s2s_token():
    response = requests.post(
        'https://accounts.teamified.com/api/v1/sso/token',
        data={
            'grant_type': 'client_credentials',
            'client_id': os.environ['TEAMIFIED_CLIENT_ID'],
            'client_secret': os.environ['TEAMIFIED_CLIENT_SECRET'],
            'scope': 'read:users read:organizations',
        }
    )
    return response.json()['access_token']

def get_users():
    token = get_s2s_token()
    
    response = requests.get(
        'https://accounts.teamified.com/api/v1/users',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    return response.json()`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Security color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Security Best Practices
            </Typography>
          </Stack>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Never expose client secrets in frontend code" 
                secondary="Client credentials should only be used in secure backend environments"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Use environment variables for credentials" 
                secondary="Never hardcode client_id or client_secret in source code"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Request minimal scopes" 
                secondary="Only request the scopes your integration actually needs"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Rotate client secrets regularly" 
                secondary="Use the 'Regenerate Secret' feature in OAuth Configuration periodically"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Monitor API usage" 
                secondary="Check audit logs for unusual access patterns from S2S clients"
              />
            </ListItem>
          </List>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Important:</strong> S2S tokens have full programmatic access based on their granted scopes. 
            Treat client secrets with the same security as passwords and API keys.
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
}
