import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  Divider,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle,
  Login,
  Info,
  Warning,
  ContentCopy,
  OpenInNew,
} from '@mui/icons-material';

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

export default function IntegratedTestSuite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const callbackProcessedRef = useRef(false);

  const DEVELOPER_SANDBOX_CLIENT_ID = 'test-client';
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUri = typeof window !== 'undefined' ? window.location.origin + '/test' : '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (callbackProcessedRef.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    const state = urlParams.get('state');

    if (errorParam) {
      callbackProcessedRef.current = true;
      setError(`Authentication failed: ${errorParam}`);
      window.history.replaceState({}, document.title, '/test');
    } else if (code) {
      callbackProcessedRef.current = true;
      handleCallback(code, state);
    }
  }, []);

  const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const handleLoginClick = async () => {
    if (typeof window === 'undefined') return;

    setLoading(true);
    setError(null);

    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = Math.random().toString(36).substring(7);

      sessionStorage.setItem('pkce_code_verifier', codeVerifier);
      sessionStorage.setItem('pkce_state', state);

      const authParams = new URLSearchParams({
        client_id: DEVELOPER_SANDBOX_CLIENT_ID,
        redirect_uri: redirectUri,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      const authUrl = `${apiUrl}/api/v1/sso/authorize?${authParams}`;
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate login');
      setLoading(false);
    }
  };

  const handleCallback = async (code: string, returnedState: string | null) => {
    if (typeof window === 'undefined') return;

    setLoading(true);
    setError(null);

    try {
      const savedState = sessionStorage.getItem('pkce_state');
      const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

      if (returnedState !== savedState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }

      const tokenResponse = await fetch(`${apiUrl}/api/v1/sso/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          client_id: DEVELOPER_SANDBOX_CLIENT_ID,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.message || 'Token exchange failed');
      }

      const tokenData = await tokenResponse.json();
      const token = tokenData.access_token;
      setAccessToken(token);

      const userResponse = await fetch(`${apiUrl}/api/v1/sso/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user information');
      }

      const user = await userResponse.json();
      setUserInfo(user);

      sessionStorage.removeItem('pkce_code_verifier');
      sessionStorage.removeItem('pkce_state');

      window.history.replaceState({}, document.title, '/test');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = async () => {
    if (!accessToken) return;
    try {
      await navigator.clipboard.writeText(accessToken);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  const handleOpenSwagger = () => {
    window.open(`${apiUrl}/api/docs`, '_blank');
  };

  const handleClearSession = () => {
    // Clear SSO test session data
    setUserInfo(null);
    setAccessToken(null);
    setError(null);
    setLoading(false);
    
    // Clear PKCE session storage
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('pkce_state');
    
    // Reset callback flag
    callbackProcessedRef.current = false;
    
    // Clean up URL parameters without reload
    window.history.replaceState({}, document.title, '/test');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
        SSO Test Application
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        This is a demo application to test the SSO authentication flow using OAuth 2.0 with PKCE.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {!userInfo ? (
        <>
          <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
            <Typography variant="body2">
              Click the button below to test the SSO login flow. You'll be redirected to the SSO provider to authenticate, then redirected back here with your user information.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<Login />}
            onClick={handleLoginClick}
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              py: 2,
              fontSize: '1.1rem',
              mb: 3,
              bgcolor: '#60a5fa',
              '&:hover': { bgcolor: '#3b82f6' },
            }}
          >
            {loading ? 'Redirecting...' : 'Login with SSO'}
          </Button>

          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              OAuth 2.0 Flow Details:
            </Typography>
            <Stack spacing={1} sx={{ pl: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • Uses Authorization Code Flow with PKCE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Client ID: {DEVELOPER_SANDBOX_CLIENT_ID}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Client Type: Public (no secret required)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Redirect URI: {redirectUri}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Code Challenge Method: S256 (SHA-256)
              </Typography>
            </Stack>
            <Alert severity="warning" icon={<Warning />} sx={{ mt: 2 }}>
              <Typography variant="body2">
                This is a public client suitable for browser-based apps. Never embed client secrets in frontend code - use PKCE instead for security.
              </Typography>
            </Alert>
          </Paper>
        </>
      ) : (
        <Stack spacing={3}>
          <Alert severity="success" icon={<CheckCircle />}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Successfully authenticated via SSO!
            </Typography>
          </Alert>

          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              User Information
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  User ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {userInfo.id}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1">
                  {userInfo.email}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Name
                </Typography>
                <Typography variant="body1">
                  {userInfo.firstName} {userInfo.lastName}
                </Typography>
              </Box>
              {userInfo.roles && userInfo.roles.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Roles
                    </Typography>
                    <Typography variant="body1">
                      {userInfo.roles.join(', ')}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Paper>

          {accessToken && (
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Access Token
                </Typography>
                <IconButton 
                  onClick={handleCopyToken}
                  size="small"
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  title="Copy token"
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'action.hover', 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                wordBreak: 'break-all',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {accessToken}
              </Box>
            </Paper>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<OpenInNew />}
              onClick={handleOpenSwagger}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                py: 1.5,
                bgcolor: '#60a5fa',
                '&:hover': { bgcolor: '#3b82f6' },
              }}
            >
              Open API Swagger UI
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleClearSession}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                py: 1.5,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'action.hover',
                }
              }}
            >
              Clear Session & Test Again
            </Button>
          </Stack>
        </Stack>
      )}

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Token copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
