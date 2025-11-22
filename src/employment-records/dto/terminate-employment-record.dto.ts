import { IsOptional, IsDateString, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TerminateEmploymentRecordDto {
  @ApiProperty({ description: 'Employment termination date', example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Reason for termination', maxLength: 500, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
