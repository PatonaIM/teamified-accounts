/**
 * Payroll Service
 * API service for multi-region payroll configuration
 */

import api from '../api';
import type {
  Country,
  Currency,
  TaxYear,
  RegionConfiguration,
  ExchangeRate,
  PayrollPeriod,
  PayrollProcessingLog,
  CurrencyConversionRequest,
  CurrencyConversionResponse,
  CreateCountryDto,
  CreateCurrencyDto,
  CreateTaxYearDto,
  CreateRegionConfigurationDto,
  CreateExchangeRateDto,
  CreatePayrollPeriodDto,
  PayrollPeriodStatus,
  ProcessingStatus,
  SalaryComponent,
  CreateSalaryComponentDto,
  UpdateSalaryComponentDto,
  SalaryComponentResponse,
  StatutoryComponent,
  CreateStatutoryComponentDto,
  UpdateStatutoryComponentDto,
  StatutoryComponentResponse,
  SalaryComponentType,
  StatutoryComponentType,
} from '../../types/payroll/payroll.types';

// ==================== Country APIs ====================

export const getCountries = async (includeInactive = false): Promise<Country[]> => {
  const response = await api.get<Country[]>('/v1/payroll/configuration/countries', {
    params: { includeInactive },
  });
  return response.data;
};

export const getCountry = async (countryCode: string): Promise<Country> => {
  const response = await api.get<Country>(`/v1/payroll/configuration/countries/${countryCode}`);
  return response.data;
};

export const createCountry = async (data: CreateCountryDto): Promise<Country> => {
  const response = await api.post<Country>('/v1/payroll/configuration/countries', data);
  return response.data;
};

export const updateCountry = async (countryCode: string, data: Partial<CreateCountryDto>): Promise<Country> => {
  const response = await api.put<Country>(`/configuration/countries/${countryCode}`, data);
  return response.data;
};

export const deleteCountry = async (countryCode: string): Promise<void> => {
  await api.delete(`/configuration/countries/${countryCode}`);
};

// ==================== Currency APIs ====================

export const getCurrencies = async (includeInactive = false): Promise<Currency[]> => {
  const response = await api.get<Currency[]>('/v1/payroll/configuration/currencies', {
    params: { includeInactive },
  });
  return response.data;
};

export const getCurrency = async (currencyCode: string): Promise<Currency> => {
  const response = await api.get<Currency>(`/configuration/currencies/${currencyCode}`);
  return response.data;
};

export const createCurrency = async (data: CreateCurrencyDto): Promise<Currency> => {
  const response = await api.post<Currency>('/v1/payroll/configuration/currencies', data);
  return response.data;
};

export const updateCurrency = async (currencyCode: string, data: Partial<CreateCurrencyDto>): Promise<Currency> => {
  const response = await api.put<Currency>(`/configuration/currencies/${currencyCode}`, data);
  return response.data;
};

export const deleteCurrency = async (currencyCode: string): Promise<void> => {
  await api.delete(`/configuration/currencies/${currencyCode}`);
};

export const convertCurrency = async (data: CurrencyConversionRequest): Promise<CurrencyConversionResponse> => {
  const response = await api.post<CurrencyConversionResponse>('/v1/payroll/configuration/currencies/convert', data);
  return response.data;
};

// ==================== Tax Year APIs ====================

export const getTaxYears = async (countryCode: string): Promise<TaxYear[]> => {
  const response = await api.get<TaxYear[]>(`/configuration/countries/${countryCode}/tax-years`);
  return response.data;
};

export const getCurrentTaxYear = async (countryCode: string): Promise<TaxYear> => {
  const response = await api.get<TaxYear>(`/configuration/countries/${countryCode}/tax-years/current`);
  return response.data;
};

export const createTaxYear = async (countryCode: string, data: CreateTaxYearDto): Promise<TaxYear> => {
  const response = await api.post<TaxYear>(`/configuration/countries/${countryCode}/tax-years`, data);
  return response.data;
};

export const updateTaxYear = async (countryCode: string, id: string, data: Partial<CreateTaxYearDto>): Promise<TaxYear> => {
  const response = await api.put<TaxYear>(`/configuration/countries/${countryCode}/tax-years/${id}`, data);
  return response.data;
};

export const deleteTaxYear = async (countryCode: string, id: string): Promise<void> => {
  await api.delete(`/configuration/countries/${countryCode}/tax-years/${id}`);
};

// ==================== Region Configuration APIs ====================

export const getRegionConfigurations = async (countryCode: string, includeInactive = false): Promise<RegionConfiguration[]> => {
  const response = await api.get<RegionConfiguration[]>(`/configuration/countries/${countryCode}/configurations`, {
    params: { includeInactive },
  });
  return response.data;
};

