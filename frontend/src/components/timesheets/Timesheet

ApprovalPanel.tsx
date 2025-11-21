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
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
  WbSunny,
  AccessTime,
  NightsStay,
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
        status: 'SUBMITTED',
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
        rejectionReason,
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
      REGULAR: <WbSunny fontSize="small" />,
      OVERTIME: <AccessTime fontSize="small" />,
      NIGHT_SHIFT: <NightsStay fontSize="small" />,
    };
    return icons[type];
  };

  const selectedCount = selectedIds.size;

  return (
    <>
      <Card>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h5">Timesheet Approvals</Typography>
              <Chip
                label={`${timesheets.length} pending`}
                color="info"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedCount > 0 && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => setApproveDialogOpen(true)}
                  >
                    Approve ({selectedCount})
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Clear
                  </Button>
                </>
              )}
              <IconButton onClick={loadTimesheets} disabled={loading}>
                <Refresh />
              </IconButton>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : timesheets.length === 0 ? (
            <Alert severity="info">No pending timesheets</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCount === timesheets.length && timesheets.length > 0}
                        indeterminate={selectedCount > 0 && selectedCount < timesheets.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
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
                    <TableRow key={timesheet.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.has(timesheet.id)}
                          onChange={(e) => handleSelectOne(timesheet.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        {timesheet.user
                          ? `${timesheet.user.firstName} ${timesheet.user.lastName}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(timesheet.workDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getTypeIcon(timesheet.timesheetType)}
                          label={timesheet.timesheetType}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip
                          title={`Reg: ${timesheet.regularHours}h, OT: ${timesheet.overtimeHours}h, Night: ${timesheet.nightShiftHours}h`}
                        >
                          <strong>{timesheet.totalHours}h</strong>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {timesheet.submittedAt
                          ? format(new Date(timesheet.submittedAt), 'MMM d')
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTimesheet(timesheet);
                              setDetailDialogOpen(true);
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => {
                              setSelectedTimesheet(timesheet);
                              setApproveDialogOpen(true);
                            }}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedTimesheet(timesheet);
                              setRejectDialogOpen(true);
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
            </TableContainer>
          )}
        </Box>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTimesheet && !selectedIds.has(selectedTimesheet.id)
            ? 'Approve Timesheet'
            : `Approve ${selectedCount} Timesheet(s)`}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Comments (Optional)"
            multiline
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)} disabled={processing}>
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
          >
            {processing ? <CircularProgress size={20} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Timesheet</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            required
            label="Rejection Reason"
            multiline
            rows={2}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Additional Comments (Optional)"
            multiline
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => selectedTimesheet && handleReject(selectedTimesheet.id)}
            disabled={processing || !rejectionReason.trim()}
          >
            {processing ? <CircularProgress size={20} /> : 'Reject'}
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

