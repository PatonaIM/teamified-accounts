import { IsOptional, IsString, IsIn, Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryAuditLogsDto {
  @ApiProperty({
    description: 'Number of records to return',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit cannot exceed 50' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Opaque pagination cursor (base64 encoded)',
    required: false,
    example: 'eyJhdCI6IjIwMjQtMDEtMTVUMTA6MzA6MDAuMDAwWiIsImlkIjoiMTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwIn0='
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: 'Filter by action type',
    example: 'timesheet_submitted',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString({ message: 'Action must be a string' })
  action?: string;

  @ApiProperty({
    description: 'Filter by entity type',
    example: 'Timesheet',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString({ message: 'Entity type must be a string' })
  entityType?: string;

  @ApiProperty({
    description: 'Scope of audit logs to retrieve',
    example: 'self',
    required: false,
    enum: ['self', 'team', 'all'],
    default: 'self',
  })
  @IsOptional()
  @IsString({ message: 'Scope must be a string' })
  @IsIn(['self', 'team', 'all'], { message: 'Scope must be one of: self, team, all' })
  scope?: 'self' | 'team' | 'all' = 'self';
}

export class ActorUserDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;
}

export class AuditLogDto {
  @ApiProperty({
    description: 'Audit log ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Timestamp of the action',
    example: '2025-11-11T12:00:00.000Z',
  })
  at: Date;

  @ApiProperty({
    description: 'Actor user ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  actorUserId: string;

  @ApiProperty({
    description: 'Actor user details',
    type: ActorUserDto,
  })
  actorUser: ActorUserDto;

  @ApiProperty({
    description: 'Actor role at the time of action',
    example: 'admin',
  })
  actorRole: string;

  @ApiProperty({
    description: 'Action performed',
    example: 'timesheet_submitted',
  })
  action: string;

  @ApiProperty({
    description: 'Entity type',
    example: 'Timesheet',
  })
  entityType: string;

  @ApiProperty({
    description: 'Entity ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  entityId: string;

  @ApiProperty({
    description: 'Changes made (sanitized)',
    example: { status: 'submitted', hours: 40 },
    required: false,
  })
  changes?: Record<string, any>;

  @ApiProperty({
    description: 'IP address',
    example: '192.168.1.1',
    required: false,
  })
  ip?: string;

  @ApiProperty({
    description: 'User agent',
    example: 'Mozilla/5.0...',
    required: false,
  })
  userAgent?: string;
}

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'Array of audit log entries',
    type: [AuditLogDto],
  })
  data: AuditLogDto[];

  @ApiProperty({
    description: 'Next cursor for pagination (base64 encoded)',
    example: 'eyJhdCI6IjIwMjQtMDEtMTVUMTA6MzA6MDAuMDAwWiIsImlkIjoiMTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwIn0=',
    required: false,
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({
    description: 'Whether there are more results',
    example: true,
  })
  hasMore: boolean;
}