export const getRegionConfigurationByKey = async (countryCode: string, configKey: string): Promise<RegionConfiguration> => {
  const response = await api.get<RegionConfiguration>(`/configuration/countries/${countryCode}/configurations/key/${configKey}`);
  return response.data;
};

export const createRegionConfiguration = async (countryCode: string, data: CreateRegionConfigurationDto): Promise<RegionConfiguration> => {
  const response = await api.post<RegionConfiguration>(`/configuration/countries/${countryCode}/configurations`, data);
  return response.data;
};

export const updateRegionConfiguration = async (countryCode: string, id: string, data: Partial<CreateRegionConfigurationDto>): Promise<RegionConfiguration> => {
  const response = await api.put<RegionConfiguration>(`/configuration/countries/${countryCode}/configurations/${id}`, data);
  return response.data;
};

export const deleteRegionConfiguration = async (countryCode: string, id: string): Promise<void> => {
  await api.delete(`/configuration/countries/${countryCode}/configurations/${id}`);
};

// ==================== Exchange Rate APIs ====================

export const getExchangeRatePair = async (fromCurrencyId: string, toCurrencyId: string, includeInactive = false): Promise<ExchangeRate[]> => {
  const response = await api.get<ExchangeRate[]>(`/configuration/exchange-rates/pair/${fromCurrencyId}/${toCurrencyId}`, {
    params: { includeInactive },
  });
  return response.data;
};

export const getCurrentExchangeRate = async (fromCurrencyId: string, toCurrencyId: string, date?: string): Promise<ExchangeRate> => {
  const response = await api.get<ExchangeRate>(`/configuration/exchange-rates/current/${fromCurrencyId}/${toCurrencyId}`, {
    params: { date },
  });
  return response.data;
};

export const createExchangeRate = async (data: CreateExchangeRateDto): Promise<ExchangeRate> => {
  const response = await api.post<ExchangeRate>('/v1/payroll/configuration/exchange-rates', data);
  return response.data;
};

export const updateExchangeRate = async (id: string, data: Partial<CreateExchangeRateDto>): Promise<ExchangeRate> => {
  const response = await api.put<ExchangeRate>(`/configuration/exchange-rates/${id}`, data);
  return response.data;
};

export const deleteExchangeRate = async (id: string): Promise<void> => {
  await api.delete(`/configuration/exchange-rates/${id}`);
};

// ==================== Payroll Period APIs ====================

export const getPayrollPeriods = async (countryCode: string, status?: PayrollPeriodStatus): Promise<PayrollPeriod[]> => {
  const response = await api.get<PayrollPeriod[]>(`/configuration/countries/${countryCode}/periods`, {
    params: { status },
  });
  return response.data;
};

export const getCurrentPayrollPeriod = async (countryCode: string): Promise<PayrollPeriod | null> => {
  const response = await api.get<PayrollPeriod | null>(`/configuration/countries/${countryCode}/periods/current`);
  return response.data;
};

export const createPayrollPeriod = async (countryCode: string, data: CreatePayrollPeriodDto): Promise<PayrollPeriod> => {
  const response = await api.post<PayrollPeriod>(`/configuration/countries/${countryCode}/periods`, data);
  return response.data;
};

export const updatePayrollPeriod = async (countryCode: string, id: string, data: Partial<CreatePayrollPeriodDto>): Promise<PayrollPeriod> => {
  const response = await api.put<PayrollPeriod>(`/configuration/countries/${countryCode}/periods/${id}`, data);
  return response.data;
};

export const closePayrollPeriod = async (countryCode: string, id: string): Promise<PayrollPeriod> => {
  const response = await api.post<PayrollPeriod>(`/configuration/countries/${countryCode}/periods/${id}/close`);
  return response.data;
};

export const deletePayrollPeriod = async (countryCode: string, id: string): Promise<void> => {
  await api.delete(`/configuration/countries/${countryCode}/periods/${id}`);
};

// ==================== Processing Log APIs ====================

export const getProcessingLogsByCountry = async (countryId: string, status?: ProcessingStatus): Promise<PayrollProcessingLog[]> => {
  const response = await api.get<PayrollProcessingLog[]>(`/processing-logs/country/${countryId}`, {
    params: { status },
  });
  return response.data;
};

export const getProcessingStatsByCountry = async (countryId: string): Promise<{
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
}> => {
  const response = await api.get(`/processing-logs/country/${countryId}/stats`);
  return response.data;
};

// ==================== Salary Component APIs ====================

export const getSalaryComponents = async (
  countryId: string,
  page = 1,
  limit = 10,
  componentType?: SalaryComponentType,
  isActive?: boolean
): Promise<SalaryComponentResponse> => {
  const response = await api.get<SalaryComponentResponse>(`/configuration/countries/${countryId}/salary-components`, {
    params: { page, limit, componentType, isActive },
  });
  return response.data;
};

