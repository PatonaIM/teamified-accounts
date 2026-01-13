import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { isPortalRedirectEnabled } from '../utils/featureFlags';
import { getPortalUrl, getPortalName, isPortalConfigValid } from '../config/portalUrls';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [portalRedirect, setPortalRedirect] = useState<{ url: string; name: string } | null>(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const redirectStarted = useRef(false);

  const isSuperAdmin = user?.roles?.some((role: string) => 
    ['super_admin', 'system_admin'].includes(role.toLowerCase())
  );

  useEffect(() => {
    if (user && !loading && !isSuperAdmin && !redirectStarted.current) {
      if (!isPortalRedirectEnabled()) {
        console.log('[SuperAdminRoute] Portal redirects are disabled by feature flag');
        setShowAccessDenied(true);
        return;
      }
      if (!isPortalConfigValid()) {
        console.error('[SuperAdminRoute] Portal config invalid, missing environment variables.');
        setShowAccessDenied(true);
        return;
      }
      const portalUrl = getPortalUrl(user.preferredPortal);
      if (portalUrl) {
        console.log('[SuperAdminRoute] Non-super-admin user, redirecting to portal:', user.preferredPortal);
        redirectStarted.current = true;
        setPortalRedirect({ url: portalUrl, name: getPortalName(user.preferredPortal) });
      } else {
        console.log('[SuperAdminRoute] No valid portal URL for user (preferredPortal:', user.preferredPortal, ')');
        setShowAccessDenied(true);
      }
    }
  }, [user, loading, isSuperAdmin]);

  useEffect(() => {
    if (portalRedirect) {
      console.log('[SuperAdminRoute] Redirecting to external portal:', portalRedirect.url);
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isSuperAdmin) {
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
            Super admin privileges are required to access this page.
          </Alert>
        </Box>
      );
    }
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default SuperAdminRoute;
