import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
  Stack,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Add, Delete, ContentCopy } from '@mui/icons-material';
import { oauthClientsService, type OAuthClient, type CreateOAuthClientDto } from '../../services/oauthClientsService';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client: OAuthClient | null;
}

const OAuthClientDialog: React.FC<Props> = ({ open, onClose, onSuccess, client }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [environment, setEnvironment] = useState<'development' | 'staging' | 'production'>('development');
  const [defaultIntent, setDefaultIntent] = useState<'client' | 'candidate' | 'both'>('both');
  const [redirectUris, setRedirectUris] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [createdClient, setCreatedClient] = useState<OAuthClient | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (client) {
      setName(client.name);
      setDescription(client.description || '');
      setAppUrl(client.metadata?.app_url || '');
      setOwner(client.metadata?.owner || '');
      setEnvironment(client.metadata?.environment || 'development');
      setDefaultIntent(client.default_intent || 'both');
      setRedirectUris(client.redirect_uris.length > 0 ? client.redirect_uris : ['']);
    } else {
      resetForm();
    }
  }, [client, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setAppUrl('');
    setOwner('');
    setEnvironment('development');
    setDefaultIntent('both');
    setRedirectUris(['']);
    setCreatedClient(null);
  };

  const handleAddRedirectUri = () => {
    setRedirectUris([...redirectUris, '']);
  };

  const handleRemoveRedirectUri = (index: number) => {
    setRedirectUris(redirectUris.filter((_, i) => i !== index));
  };

  const handleRedirectUriChange = (index: number, value: string) => {
    const newUris = [...redirectUris];
    newUris[index] = value;
    setRedirectUris(newUris);
  };

  const handleSubmit = async () => {
    const filteredUris = redirectUris.filter(uri => uri.trim() !== '');
    
    if (filteredUris.length === 0) {
      showSnackbar('At least one redirect URI is required', 'error');
      return;
    }

    const data: CreateOAuthClientDto = {
      name,
      description: description || undefined,
      redirect_uris: filteredUris,
      default_intent: defaultIntent,
      app_url: appUrl || undefined,
      owner: owner || undefined,
      environment,
    };

    try {
      setLoading(true);
      if (client) {
        await oauthClientsService.update(client.id, data);
        showSnackbar('OAuth client updated successfully', 'success');
        onSuccess();
        onClose();
      } else {
        const created = await oauthClientsService.create(data);
        setCreatedClient(created);
        showSnackbar('OAuth client created successfully!', 'success');
      }
    } catch (error) {
      showSnackbar('Failed to save OAuth client', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`${label} copied to clipboard`, 'success');
  };

  const handleClose = () => {
    if (createdClient) {
      onSuccess();
    }
    onClose();
    setTimeout(resetForm, 300);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {createdClient ? 'Application Credentials' : client ? 'Edit Application' : 'Add Application'}
      </DialogTitle>
      
      <DialogContent dividers>
        {createdClient ? (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Save these credentials now!
              </Typography>
              <Typography variant="body2">
                The Client Secret will not be shown again. Store it securely in your app's environment variables (Replit Secrets).
              </Typography>
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Client ID
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  value={createdClient.client_id}
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(createdClient.client_id, 'Client ID')}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Client Secret
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  value={createdClient.client_secret}
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(createdClient.client_secret, 'Client Secret')}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Next steps:
              </Typography>
              <Typography variant="body2" component="div">
                1. Copy both Client ID and Secret
                <br />
                2. Add them to your app's Replit Secrets
                <br />
                3. Update your app to use these credentials during token exchange
                <br />
                4. Test the SSO flow
              </Typography>
            </Alert>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Application Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              placeholder="e.g., Job Application Portal"
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Brief description of the application"
            />

            <TextField
              label="Application URL"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              fullWidth
              placeholder="https://app.teamified.com"
            />

            <TextField
              label="Owner/Team"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              fullWidth
              placeholder="Engineering Team"
            />

            <TextField
              select
              label="Environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as any)}
              required
              fullWidth
            >
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="staging">Staging</MenuItem>
              <MenuItem value="production">Production</MenuItem>
            </TextField>

            <TextField
              select
              label="Default Intent (User Audience)"
              value={defaultIntent}
              onChange={(e) => setDefaultIntent(e.target.value as any)}
              required
              fullWidth
              helperText="Controls which user types can access this application. This is authoritative and cannot be escalated via query parameters."
            >
              <MenuItem value="both">Both (Clients & Candidates)</MenuItem>
              <MenuItem value="client">Client Only</MenuItem>
              <MenuItem value="candidate">Candidate Only</MenuItem>
            </TextField>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Redirect URIs</Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={handleAddRedirectUri}
                >
                  Add URI
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                OAuth callback URLs where users will be redirected after authentication
              </Typography>
              
              <Stack spacing={2}>
                {redirectUris.map((uri, index) => (
                  <TextField
                    key={index}
                    value={uri}
                    onChange={(e) => handleRedirectUriChange(index, e.target.value)}
                    placeholder="https://app.teamified.com/auth/callback"
                    fullWidth
                    InputProps={{
                      endAdornment: redirectUris.length > 1 && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveRedirectUri(index)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          {createdClient ? 'Close' : 'Cancel'}
        </Button>
        {!createdClient && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !name}
          >
            {client ? 'Update' : 'Create'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OAuthClientDialog;
