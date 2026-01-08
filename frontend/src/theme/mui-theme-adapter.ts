import { createTheme, type ThemeOptions } from '@mui/material/styles';

const designTokens = {
  primary: {
    main: '#9333EA',
    light: '#A855F7',
    dark: '#7C3AED',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#002DFF',
    light: '#3B82F6',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FFA500',
    light: '#FBBF24',
    dark: '#F59E0B',
    contrastText: '#111827',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

const baseThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: designTokens.primary,
    secondary: designTokens.secondary,
    error: designTokens.error,
    warning: designTokens.warning,
    info: designTokens.info,
    success: designTokens.success,
    grey: designTokens.grey,
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: "'Nunito Sans', sans-serif",
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.2s',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          },
        },
        containedPrimary: {
          backgroundColor: designTokens.primary.main,
          '&:hover': {
            backgroundColor: designTokens.primary.light,
          },
          '&:active': {
            backgroundColor: designTokens.primary.dark,
          },
        },
        outlined: {
          borderColor: designTokens.primary.main,
          color: designTokens.primary.main,
          '&:hover': {
            backgroundColor: `${designTokens.primary.main}10`,
            borderColor: designTokens.primary.main,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.primary.light,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.primary.main,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: designTokens.primary.main,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: designTokens.grey[400],
          '&.Mui-checked': {
            color: designTokens.primary.main,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: designTokens.grey[400],
          '&.Mui-checked': {
            color: designTokens.primary.main,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: designTokens.primary.main,
            '& + .MuiSwitch-track': {
              backgroundColor: designTokens.primary.main,
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: designTokens.primary.main,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: `${designTokens.success.main}15`,
          borderColor: designTokens.success.main,
          '& .MuiAlert-icon': {
            color: designTokens.success.main,
          },
        },
        standardError: {
          backgroundColor: `${designTokens.error.main}15`,
          borderColor: designTokens.error.main,
          '& .MuiAlert-icon': {
            color: designTokens.error.main,
          },
        },
        standardWarning: {
          backgroundColor: `${designTokens.warning.main}15`,
          borderColor: designTokens.warning.main,
          '& .MuiAlert-icon': {
            color: designTokens.warning.main,
          },
        },
        standardInfo: {
          backgroundColor: `${designTokens.info.main}15`,
          borderColor: designTokens.info.main,
          '& .MuiAlert-icon': {
            color: designTokens.info.main,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: designTokens.primary.main,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: designTokens.grey[800],
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
};

export const teamifiedTheme = createTheme(baseThemeOptions);

export const darkThemeOptions: ThemeOptions = {
  ...baseThemeOptions,
  palette: {
    ...baseThemeOptions.palette,
    mode: 'dark',
    background: {
      default: '#111827',
      paper: '#1F2937',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
    },
    divider: '#374151',
  },
};

export const teamifiedDarkTheme = createTheme(darkThemeOptions);

export default teamifiedTheme;
