/**
 * Timesheet Submission Form Component
 * Allows employees to submit daily work hours including regular time, overtime, and night shift hours
 * Styled following Material-UI Expressive Design patterns (matching Profile page)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  AccessTime as AccessTimeIcon,
  WbSunny as WbSunnyIcon,
  NightsStay as NightsStayIcon,
  PostAdd,
  Refresh,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../hooks/useAuth';
import { TimesheetType, TimesheetStatus } from '../../types/timesheets/timesheet.types';
import {
  createTimesheet,
  updateTimesheet,
  validateHours,
  calculateTotalHours,
  getCountryLimits,
} from '../../services/timesheets/timesheetService';
import { employmentRecordsService } from '../../services/employmentRecordsService';

// Styled components matching modern design
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: theme.palette.background.paper,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
  },
}));

const StyledSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 2,
  fontWeight: 600,
  textTransform: 'none',
  padding: theme.spacing(1, 3),
}));

interface DailyHours {
  regularHours: string;
  overtimeHours: string;
  doubleOvertimeHours: string;
  nightShiftHours: string;
}

interface TimesheetEntryForm {
  workDate: Date | null;
  timesheetType: TimesheetType;
  regularHours: string;
  overtimeHours: string;
  doubleOvertimeHours: string;
  nightShiftHours: string;
  notes: string;
  // Weekly timesheet fields
  weekStartDate: Date | null;
  weekEndDate: Date | null;
  weeklyHours: {
    monday: DailyHours;
    tuesday: DailyHours;
    wednesday: DailyHours;
    thursday: DailyHours;
    friday: DailyHours;
    saturday: DailyHours;
    sunday: DailyHours;
  };
}

const initialDailyHours: DailyHours = {
  regularHours: '0',
  overtimeHours: '0',
  doubleOvertimeHours: '0',
  nightShiftHours: '0',
};

const initialFormState: TimesheetEntryForm = {
  workDate: new Date(),
  timesheetType: TimesheetType.DAILY,
  regularHours: '8',
  overtimeHours: '0',
  doubleOvertimeHours: '0',
  nightShiftHours: '0',
  notes: '',
  weekStartDate: null,
  weekEndDate: null,
  weeklyHours: {
    monday: { ...initialDailyHours },
    tuesday: { ...initialDailyHours },
    wednesday: { ...initialDailyHours },
    thursday: { ...initialDailyHours },
    friday: { ...initialDailyHours },
    saturday: { ...initialDailyHours },
    sunday: { ...initialDailyHours },
  },
};

interface TimesheetSubmissionFormProps {
  timesheetToEdit?: any; // Timesheet to edit (optional)
  onEditComplete?: () => void; // Callback when edit is complete
}

export const TimesheetSubmissionForm: React.FC<TimesheetSubmissionFormProps> = ({ 
  timesheetToEdit,
  onEditComplete 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<TimesheetEntryForm>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [employmentRecordId, setEmploymentRecordId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userCountryCode, setUserCountryCode] = useState<string>('IN'); // Default to India

  // Calculate total hours based on timesheet type
  const calculateWeeklyTotal = () => {
    let total = 0;
    Object.values(formData.weeklyHours).forEach(day => {
      total += parseFloat(day.regularHours) || 0;
      total += parseFloat(day.overtimeHours) || 0;
      total += parseFloat(day.doubleOvertimeHours) || 0;
      total += parseFloat(day.nightShiftHours) || 0;
    });
    return total;
  };

  const totalHours = formData.timesheetType === TimesheetType.WEEKLY
    ? calculateWeeklyTotal()
    : calculateTotalHours(
        parseFloat(formData.regularHours) || 0,
        parseFloat(formData.overtimeHours) || 0,
        parseFloat(formData.doubleOvertimeHours) || 0,
        parseFloat(formData.nightShiftHours) || 0
      );

  // Get country-specific limits based on user's country
  const countryLimits = getCountryLimits(userCountryCode);

  // Load user's employment record and country
  useEffect(() => {
    const loadEmploymentRecord = async () => {
      if (!user?.id) return;
      
      try {
        const records = await employmentRecordsService.getUserEmploymentRecords(user.id);
        // Get the most recent active employment record
        const activeRecord = records.find(r => r.status === 'active');
        if (activeRecord) {
          setEmploymentRecordId(activeRecord.id);
        } else if (records.length > 0) {
          // Fallback to first record if no active record
          setEmploymentRecordId(records[0].id);
        } else {
          setError('No employment record found. Please contact HR.');
        }
        
        // Get user's country from profile data (independent of payroll configuration)
        const countryCode = user?.profileData?.personal?.countryCode || 'IN';
        setUserCountryCode(countryCode);
      } catch (err) {
        console.error('Failed to load employment record:', err);
        setError('Failed to load employment information.');
      }
    };

    loadEmploymentRecord();
  }, [user?.id, user?.profileData?.personal?.countryCode]);

  // Populate form when editing existing timesheet
  useEffect(() => {
    if (timesheetToEdit) {
      setIsEditMode(true);
      setEmploymentRecordId(timesheetToEdit.employmentRecordId);
      
      // Populate form data based on timesheet type
      if (timesheetToEdit.timesheetType === TimesheetType.WEEKLY && timesheetToEdit.weeklyHoursBreakdown) {
        // Weekly timesheet
        const breakdown = timesheetToEdit.weeklyHoursBreakdown;
        setFormData({
          workDate: new Date(timesheetToEdit.workDate),
          timesheetType: TimesheetType.WEEKLY,
          weekStartDate: new Date(timesheetToEdit.weekStartDate),
          weekEndDate: new Date(timesheetToEdit.weekEndDate),
          regularHours: '0',
          overtimeHours: '0',
          doubleOvertimeHours: '0',
          nightShiftHours: '0',
          notes: timesheetToEdit.notes || '',
          weeklyHours: {
            monday: {
              regularHours: (breakdown.monday?.regularHours || 0).toString(),
              overtimeHours: (breakdown.monday?.overtimeHours || 0).toString(),
              doubleOvertimeHours: (breakdown.monday?.doubleOvertimeHours || 0).toString(),
              nightShiftHours: (breakdown.monday?.nightShiftHours || 0).toString(),
            },
            tuesday: {
              regularHours: (breakdown.tuesday?.regularHours || 0).toString(),
              overtimeHours: (breakdown.tuesday?.overtimeHours || 0).toString(),
              doubleOvertimeHours: (breakdown.tuesday?.doubleOvertimeHours || 0).toString(),
              nightShiftHours: (breakdown.tuesday?.nightShiftHours || 0).toString(),
            },
            wednesday: {
              regularHours: (breakdown.wednesday?.regularHours || 0).toString(),
              overtimeHours: (breakdown.wednesday?.overtimeHours || 0).toString(),
              doubleOvertimeHours: (breakdown.wednesday?.doubleOvertimeHours || 0).toString(),
              nightShiftHours: (breakdown.wednesday?.nightShiftHours || 0).toString(),
            },
            thursday: {
              regularHours: (breakdown.thursday?.regularHours || 0).toString(),
              overtimeHours: (breakdown.thursday?.overtimeHours || 0).toString(),
              doubleOvertimeHours: (breakdown.thursday?.doubleOvertimeHours || 0).toString(),
              nightShiftHours: (breakdown.thursday?.nightShiftHours || 0).toString(),
            },
            friday: {
              regularHours: (breakdown.friday?.regularHours || 0).toString(),
              overtimeHours: (breakdown.friday?.overtimeHours || 0).toString(),
              doubleOvertimeHours: (breakdown.friday?.doubleOvertimeHours || 0).toString(),
              nightShiftHours: (breakdown.friday?.nightShiftHours || 0).toString(),
            },
            saturday: {
              regularHours: (breakdown.saturday?.regularHours || 0).toString(),
              overtimeHours: (breakdown.saturday?.overtimeHours || 0).toString(),
              doubleOvertimeHours: (breakdown.saturday?.doubleOvertimeHours || 0).toString(),
              nightShiftHours: (breakdown.saturday?.nightShiftHours || 0).toString(),
            },
            sunday: {
              regularHours: (breakdown.sunday?.regularHours || 0).toString(),
              overtimeHours: (breakdown.sunday?.overtimeHours || 0).toString(),
              doubleOvertimeHours: (breakdown.sunday?.doubleOvertimeHours || 0).toString(),
              nightShiftHours: (breakdown.sunday?.nightShiftHours || 0).toString(),
            },
          },
        });
      } else {
        // Daily timesheet
        setFormData({
          workDate: new Date(timesheetToEdit.workDate),
          timesheetType: TimesheetType.DAILY,
          regularHours: (timesheetToEdit.regularHours || 0).toString(),
          overtimeHours: (timesheetToEdit.overtimeHours || 0).toString(),
          doubleOvertimeHours: (timesheetToEdit.doubleOvertimeHours || 0).toString(),
          nightShiftHours: (timesheetToEdit.nightShiftHours || 0).toString(),
          notes: timesheetToEdit.notes || '',
          weekStartDate: null,
          weekEndDate: null,
          weeklyHours: {
            monday: { ...initialDailyHours },
            tuesday: { ...initialDailyHours },
            wednesday: { ...initialDailyHours },
            thursday: { ...initialDailyHours },
            friday: { ...initialDailyHours },
            saturday: { ...initialDailyHours },
            sunday: { ...initialDailyHours },
          },
        });
      }
    }
  }, [timesheetToEdit]);

  // Real-time validation
  useEffect(() => {
    const regular = parseFloat(formData.regularHours) || 0;
    const overtime = parseFloat(formData.overtimeHours) || 0;
    const doubleOvertime = parseFloat(formData.doubleOvertimeHours) || 0;
    const nightShift = parseFloat(formData.nightShiftHours) || 0;

    const validation = validateHours(regular, overtime, doubleOvertime, nightShift);
    setValidationErrors(validation.errors);
  }, [
    formData.regularHours,
    formData.overtimeHours,
    formData.doubleOvertimeHours,
    formData.nightShiftHours,
  ]);

  // Check country-specific warnings
  const countryWarnings = useCallback(() => {
    if (!countryLimits) return [];
    const warnings: string[] = [];
    const regular = parseFloat(formData.regularHours) || 0;

    if (regular > countryLimits.maxRegularHours) {
      warnings.push(countryLimits.warningMessage);
    }

    return warnings;
  }, [formData.regularHours, countryLimits]);

  const handleSubmit = async (status: TimesheetStatus) => {
    // Validation for daily timesheets
    if (formData.timesheetType === TimesheetType.DAILY) {
      if (!formData.workDate) {
        setError('Work date is required');
        return;
      }
    }

    // Validation for weekly timesheets
    if (formData.timesheetType === TimesheetType.WEEKLY) {
      if (!formData.weekStartDate || !formData.weekEndDate) {
        setError('Week start and end dates are required for weekly timesheets');
        return;
      }
    }

    if (!user?.id) {
      setError('User information not available. Please log in again.');
      return;
    }

    if (!employmentRecordId) {
      setError('Employment record not found. Please contact HR.');
      return;
    }

    if (validationErrors.length > 0) {
      setError('Please fix validation errors before submitting');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (formData.timesheetType === TimesheetType.WEEKLY) {
        // Build weekly hours breakdown
        const weeklyHoursBreakdown = {
          monday: {
            regularHours: parseFloat(formData.weeklyHours.monday.regularHours) || 0,
            overtimeHours: parseFloat(formData.weeklyHours.monday.overtimeHours) || 0,
            doubleOvertimeHours: parseFloat(formData.weeklyHours.monday.doubleOvertimeHours) || 0,
            nightShiftHours: parseFloat(formData.weeklyHours.monday.nightShiftHours) || 0,
          },
          tuesday: {
            regularHours: parseFloat(formData.weeklyHours.tuesday.regularHours) || 0,
            overtimeHours: parseFloat(formData.weeklyHours.tuesday.overtimeHours) || 0,
            doubleOvertimeHours: parseFloat(formData.weeklyHours.tuesday.doubleOvertimeHours) || 0,
            nightShiftHours: parseFloat(formData.weeklyHours.tuesday.nightShiftHours) || 0,
          },
          wednesday: {
            regularHours: parseFloat(formData.weeklyHours.wednesday.regularHours) || 0,
            overtimeHours: parseFloat(formData.weeklyHours.wednesday.overtimeHours) || 0,
            doubleOvertimeHours: parseFloat(formData.weeklyHours.wednesday.doubleOvertimeHours) || 0,
            nightShiftHours: parseFloat(formData.weeklyHours.wednesday.nightShiftHours) || 0,
          },
          thursday: {
            regularHours: parseFloat(formData.weeklyHours.thursday.regularHours) || 0,
            overtimeHours: parseFloat(formData.weeklyHours.thursday.overtimeHours) || 0,
            doubleOvertimeHours: parseFloat(formData.weeklyHours.thursday.doubleOvertimeHours) || 0,
            nightShiftHours: parseFloat(formData.weeklyHours.thursday.nightShiftHours) || 0,
          },
          friday: {
            regularHours: parseFloat(formData.weeklyHours.friday.regularHours) || 0,
            overtimeHours: parseFloat(formData.weeklyHours.friday.overtimeHours) || 0,
            doubleOvertimeHours: parseFloat(formData.weeklyHours.friday.doubleOvertimeHours) || 0,
            nightShiftHours: parseFloat(formData.weeklyHours.friday.nightShiftHours) || 0,
          },
          saturday: {
            regularHours: parseFloat(formData.weeklyHours.saturday.regularHours) || 0,
            overtimeHours: parseFloat(formData.weeklyHours.saturday.overtimeHours) || 0,
            doubleOvertimeHours: parseFloat(formData.weeklyHours.saturday.doubleOvertimeHours) || 0,
            nightShiftHours: parseFloat(formData.weeklyHours.saturday.nightShiftHours) || 0,
          },
          sunday: {
            regularHours: parseFloat(formData.weeklyHours.sunday.regularHours) || 0,
            overtimeHours: parseFloat(formData.weeklyHours.sunday.overtimeHours) || 0,
            doubleOvertimeHours: parseFloat(formData.weeklyHours.sunday.doubleOvertimeHours) || 0,
            nightShiftHours: parseFloat(formData.weeklyHours.sunday.nightShiftHours) || 0,
          },
        };

        // Calculate weekly totals
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
        let totalRegularHours = 0;
        let totalOvertimeHours = 0;
        let totalDoubleOvertimeHours = 0;
        let totalNightShiftHours = 0;

        days.forEach((day) => {
          totalRegularHours += weeklyHoursBreakdown[day].regularHours;
          totalOvertimeHours += weeklyHoursBreakdown[day].overtimeHours;
          totalDoubleOvertimeHours += weeklyHoursBreakdown[day].doubleOvertimeHours;
          totalNightShiftHours += weeklyHoursBreakdown[day].nightShiftHours;
        });

        const weeklyTimesheetData = {
          userId: user.id,
          employmentRecordId: employmentRecordId,
          workDate: formData.weekStartDate!.toISOString().split('T')[0],
          weekStartDate: formData.weekStartDate!.toISOString().split('T')[0],
          weekEndDate: formData.weekEndDate!.toISOString().split('T')[0],
          timesheetType: formData.timesheetType,
          weeklyHoursBreakdown,
          regularHours: totalRegularHours,
          overtimeHours: totalOvertimeHours,
          doubleOvertimeHours: totalDoubleOvertimeHours,
          nightShiftHours: totalNightShiftHours,
          notes: formData.notes || undefined,
          status,
        };

        if (isEditMode && timesheetToEdit) {
          await updateTimesheet(timesheetToEdit.id, weeklyTimesheetData);
        } else {
          await createTimesheet(weeklyTimesheetData);
        }
      } else {
        // Daily timesheet
        const dailyTimesheetData = {
          userId: user.id,
          employmentRecordId: employmentRecordId,
          workDate: formData.workDate!.toISOString().split('T')[0],
          timesheetType: formData.timesheetType,
          regularHours: parseFloat(formData.regularHours) || 0,
          overtimeHours: parseFloat(formData.overtimeHours) || 0,
          doubleOvertimeHours: parseFloat(formData.doubleOvertimeHours) || 0,
          nightShiftHours: parseFloat(formData.nightShiftHours) || 0,
          notes: formData.notes || undefined,
          status,
        };

        if (isEditMode && timesheetToEdit) {
          await updateTimesheet(timesheetToEdit.id, dailyTimesheetData);
        } else {
          await createTimesheet(dailyTimesheetData);
        }
      }

      const actionWord = isEditMode ? 'updated' : (status === TimesheetStatus.DRAFT ? 'saved as draft' : 'submitted');
      setSuccess(`Timesheet ${actionWord} successfully!`);
      
      // Reset form and exit edit mode
      setFormData(initialFormState);
      setIsEditMode(false);
      
      // Call completion callback if provided
      if (onEditComplete) {
        onEditComplete();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'save'} timesheet`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setError(null);
    setSuccess(null);
    setValidationErrors([]);
  };

  const getTimesheetTypeIcon = () => {
    switch (formData.timesheetType) {
      case TimesheetType.DAILY:
        return <WbSunnyIcon />;
      case TimesheetType.WEEKLY:
        return <AccessTimeIcon />;
      default:
        return <AccessTimeIcon />;
    }
  };

  const getTimesheetTypeColor = (): "default" | "primary" | "warning" | "info" => {
    switch (formData.timesheetType) {
      case TimesheetType.DAILY:
        return 'primary';
      case TimesheetType.WEEKLY:
        return 'info';
      default:
        return 'default';
    }
  };

  const isSubmitDisabled = !formData.workDate || validationErrors.length > 0 || loading;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StyledCard>
        <Box sx={{ p: 3 }}>
          {/* Alerts */}
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
          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </Alert>
          )}
          {countryWarnings().map((warning, idx) => (
            <Alert key={idx} severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              {warning}
            </Alert>
          ))}

          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Basic Information Section */}
            <StyledSection elevation={0}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                Timesheet Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <FormControl fullWidth required>
                    <InputLabel>Timesheet Type</InputLabel>
                    <Select
                      value={formData.timesheetType}
                      label="Timesheet Type"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timesheetType: e.target.value as TimesheetType,
                        })
                      }
                      startAdornment={getTimesheetTypeIcon()}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                        },
                        '& .MuiSvgIcon-root': {
                          color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                        },
                      }}
                    >
                      <MenuItem value={TimesheetType.DAILY}>
                        Daily
                      </MenuItem>
                      <MenuItem value={TimesheetType.WEEKLY}>
                        Weekly
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {formData.timesheetType === TimesheetType.DAILY ? (
                  <Box sx={{ flex: '1 1 300px' }}>
                    <DatePicker
                      label="Work Date"
                      value={formData.workDate}
                      onChange={(date) => setFormData({ ...formData, workDate: date })}
                      maxDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'background.paper',
                            },
                            '& .MuiSvgIcon-root': {
                              color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <DatePicker
                        label="Week Start Date"
                        value={formData.weekStartDate}
                        onChange={(date) => {
                          setFormData({ ...formData, weekStartDate: date, workDate: date });
                          // Auto-set week end date to 6 days after start
                          if (date) {
                            const endDate = new Date(date);
                            endDate.setDate(endDate.getDate() + 6);
                            setFormData(prev => ({ ...prev, weekStartDate: date, weekEndDate: endDate, workDate: date }));
                          }
                        }}
                        maxDate={new Date()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'background.paper',
                              },
                              '& .MuiSvgIcon-root': {
                                color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <DatePicker
                        label="Week End Date"
                        value={formData.weekEndDate}
                        onChange={(date) => setFormData({ ...formData, weekEndDate: date })}
                        maxDate={new Date()}
                        minDate={formData.weekStartDate || undefined}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'background.paper',
                              },
                              '& .MuiSvgIcon-root': {
                                color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                              },
                            },
                          },
                        }}
                        disabled
                      />
                    </Box>
                  </>
                )}
              </Box>
            </StyledSection>

            {/* Work Hours Section - Only show for Daily type */}
            {formData.timesheetType === TimesheetType.DAILY ? (
              <StyledSection elevation={0}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                  Work Hours
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <StyledTextField
                      fullWidth
                      label="Regular Hours"
                      type="number"
                      value={formData.regularHours}
                      onChange={(e) =>
                        setFormData({ ...formData, regularHours: e.target.value })
                      }
                      inputProps={{ min: 0, max: 24, step: 0.5 }}
                      InputProps={{
                        startAdornment: (
                          <Tooltip title="Regular work hours">
                            <WbSunnyIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          </Tooltip>
                        ),
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <StyledTextField
                      fullWidth
                      label="Overtime Hours"
                      type="number"
                      value={formData.overtimeHours}
                      onChange={(e) =>
                        setFormData({ ...formData, overtimeHours: e.target.value })
                      }
                      inputProps={{ min: 0, max: 24, step: 0.5 }}
                      InputProps={{
                        startAdornment: (
                          <Tooltip title="Overtime (125% rate)">
                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                          </Tooltip>
                        ),
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <StyledTextField
                      fullWidth
                      label="Double Overtime"
                      type="number"
                      value={formData.doubleOvertimeHours}
                      onChange={(e) =>
                        setFormData({ ...formData, doubleOvertimeHours: e.target.value })
                      }
                      inputProps={{ min: 0, max: 24, step: 0.5 }}
                      InputProps={{
                        startAdornment: (
                          <Tooltip title="Double overtime (200% rate)">
                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                          </Tooltip>
                        ),
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <StyledTextField
                      fullWidth
                      label="Night Shift Hours"
                      type="number"
                      value={formData.nightShiftHours}
                      onChange={(e) =>
                        setFormData({ ...formData, nightShiftHours: e.target.value })
                      }
                      inputProps={{ min: 0, max: 24, step: 0.5 }}
                      InputProps={{
                        startAdornment: (
                          <Tooltip title="Night shift premium">
                            <NightsStayIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                          </Tooltip>
                        ),
                      }}
                    />
                  </Box>
                </Box>
              </StyledSection>
            ) : (
              <StyledSection elevation={0}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                  Weekly Hours Breakdown
                </Typography>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const dayKey = day as keyof typeof formData.weeklyHours;
                  const dayHours = formData.weeklyHours[dayKey];
                  const dayTotal = (
                    parseFloat(dayHours.regularHours) +
                    parseFloat(dayHours.overtimeHours) +
                    parseFloat(dayHours.doubleOvertimeHours) +
                    parseFloat(dayHours.nightShiftHours)
                  ) || 0;

                  return (
                    <Box key={day} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                          {day}
                        </Typography>
                        <Chip
                          label={`${dayTotal.toFixed(1)}h`}
                          size="small"
                          color={dayTotal > 0 ? 'primary' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 150px' }}>
                          <StyledTextField
                            fullWidth
                            label="Regular"
                            type="number"
                            size="small"
                            value={dayHours.regularHours}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                weeklyHours: {
                                  ...formData.weeklyHours,
                                  [dayKey]: {
                                    ...dayHours,
                                    regularHours: e.target.value,
                                  },
                                },
                              })
                            }
                            inputProps={{ min: 0, max: 24, step: 0.5 }}
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 150px' }}>
                          <StyledTextField
                            fullWidth
                            label="Overtime"
                            type="number"
                            size="small"
                            value={dayHours.overtimeHours}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                weeklyHours: {
                                  ...formData.weeklyHours,
                                  [dayKey]: {
                                    ...dayHours,
                                    overtimeHours: e.target.value,
                                  },
                                },
                              })
                            }
                            inputProps={{ min: 0, max: 24, step: 0.5 }}
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 150px' }}>
                          <StyledTextField
                            fullWidth
                            label="Double OT"
                            type="number"
                            size="small"
                            value={dayHours.doubleOvertimeHours}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                weeklyHours: {
                                  ...formData.weeklyHours,
                                  [dayKey]: {
                                    ...dayHours,
                                    doubleOvertimeHours: e.target.value,
                                  },
                                },
                              })
                            }
                            inputProps={{ min: 0, max: 24, step: 0.5 }}
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 150px' }}>
                          <StyledTextField
                            fullWidth
                            label="Night Shift"
                            type="number"
                            size="small"
                            value={dayHours.nightShiftHours}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                weeklyHours: {
                                  ...formData.weeklyHours,
                                  [dayKey]: {
                                    ...dayHours,
                                    nightShiftHours: e.target.value,
                                  },
                                },
                              })
                            }
                            inputProps={{ min: 0, max: 24, step: 0.5 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </StyledSection>
            )}

            {/* Notes Section */}
            <StyledSection elevation={0}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                Additional Notes
              </Typography>
              <StyledTextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes about this timesheet entry..."
              />
            </StyledSection>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end', pt: 1 }}>
              <ActionButton
                variant="outlined"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={isSubmitDisabled}
                onClick={() => handleSubmit(TimesheetStatus.DRAFT)}
              >
                Save as Draft
              </ActionButton>
              <ActionButton
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={isSubmitDisabled}
                onClick={() => handleSubmit(TimesheetStatus.SUBMITTED)}
              >
                {isEditMode ? 'Update Timesheet' : 'Submit Timesheet'}
              </ActionButton>
            </Box>
          </Box>
        </Box>
      </StyledCard>
    </LocalizationProvider>
  );
};

