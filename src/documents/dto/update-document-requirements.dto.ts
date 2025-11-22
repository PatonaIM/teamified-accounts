import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class UpdateDocumentRequirementsDto {
  @ApiProperty({
    description: 'Number of CV documents required (0-10)',
    example: 1,
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  cvRequired: number;

  @ApiProperty({
    description: 'Number of identity documents required (0-10)',
    example: 1,
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  identityRequired: number;

  @ApiProperty({
    description: 'Number of employment documents required (0-10)',
    example: 1,
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  employmentRequired: number;

  @ApiProperty({
    description: 'Number of education documents required (0-10)',
    example: 1,
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  educationRequired: number;
}
