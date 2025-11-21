import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Avatar,
  Chip,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  TablePagination,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Edit, Delete, Security } from '@mui/icons-material';
import type { User } from '../services/userService';

interface UserListProps {
  users: User[];
  loading: boolean;
  selectedUsers: string[];
  onUserSelect: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEditUser: (user: User) => void;
  onManageRoles: (user: User) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

const UserList: React.FC<UserListProps> = ({
  users,
  loading,
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onEditUser,
  onManageRoles,
  onPageChange,
  currentPage,
  totalPages,
}) => {
  const allSelected = (users || []).length > 0 && (selectedUsers || []).length === (users || []).length;
  const someSelected = (selectedUsers || []).length > 0 && (selectedUsers || []).length < (users || []).length;

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Chip
            label="Active"
            size="small"
            sx={{ 
              fontWeight: 600,
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.success.main, 0.2) 
                  : alpha(theme.palette.success.main, 0.1),
              color: 'success.main',
              border: '1px solid',
              borderColor: 'success.main',
            }}
          />
        );
      case 'inactive':
        return (
          <Chip
            label="Inactive"
            size="small"
            sx={{ 
              fontWeight: 600,
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.warning.main, 0.2) 
                  : alpha(theme.palette.warning.main, 0.1),
              color: 'warning.main',
              border: '1px solid',
              borderColor: 'warning.main',
            }}
          />
        );
      case 'archived':
        return (
          <Chip
            label="Archived"
            size="small"
            sx={{ 
              fontWeight: 600,
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.error.main, 0.2) 
                  : alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
              border: '1px solid',
              borderColor: 'error.main',
            }}
          />
        );
      default:
        return (
          <Chip
            label={status}
            size="small"
            sx={{ 
              fontWeight: 600,
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.grey[500], 0.2) 
                  : alpha(theme.palette.grey[500], 0.1),
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        );
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if ((users || []).length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          👥
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          No users found
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Try adjusting your search or filter criteria
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow 
            sx={{ 
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.common.white, 0.05) 
                  : alpha(theme.palette.common.black, 0.04),
            }}
          >
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={someSelected}
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
              User
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
              Email
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
              Phone
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
              Last Login
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(users || []).map((user) => (
            <TableRow 
              key={user.id} 
              sx={{ 
                '&:hover': { bgcolor: 'action.hover' },
                '&:last-child td': { borderBottom: 0 }
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUsers?.includes(user.id) || false}
                  onChange={(e) => onUserSelect(user.id, e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {getInitials(user.firstName || '', user.lastName || '')}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ID: {user.eorProfile?.employeeId || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user.email}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user.phone || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                {getStatusChip(user.status)}
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => onEditUser(user)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onManageRoles(user)}
                    sx={{
                      color: 'info.main',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                      },
                    }}
                  >
                    <Security fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {(totalPages || 0) > 1 && (
        <TablePagination
          component="div"
          count={(users || []).length * (totalPages || 1)} // This should be total count from API
          page={currentPage - 1}
          onPageChange={(_, page) => onPageChange(page + 1)}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-toolbar': {
              paddingLeft: 3,
              paddingRight: 3,
            },
          }}
        />
      )}
    </TableContainer>
  );
};

export default UserList;
