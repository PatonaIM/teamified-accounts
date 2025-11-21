import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

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

  // Show loading state while checking authentication and user data
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

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has any of the allowed roles
  const hasPermission = user.roles && allowedRoles && user.roles.some(role => 
    allowedRoles.includes(role)
  );

  // Redirect if user doesn't have required role
  if (!hasPermission) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Render protected content if user has required role
  return <>{children}</>;
};

export default RoleBasedRoute;