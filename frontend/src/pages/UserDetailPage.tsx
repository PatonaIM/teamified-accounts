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
  Work,
  ChevronRight,
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

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!userId || !user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.firstName} ${user.lastName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await userService.deleteUser(userId);
      navigate('/admin/users');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete user');
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
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Left Column - Profile Card */}
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
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {user.profileData?.title || user.eorProfile?.jobTitle || 'No title'}
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

        {/* Right Column - Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* Roles Card */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Profile Information Card */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* EOR Profile Card (if applicable) */}
            {user.eorProfile && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Work color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Employment Information
                    </Typography>
                  </Stack>
                  <Table size="small">
                    <TableBody>
                      {user.eorProfile.employeeId && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '30%' }}>Employee ID</TableCell>
                          <TableCell>{user.eorProfile.employeeId}</TableCell>
                        </TableRow>
                      )}
                      {user.eorProfile.jobTitle && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
                          <TableCell>{user.eorProfile.jobTitle}</TableCell>
                        </TableRow>
                      )}
                      {user.eorProfile.department && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                          <TableCell>{user.eorProfile.department}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Additional Profile Data */}
            {user.profileData && Object.keys(user.profileData).length > 0 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Business color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Additional Information
                    </Typography>
                  </Stack>
                  <Table size="small">
                    <TableBody>
                      {user.profileData.department && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '30%' }}>Department</TableCell>
                          <TableCell>{user.profileData.department}</TableCell>
                        </TableRow>
                      )}
                      {user.profileData.title && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                          <TableCell>{user.profileData.title}</TableCell>
                        </TableRow>
                      )}
                      {user.profileData.experienceYears && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Experience</TableCell>
                          <TableCell>{user.profileData.experienceYears} years</TableCell>
                        </TableRow>
                      )}
                      {user.profileData.skills && user.profileData.skills.length > 0 && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Skills</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {user.profileData.skills.map((skill: string, index: number) => (
                                <Chip key={index} label={skill} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
