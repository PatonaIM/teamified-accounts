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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Phone,
  CalendarToday,
  Badge,
  DeleteForever,
  Warning,
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

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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

    setDeleteLoading(true);

    try {
      await userService.deleteUser(selectedCandidate.id);

      setSnackbar({
        open: true,
        message: `Successfully deleted ${selectedCandidate.firstName} ${selectedCandidate.lastName}`,
        severity: 'success',
      });

      setDeleteConfirmOpen(false);
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
                      primaryTypographyProps={{ fontWeight: 600 }}
                      secondaryTypographyProps={{
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
                <Tab label="Convert to Employee" />
                <Tab label="Delete User" sx={{ color: 'error.main' }} />
              </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', px: 3 }}>
              <TabPanel value={activeTab} index={0}>
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}
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
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {selectedCandidate.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Phone color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Phone
                            </Typography>
                            <Typography variant="body1">
                              {selectedCandidate.phone || 'Not provided'}
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

              <TabPanel value={activeTab} index={2}>
                <Box sx={{ maxWidth: 500 }}>
                  <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      This action cannot be undone
                    </Typography>
                    <Typography variant="body2">
                      Deleting this user will permanently remove their account, including all
                      associated data, roles, and permissions from the system.
                    </Typography>
                  </Alert>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                      borderRadius: 2,
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        src={selectedCandidate.profileData?.profilePicture || undefined}
                        sx={{ width: 48, height: 48, bgcolor: 'error.dark' }}
                      >
                        {getInitials(selectedCandidate.firstName, selectedCandidate.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {selectedCandidate.firstName} {selectedCandidate.lastName}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {selectedCandidate.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    fullWidth
                    startIcon={<DeleteForever />}
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    Delete This User
                  </Button>
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
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
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

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteConfirmText('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Warning />
          Confirm User Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You are about to permanently delete the user{' '}
            <strong>
              {selectedCandidate?.firstName} {selectedCandidate?.lastName}
            </strong>{' '}
            ({selectedCandidate?.email}).
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            This action cannot be undone. All associated data will be permanently removed.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
            To confirm, type "DELETE" below:
          </Typography>
          <TextField
            fullWidth
            placeholder="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            error={deleteConfirmText.length > 0 && deleteConfirmText !== 'DELETE'}
            helperText={
              deleteConfirmText.length > 0 && deleteConfirmText !== 'DELETE'
                ? 'Please type DELETE exactly as shown'
                : ''
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setDeleteConfirmText('');
            }}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteCandidate}
            disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
            startIcon={
              deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteForever />
            }
          >
            {deleteLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

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
