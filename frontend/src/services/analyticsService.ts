import api from './api';

export interface FeatureUsage {
  feature: string;
  totalUsage: number;
  uniqueUsers: number;
  percentageOfTotal: number;
}

export interface AppUsage {
  appName: string;
  clientId: string;
  totalLogins: number;
  uniqueUsers: number;
  totalActions: number;
  topFeatures: FeatureUsage[];
}

export interface AppUsageAnalytics {
  appUsage: AppUsage[];
  platformTopFeatures: FeatureUsage[];
  totalFeatureUsage: number;
  dateRange: { start: string; end: string };
}

export interface HourlyLogin {
  hour: number;
  count: number;
  dayOfWeek: string;
}

export interface DailyLogin {
  date: string;
  count: number;
}

export interface LoginTrafficAnalytics {
  hourlyDistribution: HourlyLogin[];
  dailyTrend: DailyLogin[];
  peakHour: number;
  peakDay: string;
  totalLogins: number;
  averageLoginsPerDay: number;
  dateRange: { start: string; end: string };
}

export interface UserEngagement {
  userId: string;
  email: string;
  engagementScore: number;
  tier: 'inactive' | 'casual' | 'regular' | 'power_user';
  loginCount: number;
  actionCount: number;
  appsUsed: number;
  lastActiveAt: string;
}

export interface EngagementTierSummary {
  tier: string;
  count: number;
  percentage: number;
}

export interface UserEngagementAnalytics {
  tierDistribution: EngagementTierSummary[];
  topUsers: UserEngagement[];
  averageEngagementScore: number;
  totalActiveUsers: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface AppAdoptionFunnel {
  stages: FunnelStage[];
  overallConversionRate: number;
  dateRange: { start: string; end: string };
}

export interface OrganizationHealth {
  organizationId: string;
  name: string;
  memberCount: number;
  activeMembers: number;
  healthScore: number;
  status: 'healthy' | 'at_risk' | 'declining' | 'growing';
  weeklyActivityChange: number;
  lastActivityAt: string;
}

export interface OrganizationHealthAnalytics {
  organizations: OrganizationHealth[];
  healthyCount: number;
  atRiskCount: number;
  totalOrganizations: number;
}

export interface DeviceType {
  deviceType: string;
  count: number;
  percentage: number;
}

export interface SessionAnalytics {
  deviceDistribution: DeviceType[];
  activeSessions: number;
  averageSessionsPerUser: number;
  totalSessionsCreated: number;
}

export interface SecurityEvent {
  eventType: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
}

export interface AdminActionSummary {
  action: string;
  count: number;
  actorCount: number;
}

export interface SecurityAnalytics {
  securityEvents: SecurityEvent[];
  adminActions: AdminActionSummary[];
  totalAuditLogs: number;
  suspiciousActivityCount: number;
  dateRange: { start: string; end: string };
}

export interface InvitationStats {
  totalSent: number;
  totalAccepted: number;
  totalPending: number;
  totalExpired: number;
  acceptanceRate: number;
  averageTimeToAccept: number;
}

export interface TopInviter {
  userId: string;
  email: string;
  invitationsSent: number;
  acceptedCount: number;
}

export interface InvitationAnalytics {
  stats: InvitationStats;
  topInviters: TopInviter[];
  trendByDay: Array<{ date: string; sent: number; accepted: number }>;
  dateRange: { start: string; end: string };
}

export interface StickyFeature {
  feature: string;
  returnRate: number;
  usersReturned: number;
  totalUsers: number;
  averageUsagePerUser: number;
}

export interface FeatureStickinessAnalytics {
  stickyFeatures: StickyFeature[];
  overallReturnRate: number;
  averageFeatureDiscoveryDays: number;
}

export interface TimeToValueMetrics {
  averageDaysToFirstAction: number;
  averageDaysToSecondApp: number;
  usersActivatedIn24h: number;
  usersActivatedIn7d: number;
  activationRate: number;
  correlationWithRetention: number;
}

export interface ActivationCohort {
  cohort: string;
  totalUsers: number;
  activated: number;
  retained30Days: number;
}

export interface TimeToValueAnalytics {
  metrics: TimeToValueMetrics;
  cohorts: ActivationCohort[];
}

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

interface QueryParams {
  startDate?: string;
  endDate?: string;
  appId?: string;
}

const analyticsService = {
  async getAppUsageAnalytics(params?: QueryParams): Promise<AppUsageAnalytics> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/v1/analytics/platform/app-usage${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getLoginTrafficAnalytics(params?: QueryParams): Promise<LoginTrafficAnalytics> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/v1/analytics/platform/login-traffic${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getUserEngagementAnalytics(params?: QueryParams): Promise<UserEngagementAnalytics> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/v1/analytics/platform/user-engagement${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getAppAdoptionFunnel(params?: QueryParams): Promise<AppAdoptionFunnel> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/v1/analytics/platform/adoption-funnel${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getOrganizationHealth(params?: QueryParams): Promise<OrganizationHealthAnalytics> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/v1/analytics/platform/organization-health${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getSessionAnalytics(params?: QueryParams): Promise<SessionAnalytics> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/v1/analytics/platform/sessions${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getSecurityAnalytics(params?: QueryParams): Promise<SecurityAnalytics> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/v1/analytics/platform/security${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getInvitationAnalytics(params?: QueryParams): Promise<InvitationAnalytics> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/v1/analytics/platform/invitations${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getFeatureStickinessAnalytics(params?: QueryParams): Promise<FeatureStickinessAnalytics> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/v1/analytics/platform/feature-stickiness${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getTimeToValueAnalytics(params?: QueryParams): Promise<TimeToValueAnalytics> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/v1/analytics/platform/time-to-value${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async processAIQuery(query: string): Promise<AIAnalyticsResponse> {
    const response = await api.post('/v1/analytics/ai/query', { query });
    return response.data;
  },

  async getAISuggestions(): Promise<string[]> {
    const response = await api.get('/v1/analytics/ai/suggestions');
    return response.data;
  },
};

export default analyticsService;
