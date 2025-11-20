import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  Card,
  CardContent,
  TextField,
  Divider,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Login,
  Refresh,
  OpenInNew,
  Info,
} from '@mui/icons-material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CallbackData {
  code?: string;
  error?: string;
  state?: string;
}

export default function IntegratedTestSuite() {
  const [callbackData, setCallbackData] = useState<CallbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState('demo_client');
  const [redirectUri, setRedirectUri] = useState('');

  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUri(window.location.origin + '/test');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    if (code || error) {
      setCallbackData({
        code: code || undefined,
        error: error || undefined,
        state: state || undefined,
      });
      
      window.history.replaceState({}, document.title, '/test');
    }
  }, []);

  const handleLoginClick = () => {
    if (typeof window === 'undefined') return;

    setLoading(true);
    setCallbackData(null);

    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('sso_state', state);

    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: state,
    });

    const authUrl = `${apiUrl}/api/v1/sso/authorize?${authParams}`;
    window.location.href = authUrl;
  };

  const handleReset = () => {
    setCallbackData(null);
    sessionStorage.removeItem('sso_state');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        SSO Integration Test
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Test the OAuth 2.0 Single Sign-On flow with automatic login redirect
      </Typography>

      <Alert severity="info" icon={<Info />} sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>How it works:</strong>
        </Typography>
        <Typography variant="body2" component="div">
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Click "Login using SSO" below</li>
            <li>If you're not logged in, you'll be redirected to the login page</li>
            <li>After successful login, you'll be redirected back here with an authorization code</li>
            <li>In a real integration, your app would exchange this code for an access token</li>
          </ol>
        </Typography>
      </Alert>

      {!callbackData ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
            SSO Configuration
          </Typography>
          
          <Stack spacing={3}>
            <TextField
              label="Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              fullWidth
              helperText="Enter your OAuth client ID (default: demo_client)"
            />
            
            <TextField
              label="Redirect URI"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              fullWidth
              helperText="Must match your registered redirect URI"
            />
            
            <Divider />
            
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<Login />}
              onClick={handleLoginClick}
              disabled={loading || !clientId || !redirectUri}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                fontSize: '1rem',
                bgcolor: '#A16AE8',
                '&:hover': { bgcolor: '#8f5cd9' },
              }}
            >
              {loading ? 'Redirecting...' : 'Login using SSO'}
            </Button>
            
            <Divider />
            
            <Stack spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Learn more about SSO integration
              </Typography>
              <Button
                variant="text"
                size="small"
                endIcon={<OpenInNew />}
                onClick={() => window.location.href = '/docs'}
                sx={{ textTransform: 'none' }}
              >
                View Documentation
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {callbackData.error ? (
            <>
              <Alert severity="error">
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Authentication Failed
                </Typography>
                <Typography variant="body2">
                  Error: {callbackData.error}
                </Typography>
              </Alert>

              <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Error Details
                </Typography>
                <SyntaxHighlighter language="json" style={docco}>
                  {JSON.stringify(callbackData, null, 2)}
                </SyntaxHighlighter>
              </Paper>
            </>
          ) : (
            <>
              <Alert severity="success" icon={<CheckCircle />}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Authorization Code Received!
                </Typography>
                <Typography variant="body2">
                  The SSO flow completed successfully. Your app can now exchange this code for an access token.
                </Typography>
              </Alert>

              <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Callback Data
                    </Typography>
                    <Chip label="Success" color="success" size="small" />
                  </Stack>

                  <SyntaxHighlighter language="json" style={docco}>
                    {JSON.stringify(callbackData, null, 2)}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>

              <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Next Steps (In Your Application)
                </Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    1. <strong>Verify State</strong>: Confirm the state parameter matches what you sent to prevent CSRF attacks
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    2. <strong>Exchange Code</strong>: POST to <code>/api/v1/sso/token</code> with the authorization code
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <div>3. <strong>Request Body</strong>:</div>
                    <SyntaxHighlighter language="json" style={docco} customStyle={{ marginTop: 8, fontSize: '0.8rem' }}>
                      {JSON.stringify({
                        grant_type: "authorization_code",
                        code: callbackData.code,
                        client_id: clientId,
                        client_secret: "YOUR_CLIENT_SECRET",
                        redirect_uri: redirectUri
                      }, null, 2)}
                    </SyntaxHighlighter>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    4. <strong>Get User Info</strong>: Use the access token to call <code>/api/v1/sso/me</code>
                  </Typography>
                </Stack>
              </Paper>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> To complete the token exchange, you'll need a valid OAuth client registered in the 
                  OAuth Configuration admin panel with a matching client_secret.
                </Typography>
              </Alert>
            </>
          )}

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleReset}
            fullWidth
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Test Again
          </Button>
        </Stack>
      )}

      {/* Implementation Example */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'background.default' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Integration Example
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Here's how to implement this in your application:
        </Typography>
        <SyntaxHighlighter language="javascript" style={docco}>
          {`// 1. Redirect user to authorization endpoint
const authParams = new URLSearchParams({
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: 'https://your-app.com/callback',
  response_type: 'code',
  scope: 'openid profile email',
  state: generateRandomState() // For CSRF protection
});

window.location.href = \`${apiUrl}/api/v1/sso/authorize?\${authParams}\`;

// 2. Handle callback in your app
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

// 3. Exchange code for token
const tokenResponse = await fetch('${apiUrl}/api/v1/sso/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: code,
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    redirect_uri: 'https://your-app.com/callback'
  })
});

const { access_token } = await tokenResponse.json();

// 4. Get user information
const userResponse = await fetch('${apiUrl}/api/v1/sso/me', {
  headers: { 'Authorization': \`Bearer \${access_token}\` }
});

const userData = await userResponse.json();
console.log('Logged in user:', userData);`}
        </SyntaxHighlighter>
      </Paper>
    </Box>
  );
}
