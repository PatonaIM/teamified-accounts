/**
 * Leave Management Type Definitions
 * Based on backend implementation with 5 statuses and 17 country-specific leave types
 */

// Leave Request Status (5 states including CANCELLED)
export enum LeaveRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// Country-Specific Leave Types (17 types across 3 countries)
export enum LeaveType {
  // India (6 types)
  ANNUAL_LEAVE_IN = 'ANNUAL_LEAVE_IN',
  SICK_LEAVE_IN = 'SICK_LEAVE_IN',
  CASUAL_LEAVE_IN = 'CASUAL_LEAVE_IN',
  MATERNITY_LEAVE_IN = 'MATERNITY_LEAVE_IN',
  PATERNITY_LEAVE_IN = 'PATERNITY_LEAVE_IN',
  COMPENSATORY_OFF_IN = 'COMPENSATORY_OFF_IN',
  
  // Philippines (6 types)
  VACATION_LEAVE_PH = 'VACATION_LEAVE_PH',
  SICK_LEAVE_PH = 'SICK_LEAVE_PH',
  MATERNITY_LEAVE_PH = 'MATERNITY_LEAVE_PH',
  PATERNITY_LEAVE_PH = 'PATERNITY_LEAVE_PH',
  SOLO_PARENT_LEAVE_PH = 'SOLO_PARENT_LEAVE_PH',
  SPECIAL_LEAVE_WOMEN_PH = 'SPECIAL_LEAVE_WOMEN_PH',
  
  // Australia (5 types)
  ANNUAL_LEAVE_AU = 'ANNUAL_LEAVE_AU',
  SICK_CARERS_LEAVE_AU = 'SICK_CARERS_LEAVE_AU',
  LONG_SERVICE_LEAVE_AU = 'LONG_SERVICE_LEAVE_AU',
  PARENTAL_LEAVE_AU = 'PARENTAL_LEAVE_AU',
  COMPASSIONATE_LEAVE_AU = 'COMPASSIONATE_LEAVE_AU',
}

// Leave Request Interface
export interface LeaveRequest {
  id: string;
  userId: string;
  countryCode: string;
  leaveType: LeaveType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalDays: number;
  status: LeaveRequestStatus;
  notes?: string;
  payrollPeriodId?: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  country?: {
    code: string;
    name: string;
    currencyCode: string;
  };
  approvals?: LeaveApproval[];
}

// Leave Approval Interface
export interface LeaveApproval {
  id: string;
  leaveRequestId: string;
  approverId: string;
  status: LeaveRequestStatus;
  comments?: string;
  approvedAt: string;
  createdAt: string;
  // Populated fields
  approver?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Leave Balance Interface
export interface LeaveBalance {
  id: string;
  userId: string;
  countryCode: string;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  availableDays: number;
  accrualRate: number; // Days per month
  year: number;
  createdAt: string;
  updatedAt: string;
}

// DTOs for API requests
export interface CreateLeaveRequestDto {
  countryCode: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  notes?: string;
  isPaid: boolean;
}

export interface UpdateLeaveRequestDto {
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  notes?: string;
  isPaid?: boolean;
}

export interface LeaveRequestQueryDto {
  status?: LeaveRequestStatus;
  userId?: string;
  countryCode?: string;
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
}

export interface ApproveLeaveRequestDto {
  comments?: string;
}

export interface RejectLeaveRequestDto {
  comments: string; // Required for rejection
}

export interface BulkApproveDto {
  leaveRequestIds: string[];
  comments?: string;
}

export interface BulkApproveResponse {
  approved: string[];
  failed: Array<{
    id: string;
    reason: string;
  }>;
}

// Leave Balance Summary
export interface LeaveBalanceSummary {
  total: number;
  used: number;
  available: number;
  byType: Array<{
    leaveType: string;
    total: number;
    used: number;
    available: number;
  }>;
}

// Leave Impact for Payroll
export interface LeaveImpact {
  paidAmount: number;
  deductionAmount: number;
}

// UI Helper Types
export interface LeaveTypeInfo {
  value: LeaveType;
  label: string;
  description: string;
  defaultDays: number;
  isPaid: boolean;
  accrualRate: number;
}

export interface LeaveRequestWithBalance extends LeaveRequest {
  availableBalance?: number;
  willExceedBalance?: boolean;
}

// Filter state for UI
export interface LeaveFilterState {
  status?: LeaveRequestStatus;
  leaveType?: LeaveType;
  startDate?: Date | null;
  endDate?: Date | null;
  searchTerm?: string;
}

// Sort options
export type LeaveSortField = 'startDate' | 'endDate' | 'createdAt' | 'status' | 'leaveType';
export type LeaveSortDirection = 'asc' | 'desc';

export interface LeaveSortState {
  field: LeaveSortField;
  direction: LeaveSortDirection;
}

