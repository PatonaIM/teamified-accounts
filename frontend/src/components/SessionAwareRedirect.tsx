import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { isAuthenticated, getRefreshToken, refreshAccessToken, setAccessToken, getAccessToken } from '../services/authService';

const LAST_PATH_KEY = 'teamified_last_path';
const LAST_PATH_USER_KEY = 'teamified_last_path_user';
const DEFAULT_AUTHENTICATED_PATH = '/account/profile';

const PUBLIC_PATHS = [
  '/login',
  '/signup-select',
  '/signup-candidate',
  '/signup-client-admin',
  '/signup/path',
  '/reset-password',
  '/force-change-password',
  '/verify-email',
  '/callback',
  '/auth/callback',
  '/auth/google/callback',
  '/test',
  '/docs',
  '/invitations/preview',
  '/invitations/accept',
  '/accept-invitation',
];

export const saveLastPath = (path: string, userId?: string): void => {
  if (!isPublicPath(path) && path !== '/') {
    localStorage.setItem(LAST_PATH_KEY, path);
    if (userId) {
      localStorage.setItem(LAST_PATH_USER_KEY, userId);
    }
  }
};

export const getLastPath = (currentUserId?: string): string | null => {
  const storedPath = localStorage.getItem(LAST_PATH_KEY);
  const storedUserId = localStorage.getItem(LAST_PATH_USER_KEY);
  
  if (currentUserId && storedUserId && storedUserId !== currentUserId) {
    clearLastPath();
    return null;
  }
  
  return storedPath;
};

export const clearLastPath = (): void => {
  localStorage.removeItem(LAST_PATH_KEY);
  localStorage.removeItem(LAST_PATH_USER_KEY);
};

const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
};

const SessionAwareRedirect: React.FC = () => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      console.log('[SessionAwareRedirect] Checking session status...');
      
      if (isAuthenticated()) {
        console.log('[SessionAwareRedirect] User has valid access token');
        setIsLoggedIn(true);
        setChecking(false);
        return;
      }

      console.log('[SessionAwareRedirect] Access token expired or missing, checking refresh token...');
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          console.log('[SessionAwareRedirect] Attempting to refresh token...');
          const response = await refreshAccessToken(refreshToken);
          setAccessToken(response.data.accessToken);
          console.log('[SessionAwareRedirect] Token refreshed successfully');
          setIsLoggedIn(true);
        } catch (error) {
          console.log('[SessionAwareRedirect] Token refresh failed:', error);
          setIsLoggedIn(false);
        }
      } else {
        console.log('[SessionAwareRedirect] No refresh token available');
        setIsLoggedIn(false);
      }
      
      setChecking(false);
    };

    checkSession();
  }, []);

  if (checking) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Checking session...
        </Typography>
      </Box>
    );
  }

  if (isLoggedIn) {
    const lastPath = getLastPath();
    let targetPath = DEFAULT_AUTHENTICATED_PATH;
    
    if (lastPath && !isPublicPath(lastPath)) {
      targetPath = lastPath;
    }
    
    console.log('[SessionAwareRedirect] User authenticated, redirecting to:', targetPath);
    return <Navigate to={targetPath} replace />;
  }

  console.log('[SessionAwareRedirect] User not authenticated, redirecting to login');
  // Pass the current path as returnUrl so the user can be redirected back after login
  const returnUrl = location.pathname + location.search;
  const loginUrl = returnUrl && !isPublicPath(returnUrl) 
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/login';
  return <Navigate to={loginUrl} replace />;
};

export default SessionAwareRedirect;
