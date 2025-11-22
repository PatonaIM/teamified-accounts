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
 * Philippines-specific payroll calculation implementation
 * Implements Philippine statutory requirements:
 * - SSS (Social Security System)
 * - PhilHealth (Philippine Health Insurance Corporation)
 * - Pag-IBIG (Home Development Mutual Fund)
 * - Withholding Tax
 */
@Injectable()
export class PhilippinesCalculationFactory extends RegionCalculationFactory {
  private readonly logger = new Logger(PhilippinesCalculationFactory.name);

  // SSS Contribution Table 2024 (Monthly Salary Credit)
  private readonly SSS_CONTRIBUTION_TABLE = [
    { minSalary: 0, maxSalary: 4249.99, msc: 4000, ee: 180, er: 380, total: 560 },
    { minSalary: 4250, maxSalary: 4749.99, msc: 4500, ee: 202.5, er: 427.5, total: 630 },
    { minSalary: 4750, maxSalary: 5249.99, msc: 5000, ee: 225, er: 475, total: 700 },
    { minSalary: 5250, maxSalary: 5749.99, msc: 5500, ee: 247.5, er: 522.5, total: 770 },
    { minSalary: 5750, maxSalary: 6249.99, msc: 6000, ee: 270, er: 570, total: 840 },
    { minSalary: 6250, maxSalary: 6749.99, msc: 6500, ee: 292.5, er: 617.5, total: 910 },
    { minSalary: 6750, maxSalary: 7249.99, msc: 7000, ee: 315, er: 665, total: 980 },
    { minSalary: 7250, maxSalary: 7749.99, msc: 7500, ee: 337.5, er: 712.5, total: 1050 },
    { minSalary: 7750, maxSalary: 8249.99, msc: 8000, ee: 360, er: 760, total: 1120 },
    { minSalary: 8250, maxSalary: 8749.99, msc: 8500, ee: 382.5, er: 807.5, total: 1190 },
    { minSalary: 8750, maxSalary: 9249.99, msc: 9000, ee: 405, er: 855, total: 1260 },
    { minSalary: 9250, maxSalary: 9749.99, msc: 9500, ee: 427.5, er: 902.5, total: 1330 },
    { minSalary: 9750, maxSalary: 10249.99, msc: 10000, ee: 450, er: 950, total: 1400 },
    { minSalary: 10250, maxSalary: 10749.99, msc: 10500, ee: 472.5, er: 997.5, total: 1470 },
    { minSalary: 10750, maxSalary: 11249.99, msc: 11000, ee: 495, er: 1045, total: 1540 },
    { minSalary: 11250, maxSalary: 11749.99, msc: 11500, ee: 517.5, er: 1092.5, total: 1610 },
    { minSalary: 11750, maxSalary: 12249.99, msc: 12000, ee: 540, er: 1140, total: 1680 },
    { minSalary: 12250, maxSalary: 12749.99, msc: 12500, ee: 562.5, er: 1187.5, total: 1750 },
    { minSalary: 12750, maxSalary: 13249.99, msc: 13000, ee: 585, er: 1235, total: 1820 },
    { minSalary: 13250, maxSalary: 13749.99, msc: 13500, ee: 607.5, er: 1282.5, total: 1890 },
    { minSalary: 13750, maxSalary: 14249.99, msc: 14000, ee: 630, er: 1330, total: 1960 },
    { minSalary: 14250, maxSalary: 14749.99, msc: 14500, ee: 652.5, er: 1377.5, total: 2030 },
    { minSalary: 14750, maxSalary: 15249.99, msc: 15000, ee: 675, er: 1425, total: 2100 },
    { minSalary: 15250, maxSalary: 15749.99, msc: 15500, ee: 697.5, er: 1472.5, total: 2170 },
    { minSalary: 15750, maxSalary: 16249.99, msc: 16000, ee: 720, er: 1520, total: 2240 },
    { minSalary: 16250, maxSalary: 16749.99, msc: 16500, ee: 742.5, er: 1567.5, total: 2310 },
    { minSalary: 16750, maxSalary: 17249.99, msc: 17000, ee: 765, er: 1615, total: 2380 },
    { minSalary: 17250, maxSalary: 17749.99, msc: 17500, ee: 787.5, er: 1662.5, total: 2450 },
    { minSalary: 17750, maxSalary: 18249.99, msc: 18000, ee: 810, er: 1710, total: 2520 },
    { minSalary: 18250, maxSalary: 18749.99, msc: 18500, ee: 832.5, er: 1757.5, total: 2590 },
    { minSalary: 18750, maxSalary: 19249.99, msc: 19000, ee: 855, er: 1805, total: 2660 },
    { minSalary: 19250, maxSalary: 19749.99, msc: 19500, ee: 877.5, er: 1852.5, total: 2730 },
    { minSalary: 19750, maxSalary: Infinity, msc: 20000, ee: 900, er: 1900, total: 2800 },
  ];

