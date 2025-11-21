/**
 * Employee Selection Dialog Component
 * Story 7.8.1 - Employee Selection UI for Payroll Processing
 * Updated in Story 7.8.2 - Removed phantom fields (department, location)
 * 
 * Allows HR/Admin to select specific employees for payroll processing
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  alpha,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import type { EmployeeListItem } from '../../types/payroll-admin/payrollAdmin.types';
import { getEmployeesByCountry } from '../../services/payroll-admin/payrollAdminService';

interface EmployeeSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (selectedEmployeeIds: string[]) => void;
  countryCode: string;
  initialSelectedIds?: string[];
}

const EmployeeSelectionDialog: React.FC<EmployeeSelectionDialogProps> = ({
  open,
  onClose,
  onApply,
  countryCode,
  initialSelectedIds = [],
}) => {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>(initialSelectedIds);
  // Story 7.8.2: Removed department and location filters (phantom fields)

  // Load employees when dialog opens
  useEffect(() => {
    if (open && countryCode) {
      loadEmployees();
    }
  }, [open, countryCode]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeesByCountry(countryCode);
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Story 7.8.2: Removed department and location filter logic (phantom fields)

  // Filter and search employees (simplified - only search, no department/location filters)
  const filteredEmployees = useMemo(() => {
    if (!searchQuery) {
      return employees;
    }

    const query = searchQuery.toLowerCase();
    return employees.filter(
      emp =>
        emp.firstName.toLowerCase().includes(query) ||
        emp.lastName.toLowerCase().includes(query) ||
        emp.employeeId.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  // DataGrid columns (Story 7.8.2: Removed department/location, added role)
  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'Employee Name',
      width: 220,
      valueGetter: (value, row) => `${row.firstName} ${row.lastName}`,
      sortable: true,
    },
    {
      field: 'employeeId',
      headerName: 'Employee ID',
      width: 150,
      sortable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 280,
      sortable: true,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 180,
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  const handleSelectAll = () => {
    const allVisibleIds = filteredEmployees.map(emp => emp.id);
    setRowSelectionModel(allVisibleIds);
  };

  const handleDeselectAll = () => {
    setRowSelectionModel([]);
  };

  const handleApply = () => {
    if (rowSelectionModel.length === 0) {
      setError('Please select at least one employee or use "Clear & Use All Employees"');
      return;
    }
    onApply(rowSelectionModel as string[]);
  };

  const handleClearAndUseAll = () => {
    onApply([]);
  };

  const handleCancel = () => {
    setRowSelectionModel(initialSelectedIds);
    setSearchQuery('');
    onClose();
  };

  const selectedCount = rowSelectionModel.length;
  const totalCount = filteredEmployees.length;
  const allEmployeesCount = employees.length;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      aria-labelledby="employee-selection-dialog-title"
      aria-describedby="employee-selection-dialog-description"
    >
      <DialogTitle id="employee-selection-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Select Employees</Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCount} of {totalCount} selected
            {totalCount !== allEmployeesCount && ` (${allEmployeesCount} total)`}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box id="employee-selection-dialog-description" mb={2}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select specific employees to include in this payroll run. Leave empty to process all employees.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Search (Story 7.8.2: Removed department/location filters) */}
          <Box display="flex" gap={2} mb={2}>
            <TextField
              placeholder="Search by name, ID, email, or role"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              aria-label="Search employees"
            />
          </Box>

          {/* Bulk Actions */}
          <Box display="flex" gap={2} mb={2}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSelectAll}
              disabled={loading || filteredEmployees.length === 0}
            >
              Select All ({filteredEmployees.length})
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleDeselectAll}
              disabled={loading || selectedCount === 0}
            >
              Deselect All
            </Button>
          </Box>

          {/* Employee DataGrid */}
          <Box sx={{ height: 400, width: '100%' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                rows={filteredEmployees}
                columns={columns}
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={(newSelection) => {
                  setRowSelectionModel(newSelection);
                }}
                pageSizeOptions={[25, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 25 },
                  },
                }}
                sx={{
                  '& .MuiDataGrid-row:hover': {
                    cursor: 'pointer',
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
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleClearAndUseAll} variant="outlined">
          Clear & Use All Employees
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={loading || selectedCount === 0}
        >
          Apply Selection ({selectedCount})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeSelectionDialog;

