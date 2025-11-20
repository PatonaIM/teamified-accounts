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
  Snackbar,
  Alert,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
} from '@mui/material';
import { Search, Add, Delete, ArrowBack } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import type { User } from '../services/userService';
import InternalUserInvitationModal from '../components/InternalUserInvitationModal';
import { useAuth } from '../contexts/AuthContext';
import { resolveProfilePictureUrl } from '../services/profileService';

const InternalUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'invited'>('active');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  const INTERNAL_ROLES = 'super_admin,internal_hr,internal_finance,internal_account_manager,internal_recruiter,internal_marketing,internal_member';

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchQuery, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: INTERNAL_ROLES,
      });

      // Filter out deleted users from the results (soft deleted)
      const filteredUsers = (response.users || []).filter(user => !(user as any).deletedAt);
      setUsers(filteredUsers);
      setTotalCount(response.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load internal users');
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

  const handleDeleteClick = (event: React.MouseEvent, user: User) => {
    event.stopPropagation();
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    // Verify email confirmation (trim whitespace)
    if (deleteConfirmEmail.trim() !== userToDelete.email) {
      setError('Email confirmation does not match. Please type the exact email address.');
      return;
    }

    setDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      setSuccess(`User ${userToDelete.firstName} ${userToDelete.lastName} deleted successfully!`);
      setShowDeleteDialog(false);
      setUserToDelete(null);
      setDeleteConfirmEmail('');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      setShowDeleteDialog(false);
      setUserToDelete(null);
      setDeleteConfirmEmail('');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setUserToDelete(null);
    setDeleteConfirmEmail('');
  };


  const formatLastLogin = (lastLogin: string | null | undefined) => {
    if (!lastLogin) return 'Never';
    try {
      return formatDistanceToNow(new Date(lastLogin), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getRoleDisplay = (user: User) => {
    // Get the primary role from userRoles array
    const userRoles = (user as any).userRoles;
    const primaryRole = userRoles && userRoles.length > 0 
      ? userRoles[0].roleType 
      : 'N/A';
    
    const roleMap: Record<string, string> = {
      super_admin: 'Super Admin',
      internal_hr: 'Internal HR',
      internal_finance: 'Internal Finance',
      internal_account_manager: 'Internal Account Manager',
      internal_recruiter: 'Internal Recruiter',
      internal_marketing: 'Internal Marketing',
      internal_member: 'Internal Member',
    };
    
    return roleMap[primaryRole] || primaryRole;
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/admin/tools')}
          sx={{ 
            color: 'primary.main',
            '&:hover': { 
              bgcolor: 'rgba(161, 106, 232, 0.08)' 
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Internal Users
        </Typography>
      </Stack>

      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: '20px' }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: '0 1 150px', minWidth: 120 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">NLWF</MenuItem>
                <MenuItem value="invited">Invited</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '0 0 auto' }}>
            <Button
              variant="contained"
              size="medium"
              startIcon={<Add />}
              onClick={() => setShowInviteModal(true)}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': {
                  bgcolor: '#45a049',
                },
              }}
            >
              Invite User
            </Button>
          </Box>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '25%' }}>User</TableCell>
              <TableCell sx={{ width: '25%' }}>Email</TableCell>
              <TableCell sx={{ width: '15%' }}>Role</TableCell>
              <TableCell sx={{ width: '12%' }}>Status</TableCell>
              <TableCell sx={{ width: '15%' }}>Last Login</TableCell>
              <TableCell align="right" sx={{ width: '8%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={40} sx={{ my: 2 }} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No internal users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell onClick={() => handleUserClick(user)} sx={{ width: '25%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={resolveProfilePictureUrl((user as any).profilePicture) || undefined}
                        alt={`${user.firstName} ${user.lastName}`}
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: '0.9rem',
                          bgcolor: '#A16AE8',
                        }}
                      >
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.firstName} {user.lastName}
                          </Typography>
                          {currentUser && user.email === currentUser.email && (
                            <Chip
                              label="You"
                              size="small"
                              sx={{
                                bgcolor: '#A16AE8',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: '20px',
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell onClick={() => handleUserClick(user)} sx={{ width: '25%' }}>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell onClick={() => handleUserClick(user)} sx={{ width: '15%' }}>
                    <Chip
                      label={getRoleDisplay(user)}
                      size="small"
                      sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                    />
                  </TableCell>
                  <TableCell onClick={() => handleUserClick(user)} sx={{ width: '12%' }}>
                    <Chip
                      label={user.isActive ? 'Active' : 'NLWF'}
                      size="small"
                      color={user.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell onClick={() => handleUserClick(user)} sx={{ width: '15%' }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatLastLogin(user.lastLoginAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ width: '8%' }}>
                    {!(currentUser && user.email === currentUser.email) && (
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteClick(e, user)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <InternalUserInvitationModal
        open={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          fetchUsers(); // Refresh table when modal closes
        }}
        onSuccess={() => {
          setSuccess('Invitation sent successfully!');
        }}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={5000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to delete {userToDelete?.firstName} {userToDelete?.lastName}?
          </DialogContentText>
          <DialogContentText sx={{ mb: 3, fontWeight: 'bold' }}>
            This action cannot be undone. The user and all their data will be permanently removed.
          </DialogContentText>
          <DialogContentText sx={{ mb: 2 }}>
            To confirm, please type the user's email address: <strong>{userToDelete?.email}</strong>
          </DialogContentText>
          <TextField
            fullWidth
            label="Confirm email address"
            value={deleteConfirmEmail}
            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            placeholder={userToDelete?.email}
            autoFocus
            disabled={deleting}
            error={deleteConfirmEmail !== '' && deleteConfirmEmail !== userToDelete?.email}
            helperText={
              deleteConfirmEmail !== '' && deleteConfirmEmail !== userToDelete?.email
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
            disabled={deleting || deleteConfirmEmail.trim() !== userToDelete?.email}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InternalUsersPage;
