/**
 * Country-Specific Leave Type Configuration
 * Maps countries to their applicable leave types with labels and defaults
 */

import { LeaveType } from '../types/leave/leave.types';
import type { LeaveTypeInfo } from '../types/leave/leave.types';

// Leave type information with labels and defaults
export const LEAVE_TYPE_INFO: Record<LeaveType, LeaveTypeInfo> = {
  // India
  [LeaveType.ANNUAL_LEAVE_IN]: {
    value: LeaveType.ANNUAL_LEAVE_IN,
    label: 'Annual Leave (Earned Leave)',
    description: 'Paid time off for vacation and personal time',
    defaultDays: 21,
    isPaid: true,
    accrualRate: 1.75, // 21 days / 12 months
  },
  [LeaveType.SICK_LEAVE_IN]: {
    value: LeaveType.SICK_LEAVE_IN,
    label: 'Sick Leave',
    description: 'Paid leave for illness or medical appointments',
    defaultDays: 12,
    isPaid: true,
    accrualRate: 1.0, // 12 days / 12 months
  },
  [LeaveType.CASUAL_LEAVE_IN]: {
    value: LeaveType.CASUAL_LEAVE_IN,
    label: 'Casual Leave',
    description: 'Short-term leave for personal matters',
    defaultDays: 12,
    isPaid: true,
    accrualRate: 1.0, // 12 days / 12 months
  },
  [LeaveType.MATERNITY_LEAVE_IN]: {
    value: LeaveType.MATERNITY_LEAVE_IN,
    label: 'Maternity Leave',
    description: '26 weeks paid maternity leave',
    defaultDays: 182, // 26 weeks
    isPaid: true,
    accrualRate: 0,
  },
  [LeaveType.PATERNITY_LEAVE_IN]: {
    value: LeaveType.PATERNITY_LEAVE_IN,
    label: 'Paternity Leave',
    description: '2 weeks paid paternity leave',
    defaultDays: 14,
    isPaid: true,
    accrualRate: 0,
  },
  [LeaveType.COMPENSATORY_OFF_IN]: {
    value: LeaveType.COMPENSATORY_OFF_IN,
    label: 'Compensatory Off',
    description: 'Time off in lieu of overtime work',
    defaultDays: 0, // Earned as needed
    isPaid: true,
    accrualRate: 0,
  },
  
  // Philippines
  [LeaveType.VACATION_LEAVE_PH]: {
    value: LeaveType.VACATION_LEAVE_PH,
    label: 'Vacation Leave (Service Incentive Leave)',
    description: '5 days paid vacation leave per year',
    defaultDays: 5,
    isPaid: true,
    accrualRate: 0.42, // 5 days / 12 months
  },
  [LeaveType.SICK_LEAVE_PH]: {
    value: LeaveType.SICK_LEAVE_PH,
    label: 'Sick Leave',
    description: 'Paid leave for illness',
    defaultDays: 5,
    isPaid: true,
    accrualRate: 0.42, // 5 days / 12 months
  },
  [LeaveType.MATERNITY_LEAVE_PH]: {
    value: LeaveType.MATERNITY_LEAVE_PH,
    label: 'Maternity Leave',
    description: '105 days paid maternity leave',
    defaultDays: 105,
    isPaid: true,
    accrualRate: 0,
  },
  [LeaveType.PATERNITY_LEAVE_PH]: {
    value: LeaveType.PATERNITY_LEAVE_PH,
    label: 'Paternity Leave',
    description: '7 days paid paternity leave',
    defaultDays: 7,
    isPaid: true,
    accrualRate: 0,
  },
  [LeaveType.SOLO_PARENT_LEAVE_PH]: {
    value: LeaveType.SOLO_PARENT_LEAVE_PH,
    label: 'Solo Parent Leave',
    description: '7 days parental leave for solo parents',
    defaultDays: 7,
    isPaid: true,
    accrualRate: 0,
  },
  [LeaveType.SPECIAL_LEAVE_WOMEN_PH]: {
    value: LeaveType.SPECIAL_LEAVE_WOMEN_PH,
    label: 'Special Leave for Women',
    description: '2 months leave for gynecological conditions',
    defaultDays: 2,
    isPaid: true,
    accrualRate: 0,
  },
  
  // Australia
  [LeaveType.ANNUAL_LEAVE_AU]: {
    value: LeaveType.ANNUAL_LEAVE_AU,
    label: 'Annual Leave',
    description: '4 weeks paid annual leave per year',
    defaultDays: 20,
    isPaid: true,
    accrualRate: 1.67, // 20 days / 12 months
  },
  [LeaveType.SICK_CARERS_LEAVE_AU]: {
    value: LeaveType.SICK_CARERS_LEAVE_AU,
    label: "Sick/Carer's Leave",
    description: '10 days paid sick and carers leave',
    defaultDays: 10,
    isPaid: true,
    accrualRate: 0.83, // 10 days / 12 months
  },
  [LeaveType.LONG_SERVICE_LEAVE_AU]: {
    value: LeaveType.LONG_SERVICE_LEAVE_AU,
    label: 'Long Service Leave',
    description: 'Extended leave after years of service (state-specific)',
    defaultDays: 0, // Accrued over time
    isPaid: true,
    accrualRate: 0.05,
  },
  [LeaveType.PARENTAL_LEAVE_AU]: {
    value: LeaveType.PARENTAL_LEAVE_AU,
    label: 'Parental Leave',
    description: '12 months unpaid parental leave',
    defaultDays: 0,
    isPaid: false,
    accrualRate: 0,
  },
  [LeaveType.COMPASSIONATE_LEAVE_AU]: {
    value: LeaveType.COMPASSIONATE_LEAVE_AU,
    label: 'Compassionate/Bereavement Leave',
    description: '2 days paid compassionate leave',
    defaultDays: 2,
    isPaid: true,
    accrualRate: 0,
  },
};

