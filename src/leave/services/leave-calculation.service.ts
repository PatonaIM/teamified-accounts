import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { LeaveType } from '../entities/leave-request.entity';
import { SalaryComponentService } from '../../payroll/services/salary-component.service';

@Injectable()
export class LeaveCalculationService {
  private readonly CACHE_TTL = 300; // 5 minutes in seconds
  private readonly inMemoryCache: Map<string, { data: any; expiry: number }> = new Map();

  constructor(
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepository: Repository<LeaveBalance>,
    private readonly salaryComponentService: SalaryComponentService,
  ) {}

  /**
   * Initialize leave balances for a user
   */
  async initializeBalances(
    userId: string,
    countryCode: string,
    year: number,
  ): Promise<LeaveBalance[]> {
    const leaveTypes = this.getLeaveTypesForCountry(countryCode);
    const balances: LeaveBalance[] = [];

    for (const leaveType of leaveTypes) {
      const existingBalance = await this.leaveBalanceRepository.findOne({
        where: { userId, countryCode, leaveType, year },
      });

      if (!existingBalance) {
        const defaultDays = this.getDefaultLeaveDays(leaveType, countryCode);
        const accrualRate = this.getAccrualRate(leaveType, countryCode);

        const balance = this.leaveBalanceRepository.create({
          userId,
          countryCode,
          leaveType,
          totalDays: defaultDays,
          usedDays: 0,
          availableDays: defaultDays,
          accrualRate,
          year,
        });

        const savedBalance = await this.leaveBalanceRepository.save(balance);
        balances.push(savedBalance);
      }
    }

    return balances;
  }

