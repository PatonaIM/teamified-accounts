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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Hub,
  CheckCircle,
  Settings,
  Sync,
  ContactMail,
  Business,
  Info,
  Warning,
} from '@mui/icons-material';

export default function HubSpotIntegrationPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Hub color="primary" />
        HubSpot Integration
      </Typography>

      <Typography variant="body1" paragraph>
        Teamified Accounts integrates with HubSpot CRM to automatically create contacts when new 
        client users (employers) sign up. This enables your sales and marketing teams to follow up 
        with leads directly from HubSpot.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Automatic Lead Capture:</strong> When an employer signs up through Teamified Accounts, 
          their business information is automatically synced to HubSpot as a new lead contact, including 
          company details, contact information, and their hiring needs.
        </Typography>
      </Alert>

      <Stack spacing={3}>
        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            How It Works
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="1. Employer signs up"
                secondary="A new user creates an employer account through the client signup wizard"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="2. Business information collected"
                secondary="The signup form captures company name, website, size, roles needed, and contact details"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="3. AI analyzes website (optional)"
                secondary="If a website is provided, AI automatically generates a business description"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="4. Contact created in HubSpot"
                secondary="All collected data is synced to HubSpot as a new contact with 'New Lead' status"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="5. Sales team notified"
                secondary="Your team can now follow up with the lead using HubSpot workflows"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Settings color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Configuration
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" paragraph>
            To enable the HubSpot integration, you need to configure your HubSpot API access token:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="1. Get your HubSpot Private App Access Token"
                secondary="In HubSpot, go to Settings > Integrations > Private Apps and create a new app with 'crm.objects.contacts.write' scope"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="2. Add the secret to your environment"
                secondary="Store your access token as HUBSPOT_ACCESS_TOKEN in your environment secrets"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="3. Restart the backend server"
                secondary="The integration will automatically activate when the token is detected"
              />
            </ListItem>
          </List>
          <Alert severity="warning" sx={{ mt: 2 }} icon={<Warning />}>
            <Typography variant="body2">
              <strong>Required Secret:</strong> <code>HUBSPOT_ACCESS_TOKEN</code> - Your HubSpot Private App access token. 
              Never share this token publicly.
            </Typography>
          </Alert>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Sync color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Data Mapping
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" paragraph>
            The following data is synced from the signup form to HubSpot contact properties:
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Signup Field</strong></TableCell>
                  <TableCell><strong>HubSpot Property</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell><code>firstname</code></TableCell>
                  <TableCell>Contact's first name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Last Name</TableCell>
                  <TableCell><code>lastname</code></TableCell>
                  <TableCell>Contact's last name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell><code>email</code></TableCell>
                  <TableCell>Primary contact email (unique identifier)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Company Name</TableCell>
                  <TableCell><code>company</code></TableCell>
                  <TableCell>Organization/company name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mobile Number</TableCell>
                  <TableCell><code>mobilephone</code></TableCell>
                  <TableCell>Personal mobile phone number</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Company Phone</TableCell>
                  <TableCell><code>phone</code></TableCell>
                  <TableCell>Business phone number</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Website</TableCell>
                  <TableCell><code>website</code></TableCell>
                  <TableCell>Company website URL</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Business Description</TableCell>
                  <TableCell><code>message</code></TableCell>
                  <TableCell>AI-generated or user-provided business description</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Roles Needed</TableCell>
                  <TableCell><code>what_role_s_do_you_need_</code></TableCell>
                  <TableCell>Types of roles the employer is hiring for</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>How Can We Help</TableCell>
                  <TableCell><code>how_can_we_help_you_</code></TableCell>
                  <TableCell>Employer's specific needs or challenges</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Company Size</TableCell>
                  <TableCell><code>company_size___contact</code></TableCell>
                  <TableCell>Employee count range (custom property)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Business color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Company Size Values
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" paragraph>
            Company sizes are mapped to these HubSpot-compatible values:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="1-20" size="small" variant="outlined" />
            <Chip label="21-50" size="small" variant="outlined" />
            <Chip label="51-100" size="small" variant="outlined" />
            <Chip label="101-200" size="small" variant="outlined" />
            <Chip label="201-500" size="small" variant="outlined" />
            <Chip label="501-1000" size="small" variant="outlined" />
            <Chip label="1000+" size="small" variant="outlined" />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <ContactMail color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Contact Lifecycle
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" paragraph>
            All contacts created through this integration are automatically assigned:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="Lifecycle Stage: Lead"
                secondary="Contacts are created as leads for sales qualification"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="Lead Status: New Lead"
                secondary="Fresh leads are marked as 'New Lead' for prioritization"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Info color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Duplicate Handling
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" paragraph>
            The integration intelligently handles duplicate contacts:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="Email uniqueness check"
                secondary="HubSpot uses email as a unique identifier - duplicate emails are detected automatically"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="Update existing contacts"
                secondary="If a contact with the same email exists, their information is updated instead of creating a duplicate"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="Conflict resolution"
                secondary="The system extracts the existing contact ID from conflict responses and performs an update"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Graceful Degradation
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The HubSpot integration is designed to never block user signups:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="Non-blocking operation"
                secondary="If HubSpot sync fails for any reason, the user signup still completes successfully"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="Error logging"
                secondary="All HubSpot errors are logged for debugging, but don't surface to users"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="Works without configuration"
                secondary="If HUBSPOT_ACCESS_TOKEN is not set, the integration is silently disabled"
              />
            </ListItem>
          </List>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Reliability First:</strong> User experience is prioritized - signups never fail due to HubSpot 
              integration issues. Any sync failures are handled gracefully in the background.
            </Typography>
          </Alert>
        </Paper>

        <Divider />

        <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Need Help?
          </Typography>
          <Typography variant="body2">
            For assistance with HubSpot integration setup or custom property configuration, 
            contact your system administrator or reach out to hello@teamified.com.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