// Country to leave type mapping
export const COUNTRY_LEAVE_TYPES: Record<string, LeaveType[]> = {
  IN: [
    LeaveType.ANNUAL_LEAVE_IN,
    LeaveType.SICK_LEAVE_IN,
    LeaveType.CASUAL_LEAVE_IN,
    LeaveType.MATERNITY_LEAVE_IN,
    LeaveType.PATERNITY_LEAVE_IN,
    LeaveType.COMPENSATORY_OFF_IN,
  ],
  PH: [
    LeaveType.VACATION_LEAVE_PH,
    LeaveType.SICK_LEAVE_PH,
    LeaveType.MATERNITY_LEAVE_PH,
    LeaveType.PATERNITY_LEAVE_PH,
    LeaveType.SOLO_PARENT_LEAVE_PH,
    LeaveType.SPECIAL_LEAVE_WOMEN_PH,
  ],
  AU: [
    LeaveType.ANNUAL_LEAVE_AU,
    LeaveType.SICK_CARERS_LEAVE_AU,
    LeaveType.LONG_SERVICE_LEAVE_AU,
    LeaveType.PARENTAL_LEAVE_AU,
    LeaveType.COMPASSIONATE_LEAVE_AU,
  ],
};

// Country-specific working days per month (for calculations)
export const COUNTRY_WORKING_DAYS: Record<string, number> = {
  IN: 26,
  PH: 26,
  AU: 22,
};

/**
 * Get leave types available for a specific country
 */
export function getLeaveTypesForCountry(countryCode: string): LeaveTypeInfo[] {
  const leaveTypes = COUNTRY_LEAVE_TYPES[countryCode] || [];
  return leaveTypes.map(type => LEAVE_TYPE_INFO[type]);
}

/**
 * Get leave type information
 */
export function getLeaveTypeInfo(leaveType: LeaveType): LeaveTypeInfo {
  return LEAVE_TYPE_INFO[leaveType];
}

/**
 * Validate if a leave type is valid for a country
 */
export function isValidLeaveTypeForCountry(leaveType: LeaveType, countryCode: string): boolean {
  const validTypes = COUNTRY_LEAVE_TYPES[countryCode] || [];
  return validTypes.includes(leaveType);
}

/**
 * Get leave type label
 */
export function getLeaveTypeLabel(leaveType: LeaveType): string {
  return LEAVE_TYPE_INFO[leaveType]?.label || leaveType;
}

/**
 * Get working days per month for a country
 */
export function getWorkingDaysPerMonth(countryCode: string): number {
  return COUNTRY_WORKING_DAYS[countryCode] || 22;
}

