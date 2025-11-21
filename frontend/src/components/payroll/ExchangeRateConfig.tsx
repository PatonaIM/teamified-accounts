/**
 * Exchange Rate Configuration Component
 * Manages currency exchange rates with full CRUD operations
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Grid,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as CurrencyIcon,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import {
  getCurrencies,
  getExchangeRatePair,
  createExchangeRate,
  updateExchangeRate,
  deleteExchangeRate,
} from '../../services/payroll/payrollService';
import type {
  Currency,
  ExchangeRate,
  CreateExchangeRateDto,
} from '../../types/payroll/payroll.types';

interface ExchangeRateFormData {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  effectiveDate: string;
}

export const ExchangeRateConfig: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExchangeRate, setSelectedExchangeRate] = useState<ExchangeRate | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [formData, setFormData] = useState<ExchangeRateFormData>({
    fromCurrencyId: '',
    toCurrencyId: '',
    rate: 0,
    effectiveDate: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ExchangeRateFormData, string>>>({});
  const [filterFromCurrency, setFilterFromCurrency] = useState<string>('');
  const [filterToCurrency, setFilterToCurrency] = useState<string>('');

  useEffect(() => {
    loadCurrencies();
    loadAllExchangeRates();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await getCurrencies(false);
      setCurrencies(data);
    } catch (err) {
      console.error('Error loading currencies:', err);
      showSnackbar('Failed to load currencies', 'error');
    }
  };

  const loadAllExchangeRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const currenciesData = await getCurrencies(false);
      const allRates: ExchangeRate[] = [];

      // Load exchange rates for all currency pairs
      for (const fromCurrency of currenciesData) {
        for (const toCurrency of currenciesData) {
          if (fromCurrency.id !== toCurrency.id) {
            try {
              const rates = await getExchangeRatePair(fromCurrency.id, toCurrency.id, true);
              allRates.push(...rates);
            } catch (err) {
              // No rates exist for this pair, continue
            }
          }
        }
      }

      // Remove duplicates based on ID
      const uniqueRates = allRates.filter((rate, index, self) =>
        index === self.findIndex((r) => r.id === rate.id)
      );

      setExchangeRates(uniqueRates);
    } catch (err) {
      console.error('Error loading exchange rates:', err);
      setError('Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ExchangeRateFormData, string>> = {};

    if (!formData.fromCurrencyId) {
      errors.fromCurrencyId = 'From currency is required';
    }

    if (!formData.toCurrencyId) {
      errors.toCurrencyId = 'To currency is required';
    }

    if (formData.fromCurrencyId === formData.toCurrencyId) {
      errors.toCurrencyId = 'To currency must be different from From currency';
    }

    if (!formData.rate || formData.rate <= 0) {
      errors.rate = 'Rate must be greater than 0';
    }

    if (!formData.effectiveDate) {
      errors.effectiveDate = 'Effective date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (exchangeRate?: ExchangeRate) => {
    if (exchangeRate) {
      setSelectedExchangeRate(exchangeRate);
      setFormData({
        fromCurrencyId: exchangeRate.fromCurrencyId,
        toCurrencyId: exchangeRate.toCurrencyId,
        rate: exchangeRate.rate,
        effectiveDate: exchangeRate.effectiveDate.split('T')[0],
      });
    } else {
      setSelectedExchangeRate(null);
      setFormData({
        fromCurrencyId: '',
        toCurrencyId: '',
        rate: 0,
        effectiveDate: new Date().toISOString().split('T')[0],
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedExchangeRate(null);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dto: CreateExchangeRateDto = {
        fromCurrencyId: formData.fromCurrencyId,
        toCurrencyId: formData.toCurrencyId,
        rate: formData.rate,
        effectiveDate: formData.effectiveDate,
      };

      if (selectedExchangeRate) {
        await updateExchangeRate(selectedExchangeRate.id, dto);
        showSnackbar('Exchange rate updated successfully', 'success');
      } else {
        await createExchangeRate(dto);
        showSnackbar('Exchange rate created successfully', 'success');
      }

      handleCloseDialog();
      await loadAllExchangeRates();
    } catch (err: any) {
      console.error('Error saving exchange rate:', err);
      showSnackbar(err.response?.data?.message || 'Failed to save exchange rate', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (exchangeRate: ExchangeRate) => {
    setSelectedExchangeRate(exchangeRate);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedExchangeRate(null);
  };

  const handleDelete = async () => {
    if (!selectedExchangeRate) return;

    setLoading(true);
    try {
      await deleteExchangeRate(selectedExchangeRate.id);
      showSnackbar('Exchange rate deleted successfully', 'success');
      handleCloseDeleteDialog();
      await loadAllExchangeRates();
    } catch (err: any) {
      console.error('Error deleting exchange rate:', err);
      showSnackbar(err.response?.data?.message || 'Failed to delete exchange rate', 'error');
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

  const getCurrencyDisplay = (currencyId: string): string => {
    const currency = currencies.find(c => c.id === currencyId);
    return currency ? `${currency.code} (${currency.symbol})` : currencyId;
  };

  const getReversedRate = (rate: number): string => {
    return (1 / rate).toFixed(6);
  };

  const filteredExchangeRates = exchangeRates.filter(rate => {
    if (filterFromCurrency && rate.fromCurrencyId !== filterFromCurrency) return false;
    if (filterToCurrency && rate.toCurrencyId !== filterToCurrency) return false;
    return true;
  });

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
          <Button onClick={loadAllExchangeRates} sx={{ mt: 2 }}>
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
                Exchange Rates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage currency exchange rates for multi-currency support
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={loading}
            >
              Create Exchange Rate
            </Button>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by From Currency</InputLabel>
                <Select
                  value={filterFromCurrency}
                  onChange={(e) => setFilterFromCurrency(e.target.value)}
                  label="Filter by From Currency"
                >
                  <MenuItem value="">All Currencies</MenuItem>
                  {currencies.map((currency) => (
                    <MenuItem key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by To Currency</InputLabel>
                <Select
                  value={filterToCurrency}
                  onChange={(e) => setFilterToCurrency(e.target.value)}
                  label="Filter by To Currency"
                >
                  <MenuItem value="">All Currencies</MenuItem>
                  {currencies.map((currency) => (
                    <MenuItem key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Loading State */}
          {loading && exchangeRates.length === 0 ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Exchange Rates Table */}
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
                      <TableCell><strong>From Currency</strong></TableCell>
                      <TableCell><strong>To Currency</strong></TableCell>
                      <TableCell><strong>Rate</strong></TableCell>
                      <TableCell><strong>Reverse Rate</strong></TableCell>
                      <TableCell><strong>Effective Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredExchangeRates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="text.secondary" py={2}>
                            No exchange rates configured. Click "Create Exchange Rate" to add one.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExchangeRates.map((rate) => (
                        <TableRow key={rate.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <CurrencyIcon fontSize="small" color="primary" />
                              <Typography variant="body2" fontWeight={500}>
                                {getCurrencyDisplay(rate.fromCurrencyId)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <SwapIcon fontSize="small" color="action" />
                              <Typography variant="body2" fontWeight={500}>
                                {getCurrencyDisplay(rate.toCurrencyId)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {rate.rate != null ? Number(rate.rate).toFixed(6) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {rate.rate != null ? getReversedRate(rate.rate) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(rate.effectiveDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            {rate.isActive ? (
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
                                onClick={() => handleOpenDialog(rate)}
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
                                onClick={() => handleOpenDeleteDialog(rate)}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {selectedExchangeRate ? 'Edit Exchange Rate' : 'Create Exchange Rate'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" error={!!formErrors.fromCurrencyId} required>
              <InputLabel>From Currency</InputLabel>
              <Select
                value={formData.fromCurrencyId}
                onChange={(e) => setFormData({ ...formData, fromCurrencyId: e.target.value })}
                label="From Currency"
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.09)
                        : 'background.paper',
                  },
                }}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </MenuItem>
                ))}
              </Select>
              {formErrors.fromCurrencyId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.fromCurrencyId}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={!!formErrors.toCurrencyId} required>
              <InputLabel>To Currency</InputLabel>
              <Select
                value={formData.toCurrencyId}
                onChange={(e) => setFormData({ ...formData, toCurrencyId: e.target.value })}
                label="To Currency"
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.09)
                        : 'background.paper',
                  },
                }}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </MenuItem>
                ))}
              </Select>
              {formErrors.toCurrencyId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.toCurrencyId}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Exchange Rate"
              type="number"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
              error={!!formErrors.rate}
              helperText={formErrors.rate || 'Example: 1 USD = 83.5 INR (rate = 83.5)'}
              margin="normal"
              required
              inputProps={{ step: '0.000001', min: '0' }}
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.09)
                      : 'background.paper',
                },
              }}
            />

            {formData.rate > 0 && formData.fromCurrencyId && formData.toCurrencyId && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Reverse Rate: 1 {getCurrencyDisplay(formData.toCurrencyId).split(' ')[0]} ={' '}
                {getReversedRate(formData.rate)} {getCurrencyDisplay(formData.fromCurrencyId).split(' ')[0]}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Effective Date"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              error={!!formErrors.effectiveDate}
              helperText={formErrors.effectiveDate}
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {selectedExchangeRate ? 'Update' : 'Create'}
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
        >Delete Exchange Rate</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this exchange rate? This action cannot be undone.
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExchangeRateConfig;

