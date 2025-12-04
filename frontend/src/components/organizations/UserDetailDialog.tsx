import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Email,
  Phone,
  Business,
  Badge,
  CalendarToday,
  LockReset,
  PersonRemove,
  PersonOff,
  Block,
  CheckCircle,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import type { OrganizationPermissions } from '../../hooks/useOrganizationPermissions';
import { getRoleColor } from '../../constants/roleMetadata';
import type { OrganizationMember } from '../../services/organizationsService';

const CLIENT_ROLES = [
  { value: 'client_admin', label: 'Admin' },
  { value: 'client_hr', label: 'HR' },
  { value: 'client_finance', label: 'Finance' },
  { value: 'client_recruiter', label: 'Recruiter' },
  { value: 'client_employee', label: 'Employee' },
];

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  member: OrganizationMember | null;
  permissions: OrganizationPermissions;
  organizationName?: string;
  currentUserId?: string;
  onRoleChange?: (userId: string, newRole: string) => Promise<void>;
  onRemoveUser?: (userId: string) => Promise<void>;
  onMarkNLWF?: (userId: string) => Promise<void>;
  onSendPasswordReset?: (userId: string) => Promise<void>;
  onSuspendUser?: (userId: string) => Promise<void>;
  onActivateUser?: (userId: string) => Promise<void>;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
  open,
  onClose,
  member,
  permissions,
  organizationName,
  currentUserId,
  onRoleChange,
  onRemoveUser,
  onMarkNLWF,
  onSendPasswordReset,
  onSuspendUser,
  onActivateUser,
}) => {
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isCurrentUser = member?.userId === currentUserId;
  const isNlwf = member?.status === 'nlwf';
  const isSuspended = member?.status === 'suspended';
  const isInvited = member?.status === 'invited';

  useEffect(() => {
    if (member) {
      setSelectedRole(member.roleType || '');
    }
    setIsEditingRole(false);
    setError(null);
    setSuccess(null);
  }, [member]);

  const handleRoleChange = async () => {
    if (!member || !onRoleChange || selectedRole === member.roleType) {
      setIsEditingRole(false);
      return;
    }

    setActionLoading('role');
    setError(null);
    try {
      await onRoleChange(member.userId, selectedRole);
      setSuccess('Role updated successfully');
      setIsEditingRole(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (action: string, handler?: (userId: string) => Promise<void>) => {
    if (!member || !handler) return;

    setActionLoading(action);
    setError(null);
    try {
      await handler(member.userId);
      setSuccess(`Action completed successfully`);
      if (['remove', 'nlwf'].includes(action)) {
        setTimeout(onClose, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status?: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'invited': return 'info';
      case 'nlwf': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  if (!member) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            User Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            src={member.profilePicture || undefined}
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              filter: isNlwf ? 'grayscale(100%)' : 'none',
            }}
          >
            {member.userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              {member.userName}
              {isCurrentUser && (
                <Chip 
                  label="You" 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1, height: 20 }} 
                />
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={member.roleType?.replace('client_', '').replace('internal_', '')}
                size="small"
                color={getRoleColor(member.roleType)}
                sx={{ textTransform: 'capitalize' }}
              />
              <Chip
                label={member.status || 'Active'}
                size="small"
                color={getStatusColor(member.status)}
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Email sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body2">{member.userEmail}</Typography>
            </Box>
          </Box>

          {organizationName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Business sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Organization
                </Typography>
                <Typography variant="body2">{organizationName}</Typography>
              </Box>
            </Box>
          )}

          {permissions.canViewSensitiveInfo && member.joinedAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarToday sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Joined Organization
                </Typography>
                <Typography variant="body2">{formatDate(member.joinedAt)}</Typography>
              </Box>
            </Box>
          )}
        </Stack>

        {permissions.canChangeRoles && !isCurrentUser && !isNlwf && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Role Management
              </Typography>
              {isEditingRole ? (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      label="Role"
                      disabled={actionLoading === 'role'}
                    >
                      {CLIENT_ROLES.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={actionLoading === 'role' ? <CircularProgress size={16} /> : <Save />}
                    onClick={handleRoleChange}
                    disabled={actionLoading === 'role'}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Cancel />}
                    onClick={() => {
                      setIsEditingRole(false);
                      setSelectedRole(member.roleType || '');
                    }}
                    disabled={actionLoading === 'role'}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => setIsEditingRole(true)}
                >
                  Change Role
                </Button>
              )}
            </Box>
          </>
        )}

        {(permissions.canRemoveUsers || permissions.canMarkNLWF || permissions.canSendPasswordReset || permissions.canSuspendUser) && !isCurrentUser && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                User Actions
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {permissions.canSendPasswordReset && onSendPasswordReset && !isNlwf && !isInvited && (
                  <Tooltip title="Send password reset email to user">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={actionLoading === 'password' ? <CircularProgress size={16} /> : <LockReset />}
                      onClick={() => handleAction('password', onSendPasswordReset)}
                      disabled={!!actionLoading}
                    >
                      Reset Password
                    </Button>
                  </Tooltip>
                )}

                {permissions.canSuspendUser && onSuspendUser && onActivateUser && !isNlwf && !isInvited && (
                  isSuspended ? (
                    <Tooltip title="Reactivate this user account">
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        startIcon={actionLoading === 'activate' ? <CircularProgress size={16} /> : <CheckCircle />}
                        onClick={() => handleAction('activate', onActivateUser)}
                        disabled={!!actionLoading}
                      >
                        Activate User
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Temporarily disable this user account">
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        startIcon={actionLoading === 'suspend' ? <CircularProgress size={16} /> : <Block />}
                        onClick={() => handleAction('suspend', onSuspendUser)}
                        disabled={!!actionLoading}
                      >
                        Suspend User
                      </Button>
                    </Tooltip>
                  )
                )}

                {permissions.canMarkNLWF && onMarkNLWF && !isNlwf && (
                  <Tooltip title="Mark user as No Longer With Firm">
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      startIcon={actionLoading === 'nlwf' ? <CircularProgress size={16} /> : <PersonOff />}
                      onClick={() => handleAction('nlwf', onMarkNLWF)}
                      disabled={!!actionLoading}
                    >
                      Mark as NLWF
                    </Button>
                  </Tooltip>
                )}

                {permissions.canRemoveUsers && onRemoveUser && (
                  <Tooltip title="Remove user from this organization">
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={actionLoading === 'remove' ? <CircularProgress size={16} /> : <PersonRemove />}
                      onClick={() => handleAction('remove', onRemoveUser)}
                      disabled={!!actionLoading}
                    >
                      Remove User
                    </Button>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailDialog;
