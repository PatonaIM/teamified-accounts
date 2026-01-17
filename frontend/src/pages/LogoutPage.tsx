import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { removeTokens, getAccessToken } from '../services/authService';

const LogoutPage: React.FC = () => {
  const [status, setStatus] = useState<'clearing' | 'redirecting'>('clearing');

  useEffect(() => {
    const performLogout = async () => {
      try {
        // IMPORTANT: Capture the access token BEFORE clearing it
        // This is needed for id_token_hint so the SSO logout can identify the user
        // even when httpOnly cookies are not present (e.g., ATS signups)
        const accessToken = getAccessToken();
        
        // Also check URL params for id_token_hint passed from external apps (like ATS)
        const urlParams = new URLSearchParams(window.location.search);
        const externalIdTokenHint = urlParams.get('id_token_hint');
        
        // Prefer external hint if provided, otherwise use our stored token
        const idTokenHint = externalIdTokenHint || accessToken;
        
        console.log('[LogoutPage] Starting logout process...', {
          hasLocalToken: !!accessToken,
          hasExternalHint: !!externalIdTokenHint,
        });
        
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
          // Include Authorization header if we have a token, for cases where cookie isn't present
          const headers: Record<string, string> = {};
          if (idTokenHint) {
            headers['Authorization'] = `Bearer ${idTokenHint}`;
          }
          await fetch(`${apiUrl}/api/v1/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers,
          });
        } catch (error) {
          console.warn('[LogoutPage] Auth logout failed, continuing...', error);
        }
        
        setStatus('redirecting');
        
        const currentOrigin = window.location.origin;
        const postLogoutRedirectUri = encodeURIComponent(`${currentOrigin}/login?logged_out=true`);
        
        // Build SSO logout URL with id_token_hint for user identification
        let ssoLogoutUrl = `${apiUrl}/api/v1/sso/logout?post_logout_redirect_uri=${postLogoutRedirectUri}`;
        
        // Add id_token_hint if we have a token - this allows the SSO logout to identify
        // the user and properly set globalLogoutAt, even when cookies aren't present
        if (idTokenHint) {
          ssoLogoutUrl += `&id_token_hint=${encodeURIComponent(idTokenHint)}`;
          console.log('[LogoutPage] Including id_token_hint for user identification');
        }
        
        console.log('[LogoutPage] Redirecting to SSO logout endpoint for front-channel logout...');
        window.location.href = ssoLogoutUrl;
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
