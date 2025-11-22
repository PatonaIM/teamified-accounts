import { ApiProperty } from '@nestjs/swagger';
import { SalaryHistoryResponseDto } from './salary-history-response.dto';

export class PaginatedSalaryHistoryResponseDto {
  @ApiProperty({
    description: 'Array of salary history records',
    type: [SalaryHistoryResponseDto],
  })
  items: SalaryHistoryResponseDto[];

  @ApiProperty({
    description: 'Total number of records matching the search criteria',
    example: 150,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Number of records returned in this response',
    example: 50,
  })
  pageSize: number;

  @ApiProperty({
    description: 'Current page number (0-indexed)',
    example: 0,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;
}
