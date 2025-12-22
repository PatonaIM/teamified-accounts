import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Security } from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# Platform Overview

Teamified Accounts is a centralized authentication and user management platform that provides secure Single Sign-On (SSO), multi-organization support, and comprehensive role-based access control. The platform enables seamless authentication across multiple applications using industry-standard OAuth 2.0 protocol.

> **Key Value Proposition:** One account, multiple applications. Users can securely access all connected applications without re-entering credentials, while organizations maintain complete control over their team members' access and permissions.

## Core Capabilities

- **Single Sign-On (SSO):** Authenticate once and access all connected applications without re-login
- **Multi-Organization Support:** Manage multiple client organizations with complete data isolation and security
- **Centralized User Management:** Create, update, and manage user accounts, roles, and permissions from one platform
- **Role-Based Access Control (RBAC):** Granular permissions system with internal, client, and candidate role hierarchies
- **Audit Logging:** Complete audit trail of all user activities and administrative actions
- **Invitation System:** Streamlined onboarding with email invitations and organization assignment

## Who Uses Teamified Accounts?

- **Internal Team Members:** HR, Recruiters, Account Managers, Finance, and Marketing staff who need cross-organization access
- **Client Organizations:** Client Admins and employees who manage their organization's users and access connected applications
- **Candidates:** Job applicants who access the Candidate Portal for applications and interviews
`;

export default function OverviewPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          Platform Overview
        </Typography>
        <DownloadMarkdownButton 
          filename="platform-overview" 
          content={markdownContent} 
        />
      </Box>
      
      <Typography variant="body1" paragraph>
        Teamified Accounts is a centralized authentication and user management platform that provides secure Single Sign-On (SSO), 
        multi-organization support, and comprehensive role-based access control. The platform enables seamless authentication 
        across multiple applications using industry-standard OAuth 2.0 protocol.
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Key Value Proposition:</strong> One account, multiple applications. Users can securely access all 
          connected applications without re-entering credentials, while organizations maintain complete control over 
          their team members' access and permissions.
        </Typography>
      </Alert>

      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Core Capabilities
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Single Sign-On (SSO)" 
                secondary="Authenticate once and access all connected applications without re-login"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Multi-Organization Support" 
                secondary="Manage multiple client organizations with complete data isolation and security"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Centralized User Management" 
                secondary="Create, update, and manage user accounts, roles, and permissions from one platform"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Role-Based Access Control (RBAC)" 
                secondary="Granular permissions system with internal, client, and candidate role hierarchies"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Audit Logging" 
                secondary="Complete audit trail of all user activities and administrative actions"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Invitation System" 
                secondary="Streamlined onboarding with email invitations and organization assignment"
              />
            </ListItem>
          </List>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Who Uses Teamified Accounts?
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Internal Team Members" 
                secondary="HR, Recruiters, Account Managers, Finance, and Marketing staff who need cross-organization access"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Client Organizations" 
                secondary="Client Admins and employees who manage their organization's users and access connected applications"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Candidates" 
                secondary="Job applicants who access the Candidate Portal for applications and interviews"
              />
            </ListItem>
          </List>
        </Box>
      </Stack>
    </Box>
  );
}
