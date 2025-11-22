import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { EmploymentRecord } from '../../types/employmentRecords';

interface EmploymentTerminationDialogProps {
  open: boolean;
  record: EmploymentRecord | null;
  onConfirm: (data: { endDate: string; reason?: string }) => void;
  onCancel: () => void;
}

const EmploymentTerminationDialog: React.FC<EmploymentTerminationDialogProps> = ({
  open,
  record,
  onConfirm,
  onCancel,
}) => {
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [terminationType, setTermationType] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setEndDate(null);
      setReason('');
      setTermationType('');
      setErrors({});
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!terminationType) {
      newErrors.terminationType = 'Termination type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm({
      endDate: endDate!.toISOString().split('T')[0],
      reason: reason.trim() || undefined,
    });
  };

  // Handle cancel
  const handleCancel = () => {
    setEndDate(null);
    setReason('');
    setTermationType('');
    setErrors({});
    onCancel();
  };

  if (!record) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={handleCancel} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontWeight: 600,
        }}>
          Terminate Employment Record
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are about to terminate the employment record for{' '}
              <strong>{record.user?.firstName} {record.user?.lastName}</strong> at{' '}
              <strong>{record.client?.name}</strong>. This action cannot be undone.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Current Employment Details:</strong>
                </Typography>
                <Typography variant="body2">
                  • User: {record.user?.firstName} {record.user?.lastName} ({record.user?.email})
                </Typography>
                <Typography variant="body2">
                  • Client: {record.client?.name}
                </Typography>
                <Typography variant="body2">
                  • Role: {record.role}
                </Typography>
                <Typography variant="body2">
                  • Start Date: {new Date(record.startDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  • Current Status: {record.status}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Termination Date"
                  value={endDate}
                  onChange={(newValue) => {
                    setEndDate(newValue);
                    if (errors.endDate) {
                      setErrors(prev => ({ ...prev, endDate: '' }));
                    }
                  }}
                  minDate={new Date(record.startDate)}
                  maxDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate,
                      required: true,
                      sx: {
                        '& .MuiInputBase-root': {
                          bgcolor: (theme) => 
                            theme.palette.mode === 'dark' 
                              ? alpha(theme.palette.common.white, 0.09)
                              : 'background.paper',
                        },
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.terminationType}>
                  <InputLabel>Termination Type</InputLabel>
                  <Select
                    value={terminationType}
                    onChange={(e) => {
                      setTermationType(e.target.value);
                      if (errors.terminationType) {
                        setErrors(prev => ({ ...prev, terminationType: '' }));
                      }
                    }}
                    label="Termination Type"
                    required
                    sx={{
                      bgcolor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.common.white, 0.09)
                          : 'background.paper',
                    }}
                  >
                    <MenuItem value="voluntary">Voluntary Resignation</MenuItem>
                    <MenuItem value="involuntary">Involuntary Termination</MenuItem>
                    <MenuItem value="contract_end">Contract End</MenuItem>
                    <MenuItem value="mutual_agreement">Mutual Agreement</MenuItem>
                    <MenuItem value="performance">Performance Related</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {errors.terminationType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.terminationType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Termination Reason (Optional)"
                  multiline
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide additional details about the termination..."
                  helperText="This information will be recorded for audit purposes"
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.common.white, 0.09)
                          : 'background.paper',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCancel}
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Terminate Employment
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EmploymentTerminationDialog;
