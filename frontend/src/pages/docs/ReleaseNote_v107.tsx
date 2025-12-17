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
  Business,
  PersonAdd,
  Flag,
  Gavel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v107() {
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
                  <Chip label="v1.0.7" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    December 18, 2025
                  </Typography>
                  <Chip label="1 min read" size="small" variant="outlined" />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  HubSpot Integration for Client User Signup Flow
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity="info" icon={<AutoAwesome />}>
            <Typography variant="body2">
              <strong>What's New:</strong> Client signups now automatically sync to HubSpot CRM, 
              with AI-powered website analysis to auto-generate business descriptions. The redesigned 
              signup experience features a 2-step wizard with enhanced country and phone input components.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              1-Minute Summary
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="HubSpot CRM integration for automatic contact creation on client signup" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="AI-powered website analysis using GPT-4o for auto-filling business descriptions" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="New 2-step client signup wizard with improved UX" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Country selector and phone input with flag icons (AU/UK/US priority)" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Dual-mode login page with sign-in/sign-up toggle" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Business color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                1. HubSpot CRM Integration
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              New client signups are automatically synced to HubSpot CRM, creating contacts with 
              comprehensive business information for sales and marketing follow-up.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Automatic Contact Creation" 
                  secondary="Creates HubSpot contact on successful client admin signup with all collected business data"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Field Mapping" 
                  secondary="Maps mobile phone, company phone, company size, business description, roles needed, and how we can help"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Duplicate Handling" 
                  secondary="Detects existing contacts by email and updates their information instead of creating duplicates"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Graceful Degradation" 
                  secondary="Signup completes successfully even if HubSpot sync fails - errors are logged but don't block users"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AutoAwesome color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. AI-Powered Website Analysis
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              When clients enter their company website during signup, GPT-4o automatically analyzes 
              the website content and generates a business description to save time.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="2-Second Debounce" 
                  secondary="Waits for user to finish typing before triggering analysis to avoid unnecessary API calls"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Full-Overlay Loading Animation" 
                  secondary="Beautiful sparkle animation indicates AI is analyzing the website"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Editable Results" 
                  secondary="AI-generated description is placed in the form field and can be edited by the user"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Powered by GPT-4o" 
                  secondary="Uses Replit's managed OpenAI integration for reliable AI analysis"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <PersonAdd color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. Redesigned Signup Experience
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              The login page now features a dual-mode design and the client signup flow uses a 
              streamlined 2-step wizard for better user experience.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Dual-Mode Login Page" 
                  secondary="Toggle between 'Sign in' and 'Create New Account' modes with contextual messaging and smooth animations"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Email Validation in Signup Mode" 
                  secondary="Checks if email is already registered with shake animation and red field highlighting for errors"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="2-Step Client Wizard" 
                  secondary="Step 1: Account details (name, email, password, phone). Step 2: Business information (company, website, roles needed)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Updated Branding" 
                  secondary="Simplified messaging: 'Teamified - Build Your Global Team in Days — Not Weeks'"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Flag color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                4. Enhanced Form Components
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              New reusable components for country and phone selection with international support.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="CountrySelect Component" 
                  secondary="Searchable dropdown with country flags, prioritizing Australia, United Kingdom, and United States"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="PhoneInput Component" 
                  secondary="International phone input with country code selector and flag icons"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Smooth Form Transitions" 
                  secondary="Fade animations between wizard steps for polished user experience"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Gavel color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                5. Legal Agreements
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Dynamic legal acceptance checkboxes with country-specific service agreement links.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Terms & Privacy Acceptance" 
                  secondary="Required checkbox for Terms of Service and Privacy Policy agreement"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Dynamic Service Agreement Links" 
                  secondary="Links update based on selected country (e.g., AU/UK/US-specific agreements)"
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
