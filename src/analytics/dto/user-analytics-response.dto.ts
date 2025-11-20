import { ApiProperty } from '@nestjs/swagger';

export class UserAnalyticsResponseDto {
  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Number of active users' })
  activeUsers: number;

  @ApiProperty({ description: 'Number of inactive users' })
  inactiveUsers: number;

  @ApiProperty({ description: 'Number of archived users' })
  archivedUsers: number;

  @ApiProperty({ description: 'Email verification rate percentage' })
  emailVerificationRate: number;

  @ApiProperty({ description: 'User distribution by role type' })
  roleDistribution: Array<{ roleType: string; count: number; percentage: number }>;

  @ApiProperty({ description: 'User growth over last 12 months' })
  userGrowth: Array<{ month: string; totalUsers: number; newUsers: number }>;

  @ApiProperty({ description: 'Daily registrations for last 30 days' })
  registrationTrend: Array<{ date: string; count: number }>;

  @ApiProperty({ description: 'Active vs inactive trend over last 6 months' })
  activeVsInactiveTrend: Array<{ month: string; active: number; inactive: number }>;

  @ApiProperty({ description: 'Top organizations by member count' })
  topOrganizations: Array<{ organizationId: string; name: string; memberCount: number }>;
}
