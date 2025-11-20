import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  Apps as AppsIcon,
  CheckCircle,
  Cancel,
  Public,
  Business,
  Visibility,
  Assessment,
  People,
  AttachMoney,
} from '@mui/icons-material';
import { userAppPermissionsService } from '../../services/userAppPermissionsService';
import type { UserAppAccess } from '../../services/userAppPermissionsService';
import { useAuth } from '../../hooks/useAuth';

const APP_ICONS: Record<string, React.ReactNode> = {
  candidate_portal: <People sx={{ fontSize: 48 }} />,
  team_connect: <People sx={{ fontSize: 48 }} />,
  hris: <Business sx={{ fontSize: 48 }} />,
  ats: <People sx={{ fontSize: 48 }} />,
  finance: <AttachMoney sx={{ fontSize: 48 }} />,
  data_dashboard: <Assessment sx={{ fontSize: 48 }} />,
};

const APP_DESCRIPTIONS: Record<string, string> = {
  candidate_portal: 'Apply for jobs and manage your applications',
  team_connect: 'Connect with your team and collaborate',
  hris: 'HR information system for employee management',
  ats: 'Applicant tracking system for recruitment',
  finance: 'Financial management and payroll',
  data_dashboard: 'Analytics and reporting dashboard',
};

export default function MyAppsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<UserAppAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyApps();
  }, []);

  const fetchMyApps = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await userAppPermissionsService.getMyAppAccess();
      setApps(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load authorized apps');
    } finally {
      setLoading(false);
    }
  };

  const getScopeIcon = (scope?: string) => {
    switch (scope) {
      case 'all_orgs':
        return <Public fontSize="small" />;
      case 'own_org':
        return <Business fontSize="small" />;
      case 'view_only':
        return <Visibility fontSize="small" />;
      default:
        return null;
    }
  };

  const getScopeLabel = (scope?: string) => {
    switch (scope) {
      case 'all_orgs':
        return 'All Organizations';
      case 'own_org':
        return 'Own Organization';
      case 'view_only':
        return 'View Only';
      case 'public':
        return 'Public';
      case 'interviews':
        return 'Interviews';
      case 'limited':
        return 'Limited';
      default:
        return scope;
    }
  };

  const formatAppName = (appKey: string) => {
    return appKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const authorizedApps = apps.filter(app => app.canAccess);
  const deniedApps = apps.filter(app => !app.canAccess);

  if (loading) {
    return (
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto', textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        My Apps
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Applications and services you have access to
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {authorizedApps.length === 0 && deniedApps.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.paper',
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <AppsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No Apps Available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have access to any apps yet. Contact your administrator for access.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Authorized Apps */}
          {authorizedApps.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Authorized Apps ({authorizedApps.length})
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {authorizedApps.map((app) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={app.oauthClientId}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
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
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            bgcolor: 'primary.lighter',
                            color: 'primary.main',
                            mb: 2,
                          }}
                        >
                          {APP_ICONS[app.appKey] || <AppsIcon sx={{ fontSize: 48 }} />}
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {formatAppName(app.appKey)}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                          {app.description || APP_DESCRIPTIONS[app.appKey] || 'No description available'}
                        </Typography>

                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                              Authorized
                            </Typography>
                          </Stack>

                          {app.scope && (
                            <Chip
                              icon={getScopeIcon(app.scope) || undefined}
                              label={getScopeLabel(app.scope)}
                              size="small"
                              variant="outlined"
                              sx={{ alignSelf: 'flex-start' }}
                            />
                          )}

                          {app.source === 'override' && (
                            <Chip
                              label={app.overrideReason || 'Custom Access'}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Restricted Apps */}
          {deniedApps.length > 0 && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Restricted Apps ({deniedApps.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These apps are not available with your current permissions.
              </Typography>
              <Grid container spacing={3}>
                {deniedApps.map((app) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={app.oauthClientId}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid',
                        borderColor: 'divider',
                        opacity: 0.6,
                        bgcolor: 'action.disabledBackground',
                      }}
                    >
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            bgcolor: 'action.disabled',
                            color: 'text.disabled',
                            mb: 2,
                          }}
                        >
                          {APP_ICONS[app.appKey] || <AppsIcon sx={{ fontSize: 48 }} />}
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {formatAppName(app.appKey)}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                          {app.description || APP_DESCRIPTIONS[app.appKey] || 'No description available'}
                        </Typography>

                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Cancel color="error" fontSize="small" />
                            <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                              Access Denied
                            </Typography>
                          </Stack>

                          {app.source === 'override' && app.overrideReason && (
                            <Typography variant="caption" color="text.secondary">
                              Reason: {app.overrideReason}
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </Box>
  );
}
