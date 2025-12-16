import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  AutoAwesome as AIIcon,
  TrendingUp,
  People,
  Devices,
  Security,
  Mail,
  Timeline,
  Speed,
  Business,
  Refresh,
  Apps,
  Login as LoginIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList,
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import type {
  AppUsageAnalytics,
  LoginTrafficAnalytics,
  UserEngagementAnalytics,
  AppAdoptionFunnel,
  OrganizationHealthAnalytics,
  SessionAnalytics,
  SecurityAnalytics,
  InvitationAnalytics,
  FeatureStickinessAnalytics,
  TimeToValueAnalytics,
  AIAnalyticsResponse,
  ChartConfig,
} from '../../services/analyticsService';

const COLORS = ['#A16AE8', '#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

type DateRangePreset = 
  | '15m' | '30m' | '1h' | '3h' | '6h' | '12h' | '24h' | '3d' | '1w' | '30d' | 'custom';

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: '15m', label: 'Last 15 mins' },
  { value: '30m', label: 'Last 30 mins' },
  { value: '1h', label: 'Last 1 hour' },
  { value: '3h', label: 'Last 3 hours' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '12h', label: 'Last 12 hours' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: '1w', label: 'Last 1 week' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom Range' },
];

function getDateRangeFromPreset(preset: DateRangePreset): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString();
  let startDate: Date;

  switch (preset) {
    case '15m': startDate = new Date(now.getTime() - 15 * 60 * 1000); break;
    case '30m': startDate = new Date(now.getTime() - 30 * 60 * 1000); break;
    case '1h': startDate = new Date(now.getTime() - 60 * 60 * 1000); break;
    case '3h': startDate = new Date(now.getTime() - 3 * 60 * 60 * 1000); break;
    case '6h': startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000); break;
    case '12h': startDate = new Date(now.getTime() - 12 * 60 * 60 * 1000); break;
    case '24h': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
    case '3d': startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); break;
    case '1w': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
    case '30d': default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
  }

  return { startDate: startDate.toISOString(), endDate };
}

interface DateRangeFilterProps {
  value: DateRangePreset;
  onChange: (preset: DateRangePreset, range: { startDate: string; endDate: string }) => void;
  customStart?: string;
  customEnd?: string;
  onCustomChange?: (start: string, end: string) => void;
}

