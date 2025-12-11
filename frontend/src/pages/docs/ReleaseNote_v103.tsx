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
  Speed,
  Security,
  People,
  Business,
  BugReport,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v103() {
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
                  <Chip label="v1.0.3" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    December 5, 2025
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Release Notes
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* 1. Performance Improvements */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Speed color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                1. Performance Improvements
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Optimized initial page load experience with faster rendering and reduced visual flickering.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Theme Flash Prevention" 
                  secondary="Eliminated white flash before dark mode loads by setting initial background color from localStorage before React initializes"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Instant Navigation Rendering" 
                  secondary="Sidebar navigation now appears immediately without waiting for async organization data fetches"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="My Organization Tab Optimization" 
                  secondary="Tab displays instantly for client users with smooth redirect handling to first organization"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Smooth SPA Navigation" 
                  secondary="All navigation now updates only the content area without full page reloads, maintaining sidebar and header visibility"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Organization Slug Caching" 
                  secondary="Cached organization slug enables instant redirect on 'My Organization' clicks without loading animations"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 2. Multi-Organization Navigation */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Business color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. Multi-Organization Navigation
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Enhanced navigation system for users with multiple organization memberships.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Organization Redirect Route" 
                  secondary="New /organization route automatically redirects to user's first organization with loading indicator"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Streamlined Tab Labels" 
                  secondary="Changed dynamic 'My Organization/My Organizations' label to static 'My Organization' for consistency"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 3. Role-Based Access Control Enhancements */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. Role-Based Access Control Enhancements
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Extended RBAC permissions for client organization administrators.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Client Admin User Access" 
                  secondary="Client Admin and Client HR roles can now view user details for members within their organization"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Organization-Scoped Access Control" 
                  secondary="Backend validates organization membership before granting user detail access to client users"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Shared User Detail Page" 
                  secondary="Single /users/:userId route accessible to both internal and client users with dynamic RBAC controls"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 4. User Management for Client Organizations */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <People color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                4. User Management for Client Organizations
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Client organization admins can now manage their team members directly.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="User Detail Page Access" 
                  secondary="View detailed user profiles including basic information and status"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Permission-Based Tab Visibility" 
                  secondary="Tabs are filtered based on user role - client users see relevant sections only"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Contextual Back Navigation" 
                  secondary="Returns users to their organization page with proper context preservation"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* 5. Bug Fixes */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <BugReport color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                5. Bug Fixes
              </Typography>
            </Stack>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Fixed User Detail Page White Screen" 
                  secondary="Resolved React hooks order violation that caused blank page render for client users"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Fixed Hook Dependencies" 
                  secondary="Moved useMemo and useEffect hooks before early returns to comply with React Rules of Hooks"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Fixed User Detail Page Layout" 
                  secondary="User profile page now renders within the navigation layout with sidebar and header visible"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Fixed My Organization Full Page Reload" 
                  secondary="Clicking 'My Organization' tab now performs smooth client-side navigation instead of full page reload"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Fixed Double Loading Animation" 
                  secondary="Eliminated redundant loading spinner when navigating to organization page by using cached redirect"
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
