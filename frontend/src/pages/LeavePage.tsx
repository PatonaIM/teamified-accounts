/**
 * Leave Management Page
 * Integrated leave management interface with role-based tabs
 * - Tab 1: Submit Leave (all users)
 * - Tab 2: My Requests (all users)
 * - Tab 3: Approvals (Admin/HR only)
 * - Tab 4: Leave Balances (all users)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Snackbar,
  Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Send as SendIcon,
  List as ListIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import { useAuth } from '../hooks/useAuth';
import {
  LeaveBalanceWidget,
  LeaveRequestForm,
  LeaveRequestListView,
  LeaveApprovalPanel,
  LeaveRequestDetailDialog,
} from '../components/leave';
import type { LeaveRequest, LeaveBalance } from '../types/leave/leave.types';
import leaveService from '../services/leave/leaveService';

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 48,
  textTransform: 'none',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  '& .MuiSvgIcon-root': {
    color: 'inherit',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leave-tabpanel-${index}`}
      aria-labelledby={`leave-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const LeavePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState(0);
  const [detailRequest, setDetailRequest] = useState<LeaveRequest | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);

  // Get user's country from profile data
  const userCountryCode = (user as any)?.profileData?.personal?.countryCode || 'IN'; // Default to India if not set
  
  // Check if user has approval permissions
  const canApprove = user?.roles?.some((role: string) => 
    ['admin', 'hr', 'account_manager', 'hr_manager_client'].includes(role.toLowerCase())
  );

  // Load leave balances
  useEffect(() => {
    if (user && userCountryCode) {
      loadBalances();
    }
  }, [user, userCountryCode]);

  const loadBalances = async () => {
    try {
      setLoadingBalances(true);
      const data = await leaveService.getLeaveBalances(undefined, userCountryCode);
      setBalances(data);
    } catch (err: any) {
      console.error('Failed to load balances:', err);
      showToast('Failed to load leave balances', 'error');
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setDetailRequest(request);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setDetailRequest(null);
  };

  const handleFormSuccess = () => {
    showToast('Leave request submitted successfully!', 'success');
    loadBalances(); // Refresh balances
    setActiveTab(1); // Switch to "My Requests" tab
  };

  const handleRefresh = () => {
    loadBalances();
  };

  const showToast = (message: string, severity: 'success' | 'error' | 'info') => {
    setToast({ message, severity });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  if (authLoading) {
    return (
      <LayoutMUI>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </LayoutMUI>
    );
  }

  return (
    <LayoutMUI>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="leave management tabs"
            TabIndicatorProps={{
              sx: { backgroundColor: 'primary.main', height: 3 }
            }}
          >
            <StyledTab
              icon={<SendIcon />}
              iconPosition="start"
              label="Submit Leave"
              id="leave-tab-0"
              aria-controls="leave-tabpanel-0"
            />
            <StyledTab
              icon={<ListIcon />}
              iconPosition="start"
              label="My Requests"
              id="leave-tab-1"
              aria-controls="leave-tabpanel-1"
            />
            {canApprove && (
              <StyledTab
                icon={<CheckCircleIcon />}
                iconPosition="start"
                label="Approvals"
                id="leave-tab-2"
                aria-controls="leave-tabpanel-2"
              />
            )}
            <StyledTab
              icon={<TrendingUpIcon />}
              iconPosition="start"
              label="Leave Balances"
              id={`leave-tab-${canApprove ? 3 : 2}`}
              aria-controls={`leave-tabpanel-${canApprove ? 3 : 2}`}
            />
          </Tabs>
        </Box>

        {/* Tab 1: Submit Leave */}
        <TabPanel value={activeTab} index={0}>
          <LeaveRequestForm
            countryCode={userCountryCode}
            onSuccess={handleFormSuccess}
            onCancel={() => setActiveTab(1)}
          />
        </TabPanel>

        {/* Tab 2: My Requests */}
        <TabPanel value={activeTab} index={1}>
          <LeaveRequestListView
            showActions={true}
            userId={(user as any)?.id}
            onView={handleViewDetails}
            onRefresh={handleRefresh}
          />
        </TabPanel>

        {/* Tab 3: Approvals (Admin/HR only) */}
        {canApprove && (
          <TabPanel value={activeTab} index={2}>
            <LeaveApprovalPanel
              onView={handleViewDetails}
              onRefresh={handleRefresh}
            />
          </TabPanel>
        )}

        {/* Tab 4: Leave Balances */}
        <TabPanel value={activeTab} index={canApprove ? 3 : 2}>
          {loadingBalances ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <LeaveBalanceWidget balances={balances} loading={loadingBalances} />
          )}
        </TabPanel>

        {/* Footer Section */}
        <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Leave requests are typically processed within 2-3 business days. 
            For urgent matters, please contact your HR manager directly.
          </Typography>
        </Box>

        {/* Detail Dialog */}
        <LeaveRequestDetailDialog
          open={detailDialogOpen}
          request={detailRequest}
          onClose={handleCloseDetailDialog}
        />

        {/* Toast Notifications */}
        <Snackbar
          open={toast !== null}
          autoHideDuration={6000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          {toast && (
            <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
              {toast.message}
            </Alert>
          )}
        </Snackbar>
      </Container>
    </LayoutMUI>
  );
};

export default LeavePage;
