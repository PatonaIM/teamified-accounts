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
} from '@mui/material';
import {
  ArrowBack,
  NewReleases,
  CheckCircle,
  AutoAwesome,
  AdminPanelSettings,
  Email,
  Security,
  BugReport,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v1012() {
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
                  <Chip label="v1.0.12" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    January 5, 2026
                  </Typography>
                  <Chip label="3 min read" size="small" variant="outlined" />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Admin User Emails API
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity="success" icon={<AutoAwesome />}>
            <Typography variant="body2">
              <strong>What's New:</strong> Administrators can now manage email addresses for any user 
              via new REST API endpoints. Supports both JWT and S2S authentication with role-based access control.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              1-Minute Summary
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="6 new admin endpoints for managing user emails (GET, POST, PUT, DELETE, set-primary, verify)" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Role-based access for super_admin, internal_hr, internal_account_manager, client_admin, client_hr" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="S2S authentication with read:user-emails and write:user-emails OAuth scopes" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="skipVerification flag allows admins to add pre-verified emails instantly" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AdminPanelSettings color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                1. Admin User Emails API
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              New endpoints enable administrators and HR personnel to manage email addresses for any user 
              in the system. This is essential for onboarding workflows, account corrections, and 
              organizational email provisioning.
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                    <TableCell><code>/api/v1/users/:userId/emails</code></TableCell>
                    <TableCell>Get all emails for a specific user</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                    <TableCell><code>/api/v1/users/:userId/emails</code></TableCell>
                    <TableCell>Add an email to a specific user</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="PUT" color="warning" size="small" /></TableCell>
                    <TableCell><code>/api/v1/users/:userId/emails/:emailId</code></TableCell>
                    <TableCell>Update an email for a specific user</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="DELETE" color="error" size="small" /></TableCell>
                    <TableCell><code>/api/v1/users/:userId/emails/:emailId</code></TableCell>
                    <TableCell>Remove an email from a specific user</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="PUT" color="warning" size="small" /></TableCell>
                    <TableCell><code>/api/v1/users/:userId/emails/:emailId/set-primary</code></TableCell>
                    <TableCell>Set an email as primary</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="PUT" color="warning" size="small" /></TableCell>
                    <TableCell><code>/api/v1/users/:userId/emails/:emailId/verify</code></TableCell>
                    <TableCell>Manually verify an email (bypass verification)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. Role-Based Access Control
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Admin endpoints are protected with strict role-based access control. Only the following 
              roles can access these endpoints:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="super_admin" 
                  secondary="Full access to all admin endpoints across all organizations"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="internal_hr" 
                  secondary="Teamified internal HR staff with cross-organization email management"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="internal_account_manager" 
                  secondary="Account managers supporting client organizations"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="client_admin" 
                  secondary="Client organization administrators managing their own users"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="client_hr" 
                  secondary="Client HR staff managing employee email addresses"
                />
              </ListItem>
            </List>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Access Denied:</strong> All other roles (candidate, client_employee, internal_member, etc.) 
                will receive a 403 Forbidden response when attempting to access these endpoints.
              </Typography>
            </Alert>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Email color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. S2S Authentication Support
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Backend systems can authenticate using OAuth 2.0 Client Credentials Grant to manage 
              user emails programmatically. Two new scopes are available:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Scope</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><code>read:user-emails</code></TableCell>
                    <TableCell>GET user emails (list all emails for a user)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code>write:user-emails</code></TableCell>
                    <TableCell>POST, PUT, DELETE user emails (add, update, remove, set-primary, verify)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mt: 2 }}>
              <pre style={{ margin: 0, fontSize: '0.85rem' }}>
{`# Obtain S2S token with user-emails scopes
POST /api/v1/sso/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=read:user-emails write:user-emails

# Use token to add email to user
POST /api/v1/users/{userId}/emails
Authorization: Bearer {s2s_access_token}
Content-Type: application/json

{
  "email": "new.email@company.com",
  "emailType": "work",
  "organizationId": "org-uuid",
  "skipVerification": true
}`}
              </pre>
            </Paper>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <BugReport color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                4. Bug Fix: Client Role Organization Linking
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Fixed an issue where test accounts with client roles (client_admin, client_hr, 
              client_finance, client_recruiter, client_employee) had NULL scope_entity_id values, 
              preventing proper organization-based access control.
            </Typography>
            
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Resolution:</strong> All client role test accounts are now properly linked to 
                their organization (Stark Industries) via scope_entity_id in the user_roles table.
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
                  primary="Controller" 
                  secondary={<><code>src/user-emails/admin-user-emails.controller.ts</code></>}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Service Methods" 
                  secondary={<><code>adminAddEmail</code>, <code>adminUpdateEmail</code>, <code>adminRemoveEmail</code>, <code>adminVerifyEmail</code></>}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Guards" 
                  secondary={<>JwtOrServiceGuard + RolesOrServiceGuard for dual JWT/S2S authentication</>}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Documentation" 
                  secondary={<>Updated at <code>/docs/developer/user-emails</code> with Admin API section</>}
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
