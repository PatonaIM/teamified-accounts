/**
 * Payroll Administration Types
 * Story 7.8 - Advanced Payroll Administration & Monitoring
 */

export enum PayrollPeriodStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

export enum ProcessingStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum MetricType {
  PROCESSING_TIME = 'processing_time',
  CALCULATION_TIME = 'calculation_time',
  TIMESHEET_FETCH = 'timesheet_fetch',
  LEAVE_FETCH = 'leave_fetch',
  PAYSLIP_STORAGE = 'payslip_storage',
  PDF_GENERATION = 'pdf_generation',
  NOTIFICATION_SEND = 'notification_send',
  API_RESPONSE_TIME = 'api_response_time',
  DATABASE_QUERY_TIME = 'database_query_time',
}

export interface PayrollPeriod {
  id: string;
  periodName: string;
  countryId: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: PayrollPeriodStatus;
  totalEmployees: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayrollPeriodDto {
  periodName: string;
  countryId: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status?: 'draft' | 'open' | 'processing' | 'processed' | 'closed';
}

export interface ProcessingLog {
  id: string;
  countryId: string;
  payrollPeriodId: string | null;
  status: ProcessingStatus;
  startedAt: string;
  completedAt: string | null;
  employeesProcessed: number;
  employeesFailed: number;
  errorMessage: string | null;
  errorDetails: any | null;
  processingMetadata: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingStatusResponse {
  periodId: string;
  periodName: string;
  countryCode: string;
  periodStatus: PayrollPeriodStatus;
  logId: string | null;
  processingStatus: ProcessingStatus | null;
  totalEmployees: number;
  processedEmployees: number;
  failedEmployees: number;
  successEmployees: number;
  startedAt: string | null;
  completedAt: string | null;
  processingTimeMs: number | null;
  errors: any[];
  metadata: any;
}

export interface StartProcessingDto {
  periodId: string;
  userIds?: string[];
}

export interface StartProcessingResponse {
  logId: string;
  periodId: string;
  status: string;
  totalEmployees: number;
  message: string;
}

export interface BulkProcessPayrollDto {
  periodIds: string[];
  userIds?: string[];
}

export interface BulkClosePeriodDto {
  periodIds: string[];
  forceClose?: boolean;
}

export interface BulkOpenPeriodDto {
  periodIds: string[];
}

export interface BulkOperationResult {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    periodId: string;
    status: 'success' | 'failed';
    message?: string;
    error?: string;
    logId?: string;
  }>;
}

export interface ValidatePeriodsDto {
  periodIds: string[];
}

export interface PeriodValidationResult {
  periodId: string;
  periodName: string;
  countryCode: string;
  isValid: boolean;
  canProcess: boolean;
  validationErrors: string[];
  validationWarnings: string[];
  estimatedEmployeeCount: number;
}

export interface PerformanceMetric {
  id: string;
  metricType: MetricType;
  metricName: string;
  metricValue: number;
  metricUnit: string;
  payrollPeriodId: string | null;
  processingLogId: string | null;
  userId: string | null;
  countryId: string | null;
  additionalData: any | null;
  recordedAt: string;
  createdAt: string;
}

export interface AggregatedMetrics {
  metricType: MetricType;
  count: number;
  average: number;
  min: number;
  max: number;
  median: number;
  p95: number;
  p99: number;
  metricUnit: string;
}

export interface PerformanceSummary {
  periodId: string;
  periodName: string;
  countryCode: string;
  totalProcessingTimeMs: number;
  averageCalculationTimeMs: number;
  timesheetFetchTimeMs: number;
  leaveFetchTimeMs: number;
  payslipStorageTimeMs: number;
  pdfGenerationTimeMs: number;
  notificationTimeMs: number;
  totalEmployeesProcessed: number;
  averageTimePerEmployeeMs: number;
  recordedAt: string;
}

export interface SystemPerformanceDashboard {
  activeProcessingRuns: number;
  avgProcessingTime24h: number;
  avgProcessingTime7d: number;
  avgProcessingTime30d: number;
  employeesProcessedToday: number;
  employeesProcessedWeek: number;
  employeesProcessedMonth: number;
  successRate24h: number;
  successRate7d: number;
  successRate30d: number;
  apiResponseTimeP95: number;
  dbQueryTimeP95: number;
  metricsByType: AggregatedMetrics[];
}

export interface MetricsQueryParams {
  metricType?: MetricType;
  periodId?: string;
  logId?: string;
  countryId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// ==================== Story 7.8.1: Employee Selection ====================
// Updated in Story 7.8.2: Removed phantom fields (department, location)

export interface EmployeeListItem {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  role: string;  // Employment role (from EmploymentRecord)
  status: 'active' | 'inactive';
  // ❌ Removed: department (didn't exist in database)
  // ❌ Removed: location (didn't exist in database)
  // ❌ Removed: currentSalary (not needed for selection)
}

export interface EmployeeSelectionState {
  selectedEmployeeIds: string[];
  isCustomSelection: boolean;
}

