import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// App Usage Analytics DTOs
export class FeatureUsageDto {
  @ApiProperty()
  feature: string;

  @ApiProperty()
  totalUsage: number;

  @ApiProperty()
  uniqueUsers: number;

  @ApiProperty()
  percentageOfTotal: number;
}

export class AppUsageDto {
  @ApiProperty()
  appName: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  totalLogins: number;

  @ApiProperty()
  uniqueUsers: number;

  @ApiProperty()
  totalActions: number;

  @ApiProperty({ type: [FeatureUsageDto] })
  topFeatures: FeatureUsageDto[];
}

export class AppUsageAnalyticsDto {
  @ApiProperty({ type: [AppUsageDto] })
  appUsage: AppUsageDto[];

  @ApiProperty({ type: [FeatureUsageDto] })
  platformTopFeatures: FeatureUsageDto[];

  @ApiProperty()
  totalFeatureUsage: number;

  @ApiProperty()
  dateRange: { start: string; end: string };
}

// Login Traffic Analytics DTOs
export class HourlyLoginDto {
  @ApiProperty()
  hour: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  dayOfWeek: string;
}

export class DailyLoginDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  count: number;
}

export class LoginTrafficAnalyticsDto {
  @ApiProperty({ type: [HourlyLoginDto] })
  hourlyDistribution: HourlyLoginDto[];

  @ApiProperty({ type: [DailyLoginDto] })
  dailyTrend: DailyLoginDto[];

  @ApiProperty()
  peakHour: number;

  @ApiProperty()
  peakDay: string;

  @ApiProperty()
  totalLogins: number;

  @ApiProperty()
  averageLoginsPerDay: number;

  @ApiProperty()
  dateRange: { start: string; end: string };
}

// User Engagement Score DTOs
export class UserEngagementDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  engagementScore: number;

  @ApiProperty()
  tier: 'inactive' | 'casual' | 'regular' | 'power_user';

  @ApiProperty()
  loginCount: number;

  @ApiProperty()
  actionCount: number;

  @ApiProperty()
  appsUsed: number;

  @ApiProperty()
  lastActiveAt: string;
}

export class EngagementTierSummaryDto {
  @ApiProperty()
  tier: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  percentage: number;
}

export class UserEngagementAnalyticsDto {
  @ApiProperty({ type: [EngagementTierSummaryDto] })
  tierDistribution: EngagementTierSummaryDto[];

  @ApiProperty({ type: [UserEngagementDto] })
  topUsers: UserEngagementDto[];

  @ApiProperty()
  averageEngagementScore: number;

  @ApiProperty()
  totalActiveUsers: number;
}

// App Adoption Funnel DTOs
export class FunnelStageDto {
  @ApiProperty()
  stage: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  conversionRate: number;

  @ApiProperty()
  dropOffRate: number;
}

export class AppAdoptionFunnelDto {
  @ApiProperty({ type: [FunnelStageDto] })
  stages: FunnelStageDto[];

  @ApiProperty()
  overallConversionRate: number;

  @ApiProperty()
  dateRange: { start: string; end: string };
}

// Organization Health DTOs
export class OrganizationHealthDto {
  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  memberCount: number;

  @ApiProperty()
  activeMembers: number;

  @ApiProperty()
  healthScore: number;

  @ApiProperty()
  status: 'healthy' | 'at_risk' | 'declining' | 'growing';

  @ApiProperty()
  weeklyActivityChange: number;

  @ApiProperty()
  lastActivityAt: string;
}

export class OrganizationHealthAnalyticsDto {
  @ApiProperty({ type: [OrganizationHealthDto] })
  organizations: OrganizationHealthDto[];

  @ApiProperty()
  healthyCount: number;

  @ApiProperty()
  atRiskCount: number;

  @ApiProperty()
  totalOrganizations: number;
}

// Session & Device Analytics DTOs
export class DeviceTypeDto {
  @ApiProperty()
  deviceType: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  percentage: number;
}

export class SessionAnalyticsDto {
  @ApiProperty({ type: [DeviceTypeDto] })
  deviceDistribution: DeviceTypeDto[];

  @ApiProperty()
  activeSessions: number;

  @ApiProperty()
  averageSessionsPerUser: number;

  @ApiProperty()
  totalSessionsCreated: number;
}

// Security & Compliance DTOs
export class SecurityEventDto {
  @ApiProperty()
  eventType: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  severity: 'low' | 'medium' | 'high';
}

export class AdminActionSummaryDto {
  @ApiProperty()
  action: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  actorCount: number;
}

export class SecurityAnalyticsDto {
  @ApiProperty({ type: [SecurityEventDto] })
  securityEvents: SecurityEventDto[];

  @ApiProperty({ type: [AdminActionSummaryDto] })
  adminActions: AdminActionSummaryDto[];

  @ApiProperty()
  totalAuditLogs: number;

  @ApiProperty()
  suspiciousActivityCount: number;

  @ApiProperty()
  dateRange: { start: string; end: string };
}

// Invitation & Growth Analytics DTOs
export class InvitationStatsDto {
  @ApiProperty()
  totalSent: number;

  @ApiProperty()
  totalAccepted: number;

  @ApiProperty()
  totalPending: number;

  @ApiProperty()
  totalExpired: number;

  @ApiProperty()
  acceptanceRate: number;

  @ApiProperty()
  averageTimeToAccept: number;
}

export class TopInviterDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  invitationsSent: number;

  @ApiProperty()
  acceptedCount: number;
}

export class InvitationAnalyticsDto {
  @ApiProperty()
  stats: InvitationStatsDto;

  @ApiProperty({ type: [TopInviterDto] })
  topInviters: TopInviterDto[];

  @ApiProperty()
  trendByDay: Array<{ date: string; sent: number; accepted: number }>;

  @ApiProperty()
  dateRange: { start: string; end: string };
}

// Feature Stickiness DTOs
export class StickyFeatureDto {
  @ApiProperty()
  feature: string;

  @ApiProperty()
  returnRate: number;

  @ApiProperty()
  usersReturned: number;

  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  averageUsagePerUser: number;
}

export class FeatureStickinessDto {
  @ApiProperty({ type: [StickyFeatureDto] })
  stickyFeatures: StickyFeatureDto[];

  @ApiProperty()
  overallReturnRate: number;

  @ApiProperty()
  averageFeatureDiscoveryDays: number;
}

// Time-to-Value DTOs
export class TimeToValueDto {
  @ApiProperty()
  averageDaysToFirstAction: number;

  @ApiProperty()
  averageDaysToSecondApp: number;

  @ApiProperty()
  usersActivatedIn24h: number;

  @ApiProperty()
  usersActivatedIn7d: number;

  @ApiProperty()
  activationRate: number;

  @ApiProperty()
  correlationWithRetention: number;
}

export class ActivationCohortDto {
  @ApiProperty()
  cohort: string;

  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activated: number;

  @ApiProperty()
  retained30Days: number;
}

export class TimeToValueAnalyticsDto {
  @ApiProperty()
  metrics: TimeToValueDto;

  @ApiProperty({ type: [ActivationCohortDto] })
  cohorts: ActivationCohortDto[];
}

// Query Parameters DTO
export class AnalyticsQueryDto {
  @ApiPropertyOptional()
  startDate?: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiPropertyOptional()
  organizationId?: string;

  @ApiPropertyOptional()
  appId?: string;
}
