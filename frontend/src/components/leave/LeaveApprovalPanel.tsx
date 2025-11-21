/**
 * Leave Approval Panel Component
 * Manager interface for approving/rejecting leave requests
 * Features bulk operations (shown only when 2+ items selected)
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
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Paper,
} from '@mui/material';
import {
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { LeaveRequestStatus } from '../../types/leave/leave.types';
import type {
  LeaveRequest,
  BulkApproveResponse,
} from '../../types/leave/leave.types';
import { getLeaveTypeLabel } from '../../config/countryLeaveTypeMapping';
import leaveService from '../../services/leave/leaveService';

interface LeaveApprovalPanelProps {
  onView?: (request: LeaveRequest) => void;
  onRefresh?: () => void;
}

const LeaveApprovalPanel: React.FC<LeaveApprovalPanelProps> = ({
  onView,
  onRefresh,
}) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog states
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [singleRequestId, setSingleRequestId] = useState<string | null>(null);

  // Load submitted requests
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaveService.getLeaveRequests({
        status: LeaveRequestStatus.SUBMITTED,
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

  // Ensure requests is an array
  const requestsArray = Array.isArray(requests) ? requests : [];

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(new Set(requestsArray.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const isSelected = (id: string) => selectedIds.has(id);
  const selectedCount = selectedIds.size;
  const allSelected = requestsArray.length > 0 && selectedIds.size === requestsArray.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < requestsArray.length;

  // Action handlers
  const openApproveDialog = (requestId?: string) => {
    setSingleRequestId(requestId || null);
    setComments('');
    setApproveDialog(true);
  };

  const openRejectDialog = (requestId?: string) => {
    setSingleRequestId(requestId || null);
    setComments('');
    setRejectDialog(true);
  };

  const handleApprove = async () => {
    const idsToApprove = singleRequestId ? [singleRequestId] : Array.from(selectedIds);

    if (idsToApprove.length === 0) {
      setError('Please select at least one request to approve');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      if (idsToApprove.length === 1) {
        // Single approval
        const approveData = comments ? { comments } : {};
        await leaveService.approveLeaveRequest(idsToApprove[0], approveData);
        setSuccess('Leave request approved successfully');
      } else {
        // Bulk approval
        const bulkData: any = { leaveRequestIds: idsToApprove };
        if (comments) {
          bulkData.comments = comments;
        }
        const result: BulkApproveResponse = await leaveService.bulkApproveLeaveRequests(bulkData);

        if (result.failed.length > 0) {
          setError(
            `Approved ${result.approved.length} request(s). Failed: ${result.failed.length}. ` +
            result.failed.map(f => f.reason).join(', ')
          );
        } else {
          setSuccess(`Successfully approved ${result.approved.length} leave request(s)`);
        }
      }

      setApproveDialog(false);
      setComments('');
      setSingleRequestId(null);
      setSelectedIds(new Set());
      await loadRequests();
      if (onRefresh) onRefresh(); // Notify parent to refresh all views
    } catch (err: any) {
      setError(err.message || 'Failed to approve leave request(s)');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const idsToReject = singleRequestId ? [singleRequestId] : Array.from(selectedIds);

    if (idsToReject.length === 0) {
      setError('Please select at least one request to reject');
      return;
    }

    if (!comments || comments.trim().length === 0) {
      setError('Comments are required when rejecting a leave request');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      // Process rejections one by one (no bulk reject endpoint)
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const id of idsToReject) {
        try {
          await leaveService.rejectLeaveRequest(id, { comments });
          successCount++;
        } catch (err: any) {
          failCount++;
          errors.push(err.message);
        }
      }

      if (failCount > 0) {
        setError(`Rejected ${successCount} request(s). Failed: ${failCount}. ${errors.join(', ')}`);
      } else {
        setSuccess(`Successfully rejected ${successCount} leave request(s)`);
      }

      setRejectDialog(false);
      setComments('');
      setSingleRequestId(null);
      setSelectedIds(new Set());
      await loadRequests();
      if (onRefresh) onRefresh(); // Notify parent to refresh all views
    } catch (err: any) {
      setError(err.message || 'Failed to reject leave request(s)');
    } finally {
      setActionLoading(false);
    }
  };

  // Show bulk buttons only when 2+ items selected
  const showBulkActions = selectedCount >= 2;

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

      {/* Header with bulk actions */}
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Pending Approvals
            </Typography>

            <Box sx={{ flex: 1 }} />

            {showBulkActions && (
              <>
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedCount} request{selectedCount !== 1 ? 's' : ''} selected
                  </Typography>
                </Paper>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle size={16} />}
                  onClick={() => openApproveDialog()}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Bulk Approve
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<XCircle size={16} />}
                  onClick={() => openRejectDialog()}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Bulk Reject
                </Button>
              </>
            )}

            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={handleRefresh}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Refresh
            </Button>
          </Stack>

          {selectedCount > 0 && selectedCount < 2 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Select 2 or more requests to enable bulk actions
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading pending requests...
            </Typography>
          </Box>
        ) : requestsArray.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No pending leave requests to approve
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Leave Type</strong></TableCell>
                  <TableCell><strong>Dates</strong></TableCell>
                  <TableCell align="center"><strong>Days</strong></TableCell>
                  <TableCell><strong>Submitted</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requestsArray.map((request) => (
                  <TableRow
                    key={request.id}
                    hover
                    selected={isSelected(request.id)}
                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected(request.id)}
                        onChange={() => handleSelectOne(request.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {request.user?.firstName} {request.user?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
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
                        {new Date(request.startDate).toLocaleDateString()} -{' '}
                        {new Date(request.endDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${request.totalDays} day${request.totalDays !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => openApproveDialog(request.id)}
                          >
                            <CheckCircle size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openRejectDialog(request.id)}
                          >
                            <XCircle size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => onView && onView(request)}
                          >
                            <Eye size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {singleRequestId
            ? 'Approve Leave Request'
            : `Approve ${selectedCount} Leave Request${selectedCount !== 1 ? 's' : ''}`}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments (optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any comments about this approval"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
          >
            {actionLoading ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {singleRequestId
            ? 'Reject Leave Request'
            : `Reject ${selectedCount} Leave Request${selectedCount !== 1 ? 's' : ''}`}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            Comments are required when rejecting a leave request
          </Alert>
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="Comments *"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Please provide a reason for rejection"
            error={!comments && rejectDialog}
            helperText={!comments && rejectDialog ? 'This field is required' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={actionLoading || !comments}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <XCircle size={16} />}
          >
            {actionLoading ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveApprovalPanel;

