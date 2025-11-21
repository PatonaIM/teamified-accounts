/**
 * Bulk Operations Tab Component
 * Bulk processing, period management, validation
 * Story 7.8 - Payroll Administration
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  LinearProgress,
  alpha,
} from '@mui/material';
import PlaylistAddCheck from '@mui/icons-material/PlaylistAddCheck';
import Lock from '@mui/icons-material/Lock';
import LockOpen from '@mui/icons-material/LockOpen';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import ProcessingStatusBadge from './ProcessingStatusBadge';
import type {
  PayrollPeriod,
} from '../../types/payroll-admin/payrollAdmin.types';

// Local result interface for bulk operations
interface BulkProcessingResult {
  successCount: number;
  failureCount: number;
  totalRequested: number;
  totalProcessed: number;
  results: Array<{
    periodId: string;
    periodName: string;
    success: boolean;
    error?: string;
    message?: string;
  }>;
  successResults: Array<{
    periodId: string;
    periodName: string;
    success: boolean;
    message?: string;
  }>;
  failureResults: Array<{
    periodId: string;
    periodName: string;
    success: boolean;
    error?: string;
  }>;
}
import {
  listPeriods,
  bulkProcessPeriods,
  bulkClosePeriods,
  bulkOpenPeriods,
  bulkValidatePeriods,
  calculateProgress,
} from '../../services/payroll-admin/payrollAdminService';

// Actual country UUIDs from database (Story 7.8.2 fix)
const COUNTRIES = [
  { code: 'IN', name: 'India', id: '650e8400-e29b-41d4-a716-2bd592160263' },
  { code: 'PH', name: 'Philippines', id: '650e8400-e29b-41d4-a716-69ac9246a044' },
  { code: 'AU', name: 'Australia', id: '650e8400-e29b-41d4-a716-f5cb7d6f64b8' },
];

// Helper function to get country code from ID
const getCountryCode = (countryId: string): string => {
  const country = COUNTRIES.find(c => c.id === countryId);
  return country ? country.code : countryId;
};

const BulkOperationsTab: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: '' as 'process' | 'close' | 'open' | 'validate',
  });
  const [resultDialog, setResultDialog] = useState<{ open: boolean; result: BulkProcessingResult | null }>({
    open: false,
    result: null,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });

  useEffect(() => {
    loadPeriods();
  }, [selectedCountry]);

  const loadPeriods = async () => {
    setLoading(true);
    try {
      const data = await listPeriods(selectedCountry);
      setPeriods(data);
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to load periods', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkProcess = async () => {
    setLoading(true);
    try {
      const result = await bulkProcessPeriods({
        periodIds: selectedPeriods,
      });
      setResultDialog({ open: true, result });
      showSnackbar(`Bulk processing completed: ${result.successCount} succeeded, ${result.failureCount} failed`, 'success');
      await loadPeriods();
    } catch (error: any) {
      showSnackbar(error.message || 'Bulk processing failed', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: 'process' });
    }
  };

  const handleBulkClose = async () => {
    setLoading(true);
    try {
      const result = await bulkClosePeriods({
        periodIds: selectedPeriods,
      });
      setResultDialog({ open: true, result });
      showSnackbar(`Bulk close completed: ${result.successCount} succeeded`, 'success');
      await loadPeriods();
    } catch (error: any) {
      showSnackbar(error.message || 'Bulk close failed', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: 'close' });
    }
  };

  const handleBulkOpen = async () => {
    setLoading(true);
    try {
      const result = await bulkOpenPeriods({
        periodIds: selectedPeriods,
      });
      setResultDialog({ open: true, result });
      showSnackbar(`Bulk open completed: ${result.successCount} succeeded`, 'success');
      await loadPeriods();
    } catch (error: any) {
      showSnackbar(error.message || 'Bulk open failed', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: 'open' });
    }
  };

  const handleBulkValidate = async () => {
    setLoading(true);
    try {
      const validationResults = await bulkValidatePeriods({
        periodIds: selectedPeriods,
      });
      
      // Calculate success/failure counts from validation results
      const validCount = validationResults.filter(r => r.isValid).length;
      const invalidCount = validationResults.filter(r => !r.isValid).length;
      
      // Transform array response to match BulkOperationResult structure for dialog
      const transformedResults = validationResults.map(v => ({
        periodId: v.periodId,
        periodName: v.periodName,
        success: v.isValid,
        error: v.validationErrors.length > 0 ? v.validationErrors.join(', ') : undefined,
        message: v.isValid ? `Period ${v.periodName} is valid` : undefined,
      }));
      
      const result = {
        successCount: validCount,
        failureCount: invalidCount,
        totalRequested: validationResults.length,
        totalProcessed: validationResults.length,
        results: transformedResults,
        successResults: transformedResults.filter(r => r.success),
        failureResults: transformedResults.filter(r => !r.success),
      };
      
      setResultDialog({ open: true, result });
      showSnackbar(
        `Validation completed: ${validCount} valid, ${invalidCount} invalid`, 
        invalidCount > 0 ? 'warning' : 'success'
      );
    } catch (error: any) {
      showSnackbar(error.message || 'Bulk validation failed', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: 'validate' });
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleConfirm = () => {
    switch (confirmDialog.action) {
      case 'process':
        handleBulkProcess();
        break;
      case 'close':
        handleBulkClose();
        break;
      case 'open':
        handleBulkOpen();
        break;
      case 'validate':
        handleBulkValidate();
        break;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'periodName',
      headerName: 'Period Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'countryId',
      headerName: 'Country',
      width: 100,
      valueGetter: (value, row) => {
        if (!row || !row.countryId) return '';
        return getCountryCode(row.countryId);
      },
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      valueGetter: (value, row) => {
        if (!row || !row.startDate) return '';
        try {
          return new Date(row.startDate).toLocaleDateString();
        } catch {
          return row.startDate;
        }
      },
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 120,
      valueGetter: (value, row) => {
        if (!row || !row.endDate) return '';
        try {
          return new Date(row.endDate).toLocaleDateString();
        } catch {
          return row.endDate;
        }
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <ProcessingStatusBadge status={params.value} />,
    },
    {
      field: 'totalEmployees',
      headerName: 'Employees',
      width: 100,
      align: 'center',
    },
  ];

  const canProcess = selectedPeriods.length > 0 && periods.filter(p => selectedPeriods.includes(p.id)).every(p => p.status === 'open');
  const canClose = selectedPeriods.length > 0 && periods.filter(p => selectedPeriods.includes(p.id)).every(p => p.status === 'closed' || p.status === 'processing');
  const canOpen = selectedPeriods.length > 0 && periods.filter(p => selectedPeriods.includes(p.id)).every(p => p.status === 'closed');

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Bulk Operations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select multiple periods to perform bulk operations
        </Typography>
      </Box>

      {/* Country Selector */}
      <Box mb={3}>
        <TextField
          select
          label="Country"
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setSelectedPeriods([]);
          }}
          sx={{ width: 200 }}
        >
          {COUNTRIES.map((country) => (
            <MenuItem key={country.code} value={country.code}>
              {country.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Action Buttons */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            {selectedPeriods.length} period(s) selected
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlaylistAddCheck />}
              onClick={() => setConfirmDialog({ open: true, action: 'process' })}
              disabled={!canProcess || loading}
            >
              Bulk Process
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Lock />}
              onClick={() => setConfirmDialog({ open: true, action: 'close' })}
              disabled={!canClose || loading}
            >
              Bulk Close
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<LockOpen />}
              onClick={() => setConfirmDialog({ open: true, action: 'open' })}
              disabled={!canOpen || loading}
            >
              Bulk Open
            </Button>
            <Button
              variant="outlined"
              startIcon={<CheckCircle />}
              onClick={() => setConfirmDialog({ open: true, action: 'validate' })}
              disabled={selectedPeriods.length === 0 || loading}
            >
              Validate All
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={periods}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) => {
            setSelectedPeriods(newSelection as string[]);
          }}
          rowSelectionModel={selectedPeriods}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-row:hover': { 
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.common.white, 0.05)
                  : alpha(theme.palette.common.black, 0.04)
            },
            '& .MuiTablePagination-root': {
              color: (theme) => theme.palette.mode === 'dark' 
                ? alpha(theme.palette.common.white, 0.7)
                : 'inherit',
            },
            '& .MuiTablePagination-selectIcon': {
              color: (theme) => theme.palette.mode === 'dark' 
                ? alpha(theme.palette.common.white, 0.7)
                : 'inherit',
            },
            '& .MuiTablePagination-actions button': {
              color: (theme) => theme.palette.mode === 'dark' 
                ? alpha(theme.palette.common.white, 0.7)
                : 'inherit',
            },
            bgcolor: 'background.paper',
          }}
        />
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: 'process' })}>
        <DialogTitle
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          Confirm Bulk {confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1)}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            {confirmDialog.action === 'process' &&
              `Are you sure you want to process ${selectedPeriods.length} period(s)? This will start payroll processing for all selected periods.`}
            {confirmDialog.action === 'close' &&
              `Are you sure you want to close ${selectedPeriods.length} period(s)? This will lock the periods and prevent further modifications.`}
            {confirmDialog.action === 'open' &&
              `Are you sure you want to open ${selectedPeriods.length} period(s)? This will unlock the periods for modifications.`}
            {confirmDialog.action === 'validate' &&
              `Validate ${selectedPeriods.length} period(s) for data integrity and compliance?`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setConfirmDialog({ open: false, action: 'process' })}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Dialog */}
      <Dialog
        open={resultDialog.open}
        onClose={() => setResultDialog({ open: false, result: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          Bulk Operation Results
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {resultDialog.result && (
            <Box>
              {/* Summary */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                      border: '1px solid',
                      borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
                      p: 2, 
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" color="success.main">
                      {resultDialog.result.successCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Succeeded
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                      border: '1px solid',
                      borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
                      p: 2, 
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" color="error.main">
                      {resultDialog.result.failureCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Failed
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Progress */}
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Overall Progress</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {resultDialog.result.totalProcessed} / {resultDialog.result.totalRequested}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress(resultDialog.result.totalProcessed, resultDialog.result.totalRequested)}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>

              {/* Success Details */}
              {resultDialog.result.successResults.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Successful Operations
                  </Typography>
                  {resultDialog.result.successResults.map((result, index) => (
                    <Alert key={index} severity="success" sx={{ mb: 1 }}>
                      <Typography variant="body2">{result.message || `Period ${result.periodName} processed successfully`}</Typography>
                    </Alert>
                  ))}
                </Box>
              )}

              {/* Failure Details */}
              {resultDialog.result.failureResults.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Failed Operations
                  </Typography>
                  {resultDialog.result.failureResults.map((result, index) => (
                    <Alert key={index} severity="error" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Period ID: {result.periodId}
                      </Typography>
                      <Typography variant="caption">{result.error}</Typography>
                    </Alert>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialog({ open: false, result: null })} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BulkOperationsTab;

