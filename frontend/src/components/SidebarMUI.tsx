import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Avatar,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ButtonGroup,
  Button,
  alpha,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderIcon from '@mui/icons-material/Folder';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaletteIcon from '@mui/icons-material/Palette';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { logout } from '../services/authService';
import { useRoleBasedNavigation } from '../hooks/useRoleBasedNavigation';
import { useAuth } from '../hooks/useAuth';

interface SidebarMUIProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarMUI: React.FC<SidebarMUIProps> = ({ 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { navigationItems, userRoles } = useRoleBasedNavigation();
  const { clearUser } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openDropdown = Boolean(anchorEl);
  
  // Check if user can access hiring features
  const canAccessHiring = userRoles.some(role => 
    ['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client'].includes(role)
  );

  const handleDropdownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleDropdownClose();
    onClose();
  };

  // Icon mapping for navigation items
  const getIcon = (title: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Dashboard': <DashboardIcon />,
      'Profile': <PersonIcon />,
      'Onboarding': <AssignmentIcon />,
      'Invitations': <MailIcon />,
      'User Management': <GroupIcon />,
      'Employment Records': <WorkIcon />,
      'Salary History': <AttachMoneyIcon />,
      'Clients': <BusinessIcon />,
      'Payroll': <BusinessIcon />,
      'CV Management': <DescriptionIcon />,
      'Jobs': <WorkIcon />,
      'Job Requests': <WorkOutlineIcon />,
      'Interviews': <CalendarTodayIcon />,
      'Talent Pool': <PeopleAltIcon />,
      'Timesheets': <ScheduleIcon />,
      'Leave': <CheckCircleIcon />,
      'Payslips': <AttachMoneyIcon />,
      'Documents': <FolderIcon />,
      'My Documents': <FolderIcon />,
      'Settings': <PaletteIcon />,
      'HR Onboarding': <AssignmentIcon />,
    };
    return iconMap[title] || <DashboardIcon />;
  };

  const handleLogout = async () => {
    try {
      // Clear user state immediately
      clearUser();
      
      // Call logout API
      await logout();
      
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
      onClose();
    }
  };

  const drawerWidth = isCollapsed ? 64 : 280;
  const drawerVariant = isMobile ? 'temporary' : 'permanent';

  // Split navigation items into main and bottom sections
  const mainNavItems = navigationItems.filter(
    item => item.title !== 'Profile' && item.title !== 'Settings'
  );
  const bottomNavItems = navigationItems.filter(
    item => item.title === 'Profile' || item.title === 'Settings'
  );

  const renderNavItem = (item: typeof navigationItems[0]) => {
    const isActive = location.pathname === item.href;
    
    const listItem = (
      <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          component={Link}
          to={item.href}
          onClick={onClose}
          sx={{
            borderRadius: 2,
            mx: 1,
            height: 44,
            px: isCollapsed ? 1.5 : 2,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            bgcolor: isActive ? 'primary.main' : 'transparent',
            color: isActive ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              bgcolor: isActive ? 'primary.dark' : 'action.hover',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isCollapsed ? 'auto' : 40,
              color: isActive ? 'primary.contrastText' : 'text.secondary',
              justifyContent: 'center',
            }}
          >
            {getIcon(item.title)}
          </ListItemIcon>
          {!isCollapsed && (
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
    );

    return isCollapsed ? (
      <Tooltip key={item.href} title={item.title} placement="right">
        {listItem}
      </Tooltip>
    ) : (
      listItem
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: 64,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {!isCollapsed && (
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                fontSize: '1.5rem',
              }}
            >
              teamified
            </Typography>
          </Link>
        )}
        
        {isCollapsed && (
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton
              onClick={onToggleCollapse}
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '1rem',
                }}
              >
                T
              </Typography>
            </IconButton>
          </Tooltip>
        )}

        {!isCollapsed && (
          <Tooltip title="Collapse sidebar" placement="right">
            <IconButton
              onClick={onToggleCollapse}
              size="small"
              sx={{
                position: 'absolute',
                right: 8,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 1, py: 2 }}>
          {/* New Job Request CTA Dropdown */}
          {canAccessHiring && !isCollapsed && (
            <ListItem disablePadding sx={{ mb: 2 }}>
              <Box sx={{ width: '100%', px: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleDropdownClick}
                  endIcon={<ArrowDropDownIcon />}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: 2,
                    height: 42,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    borderWidth: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: 'primary.main',
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      boxShadow: (theme) => `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Create New
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={openDropdown}
                  onClose={handleDropdownClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      minWidth: 200,
                      mt: 0.5,
                    },
                  }}
                >
                  <MenuItem 
                    onClick={() => handleMenuItemClick('/hiring/job-requests/new')}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <WorkOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="New Job Request" 
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </MenuItem>
                  <MenuItem 
                    onClick={() => handleMenuItemClick('/hiring/tasks/new')}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AssignmentTurnedInIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="New Task" 
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </MenuItem>
                </Menu>
              </Box>
            </ListItem>
          )}
          {canAccessHiring && isCollapsed && (
            <ListItem disablePadding sx={{ mb: 2 }}>
              <Tooltip title="New Job Request / Task" placement="right">
                <IconButton
                  onClick={handleDropdownClick}
                  sx={{
                    mx: 'auto',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    width: 40,
                    height: 40,
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={openDropdown}
                onClose={handleDropdownClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <MenuItem onClick={() => handleMenuItemClick('/hiring/job-requests/new')}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <WorkOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="New Job Request" />
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/hiring/tasks/new')}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AssignmentTurnedInIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="New Task" />
                </MenuItem>
              </Menu>
            </ListItem>
          )}
          {mainNavItems.map(renderNavItem)}
        </List>
      </Box>

      {/* Bottom Navigation - Profile & Settings */}
      <Box sx={{ p: 0.5, borderTop: 1, borderColor: 'divider' }}>
        <List sx={{ px: 1, py: 1 }}>
          {bottomNavItems.map(renderNavItem)}
        </List>
      </Box>

      {/* Footer - Logout */}
      <Box sx={{ p: 0.5, borderTop: 1, borderColor: 'divider' }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              mx: 1,
              minHeight: 44,
              px: isCollapsed ? 1.5 : 2,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.contrastText',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: isCollapsed ? 'auto' : 40,
                color: 'inherit',
                justifyContent: 'center',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary="Sign Out"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={drawerVariant}
      open={isMobile ? isOpen : true}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider',
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default SidebarMUI;
