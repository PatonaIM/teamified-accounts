import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Popover,
  Typography,
  CircularProgress,
} from '@mui/material';
import { userAppPermissionsService } from '../services/userAppPermissionsService';
import type { UserAppAccess } from '../services/userAppPermissionsService';
import { getPortalUrl } from '../config/portalUrls';

interface AppConfig {
  name: string;
  emoji: string;
  description: string;
  baseUrl: string;
}

const getAppConfig = (): Record<string, AppConfig> => ({
  candidate_portal: {
    name: 'Jobseeker Portal',
    emoji: '🔍',
    description: 'Search and apply for job opportunities',
    baseUrl: getPortalUrl('jobseeker') || '',
  },
  ats: {
    name: 'ATS Portal',
    emoji: '📋',
    description: 'Manage job postings and track applicants',
    baseUrl: getPortalUrl('ats') || '',
  },
  hris: {
    name: 'HRIS Portal',
    emoji: '👥',
    description: 'HR information system for employee management',
    baseUrl: import.meta.env.VITE_PORTAL_URL_HRIS || '',
  },
  team_connect: {
    name: 'Team Connect',
    emoji: '💬',
    description: 'Connect with your team and collaborate',
    baseUrl: import.meta.env.VITE_PORTAL_URL_TEAM_CONNECT || '',
  },
  alexia_ai: {
    name: 'Alexia AI',
    emoji: '🤖',
    description: 'AI-powered assistant for productivity',
    baseUrl: import.meta.env.VITE_PORTAL_URL_ALEXIA_AI || '',
  },
});

interface AppsDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export default function AppsDropdown({ anchorEl, open, onClose }: AppsDropdownProps) {
  const [apps, setApps] = useState<UserAppAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  const appConfig = useMemo(() => getAppConfig(), []);

  useEffect(() => {
    if (open && !hasFetched) {
      fetchApps();
    }
  }, [open, hasFetched]);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await userAppPermissionsService.getMyAppAccess();
      setApps(data);
      setHasFetched(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  const accessibleApps = apps
    .filter((app) => app.canAccess && appConfig[app.appKey] && appConfig[app.appKey].baseUrl)
    .map((app) => ({
      ...app,
      config: appConfig[app.appKey],
    }));

  const handleAppClick = (config: AppConfig) => {
    window.open(config.baseUrl, '_blank');
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            ml: 1,
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
            minWidth: 280,
            maxWidth: 320,
          },
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            mb: 2, 
            fontWeight: 600, 
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.75rem',
          }}
        >
          Your Apps
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body2" sx={{ py: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        ) : accessibleApps.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 32, mb: 1 }}>📱</Typography>
            <Typography variant="body2" color="text.secondary">
              No apps available
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
            }}
          >
            {accessibleApps.map((app) => (
              <Box
                key={app.oauthClientId}
                onClick={() => handleAppClick(app.config)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  p: 1.5,
                  borderRadius: 2,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0.5,
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)'
                        : 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography sx={{ fontSize: 24, lineHeight: 1 }}>
                    {app.config.emoji}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    textAlign: 'center',
                    color: 'text.primary',
                    lineHeight: 1.2,
                    fontSize: '0.7rem',
                  }}
                >
                  {app.config.name}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Popover>
  );
}
