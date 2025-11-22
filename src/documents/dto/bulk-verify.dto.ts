import { IsString, IsNotEmpty, IsEnum, IsArray, ArrayMinSize, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationAction } from './verify-document.dto';

export class BulkVerifyDto {
  @ApiProperty({
    description: 'Array of document IDs to verify',
    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one document ID is required' })
  @IsString({ each: true })
  documentIds: string[];

  @ApiProperty({
    description: 'Verification action to perform on all documents',
    enum: VerificationAction,
    example: VerificationAction.APPROVE,
  })
  @IsEnum(VerificationAction)
  @IsNotEmpty()
  action: VerificationAction;

  @ApiProperty({
    description: 'Review notes applied to all documents (optional)',
    example: 'All documents verified successfully.',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes: string;
}
