import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Box, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { googleAuthService } from '../../services/googleAuthService';

interface GoogleLoginButtonProps {
  returnUrl?: string;
  onError?: (error: string) => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ returnUrl, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await googleAuthService.getStatus();
      setIsConfigured(status.configured);
    };
    checkStatus();
  }, []);

  if (isConfigured === null) {
    return null;
  }

  if (!isConfigured) {
    return null;
  }

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);

    try {
      googleAuthService.initiateLogin(returnUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button
        fullWidth
        variant="outlined"
        size="large"
        startIcon={isLoading ? <CircularProgress size={20} sx={{ color: '#1a1a1a' }} /> : <GoogleIcon />}
        onClick={handleGoogleLogin}
        disabled={isLoading}
        sx={{
          py: 1.5,
          borderColor: '#E5E7EB',
          color: '#1a1a1a',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '1rem',
          borderRadius: 2,
          bgcolor: 'white',
          '&:hover': {
            borderColor: '#9333EA',
            bgcolor: 'rgba(147, 51, 234, 0.05)',
          },
          '&:disabled': {
            color: '#9CA3AF',
            borderColor: '#E5E7EB',
          },
        }}
      >
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Button>
    </Box>
  );
};
