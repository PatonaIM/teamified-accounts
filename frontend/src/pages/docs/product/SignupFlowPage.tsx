import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  PersonAdd,
  CheckCircle,
  Google,
  Email,
  Business,
  Work,
  Send,
  Link as LinkIcon,
  ArrowForward,
  Person,
  Verified,
} from '@mui/icons-material';

export default function SignupFlowPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAdd color="primary" />
        Signup Flow
      </Typography>

      <Typography variant="body1" paragraph>
        Teamified Accounts offers multiple ways for users to create an account. The signup process 
        is tailored based on user type (Candidate or Employer) and authentication method (Email or Google).
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Two User Types:</strong> Candidates are job seekers looking for opportunities. 
          Employers (Client Users) are businesses looking to hire talent through Teamified's platform.
        </Typography>
      </Alert>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            Candidate Signup
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Candidates can sign up quickly with minimal information to start browsing jobs immediately.
          </Typography>

          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Email color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Email Signup
                  </Typography>
                  <Chip label="Recommended" color="success" size="small" />
                </Stack>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="1. Enter email on login page"
                      secondary="Click 'Create New Account' and enter your personal or work email"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="2. Choose 'Candidate' path"
                      secondary="Select 'Looking for a job' option on the path selection screen"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="3. Complete signup form"
                      secondary="Enter your name and create a password"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="4. Verify your email"
                      secondary="Click the verification link sent to your email"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="5. Start browsing jobs"
                      secondary="You're ready to explore opportunities on the Jobseeker Portal"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Google color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Google Signup
                  </Typography>
                  <Chip label="Fastest" color="primary" size="small" />
                </Stack>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="1. Click 'Continue with Google'"
                      secondary="On the login page, click the Google sign-in button"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="2. Select your Google account"
                      secondary="Choose which Google account to use for authentication"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="3. Choose 'Candidate' role"
                      secondary="Click the Candidate option - no additional form required"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="4. You're done!"
                      secondary="Account created instantly with your Google profile info - start browsing jobs"
                    />
                  </ListItem>
                </List>
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>No email verification needed:</strong> Google accounts are already verified, 
                    so you can start using Teamified immediately.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" />
            Employer (Client) Signup
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Employers complete a more detailed signup process to set up their organization and hiring needs.
          </Typography>

          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Email color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Email Signup (2-Step Wizard)
                  </Typography>
                  <Chip label="Full Details" color="secondary" size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The employer signup uses a 2-step wizard to collect account and business information.
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'action.hover', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Step 1: Account Details
                  </Typography>
                  <List dense disablePadding>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="First and last name" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Email address" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Password" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Mobile phone with country selector" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Country selection" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  </List>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'action.hover', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Step 2: Business Information
                  </Typography>
                  <List dense disablePadding>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Company/organization name" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Company website (triggers AI analysis)" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Company phone number" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Company size" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Business description (AI-generated or manual)" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Roles you're looking to hire" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="How can Teamified help you" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Terms & Privacy acceptance" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><ArrowForward fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Service Agreement acceptance (country-specific)" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  </List>
                </Paper>

                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="AI-Powered Website Analysis"
                      secondary="When you enter your company website, AI automatically analyzes it and suggests a business description"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="HubSpot CRM Sync"
                      secondary="Your information is automatically synced to HubSpot for sales follow-up"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="Email Verification"
                      secondary="Verify your email to complete account activation"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Google color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Google Signup
                  </Typography>
                  <Chip label="Quick Start" color="primary" size="small" />
                </Stack>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="1. Click 'Continue with Google'"
                      secondary="On the login page, authenticate with your Google account"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="2. Choose 'Employer' role"
                      secondary="Select the business/employer option"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="3. Enter organization name"
                      secondary="Provide your company name to create your organization"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="4. Start hiring"
                      secondary="Access ATS Portal to post jobs and HRIS Portal to manage your team"
                    />
                  </ListItem>
                </List>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Simplified Flow:</strong> Google signup for employers only requires the organization 
                    name. Additional business details can be added later in the organization settings.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Send color="primary" />
            Email Invitation Signup
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Users can also join Teamified through email invitations sent by organizations or team members.
          </Typography>

          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Work color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Organization Invitation (Work Email)
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Employers can invite team members to join their organization with specific roles.
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="1. Receive invitation email"
                      secondary="Your employer sends an invitation to your work email address"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="2. Click the invitation link"
                      secondary="Opens the invitation acceptance page with pre-filled details"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="3. Create your account"
                      secondary="Enter your name and create a password for your work account"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="4. Optional: Link existing account"
                      secondary="If you already have a personal Teamified account, you can link it to use one password for both"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="5. Join the organization"
                      secondary="Access granted with the role assigned by your employer (Admin, HR, Manager, etc.)"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <LinkIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Account Linking
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Teamified supports linking multiple emails to a single user identity (Multi-Identity SSO).
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="One password for all emails"
                      secondary="Link your personal and work emails to use the same login credentials"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="Sign in with any linked email"
                      secondary="Use any of your linked email addresses to log in to your account"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="Unified profile"
                      secondary="View all your linked emails and organization memberships in one place"
                    />
                  </ListItem>
                </List>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Work Email Control:</strong> Work emails can only be added through employer 
                    invitations - you cannot self-add work emails. This ensures proper organizational control.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Verified color="primary" />
            After Signup
          </Typography>

          <Stack spacing={2}>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Welcome Email
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                All new users receive a personalized welcome email with role-specific actions:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Person fontSize="small" color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Candidates"
                    secondary="'Browse Jobs' button linking to the Jobseeker Portal"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Business fontSize="small" color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Employers"
                    secondary="'Post Your First Job' (ATS Portal) and 'Set Up Your Organization' (HRIS Portal) buttons"
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Available Applications
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Based on your role, you'll have access to different Teamified applications:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Chip label="Jobseeker Portal" variant="outlined" size="small" />
                <Chip label="ATS Portal" variant="outlined" size="small" />
                <Chip label="HRIS Portal" variant="outlined" size="small" />
                <Chip label="Team Connect" variant="outlined" size="small" />
                <Chip label="Alexia AI" variant="outlined" size="small" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Access your apps anytime using the "My Apps" dropdown in the header navigation.
              </Typography>
            </Paper>
          </Stack>
        </Box>

        <Divider />

        <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Need Help?
          </Typography>
          <Typography variant="body2">
            If you have trouble signing up or need assistance with your account, 
            send us an email at hello@teamified.com.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
