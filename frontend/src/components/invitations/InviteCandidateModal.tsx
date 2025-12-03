import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Email,
  Link as LinkIcon,
  ContentCopy,
  Close,
  PersonAdd,
  Check,
} from '@mui/icons-material';
import organizationsService from '../../services/organizationsService';
import type { Organization } from '../../services/organizationsService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invite-tabpanel-${index}`}
      aria-labelledby={`invite-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface InviteCandidateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const InviteCandidateModal: React.FC<InviteCandidateModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailForm, setEmailForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    organizationId: '',
  });

  const [linkForm, setLinkForm] = useState({
    organizationId: '',
    maxUses: '10',
  });

  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (open) {
      loadOrganizations();
      resetForms();
    }
  }, [open]);

  const loadOrganizations = async () => {
    try {
      const response = await organizationsService.getAll({ limit: 100 });
      setOrganizations(response.organizations || []);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  };

  const resetForms = () => {
    setEmailForm({ email: '', firstName: '', lastName: '', organizationId: '' });
    setLinkForm({ organizationId: '', maxUses: '10' });
    setGeneratedLink(null);
    setLinkCopied(false);
    setError(null);
    setActiveTab(0);
  };

  const handleSendEmail = async () => {
    if (!emailForm.email) {
      setError('Email address is required');
      return;
    }
    if (!emailForm.organizationId) {
      setError('Please select an organization');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('teamified_access_token');
      const response = await fetch('/api/v1/invitations/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organizationId: emailForm.organizationId,
          email: emailForm.email,
          firstName: emailForm.firstName || undefined,
          lastName: emailForm.lastName || undefined,
          roleType: 'candidate',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send invitation email');
      }

      onSuccess(`Invitation email sent to ${emailForm.email}`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!linkForm.organizationId) {
      setError('Please select an organization');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('teamified_access_token');
      const response = await fetch('/api/v1/invitations/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organizationId: linkForm.organizationId,
          roleType: 'candidate',
          maxUses: parseInt(linkForm.maxUses) || 10,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate invitation link');
      }

      const data = await response.json();
      setGeneratedLink(data.invitationUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to generate invitation link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForms();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonAdd sx={{ color: 'success.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Invite Candidate
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={isLoading} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => {
            setActiveTab(newValue);
            setError(null);
            setGeneratedLink(null);
          }}
          sx={{ px: 3 }}
        >
          <Tab icon={<Email sx={{ fontSize: 18 }} />} iconPosition="start" label="Send Email" />
          <Tab icon={<LinkIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Generate Link" />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
            {error}
          </Alert>
        )}

        <TabPanel value={activeTab} index={0}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Send a personalized email invitation to a candidate. They will receive a link to sign up
            and join the selected organization.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              required
              value={emailForm.email}
              onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
              placeholder="candidate@example.com"
              disabled={isLoading}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name (Optional)"
                value={emailForm.firstName}
                onChange={(e) => setEmailForm({ ...emailForm, firstName: e.target.value })}
                placeholder="John"
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Last Name (Optional)"
                value={emailForm.lastName}
                onChange={(e) => setEmailForm({ ...emailForm, lastName: e.target.value })}
                placeholder="Doe"
                disabled={isLoading}
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Organization</InputLabel>
              <Select
                value={emailForm.organizationId}
                label="Organization"
                onChange={(e) => setEmailForm({ ...emailForm, organizationId: e.target.value })}
                disabled={isLoading}
              >
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate a shareable link that can be used by multiple candidates to sign up. The link
            will expire after 7 days or when the maximum uses are reached.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth required>
              <InputLabel>Organization</InputLabel>
              <Select
                value={linkForm.organizationId}
                label="Organization"
                onChange={(e) => {
                  setLinkForm({ ...linkForm, organizationId: e.target.value });
                  setGeneratedLink(null);
                }}
                disabled={isLoading}
              >
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Maximum Uses"
              type="number"
              value={linkForm.maxUses}
              onChange={(e) => setLinkForm({ ...linkForm, maxUses: e.target.value })}
              helperText="How many times this link can be used"
              disabled={isLoading}
              inputProps={{ min: 1, max: 100 }}
            />

            {generatedLink && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Generated Link:
                </Typography>
                <TextField
                  fullWidth
                  value={generatedLink}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={linkCopied ? 'Copied!' : 'Copy to clipboard'}>
                          <IconButton onClick={handleCopyLink} edge="end">
                            {linkCopied ? (
                              <Check sx={{ color: 'success.main' }} />
                            ) : (
                              <ContentCopy />
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                    sx: {
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      bgcolor: 'action.hover',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  This link expires in 7 days and can be used up to {linkForm.maxUses} times.
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        {activeTab === 0 ? (
          <Button
            variant="contained"
            onClick={handleSendEmail}
            disabled={isLoading || !emailForm.email || !emailForm.organizationId}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Email />}
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
          >
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        ) : generatedLink ? (
          <Button
            variant="contained"
            onClick={() => {
              handleCopyLink();
              onSuccess('Invitation link copied to clipboard!');
              onClose();
            }}
            startIcon={<ContentCopy />}
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
          >
            Copy & Close
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleGenerateLink}
            disabled={isLoading || !linkForm.organizationId}
            startIcon={isLoading ? <CircularProgress size={20} /> : <LinkIcon />}
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
          >
            {isLoading ? 'Generating...' : 'Generate Link'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InviteCandidateModal;
