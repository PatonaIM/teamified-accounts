import { PayrollProcessingLog, ProcessingStatus } from '../payroll-processing-log.entity';
import { Country } from '../country.entity';
import { PayrollPeriod } from '../payroll-period.entity';

describe('PayrollProcessingLog Entity', () => {
  it('should be defined', () => {
    expect(new PayrollProcessingLog()).toBeDefined();
  });

  it('should create a processing log with all required fields', () => {
    const log = new PayrollProcessingLog();
    log.status = ProcessingStatus.STARTED;
    log.startedAt = new Date();
    log.employeesProcessed = 0;
    log.employeesFailed = 0;

    expect(log.status).toBe(ProcessingStatus.STARTED);
    expect(log.startedAt).toBeInstanceOf(Date);
    expect(log.employeesProcessed).toBe(0);
    expect(log.employeesFailed).toBe(0);
  });

  it('should support country relationship', () => {
    const country = new Country();
    country.code = 'IN';
    country.name = 'India';
    
    const log = new PayrollProcessingLog();
    log.country = country;
    log.status = ProcessingStatus.STARTED;
    
    expect(log.country).toBeDefined();
    expect(log.country.code).toBe('IN');
  });

  it('should support payroll period relationship', () => {
    const period = new PayrollPeriod();
    period.periodName = 'January 2024';
    
    const log = new PayrollProcessingLog();
    log.payrollPeriod = period;
    log.status = ProcessingStatus.IN_PROGRESS;
    
    expect(log.payrollPeriod).toBeDefined();
    expect(log.payrollPeriod.periodName).toBe('January 2024');
  });

  it('should support all processing statuses', () => {
    const statuses = [
      ProcessingStatus.STARTED,
      ProcessingStatus.IN_PROGRESS,
      ProcessingStatus.COMPLETED,
      ProcessingStatus.FAILED,
      ProcessingStatus.CANCELLED,
    ];

    statuses.forEach((status) => {
      const log = new PayrollProcessingLog();
      log.status = status;
      expect(log.status).toBe(status);
    });
  });

  it('should track processing progress', () => {
    const log = new PayrollProcessingLog();
    log.employeesProcessed = 95;
    log.employeesFailed = 5;
    
    const totalAttempted = log.employeesProcessed + log.employeesFailed;
    expect(totalAttempted).toBe(100);
    expect(log.employeesProcessed).toBe(95);
    expect(log.employeesFailed).toBe(5);
  });

  it('should store error information', () => {
    const log = new PayrollProcessingLog();
    log.status = ProcessingStatus.FAILED;
    log.errorMessage = 'Database connection error';
    log.errorDetails = {
      code: 'DB_ERROR',
      timestamp: new Date().toISOString(),
      affectedEmployees: [1, 2, 3],
    };
    
    expect(log.errorMessage).toBe('Database connection error');
    expect(log.errorDetails).toBeDefined();
    expect(log.errorDetails.code).toBe('DB_ERROR');
    expect(log.errorDetails.affectedEmployees).toHaveLength(3);
  });

  it('should store processing metadata', () => {
    const log = new PayrollProcessingLog();
    log.processingMetadata = {
      startTime: new Date().toISOString(),
      processingDuration: 120000, // ms
      batchSize: 100,
      processedBatches: 10,
    };
    
    expect(log.processingMetadata).toBeDefined();
    expect(log.processingMetadata.batchSize).toBe(100);
    expect(log.processingMetadata.processedBatches).toBe(10);
  });

  it('should track completion time', () => {
    const log = new PayrollProcessingLog();
    log.startedAt = new Date('2024-01-01T10:00:00Z');
    log.completedAt = new Date('2024-01-01T10:05:00Z');
    log.status = ProcessingStatus.COMPLETED;
    
    const duration = log.completedAt.getTime() - log.startedAt.getTime();
    expect(duration).toBe(5 * 60 * 1000); // 5 minutes in milliseconds
  });

  it('should have timestamps', () => {
    const log = new PayrollProcessingLog();
    log.createdAt = new Date();
    log.updatedAt = new Date();
    
    expect(log.createdAt).toBeInstanceOf(Date);
    expect(log.updatedAt).toBeInstanceOf(Date);
  });
});