  // PhilHealth Contribution Table 2024
  private readonly PHILHEALTH_PREMIUM_RATE = 4.0; // 4% of monthly basic salary
  private readonly PHILHEALTH_MIN_SALARY = 10000; // Minimum salary for contribution
  private readonly PHILHEALTH_MAX_SALARY = 80000; // Maximum salary for contribution
  private readonly PHILHEALTH_MIN_CONTRIBUTION = 400; // Minimum monthly contribution (shared)
  private readonly PHILHEALTH_MAX_CONTRIBUTION = 3200; // Maximum monthly contribution (shared)

  // Pag-IBIG Contribution Rates 2024
  private readonly PAGIBIG_EMPLOYEE_RATE_1 = 1; // 1% for monthly compensation ≤ ₱1,500
  private readonly PAGIBIG_EMPLOYEE_RATE_2 = 2; // 2% for monthly compensation > ₱1,500
  private readonly PAGIBIG_EMPLOYER_RATE = 2; // 2% employer contribution
  private readonly PAGIBIG_MAX_EMPLOYEE_CONTRIBUTION = 100; // Maximum ₱100/month for employee
  private readonly PAGIBIG_MAX_SALARY = 5000; // Maximum salary for calculation

  // Withholding Tax Table 2024 (TRAIN Law)
  private readonly WITHHOLDING_TAX_TABLE = [
    { minIncome: 0, maxIncome: 20833, rate: 0, baseAmount: 0 },
    { minIncome: 20834, maxIncome: 33332, rate: 15, baseAmount: 0 },
    { minIncome: 33333, maxIncome: 66666, rate: 20, baseAmount: 1875 },
    { minIncome: 66667, maxIncome: 166666, rate: 25, baseAmount: 8541.8 },
    { minIncome: 166667, maxIncome: 666666, rate: 30, baseAmount: 33541.8 },
    { minIncome: 666667, maxIncome: Infinity, rate: 35, baseAmount: 183541.8 },
  ];

  getRegionName(): string {
    return 'Philippines';
  }

