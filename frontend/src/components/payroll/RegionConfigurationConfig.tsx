/**
 * Region Configuration Component
 * Manages country-specific configuration settings with full CRUD operations
 * Styled following Material-UI 3 Expressive Design System
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useCountry } from '../../contexts/CountryContext';
import {
  getRegionConfigurations,
  createRegionConfiguration,
  updateRegionConfiguration,
  deleteRegionConfiguration,
} from '../../services/payroll/payrollService';
import type {
  RegionConfiguration,
  CreateRegionConfigurationDto,
} from '../../types/payroll/payroll.types';

type ValueType = 'string' | 'number' | 'boolean' | 'json';

interface RegionConfigFormData {
  configKey: string;
  configName: string;
  configValue: string;
  valueType: ValueType;
  description: string;
  isActive: boolean;
}

export const RegionConfigurationConfig: React.FC = () => {
  const { selectedCountry } = useCountry();
  const [configurations, setConfigurations] = useState<RegionConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<RegionConfiguration | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [formData, setFormData] = useState<RegionConfigFormData>({
    configKey: '',
    configName: '',
    configValue: '',
    valueType: 'string',
    description: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RegionConfigFormData, string>>>({});
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (selectedCountry) {
      loadConfigurations();
    }
  }, [selectedCountry]);

  const loadConfigurations = async () => {
    if (!selectedCountry || !selectedCountry.code) {
      console.warn('Cannot load configurations: No country or country code');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await getRegionConfigurations(selectedCountry.code, true);
      setConfigurations(data);
    } catch (err: any) {
      console.error('Error loading configurations:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load region configurations';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RegionConfigFormData, string>> = {};

    // Config key validation: alphanumeric + underscores only
    if (!formData.configKey) {
      errors.configKey = 'Config key is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.configKey)) {
      errors.configKey = 'Config key must contain only letters, numbers, and underscores';
    } else if (formData.configKey.length > 100) {
      errors.configKey = 'Config key must be 100 characters or less';
    } else if (!selectedConfig) {
      // Check uniqueness for new configs
      const exists = configurations.some(c => c.configKey === formData.configKey);
      if (exists) {
        errors.configKey = 'Config key already exists for this country';
      }
    }

    if (!formData.configName) {
      errors.configName = 'Config name is required';
    } else if (formData.configName.length > 200) {
      errors.configName = 'Config name must be 200 characters or less';
    }

    if (!formData.configValue && formData.valueType !== 'boolean') {
      errors.configValue = 'Config value is required';
    }

    // Type-specific validation
    if (formData.valueType === 'number' && formData.configValue) {
      if (isNaN(Number(formData.configValue))) {
        errors.configValue = 'Value must be a valid number';
      }
    }

    if (formData.valueType === 'json' && formData.configValue) {
      try {
        JSON.parse(formData.configValue);
      } catch (e) {
        errors.configValue = 'Value must be valid JSON';
      }
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const parseValueForType = (value: string, type: ValueType): any => {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true' || value === '1';
      case 'json':
        return JSON.parse(value);
      case 'string':
      default:
        return value;
    }
  };

  const formatValueForDisplay = (configValue: any, valueType: string): string => {
    if (valueType === 'json' || typeof configValue === 'object') {
      return JSON.stringify(configValue, null, 2);
    }
    return String(configValue);
  };

  const handleOpenDialog = (config?: RegionConfiguration) => {
    if (config) {
      setSelectedConfig(config);
      setFormData({
        configKey: config.configKey,
        configName: '',  // Not stored in current entity
        configValue: formatValueForDisplay(config.configValue, 'json'),
        valueType: 'string', // Infer from value
        description: config.description || '',
        isActive: config.isActive,
      });
    } else {
      setSelectedConfig(null);
      setFormData({
        configKey: '',
        configName: '',
        configValue: '',
        valueType: 'string',
        description: '',
        isActive: true,
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedConfig(null);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedCountry) return;

    setLoading(true);
    try {
      const parsedValue = parseValueForType(formData.configValue, formData.valueType);
      
      const dto: any = {
        countryId: selectedCountry.id,
        configKey: formData.configKey,
        configValue: parsedValue,
        description: formData.description || undefined,
      };

      if (selectedConfig) {
        await updateRegionConfiguration(selectedCountry.code, selectedConfig.id, dto);
        showSnackbar('Configuration updated successfully', 'success');
      } else {
        await createRegionConfiguration(selectedCountry.code, dto);
        showSnackbar('Configuration created successfully', 'success');
      }

      handleCloseDialog();
      await loadConfigurations();
    } catch (err: any) {
      console.error('Error saving configuration:', err);
      showSnackbar(err.response?.data?.message || 'Failed to save configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (config: RegionConfiguration) => {
    setSelectedConfig(config);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedConfig(null);
  };

  const handleDelete = async () => {
    if (!selectedConfig || !selectedCountry) return;

    setLoading(true);
    try {
      await deleteRegionConfiguration(selectedCountry.code, selectedConfig.id);
      showSnackbar('Configuration deleted successfully', 'success');
      handleCloseDeleteDialog();
      await loadConfigurations();
    } catch (err: any) {
      console.error('Error deleting configuration:', err);
      showSnackbar(err.response?.data?.message || 'Failed to delete configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredConfigurations = configurations.filter(config =>
    config.configKey.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (config.description && config.description.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  if (!selectedCountry || !selectedCountry.code) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Please select a country to manage region configurations
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
          <Button onClick={loadConfigurations} sx={{ mt: 2 }}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight={600} color="primary" gutterBottom>
                Region Configurations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage country-specific settings for {selectedCountry.name}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={loading}
            >
              Create Configuration
            </Button>
          </Box>

          {/* Search Filter */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search by config key or description..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Loading State */}
          {loading && configurations.length === 0 ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Configurations Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? alpha(theme.palette.common.white, 0.05)
                            : alpha(theme.palette.common.black, 0.04),
                      }}
                    >
                      <TableCell><strong>Config Key</strong></TableCell>
                      <TableCell><strong>Value</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredConfigurations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary" py={2}>
                            {searchFilter 
                              ? 'No configurations match your search'
                              : 'No configurations found. Click "Create Configuration" to add one.'
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredConfigurations.map((config) => (
                        <TableRow key={config.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <SettingsIcon fontSize="small" color="primary" />
                              <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                                {config.configKey}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                maxWidth: 300,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Typography variant="body2" fontFamily="monospace">
                                {formatValueForDisplay(config.configValue, 'json').length > 50
                                  ? formatValueForDisplay(config.configValue, 'json').substring(0, 50) + '...'
                                  : formatValueForDisplay(config.configValue, 'json')
                                }
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {config.description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {config.isActive ? (
                              <Chip
                                label="Active"
                                color="success"
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            ) : (
                              <Chip
                                label="Inactive"
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(config)}
                                disabled={loading}
                                sx={{
                                  color: (theme) => 
                                    theme.palette.mode === 'dark' 
                                      ? alpha(theme.palette.common.white, 0.9)
                                      : 'action.active',
                                  '&:hover': {
                                    backgroundColor: 'action.hover',
                                    color: 'primary.main',
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteDialog(config)}
                                disabled={loading}
                                sx={{
                                  color: (theme) => 
                                    theme.palette.mode === 'dark' 
                                      ? alpha(theme.palette.common.white, 0.9)
                                      : 'action.active',
                                  '&:hover': {
                                    backgroundColor: 'action.hover',
                                    color: 'error.main',
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {selectedConfig ? 'Edit Configuration' : 'Create Configuration'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Config Key"
              value={formData.configKey}
              onChange={(e) => setFormData({ ...formData, configKey: e.target.value })}
              error={!!formErrors.configKey}
              helperText={formErrors.configKey || 'Alphanumeric and underscores only (e.g., min_wage, pf_rate)'}
              margin="normal"
              required
              disabled={!!selectedConfig}
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.09)
                      : 'background.paper',
                },
              }}
            />

            <TextField
              fullWidth
              label="Config Name"
              value={formData.configName}
              onChange={(e) => setFormData({ ...formData, configName: e.target.value })}
              error={!!formErrors.configName}
              helperText={formErrors.configName}
              margin="normal"
              required
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.09)
                      : 'background.paper',
                },
              }}
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Value Type</InputLabel>
              <Select
                value={formData.valueType}
                onChange={(e) => setFormData({ ...formData, valueType: e.target.value as ValueType })}
                label="Value Type"
                sx={{
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.09)
                      : 'background.paper',
                }}
              >
                <MenuItem value="string">String</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>

            {formData.valueType === 'boolean' ? (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.configValue === 'true' || formData.configValue === '1'}
                    onChange={(e) => setFormData({ ...formData, configValue: e.target.checked ? 'true' : 'false' })}
                  />
                }
                label="Configuration Value"
                sx={{ mt: 2 }}
              />
            ) : (
              <TextField
                fullWidth
                label="Config Value"
                value={formData.configValue}
                onChange={(e) => setFormData({ ...formData, configValue: e.target.value })}
                error={!!formErrors.configValue}
                helperText={formErrors.configValue}
                margin="normal"
                required
                multiline={formData.valueType === 'json'}
                rows={formData.valueType === 'json' ? 6 : 1}
                inputProps={{
                  style: formData.valueType === 'json' ? { fontFamily: 'monospace' } : undefined,
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.09)
                        : 'background.paper',
                  },
                }}
              />
            )}

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={!!formErrors.description}
              helperText={formErrors.description}
              margin="normal"
              multiline
              rows={2}
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.09)
                      : 'background.paper',
                },
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {selectedConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          Delete Configuration
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to delete configuration "{selectedConfig?.configKey}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RegionConfigurationConfig;

