import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SidebarMUI from './SidebarMUI';
import ClientPicker from './ClientPicker';

interface LayoutMUIProps {
  children: React.ReactNode;
}

const LayoutMUI: React.FC<LayoutMUIProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage, default to false
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  
  const toggleCollapse = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsed));
  };

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <SidebarMUI
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'margin-left 0.2s ease-in-out',
        }}
      >
        {/* Mobile App Bar */}
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              zIndex: theme.zIndex.drawer + 1,
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleSidebar}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                teamified
              </Typography>
              <ClientPicker />
            </Toolbar>
          </AppBar>
        )}

        {/* Desktop Header Bar */}
        {!isMobile && (
          <AppBar
            position="static"
            elevation={0}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Toolbar sx={{ minHeight: 64 }}>
              <Box sx={{ flexGrow: 1 }} />
              <ClientPicker />
            </Toolbar>
          </AppBar>
        )}

        {/* Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            pt: { xs: 7, lg: 0 }, // Account for mobile app bar
            bgcolor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutMUI;
