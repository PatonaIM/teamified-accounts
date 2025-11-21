/**
 * Timesheet Approval Panel Component
 * Manager interface for approving/rejecting submitted timesheets
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Checkbox,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  styled,
  Badge,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
  WbSunny,
  AccessTime,
  NightsStay,
  FactCheck,
  Clear,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Timesheet, TimesheetType } from '../../types/timesheets/timesheet.types';
import {
  getTimesheets,
  approveTimesheet,
  rejectTimesheet,
  bulkApproveTimesheets,
} from '../../services/timesheets/timesheetService';
import { TimesheetDetailDialog } from './TimesheetDetailDialog';

// Styled components matching the modern design
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
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

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(3),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 2,
  fontWeight: 600,
  textTransform: 'none',
  padding: theme.spacing(1, 3),
}));

export const TimesheetApprovalPanel: React.FC = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadTimesheets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getTimesheets({
        status: 'submitted',
        limit: 50,
      });
      setTimesheets(response.timesheets);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimesheets();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(timesheets.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleApprove = async (id?: string) => {
    setProcessing(true);
    try {
      if (id) {
        await approveTimesheet(id, { comments });
      } else {
        await bulkApproveTimesheets({
          timesheetIds: Array.from(selectedIds),
          comments,
        });
      }
      setApproveDialogOpen(false);
      setComments('');
      setSelectedIds(new Set());
      await loadTimesheets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve timesheet');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    
    setProcessing(true);
    try {
      await rejectTimesheet(id, {
        reason: rejectionReason,
        comments,
      });
      setRejectDialogOpen(false);
      setComments('');
      setRejectionReason('');
      await loadTimesheets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject timesheet');
    } finally {
      setProcessing(false);
    }
  };

  const getTypeIcon = (type: TimesheetType) => {
    const icons = {
      daily: <WbSunny fontSize="small" />,
      weekly: <AccessTime fontSize="small" />,
    };
    return icons[type] || <AccessTime fontSize="small" />;
  };

  const selectedCount = selectedIds.size;

  return (
    <>
      <StyledCard>
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress />
            </Box>
          ) : timesheets.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No pending timesheets for approval
            </Alert>
          ) : (
            <StyledTableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCount === timesheets.length && timesheets.length > 0}
                        indeterminate={selectedCount > 0 && selectedCount < timesheets.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{ color: 'primary.main' }}
                      />
                    </TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Work Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timesheets.map((timesheet) => (
                    <TableRow key={timesheet.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.has(timesheet.id)}
                          onChange={(e) => handleSelectOne(timesheet.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {timesheet.user
                            ? `${timesheet.user.firstName} ${timesheet.user.lastName}`
                            : 'N/A'}
                        </Typography>
                        {timesheet.user && (
                          <Typography variant="caption" color="text.secondary">
                            {timesheet.user.email}
                          </Typography>
                        )}
                      </TableCell>
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
                        <Typography variant="body2" color="text.secondary">
                          {timesheet.submittedAt
                            ? format(new Date(timesheet.submittedAt), 'MMM d, yyyy')
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTimesheet(timesheet);
                              setDetailDialogOpen(true);
                            }}
                            sx={{
                              color: 'primary.main',
                              '&:hover': { backgroundColor: 'primary.lighter' },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTimesheet(timesheet);
                              setApproveDialogOpen(true);
                            }}
                            sx={{
                              color: 'success.main',
                              '&:hover': { backgroundColor: 'success.lighter' },
                            }}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTimesheet(timesheet);
                              setRejectDialogOpen(true);
                            }}
                            sx={{
                              color: 'error.main',
                              '&:hover': { backgroundColor: 'error.lighter' },
                            }}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          )}
        </Box>
      </StyledCard>

      {/* Approve Dialog */}
      <Dialog 
        open={approveDialogOpen} 
        onClose={() => setApproveDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <StyledDialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircle sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedTimesheet && !selectedIds.has(selectedTimesheet.id)
                  ? 'Approve Timesheet'
                  : `Approve ${selectedCount} Timesheet(s)`}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Confirm approval and add optional comments
              </Typography>
            </Box>
          </Box>
        </StyledDialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <TextField
            fullWidth
            label="Comments (Optional)"
            placeholder="Add approval comments..."
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
          <Button 
            onClick={() => setApproveDialogOpen(false)} 
            disabled={processing}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() =>
              handleApprove(
                selectedTimesheet && !selectedIds.has(selectedTimesheet.id)
                  ? selectedTimesheet.id
                  : undefined
              )
            }
            disabled={processing}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
            }}
          >
            {processing ? <CircularProgress size={20} color="inherit" /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => setRejectDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <StyledDialogTitle sx={{ background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Cancel sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Reject Timesheet
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Provide a reason for rejection
              </Typography>
            </Box>
          </Box>
        </StyledDialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <TextField
            fullWidth
            required
            label="Rejection Reason"
            placeholder="Explain why this timesheet is being rejected..."
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            error={!rejectionReason.trim() && rejectionReason.length > 0}
            helperText={!rejectionReason.trim() && rejectionReason.length > 0 ? 'Rejection reason is required' : ''}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          <TextField
            fullWidth
            label="Additional Comments (Optional)"
            placeholder="Add any additional comments..."
            multiline
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
          <Button 
            onClick={() => setRejectDialogOpen(false)} 
            disabled={processing}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => selectedTimesheet && handleReject(selectedTimesheet.id)}
            disabled={processing || !rejectionReason.trim()}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
            }}
          >
            {processing ? <CircularProgress size={20} color="inherit" /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      <TimesheetDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        timesheet={selectedTimesheet}
      />
    </>
  );
};

