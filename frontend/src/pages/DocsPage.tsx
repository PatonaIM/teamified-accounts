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
                    {/* Internal Roles */}
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
                        <Chip label="Internal HR" color="primary" size="small" />
                      </TableCell>
                      <TableCell>Internal</TableCell>
                      <TableCell>Global</TableCell>
                      <TableCell>HR operations across all organizations with access to HRIS and Team Connect</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Internal Recruiter" color="primary" size="small" />
                      </TableCell>
                      <TableCell>Internal</TableCell>
                      <TableCell>Global</TableCell>
                      <TableCell>Recruiting operations across all organizations with access to ATS and Candidate Portal</TableCell>
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
                        <Chip label="Internal Finance" color="primary" size="small" />
                      </TableCell>
                      <TableCell>Internal</TableCell>
                      <TableCell>Global</TableCell>
                      <TableCell>Financial operations across all organizations with access to Finance and HRIS data</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Internal Marketing" color="primary" size="small" />
                      </TableCell>
                      <TableCell>Internal</TableCell>
                      <TableCell>Global</TableCell>
                      <TableCell>Marketing operations with view-only access to data dashboard across organizations</TableCell>
                    </TableRow>
                    {/* Client Roles */}
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
                        <Chip label="Client Recruiter" color="secondary" size="small" />
                      </TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Organization-Scoped</TableCell>
                      <TableCell>Recruitment management for their organization with access to ATS and Team Connect</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Client HR" color="secondary" size="small" />
                      </TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Organization-Scoped</TableCell>
                      <TableCell>HR operations for their organization with access to HRIS and Team Connect</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Client Finance" color="secondary" size="small" />
                      </TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Organization-Scoped</TableCell>
                      <TableCell>Limited HR data access for financial operations within their organization</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Client Employee" color="secondary" size="small" />
                      </TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Organization-Scoped</TableCell>
                      <TableCell>Team collaboration with view-only access to own HR data</TableCell>
                    </TableRow>
                    {/* Public Role */}
                    <TableRow>
                      <TableCell>
                        <Chip label="Candidate" color="info" size="small" />
                      </TableCell>
                      <TableCell>Public</TableCell>
                      <TableCell>Limited</TableCell>
                      <TableCell>Public access to Candidate Portal for job applications and interview participation</TableCell>
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

            <Divider />

            {/* Password Reset Section */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VpnKey color="primary" />
                Password Reset & Recovery
              </Typography>

              <Typography variant="body1" paragraph>
                Teamified Accounts provides secure password reset functionality for users who have forgotten their passwords, 
                as well as administrative tools for authorized personnel to assist users with account recovery.
              </Typography>

              <Stack spacing={3}>
                {/* Self-Service Password Reset */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Self-Service Password Reset
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Users can reset their own password through the login page without administrator assistance.
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <List dense>
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

                {/* Admin Password Reset */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Administrative Password Reset
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Authorized administrators can help users reset their passwords through two methods:
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                        Option 1: Send Reset Link (Recommended)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Sends an email with a secure password reset link to the user. The user clicks the link and 
                        creates their own new password. This is the most secure method. The link expires after 24 hours.
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Available to:</strong> Super Admin, Internal HR, Internal Account Manager, Internal Recruiter, 
                        Internal Finance, Internal Marketing, Client Admin, Client HR, Client Finance, Client Recruiter
                      </Typography>
                    </Paper>

                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}>
                        Option 2: Set Password Directly (Restricted)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Administrator sets a temporary password directly. The user will be required to change this 
                        password on their next login. Use when the user cannot receive emails or needs immediate access.
                      </Typography>
                      <Alert severity="warning" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          The temporary password is shown only once and is not emailed. The administrator must 
                          securely communicate it to the user (e.g., via phone call, secure messaging).
                        </Typography>
                      </Alert>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Available to:</strong> Super Admin, Internal HR, Internal Account Manager only
                      </Typography>
                    </Paper>
                  </Stack>
                </Box>

                {/* Forced Password Change */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Forced Password Change
                  </Typography>
                  <Typography variant="body2" paragraph>
                    When an administrator sets a user's password directly (Option 2), the user will be required to 
                    change their password immediately upon their next login:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="1. User logs in with temporary password" 
                          secondary="Using the password provided by the administrator"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="2. System redirects to password change page" 
                          secondary="User cannot access any other features until password is changed"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="3. User creates a new personal password" 
                          secondary="Must meet all password complexity requirements"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="4. New session is created" 
                          secondary="User can now access the platform normally"
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Box>

                {/* Password Requirements */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Password Requirements
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Minimum 8 characters" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="At least one uppercase letter (A-Z)" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="At least one lowercase letter (a-z)" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="At least one number (0-9)" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="At least one special character (@$!%*?&.)" />
                      </ListItem>
                    </List>
                  </Paper>
                </Box>

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Security Best Practice:</strong> Always use Option 1 (Send Reset Link) when possible. 
                    Option 2 should only be used when email delivery is not possible or immediate access is required.
                  </Typography>
                </Alert>
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

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Intent Parameter (User Type Filtering)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Optionally pass an <code>intent</code> parameter to restrict authentication by user type:
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      • <code>intent=client</code> - Only client organization users
                    </Typography>
                    <Typography variant="body2">
                      • <code>intent=candidate</code> - Only candidate users
                    </Typography>
                    <Typography variant="body2">
                      • <code>intent=both</code> - All users (default)
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Note:</strong> Internal users (<code>super_admin</code>, <code>internal_*</code>) bypass all intent restrictions.
                  </Typography>
                </Paper>

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

            {/* Password Reset API */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VpnKey color="primary" />
                Password Reset API
              </Typography>

              <Typography variant="body1" paragraph>
                API endpoints for password reset operations. Each endpoint has specific role-based authorization requirements.
              </Typography>

              <Stack spacing={3}>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Auth</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell><code>/api/v1/auth/forgot-password</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell><Chip label="Public" size="small" /></TableCell>
                        <TableCell>User requests password reset email</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/auth/reset-password</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell><Chip label="Public" size="small" /></TableCell>
                        <TableCell>User resets password using token from email</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/auth/admin/send-password-reset</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell><Chip label="Restricted" color="primary" size="small" /></TableCell>
                        <TableCell>Admin sends password reset link to user</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/auth/admin/set-password</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell><Chip label="Restricted" color="warning" size="small" /></TableCell>
                        <TableCell>Admin sets user password directly</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>/api/v1/auth/force-change-password</code></TableCell>
                        <TableCell>POST</TableCell>
                        <TableCell><Chip label="Authenticated" color="secondary" size="small" /></TableCell>
                        <TableCell>User changes password after admin reset</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Authorization Requirements */}
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Authorization Requirements
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                        Send Password Reset Link (Option 1)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Endpoint:</strong> <code>POST /api/v1/auth/admin/send-password-reset</code>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <strong>Allowed Roles:</strong> super_admin, internal_hr, internal_account_manager, internal_recruiter, 
                        internal_finance, internal_marketing, client_admin, client_hr, client_finance, client_recruiter
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main', mb: 0.5 }}>
                        Set Password Directly (Option 2)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Endpoint:</strong> <code>POST /api/v1/auth/admin/set-password</code>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <strong>Allowed Roles:</strong> super_admin, internal_hr, internal_account_manager
                      </Typography>
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          This endpoint sets <code>mustChangePassword: true</code> on the user, forcing them to 
                          change their password on next login. All actions are logged for audit purposes.
                        </Typography>
                      </Alert>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.main', mb: 0.5 }}>
                        Forced Password Change Behavior
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        When an admin sets a user's password directly (Option 2):
                      </Typography>
                      <List dense sx={{ py: 0 }}>
                        <ListItem sx={{ py: 0.25 }}>
                          <ListItemText 
                            primary="User's mustChangePassword flag is set to true"
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 0.25 }}>
                          <ListItemText 
                            primary="All protected API endpoints will return 403 Forbidden until password is changed"
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 0.25 }}>
                          <ListItemText 
                            primary="Only /auth/me, /auth/force-change-password, /auth/login, and /auth/logout remain accessible"
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 0.25 }}>
                          <ListItemText 
                            primary="After successful password change, new tokens are issued and previous sessions are invalidated"
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Stack>
                </Paper>

                {/* Example: Self-Service Password Reset */}
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Example: Self-Service Password Reset Request
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
{`POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}

Response (200 OK):
{
  "message": "Password reset email sent successfully"
}`}
                  </Typography>
                </Paper>

                {/* Example: Reset Password with Token */}
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Example: Reset Password with Token
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
{`POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecure@Pass123"
}

Response (200 OK):
{
  "message": "Password reset successful"
}`}
                  </Typography>
                </Paper>

                {/* Example: Admin Send Reset Link */}
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Example: Admin Sends Password Reset Link
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
{`POST /api/v1/auth/admin/send-password-reset
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "userId": "user-uuid-here"
}

Response (200 OK):
{
  "message": "Password reset email sent to user"
}`}
                  </Typography>
                </Paper>

                {/* Example: Admin Set Password */}
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Example: Admin Sets Password Directly
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
{`POST /api/v1/auth/admin/set-password
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "userId": "user-uuid-here",
  "newPassword": "TempPass@123"
}

Response (200 OK):
{
  "message": "Password set successfully",
  "mustChangePassword": true,
  "warning": "User will be required to change password on next login"
}`}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Important:</strong> The password is not emailed to the user. The admin must 
                      securely communicate the temporary password. The user will be forced to change it on next login.
                    </Typography>
                  </Alert>
                </Paper>

                {/* Example: Force Change Password */}
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Example: User Changes Password After Admin Reset
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
{`POST /api/v1/auth/force-change-password
Authorization: Bearer <user_access_token>
Content-Type: application/json

{
  "newPassword": "MyNewSecure@Pass456",
  "confirmPassword": "MyNewSecure@Pass456"
}

Response (200 OK):
{
  "message": "Password changed successfully",
  "accessToken": "<new_access_token>",
  "refreshToken": "<new_refresh_token>"
}`}
                  </Typography>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Note:</strong> New tokens are issued after password change. All previous sessions 
                      are invalidated. Store the new tokens to continue accessing protected endpoints.
                    </Typography>
                  </Alert>
                </Paper>

                {/* Password Validation */}
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Password Validation Requirements
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    All password endpoints validate passwords against these requirements:
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
{`Password must contain:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&.)

Example Error Response (400 Bad Request):
{
  "message": "Password does not meet security requirements",
  "errors": [
    "at least one uppercase letter",
    "at least one special character (@$!%*?&.)"
  ]
}`}
                  </Typography>
                </Paper>

                {/* Rate Limiting */}
                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>Rate Limiting:</strong> Password reset endpoints are rate-limited to prevent abuse. 
                    Self-service endpoints: 5 requests per 5 minutes per IP. Admin endpoints: 10 requests per minute.
                  </Typography>
                </Alert>
              </Stack>
            </Box>

            <Divider />

            {/* Test Accounts */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <People color="primary" />
                Test User Accounts
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> These test accounts are for development and testing purposes only. 
                  Contact your administrator for access credentials.
                </Typography>
              </Alert>

              <Stack spacing={3}>
                {/* Internal Users */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Internal Team Users
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Access Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><code>admin@teamified.com</code></TableCell>
                          <TableCell>Admin User</TableCell>
                          <TableCell><Chip label="Super Admin" color="error" size="small" /></TableCell>
                          <TableCell>Global - Full Platform Access</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>sarah.chen@teamified.com</code></TableCell>
                          <TableCell>Sarah Chen</TableCell>
                          <TableCell><Chip label="Internal HR" color="primary" size="small" /></TableCell>
                          <TableCell>Global - HR Operations</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>marcus.johnson@teamified.com</code></TableCell>
                          <TableCell>Marcus Johnson</TableCell>
                          <TableCell><Chip label="Internal Recruiter" color="primary" size="small" /></TableCell>
                          <TableCell>Global - Recruiting & ATS</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>elena.rodriguez@teamified.com</code></TableCell>
                          <TableCell>Elena Rodriguez</TableCell>
                          <TableCell><Chip label="Internal Account Manager" color="primary" size="small" /></TableCell>
                          <TableCell>Global - Client Management</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>david.kim@teamified.com</code></TableCell>
                          <TableCell>David Kim</TableCell>
                          <TableCell><Chip label="Internal Finance" color="primary" size="small" /></TableCell>
                          <TableCell>Global - Financial Operations</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>lisa.wong@teamified.com</code></TableCell>
                          <TableCell>Lisa Wong</TableCell>
                          <TableCell><Chip label="Internal Marketing" color="primary" size="small" /></TableCell>
                          <TableCell>Global - Marketing (View-only)</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Stark Industries Users */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Stark Industries Inc. (Client Organization)
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><code>tony.stark@starkindustries.com</code></TableCell>
                          <TableCell>Tony Stark</TableCell>
                          <TableCell><Chip label="Client Admin" color="secondary" size="small" /></TableCell>
                          <TableCell>Full organization access</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>nick.fury@starkindustries.com</code></TableCell>
                          <TableCell>Nick Fury</TableCell>
                          <TableCell><Chip label="Client Admin" color="secondary" size="small" /></TableCell>
                          <TableCell>Full organization access</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>steve.rogers@starkindustries.com</code></TableCell>
                          <TableCell>Steve Rogers</TableCell>
                          <TableCell><Chip label="Client HR" color="secondary" size="small" /></TableCell>
                          <TableCell>HR operations</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>clint.barton@starkindustries.com</code></TableCell>
                          <TableCell>Clint Barton</TableCell>
                          <TableCell><Chip label="Client Recruiter" color="secondary" size="small" /></TableCell>
                          <TableCell>Recruitment management</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>natasha.romanoff@starkindustries.com</code></TableCell>
                          <TableCell>Natasha Romanoff</TableCell>
                          <TableCell><Chip label="Client Finance" color="secondary" size="small" /></TableCell>
                          <TableCell>Finance operations</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>pepper.potts@starkindustries.com</code></TableCell>
                          <TableCell>Pepper Potts</TableCell>
                          <TableCell><Chip label="Client Employee" color="secondary" size="small" /></TableCell>
                          <TableCell>Team member</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>peter.parker@starkindustries.com</code></TableCell>
                          <TableCell>Peter Parker</TableCell>
                          <TableCell><Chip label="Client Employee" color="secondary" size="small" /></TableCell>
                          <TableCell>Team member</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>bruce.banner@starkindustries.com</code></TableCell>
                          <TableCell>Bruce Banner</TableCell>
                          <TableCell><Chip label="Client Employee" color="secondary" size="small" /></TableCell>
                          <TableCell>Team member</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Additional Stark Industries employees: Thor Odinson, Carol Danvers, Sam Wilson, Bucky Barnes, 
                      Stephen Strange, Scott Lang, Hope Van Dyne, T'Challa, Shuri, James Rhodes, Gamora, and Peter Quill 
                      (all Client Employees).
                    </Typography>
                  </Alert>
                </Box>

                {/* Candidate Users */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Candidate Users (Public Access)
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><code>jones@jonesy.au</code></TableCell>
                          <TableCell>Simon Jones</TableCell>
                          <TableCell><Chip label="Candidate" color="info" size="small" /></TableCell>
                          <TableCell>Job applications & interviews</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>user10@teamified.com</code></TableCell>
                          <TableCell>Kiran Gupta</TableCell>
                          <TableCell><Chip label="Candidate" color="info" size="small" /></TableCell>
                          <TableCell>Job applications & interviews</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>user11@teamified.com</code></TableCell>
                          <TableCell>Priya Sharma</TableCell>
                          <TableCell><Chip label="Candidate" color="info" size="small" /></TableCell>
                          <TableCell>Job applications & interviews</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>user12@teamified.com</code></TableCell>
                          <TableCell>Sneha Patel</TableCell>
                          <TableCell><Chip label="Candidate" color="info" size="small" /></TableCell>
                          <TableCell>Job applications & interviews</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Additional candidate accounts available: user13@teamified.com through user18@teamified.com 
                      (Vikram Singh, Meera Kumar, Anita Gupta, Amit Sharma, Sneha Patel, Deepa Singh).
                    </Typography>
                  </Alert>
                </Box>

                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Testing Tip:</strong> Use these accounts to test different permission levels, organization scoping, 
                    and SSO flows. Contact your administrator for test account credentials.
                  </Typography>
                </Alert>
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
                    <ListItem>
                      <Button href="/docs/deep-linking-guide" variant="text" size="small">
                        Deep Linking & Session Persistence Guide
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
