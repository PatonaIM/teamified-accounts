import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Avatar,
  Button,
  Stack,
  Divider,
  Card,
  CardContent,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  TextField,
  TableContainer,
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  Person,
  Edit,
  Delete,
  VerifiedUser,
  Business,
  CalendarToday,
  AdminPanelSettings,
  CheckCircle,
  Cancel,
  ChevronRight,
  Warning,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import userService, { type User } from '../services/userService';
import roleService from '../services/roleService';

interface UserRole {
  id: string;
  role: string;
  scope?: string;
  scopeId?: string;
  createdAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Get navigation context from location state
  const navigationState = location.state as { 
    organizationId?: string; 
    organizationName?: string;
  } | null;

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const userData = await userService.getUserById(userId);
      setUser(userData);

      try {
        const rolesResponse = await roleService.getUserRoles(userId);
        setRoles(rolesResponse.roles || []);
      } catch (roleErr) {
        console.warn('Failed to load user roles:', roleErr);
        setRoles([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load user details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/users/${userId}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmEmail('');
  };

  const handleConfirmDelete = async () => {
    if (!userId || !user) return;

    // Verify email confirmation
    if (deleteConfirmEmail.trim() !== user.email) {
      return;
    }

    setDeleting(true);
    try {
      await userService.deleteUser(userId);
      navigate(isFromOrganization ? '/admin/organizations' : '/admin/tools/internal-users');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete user');
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatLastLogin = (lastLoginAt: string | null | undefined) => {
    if (!lastLoginAt) return 'Never';
    try {
      return formatDistanceToNow(new Date(lastLoginAt), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'invited':
        return 'info';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    if (role.includes('admin')) return '#A16AE8';
    if (role.includes('hr')) return '#4CAF50';
    if (role.includes('client')) return '#2196F3';
    return '#757575';
  };

  const getRoleDisplayColor = (roleType: string): { bgcolor: string; color: string } => {
    switch (true) {
      case roleType.includes('super_admin'):
        return { bgcolor: '#ffebee', color: '#c62828' };
      case roleType.includes('admin'):
        return { bgcolor: '#f3e5f5', color: '#7b1fa2' };
      case roleType.includes('hr'):
        return { bgcolor: '#e8f5e9', color: '#2e7d32' };
      case roleType.includes('finance'):
        return { bgcolor: '#fff3e0', color: '#e65100' };
      case roleType.includes('recruiter'):
        return { bgcolor: '#e3f2fd', color: '#1565c0' };
      default:
        return { bgcolor: '#f5f5f5', color: '#616161' };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            User Details
          </Typography>
        </Stack>
        <Alert severity="error">{error || 'User not found'}</Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin/users')}
          sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  const userFullName = `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`;
  const isFromOrganization = navigationState?.organizationId && navigationState?.organizationName;

  const handleBackNavigation = () => {
    if (isFromOrganization) {
      navigate('/admin/organizations', {
        state: { selectedOrganizationId: navigationState.organizationId }
      });
    } else {
      navigate('/admin/tools/internal-users');
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header with Breadcrumb */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center">
          <IconButton onClick={handleBackNavigation} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1}>
            {isFromOrganization ? (
              <>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' }
                  }}
                  onClick={handleBackNavigation}
                >
                  Organization Management
                </Typography>
                <ChevronRight sx={{ color: 'text.secondary' }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' }
                  }}
                  onClick={handleBackNavigation}
                >
                  {navigationState.organizationName}
                </Typography>
                <ChevronRight sx={{ color: 'text.secondary' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {userFullName}
                </Typography>
              </>
            ) : (
              <>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' }
                  }}
                  onClick={handleBackNavigation}
                >
                  Internal Users
                </Typography>
                <ChevronRight sx={{ color: 'text.secondary' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {userFullName}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Edit
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Left Column - Profile Card (Persistent) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Stack alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#A16AE8',
                  fontSize: '3rem',
                  fontWeight: 600,
                }}
              >
                {(user.firstName?.[0] || '?').toUpperCase()}{(user.lastName?.[0] || '?').toUpperCase()}
              </Avatar>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {user.firstName || 'Unknown'} {user.lastName || 'User'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                {user.status && (
                  <Chip
                    label={user.status.toUpperCase()}
                    color={getStatusColor(user.status)}
                    size="small"
                  />
                )}
                {user.emailVerified && (
                  <Chip
                    icon={<CheckCircle />}
                    label="Verified"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}
                {user.isActive === false && (
                  <Chip
                    icon={<Cancel />}
                    label="Inactive"
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Contact Information */}
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Contact Information
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Email color="action" fontSize="small" />
                <Typography variant="body2">{user.email}</Typography>
              </Stack>
              {user.phone && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Phone color="action" fontSize="small" />
                  <Typography variant="body2">{user.phone}</Typography>
                </Stack>
              )}
              {user.address?.city && (
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <LocationOn color="action" fontSize="small" />
                  <Typography variant="body2">
                    {[
                      user.address.street,
                      user.address.city,
                      user.address.state,
                      user.address.zip,
                      user.address.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Activity */}
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Activity
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <CalendarToday color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Last Login
                  </Typography>
                  <Typography variant="body2">{formatLastLogin(user.lastLoginAt)}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Person color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Created
                  </Typography>
                  <Typography variant="body2">{formatDate(user.createdAt)}</Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column - Tabbed Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}
            >
              <Tab label="Basic Information" />
              <Tab label="Organizations" />
              <Tab label="Billing Details" />
              <Tab label="Delete User" />
            </Tabs>

            {/* Tab 0: Basic Information */}
            <TabPanel value={activeTab} index={0}>
              <Stack spacing={3} sx={{ px: 3 }}>
                {/* Profile Information Card */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <VerifiedUser color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Profile Information
                    </Typography>
                  </Stack>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '30%' }}>User ID</TableCell>
                        <TableCell>{user.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        <TableCell>{user.email}</TableCell>
                      </TableRow>
                      {user.status && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell>
                            <Chip label={user.status} color={getStatusColor(user.status)} size="small" />
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Email Verified</TableCell>
                        <TableCell>
                          {user.emailVerified ? (
                            <Chip icon={<CheckCircle />} label="Yes" color="success" size="small" />
                          ) : (
                            <Chip icon={<Cancel />} label="No" color="error" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Account Active</TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Chip icon={<CheckCircle />} label="Yes" color="success" size="small" />
                          ) : (
                            <Chip icon={<Cancel />} label="No" color="error" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>

                {/* Roles & Permissions Card */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <AdminPanelSettings color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Roles & Permissions
                    </Typography>
                  </Stack>
                  {roles.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {roles.map((role) => (
                        <Chip
                          key={role.id}
                          label={role.role}
                          sx={{
                            bgcolor: getRoleBadgeColor(role.role),
                            color: 'white',
                            fontWeight: 600,
                            mb: 1,
                          }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No roles assigned
                    </Typography>
                  )}
                </Box>
              </Stack>
            </TabPanel>

            {/* Tab 1: Organizations */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ px: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <Business color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Organization Memberships
                  </Typography>
                </Stack>

                {user.organizations && user.organizations.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {user.organizations.map((org) => (
                          <TableRow key={org.organizationId} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {org.organizationName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {org.organizationSlug}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={org.roleType}
                                size="small"
                                sx={getRoleDisplayColor(org.roleType)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {org.joinedAt ? formatDate(org.joinedAt) : 'Unknown'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    This user is not a member of any organizations.
                  </Alert>
                )}
              </Box>
            </TabPanel>

            {/* Tab 2: Billing Details */}
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Billing Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Coming soon...
                </Typography>
              </Box>
            </TabPanel>

            {/* Tab 3: Delete User */}
            <TabPanel value={activeTab} index={3}>
              <Box sx={{ px: 3 }}>
                <Alert severity="error" icon={<Warning />} sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Delete User
                  </Typography>
                  <Typography variant="body2">
                    This action will permanently delete the user and all associated data. This cannot be undone.
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={handleDeleteClick}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Delete User
                </Button>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to delete {userFullName}?
          </DialogContentText>
          <DialogContentText sx={{ mb: 3, fontWeight: 'bold' }}>
            This action cannot be undone. The user and all their data will be permanently removed.
          </DialogContentText>
          <DialogContentText sx={{ mb: 2 }}>
            To confirm, please type the user's email address: <strong>{user.email}</strong>
          </DialogContentText>
          <TextField
            fullWidth
            label="Confirm email address"
            value={deleteConfirmEmail}
            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            placeholder={user.email}
            autoFocus
            disabled={deleting}
            error={deleteConfirmEmail !== '' && deleteConfirmEmail !== user.email}
            helperText={
              deleteConfirmEmail !== '' && deleteConfirmEmail !== user.email
                ? 'Email does not match'
                : ''
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting || deleteConfirmEmail.trim() !== user.email}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
