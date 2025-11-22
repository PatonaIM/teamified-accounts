import api from './api';
import type { ThemeMode } from '../theme/themeConfig';

export type ThemePreference = ThemeMode | 'custom';

export interface ThemePreferenceData {
  themeMode: ThemePreference;
  customThemeId?: string;
}

class ThemePreferenceService {
  async saveThemePreference(themeMode: ThemePreference, customThemeId?: string): Promise<void> {
    try {
      // Get current profile data first
      const currentProfile = await api.get('/v1/users/me/profile');
      const existingProfileData = currentProfile.data?.profileData || {};
      
      // Merge with new theme preference
      const updatedProfileData = {
        ...existingProfileData,
        themePreference: {
          themeMode,
          customThemeId: customThemeId || null,
          updatedAt: new Date().toISOString(),
        }
      };
      
      await api.put('/v1/users/me/profile', {
        profileData: updatedProfileData
      });
    } catch (error) {
      console.error('Failed to save theme preference to backend:', error);
      throw error;
    }
  }

  async loadThemePreference(): Promise<ThemePreferenceData | null> {
    try {
      // Load from profile endpoint which has profileData JSONB
      const response = await api.get('/v1/users/me/profile');
      const profileData = response.data?.profileData || response.data;
      
      if (!profileData || !profileData.themePreference) {
        return null;
      }
      
      const theme = profileData.themePreference;
      
      return {
        themeMode: theme.themeMode || 'teamified',
        customThemeId: theme.customThemeId || undefined,
      };
    } catch (error) {
      console.error('Failed to load theme preference from backend:', error);
      return null;
    }
  }
}

export const themePreferenceService = new ThemePreferenceService();
