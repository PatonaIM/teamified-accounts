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
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Add, Delete, ContentCopy, Edit, Check } from '@mui/icons-material';
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
  const [environment, setEnvironment] = useState<'development' | 'staging' | 'production'>('development');
  const [defaultIntent, setDefaultIntent] = useState<'client' | 'candidate' | 'both'>('both');
  const [redirectUris, setRedirectUris] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [createdClient, setCreatedClient] = useState<OAuthClient | null>(null);
  const [uriToDeleteIndex, setUriToDeleteIndex] = useState<number | null>(null);
  const [showUriDeleteDialog, setShowUriDeleteDialog] = useState(false);
  const [editingUriIndex, setEditingUriIndex] = useState<number | null>(null);
  const [editingUriValue, setEditingUriValue] = useState('');
  const [originalRedirectUris, setOriginalRedirectUris] = useState<string[]>([]);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (client) {
      setName(client.name);
      setDescription(client.description || '');
      setEnvironment(client.metadata?.environment || 'development');
      setDefaultIntent(client.default_intent || 'both');
      setRedirectUris(client.redirect_uris.length > 0 ? client.redirect_uris : ['']);
      setOriginalRedirectUris([...client.redirect_uris]);
    } else {
      resetForm();
    }
  }, [client, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEnvironment('development');
    setDefaultIntent('both');
    setRedirectUris(['']);
    setCreatedClient(null);
    setOriginalRedirectUris([]);
  };

  const isUriModified = (uri: string, index: number): boolean => {
    if (!client) return false;
    const originalUri = originalRedirectUris[index];
    if (originalUri === undefined) return true;
    return uri !== originalUri;
  };

  const isNewUri = (index: number): boolean => {
    if (!client) return false;
    return index >= originalRedirectUris.length;
  };

  const handleAddRedirectUri = () => {
    setRedirectUris([...redirectUris, '']);
  };

  const handleRemoveRedirectUri = (index: number) => {
    setUriToDeleteIndex(index);
    setShowUriDeleteDialog(true);
  };

  const handleConfirmUriDelete = () => {
    if (uriToDeleteIndex !== null) {
      setRedirectUris(redirectUris.filter((_, i) => i !== uriToDeleteIndex));
    }
    setShowUriDeleteDialog(false);
    setUriToDeleteIndex(null);
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
    <>
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
              
              <Stack spacing={1}>
                {redirectUris.map((uri, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      bgcolor: isNewUri(index) 
                        ? 'rgba(76, 175, 80, 0.08)' 
                        : isUriModified(uri, index) 
                          ? 'rgba(255, 152, 0, 0.08)' 
                          : 'action.hover',
                      borderRadius: 1,
                      border: isNewUri(index) 
                        ? '1px solid rgba(76, 175, 80, 0.3)' 
                        : isUriModified(uri, index) 
                          ? '1px solid rgba(255, 152, 0, 0.3)' 
                          : '1px solid transparent',
                    }}
                  >
                    {editingUriIndex === index ? (
                      <TextField
                        value={editingUriValue}
                        onChange={(e) => setEditingUriValue(e.target.value)}
                        size="small"
                        fullWidth
                        autoFocus
                        placeholder="https://app.teamified.com/auth/callback"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleRedirectUriChange(index, editingUriValue);
                            setEditingUriIndex(null);
                            setEditingUriValue('');
                          }
                        }}
                        sx={{
                          flex: 1,
                          '& .MuiInputBase-input': {
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          wordBreak: 'break-all',
                          color: uri ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {uri || 'Empty URI - click edit to add'}
                      </Typography>
                    )}
                    {isNewUri(index) && editingUriIndex !== index && (
                      <Chip 
                        label="New" 
                        size="small" 
                        color="success"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem',
                          '& .MuiChip-label': { px: 1 }
                        }} 
                      />
                    )}
                    {isUriModified(uri, index) && !isNewUri(index) && editingUriIndex !== index && (
                      <Chip 
                        label="Edited" 
                        size="small" 
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem',
                          bgcolor: '#ff9800',
                          color: 'white',
                          '& .MuiChip-label': { px: 1 }
                        }} 
                      />
                    )}
                    {editingUriIndex === index ? (
                      <Tooltip title="Save">
                        <IconButton
                          size="small"
                          onClick={() => {
                            handleRedirectUriChange(index, editingUriValue);
                            setEditingUriIndex(null);
                            setEditingUriValue('');
                          }}
                          color="success"
                        >
                          <Check fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingUriIndex(index);
                            setEditingUriValue(uri);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {redirectUris.length > 1 && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveRedirectUri(index)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {createdClient ? 'Close' : 'Cancel'}
        </Button>
        {!createdClient && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !name}
            sx={{
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#43a047' },
              minWidth: 100,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              client ? 'Update' : 'Create'
            )}
          </Button>
        )}
      </DialogActions>

    </Dialog>

    {/* URI Delete Confirmation Dialog */}
    <Dialog
      open={showUriDeleteDialog}
      onClose={() => {
        setShowUriDeleteDialog(false);
        setUriToDeleteIndex(null);
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Remove Redirect URI</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Are you sure you want to remove this redirect URI?
        </Typography>
        {uriToDeleteIndex !== null && redirectUris[uriToDeleteIndex] && (
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
              {redirectUris[uriToDeleteIndex]}
            </Typography>
          </Box>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          This URI will be removed from the active list. The change will take effect when you save the client.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => {
            setShowUriDeleteDialog(false);
            setUriToDeleteIndex(null);
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirmUriDelete}
          color="error"
          variant="contained"
        >
          Remove URI
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default OAuthClientDialog;
