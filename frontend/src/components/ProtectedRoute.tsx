import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { saveLastPath } from './SessionAwareRedirect';
import { isPortalRedirectEnabled } from '../utils/featureFlags';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

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

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [portalRedirect, setPortalRedirect] = useState<{ url: string; name: string } | null>(null);
  const redirectStarted = useRef(false);

  useEffect(() => {
    if (user && !user.mustChangePassword) {
      saveLastPath(location.pathname + location.search, user.id);
    }
  }, [location.pathname, location.search, user]);

  // Check if user should be redirected to external portal
  useEffect(() => {
    if (user && !loading && !redirectStarted.current) {
      if (!isPortalRedirectEnabled()) {
        console.log('[ProtectedRoute] Portal redirects are disabled by feature flag');
        return;
      }
      const portalUrl = getPortalUrl(user.preferredPortal);
      if (portalUrl) {
        console.log('[ProtectedRoute] User should be at external portal:', user.preferredPortal);
        redirectStarted.current = true;
        setPortalRedirect({ url: portalUrl, name: getPortalName(user.preferredPortal) });
      }
    }
  }, [user, loading]);

  // Perform external redirect
  useEffect(() => {
    if (portalRedirect) {
      console.log('[ProtectedRoute] Redirecting to external portal:', portalRedirect.url);
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

  if (loading) {
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
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.mustChangePassword && location.pathname !== '/force-change-password') {
    return <Navigate to="/force-change-password" replace />;
  }

  // Redirect role-less users to signup path for role selection (except if already on signup/path)
  if ((!user.roles || user.roles.length === 0) && location.pathname !== '/signup/path') {
    return <Navigate to="/signup/path" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
