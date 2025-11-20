/**
 * Payroll Administration Service
 * API integration for Story 7.8 - Advanced Payroll Administration & Monitoring
 */

import api from '../api';
import type {
  PayrollPeriod,
  CreatePayrollPeriodDto,
  ProcessingStatusResponse,
  StartProcessingDto,
  StartProcessingResponse,
  BulkProcessPayrollDto,
  BulkClosePeriodDto,
  BulkOpenPeriodDto,
  BulkOperationResult,
  ValidatePeriodsDto,
  PeriodValidationResult,
  PerformanceMetric,
  PerformanceSummary,
  SystemPerformanceDashboard,
  MetricsQueryParams,
  EmployeeListItem,
} from '../../types/payroll-admin/payrollAdmin.types';

const BASE_URL = '/v1/payroll/admin';

// ==================== Processing Control ====================

/**
 * Start payroll processing for a period
 */
export const startProcessing = async (
  data: StartProcessingDto
): Promise<StartProcessingResponse> => {
  const response = await api.post(`${BASE_URL}/process/start`, data);
  return response.data;
};

/**
 * Stop active payroll processing
 */
export const stopProcessing = async (logId: string): Promise<{ message: string }> => {
  const response = await api.post(`${BASE_URL}/process/stop`, { logId });
  return response.data;
};

/**
 * Retry failed employee calculations
 */
export const retryFailedEmployees = async (
  logId: string,
  userIds?: string[]
): Promise<StartProcessingResponse> => {
  const response = await api.post(`${BASE_URL}/process/retry`, { logId, userIds });
  return response.data;
};

/**
 * Get processing status for a period
 */
export const getProcessingStatus = async (
  periodId: string
): Promise<ProcessingStatusResponse> => {
  const response = await api.get(`${BASE_URL}/status/${periodId}`);
  return response.data;
};

// ==================== Period Management ====================

/**
 * List payroll periods for a country
 */
export const listPeriods = async (countryId: string): Promise<PayrollPeriod[]> => {
  const response = await api.get(`${BASE_URL}/periods/${countryId}`);
  return response.data;
};

/**
 * Create a new payroll period
 */
export const createPeriod = async (data: CreatePayrollPeriodDto): Promise<PayrollPeriod> => {
  const response = await api.post(`${BASE_URL}/periods`, data);
  return response.data;
};

/**
 * Update an existing payroll period
 */
export const updatePeriod = async (
  id: string,
  data: Partial<CreatePayrollPeriodDto>
): Promise<PayrollPeriod> => {
  const response = await api.put(`${BASE_URL}/periods/${id}`, data);
  return response.data;
};

/**
 * Delete a payroll period (only allowed for draft/open status)
 */
export const deletePeriod = async (countryCode: string, periodId: string): Promise<{ message: string }> => {
  const response = await api.delete(`${BASE_URL}/countries/${countryCode}/periods/${periodId}`);
  return response.data;
};

// ==================== Employee Selection (Story 7.8.1, Updated in 7.8.2) ====================

/**
 * Get list of employees for a country (for employee selection)
 * Updated in Story 7.8.2: Now uses existing employment records API
 */
export const getEmployeesByCountry = async (countryCode: string): Promise<EmployeeListItem[]> => {
  // Use existing employment records API with country filter
  const response = await api.get('/v1/employment-records', {
    params: { 
      status: 'active',
      countryId: countryCode,  // Now filters by countryId (Story 7.8.2)
      limit: 100  // Backend max limit is 100
    }
  });
  
  // Transform employment records to employee list items
  const employmentRecords = response.data.employmentRecords || [];
  
  // Map to EmployeeListItem format
  const employees: EmployeeListItem[] = employmentRecords.map((record: any, index: number) => {
    // Generate employee ID from email or use last 8 chars of UUID for uniqueness
    let employeeId = record.user?.employeeId;
    if (!employeeId) {
      if (record.user?.email) {
        // Extract number from email (e.g., "user1@teamified.com" -> "EMP-001")
        const emailMatch = record.user.email.match(/user(\d+)@/);
        employeeId = emailMatch ? `EMP-${emailMatch[1].padStart(3, '0')}` : record.userId.slice(-8);
      } else {
        // Fallback: use last 8 characters of UUID (unique part)
        employeeId = record.userId.slice(-8);
      }
    }
    
    return {
      id: record.userId,
      firstName: record.user?.firstName || '',
      lastName: record.user?.lastName || '',
      employeeId,
      email: record.user?.email || '',
      role: record.role || 'Not Specified',
      status: record.status === 'active' ? 'active' : 'inactive',
    };
  });
  
  // Remove duplicates based on userId (in case of multiple employment records)
  const uniqueEmployees = Array.from(
    new Map(employees.map(emp => [emp.id, emp])).values()
  );
  
  return uniqueEmployees;
};

// ==================== Bulk Operations ====================

/**
 * Bulk process payroll for multiple periods
 */
export const bulkProcessPeriods = async (
  data: BulkProcessPayrollDto
): Promise<BulkOperationResult> => {
  const response = await api.post(`${BASE_URL}/bulk/process`, data);
  return response.data;
};

/**
 * Bulk close multiple payroll periods
 */
export const bulkClosePeriods = async (
  data: BulkClosePeriodDto
): Promise<BulkOperationResult> => {
  const response = await api.post(`${BASE_URL}/bulk/close`, data);
  return response.data;
};

/**
 * Bulk open multiple payroll periods
 */
export const bulkOpenPeriods = async (
  data: BulkOpenPeriodDto
): Promise<BulkOperationResult> => {
  const response = await api.post(`${BASE_URL}/bulk/open`, data);
  return response.data;
};

/**
 * Validate periods before processing
 */
export const bulkValidatePeriods = async (
  data: ValidatePeriodsDto
): Promise<PeriodValidationResult[]> => {
  const response = await api.post(`${BASE_URL}/validate`, data);
  return response.data;
};

// ==================== Monitoring & Metrics ====================

/**
 * Get system-wide performance dashboard
 */
export const getMonitoringDashboard = async (): Promise<SystemPerformanceDashboard> => {
  const response = await api.get(`${BASE_URL}/monitoring/dashboard`);
  return response.data;
};

/**
 * Query performance metrics with filters
 */
export const getMetrics = async (params: MetricsQueryParams): Promise<PerformanceMetric[]> => {
  const response = await api.get(`${BASE_URL}/monitoring/metrics`, { params });
  return response.data;
};

/**
 * Get performance summary for a specific period
 */
export const getPerformanceSummary = async (periodId: string): Promise<PerformanceSummary> => {
  const response = await api.get(`${BASE_URL}/monitoring/period/${periodId}`);
  return response.data;
};

// ==================== Helper Functions ====================

/**
 * Format milliseconds to human-readable duration
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (processed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((processed / total) * 100);
};

/**
 * Get status color for Material-UI Chip
 */
export const getStatusColor = (
  status: string
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'default';
    case 'open':
      return 'info';
    case 'processing':
    case 'in_progress':
    case 'started':
      return 'warning';
    case 'completed':
      return 'success';
    case 'closed':
    case 'cancelled':
      return 'default';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

export default {
  startProcessing,
  stopProcessing,
  retryFailedEmployees,
  getProcessingStatus,
  listPeriods,
  createPeriod,
  updatePeriod,
  getEmployeesByCountry,
  bulkProcessPeriods,
  bulkClosePeriods,
  bulkOpenPeriods,
  bulkValidatePeriods,
  getMonitoringDashboard,
  getMetrics,
  getPerformanceSummary,
  formatDuration,
  calculateProgress,
  getStatusColor,
};

