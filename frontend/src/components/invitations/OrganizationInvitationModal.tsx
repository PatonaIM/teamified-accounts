import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
  Paper,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface OrganizationInvitationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  organizationName: string;
  subscriptionTier?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const clientRoles = [
  { value: 'client_admin', label: 'Admin', description: 'Full access to organization management' },
  { value: 'client_hr', label: 'HR', description: 'Manage users and HR functions' },
  { value: 'client_finance', label: 'Finance', description: 'Manage financial operations' },
  { value: 'client_recruiter', label: 'Recruiter', description: 'Manage recruitment processes' },
  { value: 'client_employee', label: 'Employee', description: 'Standard user access' },
];

const internalRoles = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full system access and control' },
  { value: 'internal_hr', label: 'Internal HR', description: 'Internal HR operations' },
  { value: 'internal_finance', label: 'Internal Finance', description: 'Internal finance operations' },
  { value: 'internal_account_manager', label: 'Account Manager', description: 'Manage client accounts' },
  { value: 'internal_recruiter', label: 'Internal Recruiter', description: 'Internal recruitment' },
  { value: 'internal_marketing', label: 'Internal Marketing', description: 'Internal marketing operations' },
  { value: 'internal_member', label: 'Internal Employee', description: 'Standard internal team member' },
];

const OrganizationInvitationModal: React.FC<OrganizationInvitationModalProps> = ({
  open,
  onClose,
  onSuccess,
  organizationId,
  organizationName,
  subscriptionTier,
}) => {
  // Determine which roles to show based on organization type
  const isInternal = subscriptionTier === 'internal';
  const availableRoles = isInternal ? internalRoles : clientRoles;
  const [emails, setEmails] = useState('');
  const [emailRoleType, setEmailRoleType] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResults, setEmailResults] = useState<{ successful: string[]; failed: { email: string; error: string }[] } | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const [linkRoleType, setLinkRoleType] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const parseEmails = (input: string): string[] => {
    return input
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0);
  };

  const handleEmailSubmit = async () => {
    setEmailError(null);
    setEmailResults(null);

    if (!emails.trim()) {
      setEmailError('Please enter at least one email address');
      return;
    }

    const emailList = parseEmails(emails);
    
    if (emailList.length === 0) {
      setEmailError('Please enter at least one valid email address');
      return;
    }

    const invalidEmails = emailList.filter(e => !validateEmail(e));
    if (invalidEmails.length > 0) {
      setEmailError(`Invalid email address${invalidEmails.length > 1 ? 'es' : ''}: ${invalidEmails.join(', ')}`);
      return;
    }

    if (!emailRoleType) {
      setEmailError('Please select a role');
      return;
    }

    setEmailLoading(true);

    const successful: string[] = [];
    const failed: { email: string; error: string }[] = [];

    try {
      const token = localStorage.getItem('teamified_access_token');
      
      for (const email of emailList) {
        try {
          await axios.post(
            `${API_BASE_URL}/v1/invitations/send-email`,
            {
              email,
              organizationId,
              roleType: emailRoleType,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          successful.push(email);
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to send';
          failed.push({ email, error: errorMessage });
        }
      }

      setEmailResults({ successful, failed });
      
      if (successful.length > 0) {
        onSuccess(); // Refresh member list immediately
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setLinkError(null);

    if (!linkRoleType) {
      setLinkError('Please select a role');
      return;
    }

    setLinkLoading(true);

    try {
      const token = localStorage.getItem('teamified_access_token');
      const response = await axios.post(
        `${API_BASE_URL}/v1/invitations/generate-link`,
        {
          organizationId,
          roleType: linkRoleType,
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
      setShareableLink(link);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to generate link';
      setLinkError(errorMessage);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleCopyShareableLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setEmails('');
    setEmailRoleType('');
    setEmailError(null);
    setEmailResults(null);
    setLinkRoleType('');
    setLinkError(null);
    setShareableLink(null);
    setLinkCopied(false);
    onClose();
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
                Invite User to {organizationName}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4, pt: 4 }}>
        <Box>
          {/* Section 1: Send Email Invitation */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
              Send Email Invitation
            </Typography>

            {emailResults ? (
              <Box>
                {emailResults.successful.length > 0 && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ✓ {emailResults.successful.length} invitation{emailResults.successful.length > 1 ? 's' : ''} sent successfully
                    </Typography>
                    <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                      {emailResults.successful.join(', ')}
                    </Typography>
                    <Typography variant="caption">
                      Assigned role: <strong>{availableRoles.find(r => r.value === emailRoleType)?.label}</strong> • Expires in 7 days
                    </Typography>
                  </Alert>
                )}
                
                {emailResults.failed.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {emailResults.failed.length} invitation{emailResults.failed.length > 1 ? 's' : ''} failed
                    </Typography>
                    {emailResults.failed.map((f, i) => (
                      <Typography key={i} variant="caption" component="div">
                        {f.email}: {f.error}
                      </Typography>
                    ))}
                  </Alert>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setEmailResults(null);
                    setEmails('');
                  }}
                  sx={{ mt: 1 }}
                >
                  Send More Invitations
                </Button>
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
                  label="Email Addresses"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="user1@example.com, user2@example.com"
                  sx={{ mb: 2 }}
                  helperText="Separate multiple emails with commas"
                  disabled={emailLoading}
                  multiline
                  minRows={2}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={emailRoleType}
                    label="Role"
                    onChange={(e) => setEmailRoleType(e.target.value)}
                    disabled={emailLoading}
                  >
                    {availableRoles.map((role) => (
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

                <Button
                  variant="contained"
                  onClick={handleEmailSubmit}
                  disabled={!emails.trim() || !emailRoleType || emailLoading}
                  startIcon={emailLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  fullWidth
                  sx={{
                    bgcolor: '#4CAF50',
                    '&:hover': {
                      bgcolor: '#45a049',
                    },
                  }}
                >
                  {emailLoading ? 'Sending...' : `Send Invitation${parseEmails(emails).length > 1 ? 's' : ''}`}
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
              Anyone with the link can join this organization. Select a role first.
            </Typography>

            {linkError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLinkError(null)}>
                {linkError}
              </Alert>
            )}

            {shareableLink ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ✓ Shareable link generated
                  </Typography>
                  <Typography variant="caption">
                    Single-use • Expires in 7 days • Assigns <strong>{availableRoles.find(r => r.value === linkRoleType)?.label}</strong> role
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
                    startIcon={linkCopied ? <CheckIcon /> : <CopyIcon />}
                    onClick={handleCopyShareableLink}
                    color={linkCopied ? 'success' : 'primary'}
                    fullWidth
                    sx={{
                      bgcolor: linkCopied ? '#4CAF50' : '#2196F3',
                      '&:hover': {
                        bgcolor: linkCopied ? '#45a049' : '#1976D2',
                      },
                    }}
                  >
                    {linkCopied ? 'Copied!' : 'Copy Link'}
                  </Button>
                </Paper>
              </Box>
            ) : (
              <Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={linkRoleType}
                    label="Role"
                    onChange={(e) => setLinkRoleType(e.target.value)}
                    disabled={linkLoading}
                  >
                    {availableRoles.map((role) => (
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

                <Button
                  variant="outlined"
                  onClick={handleGenerateLink}
                  disabled={!linkRoleType || linkLoading}
                  startIcon={linkLoading ? <CircularProgress size={20} /> : <LinkIcon />}
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
                  {linkLoading ? 'Generating...' : 'Copy Invitation Link'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationInvitationModal;
