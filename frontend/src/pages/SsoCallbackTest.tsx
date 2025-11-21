import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Alert, CircularProgress, Button } from '@mui/material';

export function SsoCallbackTest() {
  const location = useLocation();
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const stateParam = params.get('state');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(errorParam);
    } else if (code) {
      setAuthCode(code);
      setState(stateParam);
    } else {
      setError('No authorization code received');
    }
  }, [location]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
        }}
      >
        <Typography variant="h4" gutterBottom>
          SSO Callback Test Page
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="h6">Error</Typography>
            <Typography>{error}</Typography>
          </Alert>
        ) : authCode ? (
          <>
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="h6">✅ SSO Flow Successful!</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                The Portal successfully generated an authorization code and redirected here.
              </Typography>
            </Alert>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Authorization Code:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  mt: 1,
                  bgcolor: 'grey.100',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                }}
              >
                {authCode}
              </Paper>
            </Box>

            {state && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  State Parameter:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mt: 1,
                    bgcolor: 'grey.100',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                  }}
                >
                  {state}
                </Paper>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Next Steps:</strong> In a real SSO app (Team Connect), this auth code would be
                exchanged for a JWT token by calling:
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
              >
                POST /api/v1/sso/token
                <br />
                {'{'} code, client_id, client_secret, redirect_uri {'}'}
              </Typography>
            </Alert>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={() => (window.location.href = '/dashboard')}
            >
              Return to Dashboard
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
