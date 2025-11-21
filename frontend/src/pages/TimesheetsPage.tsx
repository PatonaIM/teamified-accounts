/**
 * Timesheet Page Component
 * Main page for timesheet management with role-based views
 * - Employees: Submit timesheets + view their own timesheets
 * - Managers: View and approve timesheets
 * Replaces old placeholder implementation with full Story 7.4 functionality
 */

import React from 'react';
import { Box, Tabs, Tab, Typography, Paper, Container, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AccessTime as TimesheetIcon,
  PlaylistAddCheck as ApprovalIcon,
  List as ListIcon,
} from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import { useAuth } from '../hooks/useAuth';
import { TimesheetSubmissionForm } from '../components/timesheets/TimesheetSubmissionForm';
import { TimesheetListView } from '../components/timesheets/TimesheetListView';
import { TimesheetApprovalPanel } from '../components/timesheets/TimesheetApprovalPanel';

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

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const TimesheetsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState(0);
  const [timesheetToEdit, setTimesheetToEdit] = React.useState<any>(null);

  // Determine if user can approve timesheets
  const canApprove = user?.roles?.some((role) =>
    ['admin', 'hr', 'account_manager', 'hr_manager_client'].includes(role.toLowerCase())
  );

  // Determine if user can submit timesheets
  const canSubmit = user?.roles?.some((role) =>
    ['eor', 'candidate', 'admin', 'hr', 'account_manager', 'hr_manager_client'].includes(role.toLowerCase())
  );

  // Handle edit timesheet - switch to submit tab with timesheet data
  const handleEditTimesheet = (timesheet: any) => {
    setTimesheetToEdit(timesheet);
    setActiveTab(0); // Switch to Submit Timesheet tab
  };

  // Handle edit completion - return to list view
  const handleEditComplete = () => {
    setTimesheetToEdit(null);
    setActiveTab(1); // Switch to My Timesheets tab
  };

  if (loading) {
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
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="timesheet tabs"
            TabIndicatorProps={{
              sx: { backgroundColor: 'primary.main', height: 3 }
            }}
          >
            {canSubmit && (
              <StyledTab
                icon={<TimesheetIcon />}
                iconPosition="start"
                label="Submit Timesheet"
                data-testid="submit-tab"
              />
            )}
            {canSubmit && (
              <StyledTab
                icon={<ListIcon />}
                iconPosition="start"
                label="My Timesheets"
                data-testid="list-tab"
              />
            )}
            {canApprove && (
              <StyledTab
                icon={<ApprovalIcon />}
                iconPosition="start"
                label="Approvals"
                data-testid="approval-tab"
              />
            )}
          </Tabs>
        </Box>

          {/* Tab 0: Submit Timesheet (for all employees) */}
          {canSubmit && (
            <TabPanel value={activeTab} index={0}>
              <TimesheetSubmissionForm 
                timesheetToEdit={timesheetToEdit} 
                onEditComplete={handleEditComplete}
              />
            </TabPanel>
          )}

          {/* Tab 1: My Timesheets (for all employees) */}
          {canSubmit && (
            <TabPanel value={activeTab} index={canSubmit ? 1 : 0}>
              <TimesheetListView onEditTimesheet={handleEditTimesheet} />
            </TabPanel>
          )}

          {/* Tab 2: Approvals (for managers only) */}
          {canApprove && (
            <TabPanel value={activeTab} index={canSubmit ? 2 : 0}>
              <TimesheetApprovalPanel />
            </TabPanel>
          )}

        {/* Fallback if user has no relevant roles */}
        {!canSubmit && !canApprove && (
          <Paper 
            elevation={0}
            sx={{ 
              textAlign: 'center', 
              py: 8,
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              You do not have permission to access this page.
            </Typography>
          </Paper>
        )}
      </Container>
    </LayoutMUI>
  );
};

export default TimesheetsPage;