export const getSalaryComponent = async (countryId: string, id: string): Promise<SalaryComponent> => {
  const response = await api.get<SalaryComponent>(`/configuration/countries/${countryId}/salary-components/${id}`);
  return response.data;
};

export const getSalaryComponentsByType = async (countryId: string, componentType: SalaryComponentType): Promise<SalaryComponent[]> => {
  const response = await api.get<SalaryComponent[]>(`/configuration/countries/${countryId}/salary-components/by-type/${componentType}`);
  return response.data;
};

export const createSalaryComponent = async (countryId: string, data: CreateSalaryComponentDto): Promise<SalaryComponent> => {
  const response = await api.post<SalaryComponent>(`/configuration/countries/${countryId}/salary-components`, data);
  return response.data;
};

export const updateSalaryComponent = async (countryId: string, id: string, data: UpdateSalaryComponentDto): Promise<SalaryComponent> => {
  const response = await api.put<SalaryComponent>(`/configuration/countries/${countryId}/salary-components/${id}`, data);
  return response.data;
};

export const deleteSalaryComponent = async (countryId: string, id: string): Promise<void> => {
  await api.delete(`/configuration/countries/${countryId}/salary-components/${id}`);
};

// ==================== Statutory Component APIs ====================

export const getStatutoryComponents = async (
  countryId: string,
  page = 1,
  limit = 10,
  componentType?: StatutoryComponentType,
  isActive?: boolean
): Promise<StatutoryComponentResponse> => {
  const response = await api.get<StatutoryComponentResponse>(`/configuration/countries/${countryId}/statutory-components`, {
    params: { page, limit, componentType, isActive },
  });
  return response.data;
};

export const getStatutoryComponent = async (countryId: string, id: string): Promise<StatutoryComponent> => {
  const response = await api.get<StatutoryComponent>(`/configuration/countries/${countryId}/statutory-components/${id}`);
  return response.data;
};

export const getStatutoryComponentsByType = async (countryId: string, componentType: StatutoryComponentType): Promise<StatutoryComponent[]> => {
  const response = await api.get<StatutoryComponent[]>(`/configuration/countries/${countryId}/statutory-components/by-type/${componentType}`);
  return response.data;
};

export const getActiveStatutoryComponentsByDate = async (countryId: string, date: string): Promise<StatutoryComponent[]> => {
  const response = await api.get<StatutoryComponent[]>(`/configuration/countries/${countryId}/statutory-components/active-by-date`, {
    params: { date },
  });
  return response.data;
};

export const createStatutoryComponent = async (countryId: string, data: CreateStatutoryComponentDto): Promise<StatutoryComponent> => {
  const response = await api.post<StatutoryComponent>(`/configuration/countries/${countryId}/statutory-components`, data);
  return response.data;
};

export const updateStatutoryComponent = async (countryId: string, id: string, data: UpdateStatutoryComponentDto): Promise<StatutoryComponent> => {
  const response = await api.put<StatutoryComponent>(`/configuration/countries/${countryId}/statutory-components/${id}`, data);
  return response.data;
};

export const deleteStatutoryComponent = async (countryId: string, id: string): Promise<void> => {
  await api.delete(`/configuration/countries/${countryId}/statutory-components/${id}`);
};

export default {
  // Country
  getCountries,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry,
  // Currency
  getCurrencies,
  getCurrency,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  convertCurrency,
  // Tax Year
  getTaxYears,
  getCurrentTaxYear,
  createTaxYear,
  updateTaxYear,
  deleteTaxYear,
  // Region Configuration
  getRegionConfigurations,
  getRegionConfigurationByKey,
  createRegionConfiguration,
  updateRegionConfiguration,
  deleteRegionConfiguration,
  // Exchange Rate
  getExchangeRatePair,
  getCurrentExchangeRate,
  createExchangeRate,
  updateExchangeRate,
  deleteExchangeRate,
  // Payroll Period
  getPayrollPeriods,
  getCurrentPayrollPeriod,
  createPayrollPeriod,
  updatePayrollPeriod,
  closePayrollPeriod,
  deletePayrollPeriod,
  // Processing Log
  getProcessingLogsByCountry,
  getProcessingStatsByCountry,
  // Salary Components
  getSalaryComponents,
  getSalaryComponent,
  getSalaryComponentsByType,
  createSalaryComponent,
  updateSalaryComponent,
  deleteSalaryComponent,
  // Statutory Components
  getStatutoryComponents,
  getStatutoryComponent,
  getStatutoryComponentsByType,
  getActiveStatutoryComponentsByDate,
  createStatutoryComponent,
  updateStatutoryComponent,
  deleteStatutoryComponent,
};

