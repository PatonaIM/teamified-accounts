/**
 * Timesheet Detail Dialog Component
 * Displays full timesheet details in a modal dialog
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Alert,
  Paper,
  styled,
} from '@mui/material';
import {
  WbSunny as WbSunnyIcon,
  AccessTime as AccessTimeIcon,
  NightsStay as NightsStayIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  CalendarMonth,
  TrendingUp,
  LocalFireDepartment,
  Nightlight,
} from '@mui/icons-material';
import type { Timesheet, TimesheetStatus, TimesheetType } from '../../types/timesheets/timesheet.types';
import { format } from 'date-fns';

// Styled components
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(3),
}));

const StyledSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const HoursCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '8px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  border: `2px solid ${theme.palette.divider}`,
}));

interface TimesheetDetailDialogProps {
  open: boolean;
  onClose: () => void;
  timesheet: Timesheet | null;
}

export const TimesheetDetailDialog: React.FC<TimesheetDetailDialogProps> = ({
  open,
  onClose,
  timesheet,
}) => {
  if (!timesheet) return null;

  const getStatusIcon = (status: TimesheetStatus) => {
    switch (status) {
      case 'draft':
        return <ScheduleIcon />;
      case 'submitted':
        return <AccessTimeIcon />;
      case 'approved':
        return <CheckCircleIcon />;
      case 'rejected':
        return <ErrorIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusColor = (status: TimesheetStatus): "default" | "info" | "success" | "error" => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'submitted':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: TimesheetType) => {
    switch (type) {
      case 'daily':
        return <WbSunnyIcon />;
      case 'weekly':
        return <AccessTimeIcon />;
      default:
        return <AccessTimeIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarMonth sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Timesheet Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {timesheet.timesheetType === 'weekly' && timesheet.weekStartDate && timesheet.weekEndDate
                  ? `${format(new Date(timesheet.weekStartDate), 'MMM d')} - ${format(new Date(timesheet.weekEndDate), 'MMM d, yyyy')}`
                  : formatDate(timesheet.workDate)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
              color={getStatusColor(timesheet.status)}
              icon={getStatusIcon(timesheet.status)}
              size="small"
              sx={{ fontWeight: 600, color: 'white', backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
            <Chip
              label={timesheet.timesheetType.charAt(0).toUpperCase() + timesheet.timesheetType.slice(1)}
              icon={getTypeIcon(timesheet.timesheetType)}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, color: 'white', borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
          </Box>
        </Box>
      </StyledDialogTitle>
      
      <DialogContent sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
        {/* Basic Information */}
        {timesheet.user && (
          <StyledSection elevation={0}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
              Employee Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Name
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {timesheet.user.firstName} {timesheet.user.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {timesheet.user.email}
                </Typography>
              </Grid>
            </Grid>
          </StyledSection>
        )}

        {/* Weekly Breakdown (for weekly timesheets) */}
        {timesheet.timesheetType === 'weekly' && timesheet.weeklyHoursBreakdown && (
          <StyledSection elevation={0}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
              Weekly Hours Breakdown
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const dayKey = day as keyof typeof timesheet.weeklyHoursBreakdown;
                const dayData = timesheet.weeklyHoursBreakdown?.[dayKey];
                if (!dayData) return null;

                const dayTotal = dayData.regularHours + dayData.overtimeHours + dayData.doubleOvertimeHours + dayData.nightShiftHours;
                
                return (
                  <Box
                    key={day}
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      backgroundColor: dayTotal > 0 ? 'rgba(102, 126, 234, 0.05)' : 'rgba(0,0,0,0.02)',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                        {day}
                      </Typography>
                      <Chip
                        label={`${dayTotal.toFixed(1)}h total`}
                        size="small"
                        color={dayTotal > 0 ? 'primary' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Grid container spacing={1}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WbSunnyIcon fontSize="small" color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            Regular: <strong>{dayData.regularHours}h</strong>
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TrendingUp fontSize="small" color="warning" />
                          <Typography variant="body2" color="text.secondary">
                            OT: <strong>{dayData.overtimeHours}h</strong>
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocalFireDepartment fontSize="small" color="error" />
                          <Typography variant="body2" color="text.secondary">
                            2x OT: <strong>{dayData.doubleOvertimeHours}h</strong>
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Nightlight fontSize="small" color="info" />
                          <Typography variant="body2" color="text.secondary">
                            Night: <strong>{dayData.nightShiftHours}h</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Box>
          </StyledSection>
        )}

        {/* Hours Breakdown (Totals) */}
        <StyledSection elevation={0}>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
            {timesheet.timesheetType === 'weekly' ? 'Weekly Totals' : 'Hours Breakdown'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <HoursCard>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Regular
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {timesheet.regularHours}h
                </Typography>
              </HoursCard>
            </Grid>
            <Grid item xs={6} sm={3}>
              <HoursCard>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Overtime
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {timesheet.overtimeHours}h
                </Typography>
              </HoursCard>
            </Grid>
            <Grid item xs={6} sm={3}>
              <HoursCard>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Double OT
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {timesheet.doubleOvertimeHours}h
                </Typography>
              </HoursCard>
            </Grid>
            <Grid item xs={6} sm={3}>
              <HoursCard>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Night Shift
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  {timesheet.nightShiftHours}h
                </Typography>
              </HoursCard>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, mb: 0.5 }}>
              Total Hours
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
              {timesheet.totalHours}h
            </Typography>
          </Box>
        </StyledSection>

        {/* Notes */}
        {timesheet.notes && (
          <StyledSection elevation={0}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
              Notes
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {timesheet.notes}
            </Typography>
          </StyledSection>
        )}

        {/* Approval Information */}
        {timesheet.status !== 'draft' && (
          <StyledSection elevation={0}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
              Approval Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Submitted At
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {formatDateTime(timesheet.submittedAt)}
                </Typography>
              </Grid>

              {timesheet.status === 'approved' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Approved At
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {formatDateTime(timesheet.approvedAt)}
                    </Typography>
                  </Grid>
                  {timesheet.approvedBy && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Approved By
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {timesheet.approvedBy.firstName} {timesheet.approvedBy.lastName}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              {timesheet.status === 'rejected' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rejected At
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {formatDateTime(timesheet.rejectedAt)}
                    </Typography>
                  </Grid>
                  {timesheet.rejectedBy && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Rejected By
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {timesheet.rejectedBy.firstName} {timesheet.rejectedBy.lastName}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
            
            {timesheet.rejectionReason && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="600" gutterBottom>
                  Rejection Reason
                </Typography>
                <Typography variant="body2">{timesheet.rejectionReason}</Typography>
              </Alert>
            )}

            {timesheet.payrollProcessed && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="600">
                  Processed for payroll on {formatDateTime(timesheet.payrollProcessedAt)}
                </Typography>
              </Alert>
            )}
          </StyledSection>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            px: 4,
            fontWeight: 600,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

