/**
 * Payslip Generation Panel Component
 * Admin/HR interface for bulk payslip generation
 * Story 7.6 - Payroll Self-Service
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  PlayArrow as GenerateIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import api from '../../services/authService';

interface PayrollPeriod {
  id: string;
  periodName: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

export const PayslipGenerationPanel: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [generateForAll, setGenerateForAll] = useState(true);
  const [specificUserIds, setSpecificUserIds] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedPayslipIds, setGeneratedPayslipIds] = useState<string[]>([]);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchPayrollPeriods(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const response = await api.get('/v1/payroll/configuration/countries');
      setCountries(response.data || []);
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    }
  };

  const fetchPayrollPeriods = async (countryId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/payroll/configuration/countries/${countryId}/periods`);
      setPeriods(response.data || []);
    } catch (err) {
      console.error('Failed to fetch payroll periods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslips = async () => {
    if (!selectedCountry || !selectedPeriod) {
      setError('Please select both country and payroll period');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);
    setGeneratedPayslipIds([]);

    try {
      const payload: any = {
        countryId: selectedCountry,
        payrollPeriodId: selectedPeriod,
      };

      if (!generateForAll && specificUserIds.trim()) {
        payload.userIds = specificUserIds
          .split(',')
          .map(id => id.trim())
          .filter(id => id.length > 0);
      }

      const response = await api.post('/v1/payroll/payslips/generate', payload);
      
      const payslipIds = response.data || [];
      setGeneratedPayslipIds(payslipIds);
      setSuccess(`Successfully generated ${payslipIds.length} payslips!`);
      
      setSelectedCountry('');
      setSelectedPeriod('');
      setSpecificUserIds('');
    } catch (err: any) {
      console.error('Failed to generate payslips:', err);
      setError(err.response?.data?.message || 'Failed to generate payslips');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Generate Payslips
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Generate payslips for a specific payroll period. Payslips will be calculated using Story 7.3 
          calculation engine and made available to employees.
        </Typography>

        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }} 
            onClose={() => setSuccess(null)}
            icon={<SuccessIcon />}
          >
            {success}
            {generatedPayslipIds.length > 0 && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Generated Payslip IDs: {generatedPayslipIds.length} total
              </Typography>
            )}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              select
              label="Country"
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedPeriod('');
              }}
              required
              disabled={generating}
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '1rem',
                  bgcolor: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.common.white, 0.09) 
                      : 'background.paper',
                },
                '& .MuiSvgIcon-root': {
                  color: 'text.secondary',
                },
              }}
            >
              <MenuItem value="">Select a country</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.id} value={country.id}>
                  {country.name} ({country.code})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                select
                label="Payroll Period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                required
                disabled={!selectedCountry || loading || generating}
                size="medium"
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: '1rem',
                    bgcolor: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.common.white, 0.09) 
                        : 'background.paper',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'text.secondary',
                  },
                }}
              >
                <MenuItem value="">Select a period</MenuItem>
                {periods.map((period) => (
                  <MenuItem key={period.id} value={period.id}>
                    {period.periodName} ({period.status})
                  </MenuItem>
                ))}
              </TextField>
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Loading periods...
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                checked={generateForAll}
                onChange={(e) => setGenerateForAll(e.target.checked)}
                disabled={generating}
              />
            }
            label="Generate for all employees in this period"
          />

          {!generateForAll && (
            <TextField
              fullWidth
              label="Specific User IDs (comma-separated)"
              placeholder="e.g., user-id-1, user-id-2, user-id-3"
              value={specificUserIds}
              onChange={(e) => setSpecificUserIds(e.target.value)}
              disabled={generating}
              helperText="Enter user IDs separated by commas to generate payslips for specific employees only"
              multiline
              rows={2}
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.common.white, 0.09) 
                      : 'background.paper',
                },
              }}
            />
          )}

          <Box>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <GenerateIcon />}
              onClick={handleGeneratePayslips}
              disabled={!selectedCountry || !selectedPeriod || generating}
              sx={{
                py: 1.5,
                px: 4,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                bgcolor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.08) 
                    : 'transparent',
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.12) 
                      : alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              {generating ? 'Generating Payslips...' : 'Generate Payslips'}
            </Button>
          </Box>
        </Stack>

        <Box 
          sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: (theme) => 
              theme.palette.mode === 'dark' 
                ? alpha(theme.palette.common.white, 0.05) 
                : alpha(theme.palette.common.black, 0.02),
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            How Payslip Generation Works:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="1. Calculate payroll using Story 7.3 calculation engine"
                secondary="Gross pay, deductions, and net pay are calculated based on salary components and statutory rules"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="2. Save calculation results as Payslip records"
                secondary="Each payslip stores the complete calculation breakdown for historical access"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="3. Generate PDF documents"
                secondary="PDFs are generated from saved payslip records with all earnings and deduction details"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="4. Notify employees"
                secondary="Employees receive notifications that their payslips are ready to view and download"
              />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Box>
  );
};
