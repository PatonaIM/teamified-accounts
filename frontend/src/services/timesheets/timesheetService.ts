/**
 * Timesheet API Service
 * Handles all timesheet-related API calls
 */

import api from '../api';
import type {
  Timesheet,
  CreateTimesheetDto,
  UpdateTimesheetDto,
  SubmitTimesheetDto,
  ApproveTimesheetDto,
  RejectTimesheetDto,
  BulkApproveTimesheetsDto,
  TimesheetResponse,
  TimesheetsListResponse,
  TimesheetApprovalResponse,
  BulkApprovalResponse,
  TimesheetQueryParams,
} from '../../types/timesheets/timesheet.types';

// API Configuration
const TIMESHEETS_ENDPOINT = '/v1/timesheets';

// Helper function to build query string
const buildQueryString = (params: TimesheetQueryParams): string => {
  const searchParams = new URLSearchParams();
  
  if (params.page !== undefined) searchParams.append('page', params.page.toString());
  if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
  if (params.status) searchParams.append('status', params.status);
  if (params.timesheetType) searchParams.append('timesheetType', params.timesheetType);
  if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) searchParams.append('dateTo', params.dateTo);
  if (params.userId) searchParams.append('userId', params.userId);
  
  return searchParams.toString();
};

/**
 * Get list of timesheets with filtering
 */
export const getTimesheets = async (
  params: TimesheetQueryParams = {}
): Promise<TimesheetsListResponse> => {
  const queryString = buildQueryString(params);
  const url = queryString ? `${TIMESHEETS_ENDPOINT}?${queryString}` : TIMESHEETS_ENDPOINT;
  
  const response = await api.get<TimesheetsListResponse>(url);
  return response.data;
};

/**
 * Get a single timesheet by ID
 */
export const getTimesheetById = async (id: string): Promise<TimesheetResponse> => {
  const response = await api.get<TimesheetResponse>(`${TIMESHEETS_ENDPOINT}/${id}`);
  return response.data;
};

/**
 * Create a new timesheet
 */
export const createTimesheet = async (
  data: CreateTimesheetDto
): Promise<TimesheetResponse> => {
  const response = await api.post<TimesheetResponse>(TIMESHEETS_ENDPOINT, data);
  return response.data;
};

/**
 * Update an existing timesheet (only for DRAFT status)
 */
export const updateTimesheet = async (
  id: string,
  data: UpdateTimesheetDto
): Promise<TimesheetResponse> => {
  const response = await api.put<TimesheetResponse>(`${TIMESHEETS_ENDPOINT}/${id}`, data);
  return response.data;
};

/**
 * Delete a timesheet (only DRAFT can be deleted)
 */
export const deleteTimesheet = async (id: string): Promise<void> => {
  await api.delete(`${TIMESHEETS_ENDPOINT}/${id}`);
};

/**
 * Submit timesheets for approval
 */
export const submitTimesheets = async (
  data: SubmitTimesheetDto
): Promise<{ message: string; submitted: number }> => {
  const response = await api.post(`${TIMESHEETS_ENDPOINT}/submit`, data);
  return response.data;
};

/**
 * Approve a timesheet
 */
export const approveTimesheet = async (
  id: string,
  data: ApproveTimesheetDto
): Promise<TimesheetApprovalResponse> => {
  const response = await api.post<TimesheetApprovalResponse>(
    `${TIMESHEETS_ENDPOINT}/${id}/approve`,
    data
  );
  return response.data;
};

/**
 * Reject a timesheet
 */
export const rejectTimesheet = async (
  id: string,
  data: RejectTimesheetDto
): Promise<TimesheetApprovalResponse> => {
  const response = await api.post<TimesheetApprovalResponse>(
    `${TIMESHEETS_ENDPOINT}/${id}/reject`,
    data
  );
  return response.data;
};

/**
 * Bulk approve timesheets
 */
export const bulkApproveTimesheets = async (
  data: BulkApproveTimesheetsDto
): Promise<BulkApprovalResponse> => {
  const response = await api.post<BulkApprovalResponse>(
    `${TIMESHEETS_ENDPOINT}/bulk-approve`,
    data
  );
  return response.data;
};

/**
 * Get payroll-ready timesheets (approved and not yet processed)
 */
export const getPayrollReadyTimesheets = async (): Promise<TimesheetsListResponse> => {
  const response = await api.get<TimesheetsListResponse>(`${TIMESHEETS_ENDPOINT}/payroll-ready`);
  return response.data;
};

/**
 * Helper: Calculate total hours
 */
export const calculateTotalHours = (
  regularHours: number,
  overtimeHours: number,
  doubleOvertimeHours: number,
  nightShiftHours: number
): number => {
  return regularHours + overtimeHours + doubleOvertimeHours + nightShiftHours;
};

/**
 * Helper: Validate hours (don't exceed 24 total)
 */
export const validateHours = (
  regularHours: number,
  overtimeHours: number,
  doubleOvertimeHours: number,
  nightShiftHours: number
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (regularHours < 0) errors.push('Regular hours cannot be negative');
  if (overtimeHours < 0) errors.push('Overtime hours cannot be negative');
  if (doubleOvertimeHours < 0) errors.push('Double overtime hours cannot be negative');
  if (nightShiftHours < 0) errors.push('Night shift hours cannot be negative');
  
  if (regularHours > 24) errors.push('Regular hours cannot exceed 24');
  if (overtimeHours > 24) errors.push('Overtime hours cannot exceed 24');
  if (doubleOvertimeHours > 24) errors.push('Double overtime hours cannot exceed 24');
  if (nightShiftHours > 24) errors.push('Night shift hours cannot exceed 24');
  
  const total = calculateTotalHours(regularHours, overtimeHours, doubleOvertimeHours, nightShiftHours);
  if (total > 24) errors.push('Total hours cannot exceed 24 hours per day');
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Helper: Get country-specific limits
 */
export const getCountryLimits = (countryCode: string): {
  maxRegularHours: number;
  maxOvertimeHours: number;
  maxDailyHours: number;
  warningMessage: string;
} => {
  switch (countryCode.toUpperCase()) {
    case 'IN':
      return {
        maxRegularHours: 9,
        maxOvertimeHours: 3,
        maxDailyHours: 12,
        warningMessage: 'India: Regular hours should not exceed 9 hours per day',
      };
    case 'PH':
      return {
        maxRegularHours: 8,
        maxOvertimeHours: 8,
        maxDailyHours: 16,
        warningMessage: 'Philippines: Regular hours should not exceed 8 hours per day',
      };
    case 'AU':
      return {
        maxRegularHours: 7.6,
        maxOvertimeHours: 4,
        maxDailyHours: 12,
        warningMessage: 'Australia: Regular hours should not exceed 7.6 hours per day',
      };
    default:
      return {
        maxRegularHours: 8,
        maxOvertimeHours: 4,
        maxDailyHours: 12,
        warningMessage: 'Regular hours should not exceed 8 hours per day',
      };
  }
};

