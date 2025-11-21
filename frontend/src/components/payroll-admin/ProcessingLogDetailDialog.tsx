/**
 * Processing Log Detail Dialog Component
 * Modal for displaying detailed processing log information
 * Story 7.8 - Payroll Administration
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
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import ProcessingStatusBadge from './ProcessingStatusBadge';
import type { ProcessingStatusResponse } from '../../types/payroll-admin/payrollAdmin.types';
import { formatDuration, calculateProgress } from '../../services/payroll-admin/payrollAdminService';

interface ProcessingLogDetailDialogProps {
  open: boolean;
  onClose: () => void;
  processingStatus: ProcessingStatusResponse | null;
}

const ProcessingLogDetailDialog: React.FC<ProcessingLogDetailDialogProps> = ({
  open,
  onClose,
  processingStatus,
}) => {
  if (!processingStatus) return null;

  const progress = calculateProgress(
    processingStatus.processedEmployees,
    processingStatus.totalEmployees
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Processing Log Details
        </Typography>
        <Button
          onClick={onClose}
          size="small"
          sx={{ minWidth: 'auto', p: 0.5 }}
          startIcon={<Close />}
        />
      </DialogTitle>

      <DialogContent dividers>
        {/* Header Info */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Period Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Period Name
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {processingStatus.periodName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Country
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {processingStatus.countryCode}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Period Status
              </Typography>
              <Box mt={0.5}>
                <ProcessingStatusBadge status={processingStatus.periodStatus} />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Processing Status
              </Typography>
              <Box mt={0.5}>
                <ProcessingStatusBadge
                  status={processingStatus.processingStatus || 'not_started'}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Progress Section */}
        {processingStatus.processingStatus && (
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Processing Progress
            </Typography>
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  {processingStatus.processedEmployees} / {processingStatus.totalEmployees}{' '}
                  employees processed
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
            </Box>

            <Grid container spacing={2} mt={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Successful
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight={600}>
                  {processingStatus.successEmployees}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Failed
                </Typography>
                <Typography variant="h6" color="error.main" fontWeight={600}>
                  {processingStatus.failedEmployees}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Remaining
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {processingStatus.totalEmployees - processingStatus.processedEmployees}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Timing Information */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Timing Information
          </Typography>
          <Grid container spacing={2} mt={1}>
            {processingStatus.startedAt && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Started At
                </Typography>
                <Typography variant="body1">
                  {new Date(processingStatus.startedAt).toLocaleString()}
                </Typography>
              </Grid>
            )}
            {processingStatus.completedAt && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Completed At
                </Typography>
                <Typography variant="body1">
                  {new Date(processingStatus.completedAt).toLocaleString()}
                </Typography>
              </Grid>
            )}
            {processingStatus.processingTimeMs && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Processing Time
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatDuration(processingStatus.processingTimeMs)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Errors Section */}
        {processingStatus.errors && processingStatus.errors.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Errors ({processingStatus.errors.length})
              </Typography>
              <Box mt={2}>
                {processingStatus.errors.slice(0, 5).map((error: any, index: number) => (
                  <Alert key={index} severity="error" sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Employee: {error.userId || 'Unknown'}
                    </Typography>
                    <Typography variant="caption">{error.error || 'Unknown error'}</Typography>
                  </Alert>
                ))}
                {processingStatus.errors.length > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    ... and {processingStatus.errors.length - 5} more errors
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessingLogDetailDialog;

