import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  PersonAdd,
  Email,
  Delete,
  RestartAlt,
  Image,
  Edit,
  CheckCircle,
  Security,
  ExpandMore,
  ExpandLess,
  Login,
  ErrorOutline,
  Apps,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { auditHistoryService } from '../services/auditHistoryService';
import type { AuditLogEntry } from '../services/auditHistoryService';

interface AuditHistoryTimelineProps {
  userId: string;
}

interface ConsolidatedLogEntry {
  log: AuditLogEntry;
  count: number;
  isConsolidated: boolean;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'user_created':
      return <PersonAdd />;
    case 'user_email_verified':
      return <Email />;
    case 'user_deleted':
      return <Delete />;
    case 'user_reactivated':
      return <RestartAlt />;
    case 'user_profile_picture_updated':
      return <Image />;
    case 'user_profile_updated':
      return <Edit />;
    case 'invitation_accepted':
      return <CheckCircle />;
    case 'role_assigned':
    case 'role_updated':
    case 'role_removed':
      return <Security />;
    case 'login_success':
    case 'SSO_TOKEN_EXCHANGE':
      return <Login />;
    case 'login_failure':
      return <ErrorOutline />;
    default:
      return <CheckCircle />;
  }
};

const getActionColor = (action: string): 'primary' | 'success' | 'error' | 'warning' | 'info' => {
  if (action.includes('created') || action.includes('accepted')) return 'success';
  if (action.includes('deleted') || action === 'login_failure') return 'error';
  if (action.includes('reactivated')) return 'warning';
  if (action.includes('verified') || action === 'login_success' || action === 'SSO_TOKEN_EXCHANGE') return 'info';
  return 'primary';
};

const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    user_created: 'Account Created',
    user_email_verified: 'Email Verified',
    user_deleted: 'Account Deleted',
    user_reactivated: 'Account Reactivated',
    user_profile_picture_updated: 'Profile Picture Updated',
    user_profile_updated: 'Profile Updated',
    invitation_accepted: 'Invitation Accepted',
    role_assigned: 'Role Assigned',
    role_updated: 'Role Updated',
    role_removed: 'Role Removed',
    login_success: 'Login Successful',
    login_failure: 'Login Failed',
    SSO_TOKEN_EXCHANGE: 'SSO Login',
  };
  return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const AuditHistoryTimeline: React.FC<AuditHistoryTimelineProps> = ({ userId }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const fetchAuditHistory = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await auditHistoryService.getUserAuditHistory(userId, 20, cursor);
      
      if (cursor) {
        setAuditLogs((prev) => [...prev, ...response.data]);
      } else {
        setAuditLogs(response.data);
      }

      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch audit history:', err);
      setError(err.response?.data?.message || 'Failed to load audit history');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAuditHistory();
  }, [userId]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const consolidateLogs = (logs: AuditLogEntry[]): ConsolidatedLogEntry[] => {
    if (logs.length === 0) return [];

    const consolidated: ConsolidatedLogEntry[] = [];
    let currentGroup: AuditLogEntry[] = [logs[0]];
    let currentAction = logs[0].action;

    for (let i = 1; i < logs.length; i++) {
      const log = logs[i];
      
      if (log.action === currentAction) {
        currentGroup.push(log);
      } else {
        if (currentGroup.length > 1) {
          consolidated.push({
            log: currentGroup[0],
            count: currentGroup.length,
            isConsolidated: true,
          });
        } else {
          consolidated.push({
            log: currentGroup[0],
            count: 1,
            isConsolidated: false,
          });
        }
        
        currentGroup = [log];
        currentAction = log.action;
      }
    }

    if (currentGroup.length > 1) {
      consolidated.push({
        log: currentGroup[0],
        count: currentGroup.length,
        isConsolidated: true,
      });
    } else {
      consolidated.push({
        log: currentGroup[0],
        count: 1,
        isConsolidated: false,
      });
    }

    return consolidated;
  };

  const renderChangesDetail = (log: AuditLogEntry) => {
    if (!log.changes) return null;

    const isExpanded = expandedItems.has(log.id);

    return (
      <Box sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Details
          </Typography>
          <IconButton size="small" onClick={() => toggleExpanded(log.id)}>
            {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
        </Box>
        <Collapse in={isExpanded}>
          <Box
            sx={{
              bgcolor: 'background.default',
              p: 1.5,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto' }}>
              {JSON.stringify(log.changes, null, 2)}
            </pre>
          </Box>
        </Collapse>
      </Box>
    );
  };

  if (loading && auditLogs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No audit history available for this user.
      </Alert>
    );
  }

  const consolidatedLogs = consolidateLogs(auditLogs);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Account Activity Timeline
      </Typography>
      
      <Timeline position="right">
        {consolidatedLogs.map((entry, index) => {
          const { log, count, isConsolidated } = entry;
          return (
            <TimelineItem key={log.id}>
              <TimelineOppositeContent sx={{ maxWidth: '120px', px: 2, py: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(log.at), 'MMM d, yyyy')}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {format(new Date(log.at), 'h:mm a')}
                </Typography>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={getActionColor(log.action)}>
                  {getActionIcon(log.action)}
                </TimelineDot>
                {index < consolidatedLogs.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 1, px: 2 }}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={getActionLabel(log.action)}
                        size="small"
                        color={getActionColor(log.action)}
                        sx={{ fontWeight: 600 }}
                      />
                      {isConsolidated && (
                        <Chip
                          label={`${count}× occurrences`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            bgcolor: 'action.hover',
                          }}
                        />
                      )}
                    </Box>

                    {isConsolidated && (
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 1.5,
                          py: 0.5,
                          '& .MuiAlert-message': { fontSize: '0.75rem' }
                        }}
                      >
                        This event occurred <strong>{count} times</strong> consecutively. Showing the most recent occurrence.
                      </Alert>
                    )}

                    {log.actorUser && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        by{' '}
                        <strong>
                          {log.actorUser.firstName} {log.actorUser.lastName}
                        </strong>{' '}
                        ({log.actorUser.email})
                      </Typography>
                    )}

                    {log.actorRole && (
                      <Chip
                        label={log.actorRole}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1, fontSize: '0.7rem' }}
                      />
                    )}

                    {log.changes?.oauthClientName && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, mb: 1 }}>
                        <Apps fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          App: <strong>{log.changes.oauthClientName}</strong>
                        </Typography>
                      </Box>
                    )}

                    {log.changes?.reason && (log.action === 'login_failure') && (
                      <Typography variant="body2" color="error.main" sx={{ mt: 1, mb: 1 }}>
                        Reason: {log.changes.reason.replace(/_/g, ' ')}
                      </Typography>
                    )}

                    {renderChangesDetail(log)}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => fetchAuditHistory(nextCursor || undefined)}
            disabled={loadingMore}
          >
            {loadingMore ? <CircularProgress size={20} /> : 'Load More'}
          </Button>
        </Box>
      )}
    </Box>
  );
};
