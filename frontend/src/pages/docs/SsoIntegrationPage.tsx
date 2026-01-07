import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Alert,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { ContentCopy, CheckCircle, OpenInNew } from '@mui/icons-material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import DownloadMarkdownButton from '../../components/docs/DownloadMarkdownButton';

const markdownContent = `# SSO Integration Guide

Integrate Teamified's OAuth 2.0 SSO into your application.

> **Note:** Before integrating, make sure you have registered your OAuth client in the **OAuth Configuration** admin panel to get your Client ID and Client Secret.

## Overview

Teamified implements OAuth 2.0 Authorization Code flow with PKCE support. This allows users to authenticate with their Teamified accounts and authorize your application to access their data.

### Endpoints

| Endpoint | URL |
|----------|-----|
| Authorization | \`/api/v1/sso/authorize\` |
| Token | \`/api/v1/sso/token\` |
| UserInfo | \`/api/v1/sso/me\` |

## Integration Flow

1. **Register Your Application** - Go to OAuth Configuration and register your application to obtain your Client ID and Client Secret.
2. **Redirect User to Authorization Endpoint** - Send users to the authorization URL with your client_id, redirect_uri, and scope parameters.
3. **Handle Callback** - Receive the authorization code in your callback URL and verify the state parameter.
4. **Exchange Code for Token** - Make a POST request to the token endpoint with the authorization code to get an access token.
5. **Access User Data** - Use the access token to make authenticated requests to the UserInfo endpoint.

## Code Examples

### JavaScript

\`\`\`javascript
// Step 1: Redirect user to authorization endpoint
const authParams = new URLSearchParams({
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: 'https://your-app.com/callback',
  response_type: 'code',
  scope: 'openid profile email',
  state: 'random_state_string' // CSRF protection
});

window.location.href = \`/api/v1/sso/authorize?\${authParams}\`;

// Step 2: Handle callback and exchange code for token
const callbackUrl = new URL(window.location.href);
const code = callbackUrl.searchParams.get('code');
const state = callbackUrl.searchParams.get('state');

// Verify state matches to prevent CSRF attacks
if (state !== savedState) {
  throw new Error('Invalid state parameter');
}

// Exchange authorization code for access token
const tokenResponse = await fetch('/api/v1/sso/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: code,
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    redirect_uri: 'https://your-app.com/callback'
  })
});

const { access_token, refresh_token } = await tokenResponse.json();

// Step 3: Get user information
const userResponse = await fetch('/api/v1/sso/me', {
  headers: {
    'Authorization': \`Bearer \${access_token}\`
  }
});

const userData = await userResponse.json();
console.log('User:', userData);
\`\`\`

### Python

\`\`\`python
import requests
from urllib.parse import urlencode

# Step 1: Build authorization URL
auth_params = {
    'client_id': 'YOUR_CLIENT_ID',
    'redirect_uri': 'https://your-app.com/callback',
    'response_type': 'code',
    'scope': 'openid profile email',
    'state': 'random_state_string'
}

auth_url = f"/api/v1/sso/authorize?{urlencode(auth_params)}"
# Redirect user to auth_url

# Step 2: Exchange code for token (in callback handler)
def handle_callback(code, state):
    # Verify state parameter
    if state != saved_state:
        raise ValueError('Invalid state parameter')
    
    token_response = requests.post(
        '/api/v1/sso/token',
        json={
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': 'YOUR_CLIENT_ID',
            'client_secret': 'YOUR_CLIENT_SECRET',
            'redirect_uri': 'https://your-app.com/callback'
        }
    )
    
    token_data = token_response.json()
    access_token = token_data['access_token']
    
    # Step 3: Get user info
    user_response = requests.get(
        '/api/v1/sso/me',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    return user_response.json()
\`\`\`

### cURL

\`\`\`bash
# Step 1: User visits this URL in browser
/api/v1/sso/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://your-app.com/callback&response_type=code&scope=openid%20profile%20email&state=random_state

# Step 2: Exchange authorization code for token
curl -X POST /api/v1/sso/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type": "authorization_code",
    "code": "AUTHORIZATION_CODE_FROM_CALLBACK",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "https://your-app.com/callback"
  }'

# Step 3: Get user information
curl -X GET /api/v1/sso/me \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
\`\`\`

## Intent Parameter (User Type Filtering)

The authorization endpoint supports an optional \`intent\` parameter to restrict which type of users can authenticate through your application.

### Available Intent Values

| Value | Description |
|-------|-------------|
| \`client\` | Only users associated with client organizations can authenticate |
| \`candidate\` | Only candidate users can authenticate |
| \`both\` | All authenticated users (default if omitted) |

### Example: Client-Only Authorization

\`\`\`
/api/v1/sso/authorize?client_id=xxx&redirect_uri=xxx&state=xxx&intent=client
\`\`\`

> **Security Note:** The runtime \`intent\` parameter can only narrow access, never widen it. If your OAuth client has a \`default_intent\` of \`client\`, passing \`intent=both\` will be ignored.

> **Internal User Bypass:** Users with \`super_admin\` or \`internal_*\` roles bypass all intent restrictions and can access any application regardless of the configured intent.

### Handling Intent Errors

When a user's type doesn't match the intent, the callback receives an OAuth error:

\`\`\`
?error=access_denied&error_description=This+application+is+for+client+organizations+only...
\`\`\`

## Cross-App SSO (Shared Sessions)

Teamified supports cross-app SSO using shared httpOnly cookies. When a user logs into Teamified Accounts, they can access other Teamified apps without re-entering credentials.

### How It Works

1. When a user authenticates, the server sets an httpOnly cookie on \`.teamified.com\`
2. This cookie is shared across all subdomains (hris.teamified.com, teamconnect.teamified.com, etc.)
3. Client apps can check for an existing session before initiating the OAuth flow

### Environment-Specific Behavior

| Environment | Cookie Domain | SSO Type |
|-------------|---------------|----------|
| .teamified.com | domain=.teamified.com | Seamless (shared) |
| .replit.app | Host-only (no domain) | OAuth redirect |
| Custom domain | SSO_SHARED_COOKIE_DOMAIN | Configurable |

**Production (.teamified.com):** True seamless SSO - cookies are shared across all subdomains. Log in once and all apps recognize you instantly.

**Staging (.replit.app):** OAuth redirect-based SSO only. The \`.replit.app\` domain is on the Public Suffix List (PSL), which prevents browsers from sharing cookies across subdomains. Each app will redirect to Teamified Accounts, but if you're already logged in there, the OAuth flow completes instantly without showing the login form.

### Checking for Existing Session

\`\`\`javascript
// Check for existing session before initiating OAuth
const TEAMIFIED_ACCOUNTS_URL = 'https://accounts.teamified.com'; // or staging URL

const response = await fetch(\`\${TEAMIFIED_ACCOUNTS_URL}/api/v1/sso/session\`, {
  credentials: 'include', // Required: send cookies cross-origin
});

if (response.ok) {
  const session = await response.json();
  // User is already authenticated - no OAuth flow needed
  console.log('Session found:', session.user);
  // Use session.user data directly
} else {
  // No session - redirect to OAuth authorization
  window.location.href = \`\${TEAMIFIED_ACCOUNTS_URL}/api/v1/sso/authorize?...\`;
}
\`\`\`

## Security Best Practices

- **Never expose your Client Secret** - Keep it secure on your server. Never include it in client-side code or version control.
- Always use the \`state\` parameter to prevent CSRF attacks
- Implement PKCE (Proof Key for Code Exchange) for additional security
- Store access tokens securely (HttpOnly cookies or secure storage)
- Use HTTPS for all redirect URIs in production
- Implement token refresh logic for long-lived sessions

## Testing Your Integration

Use the integrated test suite to verify your OAuth implementation without writing any code. Access it at \`/test\` in your Teamified instance.
`;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SsoIntegrationPage() {
  const theme = useTheme();
  const codeStyle = theme.palette.mode === 'dark' ? atomOneDark : docco;
  const [tabValue, setTabValue] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const apiUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-teamified-instance.com';

  const authorizationUrl = `${apiUrl}/api/v1/sso/authorize`;
  const tokenUrl = `${apiUrl}/api/v1/sso/token`;
  const userInfoUrl = `${apiUrl}/api/v1/sso/me`;

  const codeExamples = {
    javascript: `// Step 1: Redirect user to authorization endpoint
const authParams = new URLSearchParams({
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: 'https://your-app.com/callback',
  response_type: 'code',
  scope: 'openid profile email',
  state: 'random_state_string' // CSRF protection
});

window.location.href = \`${authorizationUrl}?\${authParams}\`;

// Step 2: Handle callback and exchange code for token
const callbackUrl = new URL(window.location.href);
const code = callbackUrl.searchParams.get('code');
const state = callbackUrl.searchParams.get('state');

// Verify state matches to prevent CSRF attacks
if (state !== savedState) {
  throw new Error('Invalid state parameter');
}

// Exchange authorization code for access token
const tokenResponse = await fetch('${tokenUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: code,
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    redirect_uri: 'https://your-app.com/callback'
  })
});

const { access_token, refresh_token } = await tokenResponse.json();

// Step 3: Get user information
const userResponse = await fetch('${userInfoUrl}', {
  headers: {
    'Authorization': \`Bearer \${access_token}\`
  }
});

const userData = await userResponse.json();
console.log('User:', userData);`,
    
    python: `import requests
from urllib.parse import urlencode

# Step 1: Build authorization URL
auth_params = {
    'client_id': 'YOUR_CLIENT_ID',
    'redirect_uri': 'https://your-app.com/callback',
    'response_type': 'code',
    'scope': 'openid profile email',
    'state': 'random_state_string'
}

auth_url = f"${authorizationUrl}?{urlencode(auth_params)}"
# Redirect user to auth_url

# Step 2: Exchange code for token (in callback handler)
def handle_callback(code, state):
    # Verify state parameter
    if state != saved_state:
        raise ValueError('Invalid state parameter')
    
    token_response = requests.post(
        '${tokenUrl}',
        json={
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': 'YOUR_CLIENT_ID',
            'client_secret': 'YOUR_CLIENT_SECRET',
            'redirect_uri': 'https://your-app.com/callback'
        }
    )
    
    token_data = token_response.json()
    access_token = token_data['access_token']
    
    # Step 3: Get user info
    user_response = requests.get(
        '${userInfoUrl}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    return user_response.json()`,

    curl: `# Step 1: User visits this URL in browser
${authorizationUrl}?client_id=YOUR_CLIENT_ID&redirect_uri=https://your-app.com/callback&response_type=code&scope=openid%20profile%20email&state=random_state

# Step 2: Exchange authorization code for token
curl -X POST ${tokenUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type": "authorization_code",
    "code": "AUTHORIZATION_CODE_FROM_CALLBACK",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "https://your-app.com/callback"
  }'

# Step 3: Get user information
curl -X GET ${userInfoUrl} \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          SSO Integration Guide
        </Typography>
        <DownloadMarkdownButton 
          filename="sso-integration-guide" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Integrate Teamified's OAuth 2.0 SSO into your application
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          Before integrating, make sure you have registered your OAuth client in the{' '}
          <strong>OAuth Configuration</strong> admin panel to get your Client ID and Client Secret.
        </Typography>
      </Alert>

      <Stack spacing={4}>
        {/* Overview */}
        <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Teamified implements OAuth 2.0 Authorization Code flow with PKCE support. This allows users to
          authenticate with their Teamified accounts and authorize your application to access their data.
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Authorization Endpoint:</strong>{' '}
            <code style={{ fontSize: '0.875rem' }}>{authorizationUrl}</code>
            <IconButton size="small" onClick={() => handleCopy(authorizationUrl, 0)}>
              {copiedIndex === 0 ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Typography>
          <Typography variant="body2">
            <strong>Token Endpoint:</strong>{' '}
            <code style={{ fontSize: '0.875rem' }}>{tokenUrl}</code>
            <IconButton size="small" onClick={() => handleCopy(tokenUrl, 1)}>
              {copiedIndex === 1 ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Typography>
          <Typography variant="body2">
            <strong>UserInfo Endpoint:</strong>{' '}
            <code style={{ fontSize: '0.875rem' }}>{userInfoUrl}</code>
            <IconButton size="small" onClick={() => handleCopy(userInfoUrl, 2)}>
              {copiedIndex === 2 ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Typography>
        </Stack>
      </Box>

      {/* Integration Flow */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Integration Flow
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              1. Register Your Application
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Go to OAuth Configuration and register your application to obtain your Client ID and Client Secret.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              2. Redirect User to Authorization Endpoint
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Send users to the authorization URL with your client_id, redirect_uri, and scope parameters.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              3. Handle Callback
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Receive the authorization code in your callback URL and verify the state parameter.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              4. Exchange Code for Token
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Make a POST request to the token endpoint with the authorization code to get an access token.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              5. Access User Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the access token to make authenticated requests to the UserInfo endpoint.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Code Examples */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Code Examples
        </Typography>

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="JavaScript" />
          <Tab label="Python" />
          <Tab label="cURL" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
              onClick={() => handleCopy(codeExamples.javascript, 10)}
            >
              {copiedIndex === 10 ? <CheckCircle color="success" /> : <ContentCopy />}
            </IconButton>
            <SyntaxHighlighter language="javascript" style={codeStyle}>
              {codeExamples.javascript}
            </SyntaxHighlighter>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
              onClick={() => handleCopy(codeExamples.python, 11)}
            >
              {copiedIndex === 11 ? <CheckCircle color="success" /> : <ContentCopy />}
            </IconButton>
            <SyntaxHighlighter language="python" style={codeStyle}>
              {codeExamples.python}
            </SyntaxHighlighter>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
              onClick={() => handleCopy(codeExamples.curl, 12)}
            >
              {copiedIndex === 12 ? <CheckCircle color="success" /> : <ContentCopy />}
            </IconButton>
            <SyntaxHighlighter language="bash" style={codeStyle}>
              {codeExamples.curl}
            </SyntaxHighlighter>
          </Box>
        </TabPanel>
      </Box>

      {/* Intent Parameter */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Intent Parameter (User Type Filtering)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          The authorization endpoint supports an optional <code>intent</code> parameter to restrict which type of users can authenticate through your application.
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Available Intent Values
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                • <code>client</code> - Only users associated with client organizations can authenticate
              </Typography>
              <Typography variant="body2">
                • <code>candidate</code> - Only candidate users can authenticate
              </Typography>
              <Typography variant="body2">
                • <code>both</code> - All authenticated users (default if omitted)
              </Typography>
            </Stack>
          </Box>

          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Example: Client-Only Authorization
            </Typography>
            <Typography variant="body2" component="code" sx={{ display: 'block', fontSize: '0.875rem', wordBreak: 'break-all' }}>
              {authorizationUrl}?client_id=xxx&redirect_uri=xxx&state=xxx&intent=client
            </Typography>
          </Paper>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Security Note:</strong> The runtime <code>intent</code> parameter can only narrow access, never widen it. 
              If your OAuth client has a <code>default_intent</code> of <code>client</code>, passing <code>intent=both</code> will be ignored.
            </Typography>
          </Alert>

          <Alert severity="success">
            <Typography variant="body2">
              <strong>Internal User Bypass:</strong> Users with <code>super_admin</code> or <code>internal_*</code> roles 
              bypass all intent restrictions and can access any application regardless of the configured intent.
            </Typography>
          </Alert>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Handling Intent Errors
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When a user's type doesn't match the intent, the callback receives an OAuth error:
            </Typography>
            <Typography variant="body2" component="code" sx={{ display: 'block', fontSize: '0.875rem', mt: 1, bgcolor: 'action.hover', color: 'text.primary', p: 1, borderRadius: 1 }}>
              ?error=access_denied&error_description=This+application+is+for+client+organizations+only...
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Cross-App SSO */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Cross-App SSO (Shared Sessions)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Teamified supports cross-app SSO using shared httpOnly cookies. When a user logs into Teamified Accounts,
          they can access other Teamified apps without re-entering credentials.
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              How It Works
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                1. When a user authenticates, the server sets an httpOnly cookie on <code>.teamified.com</code>
              </Typography>
              <Typography variant="body2">
                2. This cookie is shared across all subdomains (hris.teamified.com, teamconnect.teamified.com, etc.)
              </Typography>
              <Typography variant="body2">
                3. Client apps can check for an existing session before initiating the OAuth flow
              </Typography>
            </Stack>
          </Box>

          <Alert severity="warning" sx={{ my: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Environment-Specific Behavior
            </Typography>
            <Typography variant="body2">
              <strong>Production (.teamified.com):</strong> True seamless SSO - cookies are shared across all subdomains. 
              Log in once and all apps recognize you instantly.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Staging (.replit.app):</strong> OAuth redirect-based SSO only. The <code>.replit.app</code> domain 
              is on the Public Suffix List (PSL), which prevents browsers from sharing cookies across subdomains. 
              Each app will redirect to Teamified Accounts, but if you're already logged in there, the OAuth flow 
              completes instantly without showing the login form.
            </Typography>
          </Alert>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Checking for Existing Session
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Client apps can call the <code>/api/v1/sso/session</code> endpoint to check if the user has an existing session.
              This works on both production and staging environments:
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', m: 0 }}>
{`// Check for existing session before initiating OAuth
const TEAMIFIED_ACCOUNTS_URL = 'https://accounts.teamified.com'; // or staging URL

const response = await fetch(\`\${TEAMIFIED_ACCOUNTS_URL}/api/v1/sso/session\`, {
  credentials: 'include', // Required: send cookies cross-origin
});

if (response.ok) {
  const session = await response.json();
  // User is already authenticated - no OAuth flow needed
  console.log('Session found:', session.user);
  // Use session.user data directly
} else {
  // No session - redirect to OAuth authorization
  window.location.href = \`\${TEAMIFIED_ACCOUNTS_URL}/api/v1/sso/authorize?...\`;
}`}
              </Typography>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>How it works:</strong> Client apps don't need to know about cookies. They simply call the 
                <code>/session</code> endpoint. If the user is logged into Teamified Accounts, the endpoint returns 
                their session data. If not, redirect to the OAuth flow.
              </Typography>
            </Alert>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Cookie Domain Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              The system automatically detects the correct cookie domain based on the deployment:
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', m: 0 }}>
{`| Environment          | Cookie Domain        | SSO Type                |
|----------------------|---------------------|------------------------|
| .teamified.com       | domain=.teamified.com | Seamless (shared)      |
| .replit.app          | Host-only (no domain)| OAuth redirect         |
| Custom domain        | SSO_SHARED_COOKIE_DOMAIN | Configurable      |`}
              </Typography>
            </Box>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>SDK Support:</strong> If using the teamified-sso package, enable cookie SSO with{' '}
              <code>enableCookieSSO: true</code> in your config, then call <code>checkSharedSession()</code>.
              Note: This only works on production (.teamified.com) deployments.
            </Typography>
          </Alert>

          <Alert severity="success">
            <Typography variant="body2">
              <strong>Seamless Experience (Production):</strong> Users only need to log in once. Other Teamified apps detect
              the shared session automatically and can skip the OAuth flow entirely.
            </Typography>
          </Alert>
        </Stack>
      </Box>

      {/* Security Best Practices */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Security Best Practices
        </Typography>
        <Stack spacing={2}>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Never expose your Client Secret</strong> - Keep it secure on your server. Never include it in
              client-side code or version control.
            </Typography>
          </Alert>
          <Typography variant="body2">
            • Always use the <code>state</code> parameter to prevent CSRF attacks
          </Typography>
          <Typography variant="body2">
            • Implement PKCE (Proof Key for Code Exchange) for additional security
          </Typography>
          <Typography variant="body2">
            • Store access tokens securely (HttpOnly cookies or secure storage)
          </Typography>
          <Typography variant="body2">
            • Use HTTPS for all redirect URIs in production
          </Typography>
          <Typography variant="body2">
            • Implement token refresh logic for long-lived sessions
          </Typography>
        </Stack>
      </Box>

      {/* Testing */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Testing Your Integration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Use the integrated test suite to verify your OAuth implementation without writing any code.
        </Typography>
        <Button
          variant="contained"
          endIcon={<OpenInNew />}
          onClick={() => window.open('/test', '_blank')}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#A16AE8',
            '&:hover': { bgcolor: '#8f5cd9' },
          }}
        >
          Open Test Suite
        </Button>
      </Box>
      </Stack>
    </Box>
  );
}
