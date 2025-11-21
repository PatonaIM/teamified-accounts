import React, { useState, useEffect } from 'react';
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
  Autocomplete,
  Box,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isValid, parseISO } from 'date-fns';
import type { EmploymentStatus, EmploymentRecord, CreateEmploymentRecordDto, UpdateEmploymentRecordDto, User, Client } from '../../types/employmentRecords';
import { employmentRecordsService } from '../../services/employmentRecordsService';

interface EmploymentRecordFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record?: EmploymentRecord | null;
}

interface FormData {
  userId: string;
  clientId: string;
  countryId: string;
  role: string;
  startDate: Date | null;
  endDate: Date | null;
  status: EmploymentStatus;
}

interface FormErrors {
  userId?: string;
  clientId?: string;
  countryId?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  general?: string;
}

const EmploymentRecordForm: React.FC<EmploymentRecordFormProps> = ({
  open,
  onClose,
  onSuccess,
  record,
}) => {
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    clientId: '',
    countryId: '',
    role: '',
    startDate: null,
    endDate: null,
    status: 'active',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [countries, setCountries] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const isEdit = Boolean(record);

  // Load users, clients, and countries
  useEffect(() => {
    if (open) {
      loadUsersClientsAndCountries();
    }
  }, [open]);

  // Initialize form data
  useEffect(() => {
    if (open) {
      if (record) {
        setFormData({
          userId: record.userId,
          clientId: record.clientId,
          countryId: (record as any).countryId || '',
          role: record.role,
          startDate: record.startDate ? parseISO(record.startDate) : null,
          endDate: record.endDate ? parseISO(record.endDate) : null,
          status: record.status,
        });
      } else {
        setFormData({
          userId: '',
          clientId: '',
          countryId: '',
          role: '',
          startDate: null,
          endDate: null,
          status: 'active',
        });
      }
      setErrors({});
    }
  }, [open, record]);

  const loadUsersClientsAndCountries = async () => {
    setLoadingUsers(true);
    setLoadingClients(true);
    setLoadingCountries(true);

    try {
      const usersData = await employmentRecordsService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }

    try {
      const clientsData = await employmentRecordsService.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoadingClients(false);
    }

    try {
      const countriesData = await employmentRecordsService.getCountries();
      setCountries(countriesData);
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.userId) newErrors.userId = 'Employee is required';
    if (!formData.clientId) newErrors.clientId = 'Client is required';
    if (!formData.countryId) newErrors.countryId = 'Country is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (isEdit && record) {
        const updateDto: UpdateEmploymentRecordDto = {
          role: formData.role,
          startDate: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : undefined,
          endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : undefined,
          status: formData.status,
        };
        await employmentRecordsService.updateEmploymentRecord(record.id, updateDto);
      } else {
        const createDto: CreateEmploymentRecordDto = {
          userId: formData.userId,
          clientId: formData.clientId,
          countryId: formData.countryId,
          role: formData.role,
          startDate: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : undefined,
          endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : undefined,
          status: formData.status,
        };
        await employmentRecordsService.createEmploymentRecord(createDto);
      }
      onSuccess();
      handleClose();
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to save employment record' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const selectedUser = users.find(u => u.id === formData.userId);
  const selectedClient = clients.find(c => c.id === formData.clientId);
  const selectedCountry = countries.find(c => c.id === formData.countryId);

  const statuses: { value: EmploymentStatus; label: string }[] = [
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'offboarding', label: 'Offboarding' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'completed', label: 'Completed' },
  ];

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
          fontSize: '1.5rem',
          fontWeight: 600,
          py: 2.5,
        }}>
          {isEdit ? 'Edit Employment Record' : 'Create Employment Record'}
        </DialogTitle>
        
        <DialogContent sx={{ p: 4, pt: 4 }}>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Employee and Client Row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                  value={selectedUser || null}
                  onChange={(_, newValue) => {
                    setFormData(prev => ({ ...prev, userId: newValue?.id || '' }));
                    if (errors.userId) {
                      setErrors(prev => ({ ...prev, userId: undefined }));
                    }
                  }}
                  loading={loadingUsers}
                  disabled={submitting || isEdit}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Employee"
                      error={Boolean(errors.userId)}
                      helperText={errors.userId || (isEdit && 'Cannot change employee after creation')}
                      required
                      placeholder="Select employee"
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
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.firstName} {option.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px' }}>
                <Autocomplete
                  options={clients}
                  getOptionLabel={(option) => option.name}
                  value={selectedClient || null}
                  onChange={(_, newValue) => {
                    setFormData(prev => ({ ...prev, clientId: newValue?.id || '' }));
                    if (errors.clientId) {
                      setErrors(prev => ({ ...prev, clientId: undefined }));
                    }
                  }}
                  loading={loadingClients}
                  disabled={submitting || isEdit}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Client"
                      error={Boolean(errors.clientId)}
                      helperText={errors.clientId || (isEdit && 'Cannot change client after creation')}
                      required
                      placeholder="Select client"
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
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.name}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Box>
            </Box>

            {/* Country Row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <Autocomplete
                  options={countries}
                  getOptionLabel={(option) => option.name}
                  value={selectedCountry || null}
                  onChange={(_, newValue) => {
                    setFormData(prev => ({ ...prev, countryId: newValue?.id || '' }));
                    if (errors.countryId) {
                      setErrors(prev => ({ ...prev, countryId: undefined }));
                    }
                  }}
                  loading={loadingCountries}
                  disabled={submitting || isEdit}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country"
                      error={Boolean(errors.countryId)}
                      helperText={errors.countryId || (isEdit && 'Cannot change country after creation')}
                      required
                      placeholder="Select country"
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
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.code}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Box>
            </Box>

            {/* Role and Status Row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Role / Position"
                  value={formData.role}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, role: e.target.value }));
                    if (errors.role) {
                      setErrors(prev => ({ ...prev, role: undefined }));
                    }
                  }}
                  error={Boolean(errors.role)}
                  helperText={errors.role}
                  placeholder="e.g., Software Engineer, Manager"
                  required
                  disabled={submitting}
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
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as EmploymentStatus }))}
                    label="Status"
                    disabled={submitting}
                    sx={{
                      bgcolor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.common.white, 0.09)
                          : 'background.paper',
                    }}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Date Range Row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <DatePicker
                  label="Start Date *"
                  value={formData.startDate}
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, startDate: date }));
                    if (errors.startDate) {
                      setErrors(prev => ({ ...prev, startDate: undefined }));
                    }
                  }}
                  disabled={submitting}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.startDate),
                      helperText: errors.startDate,
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
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, endDate: date }));
                    if (errors.endDate) {
                      setErrors(prev => ({ ...prev, endDate: undefined }));
                    }
                  }}
                  disabled={submitting}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.endDate),
                      helperText: errors.endDate || 'Leave empty if currently employed',
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
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={submitting}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : undefined}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {submitting ? 'Saving...' : (isEdit ? 'Update Record' : 'Create Record')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EmploymentRecordForm;
