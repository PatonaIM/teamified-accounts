/**
 * Monitoring Dashboard Tab Component
 * Real-time metrics and performance analytics
 * Story 7.8 - Payroll Administration
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import PerformanceMetricsCard from './PerformanceMetricsCard';
import type { SystemPerformanceDashboard } from '../../types/payroll-admin/payrollAdmin.types';
import { getMonitoringDashboard, formatDuration } from '../../services/payroll-admin/payrollAdminService';

const MonitoringDashboardTab: React.FC = () => {
  const [dashboard, setDashboard] = useState<SystemPerformanceDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (autoRefresh) {
      interval = setInterval(() => {
        loadDashboard();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMonitoringDashboard();
      setDashboard(data);
      setLastUpdated(new Date());
    } catch (error: any) {
      setError(error.message || 'Failed to load dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!dashboard) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography color="text.secondary">Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            System Performance Dashboard
          </Typography>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        <FormControlLabel
          control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
          label="Auto-refresh"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Current Activity Metrics */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Current Activity
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <PerformanceMetricsCard
            title="Active Processing Runs"
            value={dashboard.activeProcessingRuns}
            subtitle={dashboard.activeProcessingRuns > 0 ? 'Currently running' : 'No active runs'}
            icon="speed"
            variant="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <PerformanceMetricsCard
            title="Employees Today"
            value={dashboard.employeesProcessedToday}
            subtitle="Processed today"
            icon="people"
            variant="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <PerformanceMetricsCard
            title="Success Rate (24h)"
            value={`${dashboard.successRate24h.toFixed(1)}%`}
            trend={dashboard.successRate24h >= 95 ? 'up' : dashboard.successRate24h >= 80 ? 'flat' : 'down'}
            icon="success"
            variant={dashboard.successRate24h >= 95 ? 'success' : dashboard.successRate24h >= 80 ? 'warning' : 'error'}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Processing Time Metrics */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Processing Performance
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <PerformanceMetricsCard
            title="Avg Time (24h)"
            value={formatDuration(dashboard.avgProcessingTime24h)}
            subtitle="Last 24 hours"
            icon="timer"
            variant="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <PerformanceMetricsCard
            title="Avg Time (7d)"
            value={formatDuration(dashboard.avgProcessingTime7d)}
            subtitle="Last 7 days"
            icon="timer"
            variant="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <PerformanceMetricsCard
            title="Avg Time (30d)"
            value={formatDuration(dashboard.avgProcessingTime30d)}
            subtitle="Last 30 days"
            icon="timer"
            variant="info"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Volume Metrics */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Processing Volume
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <PerformanceMetricsCard
            title="This Week"
            value={dashboard.employeesProcessedWeek}
            subtitle="Employees processed"
            icon="people"
            variant="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <PerformanceMetricsCard
            title="This Month"
            value={dashboard.employeesProcessedMonth}
            subtitle="Employees processed"
            icon="people"
            variant="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <PerformanceMetricsCard
            title="Success Rate (30d)"
            value={`${dashboard.successRate30d.toFixed(1)}%`}
            subtitle="Last 30 days"
            icon="success"
            variant={dashboard.successRate30d >= 95 ? 'success' : dashboard.successRate30d >= 80 ? 'warning' : 'error'}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* System Performance */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        System Performance
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <PerformanceMetricsCard
            title="API Response Time (P95)"
            value={dashboard.apiResponseTimeP95 > 0 ? `${dashboard.apiResponseTimeP95.toFixed(0)}ms` : 'N/A'}
            subtitle="95th percentile (24h)"
            icon="cloud"
            variant="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <PerformanceMetricsCard
            title="DB Query Time (P95)"
            value={dashboard.dbQueryTimeP95 > 0 ? `${dashboard.dbQueryTimeP95.toFixed(0)}ms` : 'N/A'}
            subtitle="95th percentile (24h)"
            icon="cloud"
            variant="info"
          />
        </Grid>
      </Grid>

      {/* Detailed Metrics by Type */}
      {dashboard.metricsByType && dashboard.metricsByType.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Detailed Metrics (Last 24h)
          </Typography>
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor: 'background.paper',
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                {dashboard.metricsByType.map((metric, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                        {metric.metricType.replace(/_/g, ' ')}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="baseline">
                        <Typography variant="h6" fontWeight={600}>
                          {metric.average.toFixed(0)}{metric.metricUnit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {metric.count} samples
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        P95: {metric.p95.toFixed(0)}{metric.metricUnit} | Max: {metric.max.toFixed(0)}{metric.metricUnit}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default MonitoringDashboardTab;

