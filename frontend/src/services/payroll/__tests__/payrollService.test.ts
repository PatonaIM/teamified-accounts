import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getAllCountries,
  getCountryByCode,
  createCountry,
  updateCountry,
  getAllCurrencies,
  getCurrencyByCode,
  convertCurrency,
  getCurrentExchangeRate,
  getTaxYearsByCountry,
  getCurrentTaxYear,
  getRegionConfigurationsByCountry,
  getRegionConfigurationByKey,
  getAllPayrollPeriodsByCountry,
  getCurrentPayrollPeriod,
} from '../payrollService';

// Mock axios
vi.mock('axios');

const mockAxios = vi.mocked(axios, true);

describe('Payroll Service', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', mockToken);
    
    // Mock axios.create to return a mocked instance
    mockAxios.create = vi.fn(() => mockAxios as any);
  });

  describe('Country Operations', () => {
    it('should fetch all countries', async () => {
      const mockCountries = [
        { id: '1', code: 'IN', name: 'India', currencyId: 'inr-id', taxYearStartMonth: 4, isActive: true },
        { id: '2', code: 'PH', name: 'Philippines', currencyId: 'php-id', taxYearStartMonth: 1, isActive: true },
      ];

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockCountries });

      const result = await getAllCountries();

      expect(result).toEqual(mockCountries);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/countries');
    });

    it('should fetch country by code', async () => {
      const mockCountry = { id: '1', code: 'IN', name: 'India', currencyId: 'inr-id', taxYearStartMonth: 4, isActive: true };

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockCountry });

      const result = await getCountryByCode('IN');

      expect(result).toEqual(mockCountry);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/countries/IN');
    });

    it('should create a new country', async () => {
      const newCountry = { code: 'AU', name: 'Australia', currencyId: 'aud-id', taxYearStartMonth: 7 };
      const mockResponse = { ...newCountry, id: '3', isActive: true };

      mockAxios.post = vi.fn().mockResolvedValue({ data: mockResponse });

      const result = await createCountry(newCountry);

      expect(result).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/v1/payroll/configuration/countries', newCountry);
    });

    it('should update a country', async () => {
      const updates = { name: 'India (Updated)' };
      const mockResponse = { id: '1', code: 'IN', name: 'India (Updated)', currencyId: 'inr-id', taxYearStartMonth: 4, isActive: true };

      mockAxios.patch = vi.fn().mockResolvedValue({ data: mockResponse });

      const result = await updateCountry('1', updates);

      expect(result).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/v1/payroll/configuration/countries/1', updates);
    });
  });

  describe('Currency Operations', () => {
    it('should fetch all currencies', async () => {
      const mockCurrencies = [
        { id: '1', code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, isActive: true },
        { id: '2', code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isActive: true },
      ];

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockCurrencies });

      const result = await getAllCurrencies();

      expect(result).toEqual(mockCurrencies);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/currencies');
    });

    it('should fetch currency by code', async () => {
      const mockCurrency = { id: '1', code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, isActive: true };

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockCurrency });

      const result = await getCurrencyByCode('INR');

      expect(result).toEqual(mockCurrency);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/currencies/INR');
    });

    it('should convert currency', async () => {
      const mockConversion = { amount: 1000, fromCurrency: 'INR', toCurrency: 'USD', convertedAmount: 12, rate: 0.012 };

      mockAxios.post = vi.fn().mockResolvedValue({ data: mockConversion });

      const result = await convertCurrency(1000, 'INR', 'USD');

      expect(result).toEqual(mockConversion);
      expect(mockAxios.post).toHaveBeenCalledWith('/v1/payroll/configuration/currencies/convert', {
        amount: 1000,
        fromCurrency: 'INR',
        toCurrency: 'USD',
      });
    });
  });

  describe('Exchange Rate Operations', () => {
    it('should fetch current exchange rate', async () => {
      const mockRate = {
        id: '1',
        fromCurrencyId: 'inr-id',
        toCurrencyId: 'usd-id',
        rate: 0.012,
        effectiveDate: '2024-10-01',
        isActive: true,
      };

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockRate });

      const result = await getCurrentExchangeRate('INR', 'USD');

      expect(result).toEqual(mockRate);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/exchange-rates/INR/USD/current');
    });
  });

  describe('Tax Year Operations', () => {
    it('should fetch tax years by country', async () => {
      const mockTaxYears = [
        { id: '1', countryId: 'in-id', year: 2024, startDate: '2024-04-01', endDate: '2025-03-31', isCurrent: true },
      ];

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockTaxYears });

      const result = await getTaxYearsByCountry('IN');

      expect(result).toEqual(mockTaxYears);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/countries/IN/tax-years');
    });

    it('should fetch current tax year', async () => {
      const mockTaxYear = { id: '1', countryId: 'in-id', year: 2024, startDate: '2024-04-01', endDate: '2025-03-31', isCurrent: true };

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockTaxYear });

      const result = await getCurrentTaxYear('IN');

      expect(result).toEqual(mockTaxYear);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/countries/IN/tax-years/current');
    });
  });

  describe('Region Configuration Operations', () => {
    it('should fetch region configurations by country', async () => {
      const mockConfigs = [
        { id: '1', countryId: 'in-id', configKey: 'pf_rate', configValue: { employer: 12, employee: 12 }, description: 'PF rates', isActive: true },
      ];

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockConfigs });

      const result = await getRegionConfigurationsByCountry('IN');

      expect(result).toEqual(mockConfigs);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/countries/IN/configurations');
    });

    it('should fetch region configuration by key', async () => {
      const mockConfig = { id: '1', countryId: 'in-id', configKey: 'pf_rate', configValue: { employer: 12, employee: 12 }, description: 'PF rates', isActive: true };

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockConfig });

      const result = await getRegionConfigurationByKey('IN', 'pf_rate');

      expect(result).toEqual(mockConfig);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/countries/IN/configurations/pf_rate');
    });
  });

  describe('Payroll Period Operations', () => {
    it('should fetch payroll periods by country', async () => {
      const mockPeriods = [
        { id: '1', countryId: 'in-id', periodName: 'October 2024', startDate: '2024-10-01', endDate: '2024-10-31', payDate: '2024-11-05', status: 'open' },
      ];

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockPeriods });

      const result = await getAllPayrollPeriodsByCountry('IN');

      expect(result).toEqual(mockPeriods);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/countries/IN/periods');
    });

    it('should fetch current payroll period', async () => {
      const mockPeriod = { id: '1', countryId: 'in-id', periodName: 'October 2024', startDate: '2024-10-01', endDate: '2024-10-31', payDate: '2024-11-05', status: 'open' };

      mockAxios.get = vi.fn().mockResolvedValue({ data: mockPeriod });

      const result = await getCurrentPayrollPeriod('IN');

      expect(result).toEqual(mockPeriod);
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/payroll/configuration/countries/IN/periods/current');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when API call fails', async () => {
      mockAxios.get = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(getAllCountries()).rejects.toThrow('Network error');
    });

    it('should throw error with API error message', async () => {
      mockAxios.get = vi.fn().mockRejectedValue({
        response: { data: { message: 'Country not found' } },
      });

      await expect(getCountryByCode('XX')).rejects.toThrow();
    });
  });

  describe('Authentication', () => {
    it('should include auth token in requests', async () => {
      mockAxios.get = vi.fn().mockResolvedValue({ data: [] });

      await getAllCountries();

      // Verify that the axios instance was created with the auth token
      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should work without token for public endpoints', async () => {
      localStorage.removeItem('token');
      mockAxios.get = vi.fn().mockResolvedValue({ data: [] });

      await getAllCountries();

      expect(mockAxios.get).toHaveBeenCalled();
    });
  });
});

