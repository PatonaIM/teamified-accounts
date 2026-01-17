import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { removeTokens } from '../services/authService';

const LogoutPage: React.FC = () => {
  const [status, setStatus] = useState<'clearing' | 'redirecting'>('clearing');

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('[LogoutPage] Clearing local tokens...');
        removeTokens();
        
        localStorage.removeItem('teamified_last_path');
        localStorage.removeItem('teamified_last_path_user');
        localStorage.removeItem('teamified_theme_auth');
        localStorage.removeItem('theme_preference');
        
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('pkce_state');
        sessionStorage.removeItem('oauth_state');
        
        try {
          const { clearThemePreferences } = await import('../contexts/ThemeContext');
          clearThemePreferences();
        } catch (error) {
          console.warn('[LogoutPage] Failed to clear theme preferences:', error);
        }
        
        const apiUrl = import.meta.env.VITE_API_URL || '';
        
        try {
          console.log('[LogoutPage] Calling auth logout endpoint...');
          await fetch(`${apiUrl}/api/v1/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.warn('[LogoutPage] Auth logout failed, continuing...', error);
        }
        
        setStatus('redirecting');
        
        const currentOrigin = window.location.origin;
        const postLogoutRedirectUri = encodeURIComponent(`${currentOrigin}/login?logged_out=true`);
        
        console.log('[LogoutPage] Redirecting to SSO logout endpoint for front-channel logout...');
        window.location.href = `${apiUrl}/api/v1/sso/logout?post_logout_redirect_uri=${postLogoutRedirectUri}`;
      } catch (error) {
        console.error('[LogoutPage] Error during logout:', error);
        window.location.href = '/login';
      }
    };

    performLogout();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <CircularProgress 
        size={60} 
        sx={{ 
          color: 'white',
          mb: 3 
        }} 
      />
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
        {status === 'clearing' ? 'Logging off...' : 'Signing out of all apps...'}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        Please wait while we sign you out of all sessions
      </Typography>
    </Box>
  );
};

export default LogoutPage;
