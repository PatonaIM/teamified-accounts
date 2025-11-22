/**
 * Leave Management API Service
 * Handles all API interactions for leave requests, approvals, and balances
 * Following Story 7.4 timesheet service patterns
 */

import axios from 'axios';
import type {
  LeaveRequest,
  LeaveBalance,
  LeaveBalanceSummary,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  LeaveRequestQueryDto,
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
  BulkApproveDto,
  BulkApproveResponse,
  LeaveImpact,
} from '../../types/leave/leave.types';

const API_BASE_URL = '/api/v1/leave';

// Get configured axios instance with auth headers
const getAxiosConfig = () => {
  const token = localStorage.getItem('teamified_access_token');
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
};

/**
 * Leave Request Operations
 */

// 1. Create leave request (DRAFT status)
export async function createLeaveRequest(data: CreateLeaveRequestDto): Promise<LeaveRequest> {
  const response = await axios.post<LeaveRequest>(
    `${API_BASE_URL}/requests`,
    data,
    getAxiosConfig()
  );
  return response.data;
}

// 2. Get all leave requests with filtering
export async function getLeaveRequests(query?: LeaveRequestQueryDto): Promise<LeaveRequest[]> {
  const params = new URLSearchParams();
  if (query?.status) params.append('status', query.status);
  if (query?.userId) params.append('userId', query.userId);
  if (query?.countryCode) params.append('countryCode', query.countryCode);
  if (query?.leaveType) params.append('leaveType', query.leaveType);
  if (query?.startDate) params.append('startDate', query.startDate);
  if (query?.endDate) params.append('endDate', query.endDate);

  const response = await axios.get<LeaveRequest[]>(
    `${API_BASE_URL}/requests?${params.toString()}`,
    getAxiosConfig()
  );
  return response.data;
}

// 3. Get single leave request by ID
export async function getLeaveRequest(id: string): Promise<LeaveRequest> {
  const response = await axios.get<LeaveRequest>(
    `${API_BASE_URL}/requests/${id}`,
    getAxiosConfig()
  );
  return response.data;
}

// 4. Update leave request (DRAFT only)
export async function updateLeaveRequest(
  id: string,
  data: UpdateLeaveRequestDto
): Promise<LeaveRequest> {
  const response = await axios.put<LeaveRequest>(
    `${API_BASE_URL}/requests/${id}`,
    data,
    getAxiosConfig()
  );
  return response.data;
}

// 5. Delete leave request (DRAFT only)
export async function deleteLeaveRequest(id: string): Promise<void> {
  await axios.delete(
    `${API_BASE_URL}/requests/${id}`,
    getAxiosConfig()
  );
}

// 6. Submit leave request for approval (DRAFT → SUBMITTED)
export async function submitLeaveRequest(id: string): Promise<LeaveRequest> {
  const response = await axios.post<LeaveRequest>(
    `${API_BASE_URL}/requests/${id}/submit`,
    {},
    getAxiosConfig()
  );
  return response.data;
}

// 7. Cancel/withdraw leave request (DRAFT/SUBMITTED → CANCELLED)
export async function cancelLeaveRequest(id: string): Promise<LeaveRequest> {
  const response = await axios.post<LeaveRequest>(
    `${API_BASE_URL}/requests/${id}/cancel`,
    {},
    getAxiosConfig()
  );
  return response.data;
}

/**
 * Leave Approval Operations
 */

// 8. Approve leave request
export async function approveLeaveRequest(
  id: string,
  data?: ApproveLeaveRequestDto
): Promise<LeaveRequest> {
  const response = await axios.post<LeaveRequest>(
    `${API_BASE_URL}/requests/${id}/approve`,
    data || {},
    getAxiosConfig()
  );
  return response.data;
}

// 9. Reject leave request (comments required)
export async function rejectLeaveRequest(
  id: string,
  data: RejectLeaveRequestDto
): Promise<LeaveRequest> {
  const response = await axios.post<LeaveRequest>(
    `${API_BASE_URL}/requests/${id}/reject`,
    data,
    getAxiosConfig()
  );
  return response.data;
}

// 10. Bulk approve leave requests
export async function bulkApproveLeaveRequests(
  data: BulkApproveDto
): Promise<BulkApproveResponse> {
  const response = await axios.post<BulkApproveResponse>(
    `${API_BASE_URL}/requests/bulk-approve`,
    data,
    getAxiosConfig()
  );
  return response.data;
}

/**
 * Leave Balance Operations
 */

// 11. Get leave balances for current user or specific user
export async function getLeaveBalances(
  userId?: string,
  countryCode?: string
): Promise<LeaveBalance[]> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (countryCode) params.append('countryCode', countryCode);

  const response = await axios.get<LeaveBalance[]>(
    `${API_BASE_URL}/balances?${params.toString()}`,
    getAxiosConfig()
  );
  return response.data;
}

// 12. Get payroll-ready leave requests (Admin/HR only)
export async function getPayrollReadyLeaves(
  payrollPeriodId: string,
  countryCode?: string
): Promise<LeaveRequest[]> {
  const params = new URLSearchParams();
  params.append('payrollPeriodId', payrollPeriodId);
  if (countryCode) params.append('countryCode', countryCode);

  const response = await axios.get<LeaveRequest[]>(
    `${API_BASE_URL}/payroll-ready?${params.toString()}`,
    getAxiosConfig()
  );
  return response.data;
}

/**
 * Additional helper functions
 */

// Get leave balance summary with caching
export async function getLeaveBalanceSummary(
  userId: string,
  countryCode: string,
  year: number
): Promise<LeaveBalanceSummary> {
  const response = await axios.get<LeaveBalanceSummary>(
    `${API_BASE_URL}/balances/summary?userId=${userId}&countryCode=${countryCode}&year=${year}`,
    getAxiosConfig()
  );
  return response.data;
}

// Calculate leave impact on payroll
export async function getLeaveImpact(
  leaveRequestId: string
): Promise<LeaveImpact> {
  const response = await axios.get<LeaveImpact>(
    `${API_BASE_URL}/payroll-impact?leaveRequestId=${leaveRequestId}`,
    getAxiosConfig()
  );
  return response.data;
}

/**
 * Validation helpers
 */

// Calculate total days between dates (including both start and end)
export function calculateLeaveDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
}

// Validate date range
export function validateDateRange(startDate: string, endDate: string): string | null {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end < start) {
    return 'End date must be after start date';
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (start < today) {
    return 'Start date cannot be in the past';
  }
  
  return null;
}

// Check if sufficient balance is available
export function checkSufficientBalance(
  requestedDays: number,
  availableDays: number
): boolean {
  return requestedDays <= availableDays;
}

/**
 * Error handling wrapper
 */
export async function handleLeaveApiError<T>(
  apiCall: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    console.error(errorMessage, error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Leave request not found.');
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid request data.');
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Export all functions as a single object for easier importing
 */
const leaveService = {
  // CRUD operations
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  
  // State transitions
  submitLeaveRequest,
  cancelLeaveRequest,
  
  // Approval operations
  approveLeaveRequest,
  rejectLeaveRequest,
  bulkApproveLeaveRequests,
  
  // Balance operations
  getLeaveBalances,
  getLeaveBalanceSummary,
  getPayrollReadyLeaves,
  getLeaveImpact,
  
  // Helpers
  calculateLeaveDays,
  validateDateRange,
  checkSufficientBalance,
  handleLeaveApiError,
};

export default leaveService;

