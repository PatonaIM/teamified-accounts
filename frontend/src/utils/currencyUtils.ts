/**
 * Currency Utilities
 * Helper functions for currency formatting, conversion, and display
 */

import type { Currency } from '../types/payroll/payroll.types';

/**
 * Format a number as currency with proper decimal places
 */
export const formatCurrency = (
  amount: number,
  currency: Currency,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    locale?: string;
  }
): string => {
  const {
    showSymbol = true,
    showCode = false,
    locale = 'en-US',
  } = options || {};

  const formattedAmount = amount.toLocaleString(locale, {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  });

  let result = formattedAmount;

  if (showSymbol) {
    result = `${currency.symbol}${result}`;
  }

  if (showCode) {
    result = `${result} ${currency.code}`;
  }

  return result;
};

/**
 * Parse a currency string to a number
 */
export const parseCurrency = (value: string, currency: Currency): number => {
  // Remove currency symbol and whitespace
  const cleaned = value
    .replace(currency.symbol, '')
    .replace(currency.code, '')
    .replace(/\s/g, '')
    .replace(/,/g, '');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validate currency amount format
 */
export const validateCurrencyAmount = (
  value: string,
  currency: Currency
): { valid: boolean; error?: string } => {
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (parsed < 0) {
    return { valid: false, error: 'Amount cannot be negative' };
  }

  // Check decimal places
  const decimalPart = cleaned.split('.')[1];
  if (decimalPart && decimalPart.length > currency.decimalPlaces) {
    return {
      valid: false,
      error: `Maximum ${currency.decimalPlaces} decimal places allowed`,
    };
  }

  return { valid: true };
};

/**
 * Round amount to currency's decimal places
 */
export const roundToCurrency = (amount: number, currency: Currency): number => {
  const multiplier = Math.pow(10, currency.decimalPlaces);
  return Math.round(amount * multiplier) / multiplier;
};

/**
 * Calculate percentage of amount
 */
export const calculatePercentage = (
  amount: number,
  percentage: number,
  currency: Currency
): number => {
  const result = (amount * percentage) / 100;
  return roundToCurrency(result, currency);
};

/**
 * Get currency symbol by code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    PHP: '₱',
    AUD: 'A$',
    CAD: 'C$',
    CNY: '¥',
    SGD: 'S$',
  };

  return symbols[currencyCode] || currencyCode;
};

/**
 * Format amount range
 */
export const formatCurrencyRange = (
  min: number,
  max: number,
  currency: Currency,
  separator: string = ' - '
): string => {
  const formattedMin = formatCurrency(min, currency);
  const formattedMax = formatCurrency(max, currency);
  return `${formattedMin}${separator}${formattedMax}`;
};

/**
 * Compare two currency amounts
 */
export const compareCurrencyAmounts = (
  amount1: number,
  amount2: number,
  currency: Currency
): number => {
  const rounded1 = roundToCurrency(amount1, currency);
  const rounded2 = roundToCurrency(amount2, currency);
  return rounded1 - rounded2;
};

/**
 * Check if two amounts are equal (considering decimal places)
 */
export const areCurrencyAmountsEqual = (
  amount1: number,
  amount2: number,
  currency: Currency
): boolean => {
  return compareCurrencyAmounts(amount1, amount2, currency) === 0;
};

/**
 * Calculate exchange rate between two amounts
 */
export const calculateExchangeRate = (
  fromAmount: number,
  toAmount: number,
  toCurrency: Currency
): number => {
  if (fromAmount === 0) return 0;
  const rate = toAmount / fromAmount;
  return roundToCurrency(rate, toCurrency);
};

/**
 * Format currency input (adds separators while typing)
 */
export const formatCurrencyInput = (
  value: string,
  currency: Currency
): string => {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Split into integer and decimal parts
  const parts = cleaned.split('.');
  const integerPart = parts[0] || '0';
  const decimalPart = parts[1];

  // Add thousand separators to integer part
  const formattedInteger = parseInt(integerPart).toLocaleString('en-US');

  // Combine with decimal part (if exists)
  if (decimalPart !== undefined) {
    const limitedDecimal = decimalPart.slice(0, currency.decimalPlaces);
    return `${formattedInteger}.${limitedDecimal}`;
  }

  return formattedInteger;
};

/**
 * Get currency display name with symbol
 */
export const getCurrencyDisplayName = (currency: Currency): string => {
  return `${currency.name} (${currency.symbol})`;
};

/**
 * Convert amount with exchange rate
 */
export const convertWithRate = (
  amount: number,
  exchangeRate: number,
  toCurrency: Currency
): number => {
  const converted = amount * exchangeRate;
  return roundToCurrency(converted, toCurrency);
};

