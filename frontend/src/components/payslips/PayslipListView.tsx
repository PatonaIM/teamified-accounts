/**
 * Payslip List View Component
 * Displays employee's payslips with filters and actions
 * Story 7.6 - Payroll Self-Service
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { PayslipPreviewDialog } from './PayslipPreviewDialog';
import api from '../../services/authService';

interface Payslip {
  id: string;
  payrollPeriodId: string;
  payrollPeriod?: {
    id: string;
    periodName: string;
    startDate: string;
    endDate: string;
    payDate: string;
  };
  calculatedAt: string;
  grossPay: number;
  netPay: number;
  currencyCode: string;
  status: 'draft' | 'processing' | 'available' | 'downloaded';
  pdfPath: string | null;
  createdAt: string;
}

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'info'> = {
  draft: 'default',
  processing: 'info',
  available: 'success',
  downloaded: 'primary',
};

export const PayslipListView: React.FC = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPayslips = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params: any = {
        page: page + 1,
        limit: pageSize,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await api.get('/v1/payroll/payslips', { params });
      
      const payslipsData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setPayslips(payslipsData);
      setTotalCount(response.data.total || payslipsData.length);
    } catch (err: any) {
      console.error('Failed to fetch payslips:', err);
      setError(err.response?.data?.message || 'Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [page, pageSize, statusFilter, user?.id]);

  const handleViewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setPreviewOpen(true);
  };

  const handleDownloadPayslip = async (payslip: Payslip) => {
    try {
      if (!payslip.pdfPath) {
        alert('PDF generation is in progress. Please try again in a few moments.');
        return;
      }

      const response = await api.get(`/v1/payroll/payslips/${payslip.id}/download`);
      const { downloadUrl } = response.data;
      
      alert('PDF download functionality is coming soon. You can view payslip details by clicking the view icon.');
    } catch (err: any) {
      console.error('Failed to download payslip:', err);
      alert(err.response?.data?.message || 'Failed to download payslip');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'calculatedAt',
      headerName: 'Date',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const date = new Date(params.value);
        return date.toLocaleDateString();
      },
    },
    {
      field: 'payrollPeriodId',
      headerName: 'Period',
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const payslip = params.row as Payslip;
        return payslip.payrollPeriod?.periodName || `Period ${params.value.slice(0, 8)}...`;
      },
    },
    {
      field: 'grossPay',
      headerName: 'Gross Pay',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const { grossPay, currencyCode } = params.row;
        return `${currencyCode} ${grossPay.toLocaleString()}`;
      },
    },
    {
      field: 'netPay',
      headerName: 'Net Pay',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const { netPay, currencyCode } = params.row;
        return (
          <Typography fontWeight="600" color="primary">
            {currencyCode} {netPay.toLocaleString()}
          </Typography>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value.toUpperCase()} 
          color={statusColors[params.value] || 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const payslip = params.row as Payslip;
        return (
          <Box>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => handleViewPayslip(payslip)}
                color="primary"
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {payslip.pdfPath && (
              <Tooltip title="Download PDF">
                <IconButton
                  size="small"
                  onClick={() => handleDownloadPayslip(payslip)}
                  color="secondary"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="600">
            My Payslips
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchPayslips} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ 
              minWidth: 200,
              '& .MuiSvgIcon-root': {
                color: 'text.secondary',
              },
            }}
            size="small"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="downloaded">Downloaded</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
          </TextField>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={payslips}
            columns={columns}
            loading={loading}
            pagination
            paginationMode="server"
            rowCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.common.white, 0.05) 
                    : alpha(theme.palette.common.black, 0.04),
              },
              '& .MuiDataGrid-iconSeparator': {
                color: 'text.secondary',
              },
              '& .MuiTablePagination-actions .MuiSvgIcon-root': {
                color: 'text.secondary',
              },
              '& .MuiDataGrid-sortIcon': {
                color: 'text.secondary',
              },
            }}
          />
        </Box>

        {!loading && payslips.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">
              No payslips available. Payslips will appear here once they are generated by your HR team.
            </Typography>
          </Box>
        )}
      </Paper>

      {selectedPayslip && (
        <PayslipPreviewDialog
          open={previewOpen}
          payslipId={selectedPayslip.id}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedPayslip(null);
          }}
        />
      )}
    </>
  );
};
