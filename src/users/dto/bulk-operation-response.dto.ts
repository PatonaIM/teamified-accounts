import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkOperationResult {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Error message if operation failed',
    example: 'User not found'
  })
  error?: string;
}

export class BulkOperationResponseDto {
  @ApiProperty({
    description: 'Number of users successfully processed',
    example: 8
  })
  processed: number;

  @ApiProperty({
    description: 'Number of users that failed to process',
    example: 2
  })
  failed: number;

  @ApiProperty({
    description: 'Detailed results for each user',
    type: [BulkOperationResult]
  })
  results: BulkOperationResult[];
}
