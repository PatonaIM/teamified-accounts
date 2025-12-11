import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Verified as VerifiedIcon,
  Email as EmailIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import userEmailsService from '../../services/userEmailsService';
import type { UserEmail, AddEmailDto } from '../../services/userEmailsService';

interface LinkedEmailsProps {
  onEmailsUpdated?: () => void;
  initialEmails?: UserEmail[];
}

export function LinkedEmails({ onEmailsUpdated, initialEmails }: LinkedEmailsProps) {
  const [emails, setEmails] = useState<UserEmail[]>(initialEmails || []);
  const [loading, setLoading] = useState(!initialEmails);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userEmailsService.getMyEmails();
      setEmails(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load linked emails';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialEmails) {
      loadEmails();
    }
  }, [loadEmails, initialEmails]);

  const handleAddEmail = async () => {
    if (!newEmail.trim()) return;
    
    try {
      setSubmitting(true);
      setError(null);
      const dto: AddEmailDto = {
        email: newEmail.trim(),
        emailType: 'personal',
      };
      await userEmailsService.addEmail(dto);
      setSuccess('Email added successfully. Please check your inbox for verification.');
      setNewEmail('');
      setDialogOpen(false);
      await loadEmails();
      onEmailsUpdated?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add email';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveEmail = async (emailId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) return;
    
    try {
      setError(null);
      await userEmailsService.removeEmail(emailId);
      setSuccess('Email removed successfully');
      await loadEmails();
      onEmailsUpdated?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove email';
      setError(errorMessage);
    }
  };

  const handleSetPrimary = async (emailId: string) => {
    try {
      setError(null);
      await userEmailsService.setPrimaryEmail(emailId);
      setSuccess('Primary email updated successfully');
      await loadEmails();
      onEmailsUpdated?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set primary email';
      setError(errorMessage);
    }
  };

  const handleResendVerification = async (emailId: string) => {
    try {
      setError(null);
      await userEmailsService.resendVerification(emailId);
      setSuccess('Verification email sent successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification email';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Linked Email Addresses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          size="small"
        >
          Add Email
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        You can log in with any of your linked email addresses using the same password.
      </Typography>

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

      <List>
        {emails.map((email) => (
          <ListItem
            key={email.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
              bgcolor: email.isPrimary ? 'action.selected' : 'background.paper',
            }}
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  {email.email}
                  {email.isPrimary && (
                    <Chip
                      label="Primary"
                      size="small"
                      color="primary"
                      icon={<StarIcon />}
                    />
                  )}
                  {email.isVerified ? (
                    <Chip
                      label="Verified"
                      size="small"
                      color="success"
                      icon={<VerifiedIcon />}
                    />
                  ) : (
                    <Chip label="Unverified" size="small" color="warning" />
                  )}
                  <Chip
                    label={email.emailType === 'work' ? 'Work' : 'Personal'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                email.organization
                  ? `Organization: ${email.organization.name}`
                  : `Added: ${new Date(email.addedAt).toLocaleDateString()}`
              }
            />
            <ListItemSecondaryAction>
              {!email.isVerified && (
                <Tooltip title="Resend verification email">
                  <IconButton
                    edge="end"
                    onClick={() => handleResendVerification(email.id)}
                    size="small"
                  >
                    <SendIcon />
                  </IconButton>
                </Tooltip>
              )}
              {!email.isPrimary && email.isVerified && (
                <Tooltip title="Set as primary email">
                  <IconButton
                    edge="end"
                    onClick={() => handleSetPrimary(email.id)}
                    size="small"
                  >
                    <StarBorderIcon />
                  </IconButton>
                </Tooltip>
              )}
              {!email.isPrimary && (
                <Tooltip title="Remove email">
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveEmail(email.id, email.email)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {emails.length === 0 && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No linked emails found. Add an email to get started.
        </Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Email Address</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              sx={{ mb: 2 }}
              autoFocus
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              A verification email will be sent to the new address. You must verify the email before it can be used for login.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddEmail}
            variant="contained"
            disabled={!newEmail.trim() || submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Add Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default LinkedEmails;
