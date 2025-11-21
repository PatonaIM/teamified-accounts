/**
 * Contribution Summary Tab Component
 * Displays YTD contribution summary and history
 * Story 7.6 - Payroll Self-Service
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/authService';

interface ContributionByType {
  componentName: string;
  componentCode: string;
  totalEmployee: number;
  totalEmployer: number;
  totalContribution: number;
  occurrences: number;
}

interface ContributionSummary {
  userId: string;
  countryId: string;
  currencyCode: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalContributions: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  contributionsByType: ContributionByType[];
}

interface ContributionHistoryItem {
  payslipId: string;
  payrollPeriodId: string;
  periodName: string;
  calculatedAt: string;
  totalStatutoryDeductions: number;
}

interface Country {
  id: string;
  code: string;
  name: string;
}

export const ContributionSummaryTab: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ContributionSummary | null>(null);
  const [history, setHistory] = useState<ContributionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry && user?.id) {
      fetchContributionData(selectedCountry);
    }
  }, [selectedCountry, user]);

  const fetchCountries = async () => {
    setCountriesLoading(true);
    try {
      const response = await api.get('/v1/payroll/configuration/countries');
      const countriesData = response.data || [];
      setCountries(countriesData);
      
      if (countriesData.length > 0 && !selectedCountry && user?.id) {
        try {
          const employmentResponse = await api.get(`/v1/employment-records/user/${user.id}`);
          const employmentRecords = employmentResponse.data || [];
          const activeRecord = employmentRecords.find((record: any) => record.status === 'active');
          
          if (activeRecord && activeRecord.countryId) {
            setSelectedCountry(activeRecord.countryId);
          } else {
            setSelectedCountry(countriesData[0].id);
          }
        } catch (empErr) {
          console.error('Failed to fetch employment records, using first country:', empErr);
          setSelectedCountry(countriesData[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch countries:', err);
      setError('Failed to load countries. Please try again.');
    } finally {
      setCountriesLoading(false);
    }
  };

  const fetchContributionData = async (countryId: string) => {
    if (!countryId || !user?.id) {
      console.log('Skipping contribution fetch - missing countryId or user');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const summaryResponse = await api.get(
        `/v1/payroll/contributions/current-year/${countryId}`
      );
      setSummary(summaryResponse.data);

      const historyResponse = await api.get('/v1/payroll/contributions/history', {
        params: { countryId, limit: 12 },
      });
      setHistory(historyResponse.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch contribution data:', err);
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Failed to load contribution data';
      
      if (status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (status === 403) {
        setError('You do not have permission to view contribution data.');
      } else if (status === 404) {
        setError('No contribution data found for the selected country. Contributions will appear once payslips are generated.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !summary) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!summary) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography color="text.secondary">
          No contribution data available. Contributions will appear here once payslips are generated.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }} size="small">
          <InputLabel>Select Country</InputLabel>
          <Select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            label="Select Country"
            disabled={countriesLoading || loading}
            sx={{
              '& .MuiSvgIcon-root': {
                color: 'text.secondary',
              },
            }}
          >
            {countries.map((country) => (
              <MenuItem key={country.id} value={country.id}>
                {country.name} ({country.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
          gap: 3,
          mb: 4 
        }}
      >
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="subtitle2" color="text.secondary">
                Total Contributions (YTD)
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="600" color="primary">
              {summary.currencyCode} {summary.totalContributions.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <BankIcon />
              </Avatar>
              <Typography variant="subtitle2" color="text.secondary">
                Employee Contributions
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="600" color="text.primary">
              {summary.currencyCode} {summary.totalEmployeeContributions.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <BankIcon />
              </Avatar>
              <Typography variant="subtitle2" color="text.secondary">
                Employer Contributions
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="600" color="text.primary">
              {summary.currencyCode} {summary.totalEmployerContributions.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Contributions by Type (Year-to-Date)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {new Date(summary.period.startDate).toLocaleDateString()} - {new Date(summary.period.endDate).toLocaleDateString()}
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Component</strong></TableCell>
                <TableCell align="right"><strong>Employee</strong></TableCell>
                <TableCell align="right"><strong>Employer</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>Occurrences</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.contributionsByType.map((contribution, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {contribution.componentName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {contribution.componentCode}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {summary.currencyCode} {contribution.totalEmployee.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {summary.currencyCode} {contribution.totalEmployer.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="600">
                      {summary.currencyCode} {contribution.totalContribution.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{contribution.occurrences}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Contribution History (Last 12 Periods)
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Period</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell align="right"><strong>Statutory Deductions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.periodName || `Period ${index + 1}`}</TableCell>
                  <TableCell>
                    {new Date(item.calculatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {summary.currencyCode} {item.totalStatutoryDeductions.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {history.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No contribution history available
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
