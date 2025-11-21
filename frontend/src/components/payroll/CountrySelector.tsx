/**
 * Country Selector Component
 * Dropdown to select active country for payroll operations
 */

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Public as GlobalIcon } from '@mui/icons-material';
import { useCountry } from '../../contexts/CountryContext';

interface CountrySelectorProps {
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
  fullWidth?: boolean;
  label?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  size = 'medium',
  variant = 'outlined',
  fullWidth = false,
  label = 'Country',
}) => {
  const { selectedCountry, countries, setSelectedCountry, loading } = useCountry();

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Loading countries...
        </Typography>
      </Box>
    );
  }

  return (
    <FormControl variant={variant} size={size} fullWidth={fullWidth}>
      <InputLabel id="country-selector-label">{label}</InputLabel>
      <Select
        labelId="country-selector-label"
        id="country-selector"
        value={selectedCountry?.code || ''}
        label={label}
        onChange={(e) => {
          const country = countries.find(c => c.code === e.target.value);
          setSelectedCountry(country || null);
        }}
        startAdornment={
          <GlobalIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
        }
      >
        {countries.map((country) => (
          <MenuItem key={country.id} value={country.code}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight={600}>
                {country.code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {country.name}
              </Typography>
              {country.currency && (
                <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
                  ({country.currency.symbol})
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

