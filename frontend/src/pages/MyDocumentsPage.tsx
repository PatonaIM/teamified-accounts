import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Description as DescriptionIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Receipt as PayslipIcon,
  TrendingUp as ContributionIcon,
  Description as TaxDocIcon,
} from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import DocumentList from '../components/documents/DocumentList';
import { documentsService, type DocumentCategory } from '../services/documentsService';
import { useAuth } from '../hooks/useAuth';
import { PayslipListView } from '../components/payslips/PayslipListView';
import { ContributionSummaryTab } from '../components/payslips/ContributionSummaryTab';
import { TaxDocumentsTab } from '../components/payslips/TaxDocumentsTab';

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
      id={`documents-tabpanel-${index}`}
      aria-labelledby={`documents-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const MyDocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [documentCounts, setDocumentCounts] = useState({
    cv: 0,
    identity: 0,
    employment: 0,
    education: 0,
  });
  const [loading, setLoading] = useState(true);

  // Check if user has appropriate role for payslips
  const hasPayslipRole = user?.roles?.some((role) =>
    ['eor', 'candidate', 'admin', 'hr', 'payroll_admin'].includes(role.toLowerCase())
  );

  // Payroll tabs should only be visible if user has employment record (checked on login)
  const canAccessPayslips = hasPayslipRole && user?.hasEmploymentRecord;

  // Load document counts
  const loadDocumentCounts = async () => {
    try {
      setLoading(true);
      const counts = await documentsService.getDocumentCounts();
      setDocumentCounts(counts);
    } catch (error) {
      console.error('Failed to load document counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentCounts();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Map tab index to category
  const getCategoryForTab = (tabIndex: number): DocumentCategory => {
    const categories: DocumentCategory[] = ['cv', 'identity', 'employment', 'education'];
    return categories[tabIndex];
  };

  // Handle document changes (upload/delete)
  const handleDocumentChange = () => {
    loadDocumentCounts();
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
            onChange={handleTabChange}
            aria-label="document management tabs"
            TabIndicatorProps={{
              sx: { backgroundColor: 'primary.main', height: 3 }
            }}
          >
            <StyledTab
              icon={<DescriptionIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  CVs
                  <Chip
                    label={documentCounts.cv}
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 24,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              }
              id="documents-tab-0"
              aria-controls="documents-tabpanel-0"
            />
            <StyledTab
              icon={<BadgeIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Identity
                  <Chip
                    label={documentCounts.identity}
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 24,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              }
              id="documents-tab-1"
              aria-controls="documents-tabpanel-1"
            />
            <StyledTab
              icon={<WorkIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Employment
                  <Chip
                    label={documentCounts.employment}
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 24,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              }
              id="documents-tab-2"
              aria-controls="documents-tabpanel-2"
            />
            <StyledTab
              icon={<SchoolIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Education
                  <Chip
                    label={documentCounts.education}
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 24,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              }
              id="documents-tab-3"
              aria-controls="documents-tabpanel-3"
            />
            {canAccessPayslips && (
              <StyledTab
                icon={<PayslipIcon />}
                iconPosition="start"
                label="My Payslips"
                id="documents-tab-4"
                aria-controls="documents-tabpanel-4"
              />
            )}
            {canAccessPayslips && (
              <StyledTab
                icon={<ContributionIcon />}
                iconPosition="start"
                label="Contribution Summary"
                id="documents-tab-5"
                aria-controls="documents-tabpanel-5"
              />
            )}
            {canAccessPayslips && (
              <StyledTab
                icon={<TaxDocIcon />}
                iconPosition="start"
                label="Tax Documents"
                id="documents-tab-6"
                aria-controls="documents-tabpanel-6"
              />
            )}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Curriculum Vitae and resumes
          </Typography>
          <DocumentList
            category="cv"
            onDocumentChange={handleDocumentChange}
            embedded={false}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Passport, ID cards, and identity documents
          </Typography>
          <DocumentList
            category="identity"
            onDocumentChange={handleDocumentChange}
            embedded={false}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Contracts, offer letters, and employment documents
          </Typography>
          <DocumentList
            category="employment"
            onDocumentChange={handleDocumentChange}
            embedded={false}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Degrees, transcripts, and certificates
          </Typography>
          <DocumentList
            category="education"
            onDocumentChange={handleDocumentChange}
            embedded={false}
          />
        </TabPanel>

        {canAccessPayslips && (
          <TabPanel value={activeTab} index={4}>
            <PayslipListView />
          </TabPanel>
        )}

        {canAccessPayslips && (
          <TabPanel value={activeTab} index={5}>
            <ContributionSummaryTab />
          </TabPanel>
        )}

        {canAccessPayslips && (
          <TabPanel value={activeTab} index={6}>
            <TaxDocumentsTab />
          </TabPanel>
        )}

        {/* Help Text */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            All uploads are securely stored and only accessible by authorized personnel.
            Verified documents cannot be deleted - contact HR if you need assistance.
          </Typography>
        </Box>
      </Container>
    </LayoutMUI>
  );
};

export default MyDocumentsPage;
