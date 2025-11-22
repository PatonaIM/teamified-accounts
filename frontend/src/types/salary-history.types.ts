/**
 * Salary History Types
 * TypeScript interfaces for salary history management
 */

export interface SalaryHistory {
  id: string;
  employmentRecordId: string;
  salaryAmount: number;
  salaryCurrency: string;
  effectiveDate: Date;
  changeReason: string;
  changedBy: string | null;
  changedByName: string | null;
  employeeName: string | null;
  employeeRole: string | null;
  employmentStatus: string | null;
  isScheduled: boolean;
  migratedFromZoho: boolean;
  zohoSalaryId: string | null;
  createdAt: Date;
}

export interface CreateSalaryHistoryRequest {
  employmentRecordId: string;
  salaryAmount: number;
  salaryCurrency: string;
  effectiveDate: string; // ISO date string
  changeReason: string;
}

export interface SalaryHistorySearchParams {
  employmentRecordId?: string;
  userId?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  isScheduled?: boolean;
  sortField?: 'effectiveDate' | 'salaryAmount' | 'createdAt' | 'changeReason';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface SalaryStatistics {
  averageSalary: number;
  totalActiveRecords: number;
  totalSalaries: number;
}

export interface SalaryReport {
  employmentId: string | null;
  userId: string;
  clientId: string | null;
  currentSalary: SalaryHistory | null;
  salaryHistory: SalaryHistory[];
  statistics: SalaryStatistics;
  generatedAt: Date;
}

export interface SalaryHistoryFormData {
  employmentRecordId: string;
  salaryAmount: string; // String for form input
  salaryCurrency: string;
  effectiveDate: string; // ISO date string
  changeReason: string;
}

export interface SalaryHistoryFormErrors {
  employmentRecordId?: string;
  salaryAmount?: string;
  salaryCurrency?: string;
  effectiveDate?: string;
  changeReason?: string;
  general?: string;
}

export interface SalaryTimelineItem {
  id: string;
  salaryAmount: number;
  salaryCurrency: string;
  effectiveDate: Date;
  changeReason: string;
  changedByName: string | null;
  isScheduled: boolean;
  isCurrent: boolean;
  isIncrease: boolean;
  isDecrease: boolean;
  changeAmount?: number;
  changePercentage?: number;
}

export interface SalaryDashboardStats {
  currentSalary: number | null;
  currentCurrency: string;
  nextScheduledChange: SalaryHistory | null;
  totalScheduledChanges: number;
  averageIncrease: number;
  lastIncreaseDate: Date | null;
  totalEmployments: number;
}

export interface SalaryChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface SalaryExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  includeScheduled?: boolean;
  groupByEmployment?: boolean;
}

export interface SalaryHistoryFilters {
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  currency: string | null;
  amountRange: {
    min: number | null;
    max: number | null;
  };
  showScheduled: boolean;
  showHistorical: boolean;
  employmentId: string | null;
}

export interface EmploymentRecord {
  id: string;
  userId: string;
  clientId: string;
  startDate: Date;
  endDate: Date | null;
  role: string;
  status: 'onboarding' | 'active' | 'inactive' | 'offboarding' | 'terminated' | 'completed';
  client?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface SalaryHistoryState {
  salaryHistory: SalaryHistory[];
  currentReport: SalaryReport | null;
  dashboardStats: SalaryDashboardStats | null;
  scheduledChanges: SalaryHistory[];
  isLoading: boolean;
  isCreating: boolean;
  isSearching: boolean;
  error: string | null;
  filters: SalaryHistoryFilters;
  searchResults: SalaryHistory[];
  selectedEmployment: EmploymentRecord | null;
}

export interface SalaryHistoryActions {
  loadSalaryHistory: (employmentId: string) => Promise<void>;
  loadUserSalaryHistory: (userId: string) => Promise<void>;
  createSalaryHistory: (data: CreateSalaryHistoryRequest) => Promise<SalaryHistory>;
  searchSalaryHistory: (params: SalaryHistorySearchParams) => Promise<void>;
  loadSalaryReport: (employmentId: string) => Promise<void>;
  loadUserSalaryReport: (userId: string) => Promise<void>;
  loadScheduledChanges: () => Promise<void>;
  loadDashboardStats: (userId: string) => Promise<void>;
  setFilters: (filters: Partial<SalaryHistoryFilters>) => void;
  clearError: () => void;
  selectEmployment: (employment: EmploymentRecord | null) => void;
}

// Currency options for form dropdowns
export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
  { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
  { value: 'CHF', label: 'CHF - Swiss Franc', symbol: 'CHF' },
  { value: 'CNY', label: 'CNY - Chinese Yuan', symbol: '¥' },
  { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
  { value: 'BRL', label: 'BRL - Brazilian Real', symbol: 'R$' },
] as const;

// Common change reasons for form dropdowns
export const CHANGE_REASON_OPTIONS = [
  'Annual performance review',
  'Promotion',
  'Market adjustment',
  'Cost of living increase',
  'Merit increase',
  'Bonus adjustment',
  'Role change',
  'Contract renewal',
  'Starting salary',
  'Other',
] as const;

// Sort field options
export const SORT_FIELD_OPTIONS = [
  { value: 'effectiveDate', label: 'Effective Date' },
  { value: 'salaryAmount', label: 'Salary Amount' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'changeReason', label: 'Change Reason' },
] as const;

// Sort order options
export const SORT_ORDER_OPTIONS = [
  { value: 'DESC', label: 'Descending' },
  { value: 'ASC', label: 'Ascending' },
] as const;
