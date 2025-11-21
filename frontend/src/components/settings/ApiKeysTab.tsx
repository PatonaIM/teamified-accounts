import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  ContentCopy,
  VpnKey,
} from '@mui/icons-material';
import { apiKeysService } from '../../services/apiKeysService';
import type { ApiKey, CreateApiKeyDto } from '../../services/apiKeysService';
import { formatDistanceToNow } from 'date-fns';

const ApiKeysTab: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKey, setNewKey] = useState<CreateApiKeyDto>({
    name: '',
    type: 'read_only',
  });
  const [editName, setEditName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const keys = await apiKeysService.findAll();
      setApiKeys(keys);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDialogOpen = () => {
    setNewKey({ name: '', type: 'read_only' });
    setGeneratedKey(null);
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setNewKey({ name: '', type: 'read_only' });
    setGeneratedKey(null);
    setCopied(false);
  };

  const handleCreate = async () => {
    try {
      setError(null);
      const result = await apiKeysService.create(newKey);
      setGeneratedKey(result.key);
      await loadApiKeys();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create API key');
    }
  };

  const handleEditDialogOpen = (key: ApiKey) => {
    setSelectedKey(key);
    setEditName(key.name);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedKey(null);
    setEditName('');
  };

  const handleUpdate = async () => {
    if (!selectedKey) return;
    try {
      setError(null);
      await apiKeysService.update(selectedKey.id, { name: editName });
      await loadApiKeys();
      handleEditDialogClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update API key');
    }
  };

  const handleDeleteDialogOpen = (key: ApiKey) => {
    setSelectedKey(key);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedKey(null);
  };

  const handleDelete = async () => {
    if (!selectedKey) return;
    try {
      setError(null);
      await apiKeysService.remove(selectedKey.id);
      await loadApiKeys();
      handleDeleteDialogClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete API key');
    }
  };

  const handleCopyKey = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            API Keys
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage API keys for programmatic access to the portal. Maximum 10 keys per user.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateDialogOpen}
          disabled={apiKeys.length >= 10}
        >
          Create API Key
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Key Prefix</TableCell>
              <TableCell>Last Used</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <VpnKey sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No API keys yet. Create one to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((key) => (
                <TableRow key={key.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {key.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={key.type === 'read_only' ? 'Read Only' : 'Full Access'}
                      size="small"
                      color={key.type === 'read_only' ? 'default' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                      {key.keyPrefix}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {key.lastUsedAt
                        ? formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })
                        : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Name">
                      <IconButton size="small" onClick={() => handleEditDialogOpen(key)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDialogOpen(key)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {generatedKey ? 'API Key Created' : 'Create New API Key'}
        </DialogTitle>
        <DialogContent>
          {generatedKey ? (
            <Box sx={{ pt: 1 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>Save this key now!</AlertTitle>
                For security reasons, you won't be able to see this key again. Make sure to copy it
                to a secure location.
              </Alert>
              <TextField
                fullWidth
                label="Your API Key"
                value={generatedKey}
                InputProps={{
                  readOnly: true,
                  sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
                  endAdornment: (
                    <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                      <IconButton onClick={() => handleCopyKey(generatedKey)} edge="end">
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Key Name"
                fullWidth
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                helperText="A descriptive name to identify this key"
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth>
                <InputLabel>Access Type</InputLabel>
                <Select
                  value={newKey.type}
                  label="Access Type"
                  onChange={(e) =>
                    setNewKey({ ...newKey, type: e.target.value as 'read_only' | 'full_access' })
                  }
                >
                  <MenuItem value="read_only">Read Only - View data only</MenuItem>
                  <MenuItem value="full_access">Full Access - Read and write data</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {generatedKey ? (
            <Button onClick={handleCreateDialogClose} variant="contained">
              Done
            </Button>
          ) : (
            <>
              <Button onClick={handleCreateDialogClose}>Cancel</Button>
              <Button
                onClick={handleCreate}
                variant="contained"
                disabled={!newKey.name.trim()}
              >
                Create
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Key Name"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={!editName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Delete API Key</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedKey?.name}</strong>? This action
            cannot be undone and any applications using this key will lose access.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeysTab;
