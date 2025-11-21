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

export interface InvitationFilterState {
  search: string;
  status: string;
  role: string;
}

interface InvitationFiltersProps {
  filters: InvitationFilterState;
  onFiltersChange: (filters: InvitationFilterState) => void;
  onSearchChange: (search: string) => void;
}

const InvitationFilters: React.FC<InvitationFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearchChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (key: keyof InvitationFilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: filters.search, // Keep search
      status: 'all',
      role: 'all',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.role !== 'all') count++;
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
          placeholder="Search by name, email, or client..."
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
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180, flex: '1 1 auto' }} size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                label="Role"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="EOR">EOR</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default InvitationFilters;
