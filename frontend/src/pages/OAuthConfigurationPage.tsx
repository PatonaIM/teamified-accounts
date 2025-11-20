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
} from '@mui/material';
import {
  Search,
  Add,
  Delete,
  Edit,
  ArrowBack,
  Refresh,
  PowerSettingsNew,
  ContentCopy,
  Visibility,
  VisibilityOff,
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<OAuthClient | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<OAuthClient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSecretDialog, setShowSecretDialog] = useState(false);
  const [newSecret, setNewSecret] = useState<string>('');
  const [showSecret, setShowSecret] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateOAuthClientDto>({
    name: '',
    description: '',
    redirect_uris: [],
    app_url: '',
    owner: '',
    environment: undefined,
  });
  const [redirectUriInput, setRedirectUriInput] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await oauthClientsService.getAll();
      setClients(data);
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
        app_url: client.metadata?.app_url || '',
        owner: client.metadata?.owner || '',
        environment: client.metadata?.environment,
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        description: '',
        redirect_uris: [],
        app_url: '',
        owner: '',
        environment: undefined,
      });
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
      app_url: '',
      owner: '',
      environment: undefined,
    });
    setRedirectUriInput('');
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
    setFormData({
      ...formData,
      redirect_uris: formData.redirect_uris.filter((_, i) => i !== index),
    });
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
    }
  };

  const handleDeleteClick = (event: React.MouseEvent, client: OAuthClient) => {
    event.stopPropagation();
    setClientToDelete(client);
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
      await fetchClients();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete OAuth client';
      setError(errorMessage);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setClientToDelete(null);
    }
  };

  const handleToggleActive = async (client: OAuthClient) => {
    try {
      await oauthClientsService.toggleActive(client.id);
      setSuccess(`OAuth client ${client.is_active ? 'deactivated' : 'activated'} successfully!`);
      await fetchClients();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to toggle OAuth client status';
      setError(errorMessage);
    }
  };

  const handleRegenerateSecret = async (client: OAuthClient) => {
    try {
      const updated = await oauthClientsService.regenerateSecret(client.id);
      setNewSecret(updated.client_secret);
      setShowSecretDialog(true);
      await fetchClients();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to regenerate client secret';
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
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && client.is_active) ||
      (statusFilter === 'inactive' && !client.is_active);

    return matchesSearch && matchesStatus;
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
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/tools')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
          OAuth Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDrawer()}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#A16AE8',
            '&:hover': { bgcolor: '#8f5cd9' },
          }}
        >
          Register New Client
        </Button>
      </Stack>

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
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
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
                    {searchQuery || statusFilter !== 'all'
                      ? 'No OAuth clients found matching your filters'
                      : 'No OAuth clients registered yet'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => (
                <TableRow key={client.id} hover>
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
                    <Chip
                      label={client.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={client.is_active ? 'success' : 'default'}
                    />
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
                        <IconButton size="small" onClick={() => handleOpenDrawer(client)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={client.is_active ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(client)}
                          color={client.is_active ? 'warning' : 'success'}
                        >
                          <PowerSettingsNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Regenerate Secret">
                        <IconButton
                          size="small"
                          onClick={() => handleRegenerateSecret(client)}
                          color="info"
                        >
                          <Refresh fontSize="small" />
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
        <Box sx={{ width: 500, p: 3 }}>
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

            <TextField
              label="Application URL"
              value={formData.app_url}
              onChange={(e) => setFormData({ ...formData, app_url: e.target.value })}
              placeholder="https://app.example.com"
              fullWidth
            />

            <TextField
              label="Owner/Team"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="Engineering Team"
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
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {uri}
                    </Typography>
                    <IconButton size="small" onClick={() => handleRemoveRedirectUri(index)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!formData.name || formData.redirect_uris.length === 0}
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#A16AE8',
                  '&:hover': { bgcolor: '#8f5cd9' },
                }}
              >
                {editingClient ? 'Update Client' : 'Create Client'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCloseDrawer}
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
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete OAuth Client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the OAuth client "{clientToDelete?.name}"?
            This action cannot be undone and will invalidate all existing tokens for this client.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Secret Display Dialog */}
      <Dialog open={showSecretDialog} onClose={() => setShowSecretDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Client Secret Generated</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Save this secret now! You won't be able to see it again.
          </Alert>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Client Secret
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <TextField
                  value={newSecret}
                  type={showSecret ? 'text' : 'password'}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowSecret(!showSecret)}
                          edge="end"
                          size="small"
                        >
                          {showSecret ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton onClick={() => handleCopyToClipboard(newSecret)}>
                  <ContentCopy />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSecretDialog(false)}>Close</Button>
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
