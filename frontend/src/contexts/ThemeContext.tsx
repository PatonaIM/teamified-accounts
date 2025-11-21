import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import type { ThemeMode } from '../theme/themeConfig';
import { createAppTheme } from '../theme/themeConfig';
import { themesApi } from '../api/themes';
import type { UserTheme, ThemeConfig } from '../api/themes';
import { themePreferenceService } from '../services/themePreferenceService';

interface ThemeContextType {
  currentTheme: ThemeMode | 'custom';
  setTheme: (theme: ThemeMode) => void;
  customTheme: UserTheme | null;
  loadCustomTheme: (theme: UserTheme) => void;
  clearCustomTheme: () => void;
  refreshActiveTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'teamified_theme_auth';
const CUSTOM_THEME_STORAGE_KEY = 'teamified_custom_theme_auth';

// Public routes that should always use light mode
const PUBLIC_LIGHT_MODE_ROUTES = [
  '/login',
  '/docs',
  '/test',
  '/signup-select',
  '/signup-candidate',
  '/signup-client-admin',
  '/reset-password',
  '/verify-email',
  '/invite',
  '/invitations',
];

const isPublicLightModeRoute = (pathname: string): boolean => {
  return PUBLIC_LIGHT_MODE_ROUTES.some(route => pathname.startsWith(route));
};

const getStoredTheme = (): ThemeMode | 'custom' => {
  if (typeof window === 'undefined') {
    return 'teamified';
  }
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as ThemeMode | 'custom') || 'teamified';
  } catch {
    return 'teamified';
  }
};

const getStoredCustomTheme = (): UserTheme | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const isUserAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const token = localStorage.getItem('teamified_access_token');
    return !!token;
  } catch {
    return false;
  }
};

export const clearThemePreferences = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
    localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear theme preferences:', error);
  }
};

