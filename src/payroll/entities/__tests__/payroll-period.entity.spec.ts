import { PayrollPeriod, PayrollPeriodStatus } from '../payroll-period.entity';
import { Country } from '../country.entity';

describe('PayrollPeriod Entity', () => {
  it('should be defined', () => {
    expect(new PayrollPeriod()).toBeDefined();
  });

  it('should create a payroll period with all required fields', () => {
    const period = new PayrollPeriod();
    period.periodName = 'January 2024';
    period.startDate = new Date('2024-01-01');
    period.endDate = new Date('2024-01-31');
    period.payDate = new Date('2024-02-05');
    period.status = PayrollPeriodStatus.DRAFT;
    period.totalEmployees = 0;
    period.totalAmount = 0;

    expect(period.periodName).toBe('January 2024');
    expect(period.startDate).toEqual(new Date('2024-01-01'));
    expect(period.endDate).toEqual(new Date('2024-01-31'));
    expect(period.payDate).toEqual(new Date('2024-02-05'));
    expect(period.status).toBe(PayrollPeriodStatus.DRAFT);
    expect(period.totalEmployees).toBe(0);
    expect(period.totalAmount).toBe(0);
  });

  it('should support country relationship', () => {
    const country = new Country();
    country.code = 'IN';
    country.name = 'India';
    
    const period = new PayrollPeriod();
    period.country = country;
    period.periodName = 'January 2024';
    
    expect(period.country).toBeDefined();
    expect(period.country.code).toBe('IN');
  });

  it('should support all payroll period statuses', () => {
    const statuses = [
      PayrollPeriodStatus.DRAFT,
      PayrollPeriodStatus.OPEN,
      PayrollPeriodStatus.PROCESSING,
      PayrollPeriodStatus.COMPLETED,
      PayrollPeriodStatus.CLOSED,
    ];

    statuses.forEach((status) => {
      const period = new PayrollPeriod();
      period.status = status;
      expect(period.status).toBe(status);
    });
  });

  it('should handle monthly payroll periods', () => {
    const period = new PayrollPeriod();
    period.periodName = 'January 2024';
    period.startDate = new Date('2024-01-01');
    period.endDate = new Date('2024-01-31');
    period.payDate = new Date('2024-02-05');
    
    expect(period.startDate.getMonth()).toBe(0); // January (0-indexed)
    expect(period.endDate.getMonth()).toBe(0); // January (0-indexed)
    expect(period.payDate.getMonth()).toBe(1); // February (0-indexed)
  });

  it('should track total employees and amount', () => {
    const period = new PayrollPeriod();
    period.totalEmployees = 150;
    period.totalAmount = 1500000.50;
    
    expect(period.totalEmployees).toBe(150);
    expect(period.totalAmount).toBe(1500000.50);
  });

  it('should have timestamps', () => {
    const period = new PayrollPeriod();
    period.createdAt = new Date();
    period.updatedAt = new Date();
    
    expect(period.createdAt).toBeInstanceOf(Date);
    expect(period.updatedAt).toBeInstanceOf(Date);
  });
});