  /**
   * Calculate gross pay for Philippines
   * Includes basic salary, allowances, overtime, night differential, etc.
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

    // Process salary components (earnings, benefits, allowances)
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
      const nightShiftComponent = input.salaryComponents.find(
        (c) =>
          c.isActive &&
          (c.name?.toLowerCase().includes('night') ||
            c.name?.toLowerCase().includes('differential')),
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
      `Philippines - Gross pay calculated: ${grossPay} ${input.currencyCode} for user: ${input.userId}`,
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
   * Calculate statutory deductions for Philippines
   * Includes SSS, PhilHealth, and Pag-IBIG
   */
  protected async calculateStatutoryDeductions(
    input: PayrollCalculationInput,
    grossPayBreakdown: any,
  ): Promise<StatutoryBreakdown[]> {
    const deductions: StatutoryBreakdown[] = [];
    const basicSalary = grossPayBreakdown.basicSalary;
    const grossPay = grossPayBreakdown.grossPay;

    // 1. SSS Calculation
    const sssComponent = input.statutoryComponents.find(
      (c) => c.isActive && c.componentType === 'SSS',
    );

    if (sssComponent) {
      const sssContribution = this.calculateSSS(basicSalary);

      deductions.push({
        componentId: sssComponent.id,
        componentName: 'SSS',
        componentType: 'SSS',
        employeeContribution: sssContribution.employee,
        employerContribution: sssContribution.employer,
        totalContribution: sssContribution.total,
        currencyCode: input.currencyCode,
        calculationBasis: 'BASIC_SALARY',
      });

      this.logger.debug(
        `SSS calculated - Employee: ${sssContribution.employee}, Employer: ${sssContribution.employer}`,
      );
    }

    // 2. PhilHealth Calculation
    const philHealthComponent = input.statutoryComponents.find(
      (c) => c.isActive && c.componentType === 'PHILHEALTH',
    );

    if (philHealthComponent) {
      const philHealthContribution = this.calculatePhilHealth(basicSalary);

      deductions.push({
        componentId: philHealthComponent.id,
        componentName: 'PhilHealth',
        componentType: 'PHILHEALTH',
        employeeContribution: philHealthContribution.employee,
        employerContribution: philHealthContribution.employer,
        totalContribution: philHealthContribution.total,
        currencyCode: input.currencyCode,
        calculationBasis: 'BASIC_SALARY',
        rate: this.PHILHEALTH_PREMIUM_RATE,
      });

      this.logger.debug(
        `PhilHealth calculated - Employee: ${philHealthContribution.employee}, Employer: ${philHealthContribution.employer}`,
      );
    }

    // 3. Pag-IBIG Calculation
    const pagIbigComponent = input.statutoryComponents.find(
      (c) => c.isActive && c.componentType === 'PAGIBIG',
    );

    if (pagIbigComponent) {
      const pagIbigContribution = this.calculatePagIBIG(basicSalary);

      deductions.push({
        componentId: pagIbigComponent.id,
        componentName: 'Pag-IBIG',
        componentType: 'PAGIBIG',
        employeeContribution: pagIbigContribution.employee,
        employerContribution: pagIbigContribution.employer,
        totalContribution: pagIbigContribution.total,
        currencyCode: input.currencyCode,
        calculationBasis: 'BASIC_SALARY',
      });

      this.logger.debug(
        `Pag-IBIG calculated - Employee: ${pagIbigContribution.employee}, Employer: ${pagIbigContribution.employer}`,
      );
    }

    // 4. Withholding Tax Calculation
    // Note: In Philippines, withholding tax is calculated on gross pay minus
    // SSS, PhilHealth, and Pag-IBIG contributions
    const totalStatutoryContributions = deductions.reduce(
      (sum, d) => sum + d.employeeContribution,
      0,
    );
    const taxableIncome = grossPay - totalStatutoryContributions;
    const monthlyTax = this.calculateWithholdingTax(taxableIncome);

    if (monthlyTax > 0) {
      // Create a placeholder tax component if not configured
      deductions.push({
        componentId: 'withholding-tax',
        componentName: 'Withholding Tax',
        componentType: 'TDS', // Using TDS as generic tax type
        employeeContribution: monthlyTax,
        employerContribution: 0,
        totalContribution: monthlyTax,
        currencyCode: input.currencyCode,
        calculationBasis: 'TAXABLE_INCOME',
      });

      this.logger.debug(
        `Withholding Tax calculated: ${monthlyTax} (Taxable Income: ${taxableIncome})`,
      );
    }

    return deductions;
  }

  /**
   * Calculate SSS contribution based on Monthly Salary Credit (MSC)
   */
  private calculateSSS(
    monthlySalary: number,
  ): { employee: number; employer: number; total: number } {
    for (const bracket of this.SSS_CONTRIBUTION_TABLE) {
      if (
        monthlySalary >= bracket.minSalary &&
        monthlySalary <= bracket.maxSalary
      ) {
        return {
          employee: bracket.ee,
          employer: bracket.er,
          total: bracket.total,
        };
      }
    }

    // Default to maximum bracket if salary exceeds table
    const maxBracket =
      this.SSS_CONTRIBUTION_TABLE[this.SSS_CONTRIBUTION_TABLE.length - 1];
    return {
      employee: maxBracket.ee,
      employer: maxBracket.er,
      total: maxBracket.total,
    };
  }

