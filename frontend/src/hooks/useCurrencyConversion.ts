/**
 * Currency Conversion Hook
 * React hook for managing currency conversions with caching
 */

import { useState, useEffect, useCallback } from 'react';
import { convertCurrency } from '../services/payroll/payrollService';
import type { CurrencyConversionResponse } from '../types/payroll/payroll.types';

interface ConversionCache {
  [key: string]: {
    data: CurrencyConversionResponse;
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const conversionCache: ConversionCache = {};

export const useCurrencyConversion = (
  fromCurrencyCode: string,
  toCurrencyCode: string,
  amount: number,
  options?: {
    autoConvert?: boolean;
    cacheResults?: boolean;
  }
) => {
  const { autoConvert = true, cacheResults = true } = options || {};
  
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCacheKey = useCallback(
    (from: string, to: string) => `${from}-${to}`,
    []
  );

  const getFromCache = useCallback(
    (from: string, to: string): CurrencyConversionResponse | null => {
      if (!cacheResults) return null;
      
      const key = getCacheKey(from, to);
      const cached = conversionCache[key];
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
      
      return null;
    },
    [cacheResults, getCacheKey]
  );

  const saveToCache = useCallback(
    (from: string, to: string, data: CurrencyConversionResponse) => {
      if (!cacheResults) return;
      
      const key = getCacheKey(from, to);
      conversionCache[key] = {
        data,
        timestamp: Date.now(),
      };
    },
    [cacheResults, getCacheKey]
  );

  const convert = useCallback(async () => {
    if (!fromCurrencyCode || !toCurrencyCode || amount === 0) {
      setConvertedAmount(0);
      setExchangeRate(0);
      return;
    }

    // Same currency - no conversion needed
    if (fromCurrencyCode === toCurrencyCode) {
      setConvertedAmount(amount);
      setExchangeRate(1);
      setEffectiveDate(new Date().toISOString());
      return;
    }

    // Check cache first
    const cached = getFromCache(fromCurrencyCode, toCurrencyCode);
    if (cached) {
      const convertedAmt = amount * cached.rate;
      setConvertedAmount(convertedAmt);
      setExchangeRate(cached.rate);
      setEffectiveDate(cached.effectiveDate);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await convertCurrency({
        fromCurrency: fromCurrencyCode,
        toCurrency: toCurrencyCode,
        amount,
      });

      setConvertedAmount(result.convertedAmount);
      setExchangeRate(result.rate);
      setEffectiveDate(result.effectiveDate);

      // Save to cache
      saveToCache(fromCurrencyCode, toCurrencyCode, result);
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(err.response?.data?.message || 'Failed to convert currency');
      setConvertedAmount(0);
      setExchangeRate(0);
    } finally {
      setLoading(false);
    }
  }, [fromCurrencyCode, toCurrencyCode, amount, getFromCache, saveToCache]);

  useEffect(() => {
    if (autoConvert) {
      convert();
    }
  }, [autoConvert, convert]);

  return {
    convertedAmount,
    exchangeRate,
    effectiveDate,
    loading,
    error,
    convert,
  };
};

