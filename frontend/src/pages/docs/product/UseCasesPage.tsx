import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import { Lightbulb } from '@mui/icons-material';

export default function UseCasesPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Lightbulb color="primary" />
        Common Use Cases
      </Typography>

      <Typography variant="body1" paragraph>
        Explore common scenarios and workflows that demonstrate how Teamified Accounts can be used 
        to streamline authentication and user management across your organization.
      </Typography>

      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            1. Onboarding New Client Organizations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Internal Account Managers create new organizations, assign a Client Admin, and configure initial settings. 
            The Client Admin then invites team members who automatically gain access to all SSO-enabled applications.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            2. Managing Team Member Access
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Client Admins invite new team members, assign roles, and manage permissions. When a team member leaves, 
            deactivating their account automatically revokes access across all connected applications.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            3. Connecting New Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Super Admins register new OAuth client applications, configure redirect URLs and scopes. Once configured, 
            users can seamlessly access the new application using their existing Teamified Accounts credentials.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            4. Compliance and Auditing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Internal teams use audit logs to track all user activities, permission changes, and SSO authentication events 
            for compliance reporting and security monitoring.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            5. Candidate Self-Registration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Job candidates can self-register through the Candidate Portal, creating their own Teamified account. 
            Once registered, they can apply for positions and participate in interviews across all connected recruiting platforms.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            6. Cross-Organization Support
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Internal support staff with appropriate roles can view and assist users across multiple client organizations 
            without needing separate credentials for each organization.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            7. Emergency Password Reset
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When users are locked out and cannot access their email, authorized administrators can set a temporary 
            password directly. The user is required to change this password immediately upon next login.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            8. Application Activity Tracking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track which OAuth applications users access, record feature usage within those applications, 
            and view activity with time-range filtering for analytics and security monitoring.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
