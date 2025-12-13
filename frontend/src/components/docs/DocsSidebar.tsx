import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Business,
  Code,
  NewReleases,
  ExpandLess,
  ExpandMore,
  MenuBook,
} from '@mui/icons-material';
import { docsNavConfig } from '../../pages/docs/navConfig';
import type { NavSection } from '../../pages/docs/navConfig';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const iconMap: Record<string, React.ReactNode> = {
  Business: <Business />,
  Code: <Code />,
  NewReleases: <NewReleases />,
};

export default function DocsSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { currentTheme, setTheme } = useTheme();
  const { user } = useAuth();
  const isDarkMode = muiTheme.palette.mode === 'dark';

  const handleLogoClick = () => {
    navigate(user ? '/account/profile' : '/login');
  };

  const handleToggleTheme = () => {
    setTheme(isDarkMode ? 'teamified' : 'dark');
  };

  const getInitialExpandedState = () => {
    const expanded: Record<string, boolean> = {};
    docsNavConfig.forEach((section) => {
      const isActive = section.items.some((item) => location.pathname === item.path);
      expanded[section.title] = isActive;
    });
    if (Object.values(expanded).every((v) => !v)) {
      expanded[docsNavConfig[0].title] = true;
    }
    return expanded;
  };

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    getInitialExpandedState
  );

  // Auto-expand section when navigating directly to a page
  useEffect(() => {
    docsNavConfig.forEach((section) => {
      const isActive = section.items.some((item) => location.pathname === item.path);
      if (isActive) {
        setExpandedSections((prev) => ({
          ...prev,
          [section.title]: true,
        }));
      }
    });
  }, [location.pathname]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isItemActive = (path: string) => location.pathname === path;

  const isSectionActive = (section: NavSection) =>
    section.items.some((item) => location.pathname === item.path);

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDarkMode ? 'background.paper' : 'grey.50',
      }}
    >
      <Box 
        onClick={handleLogoClick}
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
          },
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          teamified
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List component="nav" sx={{ px: 1, py: 1 }}>
          {docsNavConfig.map((section) => (
            <React.Fragment key={section.title}>
              <ListItemButton
                onClick={() => toggleSection(section.title)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: isSectionActive(section)
                    ? isDarkMode
                      ? 'action.selected'
                      : 'primary.50'
                    : 'transparent',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {iconMap[section.icon] || <MenuBook />}
                </ListItemIcon>
                <ListItemText
                  primary={section.title}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                />
                {expandedSections[section.title] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={expandedSections[section.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.items.map((item) => (
                    <ListItemButton
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      sx={{
                        pl: 5,
                        py: 0.75,
                        borderRadius: 1,
                        mb: 0.25,
                        bgcolor: isItemActive(item.path)
                          ? 'primary.main'
                          : 'transparent',
                        color: isItemActive(item.path)
                          ? 'primary.contrastText'
                          : 'text.primary',
                        '&:hover': {
                          bgcolor: isItemActive(item.path)
                            ? 'primary.dark'
                            : 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontSize: '0.8125rem',
                          fontWeight: isItemActive(item.path) ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleToggleTheme}
          sx={{
            mx: 1,
            borderRadius: '12px',
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
      </Box>
    </Box>
  );
}
