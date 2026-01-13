import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { isPortalRedirectEnabled } from '../utils/featureFlags';
import { getPortalUrl, getPortalName, isPortalConfigValid } from '../config/portalUrls';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isSuperAdmin = user?.roles?.some((role: string) => 
    ['super_admin', 'system_admin'].includes(role.toLowerCase())
  );

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
    if (isPortalRedirectEnabled() && isPortalConfigValid()) {
      const portalUrl = getPortalUrl(user.preferredPortal);
      if (portalUrl) {
        window.location.replace(portalUrl);
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
            <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
              Redirecting you to {getPortalName(user.preferredPortal)}...
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Please wait a moment
            </Typography>
          </Box>
        );
      }
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
