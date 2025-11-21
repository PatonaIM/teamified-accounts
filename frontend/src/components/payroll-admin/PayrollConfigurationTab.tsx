/**
 * Payroll Configuration Tab
 * Multi-region payroll configuration management
 * Moved from standalone page to tab in PayrollAdministrationPage
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Public as CountryIcon,
  CalendarToday as TaxYearIcon,
  AttachMoney as SalaryIcon,
  AccountBalance as StatutoryIcon,
} from '@mui/icons-material';
import { useCountry } from '../../contexts/CountryContext';
import { CountrySelector } from '../payroll/CountrySelector';
import { SalaryComponentsConfig } from '../payroll/SalaryComponentsConfig';
import { StatutoryComponentsConfig } from '../payroll/StatutoryComponentsConfig';
import { TaxYearConfig } from '../payroll/TaxYearConfig';
import { ExchangeRateConfig } from '../payroll/ExchangeRateConfig';
import { RegionConfigurationConfig } from '../payroll/RegionConfigurationConfig';
import { getCurrentTaxYear } from '../../services/payroll/payrollService';
import type { TaxYear } from '../../types/payroll/payroll.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const PayrollConfigurationTab: React.FC = () => {
  const { selectedCountry, loading: countryLoading, error: countryError } = useCountry();
  const [activeTab, setActiveTab] = useState(0);
  const [currentTaxYear, setCurrentTaxYear] = useState<TaxYear | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentTaxYear = async () => {
    if (!selectedCountry) return;
    
    try {
      setLoading(true);
      setError(null);
      const taxYear = await getCurrentTaxYear(selectedCountry.code);
      setCurrentTaxYear(taxYear);
    } catch (err) {
      console.error('Error loading tax year:', err);
      setError('Failed to load current tax year');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      loadCurrentTaxYear();
    }
  }, [selectedCountry]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (countryLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (countryError) {
    return (
      <Alert severity="error">{countryError}</Alert>
    );
  }

  return (
    <Box>
      {/* Country Selector Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Select Country
          </Typography>
          <Box sx={{ minWidth: 280 }}>
            <CountrySelector fullWidth />
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!selectedCountry ? (
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <Box display="flex" flexDirection="column" alignItems="center" py={6}>
              <CountryIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={600}>
                No Country Selected
              </Typography>
              <Typography variant="body1" color="text.disabled">
                Please select a country to view and manage payroll configuration
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
                minWidth: 120,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Tax Years" />
            <Tab label="Region Configurations" />
            <Tab label="Exchange Rates" />
            <Tab 
              label="Salary Components" 
              icon={<SalaryIcon />}
              iconPosition="start"
              data-testid="salary-components-tab"
            />
            <Tab 
              label="Statutory Components" 
              icon={<StatutoryIcon />}
              iconPosition="start"
              data-testid="statutory-components-tab"
            />
          </Tabs>

          <CardContent sx={{ p: 4 }}>
            <TabPanel value={activeTab} index={0}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 3,
                  bgcolor: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.1) 
                      : alpha(theme.palette.primary.main, 0.05),
                  border: '1px solid', 
                  borderColor: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.2) 
                      : alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                    <CountryIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography variant="h5" fontWeight={600} color="primary.main">
                      Country Details
                    </Typography>
                  </Box>
                  
                  {/* Grid Layout for Country Details */}
                  <Grid container spacing={2}>
                    {/* Row 1: Country Code & Name */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          height: '100%'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                          COUNTRY CODE
                        </Typography>
                        <Chip 
                          label={selectedCountry.code} 
                          size="medium"
                          color="primary"
                          sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          height: '100%'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                          COUNTRY NAME
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedCountry.name}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Row 2: Currency */}
                    <Grid size={{ xs: 12 }}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          height: '100%'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                          CURRENCY
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedCountry.currency?.name}
                          </Typography>
                          <Chip 
                            label={`${selectedCountry.currency?.code} ${selectedCountry.currency?.symbol}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    {/* Row 3: Tax Year */}
                    <Grid size={{ xs: 12 }}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          height: '100%'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                          CURRENT TAX YEAR
                        </Typography>
                        {loading ? (
                          <CircularProgress size={20} />
                        ) : currentTaxYear ? (
                          <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <TaxYearIcon fontSize="small" color="primary" />
                              <Typography variant="h6" fontWeight={600}>
                                FY {currentTaxYear.year}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {new Date(currentTaxYear.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(currentTaxYear.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                              Tax year starts in month {selectedCountry.taxYearStartMonth}
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" color="text.disabled" sx={{ mb: 1 }}>
                              No tax year configured
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                              Tax year starts in month {selectedCountry.taxYearStartMonth}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    {/* Row 4: Status */}
                    <Grid size={{ xs: 12 }}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          height: '100%'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                          STATUS
                        </Typography>
                        <Chip
                          label={selectedCountry.isActive ? 'Active' : 'Inactive'}
                          size="medium"
                          sx={{ 
                            fontWeight: 600,
                            bgcolor: (theme) => {
                              const statusColor = selectedCountry.isActive ? theme.palette.success.main : theme.palette.grey[500];
                              return theme.palette.mode === 'dark' 
                                ? alpha(statusColor, 0.2) 
                                : alpha(statusColor, 0.1);
                            },
                            color: selectedCountry.isActive ? 'success.main' : 'text.secondary',
                            border: '1px solid',
                            borderColor: selectedCountry.isActive ? 'success.main' : 'divider',
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <TaxYearConfig />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <RegionConfigurationConfig />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <ExchangeRateConfig />
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <SalaryComponentsConfig />
            </TabPanel>

            <TabPanel value={activeTab} index={5}>
              <StatutoryComponentsConfig />
            </TabPanel>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PayrollConfigurationTab;
