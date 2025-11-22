import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  path?: string;
  comingSoon?: boolean;
}

function ToolCard({ icon, title, description, path, comingSoon }: ToolCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (path && !comingSoon) {
      navigate(path);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: comingSoon ? 'action.disabledBackground' : 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        opacity: comingSoon ? 0.6 : 1,
        '&:hover': !comingSoon ? {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: 2,
        } : {},
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
            bgcolor: comingSoon ? 'action.disabled' : 'primary.main',
            color: comingSoon ? 'text.disabled' : 'primary.contrastText',
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
          variant={comingSoon ? 'outlined' : 'contained'}
          disabled={comingSoon}
          onClick={handleClick}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: comingSoon ? 'transparent' : '#A16AE8',
            color: comingSoon ? 'text.disabled' : '#fff',
            '&:hover': !comingSoon ? {
              bgcolor: '#8f5cd9',
            } : {},
          }}
        >
          {comingSoon ? 'Coming Soon' : 'Open'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SuperAdminToolsPage() {
  const tools: ToolCardProps[] = [
    {
      icon: <BusinessIcon fontSize="large" />,
      title: 'Tenant Management',
      description: 'Manage client organizations, members, and metadata',
      path: '/admin/organizations',
    },
    {
      icon: <PeopleIcon fontSize="large" />,
      title: 'Internal Users',
      description: 'Manage super admins and internal staff user accounts',
      path: '/admin/tools/internal-users',
    },
    {
      icon: <PersonAddIcon fontSize="large" />,
      title: 'Candidate Users',
      description: 'Manage candidate users and convert them to employees',
      path: '/admin/tools/candidate-users',
    },
    {
      icon: <VpnKeyIcon fontSize="large" />,
      title: 'OAUTH Configuration',
      description: 'Manage platform-wide OAuth 2.0 clients, client IDs, secrets, and redirect URLs',
      path: '/admin/tools/oauth-configuration',
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: 'Security & Audit',
      description: 'View audit logs, Security events, and access patterns',
      comingSoon: true,
    },
    {
      icon: <AnalyticsIcon fontSize="large" />,
      title: 'Analytics & Reports',
      description: 'Generate platform-wide analytics and usage reports',
      comingSoon: true,
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={3}>
        {tools.map((tool, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <ToolCard {...tool} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
