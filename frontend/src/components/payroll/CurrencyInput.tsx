/**
 * Currency Input Component
 * Specialized input for currency amounts with validation and formatting
 */

import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  FormHelperText,
  Box,
  Typography,
} from '@mui/material';
import type { Currency } from '../../types/payroll/payroll.types';
import { formatCurrencyInput, validateCurrencyAmount, parseCurrency } from '../../utils/currencyUtils';

interface CurrencyInputProps {
  label: string;
  currency: Currency;
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  placeholder?: string;
  min?: number;
  max?: number;
  showConversion?: boolean;
  convertedAmount?: number;
  convertedCurrency?: Currency;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  currency,
  value,
  onChange,
  error: externalError = false,
  helperText: externalHelperText,
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'medium',
  placeholder = '0.00',
  min,
  max,
  showConversion = false,
  convertedAmount,
  convertedCurrency,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [internalError, setInternalError] = useState<string | undefined>();

  // Initialize input value from prop
  useEffect(() => {
    if (value === 0 && inputValue === '') return;
    setInputValue(value.toFixed(currency.decimalPlaces));
  }, [value, currency.decimalPlaces]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    // Allow empty input
    if (newValue === '') {
      setInputValue('');
      setInternalError(undefined);
      onChange(0);
      return;
    }

    // Validate format
    const validation = validateCurrencyAmount(newValue, currency);
    
    if (!validation.valid) {
      setInternalError(validation.error);
      setInputValue(newValue);
      return;
    }

    // Check min/max
    const numValue = parseCurrency(newValue, currency);
    
    if (min !== undefined && numValue < min) {
      setInternalError(`Minimum amount is ${currency.symbol}${min}`);
      setInputValue(newValue);
      return;
    }

    if (max !== undefined && numValue > max) {
      setInternalError(`Maximum amount is ${currency.symbol}${max}`);
      setInputValue(newValue);
      return;
    }

    // Valid input
    setInternalError(undefined);
    setInputValue(newValue);
    onChange(numValue);
  };

  const handleBlur = () => {
    // Format on blur if valid
    if (inputValue && !internalError) {
      const numValue = parseCurrency(inputValue, currency);
      setInputValue(numValue.toFixed(currency.decimalPlaces));
    }
  };

  const error = externalError || !!internalError;
  const helperText = externalHelperText || internalError;

  return (
    <Box>
      <TextField
        label={label}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        error={error}
        helperText={helperText}
        disabled={disabled}
        required={required}
        fullWidth={fullWidth}
        size={size}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {currency.symbol}
              </Typography>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="caption" color="text.disabled">
                {currency.code}
              </Typography>
            </InputAdornment>
          ),
        }}
      />
      {showConversion && convertedAmount !== undefined && convertedCurrency && (
        <FormHelperText>
          ≈ {convertedCurrency.symbol}
          {convertedAmount.toFixed(convertedCurrency.decimalPlaces)} {convertedCurrency.code}
        </FormHelperText>
      )}
    </Box>
  );
};

