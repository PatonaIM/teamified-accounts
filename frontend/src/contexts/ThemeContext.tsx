import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import type { ThemeMode } from '../theme/themeConfig';
import { createAppTheme } from '../theme/themeConfig';
import { themesApi } from '../api/themes';
import type { UserTheme, ThemeConfig } from '../api/themes';

interface ThemeContextType {
  currentTheme: ThemeMode | 'custom';
  setTheme: (theme: ThemeMode) => void;
  customTheme: UserTheme | null;
  loadCustomTheme: (theme: UserTheme) => void;
  clearCustomTheme: () => void;
  refreshActiveTheme: () => Promise<void>;
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'teamified_theme';
const CUSTOM_THEME_STORAGE_KEY = 'teamified_custom_theme';
const MODE_STORAGE_KEY = 'teamified_color_mode';

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

const getStoredMode = (isAuthenticated: boolean): 'light' | 'dark' => {
  // Default to light mode for unauthenticated users
  if (!isAuthenticated) {
    return 'light';
  }
  
  if (typeof window === 'undefined') {
    return 'light';
  }
  
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return (stored === 'dark' ? 'dark' : 'light');
  } catch {
    return 'light';
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
  const [isAuthenticated, setIsAuthenticated] = useState(isUserAuthenticated());
  const [mode, setMode] = useState<'light' | 'dark'>(getStoredMode(isUserAuthenticated()));

  useEffect(() => {
    const authStatus = isUserAuthenticated();
    setIsAuthenticated(authStatus);

    // Reset to light mode when user logs out
    if (!authStatus && isAuthenticated) {
      setMode('light');
    }

    const interval = setInterval(() => {
      const newAuthStatus = isUserAuthenticated();
      if (newAuthStatus !== isAuthenticated) {
        setIsAuthenticated(newAuthStatus);
        // Reset to light mode on logout
        if (!newAuthStatus) {
          setMode('light');
        } else {
          // Load saved mode preference on login
          setMode(getStoredMode(true));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const refreshActiveTheme = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const activeTheme = await themesApi.getActiveTheme();
      if (activeTheme) {
        loadCustomTheme(activeTheme);
      }
    } catch (error) {
      console.error('Failed to load active theme:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshActiveTheme();
    }
  }, [isAuthenticated]);

  const setTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    }
  };

  const loadCustomTheme = (theme: UserTheme) => {
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
  };

  const clearCustomTheme = () => {
    setCustomTheme(null);
    if (currentTheme === 'custom') {
      setTheme('teamified');
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear custom theme from localStorage:', error);
      }
    }
  };

  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    
    // Only save preference for authenticated users
    if (isAuthenticated && typeof window !== 'undefined') {
      try {
        localStorage.setItem(MODE_STORAGE_KEY, newMode);
      } catch (error) {
        console.error('Failed to save mode preference:', error);
      }
    }
  };

  let theme = createAppTheme(currentTheme === 'custom' ? 'teamified' : currentTheme);

  if (currentTheme === 'custom' && customTheme) {
    theme = applyCustomTheme(theme, customTheme.themeConfig);
  }

  // Override the theme mode based on user preference
  theme = createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      mode,
    },
  });

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        customTheme,
        loadCustomTheme,
        clearCustomTheme,
        refreshActiveTheme,
        mode,
        toggleColorMode,
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
