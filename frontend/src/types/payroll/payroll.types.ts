/**
 * Payroll Types
 * Type definitions for multi-region payroll system
 */

export interface Country {
  id: string;
  code: string;
  name: string;
  currencyId: string;
  currency?: Currency;
  taxYearStartMonth: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxYear {
  id: string;
  countryId: string;
  country?: Country;
  year: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegionConfiguration {
  id: string;
  countryId: string;
  country?: Country;
  configKey: string;
  configValue: Record<string, any>;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrencyId: string;
  toCurrencyId: string;
  fromCurrency?: Currency;
  toCurrency?: Currency;
  rate: number;
  effectiveDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum PayrollPeriodStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

export interface PayrollPeriod {
  id: string;
  countryId: string;
  country?: Country;
  periodName: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: PayrollPeriodStatus;
  totalEmployees?: number;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export enum ProcessingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface PayrollProcessingLog {
  id: string;
  countryId: string;
  payrollPeriodId?: string;
  country?: Country;
  payrollPeriod?: PayrollPeriod;
  status: ProcessingStatus;
  startedAt: string;
  completedAt?: string;
  employeesProcessed?: number;
  employeesFailed?: number;
  errorMessage?: string;
  errorDetails?: Record<string, any>;
  processingMetadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyConversionRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

export interface CurrencyConversionResponse {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  effectiveDate: string;
}

// Form DTOs
export interface CreateCountryDto {
  code: string;
  name: string;
  currencyId: string;
  taxYearStartMonth: number;
}

export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

export interface CreateTaxYearDto {
  countryId: string;
  year: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface CreateRegionConfigurationDto {
  countryId: string;
  configKey: string;
  configValue: Record<string, any>;
  description?: string;
}

export interface CreateExchangeRateDto {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  effectiveDate: string;
}

export interface CreatePayrollPeriodDto {
  countryId: string;
  periodName: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: PayrollPeriodStatus;
}

// ==================== Salary Component Types ====================

export enum SalaryComponentType {
  EARNINGS = 'earnings',
  DEDUCTIONS = 'deductions',
  BENEFITS = 'benefits',
  REIMBURSEMENTS = 'reimbursements',
}

export enum CalculationType {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE_OF_BASIC = 'percentage_of_basic',
  PERCENTAGE_OF_GROSS = 'percentage_of_gross',
  PERCENTAGE_OF_NET = 'percentage_of_net',
  FORMULA = 'formula',
}

export interface SalaryComponent {
  id: string;
  countryId: string;
  country?: Country;
  componentName: string;
  componentCode: string;
  componentType: SalaryComponentType;
  calculationType: CalculationType;
  calculationValue?: number;
  calculationFormula?: string;
  isTaxable: boolean;
  isStatutory: boolean;
  isMandatory: boolean;
  displayOrder: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalaryComponentDto {
  countryId: string;
  componentName: string;
  componentCode: string;
  componentType: SalaryComponentType;
  calculationType: CalculationType;
  calculationValue?: number;
  calculationFormula?: string;
  isTaxable: boolean;
  isStatutory: boolean;
  isMandatory: boolean;
  displayOrder: number;
  description?: string;
  isActive: boolean;
}

export interface UpdateSalaryComponentDto extends Partial<CreateSalaryComponentDto> {
  id: string;
}

export interface SalaryComponentResponse {
  components: SalaryComponent[];
  total: number;
  page: number;
  limit: number;
}

// ==================== Statutory Component Types ====================

export enum StatutoryComponentType {
  EPF = 'epf',
  ESI = 'esi',
  PT = 'pt',
  TDS = 'tds',
  SSS = 'sss',
  PHILHEALTH = 'philhealth',
  PAGIBIG = 'pagibig',
  SUPERANNUATION = 'superannuation',
  EPF_MY = 'epf_my',
  SOCSO = 'socso',
  EIS = 'eis',
  CPF = 'cpf',
}

export enum ContributionType {
  EMPLOYEE = 'employee',
  EMPLOYER = 'employer',
  BOTH = 'both',
}

export enum CalculationBasis {
  GROSS_SALARY = 'gross_salary',
  BASIC_SALARY = 'basic_salary',
  CAPPED_AMOUNT = 'capped_amount',
  FIXED_AMOUNT = 'fixed_amount',
}

export interface StatutoryComponent {
  id: string;
  countryId: string;
  country?: Country;
  componentName: string;
  componentCode: string;
  componentType: StatutoryComponentType;
  contributionType: ContributionType;
  calculationBasis: CalculationBasis;
  employeePercentage?: number;
  employerPercentage?: number;
  minimumAmount?: number;
  maximumAmount?: number;
  wageCeiling?: number;
  wageFloor?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isMandatory: boolean;
  displayOrder: number;
  description?: string;
  regulatoryReference?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStatutoryComponentDto {
  countryId: string;
  componentName: string;
  componentCode: string;
  componentType: StatutoryComponentType;
  contributionType: ContributionType;
  calculationBasis: CalculationBasis;
  employeePercentage?: number;
  employerPercentage?: number;
  minimumAmount?: number;
  maximumAmount?: number;
  wageCeiling?: number;
  wageFloor?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isMandatory: boolean;
  displayOrder: number;
  description?: string;
  regulatoryReference?: string;
  isActive: boolean;
}

export interface UpdateStatutoryComponentDto extends Partial<CreateStatutoryComponentDto> {
  id: string;
}

export interface StatutoryComponentResponse {
  components: StatutoryComponent[];
  total: number;
  page: number;
  limit: number;
}

// ==================== Form State Interfaces ====================

export interface TaxYearFormData {
  year: number;
  startDate: string;
  endDate: string;
}

export interface ExchangeRateFormData {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  effectiveDate: string;
}

export interface RegionConfigFormData {
  configKey: string;
  configName: string;
  configValue: string;
  valueType: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  isActive: boolean;
}

