import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
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
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# Session Management Guide

This guide covers how to manage user sessions in your OAuth 2.0 client application, including login flows, session persistence, checking active sessions, and properly implementing logout.

## Session Overview

Teamified Accounts uses a dual-token authentication system:

- **Access Token (72 hours)** - JWT token used for API authentication. Stored in localStorage on the client.
- **Refresh Token (30 days)** - Used to obtain new access tokens. Tracked server-side with token family rotation.
- **httpOnly Cookie** - Secure cookie set during SSO login for seamless re-authentication.

> **Session Timeout:** Sessions expire after 72 hours of inactivity or 30 days absolute maximum.

## Login Flow (OAuth 2.0 + PKCE)

Client applications authenticate users through the SSO authorization flow:

### 1. Initiate Authorization

\`\`\`javascript
// Generate PKCE code verifier and challenge
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

window.location.href = authorizeUrl.toString();
\`\`\`

### 2. Handle Callback & Exchange Code for Tokens

\`\`\`javascript
// On callback page, extract code and exchange for tokens
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
// tokens = { access_token, refresh_token, expires_in, token_type }
\`\`\`

### 3. Store Tokens (Client-Side)

\`\`\`javascript
// Store tokens securely in localStorage
localStorage.setItem('access_token', tokens.access_token);
localStorage.setItem('refresh_token', tokens.refresh_token);

// Optionally store user data for quick access
const userInfo = await fetch('https://accounts.teamified.com/api/v1/sso/me', {
  headers: { 'Authorization': \\\`Bearer \\\${tokens.access_token}\\\` }
});
localStorage.setItem('user_data', JSON.stringify(await userInfo.json()));
\`\`\`

## Checking Active Sessions

Before requiring a user to log in, check if they have an active session:

### Client-Side Session Check

\`\`\`javascript
function isSessionActive() {
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
}
\`\`\`

### Server-Side Session Validation

\`\`\`javascript
// Validate session by calling the /me endpoint
async function validateSession() {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    return null;
  }
  
  try {
    const response = await fetch('https://accounts.teamified.com/api/v1/sso/me', {
      headers: { 'Authorization': \\\`Bearer \\\${accessToken}\\\` }
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
}
\`\`\`

> **Important:** Always validate tokens server-side for sensitive operations. Client-side checks are for UX optimization only.

## Logout Implementation

Proper logout requires clearing both client-side storage AND server-side sessions. Use the unified SSO logout endpoint for complete session termination.

### Step 1: Clear Client-Side Storage

\`\`\`javascript
function clearLocalSession() {
  // Clear access and refresh tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Clear cached user data
  localStorage.removeItem('user_data');
  
  // Clear any session storage items
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('oauth_state');
}
\`\`\`

### Step 2: Call SSO Logout Endpoint

\`\`\`javascript
async function logout() {
  // 1. Clear local tokens first
  clearLocalSession();
  
  // 2. Build logout URL with redirect
  const logoutUrl = new URL('https://accounts.teamified.com/api/v1/sso/logout');
  logoutUrl.searchParams.set('post_logout_redirect_uri', 'https://yourapp.com/logged-out');
  logoutUrl.searchParams.set('client_id', 'your-client-id'); // Optional: for redirect validation
  
  // 3. Redirect to SSO logout (clears httpOnly cookies & revokes sessions)
  window.location.href = logoutUrl.toString();
}
\`\`\`

### SSO Logout Endpoint Reference

\`GET /api/v1/sso/logout\`

Centralized logout endpoint that clears all user sessions and redirects back to the client.

**Query Parameters:**
- \`post_logout_redirect_uri\` - URL to redirect after logout (optional)
- \`client_id\` - OAuth client ID for redirect validation (optional)
- \`state\` - State parameter passed back to client (optional)

**What the logout endpoint does:**
- Clears httpOnly authentication cookies
- Revokes all user sessions in the database
- Invalidates all refresh token families
- Redirects to post_logout_redirect_uri (if provided)

### Global SSO Logout

When a user logs out from any Teamified application, their session is immediately terminated across **all connected apps** - not just the one they logged out from.

**How it works:**
- A global logout timestamp is recorded when the user logs out
- All access tokens issued before this timestamp are immediately rejected
- This applies to all Teamified apps (Jobseeker Portal, ATS, HRIS, etc.)
- No code changes required - this happens automatically server-side

**Handling 401 responses:**
Since tokens may now be rejected mid-session (if the user logs out from another app), your application should gracefully handle 401 Unauthorized responses:

\`\`\`javascript
// Axios interceptor example
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token was rejected - user logged out from another app
      clearLocalSession();
      redirectToSsoLogin();
    }
    return Promise.reject(error);
  }
);
\`\`\`

> **Note:** This is backward compatible - existing client applications will continue to work without code changes. The 401 handling improvement is recommended but optional.

## Security Best Practices

- Always clear local storage before redirecting to SSO logout (prevents login loops caused by cached user data)
- Use PKCE for all authorization flows (prevents authorization code interception attacks)
- Validate tokens server-side for sensitive operations (don't rely solely on client-side token validation)
- Implement proper error handling for expired tokens (redirect to login gracefully when tokens are invalid)

## Token Refresh Flow

When access tokens expire, use the refresh token to obtain new tokens:

\`\`\`javascript
async function refreshTokens() {
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
}
\`\`\`

> **Token Rotation:** Each refresh request returns a new refresh token. The old refresh token is invalidated to prevent token reuse attacks.
`;

