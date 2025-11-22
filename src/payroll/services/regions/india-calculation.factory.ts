import { Injectable, Logger } from '@nestjs/common';
import {
  RegionCalculationFactory,
  PayrollCalculationInput,
} from '../region-calculation.factory';
import {
  ComponentBreakdown,
  StatutoryBreakdown,
} from '../../dto/payroll-calculation.dto';

/**
 * India-specific payroll calculation implementation
 * Implements Indian statutory requirements:
 * - EPF (Employees' Provident Fund)
 * - ESI (Employee State Insurance)
 * - PT (Professional Tax)
 * - TDS (Tax Deducted at Source)
 */
@Injectable()
export class IndiaCalculationFactory extends RegionCalculationFactory {
  private readonly logger = new Logger(IndiaCalculationFactory.name);

  // India statutory limits and rates
  private readonly EPF_WAGE_CEILING = 15000; // Maximum basic salary for EPF calculation
  private readonly EPF_EMPLOYEE_RATE = 12; // 12% employee contribution
  private readonly EPF_EMPLOYER_RATE = 12; // 12% employer contribution (includes pension)
  
  private readonly ESI_WAGE_CEILING = 21000; // Salary limit for ESI applicability
  private readonly ESI_EMPLOYEE_RATE = 0.75; // 0.75% employee contribution
  private readonly ESI_EMPLOYER_RATE = 3.25; // 3.25% employer contribution

  // Professional Tax slabs (example: Maharashtra)
  private readonly PT_SLABS = [
    { minSalary: 0, maxSalary: 7500, tax: 0 },
    { minSalary: 7501, maxSalary: 10000, tax: 175 },
    { minSalary: 10001, maxSalary: Infinity, tax: 200 },
  ];

  // Income Tax slabs for FY 2024-25 (Old Regime)
  private readonly TDS_SLABS = [
    { minIncome: 0, maxIncome: 250000, rate: 0 },
    { minIncome: 250001, maxIncome: 500000, rate: 5 },
    { minIncome: 500001, maxIncome: 1000000, rate: 20 },
    { minIncome: 1000001, maxIncome: Infinity, rate: 30 },
  ];

  getRegionName(): string {
    return 'India';
  }

