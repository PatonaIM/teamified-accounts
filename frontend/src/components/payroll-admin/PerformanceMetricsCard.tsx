/**
 * Performance Metrics Card Component
 * Displays a single performance metric with icon and value
 * Story 7.8 - Payroll Administration
 */

import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box, Avatar, alpha, useTheme } from '@mui/material';
import TrendingUp from '@mui/icons-material/TrendingUp';
import TrendingDown from '@mui/icons-material/TrendingDown';
import TrendingFlat from '@mui/icons-material/TrendingFlat';
import People from '@mui/icons-material/People';
import Speed from '@mui/icons-material/Speed';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';
import Timer from '@mui/icons-material/Timer';
import CloudDone from '@mui/icons-material/CloudDone';

interface PerformanceMetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: 'people' | 'speed' | 'success' | 'error' | 'timer' | 'cloud' | 'trending';
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({
  title,
  value,
  subtitle,
  icon = 'trending',
  trend,
  trendValue,
  variant = 'primary',
}) => {
  const theme = useTheme();

  // Get color based on variant
  const getColor = () => {
    switch (variant) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const color = getColor();

  const getIcon = () => {
    const iconStyle = { color: 'primary.contrastText' };
    switch (icon) {
      case 'people':
        return <People sx={iconStyle} />;
      case 'speed':
        return <Speed sx={iconStyle} />;
      case 'success':
        return <CheckCircle sx={iconStyle} />;
      case 'error':
        return <Error sx={iconStyle} />;
      case 'timer':
        return <Timer sx={iconStyle} />;
      case 'cloud':
        return <CloudDone sx={iconStyle} />;
      default:
        return <TrendingUp sx={iconStyle} />;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />;
      case 'down':
        return <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />;
      case 'flat':
        return <TrendingFlat sx={{ fontSize: 16, color: theme.palette.text.secondary }} />;
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        height: 200,
        borderRadius: 3,
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        avatar={
          <Avatar sx={{ bgcolor: color }}>
            {getIcon()}
          </Avatar>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pt: 0 }}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1,
            }}
          >
            {value}
          </Typography>

          {(subtitle || trend) && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {trend && getTrendIcon()}
              {trendValue && (
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      trend === 'up' 
                        ? 'success.main' 
                        : trend === 'down' 
                        ? 'error.main' 
                        : 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {trendValue}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', ml: trendValue ? 0.5 : 0 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsCard;
