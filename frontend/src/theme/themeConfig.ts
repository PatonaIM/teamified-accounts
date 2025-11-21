import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark' | 'teamified' | 'ocean' | 'sunset';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  description: string;
  palette: ThemeOptions['palette'];
}

// Teamified Brand Colors
const teamifiedColors = {
  primary: '#7C3AED', // Purple
  secondary: '#EC4899', // Pink
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const themeConfigs: Record<ThemeMode, ThemeConfig> = {
  light: {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright theme perfect for daytime use',
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#fff',
      },
      secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
        contrastText: '#fff',
      },
      background: {
        default: '#ffffff',
        paper: '#f5f5f5',
      },
      text: {
        primary: '#212121',
        secondary: '#757575',
      },
    },
  },
  
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes for low-light environments',
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
        light: '#e3f2fd',
        dark: '#42a5f5',
        contrastText: '#000',
      },
      secondary: {
        main: '#ce93d8',
        light: '#f3e5f5',
        dark: '#ab47bc',
        contrastText: '#000',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
      },
    },
  },
  
  teamified: {
    id: 'teamified',
    name: 'Teamified',
    description: 'Official Teamified brand colors with purple and pink accents',
    palette: {
      mode: 'light',
      primary: {
        main: teamifiedColors.primary,
        light: '#a78bfa',
        dark: '#5b21b6',
        contrastText: '#fff',
      },
      secondary: {
        main: teamifiedColors.secondary,
        light: '#f9a8d4',
        dark: '#be185d',
        contrastText: '#fff',
      },
      success: {
        main: teamifiedColors.success,
      },
      warning: {
        main: teamifiedColors.warning,
      },
      error: {
        main: teamifiedColors.error,
      },
      info: {
        main: teamifiedColors.info,
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
      },
    },
  },
  
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blues and teals inspired by the ocean',
    palette: {
      mode: 'light',
      primary: {
        main: '#0891b2',
        light: '#06b6d4',
        dark: '#0e7490',
        contrastText: '#fff',
      },
      secondary: {
        main: '#14b8a6',
        light: '#2dd4bf',
        dark: '#0f766e',
        contrastText: '#fff',
      },
      background: {
        default: '#f0fdfa',
        paper: '#ffffff',
      },
      text: {
        primary: '#164e63',
        secondary: '#475569',
      },
    },
  },
  
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm oranges and reds reminiscent of a beautiful sunset',
    palette: {
      mode: 'light',
      primary: {
        main: '#f97316',
        light: '#fb923c',
        dark: '#ea580c',
        contrastText: '#fff',
      },
      secondary: {
        main: '#ec4899',
        light: '#f472b6',
        dark: '#db2777',
        contrastText: '#fff',
      },
      background: {
        default: '#fff7ed',
        paper: '#ffffff',
      },
      text: {
        primary: '#7c2d12',
        secondary: '#78350f',
      },
    },
  },
};

export const createAppTheme = (mode: ThemeMode) => {
  const config = themeConfigs[mode];
  
  return createTheme({
    palette: config.palette,
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
  });
};
