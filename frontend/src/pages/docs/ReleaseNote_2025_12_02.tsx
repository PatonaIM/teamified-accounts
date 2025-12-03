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
  CalendarMonth,
  Image,
  Business,
  BugReport,
  CheckCircle,
  Person,
  AdminPanelSettings,
  Group,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_2025_12_02() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/docs')}
        sx={{ mb: 3 }}
      >
        Back to Documentation
      </Button>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <NewReleases color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label="v1.0.0" color="primary" sx={{ fontWeight: 600 }} />
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      December 2, 2025
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Teamified Accounts - Patch Notes
                </Typography>
              </Box>
            </Stack>
            
            <Typography variant="body1" color="text.secondary">
              This release includes support for profile pictures, organization creation improvements, 
              and various bug fixes across the platform.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Image color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                1. Support for Profile Pictures
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              Endpoints now return the Image URL path for both organization company logos and user profile photos.
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="User profile picture URLs now included in API responses"
                    secondary="Enables displaying profile photos across integrated applications"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Organization logo URLs now included in API responses"
                    secondary="Allows client applications to display company branding"
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Business color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                2. Create Organization Endpoint Enhancement
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              The organization creation endpoint now includes an optional email parameter for inviting a client admin during creation.
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body2" color="text.secondary">
                This streamlines the onboarding process by allowing internal users to create an organization and 
                send an admin invitation in a single API call.
              </Typography>
            </Paper>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <BugReport color="warning" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                3. Bug Fixes
              </Typography>
            </Stack>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              This release addresses several bugs across the following areas:
            </Typography>

            <Stack spacing={3}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Person color="primary" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    My Profile Page
                  </Typography>
                </Stack>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Full functional testing completed" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Reset password functionality fixed" />
                  </ListItem>
                </List>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <AdminPanelSettings color="primary" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Admin Tools → Organization Management
                  </Typography>
                </Stack>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Internal users can create empty organizations (no admins)" 
                      secondary="Organizations can now be created without requiring an initial admin assignment"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Invite errors fixed - User not authenticated (both email and link)" 
                      secondary="Resolved authentication issues when sending invitations via email or generating invite links"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Edit Company Profile (including Company Logo)" 
                      secondary="Fixed issues with updating organization profiles and uploading company logos"
                    />
                  </ListItem>
                </List>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Group color="primary" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Admin Tools → Candidate Management
                  </Typography>
                </Stack>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Various bug fixes and stability improvements" />
                  </ListItem>
                </List>
              </Paper>
            </Stack>
          </Box>

          <Divider />

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Note:</strong> If you experience any issues after this update, please clear your browser cache 
              and refresh the page. For persistent issues, contact support@teamified.com.
            </Typography>
          </Alert>

          <Box sx={{ pt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/docs')}
            >
              Back to Documentation
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
