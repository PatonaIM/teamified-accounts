import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrencyConversion } from '../useCurrencyConversion';
import * as payrollService from '../../services/payroll/payrollService';

// Mock the payroll service
vi.mock('../../services/payroll/payrollService', () => ({
  getCurrentExchangeRate: vi.fn(),
}));

describe('useCurrencyConversion', () => {
  const mockExchangeRate = {
    id: 'test-id',
    fromCurrencyId: 'inr-id',
    toCurrencyId: 'usd-id',
    fromCurrency: { id: 'inr-id', code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, isActive: true },
    toCurrency: { id: 'usd-id', code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isActive: true },
    rate: 0.012,
    effectiveDate: '2024-10-01',
    isActive: true,
    createdAt: '2024-10-01',
    updatedAt: '2024-10-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    // Reset time
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-10-01T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.rate).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch exchange rate on mount', async () => {
    vi.mocked(payrollService.getCurrentExchangeRate).mockResolvedValue(mockExchangeRate);

    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rate).toBe(0.012);
    expect(result.current.effectiveDate).toBe('2024-10-01');
    expect(result.current.error).toBeNull();
    expect(payrollService.getCurrentExchangeRate).toHaveBeenCalledWith('INR', 'USD');
  });

  it('should convert amount correctly', async () => {
    vi.mocked(payrollService.getCurrentExchangeRate).mockResolvedValue(mockExchangeRate);

    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const converted = result.current.convert(1000);
    expect(converted).toBe(12); // 1000 * 0.012 = 12
  });

  it('should return 0 when converting without rate', () => {
    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));
    
    const converted = result.current.convert(1000);
    expect(converted).toBe(0);
  });

  it('should handle API errors', async () => {
    const error = new Error('Network error');
    vi.mocked(payrollService.getCurrentExchangeRate).mockRejectedValue(error);

    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rate).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should cache exchange rate in localStorage', async () => {
    vi.mocked(payrollService.getCurrentExchangeRate).mockResolvedValue(mockExchangeRate);

    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const cached = localStorage.getItem('exchangeRate_INR_USD');
    expect(cached).toBeTruthy();
    
    const parsedCache = JSON.parse(cached!);
    expect(parsedCache.rate).toBe(0.012);
    expect(parsedCache.timestamp).toBe(Date.now());
  });

  it('should use cached rate if fresh (< 5 minutes)', async () => {
    const cacheData = {
      rate: 0.012,
      effectiveDate: '2024-10-01',
      timestamp: Date.now(),
    };
    localStorage.setItem('exchangeRate_INR_USD', JSON.stringify(cacheData));

    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rate).toBe(0.012);
    expect(payrollService.getCurrentExchangeRate).not.toHaveBeenCalled();
  });

  it('should fetch new rate if cache is stale (> 5 minutes)', async () => {
    const staleTimestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago
    const cacheData = {
      rate: 0.011,
      effectiveDate: '2024-09-30',
      timestamp: staleTimestamp,
    };
    localStorage.setItem('exchangeRate_INR_USD', JSON.stringify(cacheData));

    vi.mocked(payrollService.getCurrentExchangeRate).mockResolvedValue(mockExchangeRate);

    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rate).toBe(0.012); // New rate
    expect(payrollService.getCurrentExchangeRate).toHaveBeenCalled();
  });

  it('should refetch when currency codes change', async () => {
    vi.mocked(payrollService.getCurrentExchangeRate).mockResolvedValue(mockExchangeRate);

    const { result, rerender } = renderHook(
      ({ from, to }) => useCurrencyConversion(from, to),
      { initialProps: { from: 'INR', to: 'USD' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(payrollService.getCurrentExchangeRate).toHaveBeenCalledTimes(1);

    // Change currency codes
    const mockPhpRate = { ...mockExchangeRate, rate: 0.018 };
    vi.mocked(payrollService.getCurrentExchangeRate).mockResolvedValue(mockPhpRate);

    rerender({ from: 'PHP', to: 'USD' });

    await waitFor(() => {
      expect(result.current.rate).toBe(0.018);
    });

    expect(payrollService.getCurrentExchangeRate).toHaveBeenCalledTimes(2);
    expect(payrollService.getCurrentExchangeRate).toHaveBeenLastCalledWith('PHP', 'USD');
  });

  it('should not fetch when fromCurrency equals toCurrency', async () => {
    const { result } = renderHook(() => useCurrencyConversion('USD', 'USD'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rate).toBe(1);
    expect(payrollService.getCurrentExchangeRate).not.toHaveBeenCalled();
  });

  it('should convert to 2 decimal places by default', async () => {
    vi.mocked(payrollService.getCurrentExchangeRate).mockResolvedValue(mockExchangeRate);

    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const converted = result.current.convert(1000.555);
    expect(converted).toBe(12.01); // Rounded to 2 decimals
  });

  it('should handle zero amount conversion', async () => {
    vi.mocked(payrollService.getCurrentExchangeRate).mockResolvedValue(mockExchangeRate);

    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const converted = result.current.convert(0);
    expect(converted).toBe(0);
  });

  it('should handle negative amount conversion', async () => {
    vi.mocked(payrollService.getCurrentExchangeRate).mockResolvedValue(mockExchangeRate);

    const { result } = renderHook(() => useCurrencyConversion('INR', 'USD'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const converted = result.current.convert(-1000);
    expect(converted).toBe(-12);
  });
});

