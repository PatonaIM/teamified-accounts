import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { googleAuthService } from '../services/googleAuthService';
import { useAuth } from '../hooks/useAuth';

const GoogleAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      try {
        const { code, returnUrl, error: errorParam } = googleAuthService.getCallbackParams();
        
        if (errorParam) {
          setError(errorParam);
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login?error=' + encodeURIComponent(errorParam), { replace: true });
          }, 2000);
          return;
        }

        if (!code) {
          setError('Missing authentication code');
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login?error=missing_code', { replace: true });
          }, 2000);
          return;
        }

        let targetUrl = returnUrl || '/account/profile';
        
        try {
          const result = await googleAuthService.exchangeCode(code);
          googleAuthService.storeTokens(result.accessToken, result.refreshToken);
          if (result.returnUrl) {
            targetUrl = result.returnUrl;
          }
        } catch (exchangeError) {
          console.log('[GoogleAuth] Code exchange failed, tokens may already be set via cookies');
        }

        await refreshUser();

        if (targetUrl.includes('/api/v1/sso/authorize')) {
          window.location.href = targetUrl;
        } else {
          navigate(targetUrl, { replace: true });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login?error=' + encodeURIComponent(errorMessage), { replace: true });
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate, refreshUser]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#1E1E1E',
        color: 'white',
      }}
    >
      {error ? (
        <>
          <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
            {error}
          </Alert>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Redirecting to login...
          </Typography>
        </>
      ) : (
        <>
          <CircularProgress sx={{ color: '#A16AE8', mb: 3 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Completing sign in...
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Please wait while we set up your session
          </Typography>
        </>
      )}
    </Box>
  );
};

export default GoogleAuthCallbackPage;
