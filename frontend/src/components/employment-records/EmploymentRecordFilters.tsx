import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Autocomplete,
  IconButton,
  Collapse,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { EmploymentRecordFilters, EmploymentStatus, User, Client } from '../../types/employmentRecords';
import { employmentRecordsService } from '../../services/employmentRecordsService';

interface EmploymentRecordFiltersProps {
  filters: EmploymentRecordFilters;
  onFiltersChange: (filters: EmploymentRecordFilters) => void;
  onClose: () => void;
}

const EmploymentRecordFiltersComponent: React.FC<EmploymentRecordFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<EmploymentRecordFilters>(filters);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [expanded, setExpanded] = useState(false);

  // Load users and clients for filter options
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResponse, clientsResponse] = await Promise.all([
          employmentRecordsService.getUsers(),
          employmentRecordsService.getClients(),
        ]);
        setUsers(usersResponse);
        setClients(clientsResponse);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };

    loadData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (field: keyof EmploymentRecordFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    onFiltersChange({ ...localFilters, page: 1 }); // Reset to first page
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: EmploymentRecordFilters = {
      page: 1,
      limit: 10,
      search: '',
      status: '',
      clientId: '',
      userId: '',
      sort: 'createdAt',
      order: 'desc',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Get selected user
  const selectedUser = users.find(user => user.id === localFilters.userId);

  // Get selected client
  const selectedClient = clients.find(client => client.id === localFilters.clientId);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Basic Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by user name, client name, or role..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={localFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={localFilters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                label="Sort By"
              >
                <MenuItem value="createdAt">Created Date</MenuItem>
                <MenuItem value="startDate">Start Date</MenuItem>
                <MenuItem value="endDate">End Date</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="role">Role</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Advanced Filters Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Button
            onClick={() => setExpanded(!expanded)}
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            size="small"
          >
            Advanced Filters
          </Button>
        </Box>

        {/* Advanced Filters */}
        <Collapse in={expanded}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={users}
                getOptionLabel={(user) => `${user.firstName} ${user.lastName} (${user.email})`}
                value={selectedUser || null}
                onChange={(_, newValue) => {
                  handleFilterChange('userId', newValue?.id || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by User"
                    size="small"
                    placeholder="Select a user..."
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={clients}
                getOptionLabel={(client) => client.name}
                value={selectedClient || null}
                onChange={(_, newValue) => {
                  handleFilterChange('clientId', newValue?.id || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Client"
                    size="small"
                    placeholder="Select a client..."
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date From"
                value={localFilters.startDateFrom ? new Date(localFilters.startDateFrom) : null}
                onChange={(newValue) => {
                  handleFilterChange('startDateFrom', newValue?.toISOString().split('T')[0] || '');
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date To"
                value={localFilters.startDateTo ? new Date(localFilters.startDateTo) : null}
                onChange={(newValue) => {
                  handleFilterChange('startDateTo', newValue?.toISOString().split('T')[0] || '');
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date From"
                value={localFilters.endDateFrom ? new Date(localFilters.endDateFrom) : null}
                onChange={(newValue) => {
                  handleFilterChange('endDateFrom', newValue?.toISOString().split('T')[0] || '');
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date To"
                value={localFilters.endDateTo ? new Date(localFilters.endDateTo) : null}
                onChange={(newValue) => {
                  handleFilterChange('endDateTo', newValue?.toISOString().split('T')[0] || '');
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Order</InputLabel>
                <Select
                  value={localFilters.order}
                  onChange={(e) => handleFilterChange('order', e.target.value)}
                  label="Order"
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Records per Page</InputLabel>
                <Select
                  value={localFilters.limit}
                  onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                  label="Records per Page"
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Collapse>

        {/* Filter Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              size="small"
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              size="small"
            >
              Clear All
            </Button>
          </Box>
          <Button
            variant="text"
            onClick={onClose}
            size="small"
          >
            Close
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default EmploymentRecordFiltersComponent;
