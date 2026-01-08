import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import {
  CheckCircle,
  Login,
  Info,
  Warning,
  OpenInNew,
  TouchApp,
  Analytics,
  Settings,
  Dashboard,
} from '@mui/icons-material';

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

type IntentType = 'both' | 'client' | 'candidate';

interface FeatureUsageResult {
  action: string;
  feature: string;
  success: boolean;
  timestamp: string;
}

export default function IntegratedTestSuite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<IntentType>('both');
  const [featureLoading, setFeatureLoading] = useState<string | null>(null);
  const [featureResults, setFeatureResults] = useState<FeatureUsageResult[]>(
    [],
  );
  const [sessionRestored, setSessionRestored] = useState(false);
  const callbackProcessedRef = useRef(false);
  const sessionCheckRef = useRef(false);

  const DEVELOPER_SANDBOX_CLIENT_ID = 'test-client';
  const SESSION_STORAGE_KEY = 'sso_test_session';
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUri =
    typeof window !== 'undefined' ? window.location.origin + '/test' : '';

  const saveSession = (token: string, user: UserInfo) => {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ token, user, timestamp: Date.now() }),
      );
      // Clear the SSO check flag on successful login
      sessionStorage.removeItem('sso_check_attempted');
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  };

  const clearStoredSession = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      // Clear the SSO check flag so next visit will attempt silent SSO again
      sessionStorage.removeItem('sso_check_attempted');
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
  };

  const generateCodeChallenge = async (
    codeVerifier: string,
  ): Promise<string> => {
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

  const restoreSession = async () => {
    if (typeof window === 'undefined') return false;

    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const { token, user, timestamp } = JSON.parse(stored);

        const SESSION_MAX_AGE = 60 * 60 * 1000;
        if (Date.now() - timestamp > SESSION_MAX_AGE) {
          clearStoredSession();
        } else {
          const userResponse = await fetch(`${apiUrl}/api/v1/sso/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (userResponse.ok) {
            const freshUser = await userResponse.json();
            setAccessToken(token);
            setUserInfo(freshUser);
            saveSession(token, freshUser);
            return true;
          }
          clearStoredSession();
        }
      }

      // Check if we've already attempted silent SSO (to prevent infinite loop)
      const ssoCheckAttempted = sessionStorage.getItem('sso_check_attempted');
      if (ssoCheckAttempted) {
        console.log('[SSO Test] Silent SSO already attempted, showing login button');
        return false;
      }

      console.log('[SSO Test] No local session, checking for active SSO session...');
      sessionStorage.setItem('sso_check_attempted', 'true');
      await checkSsoSession();
      return false;
    } catch (err) {
      console.error('Session restoration failed:', err);
      clearStoredSession();
      return false;
    }
  };

  const checkSsoSession = async () => {
    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = Math.random().toString(36).substring(7);

      sessionStorage.setItem('pkce_code_verifier', codeVerifier);
      sessionStorage.setItem('pkce_state', state);

      const authParams = new URLSearchParams({
        client_id: DEVELOPER_SANDBOX_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid profile email',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'none',
      });

      window.location.href = `${apiUrl}/api/v1/sso/authorize?${authParams.toString()}`;
    } catch (err) {
      console.log('[SSO Test] Silent SSO check failed:', err);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'sso_logout_signal') {
        console.log('[SSO Test] Logout signal received - clearing session');
        setUserInfo(null);
        setAccessToken(null);
        clearStoredSession();
        localStorage.removeItem('sso_logout_signal');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionCheckRef.current) return;
    sessionCheckRef.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    const state = urlParams.get('state');

    if (errorParam) {
      callbackProcessedRef.current = true;
      // login_required means no active SSO session - this is not an error, just show login button
      if (errorParam === 'login_required') {
        console.log('[SSO Test] No active SSO session found');
      } else {
        setError(`Authentication failed: ${errorParam}`);
      }
      window.history.replaceState({}, document.title, '/test');
      setSessionRestored(true);
    } else if (code) {
      callbackProcessedRef.current = true;
      handleCallback(code, state);
    } else {
      setLoading(true);
      restoreSession().finally(() => {
        setLoading(false);
        setSessionRestored(true);
      });
    }
  }, []);

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

      const authParams: Record<string, string> = {
        client_id: DEVELOPER_SANDBOX_CLIENT_ID,
        redirect_uri: redirectUri,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      };

      if (selectedIntent !== 'both') {
        authParams.intent = selectedIntent;
      }

      const authUrl = `${apiUrl}/api/v1/sso/authorize?${new URLSearchParams(authParams)}`;
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
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user information');
      }

      const user = await userResponse.json();
      setUserInfo(user);
      
      saveSession(token, user);

      saveSession(token, user);

      sessionStorage.removeItem('pkce_code_verifier');
      sessionStorage.removeItem('pkce_state');

      window.history.replaceState({}, document.title, '/test');
      setSessionRestored(true);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setSessionRestored(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSwagger = () => {
    window.open(`${apiUrl}/api/docs`, '_blank');
  };

  const handleClearSession = () => {
    clearStoredSession();
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('pkce_state');
    
    localStorage.removeItem('teamified_access_token');
    localStorage.removeItem('teamified_refresh_token');
    localStorage.removeItem('teamified_csrf_token');
    localStorage.removeItem('teamified_user_data');

    const logoutUrl = new URL(`${apiUrl}/api/v1/sso/logout`);
    logoutUrl.searchParams.set('post_logout_redirect_uri', `${window.location.origin}/test`);
    logoutUrl.searchParams.set('client_id', DEVELOPER_SANDBOX_CLIENT_ID);
    
    window.location.href = logoutUrl.toString();
  };

  const recordFeatureUsage = async (
    action: string,
    feature: string,
    description: string,
  ) => {
    if (!accessToken) return;

    setFeatureLoading(action);
    try {
      const response = await fetch(`${apiUrl}/api/v1/sso/user-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'x-client-id': DEVELOPER_SANDBOX_CLIENT_ID,
        },
        body: JSON.stringify({
          action,
          feature,
          description,
          metadata: {
            source: 'test-page',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const success = response.ok;
      const result: FeatureUsageResult = {
        action,
        feature,
        success,
        timestamp: new Date().toLocaleTimeString(),
      };

      setFeatureResults((prev) => [result, ...prev].slice(0, 5));

      if (!success) {
        const errorData = await response.json();
        console.error('Feature usage recording failed:', errorData);
      }
    } catch (err) {
      console.error('Failed to record feature usage:', err);
      setFeatureResults((prev) =>
        [
          {
            action,
            feature,
            success: false,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ].slice(0, 5),
      );
    } finally {
      setFeatureLoading(null);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}
      >
        SSO Test Application
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        This is a demo application to test the SSO authentication flow using
        OAuth 2.0 with PKCE.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {loading && !sessionRestored && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Checking for existing session...
          </Typography>
        </Alert>
      )}

      {!userInfo && sessionRestored ? (
        <>
          <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
            <Typography variant="body2">
              Click the button below to test the SSO login flow. You'll be
              redirected to the SSO provider to authenticate, then redirected
              back here with your user information.
            </Typography>
          </Alert>

          <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
            <FormControl fullWidth>
              <InputLabel id="intent-select-label">User Intent</InputLabel>
              <Select
                labelId="intent-select-label"
                id="intent-select"
                value={selectedIntent}
                label="User Intent"
                onChange={(e) =>
                  setSelectedIntent(e.target.value as IntentType)
                }
              >
                <MenuItem value="both">
                  Both (Default - Allow All Users)
                </MenuItem>
                <MenuItem value="client">Client Only</MenuItem>
                <MenuItem value="candidate">Candidate Only</MenuItem>
              </Select>
              <FormHelperText>
                Select the target user audience for this SSO login. The runtime
                intent can only narrow the OAuth client's default intent, never
                widen it (security protection).
              </FormHelperText>
            </FormControl>
          </Paper>

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
              <Typography variant="body2" color="text.secondary">
                • Selected Intent: {selectedIntent}
              </Typography>
            </Stack>
            <Alert severity="warning" icon={<Warning />} sx={{ mt: 2 }}>
              <Typography variant="body2">
                This is a public client suitable for browser-based apps. Never
                embed client secrets in frontend code - use PKCE instead for
                security.
              </Typography>
            </Alert>
          </Paper>
        </>
      ) : null}

      {userInfo && (
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  User ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {userInfo.id}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Email
                </Typography>
                <Typography variant="body1">{userInfo.email}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
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
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
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
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <TouchApp color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Feature Usage Test
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Click the buttons below to record feature usage. These
                activities will appear in the Connected Applications section of
                the User Activity tab.
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Dashboard />}
                  onClick={() =>
                    recordFeatureUsage(
                      'view_dashboard',
                      'Dashboard',
                      'Viewed the main dashboard',
                    )
                  }
                  disabled={featureLoading === 'view_dashboard'}
                  sx={{ textTransform: 'none' }}
                >
                  {featureLoading === 'view_dashboard'
                    ? 'Recording...'
                    : 'View Dashboard'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  onClick={() =>
                    recordFeatureUsage(
                      'run_report',
                      'Analytics',
                      'Generated analytics report',
                    )
                  }
                  disabled={featureLoading === 'run_report'}
                  sx={{ textTransform: 'none' }}
                >
                  {featureLoading === 'run_report'
                    ? 'Recording...'
                    : 'Run Report'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() =>
                    recordFeatureUsage(
                      'update_settings',
                      'Settings',
                      'Updated application settings',
                    )
                  }
                  disabled={featureLoading === 'update_settings'}
                  sx={{ textTransform: 'none' }}
                >
                  {featureLoading === 'update_settings'
                    ? 'Recording...'
                    : 'Update Settings'}
                </Button>
              </Stack>

              {featureResults.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Recent Activity Records:
                  </Typography>
                  <Stack spacing={1}>
                    {featureResults.map((result, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: result.success
                            ? 'success.main'
                            : 'error.main',
                          opacity: 0.9,
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
                          <Typography
                            variant="body2"
                            sx={{ color: 'white', fontWeight: 500 }}
                          >
                            {result.action.replace(/_/g, ' ')}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.8)' }}
                          >
                            ({result.feature})
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        >
                          {result.timestamp}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Activities are recorded using the{' '}
                  <code style={{ fontSize: '0.85em' }}>
                    POST /api/v1/sso/user-activity
                  </code>{' '}
                  endpoint with your SSO access token and the{' '}
                  <code style={{ fontSize: '0.85em' }}>x-client-id</code>{' '}
                  header.
                </Typography>
              </Alert>
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
                },
              }}
            >
              Clear Session & Test Again
            </Button>
          </Stack>
        </Stack>
      )}

    </Box>
  );
}