  /**
   * Calculate gross pay for India
   * Includes basic salary, HRA, transport allowance, special allowance, etc.
   */
  protected async calculateGrossPay(
    input: PayrollCalculationInput,
  ): Promise<{
    grossPay: number;
    basicSalary: number;
    totalEarnings: number;
    overtimePay: number;
    nightShiftPay: number;
    components: ComponentBreakdown[];
  }> {
    const components: ComponentBreakdown[] = [];
    let totalEarnings = 0;
    let overtimePay = 0;
    let nightShiftPay = 0;

    // Basic Salary
    const basicSalary = input.basicSalary;
    components.push({
      componentId: 'basic-salary',
      componentName: 'Basic Salary',
      componentType: 'EARNINGS',
      amount: basicSalary,
      currencyCode: input.currencyCode,
      calculationMethod: 'FIXED',
    });
    totalEarnings += basicSalary;

    // Process salary components (earnings, benefits, reimbursements)
    const earningsComponents = input.salaryComponents.filter(
      (c) =>
        c.isActive &&
        (c.componentType === 'EARNINGS' ||
          c.componentType === 'BENEFITS' ||
          c.componentType === 'REIMBURSEMENTS'),
    );

    for (const component of earningsComponents) {
      // Skip basic salary if already added
      if (component.name === 'Basic Salary') continue;

      const amount = this.calculateComponentAmount(component, basicSalary);

      components.push({
        componentId: component.id,
        componentName: component.name,
        componentType: component.componentType,
        amount,
        currencyCode: input.currencyCode,
        calculationMethod: component.calculationType || 'FIXED',
        baseAmount: basicSalary,
        rate: component.percentage || component.rate,
      });

      totalEarnings += amount;
    }

    // Calculate overtime (if applicable)
    if (input.includeOvertime) {
      // Placeholder: Will integrate with timesheet data from Story 7.4
      // For now, check if overtime component exists
      const overtimeComponent = input.salaryComponents.find(
        (c) =>
          c.isActive &&
          (c.name?.toLowerCase().includes('overtime') ||
            c.componentType === 'OVERTIME'),
      );

      if (overtimeComponent) {
        overtimePay = this.calculateComponentAmount(
          overtimeComponent,
          basicSalary,
        );
        components.push({
          componentId: overtimeComponent.id,
          componentName: overtimeComponent.name,
          componentType: 'OVERTIME',
          amount: overtimePay,
          currencyCode: input.currencyCode,
          calculationMethod: overtimeComponent.calculationType || 'FIXED',
        });
        totalEarnings += overtimePay;
      }
    }

    // Calculate night shift differential (if applicable)
    if (input.includeNightShift) {
      // Placeholder: Will integrate with timesheet data from Story 7.4
      const nightShiftComponent = input.salaryComponents.find(
        (c) =>
          c.isActive &&
          (c.name?.toLowerCase().includes('night') ||
            c.name?.toLowerCase().includes('shift differential')),
      );

      if (nightShiftComponent) {
        nightShiftPay = this.calculateComponentAmount(
          nightShiftComponent,
          basicSalary,
        );
        components.push({
          componentId: nightShiftComponent.id,
          componentName: nightShiftComponent.name,
          componentType: 'SHIFT_DIFFERENTIAL',
          amount: nightShiftPay,
          currencyCode: input.currencyCode,
          calculationMethod: nightShiftComponent.calculationType || 'FIXED',
        });
        totalEarnings += nightShiftPay;
      }
    }

    const grossPay = totalEarnings;

    this.logger.log(
      `India - Gross pay calculated: ${grossPay} ${input.currencyCode} for user: ${input.userId}`,
    );

    return {
      grossPay,
      basicSalary,
      totalEarnings,
      overtimePay,
      nightShiftPay,
      components,
    };
  }

