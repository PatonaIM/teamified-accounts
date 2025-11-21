import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Chip,
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
  Close as CloseIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Edit as ChangesIcon,
  RemoveCircle as RevokedIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface VerificationHistoryEntry {
  id: string;
  action: string;
  actorUserId: string;
  actorName?: string;
  actorRole?: string;
  timestamp: string;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
  ipAddress?: string;
}

interface VerificationHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  documentFileName: string;
}

const VerificationHistoryDialog: React.FC<VerificationHistoryDialogProps> = ({
  open,
  onClose,
  documentId,
  documentFileName,
}) => {
  const [history, setHistory] = useState<VerificationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && documentId) {
      loadHistory();
    }
  }, [open, documentId]);

  const loadHistory = async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/documents/${documentId}/audit-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHistory(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load verification history');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('approve')) return <ApprovedIcon />;
    if (action.includes('reject')) return <RejectedIcon />;
    if (action.includes('needs_changes')) return <ChangesIcon />;
    if (action.includes('revoke')) return <RevokedIcon />;
    return <HistoryIcon />;
  };

  const getActionColor = (action: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    if (action.includes('approve')) return 'success';
    if (action.includes('reject')) return 'error';
    if (action.includes('needs_changes')) return 'warning';
    if (action.includes('revoke')) return 'warning';
    return 'info';
  };

  const getActionLabel = (action: string) => {
    if (action.includes('approve')) return 'Approved';
    if (action.includes('reject')) return 'Rejected';
    if (action.includes('needs_changes')) return 'Requested Changes';
    if (action.includes('revoke')) return 'Revoked Verification';
    return action.replace('verify_document_', '').replace(/_/g, ' ');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Verification History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {documentFileName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : history.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">
              No verification history available for this document
            </Typography>
          </Box>
        ) : (
          <Timeline position="right">
            {history.map((entry, index) => {
              const { date, time } = formatTimestamp(entry.timestamp);
              const isLast = index === history.length - 1;

              return (
                <TimelineItem key={entry.id}>
                  <TimelineOppositeContent
                    sx={{ m: 'auto 0', minWidth: 120 }}
                    align="right"
                    variant="body2"
                    color="text.secondary"
                  >
                    <Typography variant="caption" display="block">
                      {date}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {time}
                    </Typography>
                  </TimelineOppositeContent>

                  <TimelineSeparator>
                    <TimelineDot color={getActionColor(entry.action)}>
                      {getActionIcon(entry.action)}
                    </TimelineDot>
                    {!isLast && <TimelineConnector />}
                  </TimelineSeparator>

                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
                      }}
                    >
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={getActionLabel(entry.action)}
                          size="small"
                          color={getActionColor(entry.action)}
                          sx={{ fontWeight: 600 }}
                        />
                        {entry.previousStatus && entry.newStatus && (
                          <Typography variant="caption" color="text.secondary">
                            {entry.previousStatus} → {entry.newStatus}
                          </Typography>
                        )}
                      </Box>

                      {entry.actorName && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Reviewer:</strong> {entry.actorName}
                          {entry.actorRole && (
                            <Chip
                              label={entry.actorRole}
                              size="small"
                              sx={{ ml: 1, textTransform: 'capitalize' }}
                            />
                          )}
                        </Typography>
                      )}

                      {entry.notes && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: 'white',
                            borderRadius: 1,
                            border: '1px solid #E5E7EB',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" display="block">
                            Notes:
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {entry.notes}
                          </Typography>
                        </Box>
                      )}

                      {entry.ipAddress && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          IP: {entry.ipAddress}
                        </Typography>
                      )}
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VerificationHistoryDialog;
