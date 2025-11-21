import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseCurrency,
  validateCurrencyAmount,
  roundCurrency,
  convertCurrency,
  calculatePercentage,
  calculateTax,
  calculateNetAmount,
  sumCurrencyAmounts,
  subtractCurrencyAmounts,
  multiplyCurrencyAmount,
  divideCurrencyAmount,
  compareCurrencyAmounts,
  getCurrencySymbol,
  getCurrencyDisplayName,
  isValidCurrencyCode,
  normalizeCurrencyAmount,
} from '../currencyUtils';

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('should format INR with correct symbol and decimals', () => {
      expect(formatCurrency(1000, 'INR', 2)).toBe('₹1,000.00');
    });

    it('should format USD with correct symbol and decimals', () => {
      expect(formatCurrency(1234.56, 'USD', 2)).toBe('$1,234.56');
    });

    it('should format PHP with correct symbol and decimals', () => {
      expect(formatCurrency(5000, 'PHP', 2)).toBe('₱5,000.00');
    });

    it('should format AUD with correct symbol and decimals', () => {
      expect(formatCurrency(999.99, 'AUD', 2)).toBe('A$999.99');
    });

    it('should handle zero amount', () => {
      expect(formatCurrency(0, 'USD', 2)).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-500, 'USD', 2)).toBe('-$500.00');
    });

    it('should respect decimal places parameter', () => {
      expect(formatCurrency(100.123, 'USD', 3)).toBe('$100.123');
      expect(formatCurrency(100.12, 'USD', 0)).toBe('$100');
    });
  });

  describe('parseCurrency', () => {
    it('should parse formatted currency string', () => {
      expect(parseCurrency('₹1,000.00')).toBe(1000);
      expect(parseCurrency('$1,234.56')).toBe(1234.56);
      expect(parseCurrency('₱5,000.00')).toBe(5000);
    });

    it('should handle strings without currency symbols', () => {
      expect(parseCurrency('1000.50')).toBe(1000.5);
      expect(parseCurrency('1,000')).toBe(1000);
    });

    it('should handle negative values', () => {
      expect(parseCurrency('-$500.00')).toBe(-500);
    });

    it('should return 0 for invalid strings', () => {
      expect(parseCurrency('invalid')).toBe(0);
      expect(parseCurrency('')).toBe(0);
    });
  });

  describe('validateCurrencyAmount', () => {
    it('should validate positive amounts', () => {
      expect(validateCurrencyAmount(100, 2)).toBe(true);
      expect(validateCurrencyAmount(0.01, 2)).toBe(true);
    });

    it('should invalidate negative amounts', () => {
      expect(validateCurrencyAmount(-10, 2)).toBe(false);
    });

    it('should invalidate NaN', () => {
      expect(validateCurrencyAmount(NaN, 2)).toBe(false);
    });

    it('should validate amounts within min/max range', () => {
      expect(validateCurrencyAmount(50, 2, 10, 100)).toBe(true);
      expect(validateCurrencyAmount(5, 2, 10, 100)).toBe(false);
      expect(validateCurrencyAmount(150, 2, 10, 100)).toBe(false);
    });

    it('should validate decimal places', () => {
      expect(validateCurrencyAmount(100.12, 2)).toBe(true);
      expect(validateCurrencyAmount(100.123, 2)).toBe(false);
      expect(validateCurrencyAmount(100, 0)).toBe(true);
      expect(validateCurrencyAmount(100.5, 0)).toBe(false);
    });
  });

  describe('roundCurrency', () => {
    it('should round to specified decimal places', () => {
      expect(roundCurrency(100.123, 2)).toBe(100.12);
      expect(roundCurrency(100.126, 2)).toBe(100.13);
      expect(roundCurrency(100.5, 0)).toBe(101);
    });

    it('should handle negative numbers', () => {
      expect(roundCurrency(-100.126, 2)).toBe(-100.13);
    });
  });

  describe('convertCurrency', () => {
    it('should convert amount using exchange rate', () => {
      expect(convertCurrency(100, 83.5, 2)).toBe(8350);
      expect(convertCurrency(8350, 0.012, 2)).toBe(100.2);
    });

    it('should respect decimal places', () => {
      expect(convertCurrency(100, 1.5678, 2)).toBe(157.78);
      expect(convertCurrency(100, 1.5678, 4)).toBe(156.78);
    });

    it('should handle zero rate', () => {
      expect(convertCurrency(100, 0, 2)).toBe(0);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(1000, 10, 2)).toBe(100);
      expect(calculatePercentage(5000, 12, 2)).toBe(600);
      expect(calculatePercentage(100, 0.75, 2)).toBe(0.75);
    });

    it('should handle zero amount', () => {
      expect(calculatePercentage(0, 10, 2)).toBe(0);
    });

    it('should handle zero percentage', () => {
      expect(calculatePercentage(1000, 0, 2)).toBe(0);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax amount', () => {
      expect(calculateTax(1000, 10, 2)).toBe(100);
      expect(calculateTax(5000, 18, 2)).toBe(900);
    });

    it('should round to specified decimal places', () => {
      expect(calculateTax(1000, 12.5, 2)).toBe(125);
    });
  });

  describe('calculateNetAmount', () => {
    it('should calculate net amount after tax', () => {
      expect(calculateNetAmount(1000, 10, 2)).toBe(900);
      expect(calculateNetAmount(5000, 20, 2)).toBe(4000);
    });

    it('should handle zero tax', () => {
      expect(calculateNetAmount(1000, 0, 2)).toBe(1000);
    });
  });

  describe('sumCurrencyAmounts', () => {
    it('should sum multiple amounts', () => {
      expect(sumCurrencyAmounts([100, 200, 300], 2)).toBe(600);
      expect(sumCurrencyAmounts([10.5, 20.3, 30.7], 2)).toBe(61.5);
    });

    it('should handle empty array', () => {
      expect(sumCurrencyAmounts([], 2)).toBe(0);
    });

    it('should handle single amount', () => {
      expect(sumCurrencyAmounts([100], 2)).toBe(100);
    });

    it('should handle negative amounts', () => {
      expect(sumCurrencyAmounts([100, -50, 25], 2)).toBe(75);
    });
  });

  describe('subtractCurrencyAmounts', () => {
    it('should subtract second amount from first', () => {
      expect(subtractCurrencyAmounts(1000, 300, 2)).toBe(700);
      expect(subtractCurrencyAmounts(100.5, 50.3, 2)).toBe(50.2);
    });

    it('should handle negative results', () => {
      expect(subtractCurrencyAmounts(100, 150, 2)).toBe(-50);
    });
  });

  describe('multiplyCurrencyAmount', () => {
    it('should multiply amount by factor', () => {
      expect(multiplyCurrencyAmount(100, 2, 2)).toBe(200);
      expect(multiplyCurrencyAmount(50.5, 3, 2)).toBe(151.5);
    });

    it('should handle decimal multipliers', () => {
      expect(multiplyCurrencyAmount(100, 0.5, 2)).toBe(50);
      expect(multiplyCurrencyAmount(100, 1.5, 2)).toBe(150);
    });
  });

  describe('divideCurrencyAmount', () => {
    it('should divide amount by divisor', () => {
      expect(divideCurrencyAmount(100, 2, 2)).toBe(50);
      expect(divideCurrencyAmount(150, 3, 2)).toBe(50);
    });

    it('should handle decimal results', () => {
      expect(divideCurrencyAmount(100, 3, 2)).toBe(33.33);
    });

    it('should return 0 for division by zero', () => {
      expect(divideCurrencyAmount(100, 0, 2)).toBe(0);
    });
  });

  describe('compareCurrencyAmounts', () => {
    it('should return 0 for equal amounts', () => {
      expect(compareCurrencyAmounts(100, 100, 2)).toBe(0);
      expect(compareCurrencyAmounts(50.5, 50.5, 2)).toBe(0);
    });

    it('should return 1 when first is greater', () => {
      expect(compareCurrencyAmounts(200, 100, 2)).toBe(1);
    });

    it('should return -1 when first is less', () => {
      expect(compareCurrencyAmounts(100, 200, 2)).toBe(-1);
    });

    it('should handle very close amounts', () => {
      expect(compareCurrencyAmounts(100.001, 100.002, 2)).toBe(0);
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return correct symbols for supported currencies', () => {
      expect(getCurrencySymbol('INR')).toBe('₹');
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('PHP')).toBe('₱');
      expect(getCurrencySymbol('AUD')).toBe('A$');
      expect(getCurrencySymbol('EUR')).toBe('€');
      expect(getCurrencySymbol('GBP')).toBe('£');
    });

    it('should return currency code for unsupported currencies', () => {
      expect(getCurrencySymbol('XYZ')).toBe('XYZ');
    });
  });

  describe('getCurrencyDisplayName', () => {
    it('should return correct names for supported currencies', () => {
      expect(getCurrencyDisplayName('INR')).toBe('Indian Rupee');
      expect(getCurrencyDisplayName('USD')).toBe('US Dollar');
      expect(getCurrencyDisplayName('PHP')).toBe('Philippine Peso');
      expect(getCurrencyDisplayName('AUD')).toBe('Australian Dollar');
      expect(getCurrencyDisplayName('EUR')).toBe('Euro');
    });

    it('should return currency code for unsupported currencies', () => {
      expect(getCurrencyDisplayName('XYZ')).toBe('XYZ');
    });
  });

  describe('isValidCurrencyCode', () => {
    it('should validate supported currency codes', () => {
      expect(isValidCurrencyCode('INR')).toBe(true);
      expect(isValidCurrencyCode('USD')).toBe(true);
      expect(isValidCurrencyCode('PHP')).toBe(true);
      expect(isValidCurrencyCode('AUD')).toBe(true);
      expect(isValidCurrencyCode('EUR')).toBe(true);
      expect(isValidCurrencyCode('GBP')).toBe(true);
    });

    it('should invalidate unsupported codes', () => {
      expect(isValidCurrencyCode('XYZ')).toBe(false);
      expect(isValidCurrencyCode('')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isValidCurrencyCode('usd')).toBe(false);
      expect(isValidCurrencyCode('Usd')).toBe(false);
    });
  });

  describe('normalizeCurrencyAmount', () => {
    it('should normalize string amounts to numbers', () => {
      expect(normalizeCurrencyAmount('100', 2)).toBe(100);
      expect(normalizeCurrencyAmount('100.50', 2)).toBe(100.5);
    });

    it('should handle already-numeric amounts', () => {
      expect(normalizeCurrencyAmount(100, 2)).toBe(100);
      expect(normalizeCurrencyAmount(100.5, 2)).toBe(100.5);
    });

    it('should parse formatted strings', () => {
      expect(normalizeCurrencyAmount('$1,000.00', 2)).toBe(1000);
      expect(normalizeCurrencyAmount('₹5,000.50', 2)).toBe(5000.5);
    });

    it('should round to specified decimal places', () => {
      expect(normalizeCurrencyAmount('100.126', 2)).toBe(100.13);
      expect(normalizeCurrencyAmount(100.126, 2)).toBe(100.13);
    });

    it('should return 0 for invalid input', () => {
      expect(normalizeCurrencyAmount('invalid', 2)).toBe(0);
      expect(normalizeCurrencyAmount(NaN, 2)).toBe(0);
    });
  });
});

