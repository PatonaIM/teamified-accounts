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
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import LayoutMUI from '../components/LayoutMUI';
import EmploymentHistoryTimeline from '../components/employment-records/EmploymentHistoryTimeline';
import EmploymentRecordDetails from '../components/employment-records/EmploymentRecordDetails';
import { employmentRecordsService } from '../services/employmentRecordsService';
import type { EmploymentRecord } from '../types/employmentRecords';

const UserEmploymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [employmentRecords, setEmploymentRecords] = useState<EmploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<EmploymentRecord | null>(null);

  // Load user employment records
  useEffect(() => {
    const loadEmploymentRecords = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const records = await employmentRecordsService.getUserEmploymentRecords(userId);
        setEmploymentRecords(records);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load employment history';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadEmploymentRecords();
  }, [userId]);

  // Handle record selection
  const handleRecordSelect = (record: EmploymentRecord) => {
    setSelectedRecord(record);
  };

  // Handle record edit
  const handleEditRecord = (record: EmploymentRecord) => {
    navigate(`/employment-records/edit/${record.id}`);
  };

  // Handle record termination
  const handleTerminateRecord = (record: EmploymentRecord) => {
    navigate(`/employment-records/terminate/${record.id}`);
  };

  // Get user name from first record
  const userName = employmentRecords.length > 0 
    ? `${employmentRecords[0].user?.firstName} ${employmentRecords[0].user?.lastName}`
    : 'Unknown User';

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
          {userName} - Employment History
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Employment History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {userName}
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

      <Grid container spacing={3}>
        {/* Employment History Timeline */}
        <Grid item xs={12} lg={8}>
          <EmploymentHistoryTimeline
            employmentRecords={employmentRecords}
            userId={userId}
            userName={userName}
          />
        </Grid>

        {/* Employment Record Details */}
        <Grid item xs={12} lg={4}>
          {selectedRecord ? (
            <EmploymentRecordDetails
              record={selectedRecord}
              onEdit={handleEditRecord}
              onTerminate={handleTerminateRecord}
            />
          ) : (
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select an Employment Record
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click on an employment record in the timeline to view details
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      </Box>
    </LayoutMUI>
  );
};

export default UserEmploymentHistoryPage;
