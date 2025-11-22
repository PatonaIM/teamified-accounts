import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import type { EmploymentRecord } from '../../types/employmentRecords';
import EmploymentStatusBadge from './EmploymentStatusBadge';

interface EmploymentRecordDetailsProps {
  record: EmploymentRecord;
  onEdit?: (record: EmploymentRecord) => void;
  onTerminate?: (record: EmploymentRecord) => void;
  showActions?: boolean;
}

const EmploymentRecordDetails: React.FC<EmploymentRecordDetailsProps> = ({
  record,
  onEdit,
  onTerminate,
  showActions = true,
}) => {
  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  // Get status description
  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'active':
        return 'Currently employed and active';
      case 'inactive':
        return 'Employment temporarily suspended';
      case 'terminated':
        return 'Employment has been terminated';
      case 'completed':
        return 'Employment contract completed';
      default:
        return 'Status unknown';
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Employment Record Details
            </Typography>
            <EmploymentStatusBadge status={record.status} size="medium" />
          </Box>
          {showActions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onEdit && (
                <Tooltip title="Edit Employment Record">
                  <IconButton onClick={() => onEdit(record)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onTerminate && record.status === 'active' && (
                <Tooltip title="Terminate Employment">
                  <IconButton color="error" onClick={() => onTerminate(record)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Employment Information */}
        <Grid container spacing={3}>
          {/* User Information */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Employee Information</Typography>
                </Box>
                <Box sx={{ pl: 4 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Full Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {record.user?.firstName} {record.user?.lastName}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {record.user?.email}
                  </Typography>
                  
                  {record.user?.phone && (
                    <>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Phone
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {record.user.phone}
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Client Information */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Client Information</Typography>
                </Box>
                <Box sx={{ pl: 4 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Company Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {record.client?.name}
                  </Typography>
                  
                  {record.client?.description && (
                    <>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {record.client.description}
                      </Typography>
                    </>
                  )}
                  
                  {record.client?.contactInfo && (
                    <>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Contact Information
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {typeof record.client.contactInfo === 'string' 
                          ? record.client.contactInfo 
                          : JSON.stringify(record.client.contactInfo)
                        }
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Employment Details */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Employment Details</Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Role
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {record.role}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Start Date
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(record.startDate)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        End Date
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {record.endDate ? formatDate(record.endDate) : 'Ongoing'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Duration
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {calculateDuration(record.startDate, record.endDate)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Status Information */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Status Information</Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Current Status
                      </Typography>
                      <EmploymentStatusBadge status={record.status} size="medium" />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {getStatusDescription(record.status)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Created
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(record.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Last Updated
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(record.updatedAt)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EmploymentRecordDetails;
