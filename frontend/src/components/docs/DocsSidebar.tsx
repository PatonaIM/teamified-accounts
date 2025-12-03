import React, { useState } from 'react';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Business,
  Code,
  NewReleases,
  ExpandLess,
  ExpandMore,
  MenuBook,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { docsNavConfig } from '../../pages/docs/navConfig';
import type { NavSection } from '../../pages/docs/navConfig';
import { useTheme } from '../../contexts/ThemeContext';

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
  const isDarkMode = muiTheme.palette.mode === 'dark';

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
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <MenuBook color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Documentation
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

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <IconButton
            onClick={handleToggleTheme}
            sx={{
              bgcolor: isDarkMode ? 'action.hover' : 'grey.100',
              '&:hover': {
                bgcolor: isDarkMode ? 'action.selected' : 'grey.200',
              },
            }}
          >
            {isDarkMode ? <LightMode sx={{ color: 'warning.main' }} /> : <DarkMode sx={{ color: 'grey.700' }} />}
          </IconButton>
        </Tooltip>
        <Typography variant="body2" color="text.secondary">
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </Typography>
      </Box>
    </Box>
  );
}
