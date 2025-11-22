import { ApiProperty } from '@nestjs/swagger';
import { Client } from '../entities/client.entity';
import { ClientStatisticsDto } from './client-statistics.dto';

export class PaginationInfo {
  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 50
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3
  })
  totalPages: number;
}

export class ClientListResponseDto {
  @ApiProperty({
    description: 'List of clients',
    type: [Client]
  })
  clients: Client[];

  @ApiProperty({
    description: 'Client statistics',
    type: ClientStatisticsDto
  })
  statistics: ClientStatisticsDto;

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationInfo
  })
  pagination: PaginationInfo;
}
