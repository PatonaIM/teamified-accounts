/**
 * Processing Control Panel Component
 * Start/stop/monitor payroll processing operations
 * Story 7.8 - Payroll Administration
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Typography,
  LinearProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Stop from '@mui/icons-material/Stop';
import Refresh from '@mui/icons-material/Refresh';
import FilterList from '@mui/icons-material/FilterList';
import Close from '@mui/icons-material/Close';
import ProcessingStatusBadge from './ProcessingStatusBadge';
import PerformanceMetricsCard from './PerformanceMetricsCard';
import ProcessingLogDetailDialog from './ProcessingLogDetailDialog';
import EmployeeSelectionDialog from './EmployeeSelectionDialog';
import type {
  PayrollPeriod,
  ProcessingStatusResponse,
} from '../../types/payroll-admin/payrollAdmin.types';
import {
  listPeriods,
  startProcessing,
  stopProcessing,
  retryFailedEmployees,
  getProcessingStatus,
  calculateProgress,
  formatDuration,
} from '../../services/payroll-admin/payrollAdminService';

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'PH', name: 'Philippines' },
  { code: 'AU', name: 'Australia' },
];

const ProcessingControlPanel: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '' as 'start' | 'stop' | 'retry' });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Story 7.8.1 - Employee Selection State
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isCustomSelection, setIsCustomSelection] = useState(false);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);

  // Load periods when country changes
  useEffect(() => {
    loadPeriods();
  }, [selectedCountry]);

  // Load processing status when period is selected
  useEffect(() => {
    if (selectedPeriod) {
      loadProcessingStatus();
    }
  }, [selectedPeriod]);

  // Poll for status updates when processing is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPolling && selectedPeriod) {
      interval = setInterval(() => {
        loadProcessingStatus();
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, selectedPeriod]);

  // Auto-start/stop polling based on processing status
  useEffect(() => {
    if (processingStatus?.processingStatus === 'in_progress' || processingStatus?.processingStatus === 'started') {
      setIsPolling(true);
    } else {
      setIsPolling(false);
    }
  }, [processingStatus?.processingStatus]);

  // Clear employee selection when country or period changes (Story 7.8.1)
  useEffect(() => {
    setSelectedEmployeeIds([]);
    setIsCustomSelection(false);
  }, [selectedCountry, selectedPeriod]);

  const loadPeriods = async () => {
    try {
      const data = await listPeriods(selectedCountry);
      setPeriods(data.filter(p => p.status === 'open' || p.status === 'processing'));
      if (data.length > 0 && !selectedPeriod) {
        setSelectedPeriod(data[0].id);
      }
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to load periods', 'error');
    }
  };

  const loadProcessingStatus = async () => {
    if (!selectedPeriod) return;

    try {
      const status = await getProcessingStatus(selectedPeriod);
      setProcessingStatus(status);
    } catch (error: any) {
      console.error('Failed to load status:', error);
    }
  };

  const handleStartProcessing = async () => {
    setLoading(true);
    try {
      // Story 7.8.1: Include userIds when custom selection is active
      const payload = {
        periodId: selectedPeriod,
        ...(isCustomSelection && selectedEmployeeIds.length > 0 && { userIds: selectedEmployeeIds })
      };
      const response = await startProcessing(payload);
      showSnackbar(response.message, 'success');
      setIsPolling(true);
      await loadProcessingStatus();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to start processing', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: 'start' });
    }
  };

  const handleStopProcessing = async () => {
    if (!processingStatus?.logId) return;

    setLoading(true);
    try {
      await stopProcessing(processingStatus.logId);
      showSnackbar('Processing stopped successfully', 'success');
      setIsPolling(false);
      await loadProcessingStatus();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to stop processing', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: 'stop' });
    }
  };

  const handleRetryFailed = async () => {
    if (!processingStatus?.logId) return;

    setLoading(true);
    try {
      const response = await retryFailedEmployees(processingStatus.logId);
      showSnackbar(response.message, 'success');
      setIsPolling(true);
      await loadProcessingStatus();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to retry processing', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: 'retry' });
    }
  };

  // Story 7.8.1: Employee Selection Handlers
  const handleEmployeeSelectionApply = (employeeIds: string[]) => {
    if (employeeIds.length === 0) {
      // Clear selection - use all employees
      setSelectedEmployeeIds([]);
      setIsCustomSelection(false);
      showSnackbar('Selection cleared - will process all employees', 'success');
    } else {
      setSelectedEmployeeIds(employeeIds);
      setIsCustomSelection(true);
      showSnackbar(`${employeeIds.length} employees selected`, 'success');
    }
    setEmployeeDialogOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedEmployeeIds([]);
    setIsCustomSelection(false);
    showSnackbar('Selection cleared - will process all employees', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const progress = processingStatus
    ? calculateProgress(processingStatus.processedEmployees, processingStatus.totalEmployees)
    : 0;

  // Simplified button logic - just require period selection
  const canStart = !!selectedPeriod && !loading;
  const canStop = processingStatus?.processingStatus === 'in_progress' || processingStatus?.processingStatus === 'started';
  const canRetry = processingStatus?.failedEmployees > 0 && (processingStatus?.processingStatus === 'completed' || processingStatus?.processingStatus === 'failed');

  return (
    <Box>
      {/* Control Panel Card */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Processing Controls
          </Typography>

          <Box display="flex" gap={2} sx={{ mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <TextField
              select
              label="Country"
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedPeriod('');
                setProcessingStatus(null);
              }}
              sx={{ minWidth: 200, flex: 1 }}
            >
              {COUNTRIES.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.name}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="Payroll Period"
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                loadProcessingStatus();
              }}
              sx={{ minWidth: 300, flex: 2 }}
              disabled={periods.length === 0}
            >
              {periods.map((period) => (
                <MenuItem key={period.id} value={period.id}>
                  {period.periodName} ({period.startDate} - {period.endDate})
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Story 7.8.1: Employee Selection UI */}
          {selectedPeriod && (
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setEmployeeDialogOpen(true)}
                size="small"
                color={isCustomSelection ? 'secondary' : 'primary'}
              >
                {isCustomSelection ? `${selectedEmployeeIds.length} Employees Selected` : 'Select Employees'}
              </Button>
              {isCustomSelection && (
                <Chip
                  label={`${selectedEmployeeIds.length} selected`}
                  onDelete={handleClearSelection}
                  deleteIcon={<Close />}
                  color="secondary"
                  size="small"
                />
              )}
            </Box>
          )}

          {/* Validation Warning for Custom Selection with Zero Employees */}
          {isCustomSelection && selectedEmployeeIds.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please select at least one employee or clear selection to process all employees.
            </Alert>
          )}

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
              onClick={() => setConfirmDialog({ open: true, action: 'start' })}
              disabled={!canStart || loading}
            >
              Start Processing
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={() => setConfirmDialog({ open: true, action: 'stop' })}
              disabled={!canStop || loading}
            >
              Stop Processing
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => setConfirmDialog({ open: true, action: 'retry' })}
              disabled={!canRetry || loading}
            >
              Retry Failed
            </Button>
            <Button
              variant="outlined"
              onClick={() => setDetailDialogOpen(true)}
              disabled={!processingStatus}
            >
              View Details
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Status Display */}
      {processingStatus && (
        <>
          {/* Status Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" gap={2} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Processing Status
              </Typography>
              <ProcessingStatusBadge status={processingStatus.processingStatus || 'not_started'} />
            </Box>
            {isPolling && (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Auto-refreshing...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Progress Bar */}
          <Card 
            elevation={0} 
            sx={{ 
              mb: 3, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor: 'background.paper',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  {processingStatus.processedEmployees} / {processingStatus.totalEmployees} employees processed
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 10, borderRadius: 1 }}
              />
            </CardContent>
          </Card>

          {/* Metrics Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <PerformanceMetricsCard
                title="Total Employees"
                value={processingStatus.totalEmployees}
                icon="people"
                variant="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <PerformanceMetricsCard
                title="Successful"
                value={processingStatus.successEmployees}
                icon="success"
                variant="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <PerformanceMetricsCard
                title="Failed"
                value={processingStatus.failedEmployees}
                icon="error"
                variant="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <PerformanceMetricsCard
                title="Processing Time"
                value={processingStatus.processingTimeMs ? formatDuration(processingStatus.processingTimeMs) : 'N/A'}
                icon="timer"
                variant="info"
              />
            </Grid>
          </Grid>

          {/* Errors Alert */}
          {processingStatus.errors && processingStatus.errors.length > 0 && (
            <Alert severity="error" sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {processingStatus.errors.length} error(s) occurred during processing
              </Typography>
              <Typography variant="caption">
                Click "View Details" to see error information
              </Typography>
            </Alert>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: 'start' })}>
        <DialogTitle>
          Confirm {confirmDialog.action === 'start' ? 'Start' : confirmDialog.action === 'stop' ? 'Stop' : 'Retry'} Processing
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'start' && (
              // Story 7.8.1: Show different message for custom selection
              isCustomSelection && selectedEmployeeIds.length > 0
                ? `Are you sure you want to start processing for ${selectedEmployeeIds.length} selected employees?`
                : `Are you sure you want to start processing for all ${processingStatus?.totalEmployees || 0} employees?`
            )}
            {confirmDialog.action === 'stop' &&
              'Are you sure you want to stop the current processing? Progress will be saved.'}
            {confirmDialog.action === 'retry' &&
              `Are you sure you want to retry processing for ${processingStatus?.failedEmployees || 0} failed employees?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: 'start' })}>Cancel</Button>
          <Button
            onClick={
              confirmDialog.action === 'start'
                ? handleStartProcessing
                : confirmDialog.action === 'stop'
                ? handleStopProcessing
                : handleRetryFailed
            }
            variant="contained"
            color={confirmDialog.action === 'stop' ? 'error' : 'primary'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <ProcessingLogDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        processingStatus={processingStatus}
      />

      {/* Employee Selection Dialog (Story 7.8.1) */}
      <EmployeeSelectionDialog
        open={employeeDialogOpen}
        onClose={() => setEmployeeDialogOpen(false)}
        onApply={handleEmployeeSelectionApply}
        countryCode={selectedCountry}
        initialSelectedIds={selectedEmployeeIds}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProcessingControlPanel;

