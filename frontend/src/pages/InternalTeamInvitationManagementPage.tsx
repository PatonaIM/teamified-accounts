import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Snackbar,
  FormHelperText,
} from '@mui/material';
import {
  Add,
  ContentCopy,
  Cancel,
  Refresh,
  Launch,
  Link as LinkIcon,
} from '@mui/icons-material';

interface InternalInvitation {
  id: string;
  inviteCode: string;
  roleType: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: string | null;
  maxUses: number | null;
  currentUses: number;
  createdAt: string;
  invitationUrl?: string;
}

const InternalTeamInvitationManagementPage: React.FC = () => {
  const [invitations, setInvitations] = useState<InternalInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Create invitation form state
  const [createForm, setCreateForm] = useState({
    email: '',
    roleType: 'internal_member',
    maxUses: '1',
  });

  const internalRoleTypes = [
    'super_admin',
    'internal_member',
    'internal_hr',
    'internal_recruiter',
    'internal_account_manager',
    'internal_finance',
    'internal_marketing',
  ];

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/v1/invitations/internal', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch internal invitations');
      }

      const data = await response.json();
      setInvitations(data);
    } catch (err) {
      console.error('Error fetching internal invitations:', err);
      setError('Failed to load internal invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    // Validate email if provided
    if (createForm.email && !/@teamified\.com(\.au)?$/i.test(createForm.email)) {
      showSnackbar('Email must be from @teamified.com or @teamified.com.au domain', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/v1/invitations/internal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          email: createForm.email || undefined,
          roleType: createForm.roleType,
          maxUses: createForm.maxUses ? parseInt(createForm.maxUses) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create invitation');
      }

      showSnackbar('Internal invitation created successfully!', 'success');
      setIsCreateDialogOpen(false);
      setCreateForm({ email: '', roleType: 'internal_member', maxUses: '1' });
      fetchInvitations();
    } catch (err: any) {
      console.error('Error creating internal invitation:', err);
      showSnackbar(err.message || 'Failed to create invitation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateShareableLink = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/v1/invitations/internal/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate shareable link');
      }

      const data = await response.json();
      
      if (data.invitationUrl) {
        navigator.clipboard.writeText(data.invitationUrl);
        showSnackbar('Shareable link generated and copied to clipboard! (1-hour expiration)', 'success');
      } else {
        showSnackbar('Shareable link generated successfully!', 'success');
      }
      
      fetchInvitations();
    } catch (err: any) {
      console.error('Error generating shareable link:', err);
      showSnackbar(err.message || 'Failed to generate shareable link', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }

    try {
      const response = await fetch(`/v1/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel invitation');
      }

      showSnackbar('Invitation cancelled successfully', 'success');
      fetchInvitations();
    } catch (err: any) {
      console.error('Error cancelling invitation:', err);
      showSnackbar(err.message || 'Failed to cancel invitation', 'error');
    }
  };

  const copyInvitationLink = (invitationUrl: string) => {
    navigator.clipboard.writeText(invitationUrl);
    showSnackbar('Invitation link copied to clipboard!', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: string): 'default' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'expired':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return 'No expiration';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRoleType = (roleType: string) => {
    return roleType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading internal invitations...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Internal Team Invitations
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchInvitations}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={handleGenerateShareableLink}
            disabled={isSubmitting}
          >
            Generate Shareable Link
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Invitation
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Internal Team Invitations:</strong> For @teamified.com or @teamified.com.au emails only. 
          Use "Generate Shareable Link" to create a 1-hour link that can be shared without pre-assigning an email.
        </Typography>
      </Alert>

      {/* Invitations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Expires</strong></TableCell>
              <TableCell><strong>Uses</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No internal invitations found. Create one to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow key={invitation.id} hover>
                  <TableCell>{formatRoleType(invitation.roleType)}</TableCell>
                  <TableCell>
                    <Chip
                      label={invitation.status.toUpperCase()}
                      color={getStatusColor(invitation.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                  <TableCell>
                    {invitation.currentUses} / {invitation.maxUses || '∞'}
                  </TableCell>
                  <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      {invitation.invitationUrl && (
                        <Tooltip title="Copy Link">
                          <IconButton
                            size="small"
                            onClick={() => copyInvitationLink(invitation.invitationUrl!)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {invitation.invitationUrl && (
                        <Tooltip title="Open Preview">
                          <IconButton
                            size="small"
                            component="a"
                            href={invitation.invitationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Launch fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {invitation.status === 'pending' && (
                        <Tooltip title="Cancel Invitation">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Invitation Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => !isSubmitting && setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Internal Team Invitation</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Email (optional)"
              type="email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              disabled={isSubmitting}
              helperText="Optional - leave empty to create shareable link. Must be @teamified.com or @teamified.com.au"
              placeholder="user@teamified.com"
            />

            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={createForm.roleType}
                label="Role"
                onChange={(e) =>
                  setCreateForm({ ...createForm, roleType: e.target.value })
                }
                disabled={isSubmitting}
              >
                {internalRoleTypes.map((role) => (
                  <MenuItem key={role} value={role}>
                    {formatRoleType(role)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Internal role to assign to the invited user</FormHelperText>
            </FormControl>

            <TextField
              fullWidth
              label="Max Uses (leave empty for unlimited)"
              type="number"
              value={createForm.maxUses}
              onChange={(e) =>
                setCreateForm({ ...createForm, maxUses: e.target.value })
              }
              disabled={isSubmitting}
              inputProps={{ min: 1 }}
              helperText="How many times this invitation can be used (default: 1)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateInvitation}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Create Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InternalTeamInvitationManagementPage;
