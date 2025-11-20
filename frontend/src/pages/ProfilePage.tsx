/**
 * Profile Page
 *
 * Complete user profile management page with tabbed interface.
 * Now uses ProfileTabsManager for shared component architecture.
 */

import React, { useState, useEffect } from 'react';
import { calculateProfileCompletion } from '../utils/profileCompletion';
import { profileService } from '../services/profileService';
import { salaryHistoryService } from '../services/salaryHistoryService';
import { employmentRecordsService } from '../services/employmentRecordsService';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Work as WorkIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import EmploymentHistoryTimeline from '../components/employment-records/EmploymentHistoryTimeline';
import ProfileSalaryTimeline from '../components/ProfileSalaryTimeline';
import ProfileTabsManager from '../components/profile/ProfileTabsManager';
import type { EmploymentRecord } from '../types/employmentRecords';
import type { SalaryHistory } from '../types/salary-history.types';
import type { ProfileData } from '../utils/profileCompletion';

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Employment and salary history state
  const [employmentRecords, setEmploymentRecords] = useState<EmploymentRecord[]>([]);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoadingData(true);
        const data = await profileService.getProfileData();
        console.log('Profile data loaded:', data);
        setProfileData(data);

        // Load employment and salary history if user ID is available
        if (data.id) {
          console.log('User ID found, loading history for:', data.id);
          await loadEmploymentAndSalaryHistory(data.id);
        } else {
          console.log('No user ID found in profile data');
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadProfileData();
  }, []);

  // Load employment and salary history
  const loadEmploymentAndSalaryHistory = async (userId: string) => {
    try {
      setIsLoadingHistory(true);
      console.log('Loading employment and salary history for user:', userId);

      // Load employment records for the user
      const employment = await employmentRecordsService.getUserEmploymentRecords(userId);
      console.log('Employment records:', employment);
      setEmploymentRecords(employment);

      // Try to load salary history - may fail with 403 for users without permission (candidates)
      try {
        const salaryResponse = await salaryHistoryService.searchSalaryHistory({ userId });
        console.log('Salary history response:', salaryResponse);
        // Extract items array from paginated response
        setSalaryHistory(salaryResponse.items || []);
      } catch (salaryError: any) {
        // Silently handle 403 errors (user doesn't have permission to view salary history)
        if (salaryError?.response?.status === 403 || salaryError?.message?.includes('Forbidden')) {
          console.log('User does not have permission to view salary history');
          setSalaryHistory([]);
        } else {
          console.error('Failed to load salary history:', salaryError);
        }
      }
    } catch (error) {
      console.error('Failed to load employment and salary history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Calculate profile completion percentage using shared utility
  const calculateCompletion = (): number => {
    if (!profileData) return 0;
    return calculateProfileCompletion(profileData);
  };

  if (isLoadingData) {
    return (
      <LayoutMUI>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </LayoutMUI>
    );
  }

  if (!profileData) {
    return (
      <LayoutMUI>
        <Typography variant="h5" color="error">
          Failed to load profile data. Please refresh the page.
        </Typography>
      </LayoutMUI>
    );
  }

  return (
    <LayoutMUI>
      <Box sx={{ py: 4, px: 3 }}>
        {/* Profile Tabs Manager */}
        <Box sx={{ mb: 4 }}>
          <ProfileTabsManager
            userId={profileData.id || ''}
            mode="full"
            excludeTabs={['documents']}
            showProgressIndicator={false}
          />
        </Box>

        {/* Employment History Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #E5E7EB' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
              Employment History
            </Typography>
          </Box>
          {isLoadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <EmploymentHistoryTimeline
              employmentRecords={employmentRecords}
              userId={profileData.id}
              userName={`${profileData.firstName} ${profileData.lastName}`}
            />
          )}
        </Paper>

        {/* Salary History Section */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
              Salary History
            </Typography>
          </Box>
          <ProfileSalaryTimeline
            salaryHistory={salaryHistory}
            isLoading={isLoadingHistory}
          />
        </Paper>
      </Box>
    </LayoutMUI>
  );
};

export default ProfilePage;