function DateRangeFilter({ value, onChange, customStart, customEnd, onCustomChange }: DateRangeFilterProps) {
  const handlePresetChange = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      onChange(preset, { 
        startDate: customStart || weekAgo.toISOString().split('T')[0], 
        endDate: customEnd || now.toISOString().split('T')[0] 
      });
    } else {
      onChange(preset, getDateRangeFromPreset(preset));
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DateRangeIcon color="action" />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={value}
            label="Date Range"
            onChange={(e) => handlePresetChange(e.target.value as DateRangePreset)}
          >
            {DATE_RANGE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {value === 'custom' && onCustomChange && (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            size="small"
            label="Start Date"
            value={customStart || ''}
            onChange={(e) => onCustomChange(e.target.value, customEnd || '')}
            InputLabelProps={{ shrink: true }}
          />
          <Typography variant="body2" color="text.secondary">to</Typography>
          <TextField
            type="date"
            size="small"
            label="End Date"
            value={customEnd || ''}
            onChange={(e) => onCustomChange(customStart || '', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      )}
    </Box>
  );
}

function StatCard({ title, value, subtitle, icon, color = '#A16AE8' }: { title: string; value: string | number; subtitle?: string; icon: React.ReactNode; color?: string }) {
  return (
    <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}20`, color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function DynamicChart({ config }: { config: ChartConfig }) {
  const { type, title, data, xKey = 'name', yKey = 'value', keys = [], colors = COLORS } = config;

  return (
    <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer>
            {type === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {keys.length > 0 ? keys.map((key, i) => (
                  <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
                )) : (
                  <Bar dataKey={yKey} fill={colors[0]} />
                )}
              </BarChart>
            ) : type === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {keys.length > 0 ? keys.map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} />
                )) : (
                  <Line type="monotone" dataKey={yKey} stroke={colors[0]} />
                )}
              </LineChart>
            ) : type === 'area' ? (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey={yKey} fill={colors[0]} stroke={colors[0]} />
              </AreaChart>
            ) : type === 'pie' ? (
              <PieChart>
                <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={100} label>
                  {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey={yKey} fill={colors[0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

function AIAnalyticsSection() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalyticsResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsService.getAISuggestions().then(setSuggestions).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.processAIQuery(query);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AIIcon color="primary" />
          <Typography variant="h6">AI-Powered Analytics</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ask questions about your platform data in natural language and get insights with visualizations.
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            placeholder="e.g., Which app has the highest engagement this month?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </form>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {suggestions.slice(0, 5).map((s, i) => (
            <Chip
              key={i}
              label={s}
              size="small"
              onClick={() => { setQuery(s); }}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading && (
        <Paper sx={{ p: 4, mb: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            >
              <AIIcon 
                sx={{ 
                  fontSize: 32, 
                  color: 'primary.main',
                  animation: 'sparkle 1.2s ease-in-out infinite',
                  '@keyframes sparkle': {
                    '0%, 100%': { transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' },
                    '25%': { transform: 'scale(1.1) rotate(5deg)', filter: 'brightness(1.3)' },
                    '50%': { transform: 'scale(1) rotate(0deg)', filter: 'brightness(1.5)' },
                    '75%': { transform: 'scale(1.1) rotate(-5deg)', filter: 'brightness(1.3)' },
                  },
                }} 
              />
              <Typography variant="h6" color="primary">
                Analyzing your data...
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    animation: 'bounce 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.16}s`,
                    '@keyframes bounce': {
                      '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.5 },
                      '40%': { transform: 'scale(1)', opacity: 1 },
                    },
                  }}
                />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              AI is processing your query and generating insights...
            </Typography>
          </Box>
        </Paper>
      )}

      {!loading && result && (
        <Box>
          <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Summary</Typography>
            <Typography>{result.summary}</Typography>
          </Paper>

          {result.charts.map((chart, i) => (
            <DynamicChart key={i} config={chart} />
          ))}

          {result.insights.length > 0 && (
            <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>Insights</Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {result.insights.map((insight, i) => (
                  <li key={i}><Typography variant="body2">{insight}</Typography></li>
                ))}
              </ul>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}

function AppUsageSection() {
  const [data, setData] = useState<AppUsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState<DateRangePreset>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchData = (startDate?: string, endDate?: string) => {
    setLoading(true);
    analyticsService.getAppUsageAnalytics({ startDate, endDate })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const range = getDateRangeFromPreset('30d');
    fetchData(range.startDate, range.endDate);
  }, []);

  const handleDateChange = (preset: DateRangePreset, range: { startDate: string; endDate: string }) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      fetchData(range.startDate, range.endDate);
    }
  };

  const handleCustomChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    if (start && end) {
      fetchData(new Date(start).toISOString(), new Date(end + 'T23:59:59').toISOString());
    }
  };

  return (
    <Box>
      <DateRangeFilter
        value={datePreset}
        onChange={handleDateChange}
        customStart={customStart}
        customEnd={customEnd}
        onCustomChange={handleCustomChange}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : !data ? (
        <Alert severity="error">Failed to load data</Alert>
      ) : (
      <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Total Feature Usage" value={data.totalFeatureUsage.toLocaleString()} icon={<Apps />} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Apps Tracked" value={data.appUsage.length} icon={<Devices />} color="#6366F1" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Top Features" value={data.platformTopFeatures.length} icon={<TrendingUp />} color="#22C55E" />
        </Grid>
      </Grid>

      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Platform Top Features</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.platformTopFeatures.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="feature" type="category" width={150} />
                <RechartsTooltip />
                <Bar dataKey="totalUsage" fill="#A16AE8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>App Usage Summary</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>App Name</TableCell>
                  <TableCell align="right">Total Logins</TableCell>
                  <TableCell align="right">Unique Users</TableCell>
                  <TableCell align="right">Total Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.appUsage.map((app) => (
                  <TableRow key={app.clientId}>
                    <TableCell>{app.appName}</TableCell>
                    <TableCell align="right">{app.totalLogins.toLocaleString()}</TableCell>
                    <TableCell align="right">{app.uniqueUsers.toLocaleString()}</TableCell>
                    <TableCell align="right">{app.totalActions.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      </>
      )}
    </Box>
  );
}

function LoginTrafficSection() {
  const [data, setData] = useState<LoginTrafficAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState<DateRangePreset>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchData = (startDate?: string, endDate?: string) => {
    setLoading(true);
    analyticsService.getLoginTrafficAnalytics({ startDate, endDate })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const range = getDateRangeFromPreset('30d');
    fetchData(range.startDate, range.endDate);
  }, []);

  const handleDateChange = (preset: DateRangePreset, range: { startDate: string; endDate: string }) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      fetchData(range.startDate, range.endDate);
    }
  };

  const handleCustomChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    if (start && end) {
      fetchData(new Date(start).toISOString(), new Date(end + 'T23:59:59').toISOString());
    }
  };

  return (
    <Box>
      <DateRangeFilter
        value={datePreset}
        onChange={handleDateChange}
        customStart={customStart}
        customEnd={customEnd}
        onCustomChange={handleCustomChange}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : !data ? (
        <Alert severity="error">Failed to load data</Alert>
      ) : (
      <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Logins" value={data.totalLogins.toLocaleString()} icon={<LoginIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Avg/Day" value={data.averageLoginsPerDay} icon={<Timeline />} color="#6366F1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Peak Hour" value={`${data.peakHour}:00`} icon={<Speed />} color="#22C55E" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Peak Day" value={data.peakDay} icon={<TrendingUp />} color="#F59E0B" />
        </Grid>
      </Grid>

      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Login Trend</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="count" fill="#A16AE8" stroke="#A16AE8" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Logins by Hour</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
      </>
      )}
    </Box>
  );
}

