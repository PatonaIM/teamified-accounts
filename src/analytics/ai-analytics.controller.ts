import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AIAnalyticsService, AIAnalyticsResponse } from './ai-analytics.service';

class AIQueryDto {
  query: string;
}

@ApiTags('AI Analytics')
@ApiBearerAuth()
@Controller('v1/analytics/ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'internal_hr')
export class AIAnalyticsController {
  constructor(private readonly aiAnalyticsService: AIAnalyticsService) {}

  @Post('query')
  @ApiOperation({ summary: 'Process natural language analytics query with AI' })
  @ApiBody({ type: AIQueryDto })
  async processQuery(@Body() body: AIQueryDto): Promise<AIAnalyticsResponse> {
    return this.aiAnalyticsService.processQuery(body.query);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get suggested analytics queries' })
  async getSuggestedQueries(): Promise<string[]> {
    return this.aiAnalyticsService.getSuggestedQueries();
  }
}
