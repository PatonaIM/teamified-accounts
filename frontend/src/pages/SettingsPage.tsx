import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Settings, Palette, Apps, VpnKey, Description } from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import ThemeSettingsTab from '../components/settings/ThemeSettingsTab';
import OAuthClientsTab from '../components/settings/OAuthClientsTab';
import ApiKeysTab from '../components/settings/ApiKeysTab';
import ApiDocumentationTab from '../components/settings/ApiDocumentationTab';
import { useAuth } from '../contexts/AuthContext';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { user } = useAuth();

  // Check if user has admin role
  const isAdmin = useMemo(() => {
    return user?.roles?.includes('admin') || false;
  }, [user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <LayoutMUI>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Settings sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight={600}>
              Settings
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage your portal preferences, themes{isAdmin && ', application integrations, API keys, and documentation'}
          </Typography>
        </Box>

        <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="settings tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
            }}
          >
            <Tab
              icon={<Palette />}
              iconPosition="start"
              label="Theme Settings"
              id="settings-tab-0"
              aria-controls="settings-tabpanel-0"
            />
            {isAdmin && (
              <Tab
                icon={<Apps />}
                iconPosition="start"
                label="SSO Applications"
                id="settings-tab-1"
                aria-controls="settings-tabpanel-1"
              />
            )}
            {isAdmin && (
              <Tab
                icon={<VpnKey />}
                iconPosition="start"
                label="API Keys"
                id="settings-tab-2"
                aria-controls="settings-tabpanel-2"
              />
            )}
            {isAdmin && (
              <Tab
                icon={<Description />}
                iconPosition="start"
                label="API Documentation"
                id="settings-tab-3"
                aria-controls="settings-tabpanel-3"
              />
            )}
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <ThemeSettingsTab />
          </TabPanel>

          {isAdmin && (
            <TabPanel value={currentTab} index={1}>
              <OAuthClientsTab />
            </TabPanel>
          )}

          {isAdmin && (
            <TabPanel value={currentTab} index={2}>
              <ApiKeysTab />
            </TabPanel>
          )}

          {isAdmin && (
            <TabPanel value={currentTab} index={3}>
              <ApiDocumentationTab />
            </TabPanel>
          )}
        </Paper>
      </Container>
    </LayoutMUI>
  );
};

export default SettingsPage;
