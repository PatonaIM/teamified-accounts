import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import DocumentList from './DocumentList';
import { documentsService, type DocumentCategory } from '../../services/documentsService';

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 64,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '1rem',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(3),
  '&.Mui-selected': {
    color: '#A16AE8',
  },
}));

const CountChip = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  height: 20,
  minWidth: 24,
  background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.75rem',
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

interface DocumentTabsProps {
  employmentRecordId?: string;
  onDocumentsChange?: () => void;
  embedded?: boolean; // True when used inside wizard
}

const DocumentTabs: React.FC<DocumentTabsProps> = ({
  employmentRecordId,
  onDocumentsChange,
  embedded = false,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [documentCounts, setDocumentCounts] = useState({
    cv: 0,
    identity: 0,
    employment: 0,
    education: 0,
  });
  const [loading, setLoading] = useState(true);

  // LocalStorage key for persisting active tab
  const getTabStorageKey = () => {
    return employmentRecordId
      ? `documents_active_tab_${employmentRecordId}`
      : 'documents_active_tab';
  };

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

  // Load counts on mount
  useEffect(() => {
    loadDocumentCounts();
  }, []);

  // Restore active tab from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem(getTabStorageKey());
    if (savedTab !== null) {
      const tabIndex = parseInt(savedTab, 10);
      if (tabIndex >= 0 && tabIndex < 4) {
        setActiveTab(tabIndex);
      }
    }
  }, [employmentRecordId]);

  // Save active tab to localStorage
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    localStorage.setItem(getTabStorageKey(), newValue.toString());
  };

  // Map tab index to category
  const getCategoryForTab = (tabIndex: number): DocumentCategory => {
    const categories: DocumentCategory[] = ['cv', 'identity', 'employment', 'education'];
    return categories[tabIndex];
  };

  // Handle document changes (upload/delete)
  const handleDocumentChange = () => {
    loadDocumentCounts();
    onDocumentsChange?.();
  };

  const tabs = [
    {
      label: 'CVs',
      icon: <DescriptionIcon />,
      count: documentCounts.cv,
      description: 'Curriculum Vitae and resumes',
    },
    {
      label: 'Identity',
      icon: <BadgeIcon />,
      count: documentCounts.identity,
      description: 'Passport, ID cards, and identity documents',
    },
    {
      label: 'Employment',
      icon: <WorkIcon />,
      count: documentCounts.employment,
      description: 'Contracts, offer letters, and employment documents',
    },
    {
      label: 'Education',
      icon: <SchoolIcon />,
      count: documentCounts.education,
      description: 'Degrees, transcripts, and certificates',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: '1px solid #E5E7EB',
          '& .MuiTabs-indicator': {
            backgroundColor: '#A16AE8',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        {tabs.map((tab, index) => (
          <StyledTab
            key={index}
            icon={tab.icon}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {tab.label}
                    </Typography>
                    <CountChip label={tab.count} size="small" />
                  </Box>
                  {!embedded && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'left' }}>
                      {tab.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            }
            iconPosition="start"
          />
        ))}
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ pt: 3 }}>
        <DocumentList
          category={getCategoryForTab(activeTab)}
          employmentRecordId={employmentRecordId}
          onDocumentChange={handleDocumentChange}
          embedded={embedded}
        />
      </Box>
    </Box>
  );
};

export default DocumentTabs;