export default function SessionManagementPage() {
  const theme = useTheme();
  const codeStyle = theme.palette.mode === 'dark' ? atomOneDark : docco;
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Storage color="primary" />
          Session Management Guide
        </Typography>
        <DownloadMarkdownButton 
          filename="session-management-guide" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This guide covers how to manage user sessions in your OAuth 2.0 client application,
        including login flows, session persistence, checking active sessions, and properly
        implementing logout.
      </Typography>

      <Stack spacing={4}>
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
            <SyntaxHighlighter language="javascript" style={codeStyle}>
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
            <SyntaxHighlighter language="javascript" style={codeStyle}>
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
            <SyntaxHighlighter language="javascript" style={codeStyle}>
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
            <SyntaxHighlighter language="javascript" style={codeStyle}>
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
            <SyntaxHighlighter language="javascript" style={codeStyle}>
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
            <SyntaxHighlighter language="javascript" style={codeStyle}>
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
            <SyntaxHighlighter language="javascript" style={codeStyle}>
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

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              Global SSO Logout
            </Typography>
            <Typography variant="body2" paragraph>
              When a user logs out from any Teamified application, their session is immediately 
              terminated across <strong>all connected apps</strong> - not just the one they logged out from.
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                How it works:
              </Typography>
              <List dense disablePadding>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircle color="primary" sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="A global logout timestamp is recorded when the user logs out"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircle color="primary" sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="All access tokens issued before this timestamp are immediately rejected"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircle color="primary" sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="This applies to all Teamified apps (Jobseeker Portal, ATS, HRIS, etc.)"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircle color="primary" sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="No code changes required - this happens automatically server-side"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Handling 401 responses:
            </Typography>
            <Typography variant="body2" paragraph>
              Since tokens may now be rejected mid-session (if the user logs out from another app), 
              your application should gracefully handle 401 Unauthorized responses:
            </Typography>
            <SyntaxHighlighter language="javascript" style={codeStyle}>
{`// Axios interceptor example
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token was rejected - user logged out from another app
      clearLocalSession();
      redirectToSsoLogin();
    }
    return Promise.reject(error);
  }
);`}
            </SyntaxHighlighter>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Backward Compatible:</strong> Existing client applications will continue to work 
                without code changes. The 401 handling improvement is recommended but optional.
              </Typography>
            </Alert>
          </Box>

          <Divider />

          {/* Single Sign-Out (Front-Channel Logout) */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Logout color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Single Sign-Out (Front-Channel Logout)
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              Single Sign-Out ensures that when a user logs out from <strong>any</strong> Teamified application, 
              they are automatically logged out from <strong>all</strong> connected applications. This is achieved 
              through front-channel logout using hidden iframes.
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              How It Works - Step by Step
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.900', mb: 3, fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre', overflowX: 'auto' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'grey.300', m: 0 }}>
{`┌─────────────────────────────────────────────────────────────────────┐
│                    Single Sign-Out Flow                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User clicks "Logout" in any Teamified app                       │
│     └── App clears local storage                                    │
│     └── App redirects to /api/v1/sso/logout                         │
│                                                                     │
│  2. Teamified Accounts SSO:                                         │
│     └── Revokes all user sessions in database                       │
│     └── Sets globalLogoutAt timestamp                               │
│     └── Clears httpOnly cookies on .teamified.com                   │
│     └── Renders front-channel logout page                           │
│                                                                     │
│  3. Front-channel logout page:                                      │
│     └── Loads hidden iframes for each registered client app         │
│     └── Each iframe calls the client's logout_uri                   │
│     └── Client apps clear their local tokens                        │
│     └── Redirects to final destination after 3s or all frames load  │
│                                                                     │
│  4. User lands on logged-out page                                   │
│     └── ALL Teamified apps are now logged out                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘`}
              </Typography>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Step 1: Register Your Logout URI
            </Typography>
            <Typography variant="body2" paragraph>
              Each OAuth client must register a <code>logout_uri</code> - the endpoint that will be called 
              via iframe during logout. Configure this in the OAuth Client settings at{' '}
              <strong>/admin/tools/oauth-configuration</strong>.
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Logout URI Requirements:</strong>
              </Typography>
              <List dense disablePadding sx={{ mt: 1 }}>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemText 
                    primary="• HTTPS required (except localhost for development)"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemText 
                    primary="• Must be on approved domains: *.teamified.com, *.teamified.au, *.replit.app, *.replit.dev, localhost"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemText 
                    primary="• Path must start with /"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Alert>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              Step 2: Implement the Logout Callback Endpoint
            </Typography>
            <Typography variant="body2" paragraph>
              Create an endpoint that clears local tokens when loaded. This endpoint will be called via a hidden iframe.
            </Typography>
            <SyntaxHighlighter language="tsx" style={codeStyle}>
{`// React Example: src/pages/LogoutCallback.tsx
import { useEffect } from 'react';

export function LogoutCallback() {
  useEffect(() => {
    // Clear ALL local tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    sessionStorage.clear();
    
    console.log('[SSO] Front-channel logout received - tokens cleared');
  }, []);

  // Return minimal HTML (this page is loaded in hidden iframe)
  return <div>Logged out</div>;
}

// Add the route
<Route path="/auth/logout/callback" element={<LogoutCallback />} />`}
            </SyntaxHighlighter>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              Step 3: Initiate Logout from Your App
            </Typography>
            <Typography variant="body2" paragraph>
              When the user clicks logout in your app, clear local storage first, then redirect to the central SSO logout endpoint.
            </Typography>
            <SyntaxHighlighter language="javascript" style={codeStyle}>
{`function logout(redirectAfterLogout = '/') {
  // Step 1: Clear local storage FIRST (prevents redirect loops)
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  sessionStorage.clear();
  
  // Step 2: Build logout URL with redirect
  const logoutUrl = new URL('https://accounts.teamified.com/api/v1/sso/logout');
  logoutUrl.searchParams.set('post_logout_redirect_uri', 
    \`\${window.location.origin}\${redirectAfterLogout}\`);
  logoutUrl.searchParams.set('client_id', 'YOUR_CLIENT_ID');
  
  // Step 3: Redirect to SSO logout (triggers front-channel logout)
  window.location.href = logoutUrl.toString();
}`}
            </SyntaxHighlighter>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              Environment Tags for Logout URIs
            </Typography>
            <Typography variant="body2" paragraph>
              Each logout URI can be tagged with an environment: <strong>production</strong>, <strong>staging</strong>, 
              or <strong>development</strong>. These tags enable <strong>environment-specific logout</strong> to 
              prevent development logouts from affecting production sessions.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Environment-Specific Logout:</strong> When a user logs out, the system determines 
                which environment they logged in from (based on the redirect_uri used during OAuth authorization). 
                Only logout URIs matching that environment are called. This means:
              </Typography>
              <List dense disablePadding sx={{ mt: 1 }}>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemText 
                    primary="• Logging out from development only affects development apps"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemText 
                    primary="• Logging out from production only affects production apps"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemText 
                    primary="• Logout URIs without an environment tag are called in all environments"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Alert>
            
            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
              <strong>Best Practice:</strong> Tag each logout URI with the appropriate environment. If you want 
              a logout URI to always be called (e.g., for a service that spans all environments), leave the 
              environment tag empty.
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              Security Features
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Validated Logout URIs" 
                  secondary="Only HTTPS on approved domains can be called during front-channel logout"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Token Invalidation" 
                  secondary="The globalLogoutAt timestamp rejects any tokens issued before logout"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="3-Second Timeout" 
                  secondary="Ensures logout completes even if some apps are slow or unavailable"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Sandboxed Iframes" 
                  secondary="Each iframe has limited capabilities for defense in depth"
                />
              </ListItem>
            </List>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              Troubleshooting
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                User still appears logged in after logout from another app
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Cause:</strong> Your app is using cached local tokens without validating with SSO.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Solution:</strong> Implement session validation on app load and handle 401 responses.
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Front-channel logout iframe fails to load
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Cause:</strong> CORS issues or incorrect logout_uri configuration.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Solution:</strong> Verify logout_uri is correctly registered and the endpoint returns valid HTML.
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Infinite redirect loop during logout
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Cause:</strong> App re-initiates login before logout completes.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Solution:</strong> Clear local storage BEFORE redirecting to SSO logout.
              </Typography>
            </Paper>
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
            <SyntaxHighlighter language="javascript" style={codeStyle}>
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
    </Box>
  );
}
