import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Stack,
  Alert,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link as MuiLink,
} from '@mui/material';
import {
  Business,
  Code,
  Security,
  People,
  AdminPanelSettings,
  VpnKey,
  IntegrationInstructions,
  Api,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`docs-tabpanel-${index}`}
      aria-labelledby={`docs-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DocsPage() {
  const [tabValue, setTabValue] = useState(0);

  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const swaggerUrl = `${apiUrl}/api/docs`;

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Teamified Accounts Documentation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Complete guide for stakeholders and developers
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<Business />} iconPosition="start" label="Product Guide" />
          <Tab icon={<Code />} iconPosition="start" label="Developer Guide" />
        </Tabs>

        {/* PRODUCT GUIDE */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={4} sx={{ px: 3 }}>
            {/* Overview Section */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="primary" />
                Platform Overview
              </Typography>
              <Typography variant="body1" paragraph>
                Teamified Accounts is a centralized authentication and user management platform that provides secure Single Sign-On (SSO), 
                multi-organization support, and comprehensive role-based access control. The platform enables seamless authentication 
                across multiple applications using industry-standard OAuth 2.0 protocol.
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Key Value Proposition:</strong> One account, multiple applications. Users can securely access all 
                  connected applications without re-entering credentials, while organizations maintain complete control over 
                  their team members' access and permissions.
                </Typography>
              </Alert>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Core Capabilities
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Single Sign-On (SSO)" 
                        secondary="Authenticate once and access all connected applications without re-login"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Multi-Organization Support" 
                        secondary="Manage multiple client organizations with complete data isolation and security"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Centralized User Management" 
                        secondary="Create, update, and manage user accounts, roles, and permissions from one platform"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Role-Based Access Control (RBAC)" 
                        secondary="Granular permissions system with internal, client, and candidate role hierarchies"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Audit Logging" 
                        secondary="Complete audit trail of all user activities and administrative actions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Invitation System" 
                        secondary="Streamlined onboarding with email invitations and organization assignment"
                      />
                    </ListItem>
                  </List>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* SSO Service Section */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VpnKey color="primary" />
                Single Sign-On (SSO) Service
              </Typography>
              
              <Typography variant="body1" paragraph>
                The SSO service implements OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange), 
                providing enterprise-grade security for authentication across multiple applications.
              </Typography>

              <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  How SSO Works
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. User logs into Teamified Accounts" 
                      secondary="One-time authentication with email and password"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. User accesses connected application" 
                      secondary="Click on application link or navigate directly to the app"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Automatic authentication" 
                      secondary="User is logged in automatically without re-entering credentials"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="4. Secure token exchange" 
                      secondary="Application receives user profile and permissions via encrypted token"
                    />
                  </ListItem>
                </List>
              </Paper>

              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Security Features:</strong> 60-second auth code expiry, single-use codes, PKCE protection, 
                  state parameter for CSRF prevention, and comprehensive audit logging.
                </Typography>
              </Alert>
            </Box>

            <Divider />

            {/* Roles and Permissions Section */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <People color="primary" />
                Roles and Permissions
              </Typography>

              <Typography variant="body1" paragraph>
                Teamified Accounts implements a hierarchical role-based access control system with three main categories: 
                Internal Roles, Client Roles, and Candidate Roles.
              </Typography>

              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Access Level</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Chip label="Super Admin" color="error" size="small" />
                      </TableCell>
                      <TableCell>Internal</TableCell>
                      <TableCell>Global</TableCell>
                      <TableCell>Full platform access across all organizations, system configuration, and user management</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Internal Member" color="primary" size="small" />
                      </TableCell>
                      <TableCell>Internal</TableCell>
                      <TableCell>Global</TableCell>
                      <TableCell>View and manage data across all organizations, limited administrative functions</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Internal Account Manager" color="primary" size="small" />
                      </TableCell>
                      <TableCell>Internal</TableCell>
                      <TableCell>Global</TableCell>
                      <TableCell>Manage client organizations, view organization data, support operations</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Client Admin" color="secondary" size="small" />
                      </TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Organization-Scoped</TableCell>
                      <TableCell>Full access to their organization's data, manage team members and settings</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Client Member" color="secondary" size="small" />
                      </TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Organization-Scoped</TableCell>
                      <TableCell>View organization data, limited editing permissions based on assigned scope</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Organization Data Isolation:</strong> Client roles can only access data from their assigned organization. 
                  Internal roles have cross-organization visibility for support and management purposes.
                </Typography>
              </Alert>
            </Box>

            <Divider />

            {/* Permission Matrix Section */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminPanelSettings color="primary" />
                Permission Matrix
              </Typography>

              <Typography variant="body1" paragraph>
                The platform uses granular permissions to control access to specific features and actions. 
                Permissions are automatically assigned based on user roles.
              </Typography>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Permission</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Available To</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><code>users:read</code></TableCell>
                      <TableCell>View user profiles and information</TableCell>
                      <TableCell>All roles</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>users:write</code></TableCell>
                      <TableCell>Create, update, and delete users</TableCell>
                      <TableCell>Super Admin, Client Admin</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>organizations:read</code></TableCell>
                      <TableCell>View organization details</TableCell>
                      <TableCell>All internal roles, Client Admin</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>organizations:write</code></TableCell>
                      <TableCell>Create and update organizations</TableCell>
                      <TableCell>Super Admin, Internal Account Manager</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>invitations:send</code></TableCell>
                      <TableCell>Send user invitations</TableCell>
                      <TableCell>Super Admin, Client Admin</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>oauth_clients:manage</code></TableCell>
                      <TableCell>Manage SSO client applications</TableCell>
                      <TableCell>Super Admin only</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>api_keys:manage</code></TableCell>
                      <TableCell>Generate and revoke API keys</TableCell>
                      <TableCell>Super Admin only</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>audit_logs:read</code></TableCell>
                      <TableCell>View audit logs and system activity</TableCell>
                      <TableCell>Super Admin, Internal Account Manager</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Divider />

            {/* Use Cases Section */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Common Use Cases
              </Typography>

              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    1. Onboarding New Client Organizations
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Internal Account Managers create new organizations, assign a Client Admin, and configure initial settings. 
                    The Client Admin then invites team members who automatically gain access to all SSO-enabled applications.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    2. Managing Team Member Access
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Client Admins invite new team members, assign roles, and manage permissions. When a team member leaves, 
                    deactivating their account automatically revokes access across all connected applications.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    3. Connecting New Applications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Super Admins register new OAuth client applications, configure redirect URLs and scopes. Once configured, 
                    users can seamlessly access the new application using their existing Teamified Accounts credentials.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    4. Compliance and Auditing
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Internal teams use audit logs to track all user activities, permission changes, and SSO authentication events 
                    for compliance reporting and security monitoring.
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          </Stack>
        </TabPanel>

        {/* DEVELOPER GUIDE */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={4} sx={{ px: 3 }}>
            {/* API Overview */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Api color="primary" />
                API Overview
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  All API endpoints are documented in the interactive{' '}
                  <MuiLink href={swaggerUrl} target="_blank" rel="noopener" sx={{ fontWeight: 600 }}>
                    Swagger UI documentation
                  </MuiLink>
                  {' '}where you can explore endpoints, test API calls, and view request/response schemas.
                </Typography>
              </Alert>

              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Base URL
                  </Typography>
                  <Typography variant="body2" component="code" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, display: 'block' }}>
                    {apiUrl}/api/v1
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Authentication
                  </Typography>
                  <Typography variant="body2" paragraph>
                    All protected endpoints require a valid JWT access token in the Authorization header:
                  </Typography>
                  <Typography variant="body2" component="code" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, display: 'block' }}>
                    Authorization: Bearer {'<'}access_token{'>'}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Rate Limiting
                  </Typography>
                  <Typography variant="body2">
                    API endpoints are rate-limited to prevent abuse. Standard limit: 100 requests per minute per IP address. 
                    Authentication endpoints have stricter limits (10 requests per minute).
                  </Typography>
                </Paper>
              </Stack>
            </Box>

            <Divider />

            {/* SSO Integration */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <IntegrationInstructions color="primary" />
                SSO Integration Guide
              </Typography>

              <Typography variant="body1" paragraph>
                Integrate OAuth 2.0 SSO into your application to enable seamless authentication with Teamified Accounts.
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Step 1: Register Your OAuth Client
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Navigate to OAuth Configuration" 
                        secondary="Login as Super Admin → Settings → OAuth Clients (SSO Apps)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Click 'Add New OAuth Client'" 
                        secondary="Fill in application name, description, and redirect URIs"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Save and copy credentials" 
                        secondary="Copy your client_id and client_secret (shown only once!)"
                      />
                    </ListItem>
                  </List>
                </Box>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    OAuth Endpoints
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Authorization (Launch):</Typography>
                      <Typography variant="body2" component="code" sx={{ display: 'block', fontSize: '0.875rem' }}>
                        GET {apiUrl}/api/v1/sso/launch/:clientId
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Authorization (Standard):</Typography>
                      <Typography variant="body2" component="code" sx={{ display: 'block', fontSize: '0.875rem' }}>
                        GET {apiUrl}/api/v1/sso/authorize
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Token Exchange:</Typography>
                      <Typography variant="body2" component="code" sx={{ display: 'block', fontSize: '0.875rem' }}>
                        POST {apiUrl}/api/v1/sso/token
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">User Info:</Typography>
                      <Typography variant="body2" component="code" sx={{ display: 'block', fontSize: '0.875rem' }}>
                        GET {apiUrl}/api/v1/sso/me
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Step 2: Implement OAuth Flow
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Redirect to Authorization Endpoint" 
                        secondary="Send users to /api/v1/sso/authorize with required parameters (client_id, redirect_uri, state, etc.)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Handle Authorization Callback" 
                        secondary="Receive authorization code in your redirect_uri callback endpoint"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Exchange Code for Token" 
                        secondary="POST to /api/v1/sso/token with authorization code and client credentials"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Fetch User Information" 
                        secondary="Use access_token to GET /api/v1/sso/me for user profile and roles"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Store Session" 
                        secondary="Save access_token and refresh_token securely (HttpOnly cookies recommended)"
                      />
                    </ListItem>
                  </List>
                </Box>

                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>Security:</strong> Always use PKCE for public clients, validate state parameter to prevent CSRF, 
                    and never expose client_secret in frontend code. Store tokens securely using HttpOnly cookies.
                  </Typography>
                </Alert>

                <Button
                  variant="outlined"
                  href="/docs/sso-integration"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  View Detailed SSO Integration Guide
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* Organization Management */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business color="primary" />
                Organization Management via API
              </Typography>

              <Typography variant="body1" paragraph>
                Programmatically manage client organizations using the REST API.
              </Typography>

              <Stack spacing={3}>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell><code>/api/v1/organizations</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell>Create new organization</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/organizations</code></TableCell>
                        <TableCell>GET</TableCell>
                        <TableCell>List all organizations (paginated)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/organizations/:id</code></TableCell>
                        <TableCell>GET</TableCell>
                        <TableCell>Get organization details</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/organizations/:id</code></TableCell>
                        <TableCell>PUT</TableCell>
                        <TableCell>Update organization</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/organizations/:id</code></TableCell>
                        <TableCell>DELETE</TableCell>
                        <TableCell>Delete organization</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/organizations/:id/members</code></TableCell>
                        <TableCell>GET</TableCell>
                        <TableCell>List organization members</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/organizations/:id/members</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell>Add member to organization</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/organizations/:id/members/:userId</code></TableCell>
                        <TableCell>DELETE</TableCell>
                        <TableCell>Remove member from organization</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Example: Create Organization
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
{`POST /api/v1/organizations
Authorization: Bearer <access_token>

{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "description": "Global software company",
  "industry": "Technology",
  "website": "https://acme.com"
}`}
                  </Typography>
                </Paper>

                <Button
                  variant="outlined"
                  href="/docs/multi-organization"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  View Multi-Organization Integration Guide
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* User Management */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <People color="primary" />
                User Management via API
              </Typography>

              <Typography variant="body1" paragraph>
                Create, update, and manage users programmatically.
              </Typography>

              <Stack spacing={3}>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell><code>/api/v1/users</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell>Create new user</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/users</code></TableCell>
                        <TableCell>GET</TableCell>
                        <TableCell>List all users (filtered by organization)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/users/:id</code></TableCell>
                        <TableCell>GET</TableCell>
                        <TableCell>Get user details</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/users/:id</code></TableCell>
                        <TableCell>PUT</TableCell>
                        <TableCell>Update user profile</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/users/:id/status</code></TableCell>
                        <TableCell>PATCH</TableCell>
                        <TableCell>Activate/deactivate user</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/users/bulk/status</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell>Bulk update user status</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/roles/assign</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell>Assign role to user</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/invitations</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell>Send user invitation</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Example: Create User
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
{`POST /api/v1/users
Authorization: Bearer <access_token>

{
  "email": "john.doe@acme.com",
  "firstName": "John",
  "lastName": "Doe",
  "roleType": "client_member",
  "organizationId": "org-uuid-here"
}`}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Example: Send Invitation
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
{`POST /api/v1/invitations
Authorization: Bearer <access_token>

{
  "email": "jane.smith@acme.com",
  "role": "client_admin",
  "organizationId": "org-uuid-here",
  "sendEmail": true
}`}
                  </Typography>
                </Paper>
              </Stack>
            </Box>

            <Divider />

            {/* Additional Resources */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Additional Resources
              </Typography>

              <Stack spacing={2}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Interactive API Documentation
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Explore all API endpoints, test requests, and view schemas in the Swagger UI.
                  </Typography>
                  <Button
                    variant="contained"
                    href={swaggerUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    Open Swagger API Docs
                  </Button>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    SSO Test Suite
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Test your OAuth 2.0 integration without writing code using our browser-based test suite.
                  </Typography>
                  <Button
                    variant="outlined"
                    href="/test"
                    target="_blank"
                  >
                    Open SSO Test Suite
                  </Button>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Integration Guides
                  </Typography>
                  <List dense>
                    <ListItem>
                      <Button href="/docs/sso-integration" variant="text" size="small">
                        SSO Integration Guide
                      </Button>
                    </ListItem>
                    <ListItem>
                      <Button href="/docs/multi-organization" variant="text" size="small">
                        Multi-Organization Integration Guide
                      </Button>
                    </ListItem>
                  </List>
                </Paper>
              </Stack>
            </Box>
          </Stack>
        </TabPanel>
      </Paper>
    </Box>
  );
}
