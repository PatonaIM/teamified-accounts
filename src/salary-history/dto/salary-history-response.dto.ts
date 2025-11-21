import { ApiProperty } from '@nestjs/swagger';

export class SalaryHistoryResponseDto {
  @ApiProperty({
    description: 'Salary history record ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Employment record ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  employmentRecordId: string;

  @ApiProperty({
    description: 'Salary amount',
    example: 75000.00,
  })
  salaryAmount: number;

  @ApiProperty({
    description: 'Salary currency code',
    example: 'USD',
  })
  salaryCurrency: string;

  @ApiProperty({
    description: 'Effective date for the salary change',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  effectiveDate: Date;

  @ApiProperty({
    description: 'Reason for the salary change',
    example: 'Annual performance review',
  })
  changeReason: string;

  @ApiProperty({
    description: 'User ID who made the change',
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  changedBy: string | null;

  @ApiProperty({
    description: 'Full name of the user who made the change',
    example: 'John Smith',
    nullable: true,
  })
  changedByName: string | null;

  @ApiProperty({
    description: 'Employee name (from employment record)',
    example: 'Jane Doe',
    nullable: true,
  })
  employeeName: string | null;

  @ApiProperty({
    description: 'Employee role/position (from employment record)',
    example: 'Software Engineer',
    nullable: true,
  })
  employeeRole: string | null;

  @ApiProperty({
    description: 'Employment status',
    example: 'active',
    nullable: true,
  })
  employmentStatus: string | null;

  @ApiProperty({
    description: 'Whether this is a scheduled salary change (future effective date)',
    example: false,
  })
  isScheduled: boolean;

  @ApiProperty({
    description: 'Whether this record was migrated from Zoho',
    example: false,
  })
  migratedFromZoho: boolean;

  @ApiProperty({
    description: 'Original Zoho salary ID (if migrated)',
    example: 'ZOHO_SALARY_123',
    nullable: true,
  })
  zohoSalaryId: string | null;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
