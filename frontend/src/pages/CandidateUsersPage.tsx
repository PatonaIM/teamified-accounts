import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import { Search, ArrowBack, PersonAdd, Work } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import type { User } from '../services/userService';
import { resolveProfilePictureUrl } from '../services/profileService';

const CandidateUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'invited'>('all');

  const CANDIDATE_ROLE = 'candidate';

  useEffect(() => {
    fetchCandidates();
  }, [page, rowsPerPage, searchQuery, statusFilter]);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: CANDIDATE_ROLE,
      });

      if (!response || !response.users) {
        throw new Error('Invalid response from server');
      }

      const filteredUsers = response.users.filter(user => !(user as any).deletedAt);
      setUsers(filteredUsers);
      setTotalCount(response.pagination?.total || 0);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load candidate users';
      setError(errorMessage);
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUserClick = (user: User) => {
    navigate(`/admin/users/${user.id}`);
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
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'invited': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/tools')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
          Candidate Users
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Work />}
          onClick={() => navigate('/hiring/talent-pool')}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            mr: 2,
          }}
        >
          View Talent Pool
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => navigate('/signup')}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#A16AE8',
            '&:hover': { bgcolor: '#8f5cd9' },
          }}
        >
          Invite Candidate
        </Button>
      </Stack>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
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
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="invited">Invited</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.lighter' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Candidate</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Login</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No candidate users found matching your filters'
                      : 'No candidate users yet'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  onClick={() => handleUserClick(user)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={resolveProfilePictureUrl(user.profileData?.profilePicture)}
                        sx={{ width: 40, height: 40 }}
                      >
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.firstName} {user.lastName}
                        </Typography>
                        {user.profileData?.position && (
                          <Typography variant="caption" color="text.secondary">
                            {user.profileData.position}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.phone || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(user.status)}
                      size="small"
                      color={getStatusColor(user.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatLastLogin(user.lastLoginAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>
    </Box>
  );
};

export default CandidateUsersPage;
