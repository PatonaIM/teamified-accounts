import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Person,
  AdminPanelSettings,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import AppsDropdown from './AppsDropdown';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  requiresSuperAdmin?: boolean;
}

const AccountLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { currentTheme, setTheme } = useTheme();

  const isDarkMode = currentTheme === 'dark';

  const isSuperAdmin = user?.roles?.some((role: string) =>
    ['super_admin', 'system_admin'].includes(role.toLowerCase())
  );

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const navItems: NavItem[] = [
    {
      label: 'My Profile',
      path: '/account/profile',
      icon: <Person />,
    },
    {
      label: 'Admin Tools',
      path: '/admin/tools',
      icon: <AdminPanelSettings />,
      requiresSuperAdmin: true,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.requiresSuperAdmin || isSuperAdmin
  );

  const handleLogout = () => {
    // Clear tokens directly
    localStorage.clear();
    
    // Redirect immediately
    window.location.href = '/login';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
          borderBottom: 'none',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            teamified
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              ml: 2,
              color: 'rgba(255, 255, 255, 0.85)',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Accounts
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <AppsDropdown />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2, flexGrow: 1 }}>
          <List>
            {filteredNavItems.map((item) => {
              const isActive = item.path.startsWith('/admin')
                ? location.pathname.startsWith('/admin')
                : location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => navigate(item.path)}
                    sx={{
                      mx: 2,
                      my: 0.5,
                      borderRadius: '12px',
                      py: 1.5,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(161, 106, 232, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7B3FD6 0%, #5A7AFC 100%)',
                          transform: 'translateX(4px)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#FFFFFF',
                        },
                      },
                      '&:not(.Mui-selected):hover': {
                        bgcolor: 'rgba(161, 106, 232, 0.08)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? 'inherit' : 'text.secondary',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <ListItemButton
            onClick={handleThemeToggle}
            sx={{
              mx: 1,
              borderRadius: '12px',
              mb: 1,
              py: 1.5,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'rgba(161, 106, 232, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemText 
              primary={isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
          </ListItemButton>
          
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              borderRadius: '12px',
              py: 1.5,
              color: 'error.main',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'error.main',
                color: 'error.contrastText',
                transform: 'translateX(4px)',
                '& .MuiListItemIcon-root': {
                  color: 'error.contrastText',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'error.main',
                minWidth: 40,
              }}
            >
              <Logout />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AccountLayout;
