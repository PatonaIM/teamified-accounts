import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { UserAnalyticsResponseDto } from './dto/user-analytics-response.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('v1/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('users')
  @Roles('super_admin', 'internal_hr', 'client_admin')
  @ApiOperation({ summary: 'Get user analytics data' })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Filter by organization ID' })
  async getUserAnalytics(
    @Query('organizationId') organizationId?: string,
  ): Promise<UserAnalyticsResponseDto> {
    return this.analyticsService.getUserAnalytics(organizationId);
  }
}
