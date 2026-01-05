import React, { useState, useEffect } from 'react';
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
  Collapse,
} from '@mui/material';
import {
  Apps,
  Person,
  AdminPanelSettings,
  Logout,
  Business,
  VpnKey,
  Analytics,
  ExpandMore,
  ExpandLess,
  PersonAdd,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import AppsDropdown from './AppsDropdown';

const DRAWER_WIDTH = 260;

const AccountLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { currentTheme, setTheme } = useTheme();
  
  const [appsAnchorEl, setAppsAnchorEl] = useState<HTMLElement | null>(null);
  const [deprecatedOpen, setDeprecatedOpen] = useState(false);
  const appsDropdownOpen = Boolean(appsAnchorEl);

  const isDarkMode = currentTheme === 'dark';

  const isSuperAdmin = user?.roles?.some((role: string) =>
    ['super_admin', 'system_admin'].includes(role.toLowerCase())
  );

  const isClientUser = user?.roles?.some((role: string) =>
    role.toLowerCase().startsWith('client_')
  );

  const isInternalUser = user?.roles?.some((role: string) =>
    ['super_admin', 'internal_hr', 'internal_account_manager'].includes(role.toLowerCase())
  );

  const hasOrganizationAccess = isClientUser || isInternalUser;

  const isCzarSuperAdmin = user?.roles?.some((role: string) =>
    role.toLowerCase() === 'super_admin'
  ) && user?.email === 'czar.dy@teamified.com';

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const handleAppsClick = (event: React.MouseEvent<HTMLElement>) => {
    if (appsDropdownOpen) {
      setAppsAnchorEl(null);
    } else {
      setAppsAnchorEl(event.currentTarget);
    }
  };

  const handleAppsClose = () => {
    setAppsAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleDeprecatedToggle = () => {
    setDeprecatedOpen(!deprecatedOpen);
  };

  const navButtonStyles = {
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
  };

  const deprecatedNavButtonStyles = {
    mx: 2,
    ml: 4,
    my: 0.25,
    borderRadius: '12px',
    py: 1,
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
            <ListItem disablePadding>
              <ListItemButton
                selected={!appsDropdownOpen && location.pathname === '/account/profile'}
                onClick={() => navigate('/account/profile')}
                sx={navButtonStyles}
              >
                <ListItemIcon
                  sx={{
                    color: (!appsDropdownOpen && location.pathname === '/account/profile') ? 'inherit' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  <Person />
                </ListItemIcon>
                <ListItemText primary="My Profile" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={handleAppsClick}
                selected={appsDropdownOpen}
                sx={navButtonStyles}
              >
                <ListItemIcon
                  sx={{
                    color: appsDropdownOpen ? 'inherit' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  <Apps />
                </ListItemIcon>
                <ListItemText primary="My Apps" />
              </ListItemButton>
            </ListItem>

            {isSuperAdmin && (
              <ListItem disablePadding>
                <ListItemButton
                  selected={!appsDropdownOpen && location.pathname === '/admin/tools/oauth-configuration'}
                  onClick={() => navigate('/admin/tools/oauth-configuration')}
                  sx={navButtonStyles}
                >
                  <ListItemIcon
                    sx={{
                      color: (!appsDropdownOpen && location.pathname === '/admin/tools/oauth-configuration') ? 'inherit' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    <VpnKey />
                  </ListItemIcon>
                  <ListItemText primary="OAuth Configuration" />
                </ListItemButton>
              </ListItem>
            )}

            {isSuperAdmin && (
              <ListItem disablePadding>
                <ListItemButton
                  selected={!appsDropdownOpen && location.pathname === '/admin/analytics'}
                  onClick={() => navigate('/admin/analytics')}
                  sx={navButtonStyles}
                >
                  <ListItemIcon
                    sx={{
                      color: (!appsDropdownOpen && location.pathname === '/admin/analytics') ? 'inherit' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    <Analytics />
                  </ListItemIcon>
                  <ListItemText primary="Analytics & Reports" />
                </ListItemButton>
              </ListItem>
            )}
          </List>

          {isCzarSuperAdmin && (
            <>
              <Divider sx={{ my: 2, mx: 2 }} />
              
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleDeprecatedToggle}
                    sx={{
                      mx: 2,
                      my: 0.5,
                      borderRadius: '12px',
                      py: 1.5,
                      bgcolor: 'rgba(255, 152, 0, 0.08)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 152, 0, 0.15)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'warning.main',
                        minWidth: 40,
                      }}
                    >
                      <AdminPanelSettings />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Deprecated Tabs"
                      secondary="For Czar only"
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.7rem',
                        color: 'warning.main',
                      }}
                    />
                    {deprecatedOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                
                <Collapse in={deprecatedOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {hasOrganizationAccess && (
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={!appsDropdownOpen && location.pathname.startsWith('/organization/')}
                          onClick={() => navigate('/organization')}
                          sx={deprecatedNavButtonStyles}
                        >
                          <ListItemIcon
                            sx={{
                              color: (!appsDropdownOpen && location.pathname.startsWith('/organization/')) ? 'inherit' : 'text.secondary',
                              minWidth: 36,
                            }}
                          >
                            <Business fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="My Organization"
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    )}

                    <ListItem disablePadding>
                      <ListItemButton
                        selected={!appsDropdownOpen && location.pathname === '/admin/tools'}
                        onClick={() => navigate('/admin/tools')}
                        sx={deprecatedNavButtonStyles}
                      >
                        <ListItemIcon
                          sx={{
                            color: (!appsDropdownOpen && location.pathname === '/admin/tools') ? 'inherit' : 'text.secondary',
                            minWidth: 36,
                          }}
                        >
                          <AdminPanelSettings fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Admin Tools"
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemButton
                        selected={!appsDropdownOpen && location.pathname === '/admin/organizations'}
                        onClick={() => navigate('/admin/organizations')}
                        sx={deprecatedNavButtonStyles}
                      >
                        <ListItemIcon
                          sx={{
                            color: (!appsDropdownOpen && location.pathname === '/admin/organizations') ? 'inherit' : 'text.secondary',
                            minWidth: 36,
                          }}
                        >
                          <Business fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Organization Management"
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemButton
                        selected={!appsDropdownOpen && location.pathname === '/admin/tools/candidate-users'}
                        onClick={() => navigate('/admin/tools/candidate-users')}
                        sx={deprecatedNavButtonStyles}
                      >
                        <ListItemIcon
                          sx={{
                            color: (!appsDropdownOpen && location.pathname === '/admin/tools/candidate-users') ? 'inherit' : 'text.secondary',
                            minWidth: 36,
                          }}
                        >
                          <PersonAdd fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Candidate Users"
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
              </List>
            </>
          )}
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

      <AppsDropdown
        anchorEl={appsAnchorEl}
        open={appsDropdownOpen}
        onClose={handleAppsClose}
      />

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
