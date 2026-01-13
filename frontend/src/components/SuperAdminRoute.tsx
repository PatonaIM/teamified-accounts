import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

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

  if (!user || !isSuperAdmin) {
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
