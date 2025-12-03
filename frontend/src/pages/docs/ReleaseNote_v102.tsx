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
  Settings,
  Edit,
  Security,
  Visibility,
  Business,
  Search,
  Reorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v102() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <NewReleases color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Chip label="v1.0.2" color="primary" sx={{ fontWeight: 600 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Release Notes
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              1. OAuth Configuration Management
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              A comprehensive OAuth Configuration management interface within Admin Tools, 
              enabling administrators to register and manage OAuth clients for SSO integration with an intuitive, 
              streamlined design.
            </Typography>

            <Box sx={{ ml: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Settings color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Redesigned Interface Layout
                </Typography>
              </Stack>
              <Typography variant="body1" paragraph>
                The OAuth Configuration page has been redesigned with a cleaner, more consistent layout that matches 
                other admin pages in the platform.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Inline Action Button"
                      secondary="'+ New Client' button moved inline with search bar and environment filter for consistent styling"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Streamlined Table"
                      secondary="Removed 'Created' column to reduce clutter and focus on essential information"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Clickable Table Rows"
                      secondary="Click any row to open the edit drawer for quick access to client details"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Wider Edit Drawer"
                      secondary="Expanded drawer width from 500px to 650px for better editing experience"
                    />
                  </ListItem>
                </List>
              </Paper>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Edit color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Enhanced Redirect URI Management
                </Typography>
              </Stack>
              <Typography variant="body1" paragraph>
                Redirect URIs now feature an intuitive inline editing system with visual change tracking.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Non-Editable by Default"
                      secondary="URIs are displayed as read-only text to prevent accidental changes"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Inline Editing with Icons"
                      secondary="Pencil icon to enable edit mode, checkmark to save changes locally"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Visual Change Indicators"
                      secondary="'Edited' (orange) and 'New' (green) chips show which URIs have been modified"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Add URI at Bottom"
                      secondary="New URI input field positioned after the list for intuitive workflow"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Delete Confirmation"
                      secondary="Confirmation dialog with warning message before removing redirect URIs"
                    />
                  </ListItem>
                </List>
              </Paper>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Visibility color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Seamless Status Toggle
                </Typography>
              </Stack>
              <Typography variant="body1" paragraph>
                OAuth client status can now be toggled with a seamless, optimistic update experience.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Optimistic Updates"
                      secondary="Toggle switches update immediately without waiting for server response"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Silent Success"
                      secondary="No notification on successful toggle to reduce visual noise"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Error Recovery"
                      secondary="Automatic rollback with error notification if toggle fails"
                    />
                  </ListItem>
                </List>
              </Paper>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Security color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Safe Deletion with Soft Delete
                </Typography>
              </Stack>
              <Typography variant="body1" paragraph>
                Enhanced deletion workflow with confirmation and soft delete functionality for data safety.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Name Confirmation Required"
                      secondary="Delete button only enabled after typing the exact client name"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Warning Message Display"
                      secondary="Visual warning appears once the client name is correctly typed"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Soft Delete for Clients"
                      secondary="OAuth clients use deleted_at timestamp for safe, recoverable deletion"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Soft Delete for URIs"
                      secondary="Removed redirect URIs stored in deleted_redirect_uris for audit trail"
                    />
                  </ListItem>
                </List>
              </Paper>

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Note:</strong> All changes to redirect URIs are saved locally until you click 
                  "Update Client". This allows you to review all modifications before committing them to the database.
                </Typography>
              </Alert>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              2. Organization Management Improvements
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Enhanced organization deletion handling and improved global search functionality 
              for better user management.
            </Typography>

            <Box sx={{ ml: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Business color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Improved Organization Deletion
                </Typography>
              </Stack>
              <Typography variant="body1" paragraph>
                Organization deletion now properly handles user disassociation, ensuring clean data management 
                when organizations are removed from the system.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="User Disassociation"
                      secondary="All organization members are automatically disassociated when an organization is deleted (users are not deleted, only unlinked)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Organization-Scoped Role Cleanup"
                      secondary="User roles scoped to the deleted organization are automatically removed"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Invitation Cancellation"
                      secondary="All pending invitations for the organization are cancelled"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Comprehensive Audit Logging"
                      secondary="Detailed audit records capture disassociated user IDs, member counts, cancelled invitations, and removed roles"
                    />
                  </ListItem>
                </List>
              </Paper>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Search color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Enhanced Global Search
                </Typography>
              </Stack>
              <Typography variant="body1" paragraph>
                The global search in Organization Management now includes orphan users (users without any assigned roles), 
                making it easier to find and manage all users in the system.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Orphan User Search"
                      secondary="Users without organization membership or roles now appear in search results"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Unassigned Role Label"
                      secondary="Orphan users are displayed with an 'unassigned' role indicator for easy identification"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Internal User Exclusion"
                      secondary="Search continues to exclude internal users (super_admin, internal_hr, etc.) and candidates"
                    />
                  </ListItem>
                </List>
              </Paper>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Reorder color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  User Activity Section Reorganization
                </Typography>
              </Stack>
              <Typography variant="body1" paragraph>
                The User Activity tab in user profiles has been reorganized for improved usability and logical flow.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  New Section Order:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="1. Connected Applications"
                      secondary="View SSO-connected applications with login counts and feature usage"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="2. General Activity"
                      secondary="Recent actions and administrative activities"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="3. Login History"
                      secondary="Detailed login timestamps, devices, and IP addresses"
                    />
                  </ListItem>
                </List>
              </Paper>

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Note:</strong> These improvements enhance the admin experience when managing organizations 
                  and users. Organization deletion is now safer and more transparent, with full audit trails for 
                  compliance purposes.
                </Typography>
              </Alert>
            </Box>
          </Box>

          <Divider />

          <Box sx={{ pt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/docs/release-notes')}
            >
              Back to Release Notes
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
