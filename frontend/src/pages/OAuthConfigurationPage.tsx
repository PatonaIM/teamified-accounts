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
  DialogActions,
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { oauthClientsService } from '../services/oauthClientsService';
import type { OAuthClient, RedirectUri, EnvironmentType } from '../services/oauthClientsService';
import OAuthClientDialog from '../components/settings/OAuthClientDialog';

const environmentColors: Record<EnvironmentType, string> = {
  development: '#2196f3',
  staging: '#ff9800',
  production: '#4caf50',
};

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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<OAuthClient | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<OAuthClient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [togglingClient, setTogglingClient] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

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

  const handleOpenDialog = (client?: OAuthClient) => {
    setEditingClient(client || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClient(null);
  };

  const handleDialogSuccess = () => {
    fetchClients();
    setSuccess(editingClient ? 'OAuth client updated successfully!' : 'OAuth client created successfully!');
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

  const getEnvironmentCounts = (uris: RedirectUri[]): Record<EnvironmentType, number> => {
    const counts: Record<EnvironmentType, number> = { development: 0, staging: 0, production: 0 };
    if (Array.isArray(uris)) {
      uris.forEach(uri => {
        if (uri && uri.environment) {
          counts[uri.environment]++;
        }
      });
    }
    return counts;
  };

  const hasEnvironment = (uris: RedirectUri[], env: EnvironmentType): boolean => {
    if (!Array.isArray(uris)) return false;
    return uris.some(uri => uri && uri.environment === env);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchQuery || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.client_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEnvironment = environmentFilter === 'all' || 
      hasEnvironment(client.redirect_uris, environmentFilter);

    return matchesSearch && matchesEnvironment;
  });

  const paginatedClients = filteredClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          OAuth Configuration
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, description, or client ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#45a049' },
              whiteSpace: 'nowrap',
              px: 3,
            }}
          >
            New Client
          </Button>
        </Box>
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
              <TableCell sx={{ fontWeight: 600 }}>Intent</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Redirect URIs</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {searchQuery || environmentFilter !== 'all'
                      ? 'No OAuth clients found matching your filters'
                      : 'No OAuth clients registered yet'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => {
                const envCounts = getEnvironmentCounts(client.redirect_uris);
                return (
                  <TableRow 
                    key={client.id} 
                    hover
                    onClick={() => handleOpenDialog(client)}
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
                          onClick={(e) => { e.stopPropagation(); handleCopyToClipboard(client.client_id); }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client.default_intent === 'both' ? 'Both' : client.default_intent === 'client' ? 'Client' : 'Candidate'}
                        size="small"
                        sx={{
                          bgcolor: client.default_intent === 'client' ? '#9c27b0' : client.default_intent === 'candidate' ? '#00bcd4' : '#607d8b',
                          color: 'white',
                          textTransform: 'capitalize',
                        }}
                      />
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
                      <Stack direction="row" spacing={0.5} alignItems="center">
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
                            label={`${envCounts.staging} Stg`} 
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
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(client); }}>
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
                );
              })
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

      <OAuthClientDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleDialogSuccess}
        client={editingClient}
      />

      <Dialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setClientToDelete(null);
          setDeleteConfirmInput('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete OAuth Client</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>{clientToDelete?.name}</strong>?
            This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Type <strong>{clientToDelete?.name}</strong> to confirm:
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value)}
            placeholder={clientToDelete?.name}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowDeleteDialog(false);
            setClientToDelete(null);
            setDeleteConfirmInput('');
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting || deleteConfirmInput !== clientToDelete?.name}
          >
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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
