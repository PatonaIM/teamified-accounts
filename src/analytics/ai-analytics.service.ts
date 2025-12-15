import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PlatformAnalyticsService } from './platform-analytics.service';

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'table' | 'funnel' | 'heatmap';
  title: string;
  data: any[];
  xKey?: string;
  yKey?: string;
  keys?: string[];
  colors?: string[];
}

export interface AIAnalyticsResponse {
  summary: string;
  charts: ChartConfig[];
  insights: string[];
  rawData?: any;
}

@Injectable()
export class AIAnalyticsService {
  private readonly logger = new Logger(AIAnalyticsService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly platformAnalyticsService: PlatformAnalyticsService,
  ) {
    const apiKey = this.configService.get<string>('OPEN_AI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OPEN_AI_API_KEY not configured - AI analytics will be unavailable');
    }
  }

  async processQuery(query: string): Promise<AIAnalyticsResponse> {
    if (!this.openai) {
      return {
        summary: 'AI analytics is not configured. Please add the OPEN_AI_API_KEY secret.',
        charts: [],
        insights: ['AI features require OpenAI API key configuration.'],
      };
    }

    try {
      const analyticsData = await this.platformAnalyticsService.getAllAnalyticsData();

      const systemPrompt = `You are an analytics assistant for the Teamified platform. You have access to platform analytics data and can help administrators understand their data.

Available data includes:
- App Usage: Which apps are used most, feature usage across all users
- Login Traffic: Login patterns by hour and day, peak times
- User Engagement: Engagement scores, tier distribution (inactive/casual/regular/power_user)
- Adoption Funnel: Registration to active usage conversion rates
- Organization Health: Member counts, activity levels, health status
- Sessions: Device types, active sessions, session counts
- Security: Audit logs, admin actions, security events
- Invitations: Sent/accepted rates, top inviters
- Feature Stickiness: Which features drive return visits
- Time to Value: How quickly users become active

When responding:
1. Provide a clear summary answering the user's question
2. Suggest relevant charts to visualize the data
3. Include actionable insights

For charts, use this JSON format:
{
  "type": "bar|line|pie|area|table|funnel",
  "title": "Chart Title",
  "data": [{ "name": "Label", "value": 123 }],
  "xKey": "name",
  "yKey": "value",
  "keys": ["key1", "key2"] // for multi-series charts
}

Respond in JSON format:
{
  "summary": "Your analysis summary",
  "charts": [...chart configs],
  "insights": ["Insight 1", "Insight 2"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Here is the current analytics data:\n${JSON.stringify(analyticsData, null, 2)}\n\nUser question: ${query}` 
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      
      return {
        summary: parsed.summary || 'Analysis complete.',
        charts: Array.isArray(parsed.charts) ? parsed.charts : [],
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      };
    } catch (error) {
      this.logger.error('AI analytics query failed', error);
      return {
        summary: 'Unable to process your query. Please try rephrasing or ask a different question.',
        charts: [],
        insights: ['Error processing query. Check if the question is related to available analytics data.'],
      };
    }
  }

  async getSuggestedQueries(): Promise<string[]> {
    return [
      'Which app has the highest engagement this month?',
      'Show me login patterns by time of day',
      'What is our user adoption funnel conversion rate?',
      'Which features are most popular across all apps?',
      'How many organizations are at risk of churning?',
      'What is the average time for new users to take their first action?',
      'Show me the device distribution of our users',
      'Who are our top 10 power users?',
      'What is our invitation acceptance rate?',
      'Which features have the best retention?',
    ];
  }
}
