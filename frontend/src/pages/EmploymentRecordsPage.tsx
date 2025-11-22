import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Skeleton,
  Button,
  Container,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LayoutMUI from '../components/LayoutMUI';
import EmploymentRecordsTable from '../components/employment-records/EmploymentRecordsTable';
import EmploymentRecordsFilters from '../components/employment-records/EmploymentRecordsFilters';
import EmploymentRecordForm from '../components/employment-records/EmploymentRecordForm';
import { useClient } from '../contexts/ClientContext';
import { employmentRecordsService } from '../services/employmentRecordsService';
import type { EmploymentRecordFilters as Filters, EmploymentStatistics } from '../types/employmentRecords';

const EmploymentRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedClient } = useClient();
  const [statistics, setStatistics] = useState<EmploymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    clientId: '',
    userId: '',
    sort: 'createdAt',
    order: 'desc',
  });

  // Load statistics
  const loadStatistics = async () => {
    try {
      const stats = await employmentRecordsService.getEmploymentStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1, clientId: selectedClient?.id || '' }));
  }, [selectedClient]);

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      try {
        await loadStatistics();
      } catch (err) {
        setError('Failed to load employment records data');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [selectedClient]);


  const handleCreateRecord = () => {
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    // Refresh data after form submission
    loadStatistics();
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    colorType: 'primary' | 'secondary' | 'success' | 'error';
    loading?: boolean;
  }> = ({ title, value, icon, colorType, loading = false }) => (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        p: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          backgroundColor: (theme) => alpha(theme.palette[colorType].main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: `${colorType}.main`,
          '& .MuiSvgIcon-root': {
            fontSize: '1rem',
          },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: 'text.secondary',
            display: 'block',
            mb: 0.25,
            fontSize: '0.65rem',
          }}
        >
          {title}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width="80%" height={28} />
        ) : (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            {value.toLocaleString()}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <LayoutMUI>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height={80} sx={{ flex: 1, borderRadius: 2 }} />
            ))}
          </Box>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
        </Container>
      </LayoutMUI>
    );
  }

  return (
    <LayoutMUI>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Statistics */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <StatCard
            title="Total Records"
            value={statistics?.total || 0}
            icon={<AssignmentIcon />}
            colorType="primary"
          />
          <StatCard
            title="Active"
            value={statistics?.active || 0}
            icon={<CheckCircleIcon />}
            colorType="success"
          />
          <StatCard
            title="Terminated"
            value={statistics?.terminated || 0}
            icon={<PeopleIcon />}
            colorType="error"
          />
          <StatCard
            title="Recent Hires"
            value={statistics?.recentHires || 0}
            icon={<TrendingUpIcon />}
            colorType="secondary"
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters with Add Button */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Search & Filter
            </Typography>
            <Button
              onClick={handleCreateRecord}
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Add Record
            </Button>
          </Box>
          <EmploymentRecordsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </Paper>

        {/* Data Table */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3, 
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Employment Records
            </Typography>
          </Box>
          
          <Box sx={{ p: 0 }}>
            <EmploymentRecordsTable
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onRefresh={loadStatistics}
            />
          </Box>
        </Paper>

        {/* Create/Edit Form Dialog */}
        <EmploymentRecordForm
          open={showCreateForm}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      </Container>
    </LayoutMUI>
  );
};

export default EmploymentRecordsPage;
