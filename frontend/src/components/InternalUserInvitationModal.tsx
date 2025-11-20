import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { Close, ContentCopy, CheckCircle, Link as LinkIcon, Warning } from '@mui/icons-material';
import internalInvitationService from '../services/internalInvitationService';

interface InternalUserInvitationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const INTERNAL_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'internal_member', label: 'Internal Member' },
  { value: 'internal_hr', label: 'Internal HR' },
  { value: 'internal_finance', label: 'Internal Finance' },
  { value: 'internal_account_manager', label: 'Internal Account Manager' },
  { value: 'internal_recruiter', label: 'Internal Recruiter' },
  { value: 'internal_marketing', label: 'Internal Marketing' },
];

const InternalUserInvitationModal: React.FC<InternalUserInvitationModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  // Email invitation state
  const [email, setEmail] = useState('');
  const [roleType, setRoleType] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailInvitationUrl, setEmailInvitationUrl] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  // Shareable link state
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [shareableLinkLoading, setShareableLinkLoading] = useState(false);
  const [shareableLinkError, setShareableLinkError] = useState<string | null>(null);
  const [shareableCopied, setShareableCopied] = useState(false);
  const [linkExpiresAt, setLinkExpiresAt] = useState<string | null>(null);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingInvitationEmail, setPendingInvitationEmail] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    
    const domain = email.split('@')[1];
    return domain === 'teamified.com' || domain === 'teamified.com.au';
  };

  const handleEmailSubmit = async (force: boolean = false) => {
    setEmailError(null);

    if (!email) {
      setEmailError('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Email must be from @teamified.com or @teamified.com.au domain');
      return;
    }

    if (!roleType) {
      setEmailError('Please select a role');
      return;
    }

    setEmailLoading(true);

    try {
      const response = await internalInvitationService.createInvitation({
        email,
        roleType,
        maxUses: 1,
        force,
      });

      setEmailInvitationUrl(response.invitationUrl);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Check if this is a pending invitation conflict
      if (err.response?.data?.code === 'PENDING_INVITATION_EXISTS') {
        setPendingInvitationEmail(email);
        setShowConfirmDialog(true);
      } else {
        setEmailError(err.response?.data?.message || 'Failed to send invitation');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleConfirmResend = async () => {
    setShowConfirmDialog(false);
    await handleEmailSubmit(true); // Force resend with force=true
  };

  const handleCancelResend = () => {
    setShowConfirmDialog(false);
    setPendingInvitationEmail(null);
  };

  const handleGenerateShareableLink = async () => {
    setShareableLinkError(null);
    setShareableLinkLoading(true);

    try {
      const response = await internalInvitationService.generateShareableLink();
      setShareableLink(response.invitationUrl);
      setLinkExpiresAt(response.expiresAt);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setShareableLinkError(err.response?.data?.message || 'Failed to generate link');
    } finally {
      setShareableLinkLoading(false);
    }
  };

  const handleCopyEmailLink = () => {
    if (emailInvitationUrl) {
      navigator.clipboard.writeText(emailInvitationUrl);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const handleCopyShareableLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      setShareableCopied(true);
      setTimeout(() => setShareableCopied(false), 2000);
    }
  };

  const formatExpiryTime = (expiresAt: string) => {
    const date = new Date(expiresAt);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    return `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) > 1 ? 's' : ''}`;
  };

  const handleClose = () => {
    setEmail('');
    setRoleType('');
    setEmailError(null);
    setEmailInvitationUrl(null);
    setEmailCopied(false);
    setShareableLink(null);
    setShareableLinkError(null);
    setShareableCopied(false);
    setLinkExpiresAt(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Invite Internal User
          <IconButton edge="end" onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Section 1: Send Email Invitation */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Send Email Invitation
            </Typography>

            {emailInvitationUrl ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ✓ Invitation email sent to {email}
                  </Typography>
                  <Typography variant="caption">
                    Assigned role: <strong>{INTERNAL_ROLES.find(r => r.value === roleType)?.label}</strong> • Expires in 7 days
                  </Typography>
                </Alert>

                <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                  You can also share this link manually:
                </Typography>
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: 'grey.100',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        color: '#1a1a1a',
                        fontWeight: 500,
                      }}
                    >
                      {emailInvitationUrl}
                    </Typography>
                    <IconButton
                      onClick={handleCopyEmailLink}
                      color={emailCopied ? 'success' : 'primary'}
                      size="small"
                    >
                      {emailCopied ? <CheckCircle /> : <ContentCopy />}
                    </IconButton>
                  </Box>
                </Paper>
              </Box>
            ) : (
              <Box>
                {emailError && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setEmailError(null)}>
                    {emailError}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@teamified.com"
                  sx={{ mb: 2 }}
                  helperText="Must be @teamified.com or @teamified.com.au"
                  error={email.length > 0 && !validateEmail(email)}
                  disabled={emailLoading}
                />

                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Internal Role</InputLabel>
                  <Select
                    value={roleType}
                    label="Internal Role"
                    onChange={(e) => setRoleType(e.target.value)}
                    disabled={emailLoading}
                  >
                    {INTERNAL_ROLES.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  onClick={() => handleEmailSubmit()}
                  disabled={!email || !roleType || emailLoading || (email.length > 0 && !validateEmail(email))}
                  startIcon={emailLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  fullWidth
                  sx={{
                    bgcolor: '#4CAF50',
                    '&:hover': {
                      bgcolor: '#45a049',
                    },
                  }}
                >
                  {emailLoading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Section 2: Generate Shareable Link */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Invite Using a Shareable Link
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Anyone with the link can join Teamified's Internal Team as a member.
            </Typography>

            {shareableLinkError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setShareableLinkError(null)}>
                {shareableLinkError}
              </Alert>
            )}

            {shareableLink ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ✓ Shareable link generated
                  </Typography>
                  <Typography variant="caption">
                    Single-use • Expires in {linkExpiresAt ? formatExpiryTime(linkExpiresAt) : '1 hour'} • Assigns <strong>Internal Member</strong> role
                  </Typography>
                </Alert>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#e8f5e9',
                    border: '1px solid',
                    borderColor: '#4CAF50',
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        color: '#1a1a1a',
                        fontWeight: 500,
                      }}
                    >
                      {shareableLink}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={shareableCopied ? <CheckCircle /> : <ContentCopy />}
                    onClick={handleCopyShareableLink}
                    color={shareableCopied ? 'success' : 'primary'}
                    fullWidth
                    sx={{
                      bgcolor: shareableCopied ? '#4CAF50' : '#2196F3',
                      '&:hover': {
                        bgcolor: shareableCopied ? '#45a049' : '#1976D2',
                      },
                    }}
                  >
                    {shareableCopied ? 'Copied!' : 'Copy Link'}
                  </Button>
                </Paper>

                <Alert severity="info" icon={false}>
                  <Typography variant="caption">
                    <strong>⏱️ Important:</strong> This link expires in {linkExpiresAt ? formatExpiryTime(linkExpiresAt) : '1 hour'}. 
                    New members will need to use an approved @teamified.com email and can be promoted to other roles later.
                  </Typography>
                </Alert>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={handleGenerateShareableLink}
                disabled={shareableLinkLoading}
                startIcon={shareableLinkLoading ? <CircularProgress size={20} /> : <LinkIcon />}
                fullWidth
                sx={{
                  borderColor: '#2196F3',
                  color: '#2196F3',
                  '&:hover': {
                    borderColor: '#1976D2',
                    bgcolor: 'rgba(33, 150, 243, 0.04)',
                  },
                }}
              >
                {shareableLinkLoading ? 'Generating...' : 'Copy Invitation Link'}
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>

      {/* Confirmation Dialog for Resending Invitation */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelResend}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'warning.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Warning sx={{ color: 'warning.dark' }} />
          </Box>
          Pending Invitation Exists
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            A pending invitation already exists for <strong>{pendingInvitationEmail}</strong>.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Would you like to cancel the previous invitation and send a new one? 
            The old invitation link will no longer work.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button 
            onClick={handleCancelResend} 
            variant="outlined"
            sx={{ flex: 1 }}
          >
            Keep Existing
          </Button>
          <Button
            onClick={handleConfirmResend}
            variant="contained"
            color="warning"
            sx={{ flex: 1 }}
          >
            Send New Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default InternalUserInvitationModal;
