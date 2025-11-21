/**
 * Payroll Administration Page
 * Main container with 6-tab layout for payroll administration
 * Story 7.8 - Advanced Payroll Administration & Monitoring
 */

import React, { useState } from 'react';
import { Box, Container, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import PlayCircle from '@mui/icons-material/PlayCircle';
import Monitor from '@mui/icons-material/Monitor';
import BatchPrediction from '@mui/icons-material/BatchPrediction';
import Settings from '@mui/icons-material/Settings';
import PlaylistAddCheck from '@mui/icons-material/PlaylistAddCheck';
import LayoutMUI from '../LayoutMUI';
import PeriodManagementTab from './PeriodManagementTab';
import ProcessingControlPanel from './ProcessingControlPanel';
import MonitoringDashboardTab from './MonitoringDashboardTab';
import BulkOperationsTab from './BulkOperationsTab';
import PayrollConfigurationTab from './PayrollConfigurationTab';
import { PayslipGenerationPanel } from '../payslips/PayslipGenerationPanel';

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

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const PayrollAdministrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <LayoutMUI>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="payroll administration tabs"
            TabIndicatorProps={{
              sx: { 
                backgroundColor: 'primary.main',
                height: 3,
              }
            }}
          >
            <StyledTab
              icon={<CalendarMonth />}
              iconPosition="start"
              label="Period Management"
            />
            <StyledTab
              icon={<PlayCircle />}
              iconPosition="start"
              label="Processing Control"
            />
            <StyledTab
              icon={<Monitor />}
              iconPosition="start"
              label="Monitoring"
            />
            <StyledTab
              icon={<BatchPrediction />}
              iconPosition="start"
              label="Bulk Operations"
            />
            <StyledTab
              icon={<PlaylistAddCheck />}
              iconPosition="start"
              label="Generate Payslips"
            />
            <StyledTab
              icon={<Settings />}
              iconPosition="start"
              label="Configuration"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <PeriodManagementTab />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <ProcessingControlPanel />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <MonitoringDashboardTab />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <BulkOperationsTab />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <PayslipGenerationPanel />
        </TabPanel>
        <TabPanel value={activeTab} index={5}>
          <PayrollConfigurationTab />
        </TabPanel>
      </Container>
    </LayoutMUI>
  );
};

export default PayrollAdministrationPage;
