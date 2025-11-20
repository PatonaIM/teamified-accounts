import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  const isSuperAdmin = user?.roles?.some((role: string) => 
    ['super_admin', 'system_admin'].includes(role.toLowerCase())
  );

  if (!isSuperAdmin) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 8 }}>
        <Alert severity="error">
          <strong>Access Denied</strong>
          <br />
          Super admin privileges are required to access this page.
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default SuperAdminRoute;
