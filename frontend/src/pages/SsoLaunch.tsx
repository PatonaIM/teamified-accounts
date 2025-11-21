import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import api from '../services/api';

export function SsoLaunch() {
  const { clientId } = useParams<{ clientId: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initiateSso = async () => {
      if (!clientId) {
        setError('Client ID is required');
        return;
      }

      try {
        // Call backend SSO launch endpoint with authentication
        // The backend returns the redirect URL as JSON
        const response = await api.get<{ redirectUrl: string }>(
          `/v1/sso/launch/${encodeURIComponent(clientId)}`
        );

        // Navigate to Team Connect with auth code
        if (response.data?.redirectUrl) {
          window.location.href = response.data.redirectUrl;
        } else {
          setError('No redirect URL received from server');
        }
      } catch (err: any) {
        console.error('SSO launch error:', err);
        setError(err.response?.data?.message || 'Failed to initiate SSO. Please try again.');
      }
    };

    initiateSso();
  }, [clientId]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
        <Typography
          component="a"
          href="/dashboard"
          sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Return to Dashboard
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        Logging you in...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we authenticate your session
      </Typography>
    </Box>
  );
}
