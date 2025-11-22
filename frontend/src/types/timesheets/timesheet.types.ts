/**
 * Timesheet TypeScript Types
 * Matches backend DTOs and entities
 */

// Enums
export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TimesheetType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export enum TimesheetApprovalAction {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Daily Hours structure for weekly timesheet breakdown
export interface DailyHours {
  regularHours: number;
  overtimeHours: number;
  doubleOvertimeHours: number;
  nightShiftHours: number;
}

export interface WeeklyHoursBreakdown {
  monday?: DailyHours;
  tuesday?: DailyHours;
  wednesday?: DailyHours;
  thursday?: DailyHours;
  friday?: DailyHours;
  saturday?: DailyHours;
  sunday?: DailyHours;
}

// Interfaces
export interface Timesheet {
  id: string;
  userId: string;
  employmentRecordId: string;
  payrollPeriodId: string;
  timesheetType: TimesheetType;
  workDate: string;
  weekStartDate?: string | null;
  weekEndDate?: string | null;
  weeklyHoursBreakdown?: WeeklyHoursBreakdown | null;
  regularHours: number;
  overtimeHours: number;
  doubleOvertimeHours: number;
  nightShiftHours: number;
  totalHours: number;
  status: TimesheetStatus;
  notes: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  rejectedAt: string | null;
  rejectedById: string | null;
  rejectionReason: string | null;
  payrollProcessed: boolean;
  payrollProcessedAt: string | null;
  calculationMetadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  // Optional populated fields
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  rejectedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface TimesheetApproval {
  id: string;
  timesheetId: string;
  reviewerId: string;
  action: TimesheetApprovalAction;
  actionDate: string;
  comments: string | null;
  previousStatus: TimesheetStatus;
  newStatus: TimesheetStatus;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  // Optional populated fields
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// DTOs
export interface CreateTimesheetDto {
  userId: string; // UUID
  employmentRecordId: string; // UUID
  payrollPeriodId?: string; // UUID (optional)
  timesheetType: TimesheetType;
  workDate: string; // ISO date string (YYYY-MM-DD)
  weekStartDate?: string; // For weekly timesheets
  weekEndDate?: string; // For weekly timesheets
  weeklyHoursBreakdown?: WeeklyHoursBreakdown; // For weekly timesheets
  regularHours: number;
  overtimeHours: number;
  doubleOvertimeHours: number;
  nightShiftHours: number;
  notes?: string;
  status?: TimesheetStatus; // DRAFT or SUBMITTED
}

export interface UpdateTimesheetDto {
  workDate?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  timesheetType?: TimesheetType;
  weeklyHoursBreakdown?: WeeklyHoursBreakdown;
  regularHours?: number;
  overtimeHours?: number;
  doubleOvertimeHours?: number;
  nightShiftHours?: number;
  notes?: string;
}

export interface SubmitTimesheetDto {
  timesheetIds: string[];
}

export interface ApproveTimesheetDto {
  comments?: string;
}

export interface RejectTimesheetDto {
  reason: string;
  comments?: string;
}

export interface BulkApproveTimesheetsDto {
  timesheetIds: string[];
  comments?: string;
}

// Response types
export interface TimesheetResponse {
  timesheet: Timesheet;
}

export interface TimesheetsListResponse {
  timesheets: Timesheet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimesheetApprovalResponse {
  approval: TimesheetApproval;
}

export interface BulkApprovalResult {
  timesheetId: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface BulkApprovalResponse {
  approved: number;
  failed: number;
  results: BulkApprovalResult[];
}

// Query parameters
export interface TimesheetQueryParams {
  page?: number;
  limit?: number;
  status?: TimesheetStatus;
  timesheetType?: TimesheetType;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

// Calculation result from backend (for display)
export interface TimesheetCalculationResult {
  regularPay: number;
  overtimePay: number;
  doubleOvertimePay: number;
  nightShiftPay: number;
  totalPay: number;
  breakdown: {
    regularRate: number;
    overtimeRate: number;
    doubleOvertimeRate: number;
    nightShiftRate: number;
  };
  countryRules: {
    overtimeMultiplier: number;
    doubleOvertimeMultiplier: number;
    nightShiftPremium: number;
  };
}

