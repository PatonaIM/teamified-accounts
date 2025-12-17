import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PlatformAnalyticsService } from './platform-analytics.service';
import {
  AppUsageAnalyticsDto,
  LoginTrafficAnalyticsDto,
  UserEngagementAnalyticsDto,
  AppAdoptionFunnelDto,
  OrganizationHealthAnalyticsDto,
  SessionAnalyticsDto,
  SecurityAnalyticsDto,
  InvitationAnalyticsDto,
  FeatureStickinessDto,
  TimeToValueAnalyticsDto,
  AnalyticsQueryDto,
} from './dto/platform-analytics.dto';

@ApiTags('Platform Analytics')
@ApiBearerAuth()
@Controller('v1/analytics/platform')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'internal_hr')
export class PlatformAnalyticsController {
  constructor(private readonly platformAnalyticsService: PlatformAnalyticsService) {}

  @Get('app-usage')
  @ApiOperation({ summary: 'Get app and feature usage analytics across all users' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'appId', required: false, description: 'Filter by specific app' })
  async getAppUsageAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('appId') appId?: string,
  ): Promise<AppUsageAnalyticsDto> {
    return this.platformAnalyticsService.getAppUsageAnalytics({ startDate, endDate, appId });
  }

  @Get('login-traffic')
  @ApiOperation({ summary: 'Get login traffic patterns and trends' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  async getLoginTrafficAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<LoginTrafficAnalyticsDto> {
    return this.platformAnalyticsService.getLoginTrafficAnalytics({ startDate, endDate });
  }

  @Get('user-engagement')
  @ApiOperation({ summary: 'Get user engagement scores and tier distribution' })
  async getUserEngagementAnalytics(): Promise<UserEngagementAnalyticsDto> {
    return this.platformAnalyticsService.getUserEngagementAnalytics({});
  }

  @Get('adoption-funnel')
  @ApiOperation({ summary: 'Get app adoption funnel from registration to active usage' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  async getAppAdoptionFunnel(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<AppAdoptionFunnelDto> {
    return this.platformAnalyticsService.getAppAdoptionFunnel({ startDate, endDate });
  }

  @Get('organization-health')
  @ApiOperation({ summary: 'Get organization health metrics and status' })
  async getOrganizationHealth(): Promise<OrganizationHealthAnalyticsDto> {
    return this.platformAnalyticsService.getOrganizationHealth({});
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get session and device analytics' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  async getSessionAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SessionAnalyticsDto> {
    return this.platformAnalyticsService.getSessionAnalytics({ startDate, endDate });
  }

  @Get('security')
  @ApiOperation({ summary: 'Get security events and admin action audit' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  async getSecurityAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SecurityAnalyticsDto> {
    return this.platformAnalyticsService.getSecurityAnalytics({ startDate, endDate });
  }

  @Get('invitations')
  @ApiOperation({ summary: 'Get invitation and growth analytics' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  async getInvitationAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<InvitationAnalyticsDto> {
    return this.platformAnalyticsService.getInvitationAnalytics({ startDate, endDate });
  }

  @Get('feature-stickiness')
  @ApiOperation({ summary: 'Get feature stickiness and return rate analytics' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  async getFeatureStickiness(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<FeatureStickinessDto> {
    return this.platformAnalyticsService.getFeatureStickiness({ startDate, endDate });
  }

  @Get('time-to-value')
  @ApiOperation({ summary: 'Get time-to-value and activation metrics' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  async getTimeToValue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TimeToValueAnalyticsDto> {
    return this.platformAnalyticsService.getTimeToValue({ startDate, endDate });
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all analytics data for AI processing' })
  async getAllAnalyticsData(): Promise<Record<string, any>> {
    return this.platformAnalyticsService.getAllAnalyticsData();
  }
}
