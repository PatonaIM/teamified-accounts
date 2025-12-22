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
} from '@mui/material';
import { VpnKey } from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# Single Sign-On (SSO) Service

The SSO service implements OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange), providing enterprise-grade security for authentication across multiple applications.

## How SSO Works

1. **User logs into Teamified Accounts:** One-time authentication with email and password
2. **User accesses connected application:** Click on application link or navigate directly to the app
3. **Automatic authentication:** User is logged in automatically without re-entering credentials
4. **Secure token exchange:** Application receives user profile and permissions via encrypted token

> **Security Features:** 60-second auth code expiry, single-use codes, PKCE protection, state parameter for CSRF prevention, and comprehensive audit logging.

## Session Management

- **72-hour inactivity timeout:** Sessions expire after 72 hours of inactivity for security
- **30-day absolute expiry:** Maximum session duration of 30 days regardless of activity
- **Dual-token strategy:** Bearer token + httpOnly cookie for enhanced security
- **Redis-backed storage:** Secure, scalable session storage with fast retrieval

## Cross-App SSO by Environment

SSO behavior varies based on the deployment environment due to browser cookie security policies.

- **Production (.teamified.com):** True seamless SSO - cookies are shared across all subdomains (hris.teamified.com, teamconnect.teamified.com, etc.). Log in once and access all apps instantly.
- **Staging (.replit.app):** OAuth redirect-based SSO - each app redirects to Teamified Accounts for authentication. If already logged in, the flow completes instantly without showing the login form.

> **Why the difference?** The .replit.app domain is on the Public Suffix List (PSL), which prevents browsers from sharing cookies across subdomains for security reasons. Production deployments on .teamified.com don't have this restriction.

## Supported OAuth Flows

- **Authorization Code Flow with PKCE:** Recommended for web and native applications - most secure option
- **Client Credentials Flow:** For server-to-server communication without user context
`;

export default function SsoPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKey color="primary" />
          Single Sign-On (SSO) Service
        </Typography>
        <DownloadMarkdownButton 
          filename="sso-service" 
          content={markdownContent} 
        />
      </Box>
      
      <Typography variant="body1" paragraph>
        The SSO service implements OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange), 
        providing enterprise-grade security for authentication across multiple applications.
      </Typography>

      <Stack spacing={3}>
        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            How SSO Works
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="1. User logs into Teamified Accounts" 
                secondary="One-time authentication with email and password"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="2. User accesses connected application" 
                secondary="Click on application link or navigate directly to the app"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="3. Automatic authentication" 
                secondary="User is logged in automatically without re-entering credentials"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="4. Secure token exchange" 
                secondary="Application receives user profile and permissions via encrypted token"
              />
            </ListItem>
          </List>
        </Paper>

        <Alert severity="success">
          <Typography variant="body2">
            <strong>Security Features:</strong> 60-second auth code expiry, single-use codes, PKCE protection, 
            state parameter for CSRF prevention, and comprehensive audit logging.
          </Typography>
        </Alert>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Session Management
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="72-hour inactivity timeout" 
                secondary="Sessions expire after 72 hours of inactivity for security"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="30-day absolute expiry" 
                secondary="Maximum session duration of 30 days regardless of activity"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Dual-token strategy" 
                secondary="Bearer token + httpOnly cookie for enhanced security"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Redis-backed storage" 
                secondary="Secure, scalable session storage with fast retrieval"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Cross-App SSO by Environment
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            SSO behavior varies based on the deployment environment due to browser cookie security policies.
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Production (.teamified.com)" 
                secondary="True seamless SSO - cookies are shared across all subdomains (hris.teamified.com, teamconnect.teamified.com, etc.). Log in once and access all apps instantly."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Staging (.replit.app)" 
                secondary="OAuth redirect-based SSO - each app redirects to Teamified Accounts for authentication. If already logged in, the flow completes instantly without showing the login form."
              />
            </ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Why the difference?</strong> The .replit.app domain is on the Public Suffix List (PSL), 
              which prevents browsers from sharing cookies across subdomains for security reasons. 
              Production deployments on .teamified.com don't have this restriction.
            </Typography>
          </Alert>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Supported OAuth Flows
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Authorization Code Flow with PKCE" 
                secondary="Recommended for web and native applications - most secure option"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Client Credentials Flow" 
                secondary="For server-to-server communication without user context"
              />
            </ListItem>
          </List>
        </Paper>
      </Stack>
    </Box>
  );
}
