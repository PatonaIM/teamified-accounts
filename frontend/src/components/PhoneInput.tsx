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

const PHONE_LENGTH_BY_COUNTRY: Record<string, { min: number; max: number }> = {
  AU: { min: 9, max: 9 },
  GB: { min: 10, max: 10 },
  US: { min: 10, max: 10 },
  CA: { min: 10, max: 10 },
  IN: { min: 10, max: 10 },
  NZ: { min: 9, max: 10 },
  SG: { min: 8, max: 8 },
  PH: { min: 10, max: 10 },
  DEFAULT: { min: 6, max: 15 },
};

const getFlagUrl = (countryCode: string) => 
  `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;

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
    const popular = POPULAR_COUNTRY_CODES
      .map((code) => countries.find((c) => c.code === code))
      .filter((c): c is Country => c !== undefined);
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
            py: 1.5,
            border: '1px solid',
            borderColor: error ? 'error.main' : '#E5E7EB',
            borderRadius: 2,
            cursor: disabled ? 'default' : 'pointer',
            backgroundColor: disabled ? 'action.disabledBackground' : 'white',
            minWidth: 100,
            '&:hover': {
              borderColor: disabled ? undefined : '#9333EA',
            },
          }}
        >
          {selectedCountry && (
            <img 
              src={getFlagUrl(selectedCountry.code)} 
              alt={selectedCountry.name} 
              style={{ width: 24, height: 18, objectFit: 'cover', borderRadius: 2 }}
            />
          )}
          <Typography variant="body2" color="text.secondary">
            {selectedCountry?.dialCode}
          </Typography>
          <KeyboardArrowDown fontSize="small" sx={{ color: 'text.secondary', ml: 'auto' }} />
        </Box>

        <TextField
          fullWidth
          value={phoneNumber}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, '');
            const phoneConfig = PHONE_LENGTH_BY_COUNTRY[countryCode] || PHONE_LENGTH_BY_COUNTRY.DEFAULT;
            const limitedValue = digitsOnly.slice(0, phoneConfig.max);
            onPhoneChange(limitedValue);
          }}
          error={error}
          disabled={disabled}
          placeholder="555123456"
          size="medium"
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '100%',
              bgcolor: 'white',
              borderRadius: 2,
              '& fieldset': { borderColor: '#E5E7EB' },
              '&:hover fieldset': { borderColor: '#9333EA' },
              '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
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
                    <img 
                      src={getFlagUrl(country.code)} 
                      alt={country.name} 
                      style={{ width: 24, height: 18, objectFit: 'cover', borderRadius: 2 }}
                    />
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
                    <img 
                      src={getFlagUrl(country.code)} 
                      alt={country.name} 
                      style={{ width: 24, height: 18, objectFit: 'cover', borderRadius: 2 }}
                    />
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
