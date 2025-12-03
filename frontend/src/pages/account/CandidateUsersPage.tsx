import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  InputAdornment,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
} from '@mui/material';
import {
  Search,
  ArrowBack,
  Person,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import userService from '../../services/userService';
import type { User, UserQueryParams } from '../../services/userService';
import InviteCandidateModal from '../../components/invitations/InviteCandidateModal';

export default function CandidateUsersPage() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [totalCandidates, setTotalCandidates] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const loadCandidates = useCallback(async () => {
    setLoading(true);

    try {
      const params: UserQueryParams = {
        page: page + 1,
        limit: rowsPerPage,
        role: 'candidate',
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const response = await userService.getUsers(params);
      setCandidates(response.users || []);
      setTotalCandidates(response.pagination?.total || 0);
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
  }, [page, rowsPerPage, searchQuery, statusFilter]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (candidate: User) => {
    navigate(`/admin/users/${candidate.id}`);
  };

  const getStatusChipColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'invited':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchQuery(searchInput);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="invited">Invited</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
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

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Candidate</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Login</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : candidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                      No candidates found
                    </Typography>
                    {searchQuery.trim() || statusFilter !== 'all' ? (
                      <Typography variant="body2" color="text.secondary">
                        No candidates match your filters
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No candidate users in the system
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  hover
                  onClick={() => handleRowClick(candidate)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={candidate.profileData?.profilePicture || undefined}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'primary.main',
                        }}
                      >
                        {getInitials(candidate.firstName, candidate.lastName)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {candidate.firstName} {candidate.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {candidate.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={candidate.status}
                      size="small"
                      color={getStatusChipColor(candidate.status)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(candidate.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(candidate.lastLoginAt)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCandidates}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

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
