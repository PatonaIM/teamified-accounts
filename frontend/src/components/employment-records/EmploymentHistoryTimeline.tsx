import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import type { EmploymentRecord } from '../../types/employmentRecords';
import EmploymentStatusBadge from './EmploymentStatusBadge';

interface EmploymentHistoryTimelineProps {
  employmentRecords: EmploymentRecord[];
  userId?: string;
  userName?: string;
}

const EmploymentHistoryTimeline: React.FC<EmploymentHistoryTimelineProps> = ({
  employmentRecords,
  userId,
  userName,
}) => {
  // Sort records by start date (newest first)
  const sortedRecords = [...employmentRecords].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate duration
  const calculateDuration = (startDate: string | Date, endDate?: string | Date) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
  };

  // Get timeline dot color
  const getTimelineDotColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'terminated': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  if (sortedRecords.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <WorkIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No Employment History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userName ? `${userName} has no employment records.` : 'No employment records found.'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Employment History
          </Typography>
          {userName && (
            <Typography variant="body2" color="text.secondary">
              {userName}
            </Typography>
          )}
        </Box>

        <Stack spacing={3}>
          {sortedRecords.map((record, index) => (
            <Box key={record.id} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              {/* Timeline dot and connector */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                <Avatar
                  sx={{
                    bgcolor: getTimelineDotColor(record.status) === 'success' ? 'success.main' :
                             getTimelineDotColor(record.status) === 'warning' ? 'warning.main' :
                             getTimelineDotColor(record.status) === 'error' ? 'error.main' :
                             getTimelineDotColor(record.status) === 'info' ? 'info.main' : 'grey.400',
                    width: 32,
                    height: 32,
                  }}
                >
                  <BusinessIcon 
                    fontSize="small"
                    sx={{
                      color: getTimelineDotColor(record.status) === 'success' ? 'success.contrastText' :
                             getTimelineDotColor(record.status) === 'warning' ? 'warning.contrastText' :
                             getTimelineDotColor(record.status) === 'error' ? 'error.contrastText' :
                             getTimelineDotColor(record.status) === 'info' ? 'info.contrastText' : '#fff',
                    }}
                  />
                </Avatar>
                {index < sortedRecords.length - 1 && (
                  <Box
                    sx={{
                      width: 2,
                      height: 40,
                      bgcolor: 'divider',
                      mt: 1,
                    }}
                  />
                )}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Card variant="outlined" sx={{ mb: 1 }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {record.client?.name}
                      </Typography>
                      <EmploymentStatusBadge status={record.status} />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {record.role}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <Typography variant="body2">
                        {record.user?.firstName} {record.user?.lastName}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                      <Typography variant="body2">
                        {formatDate(record.startDate)}
                        {record.endDate && ` - ${formatDate(record.endDate)}`}
                      </Typography>
                    </Box>

                    {/* Duration */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Duration: {calculateDuration(record.startDate, record.endDate)}
                      </Typography>
                    </Box>
                    
                    {record.endDate && record.status === 'terminated' && (
                      <Box sx={{ mt: 1 }}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Employment terminated on {formatDate(record.endDate)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EmploymentHistoryTimeline;
