import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Tooltip,
  Typography,
  TablePagination,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { SalaryHistory } from '../../types/salary-history.types';
import { salaryHistoryService } from '../../services/salaryHistoryService';
import type { SalaryHistoryFilterState } from './SalaryHistoryFilters';
import { useAuth } from '../../hooks/useAuth';

interface SalaryHistoryTableProps {
  filters: SalaryHistoryFilterState;
  onEdit?: (record: SalaryHistory) => void;
  onRefresh: () => void;
  refreshTrigger?: number;
}

interface EnrichedSalaryHistory extends SalaryHistory {
  userName?: string;
  employmentDetails?: string;
  previousSalary?: number;
  changeAmount?: number;
  changePercentage?: number;
  status: 'current' | 'scheduled' | 'historical';
}

const SalaryHistoryTable: React.FC<SalaryHistoryTableProps> = ({
  filters,
  onEdit,
  onRefresh,
  refreshTrigger = 0,
}) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<EnrichedSalaryHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const prevFiltersRef = useRef(filters);

  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('hr');

  // Load salary history records
  const loadRecords = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build search params based on filters
      const params: any = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        sortField: 'effectiveDate',
        sortOrder: 'DESC',
      };

      // Apply filters
      if (filters.search) {
        // Note: This would need backend support for text search
        // For now, we'll fetch all and filter client-side
      }

      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'scheduled') {
          params.isScheduled = true;
        } else if (filters.status === 'historical') {
          params.isScheduled = false;
        }
        // 'current' would need special handling - latest non-scheduled
      }

      if (filters.currency && filters.currency !== 'all') {
        params.currency = filters.currency;
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        params.startDate = startDate.toISOString();
      }

      if (filters.clientId) {
        params.clientId = filters.clientId;
      }

      const response = await salaryHistoryService.searchSalaryHistory(params);

      // Enrich data with calculated fields
      const enrichedData: EnrichedSalaryHistory[] = response.items.map((record, index) => {
        const previousRecord = response.items[index + 1];
        const changeAmount = previousRecord
          ? record.salaryAmount - previousRecord.salaryAmount
          : 0;
        const changePercentage = previousRecord && previousRecord.salaryAmount > 0
          ? ((changeAmount / previousRecord.salaryAmount) * 100)
          : 0;

        // Determine status
        let status: 'current' | 'scheduled' | 'historical' = 'historical';
        if (record.isScheduled) {
          status = 'scheduled';
        } else if (index === 0) {
          // First non-scheduled record is current
          status = 'current';
        }

        return {
          ...record,
          previousSalary: previousRecord?.salaryAmount,
          changeAmount,
          changePercentage,
          status,
        };
      });

      setRecords(enrichedData);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load salary history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if filters changed
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    
    if (filtersChanged && page !== 0) {
      // Reset page to 0 when filters change (only if not already on page 0)
      setPage(0);
      prevFiltersRef.current = filters;
      // Skip loadRecords in this render - it will run after page reset in next render
      return;
    }
    
    if (filtersChanged) {
      // Update ref if we're already on page 0
      prevFiltersRef.current = filters;
    }
    
    // Load records
    loadRecords();
  }, [filters, page, rowsPerPage, refreshTrigger]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (record: EnrichedSalaryHistory) => {
    if (onEdit) {
      onEdit(record);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusChip = (status: 'current' | 'scheduled' | 'historical') => {
    switch (status) {
      case 'current':
        return (
          <Chip
            label="Current"
            size="small"
            color="success"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'scheduled':
        return (
          <Chip
            label="Scheduled"
            size="small"
            color="warning"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'historical':
        return (
          <Chip
            label="Historical"
            size="small"
            color="default"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  if (records.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          💰
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          No salary records found
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Try adjusting your search or filter criteria
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer>
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
              {isAdmin && (
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                  Employee
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Current Salary
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Previous Salary
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Change
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Effective Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Reason
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow
                key={record.id}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child td': { borderBottom: 0 }
                }}
              >
                {isAdmin && (
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {record.employeeName || 'N/A'}
                      </Typography>
                      {record.employeeRole && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {record.employeeRole}
                        </Typography>
                      )}
                      {record.employmentStatus && (
                        <Chip
                          label={record.employmentStatus}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: record.employmentStatus === 'active' ? 'success.light' : 'default',
                            color: record.employmentStatus === 'active' ? 'success.contrastText' : 'text.secondary',
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {formatCurrency(record.salaryAmount, record.salaryCurrency)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {record.previousSalary
                      ? formatCurrency(record.previousSalary, record.salaryCurrency)
                      : 'N/A'
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  {record.changeAmount && record.changeAmount !== 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {record.changeAmount > 0 ? (
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      ) : (
                        <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: record.changeAmount > 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {record.changeAmount > 0 ? '+' : ''}
                        {formatCurrency(record.changeAmount, record.salaryCurrency)}
                        {record.changePercentage && (
                          <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                            ({record.changePercentage.toFixed(1)}%)
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Initial
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {format(new Date(record.effectiveDate), 'MMM dd, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {record.changeReason}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getStatusChip(record.status)}
                </TableCell>
                <TableCell>
                  {isAdmin && (
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit salary record">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(record)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': {
            paddingLeft: 3,
            paddingRight: 3,
          },
        }}
      />
    </Box>
  );
};

export default SalaryHistoryTable;
