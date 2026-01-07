import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { isAuthenticated, getRefreshToken, refreshAccessToken, setAccessToken, getAccessToken, getCurrentUser } from '../services/authService';
import type { User } from '../services/authService';
import { isPortalRedirectEnabled } from '../utils/featureFlags';

const LAST_PATH_KEY = 'teamified_last_path';
const LAST_PATH_USER_KEY = 'teamified_last_path_user';
const DEFAULT_AUTHENTICATED_PATH = '/account/profile';
const SIGNUP_PATH = '/signup/path';

// Helper function to get external portal URL from preferred portal
const getPortalUrl = (preferredPortal: 'accounts' | 'ats' | 'jobseeker' | undefined): string | null => {
  switch (preferredPortal) {
    case 'ats':
      return 'https://teamified-ats.replit.app';
    case 'jobseeker':
      return 'https://teamified-jobseeker.replit.app';
    case 'accounts':
    default:
      return null; // Stay in accounts
  }
};

const getPortalName = (preferredPortal: 'accounts' | 'ats' | 'jobseeker' | undefined): string => {
  switch (preferredPortal) {
    case 'ats':
      return 'ATS Portal';
    case 'jobseeker':
      return 'Jobseeker Portal';
    default:
      return 'your portal';
  }
};

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

// Extract roles from JWT token to check if user needs to complete signup
// Uses base64url decoding (JWTs use base64url, not standard base64)
const getUserRolesFromToken = (token: string): string[] => {
  try {
    const payload = token.split('.')[1];
    // Convert base64url to base64 (replace - with + and _ with /)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padded = base64 + '==='.slice(0, (4 - base64.length % 4) % 4);
    const decoded = JSON.parse(atob(padded));
    return decoded.roles || [];
  } catch {
    return [];
  }
};

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
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [portalRedirect, setPortalRedirect] = useState<{ url: string; name: string } | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const redirectStarted = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      console.log('[SessionAwareRedirect] Checking session status...');
      
      let accessToken = getAccessToken();
      
      if (isAuthenticated() && accessToken) {
        console.log('[SessionAwareRedirect] User has valid access token');
        // Check if user has roles
        const roles = getUserRolesFromToken(accessToken);
        if (roles.length === 0) {
          console.log('[SessionAwareRedirect] User has no roles, needs role selection');
          setNeedsRoleSelection(true);
        }
        
        // Fetch user data to check preferred portal AND verify token is still valid
        // This catches cases where the user logged out globally (globalLogoutAt set)
        try {
          const user = await getCurrentUser();
          setUserData(user);
          console.log('[SessionAwareRedirect] User data fetched, preferred portal:', user.preferredPortal);
          setIsLoggedIn(true);
        } catch (err: any) {
          console.log('[SessionAwareRedirect] Failed to fetch user data:', err);
          // If we get 401, the token was invalidated (global logout or expired)
          // Clear local storage and treat as not logged in
          if (err?.response?.status === 401) {
            console.log('[SessionAwareRedirect] Token rejected by server (possibly global logout), clearing session');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
            setChecking(false);
            return;
          }
          // For other errors, still consider logged in but without portal redirect
          setIsLoggedIn(true);
        }
        
        setChecking(false);
        return;
      }

      console.log('[SessionAwareRedirect] Access token expired or missing, checking refresh token...');
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          console.log('[SessionAwareRedirect] Attempting to refresh token...');
          const response = await refreshAccessToken(refreshToken);
          accessToken = response.data.accessToken;
          setAccessToken(accessToken);
          console.log('[SessionAwareRedirect] Token refreshed successfully');
          
          // Check if user has roles after refresh
          const roles = getUserRolesFromToken(accessToken);
          if (roles.length === 0) {
            console.log('[SessionAwareRedirect] User has no roles after refresh, needs role selection');
            setNeedsRoleSelection(true);
          }
          
          // Fetch user data to check preferred portal AND verify token is still valid
          try {
            const user = await getCurrentUser();
            setUserData(user);
            console.log('[SessionAwareRedirect] User data fetched after refresh, preferred portal:', user.preferredPortal);
            setIsLoggedIn(true);
          } catch (err: any) {
            console.log('[SessionAwareRedirect] Failed to fetch user data after refresh:', err);
            // If we get 401 after refresh, the token was invalidated (global logout)
            if (err?.response?.status === 401) {
              console.log('[SessionAwareRedirect] Token rejected after refresh (possibly global logout), clearing session');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setIsLoggedIn(false);
              setChecking(false);
              return;
            }
            // For other errors, still consider logged in but without portal redirect
            setIsLoggedIn(true);
          }
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

  // Check if user should be redirected to external portal
  useEffect(() => {
    if (isLoggedIn && !checking && userData && !needsRoleSelection && !redirectStarted.current) {
      if (!isPortalRedirectEnabled()) {
        console.log('[SessionAwareRedirect] Portal redirects are disabled by feature flag');
        return;
      }
      const portalUrl = getPortalUrl(userData.preferredPortal);
      if (portalUrl) {
        console.log('[SessionAwareRedirect] User should be at external portal:', userData.preferredPortal);
        redirectStarted.current = true;
        setPortalRedirect({ url: portalUrl, name: getPortalName(userData.preferredPortal) });
      }
    }
  }, [isLoggedIn, checking, userData, needsRoleSelection]);

  // Perform external redirect
  useEffect(() => {
    if (portalRedirect) {
      console.log('[SessionAwareRedirect] Redirecting to external portal:', portalRedirect.url);
      window.location.replace(portalRedirect.url);
    }
  }, [portalRedirect]);

  // Show loading overlay when redirecting to external portal
  if (portalRedirect) {
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
          Redirecting you to {portalRedirect.name}...
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Please wait a moment
        </Typography>
      </Box>
    );
  }

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
    // If user has no roles, redirect to signup path for role selection
    if (needsRoleSelection) {
      console.log('[SessionAwareRedirect] Redirecting to role selection page');
      return <Navigate to={SIGNUP_PATH} replace />;
    }
    
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
