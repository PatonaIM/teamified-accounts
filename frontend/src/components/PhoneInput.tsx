import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { Search, KeyboardArrowDown, Check } from '@mui/icons-material';
import { countries, type Country } from './CountrySelect';

const POPULAR_COUNTRY_CODES = ['AU', 'GB', 'US'];

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryChange: (countryCode: string) => void;
  onPhoneChange: (phoneNumber: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  label = 'Phone Number',
  error,
  helperText,
  disabled,
  required,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === countryCode) || countries.find((c) => c.code === 'AU'),
    [countryCode]
  );

  const { popularCountries, otherCountries } = useMemo(() => {
    const popular = countries.filter((c) => POPULAR_COUNTRY_CODES.includes(c.code));
    const others = countries
      .filter((c) => !POPULAR_COUNTRY_CODES.includes(c.code))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { popularCountries: popular, otherCountries: others };
  }, []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) {
      return { popular: popularCountries, others: otherCountries };
    }
    const query = searchQuery.toLowerCase();
    const filterFn = (c: Country) =>
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.dialCode.includes(query);
    return {
      popular: popularCountries.filter(filterFn),
      others: otherCountries.filter(filterFn),
    };
  }, [searchQuery, popularCountries, otherCountries]);

  const handleCountryClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  const handleSelect = (code: string) => {
    onCountryChange(code);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Typography
        variant="body2"
        color={error ? 'error' : 'text.secondary'}
        sx={{ mb: 0.5, fontWeight: 500 }}
      >
        {label}
        {required && <span style={{ color: 'red' }}> *</span>}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box
          onClick={handleCountryClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 1,
            border: '1px solid',
            borderColor: error ? 'error.main' : 'rgba(0, 0, 0, 0.23)',
            borderRadius: 1,
            cursor: disabled ? 'default' : 'pointer',
            backgroundColor: disabled ? 'action.disabledBackground' : 'background.paper',
            minWidth: 100,
            '&:hover': {
              borderColor: disabled ? undefined : 'text.primary',
            },
          }}
        >
          <Typography fontSize={20}>{selectedCountry?.flag}</Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCountry?.dialCode}
          </Typography>
          <KeyboardArrowDown fontSize="small" sx={{ color: 'text.secondary', ml: 'auto' }} />
        </Box>

        <TextField
          fullWidth
          value={phoneNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d\s-]/g, '');
            onPhoneChange(value);
          }}
          error={error}
          disabled={disabled}
          placeholder="555 123 4567"
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '100%',
            },
          }}
        />
      </Box>
      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: 280,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            autoFocus
          />
        </Box>

        <List dense sx={{ pt: 0 }}>
          {filteredCountries.popular.length > 0 && (
            <>
              <ListItem sx={{ py: 0.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  Popular
                </Typography>
              </ListItem>
              {filteredCountries.popular.map((country) => (
                <ListItemButton
                  key={country.code}
                  onClick={() => handleSelect(country.code)}
                  selected={countryCode === country.code}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Typography fontSize={20}>{country.flag}</Typography>
                  </ListItemIcon>
                  <ListItemText primary={country.name} />
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    {country.dialCode}
                  </Typography>
                  {countryCode === country.code && <Check fontSize="small" color="primary" />}
                </ListItemButton>
              ))}
              <Divider sx={{ my: 1 }} />
            </>
          )}

          {filteredCountries.others.length > 0 && (
            <>
              <ListItem sx={{ py: 0.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  All Countries
                </Typography>
              </ListItem>
              {filteredCountries.others.map((country) => (
                <ListItemButton
                  key={country.code}
                  onClick={() => handleSelect(country.code)}
                  selected={countryCode === country.code}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Typography fontSize={20}>{country.flag}</Typography>
                  </ListItemIcon>
                  <ListItemText primary={country.name} />
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    {country.dialCode}
                  </Typography>
                  {countryCode === country.code && <Check fontSize="small" color="primary" />}
                </ListItemButton>
              ))}
            </>
          )}

          {filteredCountries.popular.length === 0 && filteredCountries.others.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No countries found"
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          )}
        </List>
      </Popover>
    </Box>
  );
};

export default PhoneInput;
