/**
 * Leave Request List View Component
 * Displays and manages list of leave requests with filtering, sorting, and actions
 * Supports 5 statuses: DRAFT, SUBMITTED, APPROVED, REJECTED, CANCELLED
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Edit,
  Send,
  XCircle,
  Eye,
  Trash2,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { LeaveRequestStatus, LeaveType } from '../../types/leave/leave.types';
import type {
  LeaveRequest,
  LeaveFilterState,
  LeaveSortState,
} from '../../types/leave/leave.types';
import { getLeaveTypeLabel } from '../../config/countryLeaveTypeMapping';
import leaveService from '../../services/leave/leaveService';

interface LeaveRequestListViewProps {
  showActions?: boolean;
  userId?: string;
  onEdit?: (request: LeaveRequest) => void;
  onView?: (request: LeaveRequest) => void;
  onRefresh?: () => void;
}

// Status color mapping
const getStatusColor = (status: LeaveRequestStatus): 'default' | 'warning' | 'success' | 'error' | 'info' => {
  switch (status) {
    case LeaveRequestStatus.DRAFT:
      return 'default';
    case LeaveRequestStatus.SUBMITTED:
      return 'warning';
    case LeaveRequestStatus.APPROVED:
      return 'success';
    case LeaveRequestStatus.REJECTED:
      return 'error';
    case LeaveRequestStatus.CANCELLED:
      return 'info';
    default:
      return 'default';
  }
};

// Status label mapping
const getStatusLabel = (status: LeaveRequestStatus): string => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const LeaveRequestListView: React.FC<LeaveRequestListViewProps> = ({
  showActions = true,
  userId,
  onEdit,
  onView,
  onRefresh,
}) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtering
  const [filters, setFilters] = useState<LeaveFilterState>({
    status: undefined,
    leaveType: undefined,
    searchTerm: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortState, setSortState] = useState<LeaveSortState>({
    field: 'createdAt',
    direction: 'desc',
  });

  // Load requests
  useEffect(() => {
    loadRequests();
  }, [userId, filters.status, filters.leaveType]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaveService.getLeaveRequests({
        userId,
        status: filters.status,
        leaveType: filters.leaveType,
      });
      // Ensure data is an array
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load leave requests');
      setRequests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadRequests();
    if (onRefresh) onRefresh();
  };

  // Ensure requests is an array before filtering
  const requestsArray = Array.isArray(requests) ? requests : [];

  // Filter and sort requests
  const filteredRequests = requestsArray.filter((request) => {
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        request.notes?.toLowerCase().includes(searchLower) ||
        getLeaveTypeLabel(request.leaveType).toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const multiplier = sortState.direction === 'asc' ? 1 : -1;
    
    switch (sortState.field) {
      case 'startDate':
        return multiplier * (new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      case 'endDate':
        return multiplier * (new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
      case 'createdAt':
        return multiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      case 'leaveType':
        return multiplier * a.leaveType.localeCompare(b.leaveType);
      default:
        return 0;
    }
  });

  // Paginated requests
  const paginatedRequests = sortedRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Action handlers
  const handleSubmit = async (request: LeaveRequest) => {
    try {
      await leaveService.submitLeaveRequest(request.id);
      setSuccess('Leave request submitted successfully!');
      loadRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request');
    }
  };

  const handleCancel = async (request: LeaveRequest) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      await leaveService.cancelLeaveRequest(request.id);
      setSuccess('Leave request cancelled successfully');
      loadRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel leave request');
    }
  };

  const handleDelete = async (request: LeaveRequest) => {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      await leaveService.deleteLeaveRequest(request.id);
      setSuccess('Draft deleted successfully');
      loadRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to delete draft');
    }
  };

  const canEdit = (request: LeaveRequest) => request.status === LeaveRequestStatus.DRAFT;
  const canSubmit = (request: LeaveRequest) => request.status === LeaveRequestStatus.DRAFT;
  const canCancel = (request: LeaveRequest) =>
    request.status === LeaveRequestStatus.DRAFT || request.status === LeaveRequestStatus.SUBMITTED;
  const canDelete = (request: LeaveRequest) => request.status === LeaveRequestStatus.DRAFT;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filter Controls */}
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search leave requests..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="outlined"
              startIcon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={handleRefresh}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Refresh
            </Button>

            <Box sx={{ flex: 1 }} />

            <Typography variant="body2" color="text.secondary">
              {sortedRequests.length} request{sortedRequests.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>

          {showFilters && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    status: e.target.value ? e.target.value as LeaveRequestStatus : undefined
                  }))}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.values(LeaveRequestStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                size="small"
                onClick={() => setFilters({ searchTerm: '' })}
                sx={{ textTransform: 'none' }}
              >
                Clear Filters
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading leave requests...
            </Typography>
          </Box>
        ) : paginatedRequests.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {filters.status || filters.leaveType || filters.searchTerm
                ? 'No leave requests match your filters'
                : 'No leave requests found'}
            </Typography>
            {(filters.status || filters.leaveType || filters.searchTerm) && (
              <Button
                variant="text"
                onClick={() => setFilters({ searchTerm: '' })}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Leave Type</strong></TableCell>
                    <TableCell><strong>Dates</strong></TableCell>
                    <TableCell align="center"><strong>Days</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Submitted</strong></TableCell>
                    {showActions && <TableCell align="center"><strong>Actions</strong></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: onView ? 'pointer' : 'default',
                      }}
                      onClick={() => onView && onView(request)}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {getLeaveTypeLabel(request.leaveType)}
                        </Typography>
                        {request.notes && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                            {request.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${request.totalDays} day${request.totalDays !== 1 ? 's' : ''}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(request.status)}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      {showActions && (
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {canEdit(request) && onEdit && (
                              <Tooltip title="Edit Draft">
                                <IconButton size="small" onClick={() => onEdit(request)} color="primary">
                                  <Edit size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canSubmit(request) && (
                              <Tooltip title="Submit for Approval">
                                <IconButton size="small" onClick={() => handleSubmit(request)} color="success">
                                  <Send size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canCancel(request) && (
                              <Tooltip title="Cancel Request">
                                <IconButton size="small" onClick={() => handleCancel(request)} color="warning">
                                  <XCircle size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canDelete(request) && (
                              <Tooltip title="Delete Draft">
                                <IconButton size="small" onClick={() => handleDelete(request)} color="error">
                                  <Trash2 size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => onView && onView(request)} color="info">
                                <Eye size={16} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={sortedRequests.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Card>
    </Box>
  );
};

export default LeaveRequestListView;

