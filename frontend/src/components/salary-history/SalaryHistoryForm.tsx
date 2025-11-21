/**
 * Salary History Form Component
 * Form for creating new salary history records with validation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Autocomplete,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { salaryHistoryService } from '../../services/salaryHistoryService';
import { employmentService } from '../../services/employmentService';
import type {
  CreateSalaryHistoryRequest,
  SalaryHistoryFormData,
  SalaryHistoryFormErrors,
  SalaryHistory,
} from '../../types/salary-history.types';
import type { EmploymentRecord } from '../../types/employmentRecords';
import {
  CURRENCY_OPTIONS,
  CHANGE_REASON_OPTIONS,
} from '../../types/salary-history.types';

interface SalaryHistoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSalaryHistoryRequest) => Promise<void>;
  selectedEmployment: EmploymentRecord | null;
  initialData?: SalaryHistory | null;
}

export const SalaryHistoryForm: React.FC<SalaryHistoryFormProps> = ({
  open,
  onClose,
  onSubmit,
  selectedEmployment,
  initialData,
}) => {
  const [formData, setFormData] = useState<SalaryHistoryFormData>({
    employmentRecordId: '',
    salaryAmount: '',
    salaryCurrency: 'USD',
    effectiveDate: '',
    changeReason: '',
  });

  const [errors, setErrors] = useState<SalaryHistoryFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Autocomplete state
  const [searchTerm, setSearchTerm] = useState('');
  const [employmentOptions, setEmploymentOptions] = useState<EmploymentRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmploymentRecord, setSelectedEmploymentRecord] = useState<EmploymentRecord | null>(null);

  const isEditMode = !!initialData;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize form with selected employment or initial data
  useEffect(() => {
    if (initialData) {
      // Editing existing record
      const effectiveDateStr = initialData.effectiveDate instanceof Date
        ? initialData.effectiveDate.toISOString().split('T')[0]
        : new Date(initialData.effectiveDate).toISOString().split('T')[0];

      setFormData({
        employmentRecordId: initialData.employmentRecordId,
        salaryAmount: initialData.salaryAmount.toString(),
        salaryCurrency: initialData.salaryCurrency,
        effectiveDate: effectiveDateStr,
        changeReason: initialData.changeReason,
      });

      // Load the employment record for display in edit mode
      loadEmploymentRecordForEdit(initialData.employmentRecordId);
    } else if (selectedEmployment) {
      // Creating new record with selected employment
      setFormData(prev => ({
        ...prev,
        employmentRecordId: selectedEmployment.id,
      }));
      setSelectedEmploymentRecord(selectedEmployment);
      setEmploymentOptions([selectedEmployment]);
    } else {
      // Reset to defaults
      setFormData({
        employmentRecordId: '',
        salaryAmount: '',
        salaryCurrency: 'USD',
        effectiveDate: '',
        changeReason: '',
      });
      setSelectedEmploymentRecord(null);
      setEmploymentOptions([]);
    }
  }, [selectedEmployment, initialData]);

  // Load employment record for edit mode
  const loadEmploymentRecordForEdit = async (employmentId: string) => {
    try {
      const record = await employmentService.getEmploymentRecordById(employmentId);
      setSelectedEmploymentRecord(record);
      setEmploymentOptions([record]);
    } catch (error) {
      console.error('Failed to load employment record:', error);
    }
  };

  // Debounced search function
  const searchEmploymentRecords = useCallback(async (search: string) => {
    if (!search || search.length < 2) {
      setEmploymentOptions([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await employmentService.searchEmploymentRecords({
        search,
        limit: 20,
        status: 'active', // Only show active employment records
      });
      setEmploymentOptions(results);
    } catch (error) {
      console.error('Failed to search employment records:', error);
      setEmploymentOptions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = useCallback((event: React.SyntheticEvent, value: string) => {
    setSearchTerm(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      searchEmploymentRecords(value);
    }, 300); // 300ms debounce
  }, [searchEmploymentRecords]);

  // Handle employment record selection
  const handleEmploymentSelect = (event: React.SyntheticEvent, value: EmploymentRecord | null) => {
    setSelectedEmploymentRecord(value);
    setFormData(prev => ({
      ...prev,
      employmentRecordId: value?.id || '',
    }));
    if (errors.employmentRecordId) {
      setErrors(prev => ({ ...prev, employmentRecordId: undefined }));
    }
  };

  const handleInputChange = (field: keyof SalaryHistoryFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof SalaryHistoryFormData) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      effectiveDate: date ? date.toISOString().split('T')[0] : '',
    }));
    if (errors.effectiveDate) {
      setErrors(prev => ({ ...prev, effectiveDate: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: SalaryHistoryFormErrors = {};

    if (!formData.employmentRecordId) {
      newErrors.employmentRecordId = 'Employment record is required';
    }

    if (!formData.salaryAmount || parseFloat(formData.salaryAmount) <= 0) {
      newErrors.salaryAmount = 'Valid salary amount is required';
    }

    if (!formData.salaryCurrency) {
      newErrors.salaryCurrency = 'Currency is required';
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    }

    if (!formData.changeReason) {
      newErrors.changeReason = 'Change reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const submitData: CreateSalaryHistoryRequest = {
        employmentRecordId: formData.employmentRecordId,
        salaryAmount: parseFloat(formData.salaryAmount),
        salaryCurrency: formData.salaryCurrency,
        effectiveDate: formData.effectiveDate,
        changeReason: formData.changeReason,
      };

      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        employmentRecordId: selectedEmployment?.id || '',
        salaryAmount: '',
        salaryCurrency: 'USD',
        effectiveDate: '',
        changeReason: '',
      });
      setErrors({});
      setConflictError(null);
      setSelectedEmploymentRecord(selectedEmployment || null);
      setEmploymentOptions(selectedEmployment ? [selectedEmployment] : []);
      
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create salary history'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        employmentRecordId: selectedEmployment?.id || '',
        salaryAmount: '',
        salaryCurrency: 'USD',
        effectiveDate: '',
        changeReason: '',
      });
      setErrors({});
      setConflictError(null);
      setSelectedEmploymentRecord(selectedEmployment || null);
      setEmploymentOptions(selectedEmployment ? [selectedEmployment] : []);
      setSearchTerm('');
      onClose();
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Format status for display
  const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status color
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'onboarding':
        return 'info';
      case 'inactive':
        return 'warning';
      case 'terminated':
      case 'offboarding':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontSize: '1.75rem',
          fontWeight: 600,
          py: 2.5,
        }}>
          {isEditMode ? 'Edit Salary History Record' : 'Create Salary History Record'}
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 4 }}>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errors.general}
            </Alert>
          )}

          {conflictError && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              {conflictError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Employment Record Autocomplete */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <Autocomplete
                  value={selectedEmploymentRecord}
                  onChange={handleEmploymentSelect}
                  onInputChange={handleSearchChange}
                  inputValue={searchTerm}
                  options={employmentOptions}
                  getOptionLabel={(option) => employmentService.formatEmploymentRecordLabel(option)}
                  loading={isSearching}
                  disabled={isEditMode || isLoading}
                  noOptionsText={
                    searchTerm.length < 2 
                      ? 'Type at least 2 characters to search' 
                      : 'No employment records found'
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Employment Record"
                      placeholder="Search by employee name, role, or client"
                      required
                      error={!!errors.employmentRecordId}
                      helperText={errors.employmentRecordId || 'Search for an employment record'}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          bgcolor: (theme) => 
                            theme.palette.mode === 'dark' 
                              ? alpha(theme.palette.common.white, 0.09)
                              : 'background.paper',
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props as any;
                    return (
                      <li key={option.id} {...otherProps}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {option.user 
                                ? `${option.user.firstName} ${option.user.lastName}`.trim()
                                : 'Unknown Employee'}
                            </Typography>
                            <Chip 
                              label={formatStatus(option.status)}
                              size="small"
                              color={getStatusColor(option.status)}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {option.role} at {option.client?.name || 'Unknown Client'}
                          </Typography>
                        </Box>
                      </li>
                    );
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  fullWidth
                />
              </Box>
            </Box>

            {/* Salary Amount and Currency Row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Salary Amount"
                  type="number"
                  value={formData.salaryAmount}
                  onChange={handleInputChange('salaryAmount')}
                  error={!!errors.salaryAmount}
                  helperText={errors.salaryAmount || 'Enter the salary amount'}
                  placeholder="e.g., 75000"
                  required
                  disabled={isLoading}
                  inputProps={{
                    min: 0,
                    step: 0.01,
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.common.white, 0.09)
                          : 'background.paper',
                    },
                  }}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px' }}>
                <FormControl fullWidth required error={!!errors.salaryCurrency}>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={formData.salaryCurrency}
                    onChange={handleSelectChange('salaryCurrency')}
                    label="Currency"
                    disabled={isLoading}
                    sx={{
                      bgcolor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.common.white, 0.09)
                          : 'background.paper',
                    }}
                  >
                    {CURRENCY_OPTIONS.map((currency) => (
                      <MenuItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.salaryCurrency && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.salaryCurrency}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Box>

            {/* Effective Date and Change Reason Row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <DatePicker
                  label="Effective Date *"
                  value={formData.effectiveDate ? new Date(formData.effectiveDate) : null}
                  onChange={handleDateChange}
                  disabled={isLoading}
                  minDate={new Date()}
                  maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.effectiveDate,
                      helperText: errors.effectiveDate || 'Date when the salary change becomes effective',
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
              </Box>

              <Box sx={{ flex: '1 1 300px' }}>
                <FormControl fullWidth required error={!!errors.changeReason}>
                  <InputLabel>Change Reason</InputLabel>
                  <Select
                    value={formData.changeReason}
                    onChange={handleSelectChange('changeReason')}
                    label="Change Reason"
                    disabled={isLoading}
                    sx={{
                      bgcolor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.common.white, 0.09)
                          : 'background.paper',
                    }}
                  >
                    <MenuItem value="">
                      <em>Select a reason</em>
                    </MenuItem>
                    {CHANGE_REASON_OPTIONS.map((reason) => (
                      <MenuItem key={reason} value={reason}>
                        {reason}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.changeReason && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.changeReason}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={isLoading}
            sx={{
              borderRadius: 1.5,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            sx={{
              borderRadius: 1.5,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {isLoading 
              ? (isEditMode ? 'Saving...' : 'Creating...') 
              : (isEditMode ? 'Save Changes' : 'Create Salary Record')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
