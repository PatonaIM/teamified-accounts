import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// LocalStorage keys
const ONBOARDING_STEP_KEY_PREFIX = 'onboarding_step_';
const ONBOARDING_DATA_KEY_PREFIX = 'onboarding_data_';

interface OnboardingProfileData {
  // Personal Information
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  
  // Address
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  
  // Emergency Contact
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
}

class OnboardingService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // ==================== Step Persistence ====================

  /**
   * Save current step to localStorage
   */
  saveStep(employmentRecordId: string, step: number): void {
    try {
      const key = `${ONBOARDING_STEP_KEY_PREFIX}${employmentRecordId}`;
      localStorage.setItem(key, step.toString());
    } catch (error) {
      console.error('Failed to save step to localStorage:', error);
    }
  }

  /**
   * Get saved step from localStorage
   */
  getSavedStep(employmentRecordId: string): number {
    try {
      const key = `${ONBOARDING_STEP_KEY_PREFIX}${employmentRecordId}`;
      const savedStep = localStorage.getItem(key);
      return savedStep ? parseInt(savedStep, 10) : 0;
    } catch (error) {
      console.error('Failed to get saved step from localStorage:', error);
      return 0;
    }
  }

  /**
   * Clear saved step from localStorage
   */
  clearSavedStep(employmentRecordId: string): void {
    try {
      const key = `${ONBOARDING_STEP_KEY_PREFIX}${employmentRecordId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear saved step from localStorage:', error);
    }
  }

  // ==================== Data Persistence ====================

  /**
   * Save form data to localStorage (auto-save)
   */
  saveFormData(employmentRecordId: string, step: number, data: any): void {
    try {
      const key = `${ONBOARDING_DATA_KEY_PREFIX}${employmentRecordId}_step${step}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save form data to localStorage:', error);
    }
  }

  /**
   * Get saved form data from localStorage
   */
  getSavedFormData(employmentRecordId: string, step: number): any | null {
    try {
      const key = `${ONBOARDING_DATA_KEY_PREFIX}${employmentRecordId}_step${step}`;
      const savedData = localStorage.getItem(key);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error('Failed to get saved form data from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear saved form data from localStorage
   */
  clearSavedFormData(employmentRecordId: string, step: number): void {
    try {
      const key = `${ONBOARDING_DATA_KEY_PREFIX}${employmentRecordId}_step${step}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear saved form data from localStorage:', error);
    }
  }

  /**
   * Clear all onboarding data for an employment record
   */
  clearAllOnboardingData(employmentRecordId: string): void {
    try {
      // Clear step
      this.clearSavedStep(employmentRecordId);
      
      // Clear all step data
      for (let step = 0; step < 10; step++) {
        this.clearSavedFormData(employmentRecordId, step);
      }
    } catch (error) {
      console.error('Failed to clear all onboarding data:', error);
    }
  }

  // ==================== API Integration ====================

  /**
   * Get current user's profile data
   */
  async getProfileData(): Promise<OnboardingProfileData> {
    try {
      const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
      const response = await axios.get(`${this.baseURL}/v1/auth/me/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.profileData || {};
    } catch (error: any) {
      console.error('Failed to get profile data:', error);
      throw new Error(error.response?.data?.message || 'Failed to load profile data');
    }
  }

  /**
   * Update user profile data with onboarding context
   */
  async updateProfileData(
    data: Partial<OnboardingProfileData>,
    employmentRecordId?: string,
    clientId?: string,
  ): Promise<void> {
    try {
      const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
      await axios.put(`${this.baseURL}/v1/users/me/profile`, {
        profileData: data,
        employmentRecordId,
        clientId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('Failed to update profile data:', error);
      throw new Error(error.response?.data?.message || 'Failed to save profile data');
    }
  }

  /**
   * Check if user has employment record in onboarding status
   */
  async hasOnboardingRecord(): Promise<{ hasRecord: boolean; recordId: string | null }> {
    try {
      const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
      const response = await axios.get(`${this.baseURL}/v1/auth/me/employment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const onboardingRecord = response.data.employmentRecords?.find(
        (record: any) => record.status === 'onboarding'
      );
      
      return {
        hasRecord: !!onboardingRecord,
        recordId: onboardingRecord?.id || null,
      };
    } catch (error: any) {
      console.error('Failed to check onboarding record:', error);
      return { hasRecord: false, recordId: null };
    }
  }

  /**
   * Submit onboarding for review
   */
  async submitForReview(employmentRecordId: string): Promise<void> {
    try {
      const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
      await axios.post(
        `${this.baseURL}/v1/onboarding/${employmentRecordId}/submit`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Clear all saved data after successful submission
      this.clearAllOnboardingData(employmentRecordId);
    } catch (error: any) {
      console.error('Failed to submit onboarding:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit onboarding');
    }
  }
}

export const onboardingService = new OnboardingService();
export type { OnboardingProfileData };

