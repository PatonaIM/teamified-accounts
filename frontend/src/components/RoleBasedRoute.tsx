import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { getPortalUrl, getPortalName, isPortalConfigValid } from '../config/portalUrls';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [portalRedirect, setPortalRedirect] = useState<{ url: string; name: string } | null>(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const redirectStarted = useRef(false);

  const hasPermission = user?.roles && allowedRoles && user.roles.some(role => 
    allowedRoles.includes(role)
  );

  useEffect(() => {
    if (user && !loading && !hasPermission && !redirectStarted.current) {
      if (!isPortalConfigValid()) {
        console.error('[RoleBasedRoute] Portal config invalid, missing environment variables.');
        setShowAccessDenied(true);
        return;
      }
      const portalUrl = getPortalUrl(user.preferredPortal);
      if (portalUrl) {
        console.log('[RoleBasedRoute] User lacks required role, redirecting to portal:', user.preferredPortal);
        redirectStarted.current = true;
        setPortalRedirect({ url: portalUrl, name: getPortalName(user.preferredPortal) });
      } else {
        console.log('[RoleBasedRoute] No valid portal URL for user (preferredPortal:', user.preferredPortal, ')');
        setShowAccessDenied(true);
      }
    }
  }, [user, loading, hasPermission]);

  useEffect(() => {
    if (portalRedirect) {
      console.log('[RoleBasedRoute] Redirecting to external portal:', portalRedirect.url);
      window.location.replace(portalRedirect.url);
    }
  }, [portalRedirect]);

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
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasPermission) {
    if (showAccessDenied) {
      return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 8 }}>
          <Alert 
            severity="error"
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </Button>
            }
          >
            <strong>Access Denied</strong>
            <br />
            You do not have the required permissions to access this page.
          </Alert>
        </Box>
      );
    }
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
