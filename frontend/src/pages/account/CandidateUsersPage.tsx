import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  CircularProgress,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search,
  ArrowBack,
  Person,
  PersonAdd,
  Business,
  Email,
  CalendarToday,
  Badge,
  DeleteForever,
  Warning,
  Edit,
  Save,
  Close,
  CameraAlt,
  Lock,
  Refresh,
  Send,
  ContentCopy,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import userService from '../../services/userService';
import type { User, UserQueryParams } from '../../services/userService';
import organizationsService from '../../services/organizationsService';
import type { Organization } from '../../services/organizationsService';
import { useAuth } from '../../contexts/AuthContext';
import InviteCandidateModal from '../../components/invitations/InviteCandidateModal';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`candidate-tabpanel-${index}`}
      aria-labelledby={`candidate-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CandidateUsersPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [candidates, setCandidates] = useState<User[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const [convertOrganizationId, setConvertOrganizationId] = useState('');
  const [convertJobTitle, setConvertJobTitle] = useState('');
  const [convertStartDate, setConvertStartDate] = useState<Date | null>(null);
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [inviteModalOpen, setInviteModalOpen] = useState(false);


  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmailValue, setEditEmailValue] = useState('');
  const [emailSaveLoading, setEmailSaveLoading] = useState(false);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  const [manualPassword, setManualPassword] = useState('');
  const [showManualPassword, setShowManualPassword] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [sendResetEmailLoading, setSendResetEmailLoading] = useState(false);

  const loadCandidates = useCallback(
    async (append = false) => {
      setLoading(true);

      try {
        const params: UserQueryParams = {
          page: append ? currentPage : 1,
          limit: 20,
          role: 'candidate',
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        };

        const response = await userService.getUsers(params);
        const newCandidates = response.users || [];

        if (append) {
          setCandidates((prev) => [...prev, ...newCandidates]);
        } else {
          setCandidates(newCandidates);
          if (newCandidates.length > 0 && !selectedCandidate) {
            setSelectedCandidate(newCandidates[0]);
          }
        }

        setTotalCandidates(response.pagination?.total || 0);
        setHasMore(
          (response.pagination?.page || 1) < (response.pagination?.totalPages || 1)
        );
      } catch (err) {
        console.error('Failed to load candidates:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load candidate users',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [currentPage, searchQuery, statusFilter, selectedCandidate]
  );

  const loadOrganizations = useCallback(async () => {
    try {
      const response = await organizationsService.getAll({ limit: 100 });
      setOrganizations(response.organizations || []);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    if (selectedCandidate) {
      setActiveTab(0);
      setConvertOrganizationId('');
      setConvertJobTitle('');
      setConvertStartDate(null);
      setConvertError(null);
      setIsEditingEmail(false);
      setEditEmailValue(selectedCandidate.email);
      setManualPassword('');
      setShowManualPassword(false);
      setDeleteConfirmText('');
    }
  }, [selectedCandidate]);

  const handleLoadMore = () => {
    setCurrentPage((p) => p + 1);
    loadCandidates(true);
  };

  const handleConvertCandidate = async () => {
    if (!selectedCandidate || !convertOrganizationId) {
      setConvertError('Please select an organization');
      return;
    }

    if (!currentUser?.id) {
      setConvertError('User session not available. Please refresh the page and try again.');
      return;
    }

    setConvertLoading(true);
    setConvertError(null);

    try {
      await organizationsService.convertCandidateToEmployee(convertOrganizationId, {
        candidateEmail: selectedCandidate.email,
        hiredBy: currentUser.id,
        jobTitle: convertJobTitle || undefined,
        startDate: convertStartDate
          ? convertStartDate.toISOString().split('T')[0]
          : undefined,
      });

      setSnackbar({
        open: true,
        message: `Successfully converted ${selectedCandidate.firstName} ${selectedCandidate.lastName} to employee`,
        severity: 'success',
      });

      setSelectedCandidate(null);
      setCurrentPage(1);
      loadCandidates();
    } catch (err: any) {
      setConvertError(
        err?.response?.data?.message || err.message || 'Failed to convert candidate'
      );
    } finally {
      setConvertLoading(false);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!selectedCandidate) return;

    if (deleteConfirmText !== selectedCandidate.email) {
      setSnackbar({
        open: true,
        message: 'Please enter the exact email address to confirm deletion',
        severity: 'error',
      });
      return;
    }

    setDeleteLoading(true);

    try {
      await userService.deleteUser(selectedCandidate.id);

      setSnackbar({
        open: true,
        message: `Successfully deleted ${selectedCandidate.firstName} ${selectedCandidate.lastName}`,
        severity: 'success',
      });

      setDeleteConfirmText('');
      setSelectedCandidate(null);
      setCurrentPage(1);
      loadCandidates();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || err.message || 'Failed to delete candidate',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!selectedCandidate) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmailValue.trim())) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email address',
        severity: 'error',
      });
      return;
    }

    setEmailSaveLoading(true);

    try {
      const updatedUser = await userService.updateUser(selectedCandidate.id, {
        email: editEmailValue.trim(),
      });

      setSnackbar({
        open: true,
        message: 'Email updated successfully',
        severity: 'success',
      });

      setSelectedCandidate(updatedUser);
      setCandidates((prev) =>
        prev.map((c) => (c.id === updatedUser.id ? updatedUser : c))
      );
      setIsEditingEmail(false);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || err.message || 'Failed to update email',
        severity: 'error',
      });
    } finally {
      setEmailSaveLoading(false);
    }
  };

  const handlePhotoClick = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCandidate) return;

    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Please select an image file',
        severity: 'error',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'Image size must be less than 5MB',
        severity: 'error',
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        const updatedUser = await userService.updateUser(selectedCandidate.id, {
          profileData: {
            ...selectedCandidate.profileData,
            profilePicture: base64,
          },
        });

        setSnackbar({
          open: true,
          message: 'Profile picture updated successfully',
          severity: 'success',
        });

        setSelectedCandidate(updatedUser);
        setCandidates((prev) =>
          prev.map((c) => (c.id === updatedUser.id ? updatedUser : c))
        );
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || err.message || 'Failed to upload photo',
        severity: 'error',
      });
      setIsUploadingPhoto(false);
    }
  };

  const generateSecurePassword = () => {
    const length = 16;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '@$!%*?&.';
    const allChars = uppercase + lowercase + numbers + special;

    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('');
    setManualPassword(password);
    setShowManualPassword(true);
  };

  const handleManualPasswordReset = async () => {
    if (!selectedCandidate || !manualPassword) return;

    if (manualPassword.length < 8) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 8 characters long',
        severity: 'error',
      });
      return;
    }

    setPasswordResetLoading(true);

    try {
      await userService.adminSetPassword(selectedCandidate.id, manualPassword);

      setSnackbar({
        open: true,
        message: 'Password reset successfully',
        severity: 'success',
      });

      setManualPassword('');
      setShowManualPassword(false);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || err.message || 'Failed to reset password',
        severity: 'error',
      });
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!selectedCandidate) return;

    setSendResetEmailLoading(true);

    try {
      await userService.adminSendPasswordResetEmail(selectedCandidate.id);

      setSnackbar({
        open: true,
        message: `Password reset email sent to ${selectedCandidate.email}`,
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || err.message || 'Failed to send reset email',
        severity: 'error',
      });
    } finally {
      setSendResetEmailLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Password copied to clipboard',
      severity: 'success',
    });
  };

  const getStatusChipColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const filteredCandidates = candidates;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate('/admin/tools')}
          sx={{
            mr: 2,
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'rgba(161, 106, 232, 0.08)',
            },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Candidate Users
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{ mb: 3, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <Box
          sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search candidates by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setInviteModalOpen(true)}
            sx={{
              whiteSpace: 'nowrap',
              px: 3,
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' },
            }}
          >
            Invite Candidate
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, minHeight: 'calc(100vh - 300px)' }}>
        <Paper
          elevation={0}
          sx={{
            width: 350,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading && candidates.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredCandidates.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  No candidates found
                </Typography>
                {searchQuery.trim() ? (
                  <Typography variant="body2" color="text.secondary">
                    No candidates match "{searchQuery}"
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No candidate users in the system
                  </Typography>
                )}
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {filteredCandidates.map((candidate) => (
                  <ListItemButton
                    key={candidate.id}
                    selected={selectedCandidate?.id === candidate.id}
                    onClick={() => setSelectedCandidate(candidate)}
                    sx={{
                      borderLeft:
                        selectedCandidate?.id === candidate.id
                          ? '3px solid'
                          : '3px solid transparent',
                      borderLeftColor: 'primary.main',
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar
                      src={candidate.profileData?.profilePicture || undefined}
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {getInitials(candidate.firstName, candidate.lastName)}
                    </Avatar>
                    <ListItemText
                      primary={`${candidate.firstName} ${candidate.lastName}`}
                      secondary={candidate.email}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        sx: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        },
                      }}
                    />
                    <Chip
                      label={candidate.status}
                      size="small"
                      color={getStatusChipColor(candidate.status)}
                      sx={{ ml: 1, textTransform: 'capitalize' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="column" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Showing {filteredCandidates.length} of {totalCandidates} candidates
              </Typography>
              {hasMore && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>

        {selectedCandidate ? (
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 0,
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: 64,
                      height: 64,
                      cursor: 'pointer',
                      '&:hover .photo-overlay': {
                        opacity: 1,
                      },
                    }}
                    onClick={handlePhotoClick}
                  >
                    <Avatar
                      src={selectedCandidate.profileData?.profilePicture || undefined}
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {getInitials(selectedCandidate.firstName, selectedCandidate.lastName)}
                    </Avatar>
                    <Box
                      className="photo-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      {isUploadingPhoto ? (
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                      ) : (
                        <CameraAlt sx={{ color: 'white', fontSize: 22 }} />
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {selectedCandidate.firstName} {selectedCandidate.lastName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={selectedCandidate.email}
                        size="small"
                        icon={<Email sx={{ fontSize: 16 }} />}
                      />
                      <Chip
                        label={selectedCandidate.status}
                        size="small"
                        color={getStatusChipColor(selectedCandidate.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Chip
                        label={selectedCandidate.emailVerified ? 'Email Verified' : 'Email Pending'}
                        size="small"
                        color={selectedCandidate.emailVerified ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/admin/users/${selectedCandidate.id}`)}
                >
                  View Full Profile
                </Button>
              </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ px: 3 }}
              >
                <Tab label="Profile Info" />
                <Tab icon={<Lock sx={{ fontSize: 18 }} />} iconPosition="start" label="Reset Password" />
                <Tab label="Convert to Employee" />
                <Tab label="Delete User" sx={{ color: 'error.main' }} />
              </Tabs>
            </Box>

            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />

            <Box sx={{ flex: 1, overflow: 'auto', px: 3 }}>
              <TabPanel value={activeTab} index={0}>
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      Contact Information
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}
                    >
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Email color="action" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Email
                            </Typography>
                            {isEditingEmail ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <TextField
                                  size="small"
                                  value={editEmailValue}
                                  onChange={(e) => setEditEmailValue(e.target.value)}
                                  disabled={emailSaveLoading}
                                  sx={{ flex: 1 }}
                                  autoFocus
                                />
                                <IconButton
                                  size="small"
                                  onClick={handleSaveEmail}
                                  disabled={emailSaveLoading}
                                  color="primary"
                                >
                                  {emailSaveLoading ? (
                                    <CircularProgress size={18} />
                                  ) : (
                                    <Save sx={{ fontSize: 18 }} />
                                  )}
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setIsEditingEmail(false);
                                    setEditEmailValue(selectedCandidate.email);
                                  }}
                                  disabled={emailSaveLoading}
                                >
                                  <Close sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1">
                                  {selectedCandidate.email}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => setIsEditingEmail(true)}
                                  sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                                >
                                  <Edit sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Stack>
                    </Paper>
                  </Box>

                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      Account Details
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}
                    >
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Badge color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              User ID
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                              {selectedCandidate.id}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CalendarToday color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Created
                            </Typography>
                            <Typography variant="body1">
                              {new Date(selectedCandidate.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                }
                              )}
                            </Typography>
                          </Box>
                        </Box>
                        {selectedCandidate.lastLoginAt && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CalendarToday color="action" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Last Login
                              </Typography>
                              <Typography variant="body1">
                                {new Date(selectedCandidate.lastLoginAt).toLocaleDateString(
                                  undefined,
                                  {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  }
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Box>
                </Stack>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      Password Information
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}
                    >
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Lock color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Last Password Update
                            </Typography>
                            <Typography variant="body1">
                              {selectedCandidate.profileData?.passwordChangedAt
                                ? new Date(selectedCandidate.profileData.passwordChangedAt).toLocaleDateString(
                                    undefined,
                                    { year: 'numeric', month: 'long', day: 'numeric' }
                                  )
                                : 'Never updated'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CalendarToday color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Last Successful Sign In
                            </Typography>
                            <Typography variant="body1">
                              {selectedCandidate.lastLoginAt
                                ? new Date(selectedCandidate.lastLoginAt).toLocaleDateString(
                                    undefined,
                                    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                                  )
                                : 'Never signed in'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Warning color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Failed Sign In Attempts
                            </Typography>
                            <Typography variant="body1">
                              {selectedCandidate.profileData?.failedLoginAttempts || 0} attempts
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Paper>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}
                    >
                      Manual Password Reset
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Set a new password for this user directly. They will be able to use this password immediately.
                      </Typography>
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="New Password"
                          type={showManualPassword ? 'text' : 'password'}
                          value={manualPassword}
                          onChange={(e) => setManualPassword(e.target.value)}
                          disabled={passwordResetLoading}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowManualPassword(!showManualPassword)}
                                  edge="end"
                                  size="small"
                                >
                                  {showManualPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                                {manualPassword && (
                                  <IconButton
                                    onClick={() => copyToClipboard(manualPassword)}
                                    edge="end"
                                    size="small"
                                    sx={{ ml: 0.5 }}
                                  >
                                    <ContentCopy sx={{ fontSize: 18 }} />
                                  </IconButton>
                                )}
                              </InputAdornment>
                            ),
                          }}
                          helperText="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={generateSecurePassword}
                            disabled={passwordResetLoading}
                          >
                            Generate Secure Password
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={
                              passwordResetLoading ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                <Save />
                              )
                            }
                            onClick={handleManualPasswordReset}
                            disabled={passwordResetLoading || !manualPassword || manualPassword.length < 8}
                            sx={{
                              bgcolor: '#A16AE8',
                              '&:hover': { bgcolor: '#8f5cd9' },
                            }}
                          >
                            {passwordResetLoading ? 'Setting...' : 'Set Password'}
                          </Button>
                        </Box>
                      </Stack>
                    </Paper>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}
                    >
                      Send Password Reset Link
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Send a password reset email to <strong>{selectedCandidate.email}</strong>. 
                        The link will be valid for 24 hours.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={
                          sendResetEmailLoading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <Send />
                          )
                        }
                        onClick={handleSendResetEmail}
                        disabled={sendResetEmailLoading}
                      >
                        {sendResetEmailLoading ? 'Sending...' : 'Send Reset Email'}
                      </Button>
                    </Paper>
                  </Box>
                </Stack>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Box sx={{ maxWidth: 500 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Convert this candidate to an employee of an organization. This will add them
                    as a member of the selected organization.
                  </Typography>

                  {convertError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {convertError}
                    </Alert>
                  )}

                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Organization *</InputLabel>
                      <Select
                        value={convertOrganizationId}
                        label="Organization *"
                        onChange={(e) => setConvertOrganizationId(e.target.value)}
                      >
                        {organizations.map((org) => (
                          <MenuItem key={org.id} value={org.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Business sx={{ fontSize: 20, color: 'text.secondary' }} />
                              {org.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Job Title (Optional)"
                      value={convertJobTitle}
                      onChange={(e) => setConvertJobTitle(e.target.value)}
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Start Date (Optional)"
                        value={convertStartDate}
                        onChange={(date) => setConvertStartDate(date)}
                        slotProps={{
                          textField: { fullWidth: true },
                        }}
                      />
                    </LocalizationProvider>

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={
                        convertLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <PersonAdd />
                        )
                      }
                      onClick={handleConvertCandidate}
                      disabled={convertLoading || !convertOrganizationId}
                      sx={{
                        bgcolor: '#A16AE8',
                        '&:hover': { bgcolor: '#8f5cd9' },
                      }}
                    >
                      {convertLoading ? 'Converting...' : 'Convert to Employee'}
                    </Button>
                  </Stack>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <Box sx={{ maxWidth: 500 }}>
                  <Alert severity="error" icon={<Warning />} sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      Delete User
                    </Typography>
                    <Typography variant="body2">
                      This action will permanently delete the user and all associated data. This cannot be undone.
                    </Typography>
                  </Alert>

                  <Paper
                    elevation={0}
                    sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2, mb: 3 }}
                  >
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Are you sure you want to delete <strong>{selectedCandidate.firstName} {selectedCandidate.lastName}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      This action cannot be undone. The user and all their data will be permanently removed from the system.
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      To confirm, please type the user's email address: <strong>{selectedCandidate.email}</strong>
                    </Typography>
                    <TextField
                      fullWidth
                      label="Confirm email address"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={selectedCandidate.email}
                      disabled={deleteLoading}
                      error={deleteConfirmText !== '' && deleteConfirmText !== selectedCandidate.email}
                      helperText={
                        deleteConfirmText !== '' && deleteConfirmText !== selectedCandidate.email
                          ? 'Email does not match'
                          : ''
                      }
                      sx={{ mb: 3 }}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      onClick={handleDeleteCandidate}
                      disabled={deleteLoading || deleteConfirmText.trim() !== selectedCandidate.email}
                      startIcon={
                        deleteLoading ? <CircularProgress size={16} color="inherit" /> : <DeleteForever />
                      }
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
                    </Button>
                  </Paper>
                </Box>
              </TabPanel>
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <Person sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Select a candidate
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a candidate from the list to view their details
            </Typography>
          </Paper>
        )}
      </Box>

      <InviteCandidateModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={(message) => {
          setSnackbar({ open: true, message, severity: 'success' });
          loadCandidates();
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
