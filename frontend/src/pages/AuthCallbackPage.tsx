import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { useAuth } from '../hooks/useAuth';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing authentication callback...');
        
        const tokenData = await supabaseAuthService.handleCallback();

        if (!tokenData) {
          setError('No authentication session found. Please try logging in again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        console.log('[AuthCallback] Token exchange successful, refreshing user...');
        await refreshUser();

        console.log('[AuthCallback] Redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('[AuthCallback] Error handling callback:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, refreshUser]);

  if (error) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
          bgcolor: 'background.default',
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Redirecting to login page...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.primary">
        Completing sign-in...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we authenticate your account
      </Typography>
    </Box>
  );
};

export default AuthCallbackPage;
