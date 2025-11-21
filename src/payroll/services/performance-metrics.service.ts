import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { PerformanceMetrics, MetricType } from '../entities/performance-metrics.entity';
import { PayrollProcessingLog, ProcessingStatus } from '../entities/payroll-processing-log.entity';
import {
  RecordMetricDto,
  PerformanceMetricResponseDto,
  MetricsQueryDto,
  AggregatedMetricsDto,
  PerformanceSummaryDto,
  SystemPerformanceDashboardDto,
} from '../dto/performance-metrics.dto';

/**
 * Service for tracking and analyzing performance metrics
 * Integrates with Stories 7.3-7.6 for comprehensive monitoring
 */
@Injectable()
export class PerformanceMetricsService {
  private readonly logger = new Logger(PerformanceMetricsService.name);

  constructor(
    @InjectRepository(PerformanceMetrics)
    private readonly metricsRepository: Repository<PerformanceMetrics>,
    @InjectRepository(PayrollProcessingLog)
    private readonly processingLogRepository: Repository<PayrollProcessingLog>,
  ) {}

  /**
   * Record a performance metric
   */
  async recordMetric(dto: RecordMetricDto): Promise<PerformanceMetricResponseDto> {
    try {
      const metric = this.metricsRepository.create({
        metricType: dto.metricType,
        metricName: dto.metricName,
        metricValue: dto.metricValue,
        metricUnit: dto.metricUnit || 'ms',
        payrollPeriodId: dto.payrollPeriodId || null,
        processingLogId: dto.processingLogId || null,
        userId: dto.userId || null,
        countryId: dto.countryId || null,
        additionalData: dto.additionalData || null,
        recordedAt: new Date(),
      });

      const saved = await this.metricsRepository.save(metric);
      return this.toResponseDto(saved);
    } catch (error) {
      this.logger.error(`Failed to record metric: ${error.message}`);
      throw error;
    }
  }

  /**
   * Record multiple metrics in batch
   */
  async recordMetricsBatch(dtos: RecordMetricDto[]): Promise<void> {
    try {
      const metrics = dtos.map((dto) =>
        this.metricsRepository.create({
          metricType: dto.metricType,
          metricName: dto.metricName,
          metricValue: dto.metricValue,
          metricUnit: dto.metricUnit || 'ms',
          payrollPeriodId: dto.payrollPeriodId || null,
          processingLogId: dto.processingLogId || null,
          userId: dto.userId || null,
          countryId: dto.countryId || null,
          additionalData: dto.additionalData || null,
          recordedAt: new Date(),
        }),
      );

      await this.metricsRepository.save(metrics);
      this.logger.log(`Recorded ${metrics.length} metrics in batch`);
    } catch (error) {
      this.logger.error(`Failed to record metrics batch: ${error.message}`);
    }
  }

