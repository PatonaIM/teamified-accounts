import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Collapse,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

export interface SalaryHistoryFilterState {
  search: string;
  status: string;
  currency: string;
  dateRange: string;
  clientId?: string;
}

interface SalaryHistoryFiltersProps {
  filters: SalaryHistoryFilterState;
  onFiltersChange: (filters: SalaryHistoryFilterState) => void;
  onSearchChange: (search: string) => void;
}

const SalaryHistoryFilters: React.FC<SalaryHistoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearchChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (key: keyof SalaryHistoryFilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: filters.search, // Keep search
      status: 'all',
      currency: 'all',
      dateRange: 'all',
      clientId: filters.clientId, // Keep clientId
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.currency !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box>
      {/* Search Bar + Filters Button */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {/* Search Bar - Takes most space */}
        <TextField
          size="small"
          placeholder="Search by user, amount, or reason..."
          value={filters.search}
          onChange={(e) => {
            handleFilterChange('search', e.target.value);
            onSearchChange(e.target.value);
          }}
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
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 180, flex: '1 1 auto' }} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="current">Current</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="historical">Historical</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180, flex: '1 1 auto' }} size="small">
              <InputLabel>Currency</InputLabel>
              <Select
                value={filters.currency}
                onChange={(e) => handleFilterChange('currency', e.target.value)}
                label="Currency"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Currencies</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="CAD">CAD</MenuItem>
                <MenuItem value="AUD">AUD</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180, flex: '1 1 auto' }} size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                label="Date Range"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
                <MenuItem value="365">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default SalaryHistoryFilters;
