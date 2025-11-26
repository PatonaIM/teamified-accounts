import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
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

interface ConvertDialogState {
  open: boolean;
  candidate: User | null;
  organizationId: string;
  jobTitle: string;
  startDate: Date | null;
  loading: boolean;
  error: string | null;
}

export default function CandidateUsersPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [candidates, setCandidates] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [convertDialog, setConvertDialog] = useState<ConvertDialogState>({
    open: false,
    candidate: null,
    organizationId: '',
    jobTitle: '',
    startDate: null,
    loading: false,
    error: null,
  });

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: UserQueryParams = {
        page: page + 1,
        limit: rowsPerPage,
        role: 'candidate',
        search: searchQuery || undefined,
      };

      const response = await userService.getUsers(params);
      setCandidates(response.users || []);
      setTotalCandidates(response.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidate users');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

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
  }, [loadCandidates]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenConvertDialog = (candidate: User) => {
    setConvertDialog({
      open: true,
      candidate,
      organizationId: '',
      jobTitle: '',
      startDate: null,
      loading: false,
      error: null,
    });
  };

  const handleCloseConvertDialog = () => {
    setConvertDialog({
      open: false,
      candidate: null,
      organizationId: '',
      jobTitle: '',
      startDate: null,
      loading: false,
      error: null,
    });
  };

  const handleConvertCandidate = async () => {
    if (!convertDialog.candidate || !convertDialog.organizationId) {
      setConvertDialog((prev) => ({
        ...prev,
        error: 'Please select an organization',
      }));
      return;
    }

    if (!currentUser?.id) {
      setConvertDialog((prev) => ({
        ...prev,
        error: 'User session not available. Please refresh the page and try again.',
      }));
      return;
    }

    setConvertDialog((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await organizationsService.convertCandidateToEmployee(
        convertDialog.organizationId,
        {
          candidateEmail: convertDialog.candidate.email,
          hiredBy: currentUser.id,
          jobTitle: convertDialog.jobTitle || undefined,
          startDate: convertDialog.startDate
            ? convertDialog.startDate.toISOString().split('T')[0]
            : undefined,
        }
      );

      setSuccessMessage(
        `Successfully converted ${convertDialog.candidate.firstName} ${convertDialog.candidate.lastName} to employee`
      );
      handleCloseConvertDialog();
      loadCandidates();

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setConvertDialog((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || err.message || 'Failed to convert candidate',
      }));
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

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/tools')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Candidate Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage candidate users and convert them to organization employees
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadCandidates}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            sx={{ width: 300 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {totalCandidates} candidate{totalCandidates !== 1 ? 's' : ''} found
          </Typography>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Email Verified</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {searchQuery
                        ? 'No candidates found matching your search'
                        : 'No candidate users found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    hover
                    onClick={() => navigate(`/admin/users/${candidate.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(candidate.firstName, candidate.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {candidate.firstName} {candidate.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{candidate.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={candidate.status}
                        size="small"
                        color={getStatusChipColor(candidate.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={candidate.emailVerified ? 'Verified' : 'Pending'}
                        size="small"
                        color={candidate.emailVerified ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Profile">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/users/${candidate.id}`);
                            }}
                            sx={{ color: 'text.secondary' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Convert to Employee">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PersonAddIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenConvertDialog(candidate);
                            }}
                            sx={{
                              bgcolor: '#A16AE8',
                              '&:hover': { bgcolor: '#8f5cd9' },
                            }}
                          >
                            Convert
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCandidates}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={convertDialog.open}
        onClose={handleCloseConvertDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" />
          Convert Candidate to Employee
        </DialogTitle>
        <DialogContent>
          {convertDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {convertDialog.error}
            </Alert>
          )}

          {convertDialog.candidate && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Converting candidate:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getInitials(
                    convertDialog.candidate.firstName,
                    convertDialog.candidate.lastName
                  )}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {convertDialog.candidate.firstName} {convertDialog.candidate.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {convertDialog.candidate.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Organization *</InputLabel>
            <Select
              value={convertDialog.organizationId}
              label="Organization *"
              onChange={(e) =>
                setConvertDialog((prev) => ({
                  ...prev,
                  organizationId: e.target.value,
                }))
              }
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Job Title (Optional)"
            value={convertDialog.jobTitle}
            onChange={(e) =>
              setConvertDialog((prev) => ({
                ...prev,
                jobTitle: e.target.value,
              }))
            }
            sx={{ mb: 2 }}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date (Optional)"
              value={convertDialog.startDate}
              onChange={(date) =>
                setConvertDialog((prev) => ({
                  ...prev,
                  startDate: date,
                }))
              }
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConvertDialog} disabled={convertDialog.loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConvertCandidate}
            disabled={convertDialog.loading || !convertDialog.organizationId}
            sx={{
              bgcolor: '#A16AE8',
              '&:hover': { bgcolor: '#8f5cd9' },
            }}
          >
            {convertDialog.loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Convert to Employee'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
