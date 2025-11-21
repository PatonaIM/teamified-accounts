/**
 * Payslip Preview Dialog Component
 * Displays detailed payslip breakdown
 * Story 7.6 - Payroll Self-Service
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import api from '../../services/authService';

interface PayslipDetails {
  id: string;
  userId: string;
  countryId: string;
  payrollPeriodId: string;
  calculatedAt: string;
  grossPay: number;
  basicSalary: number;
  totalEarnings: number;
  overtimePay: number | null;
  nightShiftPay: number | null;
  totalStatutoryDeductions: number;
  totalOtherDeductions: number;
  totalDeductions: number;
  netPay: number;
  currencyCode: string;
  salaryComponents: Array<{
    componentName: string;
    componentType: string;
    amount: number;
  }>;
  statutoryDeductions: Array<{
    componentName: string;
    componentType: string;
    componentId: string;
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
  }>;
  otherDeductions: Array<{
    componentName: string;
    componentType: string;
    amount: number;
  }>;
  status: string;
  pdfPath: string | null;
}

interface PayslipPreviewDialogProps {
  open: boolean;
  payslipId: string;
  onClose: () => void;
}

export const PayslipPreviewDialog: React.FC<PayslipPreviewDialogProps> = ({
  open,
  payslipId,
  onClose,
}) => {
  const [payslip, setPayslip] = useState<PayslipDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && payslipId) {
      fetchPayslipDetails();
    }
  }, [open, payslipId]);

  const fetchPayslipDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/v1/payroll/payslips/${payslipId}`);
      setPayslip(response.data);
    } catch (err: any) {
      console.error('Failed to fetch payslip details:', err);
      setError(err.response?.data?.message || 'Failed to load payslip details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/v1/payroll/payslips/${payslipId}/download`);
      const { downloadUrl } = response.data;
      window.open(downloadUrl, '_blank');
    } catch (err: any) {
      console.error('Failed to download payslip:', err);
      alert(err.response?.data?.message || 'Failed to download payslip');
    }
  };

  if (!payslip && !loading && !error) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight="600">
          Payslip Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {payslip && !loading && (
          <Box>
            {/* Summary Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Pay Period
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(payslip.calculatedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
              <Chip 
                label={payslip.status.toUpperCase()} 
                color={payslip.status === 'available' ? 'success' : 'default'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Earnings Section */}
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Earnings
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Component</strong></TableCell>
                    <TableCell align="right"><strong>Amount ({payslip.currencyCode})</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payslip.salaryComponents.map((component, index) => (
                    <TableRow key={index}>
                      <TableCell>{component.componentName}</TableCell>
                      <TableCell align="right">{component.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {payslip.overtimePay && (
                    <TableRow>
                      <TableCell>Overtime Pay</TableCell>
                      <TableCell align="right">{payslip.overtimePay.toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  {payslip.nightShiftPay && (
                    <TableRow>
                      <TableCell>Night Shift Allowance</TableCell>
                      <TableCell align="right">{payslip.nightShiftPay.toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Earnings</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {payslip.totalEarnings.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Statutory Deductions Section */}
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Statutory Deductions
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Component</strong></TableCell>
                    <TableCell align="right"><strong>Employee</strong></TableCell>
                    <TableCell align="right"><strong>Employer</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payslip.statutoryDeductions.map((component, index) => (
                    <TableRow key={index}>
                      <TableCell>{component.componentName}</TableCell>
                      <TableCell align="right">{component.employeeContribution.toLocaleString()}</TableCell>
                      <TableCell align="right">{component.employerContribution.toLocaleString()}</TableCell>
                      <TableCell align="right">{component.totalContribution.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Statutory Deductions</TableCell>
                    <TableCell align="right" colSpan={3} sx={{ fontWeight: 'bold' }}>
                      {payslip.totalStatutoryDeductions.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Other Deductions (if any) */}
            {payslip.otherDeductions.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Other Deductions
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Component</strong></TableCell>
                        <TableCell align="right"><strong>Amount ({payslip.currencyCode})</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payslip.otherDeductions.map((component, index) => (
                        <TableRow key={index}>
                          <TableCell>{component.componentName}</TableCell>
                          <TableCell align="right">{component.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Total Other Deductions</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {payslip.totalOtherDeductions.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Summary */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: 'rgba(161, 106, 232, 0.05)',
                border: '1px solid rgba(161, 106, 232, 0.2)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Gross Pay:</Typography>
                <Typography variant="body1">{payslip.currencyCode} {payslip.grossPay.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Total Deductions:</Typography>
                <Typography variant="body1">{payslip.currencyCode} {payslip.totalDeductions.toLocaleString()}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="600">Net Pay:</Typography>
                <Typography variant="h6" fontWeight="600" color="primary">
                  {payslip.currencyCode} {payslip.netPay.toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {payslip?.pdfPath && (
          <Button 
            onClick={handleDownload} 
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
          >
            Download PDF
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

