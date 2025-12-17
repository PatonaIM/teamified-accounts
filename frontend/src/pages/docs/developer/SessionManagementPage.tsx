import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Login,
  Logout,
  Storage,
  Security,
  Refresh,
  Warning,
} from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function SessionManagementPage() {
  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Session Management Guide
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This guide covers how to manage user sessions in your OAuth 2.0 client application,
              including login flows, session persistence, checking active sessions, and properly
              implementing logout.
            </Typography>
          </Box>

          <Divider />

          {/* Session Overview */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Storage color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Session Overview
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              Teamified Accounts uses a dual-token authentication system:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Access Token (72 hours)" 
                  secondary="JWT token used for API authentication. Stored in localStorage on the client."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Refresh Token (30 days)" 
                  secondary="Used to obtain new access tokens. Tracked server-side with token family rotation."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="httpOnly Cookie" 
                  secondary="Secure cookie set during SSO login for seamless re-authentication."
                />
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Session Timeout:</strong> Sessions expire after 72 hours of inactivity or 30 days absolute maximum.
              </Typography>
            </Alert>
          </Box>

          <Divider />

          {/* Login Flow */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Login color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Login Flow (OAuth 2.0 + PKCE)
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              Client applications authenticate users through the SSO authorization flow:
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              1. Initiate Authorization
            </Typography>
            <SyntaxHighlighter language="javascript" style={docco}>
{`// Generate PKCE code verifier and challenge
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// Store verifier for later use
sessionStorage.setItem('pkce_code_verifier', codeVerifier);

// Redirect to SSO authorize endpoint
const authorizeUrl = new URL('https://accounts.teamified.com/api/v1/sso/authorize');
authorizeUrl.searchParams.set('client_id', 'your-client-id');
authorizeUrl.searchParams.set('redirect_uri', 'https://yourapp.com/callback');
authorizeUrl.searchParams.set('code_challenge', codeChallenge);
authorizeUrl.searchParams.set('code_challenge_method', 'S256');
authorizeUrl.searchParams.set('state', generateRandomState());

window.location.href = authorizeUrl.toString();`}
            </SyntaxHighlighter>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              2. Handle Callback & Exchange Code for Tokens
            </Typography>
            <SyntaxHighlighter language="javascript" style={docco}>
{`// On callback page, extract code and exchange for tokens
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

const response = await fetch('https://accounts.teamified.com/api/v1/sso/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: code,
    client_id: 'your-client-id',
    client_secret: 'your-client-secret',
    redirect_uri: 'https://yourapp.com/callback',
    code_verifier: codeVerifier
  })
});

const tokens = await response.json();
// tokens = { access_token, refresh_token, expires_in, token_type }`}
            </SyntaxHighlighter>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              3. Store Tokens (Client-Side)
            </Typography>
            <SyntaxHighlighter language="javascript" style={docco}>
{`// Store tokens securely in localStorage
localStorage.setItem('access_token', tokens.access_token);
localStorage.setItem('refresh_token', tokens.refresh_token);

// Optionally store user data for quick access
const userInfo = await fetch('https://accounts.teamified.com/api/v1/sso/me', {
  headers: { 'Authorization': \`Bearer \${tokens.access_token}\` }
});
localStorage.setItem('user_data', JSON.stringify(await userInfo.json()));`}
            </SyntaxHighlighter>
          </Box>

          <Divider />

          {/* Checking Active Sessions */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Refresh color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Checking Active Sessions
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              Before requiring a user to log in, check if they have an active session:
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Client-Side Session Check
            </Typography>
            <SyntaxHighlighter language="javascript" style={docco}>
{`function isSessionActive() {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    return false;
  }
  
  // Optionally decode JWT to check expiration
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
}

// On app initialization
if (isSessionActive()) {
  // User has valid session, load app
  loadUserData();
} else {
  // No valid session, redirect to SSO login
  redirectToSsoLogin();
}`}
            </SyntaxHighlighter>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              Server-Side Session Validation
            </Typography>
            <SyntaxHighlighter language="javascript" style={docco}>
{`// Validate session by calling the /me endpoint
async function validateSession() {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    return null;
  }
  
  try {
    const response = await fetch('https://accounts.teamified.com/api/v1/sso/me', {
      headers: { 'Authorization': \`Bearer \${accessToken}\` }
    });
    
    if (!response.ok) {
      // Token invalid or expired
      clearLocalSession();
      return null;
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
}`}
            </SyntaxHighlighter>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Always validate tokens server-side for sensitive operations.
                Client-side checks are for UX optimization only.
              </Typography>
            </Alert>
          </Box>

          <Divider />

          {/* Logout Flow */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Logout color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Logout Implementation
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              Proper logout requires clearing both client-side storage AND server-side sessions.
              Use the unified SSO logout endpoint for complete session termination.
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Step 1: Clear Client-Side Storage
            </Typography>
            <SyntaxHighlighter language="javascript" style={docco}>
{`function clearLocalSession() {
  // Clear access and refresh tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Clear cached user data
  localStorage.removeItem('user_data');
  
  // Clear any session storage items
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('oauth_state');
}`}
            </SyntaxHighlighter>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              Step 2: Call SSO Logout Endpoint
            </Typography>
            <SyntaxHighlighter language="javascript" style={docco}>
{`async function logout() {
  // 1. Clear local tokens first
  clearLocalSession();
  
  // 2. Build logout URL with redirect
  const logoutUrl = new URL('https://accounts.teamified.com/api/v1/sso/logout');
  logoutUrl.searchParams.set('post_logout_redirect_uri', 'https://yourapp.com/logged-out');
  logoutUrl.searchParams.set('client_id', 'your-client-id'); // Optional: for redirect validation
  
  // 3. Redirect to SSO logout (clears httpOnly cookies & revokes sessions)
  window.location.href = logoutUrl.toString();
}`}
            </SyntaxHighlighter>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              SSO Logout Endpoint Reference
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                <strong>GET</strong> /api/v1/sso/logout
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Centralized logout endpoint that clears all user sessions and redirects back to the client.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Query Parameters:
              </Typography>
              <List dense disablePadding>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText 
                    primary={<code>post_logout_redirect_uri</code>}
                    secondary="URL to redirect after logout (optional)"
                    primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText 
                    primary={<code>client_id</code>}
                    secondary="OAuth client ID for redirect validation (optional)"
                    primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText 
                    primary={<code>state</code>}
                    secondary="State parameter passed back to client (optional)"
                    primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                  />
                </ListItem>
              </List>
            </Paper>

            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>What the logout endpoint does:</strong>
              </Typography>
              <List dense disablePadding sx={{ mt: 1 }}>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircle color="success" sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Clears httpOnly authentication cookies"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircle color="success" sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Revokes all user sessions in the database"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircle color="success" sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Invalidates all refresh token families"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircle color="success" sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Redirects to post_logout_redirect_uri (if provided)"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Alert>
          </Box>

          <Divider />

          {/* Security Best Practices */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Security Best Practices
              </Typography>
            </Stack>
            <List>
              <ListItem>
                <ListItemIcon><Warning color="warning" /></ListItemIcon>
                <ListItemText 
                  primary="Always clear local storage before redirecting to SSO logout"
                  secondary="This prevents login loops caused by cached user data"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Warning color="warning" /></ListItemIcon>
                <ListItemText 
                  primary="Use PKCE for all authorization flows"
                  secondary="Prevents authorization code interception attacks"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Warning color="warning" /></ListItemIcon>
                <ListItemText 
                  primary="Validate tokens server-side for sensitive operations"
                  secondary="Don't rely solely on client-side token validation"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Warning color="warning" /></ListItemIcon>
                <ListItemText 
                  primary="Implement proper error handling for expired tokens"
                  secondary="Redirect to login gracefully when tokens are invalid"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* Token Refresh */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Refresh color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Token Refresh Flow
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              When access tokens expire, use the refresh token to obtain new tokens:
            </Typography>
            <SyntaxHighlighter language="javascript" style={docco}>
{`async function refreshTokens() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await fetch('https://accounts.teamified.com/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (!response.ok) {
    // Refresh failed - user must log in again
    clearLocalSession();
    redirectToSsoLogin();
    return;
  }
  
  const tokens = await response.json();
  localStorage.setItem('access_token', tokens.accessToken);
  localStorage.setItem('refresh_token', tokens.refreshToken);
  
  return tokens;
}`}
            </SyntaxHighlighter>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Token Rotation:</strong> Each refresh request returns a new refresh token.
                The old refresh token is invalidated to prevent token reuse attacks.
              </Typography>
            </Alert>
          </Box>

        </Stack>
      </Paper>
    </Box>
  );
}
