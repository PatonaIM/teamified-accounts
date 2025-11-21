import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items in this page',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    description: 'Total number of records matching the search criteria',
    example: 150,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Number of records per page',
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

  constructor(items: T[], totalCount: number, pageSize: number, currentPage: number) {
    this.items = items;
    this.totalCount = totalCount;
    this.pageSize = pageSize;
    this.currentPage = currentPage;
    this.totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
  }
}
