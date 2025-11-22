import { ApiProperty } from '@nestjs/swagger';

export class DocumentRequirementsResponseDto {
  @ApiProperty({ description: 'Configuration ID' })
  id: string;

  @ApiProperty({ description: 'Number of CV documents required', example: 1 })
  cvRequired: number;

  @ApiProperty({ description: 'Number of identity documents required', example: 1 })
  identityRequired: number;

  @ApiProperty({ description: 'Number of employment documents required', example: 1 })
  employmentRequired: number;

  @ApiProperty({ description: 'Number of education documents required', example: 1 })
  educationRequired: number;

  @ApiProperty({ description: 'User ID who last updated the configuration', nullable: true })
  updatedBy: string | null;

  @ApiProperty({ description: 'Configuration creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Configuration last update timestamp' })
  updatedAt: Date;
}
