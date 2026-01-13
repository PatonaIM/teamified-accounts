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
  Email,
  Lock,
  Palette,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v110() {
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
                  <Chip label="v1.1.0" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    January 13, 2026
                  </Typography>
                  <Chip label="2 min read" size="small" variant="outlined" />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  AI-Powered Business Signup & Unified Email Experience
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity="info" icon={<AutoAwesome />}>
            <Typography variant="body2">
              <strong>What's New:</strong> Business signup is now smarter with AI-powered description 
              generation. All transactional emails have been unified with consistent Teamified branding, 
              and password recovery flows are more secure with OTP verification.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Summary
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="AI automatically generates business descriptions from website URLs" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="All transactional emails now share unified purple gradient branding" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="OTP-based password reset with secure 3-step verification" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Personalized email greetings based on user type" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Role-based CTAs in welcome emails" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="UI refinements with design system compliance" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AutoAwesome color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                AI-Powered Business Description
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              When signing up for a business account, simply enter your company's website URL and our 
              AI will automatically analyze your site and generate a professional business description. 
              The field remains fully editable so you can refine or replace the text as needed.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Features:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Smart URL Handling" 
                  secondary="URLs are automatically normalized (adding https:// when needed) for seamless analysis" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Loading Feedback" 
                  secondary="A spinner and 'AI is analyzing your website...' message shows during analysis" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Error Handling" 
                  secondary="Clear feedback when analysis can't complete, prompting manual entry" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Fully Editable" 
                  secondary="Generated descriptions can be modified or replaced entirely" 
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Email color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Unified Email Experience
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              All transactional emails now share a consistent, professional design that reflects 
              the Teamified brand. This includes Email Verification, Password Reset OTP, and 
              Welcome emails.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Design Updates:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Purple Gradient Headers" 
                  secondary="All emails feature the signature Teamified purple gradient (#9333EA to #7C3AED)" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Personalized Greetings" 
                  secondary="Business users see their company name; job seekers see their first name" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Role-Based CTAs" 
                  secondary="Welcome emails include tailored buttons: 'Post Your First Job' for businesses, 'Browse Jobs' for candidates" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Consistent Layout" 
                  secondary="Unified container, header, content, and footer structure across all emails" 
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Lock color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                OTP-Based Password Reset
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Password recovery is now more secure with a 3-step OTP verification process. Users 
              receive a one-time passcode via email that must be entered to reset their password.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              How It Works:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Step 1: Enter Email" 
                  secondary="User requests a password reset with their registered email address" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Step 2: Verify OTP" 
                  secondary="6-digit code sent via email must be entered within the validity window" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Step 3: Set New Password" 
                  secondary="User creates a new secure password after successful verification" 
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Palette color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                UI/UX Refinements
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Several UI improvements ensure a more polished and consistent user experience 
              aligned with the Teamified design system.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Email Verification Page" 
                  secondary="Streamlined success and error states with improved messaging" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Button Styling" 
                  secondary="Primary and secondary CTAs now consistently follow the design guide" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Design System Compliance" 
                  secondary="All components use the signature purple (#9333EA) and Nunito Sans typography" 
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
