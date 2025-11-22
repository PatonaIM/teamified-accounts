import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import LayoutMUI from '../components/LayoutMUI';
import { employmentRecordsService } from '../services/employmentRecordsService';
import type { EmploymentRecord, EmploymentStatus } from '../types/employmentRecords';
import EmploymentStatusBadge from '../components/employment-records/EmploymentStatusBadge';

const ClientEmploymentRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [employmentRecords, setEmploymentRecords] = useState<EmploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load client employment records
  useEffect(() => {
    const loadEmploymentRecords = async () => {
      if (!clientId) {
        setError('Client ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const records = await employmentRecordsService.getClientEmploymentRecords(clientId);
        setEmploymentRecords(records);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load client employment records';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadEmploymentRecords();
  }, [clientId]);

  // Get client name from first record
  const clientName = employmentRecords.length > 0 
    ? employmentRecords[0].client?.name
    : 'Unknown Client';

  // Get status counts
  const statusCounts = employmentRecords.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {} as Record<EmploymentStatus, number>);

  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <LayoutMUI>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        </Box>
      </LayoutMUI>
    );
  }

  if (error) {
    return (
      <LayoutMUI>
        <Box>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/employment-records')}
          >
            Back to Employment Records
          </Button>
        </Box>
      </LayoutMUI>
    );
  }

  return (
    <LayoutMUI>
      <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <HomeIcon />
          Home
        </Link>
        <Link
          color="inherit"
          href="/employment-records"
          onClick={(e) => {
            e.preventDefault();
            navigate('/employment-records');
          }}
        >
          Employment Records
        </Link>
        <Typography color="text.primary">
          {clientName} - Employment Records
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Client Employment Records
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {clientName}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employment-records')}
        >
          Back to Employment Records
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon color="primary" />
                <Box>
                  <Typography variant="h4" component="div">
                    {employmentRecords.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="success" />
                <Box>
                  <Typography variant="h4" component="div" color="success.main">
                    {statusCounts.active || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon color="info" />
                <Box>
                  <Typography variant="h4" component="div" color="info.main">
                    {statusCounts.completed || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon color="warning" />
                <Box>
                  <Typography variant="h4" component="div" color="warning.main">
                    {statusCounts.terminated || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Terminated
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employment Records Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Employment Records
          </Typography>
          
          {employmentRecords.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Employment Records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {clientName} has no employment records.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employmentRecords.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {record.user?.firstName} {record.user?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.role}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" />
                          <Typography variant="body2">
                            {formatDate(record.startDate)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {record.endDate ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon fontSize="small" />
                            <Typography variant="body2">
                              {formatDate(record.endDate)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Ongoing
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <EmploymentStatusBadge status={record.status} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(() => {
                            const start = new Date(record.startDate);
                            const end = record.endDate ? new Date(record.endDate) : new Date();
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
                          })()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      </Box>
    </LayoutMUI>
  );
};

export default ClientEmploymentRecordsPage;
