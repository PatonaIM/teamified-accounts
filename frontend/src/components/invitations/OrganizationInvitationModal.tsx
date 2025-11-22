import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface OrganizationInvitationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  organizationName: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const clientRoles = [
  { value: 'client_admin', label: 'Admin', description: 'Full access to organization management' },
  { value: 'client_hr', label: 'HR', description: 'Manage users and HR functions' },
  { value: 'client_finance', label: 'Finance', description: 'Manage financial operations' },
  { value: 'client_recruiter', label: 'Recruiter', description: 'Manage recruitment processes' },
  { value: 'client_employee', label: 'Employee', description: 'Standard user access' },
];

const OrganizationInvitationModal: React.FC<OrganizationInvitationModalProps> = ({
  open,
  onClose,
  onSuccess,
  organizationId,
  organizationName,
}) => {
  const [roleType, setRoleType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [invitationCreated, setInvitationCreated] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!roleType) {
      setError('Please select a role');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('teamified_access_token');
      const response = await axios.post(
        `${API_BASE_URL}/v1/invitations`,
        {
          organizationId,
          roleType,
          maxUses: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const inviteCode = response.data.inviteCode;
      const link = `${window.location.origin}/invite/${inviteCode}`;
      setInvitationLink(link);
      setInvitationCreated(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to create invitation';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (!isLoading) {
      setRoleType('');
      setError(null);
      setInvitationCreated(false);
      setInvitationLink('');
      setCopied(false);
      onClose();
      if (invitationCreated) {
        onSuccess();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.primary.main, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonAddIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Invite User to Organization
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {organizationName}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1, color: 'text.secondary' }}
            disabled={isLoading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4, pt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {!invitationCreated ? (
          <>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                Create an invitation link for a user to join this organization. The user account
                will be created when they accept the invitation.
              </Typography>
            </Alert>

            <FormControl fullWidth>
              <InputLabel id="role-select-label">User Role *</InputLabel>
              <Select
                labelId="role-select-label"
                value={roleType}
                onChange={(e) => {
                  setRoleType(e.target.value);
                  setError(null);
                }}
                label="User Role *"
                disabled={isLoading}
              >
                {clientRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box>
                      <Typography variant="body1">{role.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {role.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        ) : (
          <>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Invitation created successfully!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Share this link with the person you want to invite. They will create their account
                when accepting the invitation.
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="Invitation Link"
              value={invitationLink}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopyLink} edge="end" color="primary">
                      {copied ? <CheckIcon /> : <CopyIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Typography variant="caption" color="text.secondary">
              This link can be used once and will expire in 7 days.
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3 }}>
        {!invitationCreated ? (
          <>
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!roleType || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': { bgcolor: '#45a049' },
              }}
            >
              {isLoading ? 'Creating...' : 'Create Invitation'}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#45a049' },
            }}
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OrganizationInvitationModal;
