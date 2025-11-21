/**
 * Salary Reports Component
 * Interactive reports and analytics interface with export functionality
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  FileDownload as CsvIcon,
} from '@mui/icons-material';
import { salaryHistoryService } from '../../services/salaryHistoryService';
import type {
  SalaryReport,
  SalaryExportOptions,
} from '../../types/salary-history.types';

interface SalaryReportsProps {
  salaryReport: SalaryReport | null;
  onExport: (options: SalaryExportOptions) => Promise<void>;
  isLoading: boolean;
}

export const SalaryReports: React.FC<SalaryReportsProps> = ({
  salaryReport,
  onExport,
  isLoading,
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return salaryHistoryService.formatCurrency(amount, currency);
  };

  const calculateChangePercentage = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeChip = (current: number, previous: number, currency: string) => {
    if (previous === 0) {
      return <Chip label="Initial" color="default" size="small" />;
    }

    const change = current - previous;
    const percentage = calculateChangePercentage(current, previous);
    const isIncrease = change > 0;
    const isDecrease = change < 0;

    const label = `${isIncrease ? '+' : ''}${formatCurrency(Math.abs(change), currency)} (${percentage.toFixed(1)}%)`;

    return (
      <Chip
        label={label}
        color={isIncrease ? 'success' : isDecrease ? 'error' : 'default'}
        size="small"
      />
    );
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    if (!salaryReport) return;

    try {
      setIsExporting(true);
      const options: SalaryExportOptions = {
        format,
        includeScheduled: true,
        groupByEmployment: false,
      };
      await onExport(options);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (!salaryReport) {
    return (
      <Alert severity="info">
        No salary report data available. Create salary history records to generate reports.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Report Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Salary History Report
        </Typography>
        
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf' | 'excel')}
              label="Export Format"
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={isExporting ? <CircularProgress size={16} /> : <DownloadIcon />}
            onClick={() => handleExport(exportFormat)}
            disabled={isExporting}
          >
            Export
          </Button>
          
          <Tooltip title="Print Report">
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Records
              </Typography>
              <Typography variant="h4">
                {salaryReport.statistics.totalChanges}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Increase
              </Typography>
              <Typography variant="h4">
                {salaryReport.statistics.averageIncrease > 0
                  ? formatCurrency(
                      salaryReport.statistics.averageIncrease,
                      salaryReport.currentSalary?.salaryCurrency || 'USD'
                    )
                  : 'N/A'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Scheduled Changes
              </Typography>
              <Typography variant="h4">
                {salaryReport.statistics.scheduledChanges}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Last Increase
              </Typography>
              <Typography variant="h4">
                {salaryReport.statistics.lastIncreaseDate
                  ? formatDate(salaryReport.statistics.lastIncreaseDate)
                  : 'N/A'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Salary */}
      {salaryReport.currentSalary && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Salary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="h4" color="primary">
                {formatCurrency(
                  salaryReport.currentSalary.salaryAmount,
                  salaryReport.currentSalary.salaryCurrency
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1">
                Effective: {formatDate(salaryReport.currentSalary.effectiveDate)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1">
                Reason: {salaryReport.currentSalary.changeReason}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Salary History Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Effective Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Change Reason</TableCell>
                <TableCell>Changed By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Change</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salaryReport.salaryHistory.map((salary, index) => {
                const previousSalary = salaryReport.salaryHistory[index + 1];
                return (
                  <TableRow key={salary.id}>
                    <TableCell>
                      {formatDate(salary.effectiveDate)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(salary.salaryAmount, salary.salaryCurrency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {salary.salaryCurrency}
                    </TableCell>
                    <TableCell>
                      {salary.changeReason}
                    </TableCell>
                    <TableCell>
                      {salary.changedByName || 'System'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={salary.isScheduled ? 'Scheduled' : 'Active'}
                        color={salary.isScheduled ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {previousSalary ? getChangeChip(
                        salary.salaryAmount,
                        previousSalary.salaryAmount,
                        salary.salaryCurrency
                      ) : (
                        <Chip label="Initial" color="default" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Report Footer */}
      <Box mt={3} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Report generated on {formatDate(salaryReport.generatedAt)}
        </Typography>
      </Box>
    </Box>
  );
};
