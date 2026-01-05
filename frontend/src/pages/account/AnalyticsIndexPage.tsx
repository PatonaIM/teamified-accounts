import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, IconButton, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AutoAwesome as AIIcon,
  Apps,
  Login as LoginIcon,
  People,
  TrendingUp,
  Business,
  Devices,
  Security,
  Mail,
  Speed,
  Timeline,
  ArrowBack,
  ChevronRight,
} from '@mui/icons-material';

interface ReportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
}

function ReportCard({ icon, title, description, path }: ReportCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            mb: 2,
          }}
        >
          {icon}
        </Box>
        
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
          {description}
        </Typography>
        
        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate(path)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#A16AE8',
            color: '#fff',
            '&:hover': {
              bgcolor: '#8f5cd9',
            },
          }}
        >
          Open
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsIndexPage() {
  const navigate = useNavigate();

  const reports: ReportCardProps[] = [
    {
      icon: <AIIcon fontSize="large" />,
      title: 'AI Search',
      description: 'AI-powered analytics with natural language queries and intelligent insights',
      path: '/admin/analytics/ai-search',
    },
    {
      icon: <Apps fontSize="large" />,
      title: 'App Usage',
      description: 'Track application usage, feature adoption, and user activity across all apps',
      path: '/admin/analytics/app-usage',
    },
    {
      icon: <LoginIcon fontSize="large" />,
      title: 'Login Traffic',
      description: 'Monitor login patterns, peak hours, and authentication trends',
      path: '/admin/analytics/login-traffic',
    },
    {
      icon: <People fontSize="large" />,
      title: 'Engagement',
      description: 'Analyze user engagement metrics, active users, and retention rates',
      path: '/admin/analytics/engagement',
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: 'Adoption',
      description: 'View adoption funnel metrics and conversion rates across the platform',
      path: '/admin/analytics/adoption',
    },
    {
      icon: <Business fontSize="large" />,
      title: 'Org Health',
      description: 'Organization health scores, activity levels, and risk indicators',
      path: '/admin/analytics/org-health',
    },
    {
      icon: <Devices fontSize="large" />,
      title: 'Sessions',
      description: 'Session analytics, device types, and platform distribution',
      path: '/admin/analytics/sessions',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Security',
      description: 'Security events, password resets, and account lockouts',
      path: '/admin/analytics/security',
    },
    {
      icon: <Mail fontSize="large" />,
      title: 'Invitations',
      description: 'Invitation metrics, acceptance rates, and pending invites',
      path: '/admin/analytics/invitations',
    },
    {
      icon: <Speed fontSize="large" />,
      title: 'Stickiness',
      description: 'Feature stickiness metrics and user retention analysis',
      path: '/admin/analytics/stickiness',
    },
    {
      icon: <Timeline fontSize="large" />,
      title: 'Time-to-Value',
      description: 'Time-to-value metrics and onboarding efficiency analysis',
      path: '/admin/analytics/time-to-value',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/admin/tools')}
          sx={{ 
            mr: 2,
            color: 'primary.main',
            '&:hover': { 
              bgcolor: 'rgba(161, 106, 232, 0.08)' 
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => navigate('/admin/tools')}
          >
            Admin Tools
          </Typography>
          <ChevronRight sx={{ color: 'text.secondary' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Analytics & Reports
          </Typography>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {reports.map((report, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <ReportCard {...report} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