  /**
   * Calculate PhilHealth contribution
   * 4% of monthly basic salary (shared equally: 2% employee, 2% employer)
   */
  private calculatePhilHealth(
    monthlySalary: number,
  ): { employee: number; employer: number; total: number } {
    // Determine the salary base for calculation
    let salaryBase = monthlySalary;

    if (monthlySalary < this.PHILHEALTH_MIN_SALARY) {
      salaryBase = this.PHILHEALTH_MIN_SALARY;
    } else if (monthlySalary > this.PHILHEALTH_MAX_SALARY) {
      salaryBase = this.PHILHEALTH_MAX_SALARY;
    }

    // Calculate total premium (4% of salary base)
    const totalPremium = Math.round(
      (salaryBase * this.PHILHEALTH_PREMIUM_RATE) / 100,
    );

    // Split equally between employee and employer (2% each)
    const employeeShare = Math.round(totalPremium / 2);
    const employerShare = totalPremium - employeeShare;

    // Apply minimum and maximum limits
    const minShare = this.PHILHEALTH_MIN_CONTRIBUTION / 2;
    const maxShare = this.PHILHEALTH_MAX_CONTRIBUTION / 2;

    const employee = Math.max(minShare, Math.min(maxShare, employeeShare));
    const employer = Math.max(minShare, Math.min(maxShare, employerShare));

    return {
      employee,
      employer,
      total: employee + employer,
    };
  }

  /**
   * Calculate Pag-IBIG contribution
   * Employee: 1% (≤₱1,500) or 2% (>₱1,500), max ₱100/month
   * Employer: 2% of monthly compensation
   */
  private calculatePagIBIG(
    monthlySalary: number,
  ): { employee: number; employer: number; total: number } {
    // Cap salary at maximum for calculation
    const salaryForCalc = Math.min(monthlySalary, this.PAGIBIG_MAX_SALARY);

    // Employee contribution rate depends on salary
    const employeeRate =
      monthlySalary <= 1500
        ? this.PAGIBIG_EMPLOYEE_RATE_1
        : this.PAGIBIG_EMPLOYEE_RATE_2;

    // Calculate employee contribution
    let employeeContribution = Math.round(
      (salaryForCalc * employeeRate) / 100,
    );

    // Cap employee contribution at ₱100
    employeeContribution = Math.min(
      employeeContribution,
      this.PAGIBIG_MAX_EMPLOYEE_CONTRIBUTION,
    );

    // Employer contribution is always 2%
    const employerContribution = Math.round(
      (salaryForCalc * this.PAGIBIG_EMPLOYER_RATE) / 100,
    );

    return {
      employee: employeeContribution,
      employer: employerContribution,
      total: employeeContribution + employerContribution,
    };
  }

  /**
   * Calculate withholding tax based on TRAIN Law brackets
   * Input is monthly taxable income
   */
  private calculateWithholdingTax(monthlyTaxableIncome: number): number {
    for (const bracket of this.WITHHOLDING_TAX_TABLE) {
      if (
        monthlyTaxableIncome >= bracket.minIncome &&
        monthlyTaxableIncome <= bracket.maxIncome
      ) {
        const excessIncome = monthlyTaxableIncome - bracket.minIncome;
        const tax = bracket.baseAmount + (excessIncome * bracket.rate) / 100;
        return Math.round(tax);
      }
    }

    return 0;
  }

  /**
   * Apply Philippines-specific adjustments
   */
  protected async applyRegionSpecificAdjustments(
    result: any,
    input: PayrollCalculationInput,
  ): Promise<void> {
    // Add Philippines-specific metadata
    result.metadata = {
      ...result.metadata,
      region: 'Philippines',
      taxLaw: 'TRAIN Law (RA 10963)',
      calculationStandard: 'Philippine Labor Code 2024',
      sssApplicable: true,
      philHealthApplicable: true,
      pagIbigApplicable: true,
    };

    this.logger.log(
      `Philippines-specific adjustments applied for user: ${input.userId}`,
    );
  }
}

