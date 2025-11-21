/**
 * Currency Display Component
 * Formats and displays currency amounts with proper symbols and decimal places
 */

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import type { Currency } from '../../types/payroll/payroll.types';

interface CurrencyDisplayProps {
  amount: number;
  currency: Currency;
  variant?: 'body1' | 'body2' | 'h6' | 'h5' | 'h4' | 'subtitle1' | 'subtitle2';
  color?: string;
  showCurrencyCode?: boolean;
  convertedAmount?: number;
  convertedCurrency?: Currency;
  fontWeight?: number;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  variant = 'body1',
  color,
  showCurrencyCode = false,
  convertedAmount,
  convertedCurrency,
  fontWeight,
}) => {
  const formatAmount = (amt: number, curr: Currency): string => {
    return amt.toLocaleString('en-US', {
      minimumFractionDigits: curr.decimalPlaces,
      maximumFractionDigits: curr.decimalPlaces,
    });
  };

  const displayValue = `${currency.symbol}${formatAmount(amount, currency)}`;
  const displayWithCode = showCurrencyCode
    ? `${displayValue} ${currency.code}`
    : displayValue;

  if (convertedAmount !== undefined && convertedCurrency) {
    const convertedDisplay = `${convertedCurrency.symbol}${formatAmount(convertedAmount, convertedCurrency)}`;
    
    return (
      <Tooltip
        title={`${displayWithCode} ≈ ${convertedDisplay} ${convertedCurrency.code}`}
        arrow
      >
        <Box display="inline-flex" alignItems="baseline" gap={0.5}>
          <Typography variant={variant} color={color} fontWeight={fontWeight}>
            {displayValue}
          </Typography>
          {showCurrencyCode && (
            <Typography variant="caption" color="text.disabled">
              {currency.code}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            (≈{convertedDisplay})
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box display="inline-flex" alignItems="baseline" gap={0.5}>
      <Typography variant={variant} color={color} fontWeight={fontWeight}>
        {displayValue}
      </Typography>
      {showCurrencyCode && (
        <Typography variant="caption" color="text.disabled">
          {currency.code}
        </Typography>
      )}
    </Box>
  );
};

