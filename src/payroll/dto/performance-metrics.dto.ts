import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { MetricType } from '../entities/performance-metrics.entity';

/**
 * DTO for recording a performance metric
 */
export class RecordMetricDto {
  @ApiProperty({ description: 'Type of metric', enum: MetricType })
  @IsEnum(MetricType)
  metricType: MetricType;

  @ApiProperty({ description: 'Metric name/description' })
  @IsString()
  metricName: string;

  @ApiProperty({ description: 'Metric value (numeric)' })
  @IsNumber()
  @Min(0)
  metricValue: number;

  @ApiProperty({ description: 'Metric unit (e.g., ms, seconds, count)', default: 'ms' })
  @IsOptional()
  @IsString()
  metricUnit?: string;

  @ApiPropertyOptional({ description: 'Payroll period ID' })
  @IsOptional()
  @IsUUID()
  payrollPeriodId?: string;

  @ApiPropertyOptional({ description: 'Processing log ID' })
  @IsOptional()
  @IsUUID()
  processingLogId?: string;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Country ID' })
  @IsOptional()
  @IsString()
  countryId?: string;

  @ApiPropertyOptional({ description: 'Additional data (JSON)' })
  @IsOptional()
  additionalData?: any;
}

/**
 * Response DTO for performance metrics
 */
export class PerformanceMetricResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: MetricType })
  metricType: MetricType;

  @ApiProperty()
  metricName: string;

  @ApiProperty()
  metricValue: number;

  @ApiProperty()
  metricUnit: string;

  @ApiProperty({ nullable: true })
  payrollPeriodId: string | null;

  @ApiProperty({ nullable: true })
  processingLogId: string | null;

  @ApiProperty({ nullable: true })
  userId: string | null;

  @ApiProperty({ nullable: true })
  countryId: string | null;

  @ApiProperty({ nullable: true })
  additionalData: any | null;

  @ApiProperty()
  recordedAt: Date;

  @ApiProperty()
  createdAt: Date;
}

/**
 * Query DTO for fetching metrics
 */
export class MetricsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by metric type', enum: MetricType })
  @IsOptional()
  @IsEnum(MetricType)
  metricType?: MetricType;

  @ApiPropertyOptional({ description: 'Filter by payroll period ID' })
  @IsOptional()
  @IsUUID()
  periodId?: string;

  @ApiPropertyOptional({ description: 'Filter by processing log ID' })
  @IsOptional()
  @IsUUID()
  logId?: string;

  @ApiPropertyOptional({ description: 'Filter by country ID' })
  @IsOptional()
  @IsString()
  countryId?: string;

  @ApiPropertyOptional({ description: 'Start date for filtering (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Limit number of results', default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

/**
 * Aggregated metrics response
 */
export class AggregatedMetricsDto {
  @ApiProperty()
  metricType: MetricType;

  @ApiProperty()
  count: number;

  @ApiProperty()
  average: number;

  @ApiProperty()
  min: number;

  @ApiProperty()
  max: number;

  @ApiProperty()
  median: number;

  @ApiProperty()
  p95: number;

  @ApiProperty()
  p99: number;

  @ApiProperty()
  metricUnit: string;
}

/**
 * Performance summary response
 */
export class PerformanceSummaryDto {
  @ApiProperty()
  periodId: string;

  @ApiProperty()
  periodName: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty()
  totalProcessingTimeMs: number;

  @ApiProperty()
  averageCalculationTimeMs: number;

  @ApiProperty()
  timesheetFetchTimeMs: number;

  @ApiProperty()
  leaveFetchTimeMs: number;

  @ApiProperty()
  payslipStorageTimeMs: number;

  @ApiProperty()
  pdfGenerationTimeMs: number;

  @ApiProperty()
  notificationTimeMs: number;

  @ApiProperty()
  totalEmployeesProcessed: number;

  @ApiProperty()
  averageTimePerEmployeeMs: number;

  @ApiProperty()
  recordedAt: Date;
}

/**
 * System-wide performance dashboard
 */
export class SystemPerformanceDashboardDto {
  @ApiProperty({ description: 'Current active processing runs' })
  activeProcessingRuns: number;

  @ApiProperty({ description: 'Average processing time (last 24h) in ms' })
  avgProcessingTime24h: number;

  @ApiProperty({ description: 'Average processing time (last 7d) in ms' })
  avgProcessingTime7d: number;

  @ApiProperty({ description: 'Average processing time (last 30d) in ms' })
  avgProcessingTime30d: number;

  @ApiProperty({ description: 'Total employees processed today' })
  employeesProcessedToday: number;

  @ApiProperty({ description: 'Total employees processed this week' })
  employeesProcessedWeek: number;

  @ApiProperty({ description: 'Total employees processed this month' })
  employeesProcessedMonth: number;

  @ApiProperty({ description: 'Success rate (last 24h) as percentage' })
  successRate24h: number;

  @ApiProperty({ description: 'Success rate (last 7d) as percentage' })
  successRate7d: number;

  @ApiProperty({ description: 'Success rate (last 30d) as percentage' })
  successRate30d: number;

  @ApiProperty({ description: 'API response time P95 (last 24h) in ms' })
  apiResponseTimeP95: number;

  @ApiProperty({ description: 'Database query time P95 (last 24h) in ms' })
  dbQueryTimeP95: number;

  @ApiProperty({ description: 'Performance by metric type', type: [AggregatedMetricsDto] })
  metricsByType: AggregatedMetricsDto[];
}