  /**
   * Query metrics with filters
   */
  async queryMetrics(query: MetricsQueryDto): Promise<PerformanceMetricResponseDto[]> {
    try {
      const queryBuilder = this.metricsRepository.createQueryBuilder('metric');

      if (query.metricType) {
        queryBuilder.andWhere('metric.metricType = :metricType', {
          metricType: query.metricType,
        });
      }

      if (query.periodId) {
        queryBuilder.andWhere('metric.payrollPeriodId = :periodId', {
          periodId: query.periodId,
        });
      }

      if (query.logId) {
        queryBuilder.andWhere('metric.processingLogId = :logId', {
          logId: query.logId,
        });
      }

      if (query.countryId) {
        queryBuilder.andWhere('metric.countryId = :countryId', {
          countryId: query.countryId,
        });
      }

      if (query.startDate && query.endDate) {
        queryBuilder.andWhere('metric.recordedAt BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      } else if (query.startDate) {
        queryBuilder.andWhere('metric.recordedAt >= :startDate', {
          startDate: query.startDate,
        });
      }

      queryBuilder
        .orderBy('metric.recordedAt', 'DESC')
        .limit(query.limit || 100);

      const metrics = await queryBuilder.getMany();
      return metrics.map((m) => this.toResponseDto(m));
    } catch (error) {
      this.logger.error(`Failed to query metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get aggregated metrics by type
   */
  async getAggregatedMetrics(
    metricType: MetricType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AggregatedMetricsDto> {
    try {
      const queryBuilder = this.metricsRepository
        .createQueryBuilder('metric')
        .where('metric.metricType = :metricType', { metricType });

      if (startDate && endDate) {
        queryBuilder.andWhere('metric.recordedAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }

      const metrics = await queryBuilder.getMany();

      if (metrics.length === 0) {
        return {
          metricType,
          count: 0,
          average: 0,
          min: 0,
          max: 0,
          median: 0,
          p95: 0,
          p99: 0,
          metricUnit: 'ms',
        };
      }

      const values = metrics.map((m) => Number(m.metricValue)).sort((a, b) => a - b);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const average = sum / values.length;
      const min = values[0];
      const max = values[values.length - 1];
      const median = this.calculatePercentile(values, 50);
      const p95 = this.calculatePercentile(values, 95);
      const p99 = this.calculatePercentile(values, 99);

      return {
        metricType,
        count: metrics.length,
        average: Math.round(average * 100) / 100,
        min,
        max,
        median,
        p95,
        p99,
        metricUnit: metrics[0].metricUnit,
      };
    } catch (error) {
      this.logger.error(`Failed to get aggregated metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get performance summary for a specific period
   */
  async getPerformanceSummary(periodId: string): Promise<PerformanceSummaryDto> {
    try {
      const metrics = await this.metricsRepository.find({
        where: { payrollPeriodId: periodId },
      });

      const getMetricValue = (type: MetricType): number => {
        const filtered = metrics.filter((m) => m.metricType === type);
        if (filtered.length === 0) return 0;
        const sum = filtered.reduce((acc, m) => acc + Number(m.metricValue), 0);
        return Math.round((sum / filtered.length) * 100) / 100;
      };

      const processingMetric = metrics.find(
        (m) => m.metricType === MetricType.PROCESSING_TIME,
      );

      return {
        periodId,
        periodName: 'Period Summary',
        countryCode: metrics[0]?.countryId || 'N/A',
        totalProcessingTimeMs: getMetricValue(MetricType.PROCESSING_TIME),
        averageCalculationTimeMs: getMetricValue(MetricType.CALCULATION_TIME),
        timesheetFetchTimeMs: getMetricValue(MetricType.TIMESHEET_FETCH),
        leaveFetchTimeMs: getMetricValue(MetricType.LEAVE_FETCH),
        payslipStorageTimeMs: getMetricValue(MetricType.PAYSLIP_STORAGE),
        pdfGenerationTimeMs: getMetricValue(MetricType.PDF_GENERATION),
        notificationTimeMs: getMetricValue(MetricType.NOTIFICATION_SEND),
        totalEmployeesProcessed:
          processingMetric?.additionalData?.employeesProcessed || 0,
        averageTimePerEmployeeMs:
          processingMetric?.additionalData?.avgTimePerEmployee || 0,
        recordedAt: processingMetric?.recordedAt || new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get performance summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get system-wide performance dashboard
   */
  async getSystemDashboard(): Promise<SystemPerformanceDashboardDto> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get active processing runs with error handling
      let activeRuns = 0;
      try {
        activeRuns = await this.processingLogRepository.count({
          where: [
            { status: ProcessingStatus.IN_PROGRESS },
            { status: ProcessingStatus.STARTED },
          ],
        });
      } catch (error) {
        this.logger.warn(`Failed to get active runs: ${error.message}`);
      }

      // Get processing times for different periods with error handling
      const emptyMetrics: AggregatedMetricsDto = {
        metricType: MetricType.PROCESSING_TIME,
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        p95: 0,
        p99: 0,
        metricUnit: 'ms',
      };

      let processingMetrics24h = emptyMetrics;
      let processingMetrics7d = emptyMetrics;
      let processingMetrics30d = emptyMetrics;
      let apiMetrics = { ...emptyMetrics, metricType: MetricType.API_RESPONSE_TIME };
      let dbMetrics = { ...emptyMetrics, metricType: MetricType.DATABASE_QUERY_TIME };

      try {
        processingMetrics24h = await this.getAggregatedMetrics(
          MetricType.PROCESSING_TIME,
          yesterday,
          now,
        );
        processingMetrics7d = await this.getAggregatedMetrics(
          MetricType.PROCESSING_TIME,
          weekAgo,
          now,
        );
        processingMetrics30d = await this.getAggregatedMetrics(
          MetricType.PROCESSING_TIME,
          monthAgo,
          now,
        );

        // Get API and DB metrics
        apiMetrics = await this.getAggregatedMetrics(
          MetricType.API_RESPONSE_TIME,
          yesterday,
          now,
        );
        dbMetrics = await this.getAggregatedMetrics(
          MetricType.DATABASE_QUERY_TIME,
          yesterday,
          now,
        );
      } catch (error) {
        this.logger.warn(`Failed to get aggregated metrics: ${error.message}`);
      }

      // Calculate success rates with error handling
      let logsToday: PayrollProcessingLog[] = [];
      let logsWeek: PayrollProcessingLog[] = [];
      let logsMonth: PayrollProcessingLog[] = [];

      try {
        logsToday = await this.processingLogRepository.find({
          where: { startedAt: MoreThanOrEqual(new Date(now.getTime() - 24 * 60 * 60 * 1000)) },
        });
        logsWeek = await this.processingLogRepository.find({
          where: { startedAt: MoreThanOrEqual(weekAgo) },
        });
        logsMonth = await this.processingLogRepository.find({
          where: { startedAt: MoreThanOrEqual(monthAgo) },
        });
      } catch (error) {
        this.logger.warn(`Failed to get processing logs: ${error.message}`);
      }

      const calculateSuccessRate = (logs: PayrollProcessingLog[]): number => {
        if (logs.length === 0) return 100;
        const completed = logs.filter((l) => l.status === ProcessingStatus.COMPLETED);
        return Math.round((completed.length / logs.length) * 100 * 100) / 100;
      };

      const calculateEmployeesProcessed = (logs: PayrollProcessingLog[]): number => {
        return logs.reduce((acc, log) => acc + (log.employeesProcessed || 0), 0);
      };

      // Get all metric types for breakdown with error handling
      const metricsByType: AggregatedMetricsDto[] = [];
      try {
        for (const type of Object.values(MetricType)) {
          const aggregated = await this.getAggregatedMetrics(type, yesterday, now);
          if (aggregated.count > 0) {
            metricsByType.push(aggregated);
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to get metrics by type: ${error.message}`);
      }

      return {
        activeProcessingRuns: activeRuns,
        avgProcessingTime24h: processingMetrics24h.average,
        avgProcessingTime7d: processingMetrics7d.average,
        avgProcessingTime30d: processingMetrics30d.average,
        employeesProcessedToday: calculateEmployeesProcessed(logsToday),
        employeesProcessedWeek: calculateEmployeesProcessed(logsWeek),
        employeesProcessedMonth: calculateEmployeesProcessed(logsMonth),
        successRate24h: calculateSuccessRate(logsToday),
        successRate7d: calculateSuccessRate(logsWeek),
        successRate30d: calculateSuccessRate(logsMonth),
        apiResponseTimeP95: apiMetrics.p95,
        dbQueryTimeP95: dbMetrics.p95,
        metricsByType,
      };
    } catch (error) {
      this.logger.error(`Failed to get system dashboard: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Calculate percentile
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Helper: Convert entity to DTO
   */
  private toResponseDto(metric: PerformanceMetrics): PerformanceMetricResponseDto {
    return {
      id: metric.id,
      metricType: metric.metricType,
      metricName: metric.metricName,
      metricValue: Number(metric.metricValue),
      metricUnit: metric.metricUnit,
      payrollPeriodId: metric.payrollPeriodId,
      processingLogId: metric.processingLogId,
      userId: metric.userId,
      countryId: metric.countryId,
      additionalData: metric.additionalData,
      recordedAt: metric.recordedAt,
      createdAt: metric.createdAt,
    };
  }
}

