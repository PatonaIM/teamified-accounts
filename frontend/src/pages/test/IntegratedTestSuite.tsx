import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  ContentCopy,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
  Warning,
} from '@mui/icons-material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface TestResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
}

export default function IntegratedTestSuite() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState(
    typeof window !== 'undefined' ? window.location.origin + '/test' : 'https://your-teamified-instance.com/test'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [authorizationCode, setAuthorizationCode] = useState('');
  const [showManualStep, setShowManualStep] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const testSteps: TestResult[] = [
    { step: '1. Generate Authorization URL', status: 'pending' },
    { step: '2. Get Authorization Code', status: 'pending' },
    { step: '3. Exchange Code for Token', status: 'pending' },
    { step: '4. Fetch User Information', status: 'pending' },
  ];

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setResults([
        { step: '1. Generate Authorization URL', status: 'success' },
        { step: '2. Get Authorization Code', status: 'error', message: `Authorization failed: ${error}` },
      ]);
    } else if (code) {
      setAuthorizationCode(code);
      setShowManualStep(true);
      setResults([
        { step: '1. Generate Authorization URL', status: 'success' },
        { step: '2. Get Authorization Code', status: 'success', message: 'Code received from OAuth redirect' },
        { step: '3. Exchange Code for Token', status: 'pending', message: 'Enter your Client Secret below to continue' },
        { step: '4. Fetch User Information', status: 'pending' },
      ]);
      window.history.replaceState({}, document.title, '/test');
    }
  }, []);

  const updateResult = (index: number, status: TestResult['status'], message?: string, data?: any) => {
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], status, message, data };
      return newResults;
    });
  };

  const handleStartTest = () => {
    if (!clientId) {
      alert('Please enter Client ID');
      return;
    }

    // Only run redirect on client-side
    if (typeof window === 'undefined') {
      alert('This test must be run in a browser');
      return;
    }

    setIsRunning(true);
    setResults([...testSteps]);

    const state = Math.random().toString(36).substring(7);

    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: state,
    });

    const authUrl = `${apiUrl}/api/v1/sso/authorize?${authParams}`;

    updateResult(0, 'success', 'Authorization URL generated', authUrl);
    updateResult(1, 'running', 'Redirecting to authorization page...');

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = authUrl;
      }
    }, 1000);
  };

  const handleExchangeCode = async () => {
    if (!clientId || !clientSecret || !authorizationCode) {
      alert('Please enter Client ID and Client Secret');
      return;
    }

    updateResult(2, 'running', 'Exchanging code for token...');
    setIsRunning(true);

    try {
      const tokenResponse = await fetch(`${apiUrl}/api/v1/sso/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: authorizationCode,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.message || 'Token exchange failed');
      }

      const tokenData = await tokenResponse.json();
      setAccessToken(tokenData.access_token);

      updateResult(2, 'success', 'Access token obtained', {
        access_token: tokenData.access_token.substring(0, 20) + '...',
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
      });

      updateResult(3, 'running', 'Fetching user information...');

      const userResponse = await fetch(`${apiUrl}/api/v1/sso/me`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user information');
      }

      const userData = await userResponse.json();

      updateResult(3, 'success', 'User information retrieved', userData);
      setIsRunning(false);
      setShowManualStep(false);
    } catch (error: any) {
      updateResult(2, 'error', error.message);
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setResults([]);
    setIsRunning(false);
    setAuthorizationCode('');
    setShowManualStep(false);
    setAccessToken('');
    setClientSecret('');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, '/test');
    }
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'running':
        return <Refresh className="rotating" color="primary" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'running':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <style>
        {`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .rotating {
            animation: rotate 1s linear infinite;
          }
        `}
      </style>

      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        OAuth 2.0 Integration Test Suite
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Test your OAuth configuration with a live authorization flow
      </Typography>

      <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Security Notice
        </Typography>
        <Typography variant="body2">
          This is a testing tool only. <strong>Never use production credentials</strong>. For security reasons,
          you'll need to re-enter your Client Secret after the OAuth redirect.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          Make sure you have registered an OAuth client in the <strong>OAuth Configuration</strong> admin panel first,
          and that your redirect URI includes <code>{redirectUri}</code>.
        </Typography>
      </Alert>

      {/* Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {showManualStep ? 'Step 3: Enter Client Secret' : 'Step 1: Configuration'}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              fullWidth
              disabled={isRunning && !showManualStep}
              placeholder="Enter your OAuth Client ID"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              type="password"
              fullWidth
              disabled={isRunning && !showManualStep}
              placeholder="Enter your OAuth Client Secret"
              helperText={showManualStep ? 'Re-enter your secret to complete the test' : ''}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Redirect URI"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              fullWidth
              disabled={isRunning}
              helperText="This must match one of your registered redirect URIs"
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          {showManualStep ? (
            <Button
              variant="contained"
              onClick={handleExchangeCode}
              disabled={!clientSecret || isRunning}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#A16AE8',
                '&:hover': { bgcolor: '#8f5cd9' },
              }}
            >
              Exchange Code for Token
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={isRunning ? <Stop /> : <PlayArrow />}
              onClick={handleStartTest}
              disabled={isRunning || !clientId}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#A16AE8',
                '&:hover': { bgcolor: '#8f5cd9' },
              }}
            >
              {isRunning ? 'Test Running...' : 'Start OAuth Test'}
            </Button>
          )}
          {results.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Reset
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Test Results */}
      {results.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Test Results
          </Typography>
          <Stack spacing={2}>
            {results.map((result, index) => (
              <Card key={index} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ pt: 0.5 }}>{getStatusIcon(result.status)}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {result.step}
                        </Typography>
                        <Chip
                          label={result.status}
                          size="small"
                          color={getStatusColor(result.status)}
                        />
                      </Stack>
                      {result.message && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {result.message}
                        </Typography>
                      )}
                      {result.data && (
                        <Box sx={{ mt: 2, position: 'relative' }}>
                          <IconButton
                            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                            onClick={() => handleCopy(typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2))}
                            size="small"
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                          <SyntaxHighlighter language="json" style={docco}>
                            {typeof result.data === 'string'
                              ? result.data
                              : JSON.stringify(result.data, null, 2)}
                          </SyntaxHighlighter>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {accessToken && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                OAuth Test Completed Successfully! ✅
              </Typography>
              <Typography variant="body2">
                Your OAuth client is configured correctly and the authorization flow works as expected.
              </Typography>
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
}
