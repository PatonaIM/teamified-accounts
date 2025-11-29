import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Button,
  Stack,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  TableContainer,
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Tooltip,
  Snackbar,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  Person,
  Delete,
  VerifiedUser,
  Business,
  CalendarToday,
  AdminPanelSettings,
  CheckCircle,
  Cancel,
  ChevronRight,
  Warning,
  LockReset,
  History,
  ContentCopy,
  Refresh,
  Send,
  Visibility,
  VisibilityOff,
  CreditCard,
  Login,
  Devices,
  Timeline,
  Edit,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import userService, { type User } from '../services/userService';
import roleService from '../services/roleService';
import api from '../services/api';

interface UserRole {
  id: string;
  role: string;
  scope?: string;
  scopeId?: string;
  createdAt: string;
}

interface UserActivity {
  loginHistory: Array<{
    timestamp: string;
    ip: string;
    userAgent: string;
    deviceType: string;
  }>;
  lastAppsUsed: Array<{
    appName: string;
    clientId: string;
    lastUsed: string;
  }>;
  recentActions: Array<{
    action: string;
    entityType: string;
    timestamp: string;
  }>;
}

type TabType = 'basic' | 'organizations' | 'reset-password' | 'billing' | 'activity' | 'delete';

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Reset password state
  const [resetPasswordMode, setResetPasswordMode] = useState<'link' | 'direct'>('link');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendingResetLink, setSendingResetLink] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Activity state
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const navigationState = location.state as { 
    organizationId?: string; 
    organizationName?: string;
  } | null;

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'activity' && userId && !activity) {
      fetchUserActivity();
    }
  }, [activeTab, userId]);

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

  const fetchUserActivity = async () => {
    if (!userId) return;
    
    setActivityLoading(true);
    try {
      const response = await api.get(`/v1/users/${userId}/activity`);
      setActivity(response.data);
    } catch (err) {
      console.warn('Failed to load user activity:', err);
      setActivity({
        loginHistory: [],
        lastAppsUsed: [],
        recentActions: [],
      });
    } finally {
      setActivityLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    if (!user) return;
    
    setSendingResetLink(true);
    try {
      await api.post('/v1/auth/admin/send-password-reset', { email: user.email });
      setResetSuccess('Password reset link has been sent to the user\'s email.');
      setSnackbar({ open: true, message: 'Password reset link sent successfully', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to send reset link', severity: 'error' });
    } finally {
      setSendingResetLink(false);
    }
  };

  const handleSetPassword = async () => {
    if (!user || !newPassword) return;
    
    setSettingPassword(true);
    try {
      await api.post('/v1/auth/admin/set-password', { 
        userId: user.id, 
        newPassword 
      });
      setResetSuccess('Password has been set successfully.');
      setNewPassword('');
      setSnackbar({ open: true, message: 'Password set successfully', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to set password', severity: 'error' });
    } finally {
      setSettingPassword(false);
    }
  };

  const generateStrongPassword = () => {
    const length = 16;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    setNewPassword(password);
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(newPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
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

  const getStatusColor = (status: string): 'success' | 'default' | 'info' | 'warning' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'invited':
        return 'info';
      case 'nlwf':
      case 'inactive':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDisplayStatus = (status: string): string => {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'invited':
        return 'INVITED';
      case 'nlwf':
      case 'inactive':
        return 'NLWF';
      default:
        return status.toUpperCase();
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

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    return 'Desktop';
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

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'basic', label: 'Basic Information', icon: <Person /> },
    { id: 'organizations', label: 'Organizations', icon: <Business /> },
    { id: 'reset-password', label: 'Reset Password', icon: <LockReset /> },
    { id: 'billing', label: 'Billing Details', icon: <CreditCard /> },
    { id: 'activity', label: 'User Activity', icon: <History /> },
    { id: 'delete', label: 'Delete User', icon: <Delete /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <Stack spacing={4}>
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <VerifiedUser color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Profile Information
                  </Typography>
                </Stack>
                <Tooltip title="Edit Profile Information">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/admin/users/${userId}/edit`)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)',
                      },
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: '30%', border: 'none' }}>User ID</TableCell>
                    <TableCell sx={{ border: 'none' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {user.id}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 'none' }}>Email</TableCell>
                    <TableCell sx={{ border: 'none' }}>{user.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 'none' }}>Phone</TableCell>
                    <TableCell sx={{ border: 'none' }}>{user.phone || 'Not provided'}</TableCell>
                  </TableRow>
                  {user.address?.city && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 'none' }}>Address</TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        {[user.address.street, user.address.city, user.address.state, user.address.zip, user.address.country]
                          .filter(Boolean)
                          .join(', ')}
                      </TableCell>
                    </TableRow>
                  )}
                  {user.status && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 'none' }}>Status</TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <Chip label={getDisplayStatus(user.status)} color={getStatusColor(user.status)} size="small" />
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 'none' }}>Email Verified</TableCell>
                    <TableCell sx={{ border: 'none' }}>
                      {user.emailVerified ? (
                        <Chip icon={<CheckCircle />} label="Yes" color="success" size="small" />
                      ) : (
                        <Chip icon={<Cancel />} label="No" color="error" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 'none' }}>Account Active</TableCell>
                    <TableCell sx={{ border: 'none' }}>
                      {user.isActive ? (
                        <Chip icon={<CheckCircle />} label="Yes" color="success" size="small" />
                      ) : (
                        <Chip icon={<Cancel />} label="No" color="error" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 'none' }}>Created</TableCell>
                    <TableCell sx={{ border: 'none' }}>{formatDate(user.createdAt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 'none' }}>Last Login</TableCell>
                    <TableCell sx={{ border: 'none' }}>{formatLastLogin(user.lastLoginAt)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AdminPanelSettings color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Roles & Permissions
                  </Typography>
                </Stack>
                <Tooltip title="Edit Roles & Permissions">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/admin/users/${userId}/edit?tab=roles`)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)',
                      },
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
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
        );

      case 'organizations':
        return (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Business color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Organization Memberships
              </Typography>
            </Stack>

            {user.organizations && user.organizations.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: isDarkMode ? 'action.hover' : 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {user.organizations.map((org) => (
                      <TableRow key={org.organizationId} hover>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {org.organizationName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {org.organizationSlug}
                            </Typography>
                          </Stack>
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
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => navigate('/admin/organizations', {
                              state: { selectedOrganizationId: org.organizationId }
                            })}
                            sx={{ textTransform: 'none' }}
                          >
                            View Org
                          </Button>
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

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Users can belong to multiple organizations with different roles in each.
              To manage a user's role within an organization, visit the organization's member management page.
            </Typography>
          </Box>
        );

      case 'reset-password':
        return (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <LockReset color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Reset Password
              </Typography>
            </Stack>

            {resetSuccess && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setResetSuccess(null)}>
                {resetSuccess}
              </Alert>
            )}

            <Stack spacing={4}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Option 1: Send Password Reset Link
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Send a secure password reset link to the user's email address ({user.email}).
                  The user will be able to set their own password.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={sendingResetLink ? <CircularProgress size={16} /> : <Send />}
                  onClick={handleSendResetLink}
                  disabled={sendingResetLink}
                  sx={{ textTransform: 'none' }}
                >
                  {sendingResetLink ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Paper>

              <Divider>
                <Typography variant="body2" color="text.secondary">OR</Typography>
              </Divider>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Option 2: Set Password Directly
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Set a new password for this user. You will need to communicate this password to the user securely.
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    helperText="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
                  />
                  
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={generateStrongPassword}
                      sx={{ textTransform: 'none' }}
                    >
                      Generate Strong Password
                    </Button>
                    
                    {newPassword && (
                      <Tooltip title={passwordCopied ? 'Copied!' : 'Copy to clipboard'}>
                        <Button
                          variant="outlined"
                          startIcon={<ContentCopy />}
                          onClick={copyPasswordToClipboard}
                          color={passwordCopied ? 'success' : 'primary'}
                          sx={{ textTransform: 'none' }}
                        >
                          {passwordCopied ? 'Copied!' : 'Copy Password'}
                        </Button>
                      </Tooltip>
                    )}
                  </Stack>

                  <Button
                    variant="contained"
                    startIcon={settingPassword ? <CircularProgress size={16} /> : <LockReset />}
                    onClick={handleSetPassword}
                    disabled={settingPassword || !newPassword || newPassword.length < 8}
                    sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                  >
                    {settingPassword ? 'Setting Password...' : 'Set Password'}
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        );

      case 'billing':
        return (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CreditCard sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Billing Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Billing information and payment history will be available here in a future update.
            </Typography>
          </Box>
        );

      case 'activity':
        return (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <History color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                User Activity
              </Typography>
            </Stack>

            {activityLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={4}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Login fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Login History
                    </Typography>
                  </Stack>
                  
                  {activity?.loginHistory && activity.loginHistory.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Device</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {activity.loginHistory.slice(0, 10).map((login, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {format(new Date(login.timestamp), 'MMM d, yyyy h:mm a')}
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Devices fontSize="small" color="action" />
                                  <Typography variant="body2">{getDeviceIcon(login.userAgent)}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {login.ip}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No login history available. Last login: {formatLastLogin(user.lastLoginAt)}
                    </Typography>
                  )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Devices fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Connected Applications
                    </Typography>
                  </Stack>
                  
                  {activity?.lastAppsUsed && activity.lastAppsUsed.length > 0 ? (
                    <Stack spacing={2}>
                      {activity.lastAppsUsed.map((app, index) => (
                        <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                          <Stack>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {app.appName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Client ID: {app.clientId}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            Last used: {formatDistanceToNow(new Date(app.lastUsed), { addSuffix: true })}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No connected applications found.
                    </Typography>
                  )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Timeline fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Recent Activity
                    </Typography>
                  </Stack>
                  
                  {activity?.recentActions && activity.recentActions.length > 0 ? (
                    <Stack spacing={1}>
                      {activity.recentActions.slice(0, 10).map((action, index) => (
                        <Stack key={index} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
                          <Typography variant="body2">
                            {action.action.replace(/_/g, ' ')} - {action.entityType}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent activity recorded.
                    </Typography>
                  )}
                </Paper>

                <Alert severity="info" icon={<Timeline />}>
                  <Typography variant="body2">
                    Activity tracking helps you understand how users interact with the platform.
                    This data is used to improve the user experience and identify potential issues.
                  </Typography>
                </Alert>
              </Stack>
            )}
          </Box>
        );

      case 'delete':
        return (
          <Box>
            <Alert severity="error" icon={<Warning />} sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Delete User Account
              </Typography>
              <Typography variant="body2">
                This action will permanently delete the user and all associated data. This cannot be undone.
              </Typography>
            </Alert>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                To confirm deletion, please type the user's email address:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                {user.email}
              </Typography>
              
              <TextField
                fullWidth
                label="Confirm email address"
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                placeholder={user.email}
                sx={{ mb: 3 }}
                error={deleteConfirmEmail !== '' && deleteConfirmEmail !== user.email}
                helperText={
                  deleteConfirmEmail !== '' && deleteConfirmEmail !== user.email
                    ? 'Email does not match'
                    : ''
                }
              />

              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteClick}
                disabled={deleteConfirmEmail.trim() !== user.email}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Delete User Permanently
              </Button>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header - Full Width */}
      <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
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
        </Stack>
      </Box>

      {/* Main Content - Two Column Layout */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Profile + Navigation */}
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: isDarkMode ? 'background.paper' : 'grey.50',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
          }}
        >
          {/* Profile Section */}
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={user.profileData?.profilePicture ? `/api/objects${user.profileData.profilePicture.replace('/api/objects', '')}` : undefined}
              sx={{
                width: 100,
                height: 100,
                bgcolor: '#A16AE8',
                fontSize: '2.5rem',
                fontWeight: 600,
                mx: 'auto',
                mb: 2,
              }}
            >
              {(user.firstName?.[0] || '?').toUpperCase()}{(user.lastName?.[0] || '?').toUpperCase()}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {user.firstName || 'Unknown'} {user.lastName || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {user.email}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {user.status && (
                <Chip
                  label={getDisplayStatus(user.status)}
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
            </Stack>
          </Box>

          <Divider />

          {/* Contact Info Summary */}
          <Box sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              {user.phone && (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{user.phone}</Typography>
                </Stack>
              )}
              {user.address?.city && (
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">
                    {user.address.city}, {user.address.state}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2">
                  Last login: {formatLastLogin(user.lastLoginAt)}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Navigation Tabs */}
          <List sx={{ py: 1, flex: 1 }}>
            {tabs.map((tab) => (
              <ListItemButton
                key={tab.id}
                selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderLeft: activeTab === tab.id ? 3 : 0,
                  borderColor: 'primary.main',
                  bgcolor: activeTab === tab.id 
                    ? (isDarkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: activeTab === tab.id 
                      ? (isDarkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)') 
                      : 'action.hover',
                  },
                  ...(tab.id === 'delete' && {
                    color: 'error.main',
                    '& .MuiListItemIcon-root': { color: 'error.main' },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {tab.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={tab.label}
                  primaryTypographyProps={{
                    fontWeight: activeTab === tab.id ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Right Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 4 }}>
          {renderTabContent()}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm User Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You are about to permanently delete <strong>{userFullName}</strong>.
          </DialogContentText>
          <DialogContentText sx={{ mb: 2, color: 'error.main', fontWeight: 'bold' }}>
            This action cannot be undone. All user data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
