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
  Apps,
  Settings,
  Business,
  People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v102() {
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
                  <Chip label="v1.0.2" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    December 4, 2025
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Release Notes
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* 1. My Apps Dropdown - Featured First */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Apps color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                1. My Apps Dropdown
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              A Google Workspace-style app launcher in the sidebar for quick access to connected applications.
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Role-based app visibility - only see apps you can access" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Direct links open apps in new tabs with session persistence" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Grid layout with icons for Jobseeker, ATS, HRIS, Team Connect, and Alexia AI" />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 2. OAuth Configuration Management */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Settings color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. OAuth Configuration Management
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Redesigned OAuth client management interface in Admin Tools for SSO integration.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Inline action buttons and streamlined table layout" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Inline redirect URI editing with visual change indicators" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Optimistic status toggle with automatic rollback on failure" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Safe deletion requiring name confirmation with soft delete" />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 3. Organization Management */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Business color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. Organization Management
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Enhanced organization deletion and global search improvements.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Organization deletion now disassociates members and cleans up roles" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Global search includes orphan users with 'unassigned' indicator" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="User Activity sections reordered: Apps, Activity, Login History" />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 4. Candidate Users Management */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <People color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                4. Candidate Users Management
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Redesigned Candidate Users page with suspension functionality.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Table layout with avatar, email, status, created, and last login" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Status filter: All, Invited, Active, or Suspended" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Suspend/Reactivate users with optional reason for audit" />
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
