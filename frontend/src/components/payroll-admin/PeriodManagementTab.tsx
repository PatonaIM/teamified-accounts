/**
 * Period Management Tab Component
 * CRUD interface for payroll periods with DataGrid
 * Story 7.8 - Payroll Administration
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Close from '@mui/icons-material/Close';
import Delete from '@mui/icons-material/Delete';
import ProcessingStatusBadge from './ProcessingStatusBadge';
import type {
  PayrollPeriod,
  CreatePayrollPeriodDto,
} from '../../types/payroll-admin/payrollAdmin.types';
import {
  listPeriods,
  createPeriod,
  updatePeriod,
  deletePeriod,
  getProcessingStatus,
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

const PeriodManagementTab: React.FC = () => {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PayrollPeriod | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form state
  const [formData, setFormData] = useState<CreatePayrollPeriodDto>({
    periodName: '',
    countryId: 'IN',
    startDate: '',
    endDate: '',
    payDate: '',
  });

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

  const handleOpenDialog = (period?: PayrollPeriod) => {
    if (period) {
      setEditingPeriod(period);
      // Convert UUID to country code for the dropdown
      const country = COUNTRIES.find(c => c.id === period.countryId);
      const countryCode = country ? country.code : period.countryId;
      
      setFormData({
        periodName: period.periodName,
        countryId: countryCode,
        startDate: period.startDate,
        endDate: period.endDate,
        payDate: period.payDate,
        status: period.status,
      });
    } else {
      setEditingPeriod(null);
      setFormData({
        periodName: '',
        countryId: selectedCountry,
        startDate: '',
        endDate: '',
        payDate: '',
        status: 'draft',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPeriod(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingPeriod) {
        await updatePeriod(editingPeriod.id, formData);
        showSnackbar('Period updated successfully', 'success');
      } else {
        await createPeriod(formData);
        showSnackbar('Period created successfully', 'success');
      }
      handleCloseDialog();
      loadPeriods();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to save period', 'error');
    }
  };

  const handleDelete = async (period: PayrollPeriod) => {
    if (!window.confirm(`Are you sure you want to delete the period "${period.periodName}"?`)) {
      return;
    }

    try {
      await deletePeriod(selectedCountry, period.id);
      showSnackbar('Period deleted successfully', 'success');
      loadPeriods();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete period', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
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
      field: 'payDate',
      headerName: 'Pay Date',
      width: 120,
      valueGetter: (value, row) => {
        if (!row || !row.payDate) return '';
        try {
          return new Date(row.payDate).toLocaleDateString();
        } catch {
          return row.payDate;
        }
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <ProcessingStatusBadge status={params.value} />
      ),
    },
    {
      field: 'totalEmployees',
      headerName: 'Employees',
      width: 100,
      align: 'center',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          {params.row.status === 'draft' && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {(params.row.status === 'draft' || params.row.status === 'open') && (
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => handleDelete(params.row)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          select
          label="Country"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          sx={{ 
            width: 200,
            '& .MuiSvgIcon-root': {
              color: (theme) => theme.palette.mode === 'dark' 
                ? alpha(theme.palette.common.white, 0.7)
                : 'inherit',
            },
          }}
        >
          {COUNTRIES.map((country) => (
            <MenuItem key={country.code} value={country.code}>
              {country.name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Create Period
        </Button>
      </Box>

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
          }}
        />
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPeriod ? 'Edit Payroll Period' : 'Create Payroll Period'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Period Name"
              value={formData.periodName}
              onChange={(e) => setFormData({ ...formData, periodName: e.target.value })}
              fullWidth
              required
              placeholder="e.g., January 2025"
            />

            <TextField
              select
              label="Country"
              value={formData.countryId}
              onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
              fullWidth
              required
            >
              {COUNTRIES.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Start Date"
              type="date"
              value={formData.startDate ? formData.startDate.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End Date"
              type="date"
              value={formData.endDate ? formData.endDate.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Pay Date"
              type="date"
              value={formData.payDate ? formData.payDate.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              label="Status"
              value={formData.status || 'draft'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              fullWidth
              helperText="Set to 'open' to make period available for processing"
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="processed">Processed</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPeriod ? 'Update' : 'Create'}
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

export default PeriodManagementTab;