function UserEngagementSection() {
  const [data, setData] = useState<UserEngagementAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getUserEngagementAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Failed to load data</Alert>;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Active Users" value={data.totalActiveUsers} icon={<People />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Avg Score" value={data.averageEngagementScore} icon={<TrendingUp />} color="#6366F1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Power Users" value={data.tierDistribution.find(t => t.tier === 'Power User')?.count || 0} icon={<Speed />} color="#22C55E" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="At Risk" value={data.tierDistribution.find(t => t.tier === 'Inactive')?.count || 0} icon={<People />} color="#EF4444" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Engagement Tiers</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.tierDistribution} dataKey="count" nameKey="tier" cx="50%" cy="50%" outerRadius={100} label>
                      {data.tierDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Power Users</Typography>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Score</TableCell>
                      <TableCell align="right">Logins</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.topUsers.slice(0, 10).map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell align="right">
                          <Chip label={user.engagementScore} size="small" color={user.tier === 'power_user' ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell align="right">{user.loginCount}</TableCell>
                        <TableCell align="right">{user.actionCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function AdoptionFunnelSection() {
  const [data, setData] = useState<AppAdoptionFunnel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAppAdoptionFunnel().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Failed to load data</Alert>;

  return (
    <Box>
      <StatCard title="Overall Conversion Rate" value={`${data.overallConversionRate}%`} subtitle="From registration to active usage" icon={<TrendingUp />} />
      
      <Card sx={{ mt: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Adoption Funnel</Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={data.stages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={120} />
                <RechartsTooltip formatter={(value, name) => [value, name === 'count' ? 'Users' : name]} />
                <Bar dataKey="count" fill="#A16AE8">
                  <LabelList dataKey="conversionRate" position="right" formatter={(v: number) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Stage Details</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stage</TableCell>
                  <TableCell align="right">Users</TableCell>
                  <TableCell align="right">Conversion Rate</TableCell>
                  <TableCell align="right">Drop-off Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.stages.map((stage) => (
                  <TableRow key={stage.stage}>
                    <TableCell>{stage.stage}</TableCell>
                    <TableCell align="right">{stage.count.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Chip label={`${stage.conversionRate}%`} size="small" color="primary" />
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={`${stage.dropOffRate}%`} size="small" color={stage.dropOffRate > 30 ? 'error' : 'default'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

function OrganizationHealthSection() {
  const [data, setData] = useState<OrganizationHealthAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getOrganizationHealth().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Failed to load data</Alert>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'growing': return 'info';
      case 'at_risk': return 'warning';
      case 'declining': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Total Organizations" value={data.totalOrganizations} icon={<Business />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Healthy" value={data.healthyCount} icon={<TrendingUp />} color="#22C55E" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="At Risk" value={data.atRiskCount} icon={<Security />} color="#EF4444" />
        </Grid>
      </Grid>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Organization Health Status</Typography>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Organization</TableCell>
                  <TableCell align="right">Members</TableCell>
                  <TableCell align="right">Active</TableCell>
                  <TableCell align="center">Health Score</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.organizations.map((org) => (
                  <TableRow key={org.organizationId}>
                    <TableCell>{org.name}</TableCell>
                    <TableCell align="right">{org.memberCount}</TableCell>
                    <TableCell align="right">{org.activeMembers}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={org.healthScore}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color={org.healthScore >= 70 ? 'success' : org.healthScore >= 40 ? 'warning' : 'error'}
                        />
                        <Typography variant="body2">{org.healthScore}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={org.status.replace('_', ' ')} size="small" color={getStatusColor(org.status)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

function SessionDeviceSection() {
  const [data, setData] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getSessionAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Failed to load data</Alert>;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Active Sessions" value={data.activeSessions} icon={<Devices />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Sessions Created" value={data.totalSessionsCreated} icon={<Timeline />} color="#6366F1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Avg Sessions/User" value={data.averageSessionsPerUser} icon={<People />} color="#22C55E" />
        </Grid>
      </Grid>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Device Distribution</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.deviceDistribution} dataKey="count" nameKey="deviceType" cx="50%" cy="50%" outerRadius={100} label>
                  {data.deviceDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function SecuritySection() {
  const [data, setData] = useState<SecurityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getSecurityAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Failed to load data</Alert>;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Total Audit Logs" value={data.totalAuditLogs} icon={<Security />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Suspicious Activity" value={data.suspiciousActivityCount} icon={<Security />} color="#EF4444" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Admin Actions" value={data.adminActions.length} icon={<People />} color="#6366F1" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Security Events</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Event Type</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="center">Severity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.securityEvents.map((event) => (
                      <TableRow key={event.eventType}>
                        <TableCell>{event.eventType}</TableCell>
                        <TableCell align="right">{event.count}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={event.severity}
                            size="small"
                            color={event.severity === 'high' ? 'error' : event.severity === 'medium' ? 'warning' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Admin Actions</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Actors</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.adminActions.slice(0, 10).map((action) => (
                      <TableRow key={action.action}>
                        <TableCell>{action.action}</TableCell>
                        <TableCell align="right">{action.count}</TableCell>
                        <TableCell align="right">{action.actorCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function InvitationSection() {
  const [data, setData] = useState<InvitationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getInvitationAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Failed to load data</Alert>;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Sent" value={data.stats.totalSent} icon={<Mail />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Accepted" value={data.stats.totalAccepted} icon={<TrendingUp />} color="#22C55E" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Acceptance Rate" value={`${data.stats.acceptanceRate}%`} icon={<Speed />} color="#6366F1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Pending" value={data.stats.totalPending} icon={<Timeline />} color="#F59E0B" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Invitation Trend</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={data.trendByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="sent" fill="#A16AE8" name="Sent" />
                    <Bar dataKey="accepted" fill="#22C55E" name="Accepted" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Inviters</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Sent</TableCell>
                      <TableCell align="right">Accepted</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.topInviters.map((inviter) => (
                      <TableRow key={inviter.userId}>
                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{inviter.email}</TableCell>
                        <TableCell align="right">{inviter.invitationsSent}</TableCell>
                        <TableCell align="right">{inviter.acceptedCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function FeatureStickinessSection() {
  const [data, setData] = useState<FeatureStickinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getFeatureStickinessAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Failed to load data</Alert>;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Overall Return Rate" value={`${data.overallReturnRate}%`} icon={<TrendingUp />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Avg Discovery Days" value={data.averageFeatureDiscoveryDays} icon={<Timeline />} color="#6366F1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Sticky Features" value={data.stickyFeatures.length} icon={<Speed />} color="#22C55E" />
        </Grid>
      </Grid>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Feature Stickiness</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell align="right">Return Rate</TableCell>
                  <TableCell align="right">Users Returned</TableCell>
                  <TableCell align="right">Total Users</TableCell>
                  <TableCell align="right">Avg Usage/User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.stickyFeatures.map((feature) => (
                  <TableRow key={feature.feature}>
                    <TableCell>{feature.feature}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                        <LinearProgress
                          variant="determinate"
                          value={feature.returnRate}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                          color={feature.returnRate >= 50 ? 'success' : 'warning'}
                        />
                        <Typography variant="body2">{feature.returnRate}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{feature.usersReturned}</TableCell>
                    <TableCell align="right">{feature.totalUsers}</TableCell>
                    <TableCell align="right">{feature.averageUsagePerUser}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

function TimeToValueSection() {
  const [data, setData] = useState<TimeToValueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getTimeToValueAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Failed to load data</Alert>;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Avg Days to First Action" value={data.metrics.averageDaysToFirstAction} icon={<Speed />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Activation Rate" value={`${data.metrics.activationRate}%`} icon={<TrendingUp />} color="#22C55E" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Activated in 24h" value={data.metrics.usersActivatedIn24h} icon={<Timeline />} color="#6366F1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Activated in 7d" value={data.metrics.usersActivatedIn7d} icon={<People />} color="#F59E0B" />
        </Grid>
      </Grid>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Activation Cohorts</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.cohorts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="totalUsers" fill="#A16AE8" name="Total Users" />
                <Bar dataKey="activated" fill="#22C55E" name="Activated" />
                <Bar dataKey="retained30Days" fill="#6366F1" name="Retained 30 Days" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function AnalyticsReportsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'AI Search', icon: <AIIcon /> },
    { label: 'App Usage', icon: <Apps /> },
    { label: 'Login Traffic', icon: <LoginIcon /> },
    { label: 'Engagement', icon: <People /> },
    { label: 'Adoption', icon: <TrendingUp /> },
    { label: 'Org Health', icon: <Business /> },
    { label: 'Sessions', icon: <Devices /> },
    { label: 'Security', icon: <Security /> },
    { label: 'Invitations', icon: <Mail /> },
    { label: 'Stickiness', icon: <Speed /> },
    { label: 'Time-to-Value', icon: <Timeline /> },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Analytics & Reports</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Platform-wide analytics across all apps using Teamified Accounts
      </Typography>

      <Paper sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          {tabs.map((tab, i) => (
            <Tab key={i} label={tab.label} icon={tab.icon} iconPosition="start" sx={{ minHeight: 48 }} />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}><AIAnalyticsSection /></TabPanel>
          <TabPanel value={activeTab} index={1}><AppUsageSection /></TabPanel>
          <TabPanel value={activeTab} index={2}><LoginTrafficSection /></TabPanel>
          <TabPanel value={activeTab} index={3}><UserEngagementSection /></TabPanel>
          <TabPanel value={activeTab} index={4}><AdoptionFunnelSection /></TabPanel>
          <TabPanel value={activeTab} index={5}><OrganizationHealthSection /></TabPanel>
          <TabPanel value={activeTab} index={6}><SessionDeviceSection /></TabPanel>
          <TabPanel value={activeTab} index={7}><SecuritySection /></TabPanel>
          <TabPanel value={activeTab} index={8}><InvitationSection /></TabPanel>
          <TabPanel value={activeTab} index={9}><FeatureStickinessSection /></TabPanel>
          <TabPanel value={activeTab} index={10}><TimeToValueSection /></TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}
