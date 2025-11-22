import { Injectable } from '@nestjs/common';
import {
  PayrollCalculationResult,
  ComponentBreakdown,
  StatutoryBreakdown,
} from '../dto/payroll-calculation.dto';

/**
 * Input data for payroll calculations
 */
export interface PayrollCalculationInput {
  userId: string;
  countryId: string;
  countryCode: string;
  payrollPeriodId: string;
  calculationDate: Date;
  basicSalary: number;
  currencyCode: string;
  salaryComponents: any[]; // From Story 7.2
  statutoryComponents: any[]; // From Story 7.2
  employmentData?: any; // From Story 1.4
  salaryHistory?: any; // From Story 1.5
  includeOvertime: boolean;
  includeNightShift: boolean;
  metadata?: Record<string, any>;
}

/**
 * Abstract base class for region-specific payroll calculations
 * Implements Template Method pattern for payroll processing
 */
@Injectable()
export abstract class RegionCalculationFactory {
  /**
   * Main template method for payroll calculation
   * Defines the skeleton of the algorithm
   */
  async calculatePayroll(
    input: PayrollCalculationInput,
  ): Promise<PayrollCalculationResult> {
    const startTime = Date.now();

    try {
      // Step 1: Validate input data
      await this.validateInput(input);

      // Step 2: Calculate gross pay
      const grossPayBreakdown = await this.calculateGrossPay(input);

      // Step 3: Calculate statutory deductions
      const statutoryDeductions = await this.calculateStatutoryDeductions(
        input,
        grossPayBreakdown,
      );

      // Step 4: Calculate other deductions
      const otherDeductions = await this.calculateOtherDeductions(
        input,
        grossPayBreakdown,
      );

      // Step 5: Calculate net pay
      const netPay = await this.calculateNetPay(
        grossPayBreakdown,
        statutoryDeductions,
        otherDeductions,
      );

      // Step 6: Build result
      const result = this.buildCalculationResult(
        input,
        grossPayBreakdown,
        statutoryDeductions,
        otherDeductions,
        netPay,
      );

      // Step 7: Apply region-specific adjustments
      await this.applyRegionSpecificAdjustments(result, input);

      return result;
    } catch (error) {
      throw new Error(
        `Payroll calculation failed for user ${input.userId}: ${error.message}`,
      );
    }
  }

  /**
   * Validate input data for calculations
   * Can be overridden by region-specific implementations
   */
  protected async validateInput(
    input: PayrollCalculationInput,
  ): Promise<void> {
    if (!input.userId || !input.countryId || !input.payrollPeriodId) {
      throw new Error('Missing required input data for payroll calculation');
    }

    if (input.basicSalary < 0) {
      throw new Error('Basic salary cannot be negative');
    }
  }

  /**
   * Calculate gross pay including basic salary, allowances, overtime, etc.
   * Must be implemented by region-specific classes
   */
  protected abstract calculateGrossPay(
    input: PayrollCalculationInput,
  ): Promise<{
    grossPay: number;
    basicSalary: number;
    totalEarnings: number;
    overtimePay: number;
    nightShiftPay: number;
    components: ComponentBreakdown[];
  }>;

  /**
   * Calculate statutory deductions (PF, ESI, SSS, etc.)
   * Must be implemented by region-specific classes
   */
  protected abstract calculateStatutoryDeductions(
    input: PayrollCalculationInput,
    grossPayBreakdown: any,
  ): Promise<StatutoryBreakdown[]>;

  /**
   * Calculate other deductions (loans, advances, etc.)
   * Can be overridden by region-specific implementations
   */
  protected async calculateOtherDeductions(
    input: PayrollCalculationInput,
    grossPayBreakdown: any,
  ): Promise<ComponentBreakdown[]> {
    const deductions: ComponentBreakdown[] = [];

    // Find deduction components from salary components
    const deductionComponents = input.salaryComponents.filter(
      (c) => c.type === 'deductions' || c.componentType === 'DEDUCTIONS',
    );

    for (const component of deductionComponents) {
      if (component.isActive) {
        const amount = this.calculateComponentAmount(
          component,
          grossPayBreakdown.basicSalary,
        );

        deductions.push({
          componentId: component.id,
          componentName: component.name,
          componentType: component.componentType || component.type,
          amount,
          currencyCode: input.currencyCode,
          calculationMethod: component.calculationType || 'FIXED',
          baseAmount: grossPayBreakdown.basicSalary,
          rate: component.rate || component.percentage,
        });
      }
    }

    return deductions;
  }

  /**
   * Calculate net pay
   */
  protected async calculateNetPay(
    grossPayBreakdown: any,
    statutoryDeductions: StatutoryBreakdown[],
    otherDeductions: ComponentBreakdown[],
  ): Promise<number> {
    const totalStatutory = statutoryDeductions.reduce(
      (sum, d) => sum + d.employeeContribution,
      0,
    );
    const totalOther = otherDeductions.reduce((sum, d) => sum + d.amount, 0);

    const netPay = grossPayBreakdown.grossPay - totalStatutory - totalOther;

    return Math.max(0, netPay); // Ensure non-negative
  }

  /**
   * Build the final calculation result
   */
  protected buildCalculationResult(
    input: PayrollCalculationInput,
    grossPayBreakdown: any,
    statutoryDeductions: StatutoryBreakdown[],
    otherDeductions: ComponentBreakdown[],
    netPay: number,
  ): PayrollCalculationResult {
    const totalStatutory = statutoryDeductions.reduce(
      (sum, d) => sum + d.employeeContribution,
      0,
    );
    const totalOther = otherDeductions.reduce((sum, d) => sum + d.amount, 0);

    return {
      calculationId: this.generateCalculationId(),
      userId: input.userId,
      countryId: input.countryId,
      payrollPeriodId: input.payrollPeriodId,
      calculatedAt: new Date(),
      grossPay: grossPayBreakdown.grossPay,
      basicSalary: grossPayBreakdown.basicSalary,
      totalEarnings: grossPayBreakdown.totalEarnings,
      overtimePay: grossPayBreakdown.overtimePay,
      nightShiftPay: grossPayBreakdown.nightShiftPay,
      totalStatutoryDeductions: totalStatutory,
      totalOtherDeductions: totalOther,
      totalDeductions: totalStatutory + totalOther,
      netPay,
      currencyCode: input.currencyCode,
      salaryComponents: grossPayBreakdown.components,
      statutoryDeductions,
      otherDeductions,
      metadata: input.metadata || {},
    };
  }

  /**
   * Apply region-specific adjustments to the calculation result
   * Can be overridden by region-specific implementations
   */
  protected async applyRegionSpecificAdjustments(
    result: PayrollCalculationResult,
    input: PayrollCalculationInput,
  ): Promise<void> {
    // Default implementation does nothing
    // Override in region-specific classes for special handling
  }

  /**
   * Helper method to calculate component amount based on calculation type
   */
  protected calculateComponentAmount(
    component: any,
    baseAmount: number,
  ): number {
    const calculationType =
      component.calculationType || component.calculation_type || 'FIXED';

    switch (calculationType) {
      case 'FIXED':
        return component.amount || component.value || 0;

      case 'PERCENTAGE':
        const percentage = component.percentage || component.rate || 0;
        return (baseAmount * percentage) / 100;

      case 'FORMULA':
        // For complex formulas, this would need more sophisticated parsing
        // For now, treat as fixed
        return component.amount || 0;

      default:
        return component.amount || 0;
    }
  }

  /**
   * Generate unique calculation ID
   */
  protected generateCalculationId(): string {
    return `CALC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get region name for logging and identification
   */
  abstract getRegionName(): string;
}

