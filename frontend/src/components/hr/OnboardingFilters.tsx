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

export interface OnboardingFilterState {
  search: string;
  status: string;
  category: string;
  dateRange: string;
  candidateStatus: string;
}

interface OnboardingFiltersProps {
  filters: OnboardingFilterState;
  onFiltersChange: (filters: OnboardingFilterState) => void;
  onSearchChange: (search: string) => void;
}

const OnboardingFilters: React.FC<OnboardingFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearchChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (key: keyof OnboardingFilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: filters.search, // Keep search
      status: 'all',
      category: 'all',
      dateRange: 'all',
      candidateStatus: 'all',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.candidateStatus !== 'all') count++;
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
          placeholder="Search candidates by name or email..."
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
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E7EB' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 180, flex: '1 1 auto' }} size="small">
              <InputLabel>Document Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Document Status"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="needs_changes">Needs Changes</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180, flex: '1 1 auto' }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                label="Category"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="cv">CV</MenuItem>
                <MenuItem value="identity">Identity</MenuItem>
                <MenuItem value="employment">Employment</MenuItem>
                <MenuItem value="education">Education</MenuItem>
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
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180, flex: '1 1 auto' }} size="small">
              <InputLabel>Candidate Status</InputLabel>
              <Select
                value={filters.candidateStatus}
                onChange={(e) => handleFilterChange('candidateStatus', e.target.value)}
                label="Candidate Status"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="complete">Complete (100%)</MenuItem>
                <MenuItem value="incomplete">Incomplete</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default OnboardingFilters;
