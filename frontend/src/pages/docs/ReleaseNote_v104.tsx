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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
                    December 13, 2025
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

          {/* 2. Account Security Page */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. Account Security Page
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

          {/* 3. User Emails API */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Code color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. User Emails API
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              New REST API endpoints for programmatic management of linked email addresses.
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

          {/* 4. Organization Member Provisioning */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Lock color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                4. Work Email Provisioning
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Enhanced organization member onboarding with automatic work email linking.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Automatic Work Email Creation" 
                  secondary="When adding members to an organization, optionally provision a work email that links to the organization"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Organization-Linked Emails" 
                  secondary="Work emails are associated with their organization for domain validation and access control"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 5. Database Migration */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Storage color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                5. Database Updates
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
