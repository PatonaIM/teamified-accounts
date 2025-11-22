import { ApiProperty } from '@nestjs/swagger';
import { SalaryHistoryResponseDto } from './salary-history-response.dto';

export class SalaryStatisticsDto {
  @ApiProperty({
    description: 'Average current salary across all active employment records',
    example: 75000.00,
  })
  averageSalary: number;

  @ApiProperty({
    description: 'Count of active employment records',
    example: 3,
  })
  totalActiveRecords: number;

  @ApiProperty({
    description: 'Sum of all current salaries for active employment records',
    example: 225000.00,
  })
  totalSalaries: number;
}

export class SalaryReportResponseDto {
  @ApiProperty({
    description: 'Employment record ID (null for user reports)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  employmentId: string | null;

  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  userId: string;

  @ApiProperty({
    description: 'Client ID (null for user reports)',
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  clientId: string | null;

  @ApiProperty({
    description: 'Current active salary',
    type: SalaryHistoryResponseDto,
    nullable: true,
  })
  currentSalary: SalaryHistoryResponseDto | null;

  @ApiProperty({
    description: 'Complete salary history (sorted by effective date descending)',
    type: [SalaryHistoryResponseDto],
  })
  salaryHistory: SalaryHistoryResponseDto[];

  @ApiProperty({
    description: 'Salary statistics and analytics',
    type: SalaryStatisticsDto,
  })
  statistics: SalaryStatisticsDto;

  @ApiProperty({
    description: 'Report generation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  generatedAt: Date;
}
