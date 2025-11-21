import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payslip } from '../entities/payslip.entity';
import { StatutoryBreakdown } from '../dto/payroll-calculation.dto';

export interface ContributionSummary {
  userId: string;
  countryId: string;
  currencyCode: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalContributions: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  contributionsByType: ContributionByType[];
}

export interface ContributionByType {
  componentName: string;
  componentCode: string;
  totalEmployee: number;
  totalEmployer: number;
  totalContribution: number;
  occurrences: number;
}

export interface ContributionHistory {
  payslipId: string;
  payrollPeriodId: string;
  periodName: string;
  calculatedAt: Date;
  contributions: StatutoryBreakdown[];
  totalStatutoryDeductions: number;
}

/**
 * ContributionTrackingService
 * Provides contribution tracking and YTD summaries from saved payslips
 * Leverages Story 7.3 calculation results stored in Payslip entities
 */
@Injectable()
export class ContributionTrackingService {
  private readonly logger = new Logger(ContributionTrackingService.name);

  constructor(
    @InjectRepository(Payslip)
    private readonly payslipRepository: Repository<Payslip>,
  ) {}

  /**
   * Get YTD contribution summary for an employee
   * @param userId - Employee user ID
   * @param countryId - Country ID
   * @param startDate - Start date for YTD calculation
   * @param endDate - End date for YTD calculation
   */
  async getYtdContributionSummary(
    userId: string,
    countryId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ContributionSummary> {
    this.logger.log(
      `Calculating YTD contribution summary for user ${userId}, country ${countryId}, from ${startDate} to ${endDate}`,
    );

    const payslips = await this.payslipRepository.find({
      where: {
        userId,
        countryId,
        calculatedAt: Between(startDate, endDate),
        status: 'available' as any, // Only include available payslips
      },
      order: { calculatedAt: 'ASC' },
    });

    if (payslips.length === 0) {
      throw new NotFoundException(
        `No payslips found for user ${userId} in the specified period`,
      );
    }

    // Aggregate contributions by type
    const contributionMap = new Map<string, ContributionByType>();
    let totalEmployeeContributions = 0;
    let totalEmployerContributions = 0;

    for (const payslip of payslips) {
      for (const statutory of payslip.statutoryDeductions) {
        const key = statutory.componentId || statutory.componentName;
        const existing = contributionMap.get(key) || {
          componentName: statutory.componentName,
          componentCode: statutory.componentId, // Use componentId as componentCode for tracking
          totalEmployee: 0,
          totalEmployer: 0,
          totalContribution: 0,
          occurrences: 0,
        };

        existing.totalEmployee += statutory.employeeContribution;
        existing.totalEmployer += statutory.employerContribution;
        existing.totalContribution += statutory.totalContribution;
        existing.occurrences += 1;

        contributionMap.set(key, existing);

        totalEmployeeContributions += statutory.employeeContribution;
        totalEmployerContributions += statutory.employerContribution;
      }
    }

    const summary: ContributionSummary = {
      userId,
      countryId,
      currencyCode: payslips[0].currencyCode,
      period: {
        startDate,
        endDate,
      },
      totalContributions: totalEmployeeContributions + totalEmployerContributions,
      totalEmployeeContributions,
      totalEmployerContributions,
      contributionsByType: Array.from(contributionMap.values()),
    };

    this.logger.log(
      `YTD summary calculated: ${summary.contributionsByType.length} contribution types, total: ${summary.totalContributions}`,
    );

    return summary;
  }

  /**
   * Get contribution history for an employee
   * @param userId - Employee user ID
   * @param countryId - Country ID (optional)
   * @param limit - Number of recent payslips to retrieve
   */
  async getContributionHistory(
    userId: string,
    countryId?: string,
    limit: number = 12,
  ): Promise<ContributionHistory[]> {
    this.logger.log(
      `Retrieving contribution history for user ${userId}, limit: ${limit}`,
    );

    const queryBuilder = this.payslipRepository
      .createQueryBuilder('payslip')
      .leftJoinAndSelect('payslip.payrollPeriod', 'period')
      .where('payslip.userId = :userId', { userId })
      .andWhere('payslip.status = :status', { status: 'available' });

    if (countryId) {
      queryBuilder.andWhere('payslip.countryId = :countryId', { countryId });
    }

    const payslips = await queryBuilder
      .orderBy('payslip.calculatedAt', 'DESC')
      .take(limit)
      .getMany();

    const history: ContributionHistory[] = payslips.map((payslip) => ({
      payslipId: payslip.id,
      payrollPeriodId: payslip.payrollPeriodId,
      periodName: payslip.payrollPeriod?.periodName || 'N/A',
      calculatedAt: payslip.calculatedAt,
      contributions: payslip.statutoryDeductions,
      totalStatutoryDeductions: payslip.totalStatutoryDeductions,
    }));

    this.logger.log(`Retrieved ${history.length} contribution history records`);
    return history;
  }

  /**
   * Get contribution breakdown for a specific payslip
   * @param payslipId - Payslip ID
   * @param userId - Employee user ID (for authorization)
   */
  async getContributionBreakdown(
    payslipId: string,
    userId: string,
  ): Promise<StatutoryBreakdown[]> {
    const payslip = await this.payslipRepository.findOne({
      where: { id: payslipId, userId },
    });

    if (!payslip) {
      throw new NotFoundException(
        `Payslip with ID ${payslipId} not found for user ${userId}`,
      );
    }

    return payslip.statutoryDeductions;
  }

  /**
   * Get current year contribution summary (convenience method)
   * @param userId - Employee user ID
   * @param countryId - Country ID
   */
  async getCurrentYearSummary(
    userId: string,
    countryId: string,
  ): Promise<ContributionSummary> {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // December 31st

    return this.getYtdContributionSummary(
      userId,
      countryId,
      startOfYear,
      endOfYear,
    );
  }

  /**
   * Compare contributions between two periods
   * @param userId - Employee user ID
   * @param countryId - Country ID
   * @param period1Start - Period 1 start date
   * @param period1End - Period 1 end date
   * @param period2Start - Period 2 start date
   * @param period2End - Period 2 end date
   */
  async compareContributions(
    userId: string,
    countryId: string,
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date,
  ): Promise<{
    period1: ContributionSummary;
    period2: ContributionSummary;
    difference: number;
    percentageChange: number;
  }> {
    const [period1Summary, period2Summary] = await Promise.all([
      this.getYtdContributionSummary(userId, countryId, period1Start, period1End),
      this.getYtdContributionSummary(userId, countryId, period2Start, period2End),
    ]);

    const difference =
      period2Summary.totalContributions - period1Summary.totalContributions;
    const percentageChange =
      period1Summary.totalContributions > 0
        ? (difference / period1Summary.totalContributions) * 100
        : 0;

    return {
      period1: period1Summary,
      period2: period2Summary,
      difference,
      percentageChange,
    };
  }
}

