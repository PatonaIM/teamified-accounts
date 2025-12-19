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
} from '@mui/material';
import { ContentCopy, CheckCircle, OpenInNew } from '@mui/icons-material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        SSO Integration Guide
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Integrate Teamified's OAuth 2.0 SSO into your application
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          Before integrating, make sure you have registered your OAuth client in the{' '}
          <strong>OAuth Configuration</strong> admin panel to get your Client ID and Client Secret.
        </Typography>
      </Alert>

      {/* Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
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
      </Paper>

      {/* Integration Flow */}
      <Paper sx={{ p: 3, mb: 3 }}>
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
      </Paper>

      {/* Code Examples */}
      <Paper sx={{ p: 3, mb: 3 }}>
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
            <SyntaxHighlighter language="javascript" style={docco}>
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
            <SyntaxHighlighter language="python" style={docco}>
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
            <SyntaxHighlighter language="bash" style={docco}>
              {codeExamples.curl}
            </SyntaxHighlighter>
          </Box>
        </TabPanel>
      </Paper>

      {/* Intent Parameter */}
      <Paper sx={{ p: 3, mb: 3 }}>
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
      </Paper>

      {/* Cross-App SSO */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Cross-App SSO (Shared Sessions)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Teamified supports true cross-app SSO using shared httpOnly cookies. When a user logs into one Teamified app,
          they're automatically authenticated across all Teamified apps without re-entering credentials.
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

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Checking for Shared Session
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Before redirecting to the authorization endpoint, check if the user already has a session:
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', m: 0 }}>
{`// Check for existing shared session
const response = await fetch('${apiUrl}/api/v1/sso/session', {
  credentials: 'include', // Important: send cookies
});

if (response.ok) {
  const session = await response.json();
  // User is already authenticated
  console.log('Shared session found:', session.user);
} else {
  // No session, redirect to authorization
  window.location.href = authorizationUrl;
}`}
              </Typography>
            </Box>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>SDK Support:</strong> If using the teamified-sso package, enable cookie SSO with{' '}
              <code>enableCookieSSO: true</code> in your config, then call <code>checkSharedSession()</code>.
            </Typography>
          </Alert>

          <Alert severity="success">
            <Typography variant="body2">
              <strong>Seamless Experience:</strong> Users only need to log in once. Other Teamified apps detect
              the shared session automatically and can skip the OAuth flow entirely.
            </Typography>
          </Alert>
        </Stack>
      </Paper>

      {/* Security Best Practices */}
      <Paper sx={{ p: 3, mb: 3 }}>
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
      </Paper>

      {/* Testing */}
      <Paper sx={{ p: 3 }}>
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
      </Paper>
    </Box>
  );
}