const applyCustomTheme = (baseTheme: Theme, customConfig: ThemeConfig): Theme => {
  const updatedTheme = { ...baseTheme };
  const isDarkMode = customConfig.palette?.mode === 'dark';

  if (customConfig.palette) {
    updatedTheme.palette = {
      ...baseTheme.palette,
      mode: customConfig.palette.mode || baseTheme.palette.mode,
      primary: {
        ...baseTheme.palette.primary,
        ...customConfig.palette.primary,
      },
      secondary: {
        ...baseTheme.palette.secondary,
        ...customConfig.palette.secondary,
      },
      divider: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    };

    if (customConfig.palette.error) {
      updatedTheme.palette.error = {
        ...baseTheme.palette.error,
        ...customConfig.palette.error,
      };
    }
    if (customConfig.palette.warning) {
      updatedTheme.palette.warning = {
        ...baseTheme.palette.warning,
        ...customConfig.palette.warning,
      };
    }
    if (customConfig.palette.info) {
      updatedTheme.palette.info = {
        ...baseTheme.palette.info,
        ...customConfig.palette.info,
      };
    }
    if (customConfig.palette.success) {
      updatedTheme.palette.success = {
        ...baseTheme.palette.success,
        ...customConfig.palette.success,
      };
    }
    if (customConfig.palette.background) {
      updatedTheme.palette.background = {
        ...baseTheme.palette.background,
        ...customConfig.palette.background,
      };
    }
    if (customConfig.palette.text) {
      updatedTheme.palette.text = {
        ...baseTheme.palette.text,
        ...customConfig.palette.text,
      };
    }
  }

  if (customConfig.typography) {
    updatedTheme.typography = {
      ...baseTheme.typography,
      fontFamily: customConfig.typography.fontFamily || baseTheme.typography.fontFamily,
      fontSize: customConfig.typography.fontSize || baseTheme.typography.fontSize,
    };

    if (customConfig.typography.h1) {
      updatedTheme.typography.h1 = {
        ...baseTheme.typography.h1,
        ...customConfig.typography.h1,
      };
    }
    if (customConfig.typography.h2) {
      updatedTheme.typography.h2 = {
        ...baseTheme.typography.h2,
        ...customConfig.typography.h2,
      };
    }
    if (customConfig.typography.h3) {
      updatedTheme.typography.h3 = {
        ...baseTheme.typography.h3,
        ...customConfig.typography.h3,
      };
    }
    if (customConfig.typography.h4) {
      updatedTheme.typography.h4 = {
        ...baseTheme.typography.h4,
        ...customConfig.typography.h4,
      };
    }
    if (customConfig.typography.h5) {
      updatedTheme.typography.h5 = {
        ...baseTheme.typography.h5,
        ...customConfig.typography.h5,
      };
    }
    if (customConfig.typography.h6) {
      updatedTheme.typography.h6 = {
        ...baseTheme.typography.h6,
        ...customConfig.typography.h6,
      };
    }
    if (customConfig.typography.body1) {
      updatedTheme.typography.body1 = {
        ...baseTheme.typography.body1,
        ...customConfig.typography.body1,
      };
    }
    if (customConfig.typography.body2) {
      updatedTheme.typography.body2 = {
        ...baseTheme.typography.body2,
        ...customConfig.typography.body2,
      };
    }
  }

  // Recreate theme with shape, spacing, and component styles applied
  // This ensures spacing is properly converted to a function
  const componentOverrides = customConfig.componentStyles ? {
    MuiButton: {
      defaultProps: {
        ...baseTheme.components?.MuiButton?.defaultProps,
        variant: customConfig.componentStyles.buttonVariant || baseTheme.components?.MuiButton?.defaultProps?.variant || 'contained',
        disableElevation: customConfig.componentStyles.buttonElevation === false,
      },
      styleOverrides: {
        ...baseTheme.components?.MuiButton?.styleOverrides,
        root: {
          ...((baseTheme.components?.MuiButton?.styleOverrides as any)?.root || {}),
          borderRadius: customConfig.componentStyles.buttonBorderRadius ?? 8,
          textTransform: customConfig.componentStyles.buttonTextTransform || 'none',
        },
      },
    },
    MuiChip: {
      defaultProps: {
        ...baseTheme.components?.MuiChip?.defaultProps,
        variant: customConfig.componentStyles.chipVariant || 'filled',
      },
      styleOverrides: {
        ...baseTheme.components?.MuiChip?.styleOverrides,
        root: {
          ...((baseTheme.components?.MuiChip?.styleOverrides as any)?.root || {}),
          borderRadius: customConfig.componentStyles.chipBorderRadius ?? 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        ...baseTheme.components?.MuiCard?.styleOverrides,
        root: {
          ...((baseTheme.components?.MuiCard?.styleOverrides as any)?.root || {}),
          borderRadius: customConfig.componentStyles.cardBorderRadius ?? 8,
        },
      },
    },
  } : {};

  const themeWithCustomizations = createTheme({
    ...updatedTheme,
    shape: customConfig.shape || baseTheme.shape,
    spacing: customConfig.spacing || baseTheme.spacing,
    components: {
      ...baseTheme.components,
      ...componentOverrides,
    },
  });

  return themeWithCustomizations;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode | 'custom'>(getStoredTheme());
  const [customTheme, setCustomTheme] = useState<UserTheme | null>(getStoredCustomTheme());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Check if we're on a public route that requires light mode
  const isPublicRoute = isPublicLightModeRoute(currentPath);

  // Listen for route changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);
    
    // Listen for pushState/replaceState (programmatic navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    const authStatus = isUserAuthenticated();
    setIsAuthenticated(authStatus);

    const interval = setInterval(() => {
      const newAuthStatus = isUserAuthenticated();
      if (newAuthStatus !== isAuthenticated) {
        setIsAuthenticated(newAuthStatus);
        
        // If user logged out, clear theme preferences and reset to light mode
        if (isAuthenticated && !newAuthStatus) {
          clearThemePreferences();
          setCurrentTheme('teamified');
          setCustomTheme(null);
        }
        
        // If user logged in, load their theme preference from backend
        if (!isAuthenticated && newAuthStatus) {
          loadUserThemePreference();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Load user's theme preference from backend on initial mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !isPublicRoute) {
      loadUserThemePreference();
    }
  }, []);

  const loadUserThemePreference = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const preference = await themePreferenceService.loadThemePreference();
      
      if (preference) {
        if (preference.themeMode === 'custom' && preference.customThemeId) {
          try {
            const customTheme = await themesApi.getThemeById(preference.customThemeId);
            if (customTheme) {
              setCustomTheme(customTheme);
              setCurrentTheme('custom');
              if (typeof window !== 'undefined') {
                localStorage.setItem(THEME_STORAGE_KEY, 'custom');
                localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customTheme));
              }
            } else {
              console.warn('Custom theme not found, falling back to teamified');
              await clearStaleCustomThemePreference();
              setCurrentTheme('teamified');
              if (typeof window !== 'undefined') {
                localStorage.setItem(THEME_STORAGE_KEY, 'teamified');
              }
            }
          } catch (error: any) {
            const is404or403 = error?.response?.status === 404 || error?.response?.status === 403;
            if (is404or403) {
              console.warn('Custom theme not found or not accessible (ownership check failed), clearing stale preference');
              await clearStaleCustomThemePreference();
            } else {
              console.error('Failed to load custom theme by ID:', error);
            }
            setCurrentTheme('teamified');
            if (typeof window !== 'undefined') {
              localStorage.setItem(THEME_STORAGE_KEY, 'teamified');
            }
          }
        } else if (preference.themeMode) {
          setCurrentTheme(preference.themeMode);
          if (typeof window !== 'undefined') {
            localStorage.setItem(THEME_STORAGE_KEY, preference.themeMode as string);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user theme preference:', error);
    }
  };

  const clearStaleCustomThemePreference = async () => {
    try {
      await themePreferenceService.saveThemePreference('teamified');
    } catch (error) {
      console.error('Failed to clear stale custom theme preference:', error);
    }
  };

  const refreshActiveTheme = async () => {
    if (!isAuthenticated) {
      return;
    }

    await loadUserThemePreference();
  };

  useEffect(() => {
    if (isAuthenticated && !isPublicRoute) {
      refreshActiveTheme();
    }
  }, [isAuthenticated, isPublicRoute]);

  const setTheme = (theme: ThemeMode) => {
    // Only save theme preferences if user is authenticated
    if (!isAuthenticated) {
      return;
    }
    
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    }
    
    themePreferenceService.saveThemePreference(theme as ThemeMode).catch(error => {
      console.error('Failed to save theme preference to backend:', error);
    });
  };

  const loadCustomTheme = (theme: UserTheme) => {
    // Only save theme preferences if user is authenticated
    if (!isAuthenticated) {
      return;
    }
    
    setCustomTheme(theme);
    setCurrentTheme('custom');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, 'custom');
        localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(theme));
      } catch (error) {
        console.error('Failed to save custom theme to localStorage:', error);
      }
    }
    
    themePreferenceService.saveThemePreference('custom', theme.id).catch(error => {
      console.error('Failed to save custom theme preference to backend:', error);
    });
  };

  const clearCustomTheme = () => {
    setCustomTheme(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear custom theme from localStorage:', error);
      }
    }
    
    if (currentTheme === 'custom') {
      setTheme('teamified');
    }
  };

  // Force light mode for public routes
  let effectiveTheme: ThemeMode | 'custom' = currentTheme;
  if (isPublicRoute || !isAuthenticated) {
    effectiveTheme = 'teamified'; // Always use light mode for public routes
  }

  let theme = createAppTheme(effectiveTheme === 'custom' ? 'teamified' : effectiveTheme);

  if (effectiveTheme === 'custom' && customTheme && isAuthenticated && !isPublicRoute) {
    theme = applyCustomTheme(theme, customTheme.themeConfig);
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: effectiveTheme,
        setTheme,
        customTheme,
        loadCustomTheme,
        clearCustomTheme,
        refreshActiveTheme,
      }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