  /**
   * Calculate statutory deductions for India
   * Includes EPF, ESI, PT, and TDS
   */
  protected async calculateStatutoryDeductions(
    input: PayrollCalculationInput,
    grossPayBreakdown: any,
  ): Promise<StatutoryBreakdown[]> {
    const deductions: StatutoryBreakdown[] = [];
    const basicSalary = grossPayBreakdown.basicSalary;
    const grossPay = grossPayBreakdown.grossPay;

    // 1. EPF Calculation
    const epfComponent = input.statutoryComponents.find(
      (c) => c.isActive && c.componentType === 'EPF',
    );

    if (epfComponent) {
      const epfWages = Math.min(basicSalary, this.EPF_WAGE_CEILING);
      const employeeEPF = Math.round(
        (epfWages * this.EPF_EMPLOYEE_RATE) / 100,
      );
      const employerEPF = Math.round(
        (epfWages * this.EPF_EMPLOYER_RATE) / 100,
      );

      deductions.push({
        componentId: epfComponent.id,
        componentName: 'EPF',
        componentType: 'EPF',
        employeeContribution: employeeEPF,
        employerContribution: employerEPF,
        totalContribution: employeeEPF + employerEPF,
        currencyCode: input.currencyCode,
        calculationBasis: 'BASIC_SALARY',
        rate: this.EPF_EMPLOYEE_RATE,
      });

      this.logger.debug(
        `EPF calculated - Employee: ${employeeEPF}, Employer: ${employerEPF} (Wages: ${epfWages})`,
      );
    }

    // 2. ESI Calculation (only if gross salary <= ESI ceiling)
    if (grossPay <= this.ESI_WAGE_CEILING) {
      const esiComponent = input.statutoryComponents.find(
        (c) => c.isActive && c.componentType === 'ESI',
      );

      if (esiComponent) {
        const employeeESI = Math.round(
          (grossPay * this.ESI_EMPLOYEE_RATE) / 100,
        );
        const employerESI = Math.round(
          (grossPay * this.ESI_EMPLOYER_RATE) / 100,
        );

        deductions.push({
          componentId: esiComponent.id,
          componentName: 'ESI',
          componentType: 'ESI',
          employeeContribution: employeeESI,
          employerContribution: employerESI,
          totalContribution: employeeESI + employerESI,
          currencyCode: input.currencyCode,
          calculationBasis: 'GROSS_SALARY',
          rate: this.ESI_EMPLOYEE_RATE,
        });

        this.logger.debug(
          `ESI calculated - Employee: ${employeeESI}, Employer: ${employerESI}`,
        );
      }
    }

    // 3. Professional Tax Calculation
    const ptComponent = input.statutoryComponents.find(
      (c) => c.isActive && c.componentType === 'PT',
    );

    if (ptComponent) {
      const monthlyPT = this.calculateProfessionalTax(grossPay);

      if (monthlyPT > 0) {
        deductions.push({
          componentId: ptComponent.id,
          componentName: 'Professional Tax',
          componentType: 'PT',
          employeeContribution: monthlyPT,
          employerContribution: 0, // PT is only employee contribution
          totalContribution: monthlyPT,
          currencyCode: input.currencyCode,
          calculationBasis: 'SLAB_BASED',
        });

        this.logger.debug(`Professional Tax calculated: ${monthlyPT}`);
      }
    }

    // 4. TDS Calculation
    const tdsComponent = input.statutoryComponents.find(
      (c) => c.isActive && c.componentType === 'TDS',
    );

    if (tdsComponent) {
      // Calculate annual income from monthly gross
      const annualIncome = grossPay * 12;
      const monthlyTDS = this.calculateTDS(annualIncome);

      if (monthlyTDS > 0) {
        deductions.push({
          componentId: tdsComponent.id,
          componentName: 'TDS',
          componentType: 'TDS',
          employeeContribution: monthlyTDS,
          employerContribution: 0, // TDS is only employee deduction
          totalContribution: monthlyTDS,
          currencyCode: input.currencyCode,
          calculationBasis: 'SLAB_BASED',
        });

        this.logger.debug(
          `TDS calculated: ${monthlyTDS} (Annual Income: ${annualIncome})`,
        );
      }
    }

    return deductions;
  }

  /**
   * Calculate Professional Tax based on salary slabs
   */
  private calculateProfessionalTax(grossSalary: number): number {
    for (const slab of this.PT_SLABS) {
      if (grossSalary >= slab.minSalary && grossSalary <= slab.maxSalary) {
        return slab.tax;
      }
    }
    return 0;
  }

  /**
   * Calculate TDS (Income Tax) based on annual income
   * Returns monthly TDS amount
   */
  private calculateTDS(annualIncome: number): number {
    let totalTax = 0;
    let previousSlabMax = 0;

    for (const slab of this.TDS_SLABS) {
      if (annualIncome > slab.minIncome) {
        const taxableInThisSlab = Math.min(
          annualIncome - previousSlabMax,
          slab.maxIncome - previousSlabMax,
        );

        const taxInSlab = (taxableInThisSlab * slab.rate) / 100;
        totalTax += taxInSlab;

        previousSlabMax = slab.maxIncome;
      }
    }

    // Add 4% Health and Education Cess
    totalTax = totalTax * 1.04;

    // Return monthly TDS
    return Math.round(totalTax / 12);
  }

  /**
   * Apply India-specific adjustments
   */
  protected async applyRegionSpecificAdjustments(
    result: any,
    input: PayrollCalculationInput,
  ): Promise<void> {
    // Add India-specific metadata
    result.metadata = {
      ...result.metadata,
      region: 'India',
      epfApplicable: input.basicSalary <= this.EPF_WAGE_CEILING,
      esiApplicable: result.grossPay <= this.ESI_WAGE_CEILING,
      taxRegime: 'Old Regime', // Could be made configurable
      calculationStandard: 'Indian Labor Laws 2024',
    };

    this.logger.log(
      `India-specific adjustments applied for user: ${input.userId}`,
    );
  }
}

