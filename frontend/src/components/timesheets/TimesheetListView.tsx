/**
 * Timesheet List View Component
 * Displays submitted timesheets with filtering, status indicators, and action buttons
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Button,
  CircularProgress,
  Alert,
  Grid,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle,
  Cancel,
  Schedule,
  Error,
  WbSunny,
  AccessTime,
  NightsStay,
  CalendarMonth,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import type { Timesheet, TimesheetStatus, TimesheetType } from '../../types/timesheets/timesheet.types';
import { getTimesheets, deleteTimesheet } from '../../services/timesheets/timesheetService';
import { TimesheetDetailDialog } from './TimesheetDetailDialog';

// Styled components matching Profile page design
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
}));

const FilterCard = styled(Paper)(({ theme }) => ({
  borderRadius: 3,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 3,
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[50],
    '& .MuiTableCell-head': {
      fontWeight: 600,
      color: theme.palette.text.primary,
      borderBottom: `2px solid ${theme.palette.divider}`,
    },
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transition: 'background-color 0.2s ease',
    },
  },
}));

interface TimesheetListViewProps {
  onEditTimesheet?: (timesheet: Timesheet) => void;
}

export const TimesheetListView: React.FC<TimesheetListViewProps> = ({ onEditTimesheet }) => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [timesheetToDelete, setTimesheetToDelete] = useState<Timesheet | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<TimesheetType | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const loadTimesheets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getTimesheets({
        page,
        limit,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        timesheetType: typeFilter !== 'ALL' ? typeFilter : undefined,
        dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
        dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
      });
      
      setTimesheets(response.timesheets);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimesheets();
  }, [page, statusFilter, typeFilter, dateFrom, dateTo]);

  const handleViewDetails = (timesheet: Timesheet) => {
    setSelectedTimesheet(timesheet);
    setDetailDialogOpen(true);
  };

  const handleEditClick = (timesheet: Timesheet) => {
    if (onEditTimesheet) {
      onEditTimesheet(timesheet);
    }
  };

  const handleDeleteClick = (timesheet: Timesheet) => {
    setTimesheetToDelete(timesheet);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!timesheetToDelete) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      await deleteTimesheet(timesheetToDelete.id);
      setSuccess('Timesheet deleted successfully');
      setDeleteDialogOpen(false);
      setTimesheetToDelete(null);
      // Refresh the list
      await loadTimesheets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete timesheet');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTimesheetToDelete(null);
  };

  const getStatusIcon = (status: TimesheetStatus) => {
    const icons = {
      draft: <Schedule fontSize="small" />,
      submitted: <AccessTime fontSize="small" />,
      approved: <CheckCircle fontSize="small" />,
      rejected: <Error fontSize="small" />,
    };
    return icons[status] || <Schedule fontSize="small" />;
  };

  const getStatusColor = (status: TimesheetStatus): "default" | "info" | "success" | "error" => {
    const colors = {
      draft: 'default' as const,
      submitted: 'info' as const,
      approved: 'success' as const,
      rejected: 'error' as const,
    };
    return colors[status] || 'default';
  };

  const getTypeIcon = (type: TimesheetType) => {
    const icons = {
      daily: <WbSunny fontSize="small" />,
      weekly: <AccessTime fontSize="small" />,
    };
    return icons[type] || <AccessTime fontSize="small" />;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StyledCard>
        <Box sx={{ p: 3 }}>
          {/* Filters */}
          <FilterCard elevation={0}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
              Filter Timesheets
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    sx={{
                      '& .MuiSvgIcon-root': {
                        color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                      },
                    }}
                  >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    sx={{
                      '& .MuiSvgIcon-root': {
                        color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                      },
                    }}
                  >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="From Date"
                  value={dateFrom}
                  onChange={setDateFrom}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      sx: {
                        '& .MuiSvgIcon-root': {
                          color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                        },
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="To Date"
                  value={dateTo}
                  onChange={setDateTo}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      sx: {
                        '& .MuiSvgIcon-root': {
                          color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                        },
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </FilterCard>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress />
            </Box>
          ) : timesheets.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>No timesheets found</Alert>
          ) : (
            <>
              <StyledTableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Work Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Total Hours</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timesheets.map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {timesheet.timesheetType === 'weekly' && timesheet.weekStartDate && timesheet.weekEndDate
                              ? `${format(new Date(timesheet.weekStartDate), 'MMM d')} - ${format(new Date(timesheet.weekEndDate), 'MMM d, yyyy')}`
                              : format(new Date(timesheet.workDate), 'MMM d, yyyy')}
                          </Typography>
                          {timesheet.timesheetType === 'weekly' && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Week {format(new Date(timesheet.weekStartDate || timesheet.workDate), 'w, yyyy')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getTypeIcon(timesheet.timesheetType)}
                            label={timesheet.timesheetType.charAt(0).toUpperCase() + timesheet.timesheetType.slice(1)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip
                            title={`Regular: ${timesheet.regularHours}h, Overtime: ${timesheet.overtimeHours}h, Night: ${timesheet.nightShiftHours}h`}
                          >
                            <Typography variant="body1" fontWeight="600" color="primary">
                              {timesheet.totalHours}h
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(timesheet.status)}
                            label={timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                            color={getStatusColor(timesheet.status)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {timesheet.submittedAt
                              ? format(new Date(timesheet.submittedAt), 'MMM d, yyyy')
                              : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            {/* Edit button for draft and submitted timesheets */}
                            {(timesheet.status === 'draft' || timesheet.status === 'submitted') && (
                              <Tooltip title="Edit Timesheet">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditClick(timesheet)}
                                  sx={{
                                    color: 'warning.main',
                                    '&:hover': {
                                      backgroundColor: 'warning.lighter',
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {/* Delete button for draft and submitted timesheets */}
                            {(timesheet.status === 'draft' || timesheet.status === 'submitted') && (
                              <Tooltip title="Delete Timesheet">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(timesheet)}
                                  sx={{
                                    color: 'error.main',
                                    '&:hover': {
                                      backgroundColor: 'error.lighter',
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(timesheet)}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': {
                                    backgroundColor: 'primary.lighter',
                                  },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </>
          )}
        </Box>
      </StyledCard>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Timesheet?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this timesheet? This action cannot be undone.
            {timesheetToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="600">
                  {timesheetToDelete.timesheetType === 'weekly' && timesheetToDelete.weekStartDate && timesheetToDelete.weekEndDate
                    ? `${format(new Date(timesheetToDelete.weekStartDate), 'MMM d')} - ${format(new Date(timesheetToDelete.weekEndDate), 'MMM d, yyyy')}`
                    : format(new Date(timesheetToDelete.workDate), 'MMM d, yyyy')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Hours: {timesheetToDelete.totalHours}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {timesheetToDelete.status.charAt(0).toUpperCase() + timesheetToDelete.status.slice(1)}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            sx={{ textTransform: 'none' }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <TimesheetDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        timesheet={selectedTimesheet}
      />
    </LocalizationProvider>
  );
};

