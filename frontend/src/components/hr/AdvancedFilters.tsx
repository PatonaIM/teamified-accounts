import React from 'react';
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';

export interface FilterState {
  status: string;
  category: string;
  dateRange: string;
  candidateStatus: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const handleChange = (field: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== 'all');

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        border: '1px solid #E5E7EB',
        background: 'linear-gradient(135deg, rgba(161, 106, 232, 0.02) 0%, rgba(128, 150, 253, 0.02) 100%)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <FilterIcon color="primary" />
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Document Status</InputLabel>
              <Select
                value={filters.status}
                label="Document Status"
                onChange={(e) => handleChange('status', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="needs_changes">Needs Changes</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleChange('category', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="cv">CV</MenuItem>
                <MenuItem value="identity">Identity</MenuItem>
                <MenuItem value="employment">Employment</MenuItem>
                <MenuItem value="education">Education</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filters.dateRange}
                label="Date Range"
                onChange={(e) => handleChange('dateRange', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Candidate Status</InputLabel>
              <Select
                value={filters.candidateStatus}
                label="Candidate Status"
                onChange={(e) => handleChange('candidateStatus', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="complete">Complete (100%)</MenuItem>
                <MenuItem value="incomplete">Incomplete</MenuItem>
              </Select>
            </FormControl>

            {hasActiveFilters && (
              <Tooltip title="Clear all filters">
                <IconButton
                  onClick={onClearFilters}
                  size="small"
                  sx={{
                    bgcolor: 'error.lighter',
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.light',
                    },
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Box>

      {hasActiveFilters && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          {filters.status !== 'all' && (
            <Chip
              label={`Status: ${filters.status}`}
              onDelete={() => handleChange('status', 'all')}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          )}
          {filters.category !== 'all' && (
            <Chip
              label={`Category: ${filters.category}`}
              onDelete={() => handleChange('category', 'all')}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          )}
          {filters.dateRange !== 'all' && (
            <Chip
              label={`Last ${filters.dateRange} days`}
              onDelete={() => handleChange('dateRange', 'all')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {filters.candidateStatus !== 'all' && (
            <Chip
              label={`Candidate: ${filters.candidateStatus}`}
              onDelete={() => handleChange('candidateStatus', 'all')}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default AdvancedFilters;
