import React, { useState } from 'react';
import { Button, CircularProgress, Box, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { supabaseAuthService } from '../../services/supabaseAuthService';
import { isSupabaseConfigured } from '../../config/supabase';

interface SupabaseLoginButtonProps {
  onError?: (error: string) => void;
}

export const SupabaseLoginButton: React.FC<SupabaseLoginButtonProps> = ({ onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return null;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabaseAuthService.signInWithGoogle();
      
      if (signInError) {
        const errorMessage = 'Failed to sign in with Google. Please try again.';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsLoading(false);
      }
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
        startIcon={isLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
        onClick={handleGoogleLogin}
        disabled={isLoading}
        sx={{
          py: 1.5,
          borderColor: 'divider',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Button>
    </Box>
  );
};
