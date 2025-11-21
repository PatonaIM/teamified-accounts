import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Skeleton,
  Container,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import SalaryHistoryTable from '../components/salary-history/SalaryHistoryTable';
import SalaryHistoryFilters, { type SalaryHistoryFilterState } from '../components/salary-history/SalaryHistoryFilters';
import { SalaryHistoryForm } from '../components/salary-history/SalaryHistoryForm';
import { useAuth } from '../hooks/useAuth';
import { useClient } from '../contexts/ClientContext';
import { salaryHistoryService } from '../services/salaryHistoryService';
import type { SalaryReport, SalaryHistory } from '../types/salary-history.types';

const SalaryHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedClient } = useClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salaryReport, setSalaryReport] = useState<SalaryReport | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalaryHistory | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<SalaryHistoryFilterState>({
    search: '',
    status: 'all',
    currency: 'all',
    dateRange: 'all',
    clientId: selectedClient?.id,
  });

  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('hr');

  // Load salary report for statistics
  const loadSalaryReport = async () => {
    try {
      setLoading(true);
      // Admin and HR see organization-wide summary
      const report = await salaryHistoryService.getOrganizationSummary();
      setSalaryReport(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load salary report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilters(prev => ({ ...prev, clientId: selectedClient?.id }));
    setRefreshKey(prev => prev + 1);
  }, [selectedClient]);

  useEffect(() => {
    if (user?.id) {
      loadSalaryReport();
    }
  }, [user?.id, selectedClient]);

  const handleCreateRecord = () => {
    setSelectedRecord(null);
    setShowCreateForm(true);
  };

  const handleEditRecord = (record: SalaryHistory) => {
    setSelectedRecord(record);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setSelectedRecord(null);
    setRefreshKey(prev => prev + 1);
    loadSalaryReport();
  };

  const handleFiltersChange = (newFilters: SalaryHistoryFilterState) => {
    setFilters(newFilters);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorType: 'primary' | 'secondary' | 'warning' | 'success';
    loading?: boolean;
  }> = ({ title, value, icon, colorType, loading: statLoading = false }) => (
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
        {statLoading ? (
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
            {value}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <LayoutMUI>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {[1, 2, 3].map((i) => (
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
        {salaryReport && (
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <StatCard
              title="Average Salary"
              value={salaryReport.statistics.averageSalary
                ? formatCurrency(
                    salaryReport.statistics.averageSalary,
                    salaryReport.currentSalary?.salaryCurrency || 'USD'
                  )
                : 'N/A'
              }
              icon={<MoneyIcon />}
              colorType="primary"
            />
            <StatCard
              title="Total Active Records"
              value={salaryReport.statistics.totalActiveRecords || 0}
              icon={<TimelineIcon />}
              colorType="secondary"
            />
            <StatCard
              title="Total Salaries"
              value={salaryReport.statistics.totalSalaries
                ? formatCurrency(
                    salaryReport.statistics.totalSalaries,
                    salaryReport.currentSalary?.salaryCurrency || 'USD'
                  )
                : 'N/A'
              }
              icon={<TrendingUpIcon />}
              colorType="success"
            />
          </Box>
        )}

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
            {isAdmin && (
              <Button
                onClick={handleCreateRecord}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Add Salary Change
              </Button>
            )}
          </Box>
          <SalaryHistoryFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearchChange={(search) => setFilters({ ...filters, search })}
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
              Salary Records
            </Typography>
          </Box>

          <Box sx={{ p: 0 }}>
            <SalaryHistoryTable
              filters={filters}
              onEdit={handleEditRecord}
              onRefresh={loadSalaryReport}
              refreshTrigger={refreshKey}
            />
          </Box>
        </Paper>

        {/* Create/Edit Form Dialog */}
        {showCreateForm && (
          <SalaryHistoryForm
            open={showCreateForm}
            onClose={handleFormClose}
            onSubmit={async (data) => {
              if (selectedRecord) {
                await salaryHistoryService.updateSalaryHistory(selectedRecord.id, data);
              } else {
                await salaryHistoryService.createSalaryHistory(data);
              }
              handleFormClose();
            }}
            selectedEmployment={null}
            initialData={selectedRecord}
          />
        )}
      </Container>
    </LayoutMUI>
  );
};

export default SalaryHistoryPage;
