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
  Select,
  FormControl,
} from '@mui/material';
import { Add, Delete, ContentCopy, Edit, Check } from '@mui/icons-material';
import { oauthClientsService, type OAuthClient, type CreateOAuthClientDto, type RedirectUri, type EnvironmentType } from '../../services/oauthClientsService';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client: OAuthClient | null;
}

const environmentColors: Record<EnvironmentType, string> = {
  development: '#2196f3',
  staging: '#ff9800',
  production: '#4caf50',
};

const OAuthClientDialog: React.FC<Props> = ({ open, onClose, onSuccess, client }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultIntent, setDefaultIntent] = useState<'client' | 'candidate' | 'both'>('both');
  const [redirectUris, setRedirectUris] = useState<RedirectUri[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdClient, setCreatedClient] = useState<OAuthClient | null>(null);
  const [uriToDeleteIndex, setUriToDeleteIndex] = useState<number | null>(null);
  const [showUriDeleteDialog, setShowUriDeleteDialog] = useState(false);
  const [editingUriIndex, setEditingUriIndex] = useState<number | null>(null);
  const [editingUriValue, setEditingUriValue] = useState('');
  const [originalRedirectUris, setOriginalRedirectUris] = useState<RedirectUri[]>([]);
  const [newUriInput, setNewUriInput] = useState('');
  const [newUriEnvironment, setNewUriEnvironment] = useState<EnvironmentType>('development');
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (client) {
      setName(client.name);
      setDescription(client.description || '');
      setDefaultIntent(client.default_intent || 'both');
      const uris = Array.isArray(client.redirect_uris) ? client.redirect_uris : [];
      setRedirectUris(uris);
      setOriginalRedirectUris([...uris]);
    } else {
      resetForm();
    }
  }, [client, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDefaultIntent('both');
    setRedirectUris([]);
    setCreatedClient(null);
    setOriginalRedirectUris([]);
    setNewUriInput('');
    setNewUriEnvironment('development');
  };

  const isUriModified = (uri: RedirectUri, index: number): boolean => {
    if (!client) return false;
    const originalUri = originalRedirectUris[index];
    if (originalUri === undefined) return true;
    return uri.uri !== originalUri.uri || uri.environment !== originalUri.environment;
  };

  const isNewUri = (index: number): boolean => {
    if (!client) return false;
    return index >= originalRedirectUris.length;
  };

  const handleAddRedirectUri = () => {
    if (newUriInput.trim()) {
      const isReplitApp = newUriInput.includes('.replit.app');
      setRedirectUris([...redirectUris, { 
        uri: newUriInput.trim(), 
        environment: isReplitApp ? 'production' : newUriEnvironment 
      }]);
      setNewUriInput('');
      setNewUriEnvironment('development');
    }
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
    newUris[index] = { ...newUris[index], uri: value };
    setRedirectUris(newUris);
  };

  const handleEnvironmentChange = (index: number, environment: EnvironmentType) => {
    const newUris = [...redirectUris];
    newUris[index] = { ...newUris[index], environment };
    setRedirectUris(newUris);
  };

  const handleSubmit = async () => {
    const filteredUris = redirectUris.filter(uri => uri.uri.trim() !== '');
    
    if (filteredUris.length === 0) {
      showSnackbar('At least one redirect URI is required', 'error');
      return;
    }

    const data: CreateOAuthClientDto = {
      name,
      description: description || undefined,
      redirect_uris: filteredUris,
      default_intent: defaultIntent,
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

  const getEnvironmentCounts = () => {
    const counts = { development: 0, staging: 0, production: 0 };
    redirectUris.forEach(uri => {
      if (uri.environment) {
        counts[uri.environment]++;
      }
    });
    return counts;
  };

  const envCounts = getEnvironmentCounts();

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
                {redirectUris.length > 0 && (
                  <Stack direction="row" spacing={0.5}>
                    {envCounts.production > 0 && (
                      <Chip 
                        label={`${envCounts.production} Prod`} 
                        size="small"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem',
                          bgcolor: environmentColors.production,
                          color: 'white',
                        }} 
                      />
                    )}
                    {envCounts.staging > 0 && (
                      <Chip 
                        label={`${envCounts.staging} Staging`} 
                        size="small"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem',
                          bgcolor: environmentColors.staging,
                          color: 'white',
                        }} 
                      />
                    )}
                    {envCounts.development > 0 && (
                      <Chip 
                        label={`${envCounts.development} Dev`} 
                        size="small"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem',
                          bgcolor: environmentColors.development,
                          color: 'white',
                        }} 
                      />
                    )}
                  </Stack>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                OAuth callback URLs where users will be redirected after authentication. Each URI is tagged with an environment.
              </Typography>
              
              <Stack spacing={1}>
                {redirectUris.map((uriObj, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      bgcolor: isNewUri(index) 
                        ? 'rgba(76, 175, 80, 0.08)' 
                        : isUriModified(uriObj, index) 
                          ? 'rgba(255, 152, 0, 0.08)' 
                          : 'action.hover',
                      borderRadius: 1,
                      border: isNewUri(index) 
                        ? '1px solid rgba(76, 175, 80, 0.3)' 
                        : isUriModified(uriObj, index) 
                          ? '1px solid rgba(255, 152, 0, 0.3)' 
                          : '1px solid transparent',
                    }}
                  >
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={uriObj.environment}
                        onChange={(e) => handleEnvironmentChange(index, e.target.value as EnvironmentType)}
                        sx={{
                          '& .MuiSelect-select': {
                            py: 0.5,
                            fontSize: '0.75rem',
                          },
                          bgcolor: environmentColors[uriObj.environment],
                          color: 'white',
                          '& .MuiSvgIcon-root': { color: 'white' },
                        }}
                      >
                        <MenuItem value="development">Dev</MenuItem>
                        <MenuItem value="staging">Staging</MenuItem>
                        <MenuItem value="production">Prod</MenuItem>
                      </Select>
                    </FormControl>
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
                          color: uriObj.uri ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {uriObj.uri || 'Empty URI - click edit to add'}
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
                    {isUriModified(uriObj, index) && !isNewUri(index) && editingUriIndex !== index && (
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
                            setEditingUriValue(uriObj.uri);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveRedirectUri(index)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={newUriEnvironment}
                    onChange={(e) => setNewUriEnvironment(e.target.value as EnvironmentType)}
                    sx={{
                      '& .MuiSelect-select': {
                        py: 1,
                        fontSize: '0.75rem',
                      },
                    }}
                  >
                    <MenuItem value="development">Dev</MenuItem>
                    <MenuItem value="staging">Staging</MenuItem>
                    <MenuItem value="production">Prod</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  placeholder="https://app.teamified.com/auth/callback"
                  value={newUriInput}
                  onChange={(e) => setNewUriInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRedirectUri()}
                  size="small"
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddRedirectUri}
                  disabled={!newUriInput.trim()}
                  startIcon={<Add />}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Add
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Tip: URLs containing .replit.app will automatically be tagged as Production.
              </Typography>
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                label={redirectUris[uriToDeleteIndex].environment} 
                size="small"
                sx={{ 
                  bgcolor: environmentColors[redirectUris[uriToDeleteIndex].environment],
                  color: 'white',
                  textTransform: 'capitalize',
                }} 
              />
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                {redirectUris[uriToDeleteIndex].uri}
              </Typography>
            </Stack>
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
