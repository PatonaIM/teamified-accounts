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
  Timeline,
  CheckCircle,
  OpenInNew,
  Apps,
  Analytics,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

export default function ReleaseNote_2025_12_03() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <NewReleases color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label="v1.0.1" color="primary" sx={{ fontWeight: 600 }} />
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      December 3, 2025
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  User Activity Tracking
                </Typography>
              </Box>
            </Stack>
            
            <Typography variant="body1" color="text.secondary">
              This release introduces comprehensive user activity tracking capabilities, enabling connected 
              applications to send usage data to Teamified Accounts for centralized analytics and monitoring.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Timeline color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                1. User Activity Tracking
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              Connected applications can now send user activity data to Teamified Accounts, providing a 
              centralized view of how users interact with different applications.
            </Typography>
            
            <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="New Activity Recording API"
                    secondary="POST /api/v1/activity/record endpoint for sending user activity events"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Feature-based Categorization"
                    secondary="Group activities by feature categories for organized analytics"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Custom Metadata Support"
                    secondary="Attach additional context data to activity events"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Rate Limiting Protection"
                    secondary="Built-in rate limiting (100 requests/minute/user) to prevent abuse"
                  />
                </ListItem>
              </List>
            </Paper>

            <Button
              component={Link}
              to="/docs/developer/user-activity"
              variant="text"
              size="small"
              endIcon={<OpenInNew fontSize="small" />}
              sx={{ mb: 3 }}
            >
              View User Activity API Guide
            </Button>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Apps color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                2. Connected Applications Dashboard
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              Users can now view their activity across all connected applications in the "Connected Applications" 
              section of their profile. This provides transparency into how their data is being used.
            </Typography>
            
            <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Application Overview"
                    secondary="View all applications connected to the user's account"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Login Statistics"
                    secondary="Track total logins and last used timestamps per application"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Feature Usage Summary"
                    secondary="View feature usage frequency sorted by most-used actions"
                  />
                </ListItem>
              </List>
            </Paper>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Screenshot: Connected Applications Dashboard
            </Typography>
            <Paper 
              sx={{ 
                p: 1, 
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 2
              }}
            >
              <Box
                component="img"
                src="/images/user-activity-tracking.png"
                alt="Connected Applications Dashboard showing user activity tracking"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  display: 'block'
                }}
              />
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              The Connected Applications section shows login activity and feature usage statistics for each connected application.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Analytics color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                3. Activity Analytics Features
              </Typography>
            </Stack>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              The activity tracking system provides the following analytics capabilities:
            </Typography>

            <Stack spacing={2}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Login Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Automatically tracks when users log in to connected applications, including first login date, 
                  total login count, and last activity timestamp.
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Feature Usage Metrics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track which features users interact with most frequently. Usage data is sorted by frequency 
                  and displayed with the last activity timestamp.
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Cross-Application Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View aggregated activity data across all connected applications from a single dashboard, 
                  enabling comprehensive user behavior analysis.
                </Typography>
              </Paper>
            </Stack>
          </Box>

          <Divider />

          <Alert severity="info">
            <Typography variant="body2">
              <strong>For Developers:</strong> To integrate activity tracking in your application, 
              use the new <code>POST /api/v1/activity/record</code> endpoint with the user's SSO token. 
              See the <Link to="/docs/developer/user-activity" style={{ color: 'inherit' }}>User Activity API Guide</Link> for 
              complete integration examples.
            </Typography>
          </Alert>

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
