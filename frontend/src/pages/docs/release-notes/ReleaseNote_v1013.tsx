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
  AutoAwesome,
  Menu,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v1013() {
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
                  <Chip label="v1.0.13" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    January 5, 2026
                  </Typography>
                  <Chip label="1 min read" size="small" variant="outlined" />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Navigation Bar Reorganization
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity="info" icon={<AutoAwesome />}>
            <Typography variant="body2">
              <strong>What's New:</strong> Streamlined navigation with promoted admin tools 
              for quicker access to key platform features.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Summary
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="OAuth Configuration promoted to main navigation for quick access" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Analytics & Reports promoted to main navigation" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Cleaner navigation experience for super admin users" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Menu color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Updated Navigation Structure
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              The sidebar navigation has been reorganized to highlight the most-used admin tools 
              for improved workflow efficiency.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              New Navigation Order:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="My Profile" secondary="Available to all users" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="My Apps" secondary="App launcher for connected applications" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="OAuth Configuration" secondary="Super admin only - manage OAuth clients" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Analytics & Reports" secondary="Super admin only - platform analytics" />
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
