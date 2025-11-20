import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Business, People, Email } from '@mui/icons-material';
import organizationsService, { type Organization } from '../services/organizationsService';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const MyOrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    companySize: '',
    website: '',
  });

  useEffect(() => {
    loadOrganization();
  }, [user]);

  const loadOrganization = async () => {
    try {
      const org = await organizationsService.getMyOrganization();
      setOrganization(org);
      setFormData({
        name: org.name,
        industry: org.industry || '',
        companySize: org.companySize || '',
        website: org.website || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!organization) return;
    try {
      await organizationsService.update(organization.id, formData);
      setSuccess('Organization settings updated successfully');
      setEditMode(false);
      loadOrganization();
    } catch (err: any) {
      setError(err.message || 'Failed to update organization');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!organization) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Organization not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        My Organization
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
        >
          <Tab icon={<Business />} label="Settings" iconPosition="start" />
          <Tab icon={<People />} label="Members" iconPosition="start" />
          <Tab icon={<Email />} label="Invitations" iconPosition="start" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Organization Details
              </Typography>
              {!editMode ? (
                <Button variant="contained" onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: organization.name,
                      industry: organization.industry || '',
                      companySize: organization.companySize || '',
                      website: organization.website || '',
                    });
                  }}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSave}>
                    Save Changes
                  </Button>
                </Stack>
              )}
            </Box>

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Organization Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Organization Slug"
                value={organization.slug}
                disabled
                helperText="Organization slug cannot be changed"
              />
              <TextField
                fullWidth
                label="Industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Company Size"
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                disabled={!editMode}
                placeholder="e.g., 1-10, 11-50, 51-200"
              />
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!editMode}
                type="url"
              />
            </Stack>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Subscription Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Plan: <strong>{organization.subscriptionTier || 'Free'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Member Count: <strong>{organization.memberCount || 0}</strong>
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Team Members
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member management features coming soon. Contact support to add or remove team members.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Team Invitations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the Invitation Management section to invite new team members to your organization.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => window.location.href = '/admin/invitations/client'}
            >
              Manage Invitations
            </Button>
          </Box>
        </TabPanel>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={5000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyOrganizationPage;