  /**
   * Get leave types for a specific country
   */
  getLeaveTypesForCountry(countryCode: string): LeaveType[] {
    const countryLeaveTypes: Record<string, LeaveType[]> = {
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

    return countryLeaveTypes[countryCode] || [];
  }

  /**
   * Get default leave days for a leave type
   */
  getDefaultLeaveDays(leaveType: LeaveType, countryCode: string): number {
    const defaultDays: Record<string, number> = {
      // India
      [LeaveType.ANNUAL_LEAVE_IN]: 21, // Earned Leave
      [LeaveType.SICK_LEAVE_IN]: 12,
      [LeaveType.CASUAL_LEAVE_IN]: 12,
      [LeaveType.MATERNITY_LEAVE_IN]: 182, // 26 weeks
      [LeaveType.PATERNITY_LEAVE_IN]: 14, // 2 weeks
      [LeaveType.COMPENSATORY_OFF_IN]: 0, // Earned as needed
      
      // Philippines
      [LeaveType.VACATION_LEAVE_PH]: 5, // Service Incentive Leave
      [LeaveType.SICK_LEAVE_PH]: 5,
      [LeaveType.MATERNITY_LEAVE_PH]: 105, // 105 days
      [LeaveType.PATERNITY_LEAVE_PH]: 7, // 7 days
      [LeaveType.SOLO_PARENT_LEAVE_PH]: 7,
      [LeaveType.SPECIAL_LEAVE_WOMEN_PH]: 2,
      
      // Australia
      [LeaveType.ANNUAL_LEAVE_AU]: 20, // 4 weeks
      [LeaveType.SICK_CARERS_LEAVE_AU]: 10, // 10 days/year
      [LeaveType.LONG_SERVICE_LEAVE_AU]: 0, // Accrued over time
      [LeaveType.PARENTAL_LEAVE_AU]: 0, // Unpaid
      [LeaveType.COMPASSIONATE_LEAVE_AU]: 2,
    };

    return defaultDays[leaveType] || 0;
  }

  /**
   * Get accrual rate for a leave type (days per month)
   */
  getAccrualRate(leaveType: LeaveType, countryCode: string): number {
    const accrualRates: Record<string, number> = {
      // India
      [LeaveType.ANNUAL_LEAVE_IN]: 1.75, // 21 days / 12 months
      [LeaveType.SICK_LEAVE_IN]: 1.0, // 12 days / 12 months
      [LeaveType.CASUAL_LEAVE_IN]: 1.0, // 12 days / 12 months
      [LeaveType.MATERNITY_LEAVE_IN]: 0, // Not accrued
      [LeaveType.PATERNITY_LEAVE_IN]: 0, // Not accrued
      [LeaveType.COMPENSATORY_OFF_IN]: 0, // Earned as needed
      
      // Philippines
      [LeaveType.VACATION_LEAVE_PH]: 0.42, // 5 days / 12 months
      [LeaveType.SICK_LEAVE_PH]: 0.42, // 5 days / 12 months
      [LeaveType.MATERNITY_LEAVE_PH]: 0, // Not accrued
      [LeaveType.PATERNITY_LEAVE_PH]: 0, // Not accrued
      [LeaveType.SOLO_PARENT_LEAVE_PH]: 0, // Not accrued
      [LeaveType.SPECIAL_LEAVE_WOMEN_PH]: 0, // Not accrued
      
      // Australia
      [LeaveType.ANNUAL_LEAVE_AU]: 1.67, // 20 days / 12 months
      [LeaveType.SICK_CARERS_LEAVE_AU]: 0.83, // 10 days / 12 months
      [LeaveType.LONG_SERVICE_LEAVE_AU]: 0.05, // Accrued slowly
      [LeaveType.PARENTAL_LEAVE_AU]: 0, // Unpaid
      [LeaveType.COMPASSIONATE_LEAVE_AU]: 0, // Not accrued
    };

    return accrualRates[leaveType] || 0;
  }

  /**
   * Accrue leave for a user
   */
  async accrueLeave(
    userId: string,
    countryCode: string,
    year: number,
  ): Promise<void> {
    const balances = await this.leaveBalanceRepository.find({
      where: { userId, countryCode, year },
    });

    for (const balance of balances) {
      if (balance.accrualRate > 0) {
        balance.totalDays += balance.accrualRate;
        balance.availableDays = balance.totalDays - balance.usedDays;
        await this.leaveBalanceRepository.save(balance);
      }
    }
  }

  /**
   * Calculate leave impact on salary (for payroll integration)
   */
  async calculateLeaveImpact(
    userId: string,
    leaveType: LeaveType,
    totalDays: number,
    isPaid: boolean,
    baseSalary: number,
    countryCode: string,
  ): Promise<{ paidAmount: number; deductionAmount: number }> {
    // Get working days in month (typically 22-26 depending on country)
    const workingDaysPerMonth = this.getWorkingDaysPerMonth(countryCode);
    const dailyRate = baseSalary / workingDaysPerMonth;

    if (isPaid) {
      // Paid leave - employee receives full salary (no deduction)
      return {
        paidAmount: dailyRate * totalDays,
        deductionAmount: 0,
      };
    } else {
      // Unpaid leave - deduct from salary
      return {
        paidAmount: 0,
        deductionAmount: dailyRate * totalDays,
      };
    }
  }

  /**
   * Get working days per month for a country
   */
  getWorkingDaysPerMonth(countryCode: string): number {
    const workingDays: Record<string, number> = {
      IN: 26, // India typically 26 working days
      PH: 26, // Philippines typically 26 working days
      AU: 22, // Australia typically 22 working days (5-day week)
    };

    return workingDays[countryCode] || 22;
  }

  /**
   * Validate leave type for country
   */
  isValidLeaveTypeForCountry(leaveType: LeaveType, countryCode: string): boolean {
    const validTypes = this.getLeaveTypesForCountry(countryCode);
    return validTypes.includes(leaveType);
  }

  /**
   * Get user leave balances with caching (5-minute TTL)
   * Uses in-memory cache as a lightweight solution
   */
  async getUserLeaveBalances(
    userId: string,
    countryCode: string,
    year: number,
  ): Promise<LeaveBalance[]> {
    const cacheKey = `leave_balances:${userId}:${countryCode}:${year}`;
    
    // Try to get from cache
    const cached = this.inMemoryCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    // Fetch from database
    const balances = await this.leaveBalanceRepository.find({
      where: { userId, countryCode, year },
    });

    // Store in cache with expiry
    this.inMemoryCache.set(cacheKey, {
      data: balances,
      expiry: Date.now() + this.CACHE_TTL * 1000,
    });

    // Clean up expired entries
    this.cleanExpiredCache();

    return balances;
  }

  /**
   * Invalidate leave balance cache for a user
   */
  invalidateUserLeaveBalanceCache(
    userId: string,
    countryCode: string,
    year: number,
  ): void {
    const cacheKey = `leave_balances:${userId}:${countryCode}:${year}`;
    this.inMemoryCache.delete(cacheKey);
    
    // Also invalidate summary cache
    const summaryCacheKey = `leave_balance_summary:${userId}:${countryCode}:${year}`;
    this.inMemoryCache.delete(summaryCacheKey);
  }

  /**
   * Get leave balance summary with caching
   */
  async getLeaveBalanceSummary(
    userId: string,
    countryCode: string,
    year: number,
  ): Promise<{
    total: number;
    used: number;
    available: number;
    byType: Array<{ leaveType: string; total: number; used: number; available: number }>;
  }> {
    const cacheKey = `leave_balance_summary:${userId}:${countryCode}:${year}`;
    
    // Try to get from cache
    const cached = this.inMemoryCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const balances = await this.getUserLeaveBalances(userId, countryCode, year);

    const summary = {
      total: balances.reduce((sum, b) => sum + b.totalDays, 0),
      used: balances.reduce((sum, b) => sum + b.usedDays, 0),
      available: balances.reduce((sum, b) => sum + b.availableDays, 0),
      byType: balances.map((b) => ({
        leaveType: b.leaveType,
        total: b.totalDays,
        used: b.usedDays,
        available: b.availableDays,
      })),
    };

    // Store in cache with expiry
    this.inMemoryCache.set(cacheKey, {
      data: summary,
      expiry: Date.now() + this.CACHE_TTL * 1000,
    });

    return summary;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.inMemoryCache.entries()) {
      if (value.expiry <= now) {
        this.inMemoryCache.delete(key);
      }
    }
  }
}

