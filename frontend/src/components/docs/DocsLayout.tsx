import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme, Drawer, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import DocsSidebar from './DocsSidebar';

export default function DocsLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {isMobile ? (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: theme.zIndex.drawer + 1,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: 280,
                boxSizing: 'border-box',
              },
            }}
          >
            <DocsSidebar />
          </Drawer>
        </>
      ) : (
        <DocsSidebar />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: 'background.default',
          p: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 8, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
