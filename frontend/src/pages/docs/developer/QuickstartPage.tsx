import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import { RocketLaunch, ContentCopy } from '@mui/icons-material';

export default function QuickstartPage() {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <RocketLaunch color="primary" />
        Quick Start Guide
      </Typography>

      <Typography variant="body1" paragraph>
        Get started integrating Teamified Accounts SSO into your application in just a few steps.
      </Typography>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Prerequisites
          </Typography>
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>OAuth Client ID and Secret (obtain from your Super Admin)</li>
              <li>Authorized redirect URI configured for your application</li>
              <li>Understanding of OAuth 2.0 Authorization Code Flow</li>
            </ul>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Step 1: Request OAuth Credentials
          </Typography>
          <Typography variant="body1" paragraph>
            Contact your Super Admin to create an OAuth client application. You'll receive:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`CLIENT_ID: your-client-id
CLIENT_SECRET: your-client-secret
REDIRECT_URI: https://yourapp.com/callback`}
            </pre>
          </Paper>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Step 2: Initiate Authorization
          </Typography>
          <Typography variant="body1" paragraph>
            Redirect users to the authorization endpoint:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`GET ${apiUrl}/sso/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=openid profile email&
  state=RANDOM_STATE_VALUE&
  code_challenge=YOUR_PKCE_CHALLENGE&
  code_challenge_method=S256`}
            </pre>
          </Paper>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Step 3: Exchange Code for Tokens
          </Typography>
          <Typography variant="body1" paragraph>
            After user authorizes, exchange the code for access tokens:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`POST ${apiUrl}/sso/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTHORIZATION_CODE&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET&
redirect_uri=YOUR_REDIRECT_URI&
code_verifier=YOUR_PKCE_VERIFIER`}
            </pre>
          </Paper>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Step 4: Get User Information
          </Typography>
          <Typography variant="body1" paragraph>
            Use the access token to retrieve user profile:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`GET ${apiUrl}/sso/userinfo
Authorization: Bearer ACCESS_TOKEN`}
            </pre>
          </Paper>
        </Box>

        <Alert severity="success">
          <Typography variant="body2">
            <strong>Next Steps:</strong> See the OAuth 2.0 Configuration guide for detailed endpoint documentation 
            and the SSO Integration guide for framework-specific examples.
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
}
