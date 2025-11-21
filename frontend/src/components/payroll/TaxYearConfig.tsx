/**
 * Tax Year Configuration Component
 * Manages country-specific tax years with full CRUD operations
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CurrentIcon,
} from '@mui/icons-material';
import { useCountry } from '../../contexts/CountryContext';
import {
  getTaxYears,
  createTaxYear,
  updateTaxYear,
  deleteTaxYear,
} from '../../services/payroll/payrollService';
import type {
  TaxYear,
  CreateTaxYearDto,
} from '../../types/payroll/payroll.types';

interface TaxYearFormData {
  year: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export const TaxYearConfig: React.FC = () => {
  const { selectedCountry } = useCountry();
  const [taxYears, setTaxYears] = useState<TaxYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTaxYear, setSelectedTaxYear] = useState<TaxYear | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [formData, setFormData] = useState<TaxYearFormData>({
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    isCurrent: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<TaxYearFormData>>({});

  useEffect(() => {
    if (selectedCountry) {
      loadTaxYears();
    }
  }, [selectedCountry]);

  const loadTaxYears = async () => {
    if (!selectedCountry || !selectedCountry.code) {
      console.warn('Cannot load tax years: No country or country code');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await getTaxYears(selectedCountry.code);
      setTaxYears(data);
    } catch (err: any) {
      console.error('Error loading tax years:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load tax years';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<TaxYearFormData> = {};
    const currentYear = new Date().getFullYear();

    if (!formData.year || formData.year < currentYear) {
      errors.year = currentYear;
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end <= start) {
        errors.endDate = 'End date must be after start date';
      }

      // Check if approximately 12 months
      const monthsDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsDiff < 11 || monthsDiff > 13) {
        console.warn('Date range should be approximately 12 months');
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (taxYear?: TaxYear) => {
    if (taxYear) {
      setSelectedTaxYear(taxYear);
      setFormData({
        year: taxYear.year,
        startDate: taxYear.startDate.split('T')[0],
        endDate: taxYear.endDate.split('T')[0],
        isCurrent: taxYear.isCurrent || false,
      });
    } else {
      setSelectedTaxYear(null);
      const currentYear = new Date().getFullYear();
      setFormData({
        year: currentYear + 1,
        startDate: '',
        endDate: '',
        isCurrent: false,
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTaxYear(null);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedCountry) return;

    setLoading(true);
    try {
      if (selectedTaxYear) {
        // Update - only send updatable fields
        const updateDto = {
          startDate: formData.startDate,
          endDate: formData.endDate,
          isCurrent: formData.isCurrent,
        };
        await updateTaxYear(selectedCountry.code, selectedTaxYear.id, updateDto);
        showSnackbar('Tax year updated successfully', 'success');
      } else {
        // Create - send all required fields
        const createDto: CreateTaxYearDto = {
          countryId: selectedCountry.id,
          year: formData.year,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isCurrent: formData.isCurrent,
        };
        await createTaxYear(selectedCountry.code, createDto);
        showSnackbar('Tax year created successfully', 'success');
      }

      handleCloseDialog();
      await loadTaxYears();
    } catch (err: any) {
      console.error('Error saving tax year:', err);
      showSnackbar(err.response?.data?.message || 'Failed to save tax year', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (taxYear: TaxYear) => {
    setSelectedTaxYear(taxYear);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedTaxYear(null);
  };

  const handleDelete = async () => {
    if (!selectedTaxYear || !selectedCountry) return;

    setLoading(true);
    try {
      await deleteTaxYear(selectedCountry.code, selectedTaxYear.id);
      showSnackbar('Tax year deleted successfully', 'success');
      handleCloseDeleteDialog();
      await loadTaxYears();
    } catch (err: any) {
      console.error('Error deleting tax year:', err);
      showSnackbar(err.response?.data?.message || 'Failed to delete tax year', 'error');
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

  if (!selectedCountry || !selectedCountry.code) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Please select a country to manage tax years
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
          <Button onClick={loadTaxYears} sx={{ mt: 2 }}>
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
                Tax Years
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage tax year periods for {selectedCountry.name}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={loading}
            >
              Create Tax Year
            </Button>
          </Box>

          {/* Loading State */}
          {loading && taxYears.length === 0 ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Tax Years Table */}
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
                      <TableCell><strong>Year</strong></TableCell>
                      <TableCell><strong>Start Date</strong></TableCell>
                      <TableCell><strong>End Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {taxYears.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary" py={2}>
                            No tax years configured. Click "Create Tax Year" to add one.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      taxYears.map((taxYear) => (
                        <TableRow key={taxYear.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <CalendarIcon fontSize="small" color="primary" />
                              <Typography variant="body2" fontWeight={500}>
                                {taxYear.year}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {new Date(taxYear.startDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            {new Date(taxYear.endDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            {taxYear.isCurrent ? (
                              <Chip
                                icon={<CurrentIcon />}
                                label="Current"
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
                                onClick={() => handleOpenDialog(taxYear)}
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
                                onClick={() => handleOpenDeleteDialog(taxYear)}
                                disabled={loading || taxYear.isCurrent}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {selectedTaxYear ? 'Edit Tax Year' : 'Create Tax Year'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
              error={!!formErrors.year}
              helperText={formErrors.year ? `Year must be >= ${formErrors.year}` : ''}
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
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              error={!!formErrors.startDate}
              helperText={formErrors.startDate}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
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
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              error={!!formErrors.endDate}
              helperText={formErrors.endDate}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.09)
                      : 'background.paper',
                },
              }}
            />
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isCurrent}
                    onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                    color="primary"
                  />
                }
                label="Set as Current Tax Year"
              />
              <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
                Only one tax year per country can be marked as current. Setting this will automatically unmark other tax years.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {selectedTaxYear ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Tax Year</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete tax year {selectedTaxYear?.year}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaxYearConfig;

