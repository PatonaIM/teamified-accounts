import { Test, TestingModule } from '@nestjs/testing';
import { TimesheetCalculationService } from '../timesheet-calculation.service';

describe('TimesheetCalculationService', () => {
  let service: TimesheetCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimesheetCalculationService],
    }).compile();

    service = module.get<TimesheetCalculationService>(TimesheetCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateTimesheet - India (IN)', () => {
    it('should calculate regular hours correctly for India', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'IN',
        basicSalary: 50000,
        regularHours: 8,
        overtimeHours: 0,
        doubleOvertimeHours: 0,
        nightShiftHours: 0,
        workDate: new Date('2024-01-15'),
      });

      const hourlyRate = 50000 / 160; // 312.5
      expect(result.regularPay).toBe(8 * hourlyRate);
      expect(result.overtimePay).toBe(0);
      expect(result.totalPay).toBe(8 * hourlyRate);
      expect(result.countryRules.overtimeMultiplier).toBe(2.0);
    });

    it('should calculate overtime at 2x rate for India', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'IN',
        basicSalary: 50000,
        regularHours: 9,
        overtimeHours: 2,
        doubleOvertimeHours: 0,
        nightShiftHours: 0,
        workDate: new Date('2024-01-15'),
      });

      const hourlyRate = 50000 / 160; // 312.5
      expect(result.regularPay).toBe(9 * hourlyRate);
      expect(result.overtimePay).toBe(2 * hourlyRate * 2.0);
      expect(result.breakdown.overtimeRate).toBe(hourlyRate * 2.0);
    });

    it('should not apply night shift premium for India', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'IN',
        basicSalary: 50000,
        regularHours: 0,
        overtimeHours: 0,
        doubleOvertimeHours: 0,
        nightShiftHours: 8,
        workDate: new Date('2024-01-15'),
      });

      const hourlyRate = 50000 / 160;
      expect(result.nightShiftPay).toBe(8 * hourlyRate * 1.0); // No premium
      expect(result.countryRules.nightShiftPremium).toBe(1.0);
    });
  });

  describe('calculateTimesheet - Philippines (PH)', () => {
    it('should calculate regular hours correctly for Philippines', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'PH',
        basicSalary: 30000,
        regularHours: 8,
        overtimeHours: 0,
        doubleOvertimeHours: 0,
        nightShiftHours: 0,
        workDate: new Date('2024-01-15'),
      });

      const hourlyRate = 30000 / 160; // 187.5
      expect(result.regularPay).toBe(8 * hourlyRate);
      expect(result.overtimePay).toBe(0);
      expect(result.totalPay).toBe(8 * hourlyRate);
    });

    it('should calculate overtime at 125% for Philippines', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'PH',
        basicSalary: 30000,
        regularHours: 8,
        overtimeHours: 2,
        doubleOvertimeHours: 0,
        nightShiftHours: 0,
        workDate: new Date('2024-01-15'),
      });

      const hourlyRate = 30000 / 160; // 187.5
      expect(result.regularPay).toBeCloseTo(8 * hourlyRate, 2);
      expect(result.overtimePay).toBeCloseTo(2 * hourlyRate * 1.25, 2);
      expect(result.breakdown.overtimeRate).toBeCloseTo(hourlyRate * 1.25, 2);
      expect(result.countryRules.overtimeMultiplier).toBe(1.25);
    });

    it('should calculate double overtime at 200% for Philippines', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'PH',
        basicSalary: 30000,
        regularHours: 8,
        overtimeHours: 0,
        doubleOvertimeHours: 3,
        nightShiftHours: 0,
        workDate: new Date('2024-01-15'),
      });

      const hourlyRate = 30000 / 160; // 187.5
      expect(result.doubleOvertimePay).toBe(3 * hourlyRate * 2.0);
      expect(result.breakdown.doubleOvertimeRate).toBe(hourlyRate * 2.0);
      expect(result.countryRules.doubleOvertimeMultiplier).toBe(2.0);
    });

    it('should calculate night shift at 110% for Philippines', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'PH',
        basicSalary: 30000,
        regularHours: 0,
        overtimeHours: 0,
        doubleOvertimeHours: 0,
        nightShiftHours: 8,
        workDate: new Date('2024-01-15'),
      });

      const hourlyRate = 30000 / 160; // 187.5
      expect(result.nightShiftPay).toBeCloseTo(8 * hourlyRate * 1.1, 2);
      expect(result.breakdown.nightShiftRate).toBeCloseTo(hourlyRate * 1.1, 2);
      expect(result.countryRules.nightShiftPremium).toBe(1.1);
    });

    it('should calculate combined overtime and night shift for Philippines', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'PH',
        basicSalary: 30000,
        regularHours: 6,
        overtimeHours: 2,
        doubleOvertimeHours: 0,
        nightShiftHours: 4,
        workDate: new Date('2024-01-15'),
      });

      const hourlyRate = 30000 / 160;
      expect(result.regularPay).toBeCloseTo(6 * hourlyRate, 2);
      expect(result.overtimePay).toBeCloseTo(2 * hourlyRate * 1.25, 2);
      expect(result.nightShiftPay).toBeCloseTo(4 * hourlyRate * 1.1, 2);
      expect(result.totalPay).toBeGreaterThan(0);
    });
  });

  describe('validateTimesheetHours', () => {
    it('should validate hours within limits', () => {
      const result = service.validateTimesheetHours('IN', 8, 2, 0);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative hours', () => {
      const result = service.validateTimesheetHours('IN', -1, 2, 0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Regular hours must be between 0 and 24');
    });

    it('should reject hours exceeding 24', () => {
      const result = service.validateTimesheetHours('IN', 25, 0, 0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Regular hours must be between 0 and 24');
    });

    it('should reject total hours exceeding 24', () => {
      const result = service.validateTimesheetHours('IN', 15, 8, 5);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Total hours cannot exceed 24 hours per day');
    });

    it('should validate India-specific limits', () => {
      const result = service.validateTimesheetHours('IN', 10, 5, 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('India'))).toBe(true);
    });

    it('should validate Philippines-specific limits', () => {
      const result = service.validateTimesheetHours('PH', 10, 0, 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Philippines'))).toBe(true);
    });
  });

  describe('getOvertimeLimits', () => {
    it('should return India overtime limits', () => {
      const limits = service.getOvertimeLimits('IN');
      expect(limits.maxRegularHours).toBe(9);
      expect(limits.maxOvertimeHours).toBe(3);
      expect(limits.maxDailyHours).toBe(12);
      expect(limits.notes).toContain('India');
    });

    it('should return Philippines overtime limits', () => {
      const limits = service.getOvertimeLimits('PH');
      expect(limits.maxRegularHours).toBe(8);
      expect(limits.maxOvertimeHours).toBe(8);
      expect(limits.maxDailyHours).toBe(16);
      expect(limits.notes).toContain('Philippines');
    });

    it('should return Australia overtime limits', () => {
      const limits = service.getOvertimeLimits('AU');
      expect(limits.maxRegularHours).toBe(7.6);
      expect(limits.maxOvertimeHours).toBe(4);
      expect(limits.maxDailyHours).toBe(12);
      expect(limits.notes).toContain('Australia');
    });

    it('should return default limits for unknown country', () => {
      const limits = service.getOvertimeLimits('XX');
      expect(limits.maxRegularHours).toBe(8);
      expect(limits.notes).toContain('Default');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero hours correctly', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'IN',
        basicSalary: 50000,
        regularHours: 0,
        overtimeHours: 0,
        doubleOvertimeHours: 0,
        nightShiftHours: 0,
        workDate: new Date('2024-01-15'),
      });

      expect(result.totalPay).toBe(0);
      expect(result.regularPay).toBe(0);
      expect(result.overtimePay).toBe(0);
    });

    it('should handle very low salary', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'PH',
        basicSalary: 1000,
        regularHours: 8,
        overtimeHours: 0,
        doubleOvertimeHours: 0,
        nightShiftHours: 0,
        workDate: new Date('2024-01-15'),
      });

      expect(result.totalPay).toBeGreaterThan(0);
      expect(result.regularPay).toBeGreaterThan(0);
    });

    it('should round currency correctly', async () => {
      const result = await service.calculateTimesheet({
        countryCode: 'IN',
        basicSalary: 33333, // Results in 208.33125 per hour
        regularHours: 3,
        overtimeHours: 0,
        doubleOvertimeHours: 0,
        nightShiftHours: 0,
        workDate: new Date('2024-01-15'),
      });

      // Should be rounded to 2 decimal places
      expect(result.regularPay.toString()).toMatch(/^\d+\.\d{1,2}$/);
      expect(result.totalPay.toString()).toMatch(/^\d+\.\d{1,2}$/);
    });
  });
});

