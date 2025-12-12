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
  Link,
} from '@mui/material';
import {
  ArrowBack,
  NewReleases,
  CheckCircle,
  Security,
  Email,
  Lock,
  Storage,
  Code,
  OpenInNew,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function ReleaseNote_v104() {
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
                  <Chip label="v1.0.4" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    December 11, 2025
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Release Notes
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* 1. Multi-Identity SSO */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Email color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                1. Multi-Identity SSO (Candidate + Employee Model)
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Users can now link multiple email addresses (personal and work emails for different organizations) 
              that all resolve to a single user identity. This enables seamless authentication across different 
              contexts while maintaining a unified account.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <Link component={RouterLink} to="/docs/developer/user-emails" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                View User Emails API Documentation <OpenInNew fontSize="small" />
              </Link>
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Single Password Authentication" 
                  secondary="Users maintain one password that works with any of their linked email addresses for simplified login"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Smart Identity Resolution" 
                  secondary="Login system automatically resolves any linked email to the correct user account via findUserByAnyEmail helper"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Email Type Classification" 
                  secondary="Emails are categorized as personal or work types, with work emails optionally linked to specific organizations"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Primary Email Designation" 
                  secondary="Users can set any verified email as their primary email for account communications"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 2. Organization Membership Status Filtering */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. Organization Membership Status Filtering
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Organizations and organizational access are now filtered based on membership status. 
              Only organizations where the user has accepted the invitation (active membership) will 
              appear in the UI. Pending invitations remain hidden until accepted.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Active Membership Filtering" 
                  secondary="My Organizations and Organizational Access sections only show organizations with 'active' membership status"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Hidden Pending Invitations" 
                  secondary="Organizations with 'invited' status are hidden until the invitation is accepted"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Profile Page Updates" 
                  secondary="Organizational Access section no longer shows global roles when no organizations are active"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Consistent Behavior" 
                  secondary="Backend /me endpoint and frontend profile page now consistently filter by active membership"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 3. Account Security Page */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. Account Security Page
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              New dedicated security management page accessible from the account sidebar for managing 
              linked emails and passwords.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Linked Emails Management" 
                  secondary="View all linked emails, add new email addresses, remove non-primary emails, and set primary email"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Self-Service Password Change" 
                  secondary="Change password by verifying current password - no email reset flow required"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Security Navigation Item" 
                  secondary="New 'Security' link added to account sidebar with shield icon for easy access"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 4. User Emails API */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Code color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                4. User Emails API
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              New REST API endpoints for programmatic management of linked email addresses.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <Link component={RouterLink} to="/docs/developer/user-emails" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                Full API Reference & Implementation Guide <OpenInNew fontSize="small" />
              </Link>
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="GET /api/user-emails" 
                  secondary="List all email addresses linked to the authenticated user"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="POST /api/user-emails" 
                  secondary="Add a new email address to the user's account"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="DELETE /api/user-emails/:id" 
                  secondary="Remove a linked email (cannot remove primary email)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="PUT /api/user-emails/:id/set-primary" 
                  secondary="Set a verified email as the primary email address"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="POST /api/user-emails/:id/resend-verification" 
                  secondary="Resend verification email for unverified addresses"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 5. Employer-Driven Work Email Provisioning */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Lock color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                5. Employer-Driven Work Email Provisioning
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Work emails are now provisioned exclusively through employer invitations, ensuring proper organizational control and preventing self-service work email addition.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <Link component={RouterLink} to="/docs/developer/user-emails" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                See Candidate + Employee Model Implementation <OpenInNew fontSize="small" />
              </Link>
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Invitation-Based Work Email Linking" 
                  secondary="Work emails are automatically linked when accepting organization invitations - users cannot self-add work emails"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Account Linking During Onboarding" 
                  secondary="Employees can optionally link work email to existing personal account during invitation acceptance"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Password Verification for Account Linking" 
                  secondary="When linking accounts, existing password is verified to prove ownership of the personal account"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Organization-Controlled Emails" 
                  secondary="All work emails are associated with their organization for proper access control and audit trail"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 6. Profile Page Improvements */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                6. Profile Page Improvements
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Enhanced profile page with clearer email organization and improved activity sections.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Primary Email Section" 
                  secondary="Renamed 'Personal Email' to 'Primary Email' for clearer terminology"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Work Emails in Organization Cards" 
                  secondary="Work email addresses now display directly within each organization card in the Organizational Access section"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Collapsible Activity Sections" 
                  secondary="Connected Applications, Login History, and Recent Activity sections are now collapsible and collapsed by default"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Role Badge Formatting" 
                  secondary="Role acronyms like HR, IT, CEO, CTO, CFO, VP are now displayed in all caps across all pages"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 7. Database Migration */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Storage color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                7. Database Updates
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              New database schema and migration for multi-identity support.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="UserEmail Entity" 
                  secondary="New entity for storing multiple emails per user with verification status, type, and organization linking"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Existing User Migration" 
                  secondary="All 186 existing users automatically migrated to new user_emails table with their primary email"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Idempotent Migration" 
                  secondary="Migration script uses CREATE TABLE IF NOT EXISTS for safe repeated deployments"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 8. SSO Token & Session Fixes */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                8. SSO Token & Session Fixes
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Critical fixes to the OAuth 2.0 SSO token exchange flow, ensuring proper session management 
              and token refresh functionality for client applications.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Access Token Expiration Corrected" 
                  secondary="Access tokens now correctly expire after 72 hours as documented, changed from the previous 15-minute misconfiguration"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Token Response expires_in Fixed" 
                  secondary="The expires_in field in token responses now returns 259200 seconds (72 hours) to match actual token lifetime"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="SSO Session Creation Added" 
                  secondary="Token exchange now properly creates session records, fixing 401 errors when refreshing tokens obtained via SSO"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Token Family Alignment" 
                  secondary="Session records now use the same token family as their refresh tokens, ensuring proper token rotation tracking"
                />
              </ListItem>
            </List>

            <Typography variant="body2" color="warning.main" sx={{ mt: 2, fontStyle: 'italic' }}>
              Note: Existing refresh tokens issued before this fix will not work. Users must log in again to receive new tokens with proper session tracking.
            </Typography>
          </Box>

          <Divider />

          {/* 9. SSO Logout Endpoint */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Lock color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                9. Unified SSO Logout Endpoint
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              New centralized logout endpoint for OAuth 2.0 client applications, enabling proper 
              RP-initiated logout with session revocation and redirect support.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <Link component={RouterLink} to="/docs/developer/session-management" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                View Session Management Guide <OpenInNew fontSize="small" />
              </Link>
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="GET /api/v1/sso/logout Endpoint" 
                  secondary="Centralized logout that clears httpOnly cookies and revokes all user sessions in the database"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Redirect Support" 
                  secondary="post_logout_redirect_uri parameter allows clients to receive users back after logout"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Session Revocation" 
                  secondary="All user sessions and token families are revoked server-side, preventing token reuse"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Client Validation" 
                  secondary="Optional client_id parameter validates redirect URIs against registered OAuth clients"
                />
              </ListItem>
            </List>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <strong>Usage:</strong> Client apps should clear local tokens first, then redirect to the logout endpoint:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, mt: 1, borderRadius: 1 }}>
              GET /api/v1/sso/logout?post_logout_redirect_uri=https://myapp.com/logged-out
            </Typography>
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
