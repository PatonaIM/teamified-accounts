/**
 * Profile Tabs Manager
 *
 * Orchestrator component that manages profile form tabs.
 * Supports both full profile mode and onboarding mode.
 * Dynamically shows/hides tabs based on configuration and employment status.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Tabs, Tab, Snackbar, Alert, CircularProgress } from '@mui/material';
import {
  Person as UserIcon,
  LocationOn as MapPinIcon,
  Security as ShieldIcon,
  Phone as PhoneIcon,
  CreditCard as CreditCardIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

// Styled components
import {
  StyledTab,
  TabsPanelContainer,
  TabContainer,
  TabsIndicatorStyle,
  LoadingBox
} from './shared/StyledComponents';

// Tab components
import { CoreInformationTab } from './tabs/CoreInformationTab';
import { PersonalDetailsTab } from './tabs/PersonalDetailsTab';
import { AddressTab } from './tabs/AddressTab';
import { GovernmentIDsTab } from './tabs/GovernmentIDsTab';
import { EmergencyContactsTab } from './tabs/EmergencyContactsTab';
import { BankingTab } from './tabs/BankingTab';
import { PreferencesTab } from './tabs/PreferencesTab';
import { RolesPermissionsTab } from './tabs/RolesPermissionsTab';

// Hooks and services
import { useEmploymentCountries } from './hooks/useEmploymentCountries';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/profileService';

// Types
import type {
  ProfileTabsManagerProps,
  ProfileTabName,
  ProfileData,
  TabMetadata
} from './shared/types';

export const ProfileTabsManager: React.FC<ProfileTabsManagerProps> = ({
  userId,
  employmentRecordId,
  mode = 'full',
  includeTabs,
  excludeTabs,
  onSave,
  onComplete,
  initialTab = 0,
  showProgressIndicator = false
}) => {
  // State
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check if current user is admin/hr for Roles & Permissions tab visibility
  const { user } = useAuth();
  const isAdminOrHr = user?.roles?.some((role: string) =>
    ['admin', 'hr'].includes(role)
  ) ?? false;

  // Fetch employment countries for Government IDs tab
  // Pass userId to fetch employment records for the specific user being viewed/edited
  const {
    countryCodes,
    isLoading: isLoadingCountries,
    error: countryError,
    hasEmploymentRecords
  } = useEmploymentCountries(userId);

  // Load profile data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        // Determine if we should use admin endpoint or current user endpoint
        // Use admin endpoint only if:
        // 1. userId is provided
        // 2. Current user is admin/hr
        // 3. userId is different from current user's ID
        const shouldUseAdminEndpoint = userId && isAdminOrHr && userId !== user?.id;

        const data = shouldUseAdminEndpoint
          ? await profileService.getUserProfileData(userId)
          : await profileService.getProfileData();
        setProfileData(data);
      } catch (error) {
        console.error('Failed to load profile data:', error);
        setSaveStatus({
          type: 'error',
          message: 'Failed to load profile data. Please refresh the page.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [userId, isAdminOrHr, user?.id]);

  // Handle field change
  const handleChange = useCallback((field: string, value: any) => {
    setProfileData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  }, []);

  // Handle address change
  const handleAddressChange = useCallback((field: string, value: string) => {
    setProfileData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        presentAddress: {
          ...prev.presentAddress,
          [field]: value
        }
      };
    });
  }, []);

  // Handle save
  const handleSave = useCallback(async (tabName: string) => {
    if (!profileData) return;

    try {
      setIsSaving(true);

      if (onSave) {
        // Use custom save handler if provided (for onboarding)
        await onSave(profileData, tabName);
      } else {
        // Default save handler (for profile page)
        const updatedProfile = await profileService.updateProfileData(profileData);
        setProfileData(updatedProfile);
      }

      setSaveStatus({
        type: 'success',
        message: `${tabName} saved successfully!`
      });

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveStatus({
        type: 'error',
        message: 'Failed to save information. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  }, [profileData, onSave]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Define all available tabs with metadata
  const allTabs: TabMetadata[] = [
    {
      name: 'core',
      label: 'Basic Information',
      icon: <UserIcon />,
      component: CoreInformationTab,
      visible: true
    },
    {
      name: 'personal',
      label: 'Personal Details',
      icon: <UserIcon />,
      component: PersonalDetailsTab,
      visible: true
    },
    {
      name: 'address',
      label: 'Address',
      icon: <MapPinIcon />,
      component: AddressTab,
      visible: true
    },
    {
      name: 'governmentIds',
      label: 'Government IDs',
      icon: <ShieldIcon />,
      component: GovernmentIDsTab,
      visible: hasEmploymentRecords // Only show if user has employment records
    },
    {
      name: 'emergency',
      label: 'Emergency Contacts',
      icon: <PhoneIcon />,
      component: EmergencyContactsTab,
      visible: true
    },
    {
      name: 'banking',
      label: 'Banking',
      icon: <CreditCardIcon />,
      component: BankingTab,
      visible: hasEmploymentRecords // Only show if user has employment records
    },
    {
      name: 'preferences',
      label: 'Preferences',
      icon: <SettingsIcon />,
      component: PreferencesTab,
      visible: true
    },
    {
      name: 'rolesPermissions',
      label: 'Roles & Permissions',
      icon: <AdminIcon />,
      component: RolesPermissionsTab,
      visible: isAdminOrHr // Only visible to admin/hr users
    }
  ];

  // Filter tabs based on configuration
  const visibleTabs = allTabs.filter(tab => {
    // Check base visibility
    if (!tab.visible) return false;

    // Apply includeTabs filter if provided
    if (includeTabs && includeTabs.length > 0) {
      if (!includeTabs.includes(tab.name)) return false;
    }

    // Apply excludeTabs filter if provided
    if (excludeTabs && excludeTabs.length > 0) {
      if (excludeTabs.includes(tab.name)) return false;
    }

    return true;
  });

  // Get active tab component
  const ActiveTabComponent = visibleTabs[activeTab]?.component;

  // Loading state
  if (isLoading || !profileData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LoadingBox>
          <CircularProgress size={60} />
        </LoadingBox>
      </Container>
    );
  }

  return (
    <Box>
      {/* Tabs Navigation */}
      <TabsPanelContainer>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={(theme) => TabsIndicatorStyle(theme)}
        >
          {visibleTabs.map((tab, index) => (
            <StyledTab
              key={tab.name}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>

        {/* Success/Error Messages */}
        <Snackbar
          open={!!saveStatus}
          autoHideDuration={3000}
          onClose={() => setSaveStatus(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSaveStatus(null)}
            severity={saveStatus?.type === 'success' ? 'success' : 'error'}
            sx={{ borderRadius: 2 }}
          >
            {saveStatus?.message}
          </Alert>
        </Snackbar>

        {/* Tab Content */}
        <TabContainer>
          {ActiveTabComponent && (
            <ActiveTabComponent
              profileData={profileData}
              onSave={handleSave}
              onChange={handleChange}
              onAddressChange={handleAddressChange}
              isLoading={isLoading}
              isSaving={isSaving}
              mode={mode}
              // Government IDs specific props
              {...(visibleTabs[activeTab].name === 'governmentIds' && {
                countryCodes,
                isLoadingCountries,
                countryError
              })}
              // Roles & Permissions specific props
              {...(visibleTabs[activeTab].name === 'rolesPermissions' && {
                userId
              })}
            />
          )}
        </TabContainer>
      </TabsPanelContainer>
    </Box>
  );
};

export default ProfileTabsManager;
