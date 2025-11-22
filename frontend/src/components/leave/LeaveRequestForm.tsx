/**
 * Leave Request Form Component
 * Supports DRAFT workflow with Save and Submit functionality
 * Includes country-specific leave type filtering and balance checking
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Save, Send, XCircle, Calendar, AlertCircle } from 'lucide-react';
import { LeaveType } from '../../types/leave/leave.types';
import type {
  CreateLeaveRequestDto,
  LeaveBalance,
} from '../../types/leave/leave.types';
import {
  getLeaveTypesForCountry,
  getLeaveTypeInfo,
} from '../../config/countryLeaveTypeMapping';
import leaveService from '../../services/leave/leaveService';

interface LeaveRequestFormProps {
  countryCode: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  countryCode,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    leaveType: '' as LeaveType | '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Get available leave types for country
  const availableLeaveTypes = getLeaveTypesForCountry(countryCode);

  // Load leave balances
  useEffect(() => {
    loadBalances();
  }, [countryCode]);

  const loadBalances = async () => {
    try {
      setLoadingBalances(true);
      const data = await leaveService.getLeaveBalances(undefined, countryCode);
      // Ensure data is an array
      setBalances(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load balances:', err);
      setBalances([]); // Set empty array on error
    } finally {
      setLoadingBalances(false);
    }
  };

  // Calculate total days
  const totalDays = formData.startDate && formData.endDate
    ? leaveService.calculateLeaveDays(formData.startDate, formData.endDate)
    : 0;

  // Ensure balances is an array before using .find()
  const balanceArray = Array.isArray(balances) ? balances : [];

  // Get available balance for selected leave type
  const selectedBalance = formData.leaveType
    ? balanceArray.find(b => b.leaveType === formData.leaveType)
    : null;

  const availableDays = selectedBalance?.availableDays || 0;
  const isInsufficientBalance = totalDays > availableDays;

  // Get leave type info
  const leaveTypeInfo = formData.leaveType ? getLeaveTypeInfo(formData.leaveType) : null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!formData.leaveType) {
      return 'Please select a leave type';
    }
    if (!formData.startDate) {
      return 'Please select a start date';
    }
    if (!formData.endDate) {
      return 'Please select an end date';
    }

    const dateError = leaveService.validateDateRange(formData.startDate, formData.endDate);
    if (dateError) {
      return dateError;
    }

    if (totalDays <= 0) {
      return 'Invalid date range';
    }

    if (isInsufficientBalance) {
      return `Insufficient leave balance. You have ${availableDays} days available, but requesting ${totalDays} days.`;
    }

    return null;
  };

  const handleSaveDraft = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestData: CreateLeaveRequestDto = {
        countryCode,
        leaveType: formData.leaveType as LeaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays,
        notes: formData.notes || undefined,
        isPaid: leaveTypeInfo?.isPaid || true,
      };

      const response = await leaveService.createLeaveRequest(requestData);
      setDraftId(response.id);
      setSuccess('Draft saved successfully! You can submit it for approval when ready.');
      
      // Reload balances
      await loadBalances();
    } catch (err: any) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!draftId) {
      // If no draft exists, create and submit in one go
      await handleSaveDraft();
      if (!draftId) return;
    }

    try {
      setLoading(true);
      setError(null);

      await leaveService.submitLeaveRequest(draftId!);
      setSuccess('Leave request submitted successfully! It will be reviewed by your manager.');
      
      // Clear form
      setFormData({
        leaveType: '' as LeaveType | '',
        startDate: '',
        endDate: '',
        notes: '',
      });
      setDraftId(null);

      // Call success callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDirect = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestData: CreateLeaveRequestDto = {
        countryCode,
        leaveType: formData.leaveType as LeaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays,
        notes: formData.notes || undefined,
        isPaid: leaveTypeInfo?.isPaid || true,
      };

      // Create draft
      const draft = await leaveService.createLeaveRequest(requestData);
      
      // Immediately submit
      await leaveService.submitLeaveRequest(draft.id);
      
      setSuccess('Leave request submitted successfully!');
      
      // Clear form
      setFormData({
        leaveType: '' as LeaveType | '',
        startDate: '',
        endDate: '',
        notes: '',
      });

      // Reload balances
      await loadBalances();

      // Call success callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      leaveType: '' as LeaveType | '',
      startDate: '',
      endDate: '',
      notes: '',
    });
    setDraftId(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            New Leave Request
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submit a request for time off. You can save as draft and submit later.
          </Typography>
        </Box>

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

        <Stack spacing={3}>
          {/* Leave Type Selection */}
          <FormControl fullWidth required>
            <InputLabel>Leave Type</InputLabel>
            <Select
              value={formData.leaveType}
              onChange={(e) => handleChange('leaveType', e.target.value)}
              label="Leave Type"
              sx={{
                borderRadius: 2,
                '& .MuiSvgIcon-root': {
                  color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                },
              }}
              disabled={loading}
            >
              {availableLeaveTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{type.label}</span>
                    {loadingBalances ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Chip
                        label={`${balanceArray.find(b => b.leaveType === type.value)?.availableDays || 0} days`}
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {formData.leaveType && leaveTypeInfo && (
              <FormHelperText>
                {leaveTypeInfo.description}
                {leaveTypeInfo.isPaid && ' • Paid'}
                {!leaveTypeInfo.isPaid && ' • Unpaid'}
              </FormHelperText>
            )}
          </FormControl>

          {/* Date Range */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: (theme) => theme.palette.mode === 'dark' ? 'invert(0.8)' : 'none',
                    cursor: 'pointer',
                  },
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: formData.startDate || new Date().toISOString().split('T')[0] }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: (theme) => theme.palette.mode === 'dark' ? 'invert(0.8)' : 'none',
                    cursor: 'pointer',
                  },
                }}
                disabled={loading}
              />
            </Grid>
          </Grid>

          {/* Calculated Days and Balance Check */}
          {totalDays > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isInsufficientBalance ? 'error.light' : 'primary.light',
                color: isInsufficientBalance ? 'error.dark' : 'primary.dark',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {isInsufficientBalance ? <AlertCircle size={20} /> : <Calendar size={20} />}
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {totalDays} days requested
                  {selectedBalance && ` • ${availableDays} days available`}
                  {isInsufficientBalance && ` • Insufficient balance!`}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Notes */}
          <TextField
            fullWidth
            label="Notes (optional)"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Provide any additional details about your leave request"
            inputProps={{ maxLength: 500 }}
            helperText={`${formData.notes.length}/500 characters`}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            disabled={loading}
          />

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
            {!draftId ? (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Save size={16} />}
                  onClick={handleSaveDraft}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  {loading ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Send size={16} />}
                  onClick={handleSubmitDirect}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Send size={16} />}
                onClick={handleSubmitForApproval}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                {loading ? 'Submitting...' : 'Submit Draft for Approval'}
              </Button>
            )}
            <Button
              variant="text"
              color="inherit"
              startIcon={<XCircle size={16} />}
              onClick={onCancel || handleReset}
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {onCancel ? 'Cancel' : 'Reset'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestForm;

