/**
 * Currency Converter Component
 * Interactive currency conversion with real-time exchange rates
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { SwapVert as SwapIcon } from '@mui/icons-material';
import type { Currency, CurrencyConversionResponse } from '../../types/payroll/payroll.types';
import { CurrencyInput } from './CurrencyInput';
import { convertCurrency } from '../../services/payroll/payrollService';
import { formatCurrency } from '../../utils/currencyUtils';

interface CurrencyConverterProps {
  currencies: Currency[];
  defaultFromCurrency?: Currency;
  defaultToCurrency?: Currency;
  initialAmount?: number;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  currencies,
  defaultFromCurrency,
  defaultToCurrency,
  initialAmount = 0,
}) => {
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(
    defaultFromCurrency || currencies[0] || null
  );
  const [toCurrency, setToCurrency] = useState<Currency | null>(
    defaultToCurrency || currencies[1] || null
  );
  const [amount, setAmount] = useState<number>(initialAmount);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performConversion = async () => {
    if (!fromCurrency || !toCurrency || amount === 0) {
      setConvertedAmount(0);
      setExchangeRate(0);
      return;
    }

    // Same currency - no conversion needed
    if (fromCurrency.code === toCurrency.code) {
      setConvertedAmount(amount);
      setExchangeRate(1);
      setEffectiveDate(new Date().toISOString());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result: CurrencyConversionResponse = await convertCurrency({
        fromCurrency: fromCurrency.code,
        toCurrency: toCurrency.code,
        amount,
      });

      setConvertedAmount(result.convertedAmount);
      setExchangeRate(result.rate);
      setEffectiveDate(result.effectiveDate);
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(err.response?.data?.message || 'Failed to convert currency');
      setConvertedAmount(0);
      setExchangeRate(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performConversion();
  }, [fromCurrency, toCurrency, amount]);

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  if (!fromCurrency || !toCurrency) {
    return (
      <Alert severity="warning">
        Please configure currencies before using the converter
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Currency Converter
        </Typography>

        <Box display="flex" flexDirection="column" gap={3} mt={2}>
          {/* From Currency */}
          <Box>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>From Currency</InputLabel>
              <Select
                value={fromCurrency.code}
                label="From Currency"
                onChange={(e) => {
                  const currency = currencies.find(c => c.code === e.target.value);
                  if (currency) setFromCurrency(currency);
                }}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <CurrencyInput
              label="Amount"
              currency={fromCurrency}
              value={amount}
              onChange={setAmount}
              size="small"
            />
          </Box>

          {/* Swap Button */}
          <Box display="flex" justifyContent="center">
            <IconButton
              onClick={handleSwapCurrencies}
              sx={{
                bgcolor: 'primary.50',
                '&:hover': { bgcolor: 'primary.100' },
              }}
            >
              <SwapIcon />
            </IconButton>
          </Box>

          {/* To Currency */}
          <Box>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>To Currency</InputLabel>
              <Select
                value={toCurrency.code}
                label="To Currency"
                onChange={(e) => {
                  const currency = currencies.find(c => c.code === e.target.value);
                  if (currency) setToCurrency(currency);
                }}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              {loading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Converting...
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Converted Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="primary.main">
                    {formatCurrency(convertedAmount, toCurrency, { showCode: true })}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Exchange Rate Info */}
          {exchangeRate > 0 && (
            <>
              <Divider />
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Exchange Rate:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    1 {fromCurrency.code} = {exchangeRate.toFixed(4)} {toCurrency.code}
                  </Typography>
                </Box>
                {effectiveDate && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.disabled">
                      Effective Date:
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(effectiveDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

