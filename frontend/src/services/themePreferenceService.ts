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
      await api.put('/v1/users/me/profile', {
        profileData: {
          themePreference: {
            themeMode,
            customThemeId: customThemeId || null,
            updatedAt: new Date().toISOString(),
          }
        }
      });
    } catch (error) {
      console.error('Failed to save theme preference to backend:', error);
      throw error;
    }
  }

  async loadThemePreference(): Promise<ThemePreferenceData | null> {
    try {
      const response = await api.get('/v1/users/me/profile');
      const profileData = response.data?.profileData || response.data;
      
      if (profileData?.themePreference) {
        return {
          themeMode: profileData.themePreference.themeMode || 'teamified',
          customThemeId: profileData.themePreference.customThemeId || undefined,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load theme preference from backend:', error);
      return null;
    }
  }
}

export const themePreferenceService = new ThemePreferenceService();
