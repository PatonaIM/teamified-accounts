import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Grid,
  Collapse,
  IconButton,
  InputAdornment,
  Typography,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { EmploymentStatus, EmploymentRecordFilters as Filters, User, Client } from '../../types/employmentRecords';
import { employmentRecordsService } from '../../services/employmentRecordsService';

interface EmploymentRecordsFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const EmploymentRecordsFilters: React.FC<EmploymentRecordsFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  // Load users and clients for autocomplete
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingUsers(true);
        setLoadingClients(true);
        
        const [usersData, clientsData] = await Promise.all([
          employmentRecordsService.getUsers(),
          employmentRecordsService.getClients(),
        ]);
        
        setUsers(usersData);
        setClients(clientsData);
      } catch (error) {
        console.error('Failed to load filter data:', error);
      } finally {
        setLoadingUsers(false);
        setLoadingClients(false);
      }
    };

    loadData();
  }, []);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      clientId: '',
      userId: '',
      sort: 'createdAt',
      order: 'desc',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.clientId) count++;
    if (filters.userId) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Search Bar + Filters Button */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Search Bar - Takes most space */}
          <TextField
            size="small"
            placeholder="Search by employee name, client, or position..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Filters Button */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterIcon />}
              onClick={() => setExpanded(!expanded)}
              sx={{
                borderRadius: 2,
                px: 2,
                fontWeight: 600,
                textTransform: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Chip
                  label={activeFiltersCount}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 18,
                    fontSize: '0.7rem',
                  }}
                  color="primary"
                />
              )}
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                sx={{
                  borderRadius: 2,
                  minWidth: 'auto',
                  px: 2,
                  textTransform: 'none',
                }}
              >
                <ClearIcon fontSize="small" />
              </Button>
            )}
          </Box>
        </Box>

        {/* All Filters - Collapsible */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 180, flex: '1 1 auto' }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="onboarding">Onboarding</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="offboarding">Offboarding</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200, flex: '1 1 auto' }} size="small">
                <InputLabel>Client</InputLabel>
                <Select
                  value={filters.clientId}
                  onChange={(e) => handleFilterChange('clientId', e.target.value)}
                  label="Client"
                  disabled={loadingClients}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="">All Clients</MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 220, flex: '1 1 auto' }} size="small">
                <InputLabel>Employee</InputLabel>
                <Select
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  label="Employee"
                  disabled={loadingUsers}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200, flex: '1 1 auto' }} size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  label="Sort By"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="createdAt">Created Date</MenuItem>
                  <MenuItem value="startDate">Start Date</MenuItem>
                  <MenuItem value="endDate">End Date</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="position">Position</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150, flex: '1 1 auto' }} size="small">
                <InputLabel>Order</InputLabel>
                <Select
                  value={filters.order}
                  onChange={(e) => handleFilterChange('order', e.target.value)}
                  label="Order"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="desc">Descending</MenuItem>
                  <MenuItem value="asc">Ascending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </LocalizationProvider>
  );
};

export default EmploymentRecordsFilters;