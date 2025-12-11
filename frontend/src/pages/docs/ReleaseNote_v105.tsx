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
} from '@mui/material';
import {
  CheckCircle,
  Email,
  Business,
  Visibility,
  TextFormat,
} from '@mui/icons-material';

export default function ReleaseNote_v105() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Profile Page Improvements & Email Organization
          </Typography>
          <Chip label="v1.0.5" color="primary" />
        </Box>
        <Typography variant="body1" color="text.secondary">
          December 11, 2025
        </Typography>
      </Box>

      <Stack spacing={4}>
        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email color="primary" />
            Email Display Improvements
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Renamed 'Personal Email' to 'Primary Email'" 
                secondary="Clearer terminology for the main account email address"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Removed redundant 'Primary' badge" 
                secondary="Since the section is already labeled 'Primary Email', the badge was unnecessary"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Work emails shown within Organization cards" 
                secondary="Work email addresses are now displayed directly under each organization name in the Organizational Access section"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" />
            Organizational Access Redesign
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Simplified organization display" 
                secondary="Each organization card shows: logo/avatar, company name, work email, and role badge"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Clickable organization cards" 
                secondary="Click on any organization to navigate directly to its management page"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility color="primary" />
            Activity Stats Collapsible Sections
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Connected Applications - now collapsible" 
                secondary="Collapsed by default for a cleaner profile page"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Login History - now collapsible" 
                secondary="Collapsed by default, expand to view recent login sessions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Recent Activity - now collapsible" 
                secondary="Collapsed by default, expand to view recent account actions"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextFormat color="primary" />
            Role Display Formatting
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Proper acronym capitalization" 
                secondary="Role acronyms like HR, IT, CEO, CTO, CFO, VP are now displayed in all caps across all pages"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Centralized role formatting utility" 
                secondary="New formatRoleDisplay function ensures consistent role name display throughout the application"
              />
            </ListItem>
          </List>
        </Paper>

        <Divider />

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Technical Changes
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Database migration for user emails" 
                secondary="Updated unique constraint from UNIQUE(email) to UNIQUE(email, organization_id) to support same email as both personal and work contexts"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Data backfill migration" 
                secondary="Automated migration to create personal and work email records for all existing users and organization memberships"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Shared role formatting utility" 
                secondary="Added formatRoleDisplay to roleMetadata.ts for consistent role name formatting across components"
              />
            </ListItem>
          </List>
        </Box>
      </Stack>
    </Box>
  );
}
