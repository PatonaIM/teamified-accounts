import { Injectable, Logger } from '@nestjs/common';

/**
 * Timesheet Calculation Service
 * 
 * Handles country-specific calculations for:
 * - Overtime rates (India: 2x, Philippines: 125-200%)
 * - Night shift differentials (Philippines: 10% premium)
 * - Total compensation based on timesheet hours
 * 
 * Integrates with Story 7.2 salary components for rate calculations
 */

export interface TimesheetCalculationInput {
  countryCode: string;
  basicSalary: number;
  regularHours: number;
  overtimeHours: number;
  doubleOvertimeHours: number;
  nightShiftHours: number;
  workDate: Date;
}

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

@Injectable()
export class TimesheetCalculationService {
  private readonly logger = new Logger(TimesheetCalculationService.name);

  /**
   * Calculate timesheet compensation based on country-specific rules
   */
  async calculateTimesheet(
    input: TimesheetCalculationInput,
  ): Promise<TimesheetCalculationResult> {
    this.logger.log(
      `Calculating timesheet for country: ${input.countryCode}, hours: ${input.regularHours}/${input.overtimeHours}/${input.doubleOvertimeHours}/${input.nightShiftHours}`,
    );

    // Get country-specific rules
    const rules = this.getCountryRules(input.countryCode);

    // Calculate hourly rate from monthly salary (assuming 160 hours per month)
    const hourlyRate = input.basicSalary / 160;

    // Calculate rates
    const regularRate = hourlyRate;
    const overtimeRate = hourlyRate * rules.overtimeMultiplier;
    const doubleOvertimeRate = hourlyRate * rules.doubleOvertimeMultiplier;
    const nightShiftRate = hourlyRate * rules.nightShiftPremium;

    // Calculate pay components
    const regularPay = input.regularHours * regularRate;
    const overtimePay = input.overtimeHours * overtimeRate;
    const doubleOvertimePay = input.doubleOvertimeHours * doubleOvertimeRate;
    const nightShiftPay = input.nightShiftHours * nightShiftRate;

    const totalPay = regularPay + overtimePay + doubleOvertimePay + nightShiftPay;

    const result: TimesheetCalculationResult = {
      regularPay: this.roundCurrency(regularPay),
      overtimePay: this.roundCurrency(overtimePay),
      doubleOvertimePay: this.roundCurrency(doubleOvertimePay),
      nightShiftPay: this.roundCurrency(nightShiftPay),
      totalPay: this.roundCurrency(totalPay),
      breakdown: {
        regularRate: this.roundCurrency(regularRate),
        overtimeRate: this.roundCurrency(overtimeRate),
        doubleOvertimeRate: this.roundCurrency(doubleOvertimeRate),
        nightShiftRate: this.roundCurrency(nightShiftRate),
      },
      countryRules: rules,
    };

    this.logger.log(
      `Calculation complete: Total pay ${result.totalPay} (Regular: ${result.regularPay}, OT: ${result.overtimePay}, Night: ${result.nightShiftPay})`,
    );

    return result;
  }

  /**
   * Get country-specific overtime and night shift rules
   */
  private getCountryRules(countryCode: string): {
    overtimeMultiplier: number;
    doubleOvertimeMultiplier: number;
    nightShiftPremium: number;
  } {
    switch (countryCode.toUpperCase()) {
      case 'IN': // India
        return {
          overtimeMultiplier: 2.0, // 2x rate for overtime
          doubleOvertimeMultiplier: 2.0, // Same as overtime in India
          nightShiftPremium: 1.0, // No specific night shift differential in India labor law
        };

      case 'PH': // Philippines
        return {
          overtimeMultiplier: 1.25, // 125% for first 8 hours of overtime
          doubleOvertimeMultiplier: 2.0, // 200% for hours beyond 8 hours overtime
          nightShiftPremium: 1.1, // 10% night shift differential (10pm-6am)
        };

      case 'AU': // Australia (future)
        return {
          overtimeMultiplier: 1.5, // 150% for first 2 hours
          doubleOvertimeMultiplier: 2.0, // 200% beyond 2 hours
          nightShiftPremium: 1.15, // 15% night shift loading
        };

      default:
        this.logger.warn(`No specific rules for country: ${countryCode}, using default`);
        return {
          overtimeMultiplier: 1.5, // Default 150%
          doubleOvertimeMultiplier: 2.0, // Default 200%
          nightShiftPremium: 1.1, // Default 10%
        };
    }
  }

  /**
   * Validate timesheet hours against country-specific limits
   */
  validateTimesheetHours(
    countryCode: string,
    regularHours: number,
    overtimeHours: number,
    doubleOvertimeHours: number,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Common validations
    if (regularHours < 0 || regularHours > 24) {
      errors.push('Regular hours must be between 0 and 24');
    }
    if (overtimeHours < 0 || overtimeHours > 24) {
      errors.push('Overtime hours must be between 0 and 24');
    }
    if (doubleOvertimeHours < 0 || doubleOvertimeHours > 24) {
      errors.push('Double overtime hours must be between 0 and 24');
    }

    const totalHours = regularHours + overtimeHours + doubleOvertimeHours;
    if (totalHours > 24) {
      errors.push('Total hours cannot exceed 24 hours per day');
    }

    // Country-specific validations
    switch (countryCode.toUpperCase()) {
      case 'IN':
        // India: Maximum 9 hours per day, 48 hours per week
        if (totalHours > 12) {
          errors.push('India: Total hours should not exceed 12 hours per day (9 regular + 3 overtime)');
        }
        break;

      case 'PH':
        // Philippines: Maximum 8 hours per day, overtime allowed
        if (regularHours > 8 && overtimeHours === 0) {
          errors.push('Philippines: Regular hours beyond 8 should be classified as overtime');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate overtime limits for a country
   */
  getOvertimeLimits(countryCode: string): {
    maxRegularHours: number;
    maxOvertimeHours: number;
    maxDailyHours: number;
    notes: string;
  } {
    switch (countryCode.toUpperCase()) {
      case 'IN':
        return {
          maxRegularHours: 9,
          maxOvertimeHours: 3,
          maxDailyHours: 12,
          notes: 'India: Factories Act limits work to 9 hours/day, 48 hours/week. Overtime at 2x rate.',
        };

      case 'PH':
        return {
          maxRegularHours: 8,
          maxOvertimeHours: 8,
          maxDailyHours: 16,
          notes: 'Philippines: Standard 8 hours/day. Overtime at 125% for first 8 hours, 200% beyond.',
        };

      case 'AU':
        return {
          maxRegularHours: 7.6,
          maxOvertimeHours: 4,
          maxDailyHours: 12,
          notes: 'Australia: Standard 38 hours/week (7.6 hours/day). Overtime at 150-200%.',
        };

      default:
        return {
          maxRegularHours: 8,
          maxOvertimeHours: 4,
          maxDailyHours: 12,
          notes: 'Default limits. Verify with local labor laws.',
        };
    }
  }

  /**
   * Round currency to 2 decimal places
   */
  private roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

