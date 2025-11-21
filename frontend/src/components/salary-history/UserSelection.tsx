/**
 * User Selection Component
 * Dropdown interface for admins to select users for salary history management
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Chip,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import userService from '../../services/userService';

// Define User type locally to avoid import issues
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: any;
  profileData?: any;
  status: 'active' | 'inactive' | 'archived';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserSelectionProps {
  selectedUser: User | null;
  onUserChange: (user: User | null) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export const UserSelection: React.FC<UserSelectionProps> = ({
  selectedUser,
  onUserChange,
  disabled = false,
  label = 'Select User',
  placeholder = 'Search users...',
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers({ limit: 100 }); // Get first 100 users
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 2) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await userService.searchUsers(query, { limit: 50 });
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const getStatusColor = (status: string) => {
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

  return (
    <Box>
      <Autocomplete
        value={selectedUser}
        onChange={(event, newValue) => onUserChange(newValue)}
        onInputChange={(event, newInputValue) => {
          setSearchQuery(newInputValue);
          if (newInputValue.length >= 2) {
            handleSearch(newInputValue);
          }
        }}
        options={users}
        getOptionLabel={(user) => getDisplayName(user)}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        loading={loading}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, user) => (
          <Box component="li" {...props} key={user.id}>
            <Box display="flex" alignItems="center" width="100%">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  mr: 2,
                  bgcolor: '#A16AE8',
                  fontSize: '0.875rem',
                }}
              >
                {getInitials(user)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="body1" fontWeight={500}>
                  {getDisplayName(user)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Chip
                label={user.status}
                size="small"
                color={getStatusColor(user.status) as any}
                variant="outlined"
              />
            </Box>
          </Box>
        )}
        renderTags={(value, getTagProps) =>
          value.map((user, index) => (
            <Chip
              {...getTagProps({ index })}
              key={user.id}
              avatar={
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#A16AE8', fontSize: '0.75rem' }}>
                  {getInitials(user)}
                </Avatar>
              }
              label={getDisplayName(user)}
              color={getStatusColor(user.status) as any}
            />
          ))
        }
        noOptionsText={
          searchQuery.length < 2 
            ? 'Type at least 2 characters to search...'
            : 'No users found'
        }
        clearOnBlur={false}
        selectOnFocus
        handleHomeEndKeys
      />
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default UserSelection;
