import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Switch,
} from '@mui/material';
import {
  Search,
  Add,
  Delete,
  Edit,
  ArrowBack,
  ContentCopy,
  Check,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { oauthClientsService } from '../services/oauthClientsService';
import type { OAuthClient, CreateOAuthClientDto, UpdateOAuthClientDto } from '../services/oauthClientsService';

const OAuthConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState<'all' | 'development' | 'staging' | 'production'>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<OAuthClient | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<OAuthClient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [togglingClient, setTogglingClient] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uriToDeleteIndex, setUriToDeleteIndex] = useState<number | null>(null);
  const [showUriDeleteDialog, setShowUriDeleteDialog] = useState(false);
  const [editingUriIndex, setEditingUriIndex] = useState<number | null>(null);
  const [editingUriValue, setEditingUriValue] = useState('');
  const [originalRedirectUris, setOriginalRedirectUris] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<CreateOAuthClientDto>({
    name: '',
    description: '',
    redirect_uris: [],
    environment: undefined,
  });
  const [redirectUriInput, setRedirectUriInput] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, environmentFilter]);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await oauthClientsService.getAll();
      const sortedData = data.sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      setClients(sortedData);
    } catch (err: any) {
      setError(err.message || 'Failed to load OAuth clients');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDrawer = (client?: OAuthClient) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        description: client.description || '',
        redirect_uris: client.redirect_uris,
        environment: client.metadata?.environment,
      });
      setOriginalRedirectUris([...client.redirect_uris]);
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        description: '',
        redirect_uris: [],
        environment: undefined,
      });
      setOriginalRedirectUris([]);
    }
    setRedirectUriInput('');
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingClient(null);
    setFormData({
      name: '',
      description: '',
      redirect_uris: [],
      environment: undefined,
    });
    setRedirectUriInput('');
    setOriginalRedirectUris([]);
  };

  const isUriModified = (uri: string, index: number): boolean => {
    if (!editingClient) return false;
    const originalUri = originalRedirectUris[index];
    if (originalUri === undefined) return true;
    return uri !== originalUri;
  };

  const isNewUri = (index: number): boolean => {
    if (!editingClient) return false;
    return index >= originalRedirectUris.length;
  };

  const handleAddRedirectUri = () => {
    if (redirectUriInput.trim()) {
      setFormData({
        ...formData,
        redirect_uris: [...formData.redirect_uris, redirectUriInput.trim()],
      });
      setRedirectUriInput('');
    }
  };

  const handleRemoveRedirectUri = (index: number) => {
    setUriToDeleteIndex(index);
    setShowUriDeleteDialog(true);
  };

  const handleConfirmUriDelete = () => {
    if (uriToDeleteIndex !== null) {
      setFormData({
        ...formData,
        redirect_uris: formData.redirect_uris.filter((_, i) => i !== uriToDeleteIndex),
      });
    }
    setShowUriDeleteDialog(false);
    setUriToDeleteIndex(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError('Application name is required');
      return;
    }
    if (formData.redirect_uris.length === 0) {
      setError('At least one redirect URI is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingClient) {
        await oauthClientsService.update(editingClient.id, formData);
        setSuccess('OAuth client updated successfully!');
      } else {
        await oauthClientsService.create(formData);
        setSuccess('OAuth client created successfully!');
      }
      handleCloseDrawer();
      fetchClients();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save OAuth client';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent, client: OAuthClient) => {
    event.stopPropagation();
    setClientToDelete(client);
    setDeleteConfirmInput('');
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    setDeleting(true);
    try {
      await oauthClientsService.delete(clientToDelete.id);
      setSuccess(`OAuth client "${clientToDelete.name}" deleted successfully!`);
      setShowDeleteDialog(false);
      setClientToDelete(null);
      setDeleteConfirmInput('');
      await fetchClients();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete OAuth client';
      setError(errorMessage);
    } finally {
      setDeleting(false);
      setClientToDelete(null);
    }
  };

  const handleToggleActive = async (client: OAuthClient) => {
    const previousState = client.is_active;
    
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, is_active: !c.is_active } : c
    ));
    
    try {
      await oauthClientsService.toggleActive(client.id);
    } catch (err: any) {
      setClients(prev => prev.map(c => 
        c.id === client.id ? { ...c, is_active: previousState } : c
      ));
      const errorMessage = err.response?.data?.message || err.message || 'Failed to toggle OAuth client status';
      setError(errorMessage);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchQuery || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.client_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEnvironment = environmentFilter === 'all' || 
      client.metadata?.environment === environmentFilter;

    return matchesSearch && matchesEnvironment;
  });

  const paginatedClients = filteredClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getEnvironmentColor = (env?: string) => {
    switch (env) {
      case 'production': return 'error';
      case 'staging': return 'warning';
      case 'development': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/admin/tools')}
          sx={{ 
            mr: 2,
            color: 'primary.main',
            '&:hover': { 
              bgcolor: 'rgba(161, 106, 232, 0.08)' 
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          OAuth Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDrawer()}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#4caf50',
            '&:hover': { bgcolor: '#43a047' },
          }}
        >
          Register New Client
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search by name, description, or client ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Environment</InputLabel>
            <Select
              value={environmentFilter}
              label="Environment"
              onChange={(e) => setEnvironmentFilter(e.target.value as any)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="staging">Staging</MenuItem>
              <MenuItem value="production">Production</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Client ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Environment</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Redirect URIs</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {searchQuery || environmentFilter !== 'all'
                      ? 'No OAuth clients found matching your filters'
                      : 'No OAuth clients registered yet'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => (
                <TableRow 
                  key={client.id} 
                  hover
                  onClick={() => handleOpenDrawer(client)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {client.name}
                    </Typography>
                    {client.description && (
                      <Typography variant="caption" color="text.secondary">
                        {client.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {client.client_id}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyToClipboard(client.client_id)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {client.metadata?.environment && (
                      <Chip
                        label={client.metadata.environment}
                        size="small"
                        color={getEnvironmentColor(client.metadata.environment)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={client.is_active ? 'Click to deactivate' : 'Click to activate'}>
                      <Switch
                        checked={client.is_active}
                        onChange={(e) => { e.stopPropagation(); handleToggleActive(client); }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={togglingClient === client.id}
                        size="small"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#4caf50',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#4caf50',
                          },
                          '& .MuiSwitch-switchBase': {
                            color: '#9e9e9e',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: '#bdbdbd',
                          },
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {client.redirect_uris.length} URI{client.redirect_uris.length !== 1 ? 's' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDrawer(client); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteClick(e, client)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredClients.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Create/Edit Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: 650, p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {editingClient ? 'Edit OAuth Client' : 'Register New OAuth Client'}
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Application Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Environment</InputLabel>
              <Select
                value={formData.environment || ''}
                label="Environment"
                onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="development">Development</MenuItem>
                <MenuItem value="staging">Staging</MenuItem>
                <MenuItem value="production">Production</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Redirect URIs
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  placeholder="https://app.example.com/auth/callback"
                  value={redirectUriInput}
                  onChange={(e) => setRedirectUriInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRedirectUri()}
                  size="small"
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={handleAddRedirectUri}
                  disabled={!redirectUriInput.trim()}
                >
                  Add
                </Button>
              </Stack>
              <Stack spacing={1}>
                {formData.redirect_uris.map((uri, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      p: 1,
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
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const newUris = [...formData.redirect_uris];
                            newUris[index] = editingUriValue;
                            setFormData({ ...formData, redirect_uris: newUris });
                            setEditingUriIndex(null);
                            setEditingUriValue('');
                          }
                        }}
                        sx={{ 
                          flex: 1,
                          '& .MuiInputBase-input': { 
                            fontFamily: 'monospace', 
                            fontSize: '0.75rem' 
                          }
                        }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          wordBreak: 'break-all',
                        }}
                      >
                        {uri}
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
                            const newUris = [...formData.redirect_uris];
                            newUris[index] = editingUriValue;
                            setFormData({ ...formData, redirect_uris: newUris });
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
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleRemoveRedirectUri(index)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!formData.name || formData.redirect_uris.length === 0 || submitting}
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#43a047' },
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  editingClient ? 'Update Client' : 'Create Client'
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCloseDrawer}
                disabled={submitting}
                fullWidth
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={() => {
          if (!deleting) {
            setShowDeleteDialog(false);
            setDeleteConfirmInput('');
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete OAuth Client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the OAuth client "{clientToDelete?.name}"?
            This will revoke access for this application.
          </DialogContentText>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Type <strong>{clientToDelete?.name}</strong> to confirm deletion:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder={clientToDelete?.name}
              disabled={deleting}
              autoFocus
            />
            {deleteConfirmInput === clientToDelete?.name && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                You are about to delete this OAuth client. This action cannot be undone.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowDeleteDialog(false);
              setDeleteConfirmInput('');
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            variant="contained" 
            disabled={deleting || deleteConfirmInput !== clientToDelete?.name}
            sx={{ minWidth: 80 }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
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
          <DialogContentText>
            Are you sure you want to remove this redirect URI?
          </DialogContentText>
          {uriToDeleteIndex !== null && formData.redirect_uris[uriToDeleteIndex] && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                {formData.redirect_uris[uriToDeleteIndex]}
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

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OAuthConfigurationPage;
