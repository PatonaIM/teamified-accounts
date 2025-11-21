/**
 * Leave Request Detail Dialog Component
 * Modal for viewing full leave request details with approval history timeline
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Paper,
  Stack,
  Avatar,
} from '@mui/material';
import {
  X,
  Calendar,
  User,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { LeaveRequestStatus } from '../../types/leave/leave.types';
import type { LeaveRequest } from '../../types/leave/leave.types';
import { getLeaveTypeLabel, getLeaveTypeInfo } from '../../config/countryLeaveTypeMapping';

interface LeaveRequestDetailDialogProps {
  open: boolean;
  request: LeaveRequest | null;
  onClose: () => void;
}

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

const getStatusIcon = (status: LeaveRequestStatus) => {
  switch (status) {
    case LeaveRequestStatus.APPROVED:
      return <CheckCircle size={20} />;
    case LeaveRequestStatus.REJECTED:
      return <XCircle size={20} />;
    case LeaveRequestStatus.SUBMITTED:
      return <Clock size={20} />;
    case LeaveRequestStatus.CANCELLED:
      return <XCircle size={20} />;
    default:
      return <FileText size={20} />;
  }
};

const LeaveRequestDetailDialog: React.FC<LeaveRequestDetailDialogProps> = ({
  open,
  request,
  onClose,
}) => {
  if (!request) return null;

  const leaveTypeInfo = getLeaveTypeInfo(request.leaveType);
  const hasApprovals = request.approvals && request.approvals.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Leave Request Details
          </Typography>
          <Button
            onClick={onClose}
            sx={{ minWidth: 'auto', borderRadius: 2 }}
            startIcon={<X size={16} />}
          >
            Close
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Status Badge */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={request.status}
            color={getStatusColor(request.status)}
            icon={getStatusIcon(request.status)}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Basic Information */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Leave Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {getLeaveTypeLabel(request.leaveType)}
                </Typography>
                {leaveTypeInfo && (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    <Chip
                      label={leaveTypeInfo.isPaid ? 'Paid' : 'Unpaid'}
                      size="small"
                      color={leaveTypeInfo.isPaid ? 'success' : 'default'}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Stack>
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Employee
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {request.user?.firstName} {request.user?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {request.user?.email}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Start Date
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Calendar size={16} />
                  <Typography variant="body2">
                    {new Date(request.startDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  End Date
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Calendar size={16} />
                  <Typography variant="body2">
                    {new Date(request.endDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Total Days
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                </Typography>
              </Stack>
            </Grid>

            {request.notes && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {request.notes}
                  </Typography>
                </Stack>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Payroll Information */}
        {request.payrollPeriodId && (
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <DollarSign size={18} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Payroll Impact
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              This leave is linked to payroll period and will be processed in the next payroll run.
            </Typography>
            {request.isPaid && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                <strong>Type:</strong> Paid leave - No salary deduction
              </Typography>
            )}
            {!request.isPaid && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                <strong>Type:</strong> Unpaid leave - Salary will be adjusted
              </Typography>
            )}
          </Paper>
        )}

        {/* Approval History */}
        {hasApprovals && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Approval History
            </Typography>
            <Stack spacing={2}>
              {request.approvals!.map((approval, index) => (
                <Paper 
                  key={approval.id} 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1,
                    borderLeft: 4,
                    borderColor: approval.status === LeaveRequestStatus.APPROVED
                      ? 'success.main'
                      : approval.status === LeaveRequestStatus.REJECTED
                      ? 'error.main'
                      : 'grey.300'
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      sx={{
                        bgcolor: approval.status === LeaveRequestStatus.APPROVED
                          ? 'success.main'
                          : approval.status === LeaveRequestStatus.REJECTED
                          ? 'error.main'
                          : 'grey.400',
                        width: 32,
                        height: 32,
                      }}
                    >
                      {approval.status === LeaveRequestStatus.APPROVED ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {approval.status === LeaveRequestStatus.APPROVED ? 'Approved' : 'Rejected'} by{' '}
                        {approval.approver?.firstName} {approval.approver?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {new Date(approval.approvedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(approval.approvedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      {approval.comments && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                          &ldquo;{approval.comments}&rdquo;
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* Submission Information */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(request.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Last Updated: {new Date(request.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveRequestDetailDialog;

