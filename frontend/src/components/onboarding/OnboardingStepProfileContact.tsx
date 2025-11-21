/**
 * Onboarding Step: Profile & Contact
 *
 * Step 1 of the onboarding wizard.
 * Uses ProfileTabsManager for consistent UX with Profile page.
 * Includes auto-save, validation, and step completion tracking.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ProfileTabsManager from '../profile/ProfileTabsManager';
import { onboardingService, type OnboardingProfileData } from '../../services/onboardingService';
import { profileService } from '../../services/profileService';
import { getCurrentUser } from '../../services/authService';
import axios from 'axios';
import type { ProfileData } from '../profile/shared/types';
import { ONBOARDING_REQUIRED_FIELDS } from '../../config/profileRequirements';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.125rem',
  color: '#1a1a1a',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

interface OnboardingStepProfileContactProps {
  employmentRecordId: string;
  onComplete: (complete: boolean) => void;
  onError: (error: string | null) => void;
}

interface EmploymentRecord {
  id: string;
  clientId: string;
  status: string;
}

const OnboardingStepProfileContact: React.FC<OnboardingStepProfileContactProps> = ({
  employmentRecordId,
  onComplete,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  /**
   * Validate if all onboarding required fields are filled
   * Based on ONBOARDING_REQUIRED_FIELDS configuration
   */
  const validateOnboardingCompletion = (data: ProfileData): boolean => {
    console.log('=== ONBOARDING VALIDATION START ===');
    console.log('Full profile data:', JSON.stringify(data, null, 2));

    // Core fields (firstName, lastName, dateOfBirth)
    const hasCoreFields = !!(data.firstName && data.lastName && data.dateOfBirth);
    console.log('Core fields:', {
      firstName: data.firstName || '(missing)',
      lastName: data.lastName || '(missing)',
      dateOfBirth: data.dateOfBirth || '(missing)',
      valid: hasCoreFields
    });

    // Personal fields (personalMobile, personalEmail)
    const hasPersonalFields = !!(data.personalMobile && data.personalEmail);
    console.log('Personal fields:', {
      personalMobile: data.personalMobile || '(missing)',
      personalEmail: data.personalEmail || '(missing)',
      valid: hasPersonalFields
    });

    // Address fields (addressLine1, city, stateProvince, postalCode, country)
    const address = data.presentAddress;
    const hasAddressFields = !!(
      address?.addressLine1 &&
      address?.city &&
      address?.stateProvince &&
      address?.postalCode &&
      address?.country
    );
    console.log('Address fields:', {
      addressLine1: address?.addressLine1 || '(missing)',
      city: address?.city || '(missing)',
      stateProvince: address?.stateProvince || '(missing)',
      postalCode: address?.postalCode || '(missing)',
      country: address?.country || '(missing)',
      valid: hasAddressFields
    });

    // Emergency contacts (at least one required)
    const emergencyContacts = data.emergencyContacts || [];
    const hasEmergencyContact = emergencyContacts.length > 0;
    console.log('Emergency contacts:', {
      count: emergencyContacts.length,
      contacts: emergencyContacts,
      valid: hasEmergencyContact
    });

    const isComplete = hasCoreFields && hasPersonalFields && hasAddressFields && hasEmergencyContact;
    console.log('=== VALIDATION RESULT:', isComplete ? 'COMPLETE ✓' : 'INCOMPLETE ✗', '===');

    if (!isComplete) {
      console.log('Missing required fields:');
      if (!hasCoreFields) console.log('  - Core fields (first name, last name, DOB)');
      if (!hasPersonalFields) console.log('  - Personal fields (personal mobile, personal email)');
      if (!hasAddressFields) console.log('  - Address fields');
      if (!hasEmergencyContact) console.log('  - Emergency contact');
    }

    return isComplete;
  };

  // Load initial data and employment context
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        onError(null);

        console.log('🔄 Loading onboarding data...');

        // Get user info from auth service
        const userInfo = await getCurrentUser();
        setUserId(userInfo.id || '');

        // Get employment data to extract clientId
        const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
        const employmentResponse = await axios.get(`${API_BASE_URL}/v1/auth/me/employment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Backend returns array directly, not wrapped in employmentRecords property
        const employmentRecords = Array.isArray(employmentResponse.data) ? employmentResponse.data : [];
        const currentEmployment = employmentRecords.find(
          (record: EmploymentRecord) => record.id === employmentRecordId
        );
        if (currentEmployment) {
          setClientId(currentEmployment.clientId);
        }

        // Load current profile data to check if already complete
        if (userInfo.id) {
          console.log('📋 Loading profile data to check completion...');
          const currentProfileData = await profileService.getProfileData();
          setProfileData(currentProfileData);

          // Check if form is already complete
          const isComplete = validateOnboardingCompletion(currentProfileData);
          onComplete(isComplete);
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Error loading data:', error);
        onError(error.message || 'Failed to load profile data');
        setLoading(false);
      }
    };

    loadData();
  }, [employmentRecordId, onError]);

  // Re-validate whenever profile data changes (e.g., when returning to this step)
  useEffect(() => {
    if (profileData) {
      console.log('🔍 Profile data changed, re-validating...');
      const isComplete = validateOnboardingCompletion(profileData);
      onComplete(isComplete);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]); // onComplete intentionally omitted to avoid re-render loops

  // Custom save handler for onboarding context
  const handleOnboardingSave = async (updatedProfileData: ProfileData, tabName: string) => {
    try {
      setSaving(true);

      // Use profileService to save the full profile data
      // This ensures all fields are properly saved to the database
      await profileService.updateProfileData(updatedProfileData);

      // Update local state
      setProfileData(updatedProfileData);

      onError(null);

      // Validate if all required fields are now complete
      const isComplete = validateOnboardingCompletion(updatedProfileData);
      onComplete(isComplete);
    } catch (error: any) {
      console.error('Save failed:', error);
      onError(error.message || 'Failed to save profile data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#A16AE8',
            mb: 1,
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}
        >
          Profile & Contact Information
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#6B7280', mb: 2 }}
        >
          Complete your profile information. All fields marked with * are required.
          Your information is automatically saved as you fill out each section.
        </Typography>
      </Box>

      {/* Profile Tabs Manager for Onboarding */}
      <ProfileTabsManager
        userId={userId}
        employmentRecordId={employmentRecordId}
        mode="onboarding"
        includeTabs={['core', 'personal', 'address', 'governmentIds', 'emergency', 'banking']}
        onSave={handleOnboardingSave}
        showProgressIndicator={false}
      />

      {/* Auto-save indicator */}
      {saving && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <CircularProgress size={16} />
          <Typography variant="caption">Saving...</Typography>
        </Box>
      )}

      {/* Help text */}
      <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Complete All Tabs
        </Typography>
        <Typography variant="body2">
          Make sure to fill out all required fields in each tab before proceeding to the next step.
          Your progress is saved automatically.
        </Typography>
      </Alert>
    </Box>
  );
};

export default OnboardingStepProfileContact;
