import { ApiProperty } from '@nestjs/swagger';

export class ClientStatisticsDto {
  @ApiProperty({
    description: 'Total number of clients',
    example: 50
  })
  totalClients: number;

  @ApiProperty({
    description: 'Number of active clients',
    example: 45
  })
  activeClients: number;

  @ApiProperty({
    description: 'Number of inactive clients',
    example: 5
  })
  inactiveClients: number;

  @ApiProperty({
    description: 'Total number of users across all clients',
    example: 250
  })
  totalUsers: number;
}
