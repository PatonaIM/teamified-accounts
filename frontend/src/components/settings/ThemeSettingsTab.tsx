import React, { useState, useEffect, useMemo } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stack,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { Palette, Check, Save, Refresh } from '@mui/icons-material';
import { themesApi } from '../../api/themes';
import type { ThemeConfig, UserTheme } from '../../api/themes';
import { useTheme } from '../../contexts/ThemeContext';
import { themeConfigs } from '../../theme/themeConfig';
import type { ThemeMode } from '../../theme/themeConfig';

const ThemeSettingsTab: React.FC = () => {
  const { loadCustomTheme, refreshActiveTheme, currentTheme, customTheme } = useTheme();
  const [themeName, setThemeName] = useState('');
  const [userThemes, setUserThemes] = useState<UserTheme[]>([]);
  const [showThemesList, setShowThemesList] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedPreset, setSelectedPreset] = useState<ThemeMode | null>(null);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#dc004e',
        light: '#f73378',
        dark: '#9a0036',
        contrastText: '#ffffff',
      },
      error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
      },
      warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100',
      },
      info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      fontSize: 14,
      h1: { fontSize: '2.5rem', fontWeight: 500 },
      h2: { fontSize: '2rem', fontWeight: 500 },
      h3: { fontSize: '1.75rem', fontWeight: 500 },
      h4: { fontSize: '1.5rem', fontWeight: 500 },
      h5: { fontSize: '1.25rem', fontWeight: 500 },
      h6: { fontSize: '1rem', fontWeight: 500 },
      body1: { fontSize: '1rem' },
      body2: { fontSize: '0.875rem' },
    },
    shape: {
      borderRadius: 8,
    },
    componentStyles: {
      buttonVariant: 'contained',
      buttonElevation: false,
      buttonBorderRadius: 8,
      buttonTextTransform: 'none',
      chipVariant: 'filled',
      chipBorderRadius: 16,
      cardBorderRadius: 8,
    },
    spacing: 8,
  });

  useEffect(() => {
    loadUserThemes();
  }, []);

  useEffect(() => {
    if (!initialLoadDone && customTheme && currentTheme === 'custom') {
      setEditingThemeId(customTheme.id);
      setThemeName(customTheme.themeName);
      setThemeConfig(customTheme.themeConfig);
      setInitialLoadDone(true);
    }
  }, [customTheme, currentTheme, initialLoadDone]);

  const loadUserThemes = async () => {
    try {
      const themes = await themesApi.getAllThemes();
      setUserThemes(themes);
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  };

  const safeColorExtract = (color: any, defaultValue: string): string => {
    if (typeof color === 'string') return color;
    if (color && typeof color === 'object' && 'main' in color) return String(color.main || defaultValue);
    return defaultValue;
  };

  const handlePresetSelect = (themeMode: ThemeMode) => {
    setSelectedPreset(themeMode);
    setEditingThemeId(null);
    setThemeName('');
    const preset = themeConfigs[themeMode];
    
    const extractedPalette = {
      mode: (preset.palette?.mode || 'light') as 'light' | 'dark',
      primary: {
        main: safeColorExtract(preset.palette?.primary, '#1976d2'),
        light: (preset.palette?.primary as any)?.light || '#42a5f5',
        dark: (preset.palette?.primary as any)?.dark || '#1565c0',
        contrastText: (preset.palette?.primary as any)?.contrastText || '#ffffff',
      },
      secondary: {
        main: safeColorExtract(preset.palette?.secondary, '#dc004e'),
        light: (preset.palette?.secondary as any)?.light || '#f73378',
        dark: (preset.palette?.secondary as any)?.dark || '#9a0036',
        contrastText: (preset.palette?.secondary as any)?.contrastText || '#ffffff',
      },
      error: {
        main: safeColorExtract(preset.palette?.error, '#d32f2f'),
        light: (preset.palette?.error as any)?.light || '#ef5350',
        dark: (preset.palette?.error as any)?.dark || '#c62828',
      },
      warning: {
        main: safeColorExtract(preset.palette?.warning, '#ed6c02'),
        light: (preset.palette?.warning as any)?.light || '#ff9800',
        dark: (preset.palette?.warning as any)?.dark || '#e65100',
      },
      info: {
        main: safeColorExtract(preset.palette?.info, '#0288d1'),
        light: (preset.palette?.info as any)?.light || '#03a9f4',
        dark: (preset.palette?.info as any)?.dark || '#01579b',
      },
      success: {
        main: safeColorExtract(preset.palette?.success, '#2e7d32'),
        light: (preset.palette?.success as any)?.light || '#4caf50',
        dark: (preset.palette?.success as any)?.dark || '#1b5e20',
      },
      background: {
        default: preset.palette?.background?.default || '#fafafa',
        paper: preset.palette?.background?.paper || '#ffffff',
      },
      text: {
        primary: preset.palette?.text?.primary || 'rgba(0, 0, 0, 0.87)',
        secondary: preset.palette?.text?.secondary || 'rgba(0, 0, 0, 0.6)',
      },
    };

    const extractedTypography = {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
      h1: { fontSize: '2.5rem', fontWeight: 600 },
      h2: { fontSize: '2rem', fontWeight: 600 },
      h3: { fontSize: '1.75rem', fontWeight: 600 },
      h4: { fontSize: '1.5rem', fontWeight: 600 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
      body1: { fontSize: '1rem' },
      body2: { fontSize: '0.875rem' },
    };

    const extractedShape = {
      borderRadius: 8,
    };

    const extractedComponentStyles = {
      buttonVariant: 'contained' as const,
      buttonElevation: false,
      buttonBorderRadius: 8,
      buttonTextTransform: 'none' as const,
      chipVariant: 'filled' as const,
      chipBorderRadius: 16,
      cardBorderRadius: 8,
    };

    setThemeConfig({
      palette: extractedPalette,
      typography: extractedTypography,
      shape: extractedShape,
      componentStyles: extractedComponentStyles,
      spacing: 8,
    });
  };

  const handleEditTheme = (theme: UserTheme) => {
    setEditingThemeId(theme.id);
    setThemeName(theme.themeName);
    setThemeConfig(theme.themeConfig);
    setSelectedPreset(null);
    setShowThemesList(false);
    setSnackbar({ open: true, message: `Editing "${theme.themeName}"`, severity: 'success' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveTheme = async () => {
    if (!themeName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a theme name', severity: 'error' });
      return;
    }

    try {
      if (editingThemeId) {
        const updatedTheme = await themesApi.updateTheme(editingThemeId, {
          themeName,
          themeConfig,
          isActive: true,
        });
        setSnackbar({ open: true, message: 'Theme updated successfully!', severity: 'success' });
        loadCustomTheme(updatedTheme);
        setEditingThemeId(null);
      } else {
        const newTheme = await themesApi.createTheme({
          themeName,
          themeConfig,
          isActive: true,
        });
        setSnackbar({ open: true, message: 'Theme saved successfully!', severity: 'success' });
        loadCustomTheme(newTheme);
      }
      
      await loadUserThemes();
      setSelectedPreset(null);
    } catch (error) {
      console.error('Failed to save theme:', error);
      setSnackbar({ open: true, message: 'Failed to save theme', severity: 'error' });
    }
  };

  const handleActivateTheme = async (themeId: string) => {
    try {
      const activatedTheme = await themesApi.activateTheme(themeId);
      loadCustomTheme(activatedTheme);
      await loadUserThemes();
      setSnackbar({ open: true, message: 'Theme activated!', severity: 'success' });
    } catch (error) {
      console.error('Failed to activate theme:', error);
      setSnackbar({ open: true, message: 'Failed to activate theme', severity: 'error' });
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    try {
      await themesApi.deleteTheme(themeId);
      await loadUserThemes();
      await refreshActiveTheme();
      setSnackbar({ open: true, message: 'Theme deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to delete theme:', error);
      setSnackbar({ open: true, message: 'Failed to delete theme. Cannot delete active theme.', severity: 'error' });
    }
  };

  const handleCancelEdit = () => {
    setEditingThemeId(null);
    setThemeName('');
    setSelectedPreset(null);
    setSnackbar({ open: true, message: 'Edit cancelled', severity: 'success' });
  };

  const handleModeToggle = (mode: 'light' | 'dark') => {
    setThemeConfig((prev) => {
      const isDark = mode === 'dark';
      return {
        ...prev,
        palette: {
          ...prev.palette,
          mode,
          background: {
            default: isDark ? '#121212' : '#fafafa',
            paper: isDark ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
            secondary: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.6)',
          },
        },
      };
    });
  };

  const updateColor = (category: string, shade: string, color: string) => {
    setThemeConfig((prev) => {
      const currentCategory = prev.palette[category as keyof typeof prev.palette];
      return {
        ...prev,
        palette: {
          ...prev.palette,
          [category]: typeof currentCategory === 'object' ? {
            ...currentCategory,
            [shade]: color,
          } : { [shade]: color },
        },
      };
    });
  };

  const updateTypography = (key: string, value: string | number) => {
    setThemeConfig((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [key]: value,
      },
    }));
  };

  const updateTypographyVariant = (variant: string, key: string, value: string | number) => {
    setThemeConfig((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [variant]: {
          ...(prev.typography[variant as keyof typeof prev.typography] as any),
          [key]: value,
        },
      },
    }));
  };

  const ColorPickerField: React.FC<{ label: string; value: string; onChange: (color: string) => void }> = ({
    label,
    value,
    onChange,
  }) => {
    const [showPicker, setShowPicker] = useState(false);

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              backgroundColor: value,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
            }}
            onClick={() => setShowPicker(!showPicker)}
          />
          <TextField
            value={value}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
        </Box>
        {showPicker && (
          <Box sx={{ mt: 1 }}>
            <HexColorPicker color={value} onChange={onChange} />
          </Box>
        )}
      </Box>
    );
  };

  const previewTheme = useMemo(() => {
    const componentStyles = themeConfig.componentStyles || {};
    return createTheme({
      palette: {
        mode: themeConfig.palette.mode || 'light',
        primary: {
          main: themeConfig.palette.primary.main,
          light: themeConfig.palette.primary.light,
          dark: themeConfig.palette.primary.dark,
          contrastText: themeConfig.palette.primary.contrastText,
        },
        secondary: {
          main: themeConfig.palette.secondary.main,
          light: themeConfig.palette.secondary.light,
          dark: themeConfig.palette.secondary.dark,
          contrastText: themeConfig.palette.secondary.contrastText,
        },
        error: themeConfig.palette.error,
        warning: themeConfig.palette.warning,
        info: themeConfig.palette.info,
        success: themeConfig.palette.success,
        background: themeConfig.palette.background,
        text: themeConfig.palette.text,
      },
      typography: {
        fontFamily: themeConfig.typography.fontFamily,
        fontSize: themeConfig.typography.fontSize,
        h1: themeConfig.typography.h1,
        h2: themeConfig.typography.h2,
        h3: themeConfig.typography.h3,
        h4: themeConfig.typography.h4,
        h5: themeConfig.typography.h5,
        h6: themeConfig.typography.h6,
        body1: themeConfig.typography.body1,
        body2: themeConfig.typography.body2,
      },
      shape: themeConfig.shape,
      spacing: themeConfig.spacing,
      components: {
        MuiButton: {
          defaultProps: {
            variant: componentStyles.buttonVariant || 'contained',
            disableElevation: !componentStyles.buttonElevation,
          },
          styleOverrides: {
            root: {
              borderRadius: componentStyles.buttonBorderRadius || 8,
              textTransform: componentStyles.buttonTextTransform || 'none',
            },
          },
        },
        MuiChip: {
          defaultProps: {
            variant: componentStyles.chipVariant || 'filled',
          },
          styleOverrides: {
            root: {
              borderRadius: componentStyles.chipBorderRadius || 16,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: componentStyles.cardBorderRadius || 8,
            },
          },
        },
      },
    });
  }, [themeConfig]);

  return (
    <Box sx={{ p: 3 }}>
      {editingThemeId && (
        <Alert 
          severity="info" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleCancelEdit}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Cancel Edit
            </Button>
          }
        >
          You are editing "{themeName}". Make your changes and click "Save & Apply Theme" to update it.
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5 }} fontWeight={600}>
              1. Start with a Preset
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a starting theme, then customize it to match your brand
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Palette />}
            onClick={() => setShowThemesList(true)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              flexShrink: 0,
            }}
          >
            {editingThemeId ? 'Manage Saved Themes' : 'Saved Themes'}
          </Button>
        </Stack>

        <Grid container spacing={2}>
          {(['teamified', 'ocean', 'sunset', 'light', 'dark'] as ThemeMode[]).map((themeMode) => {
            const theme = themeConfigs[themeMode];
            const presetTheme = createTheme({
              palette: {
                primary: theme.palette?.primary as any,
                secondary: theme.palette?.secondary as any,
              },
            });

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={themeMode}>
                <Card
                  sx={{
                    height: '100%',
                    border: selectedPreset === themeMode ? 2 : 1,
                    borderColor: selectedPreset === themeMode ? 'primary.main' : 'divider',
                    borderRadius: 3,
                  }}
                >
                  <CardActionArea onClick={() => handlePresetSelect(themeMode)}>
                    <Box
                      sx={{
                        height: 120,
                        background: `linear-gradient(135deg, ${presetTheme.palette.primary.main} 0%, ${presetTheme.palette.secondary.main} 100%)`,
                        position: 'relative',
                      }}
                    >
                      {selectedPreset === themeMode && (
                        <Chip
                          icon={<Check />}
                          label="Selected"
                          color="primary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {theme.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {theme.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 2 }} fontWeight={600}>
          2. Customize Your Theme
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Fine-tune colors, typography, and other design elements.
        </Typography>

        <TextField
          label="Theme Name"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          fullWidth
          placeholder="e.g., My Custom Theme"
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={themeConfig.palette.mode === 'dark'}
                onChange={(e) => handleModeToggle(e.target.checked ? 'dark' : 'light')}
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Dark Mode
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {themeConfig.palette.mode === 'dark' 
                    ? 'Theme uses dark backgrounds and light text' 
                    : 'Theme uses light backgrounds and dark text'}
                </Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Primary Color</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Main"
                  value={themeConfig.palette.primary.main}
                  onChange={(color) => updateColor('primary', 'main', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Light"
                  value={themeConfig.palette.primary.light || ''}
                  onChange={(color) => updateColor('primary', 'light', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Dark"
                  value={themeConfig.palette.primary.dark || ''}
                  onChange={(color) => updateColor('primary', 'dark', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Contrast Text"
                  value={themeConfig.palette.primary.contrastText || ''}
                  onChange={(color) => updateColor('primary', 'contrastText', color)}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Secondary Color</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Main"
                  value={themeConfig.palette.secondary.main}
                  onChange={(color) => updateColor('secondary', 'main', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Light"
                  value={themeConfig.palette.secondary.light || ''}
                  onChange={(color) => updateColor('secondary', 'light', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Dark"
                  value={themeConfig.palette.secondary.dark || ''}
                  onChange={(color) => updateColor('secondary', 'dark', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Contrast Text"
                  value={themeConfig.palette.secondary.contrastText || ''}
                  onChange={(color) => updateColor('secondary', 'contrastText', color)}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
              },
            }}
          >
            <Typography variant="h6">Error Color</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Main"
                  value={themeConfig.palette.error?.main || '#d32f2f'}
                  onChange={(color) => updateColor('error', 'main', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Light"
                  value={themeConfig.palette.error?.light || '#ef5350'}
                  onChange={(color) => updateColor('error', 'light', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Dark"
                  value={themeConfig.palette.error?.dark || '#c62828'}
                  onChange={(color) => updateColor('error', 'dark', color)}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
              },
            }}
          >
            <Typography variant="h6">Warning Color</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Main"
                  value={themeConfig.palette.warning?.main || '#ed6c02'}
                  onChange={(color) => updateColor('warning', 'main', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Light"
                  value={themeConfig.palette.warning?.light || '#ff9800'}
                  onChange={(color) => updateColor('warning', 'light', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Dark"
                  value={themeConfig.palette.warning?.dark || '#e65100'}
                  onChange={(color) => updateColor('warning', 'dark', color)}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
              },
            }}
          >
            <Typography variant="h6">Info Color</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Main"
                  value={themeConfig.palette.info?.main || '#0288d1'}
                  onChange={(color) => updateColor('info', 'main', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Light"
                  value={themeConfig.palette.info?.light || '#03a9f4'}
                  onChange={(color) => updateColor('info', 'light', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Dark"
                  value={themeConfig.palette.info?.dark || '#01579b'}
                  onChange={(color) => updateColor('info', 'dark', color)}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
              },
            }}
          >
            <Typography variant="h6">Success Color</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Main"
                  value={themeConfig.palette.success?.main || '#2e7d32'}
                  onChange={(color) => updateColor('success', 'main', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Light"
                  value={themeConfig.palette.success?.light || '#4caf50'}
                  onChange={(color) => updateColor('success', 'light', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ColorPickerField
                  label="Dark"
                  value={themeConfig.palette.success?.dark || '#1b5e20'}
                  onChange={(color) => updateColor('success', 'dark', color)}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
              },
            }}
          >
            <Typography variant="h6">Background & Text Colors</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Background Default"
                  value={themeConfig.palette.background?.default || '#fafafa'}
                  onChange={(color) => updateColor('background', 'default', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Background Paper"
                  value={themeConfig.palette.background?.paper || '#ffffff'}
                  onChange={(color) => updateColor('background', 'paper', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Text Primary"
                  value={themeConfig.palette.text?.primary || 'rgba(0, 0, 0, 0.87)'}
                  onChange={(color) => updateColor('text', 'primary', color)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ColorPickerField
                  label="Text Secondary"
                  value={themeConfig.palette.text?.secondary || 'rgba(0, 0, 0, 0.6)'}
                  onChange={(color) => updateColor('text', 'secondary', color)}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
              },
            }}
          >
            <Typography variant="h6">Typography Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <TextField
                label="Font Family"
                value={themeConfig.typography.fontFamily}
                onChange={(e) => updateTypography('fontFamily', e.target.value)}
                fullWidth
                placeholder="e.g., Roboto, Arial, sans-serif"
                helperText="Enter font families separated by commas"
              />
              <TextField
                label="Base Font Size (px)"
                type="number"
                value={themeConfig.typography.fontSize}
                onChange={(e) => updateTypography('fontSize', Number(e.target.value))}
                fullWidth
                helperText="Default: 14px"
              />

              <Divider />
              <Typography variant="subtitle1" fontWeight={600}>Header Sizes</Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H1 Font Size"
                    value={themeConfig.typography.h1?.fontSize || '2.5rem'}
                    onChange={(e) => updateTypographyVariant('h1', 'fontSize', e.target.value)}
                    fullWidth
                    placeholder="e.g., 2.5rem"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H1 Font Weight"
                    type="number"
                    value={themeConfig.typography.h1?.fontWeight || 500}
                    onChange={(e) => updateTypographyVariant('h1', 'fontWeight', Number(e.target.value))}
                    fullWidth
                    placeholder="e.g., 500"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H2 Font Size"
                    value={themeConfig.typography.h2?.fontSize || '2rem'}
                    onChange={(e) => updateTypographyVariant('h2', 'fontSize', e.target.value)}
                    fullWidth
                    placeholder="e.g., 2rem"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H2 Font Weight"
                    type="number"
                    value={themeConfig.typography.h2?.fontWeight || 500}
                    onChange={(e) => updateTypographyVariant('h2', 'fontWeight', Number(e.target.value))}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H3 Font Size"
                    value={themeConfig.typography.h3?.fontSize || '1.75rem'}
                    onChange={(e) => updateTypographyVariant('h3', 'fontSize', e.target.value)}
                    fullWidth
                    placeholder="e.g., 1.75rem"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H3 Font Weight"
                    type="number"
                    value={themeConfig.typography.h3?.fontWeight || 500}
                    onChange={(e) => updateTypographyVariant('h3', 'fontWeight', Number(e.target.value))}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H4 Font Size"
                    value={themeConfig.typography.h4?.fontSize || '1.5rem'}
                    onChange={(e) => updateTypographyVariant('h4', 'fontSize', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H4 Font Weight"
                    type="number"
                    value={themeConfig.typography.h4?.fontWeight || 500}
                    onChange={(e) => updateTypographyVariant('h4', 'fontWeight', Number(e.target.value))}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H5 Font Size"
                    value={themeConfig.typography.h5?.fontSize || '1.25rem'}
                    onChange={(e) => updateTypographyVariant('h5', 'fontSize', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H5 Font Weight"
                    type="number"
                    value={themeConfig.typography.h5?.fontWeight || 500}
                    onChange={(e) => updateTypographyVariant('h5', 'fontWeight', Number(e.target.value))}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H6 Font Size"
                    value={themeConfig.typography.h6?.fontSize || '1rem'}
                    onChange={(e) => updateTypographyVariant('h6', 'fontSize', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="H6 Font Weight"
                    type="number"
                    value={themeConfig.typography.h6?.fontWeight || 500}
                    onChange={(e) => updateTypographyVariant('h6', 'fontWeight', Number(e.target.value))}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Divider />
              <Typography variant="subtitle1" fontWeight={600}>Body Text</Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Body 1 Font Size"
                    value={themeConfig.typography.body1?.fontSize || '1rem'}
                    onChange={(e) => updateTypographyVariant('body1', 'fontSize', e.target.value)}
                    fullWidth
                    placeholder="e.g., 1rem"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Body 2 Font Size"
                    value={themeConfig.typography.body2?.fontSize || '0.875rem'}
                    onChange={(e) => updateTypographyVariant('body2', 'fontSize', e.target.value)}
                    fullWidth
                    placeholder="e.g., 0.875rem"
                  />
                </Grid>
              </Grid>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
              },
            }}
          >
            <Typography variant="h6">Border Radius</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <TextField
                label="Default Border Radius (px)"
                type="number"
                value={themeConfig.shape?.borderRadius || 8}
                onChange={(e) => setThemeConfig(prev => ({
                  ...prev,
                  shape: { borderRadius: Number(e.target.value) }
                }))}
                fullWidth
                helperText="Applied to containers, cards, and other elements (default: 8px)"
              />
              <TextField
                label="Button Border Radius (px)"
                type="number"
                value={themeConfig.componentStyles?.buttonBorderRadius || 8}
                onChange={(e) => setThemeConfig(prev => ({
                  ...prev,
                  componentStyles: { 
                    ...prev.componentStyles,
                    buttonBorderRadius: Number(e.target.value)
                  }
                }))}
                fullWidth
                helperText="Button corners roundness (default: 8px)"
              />
              <TextField
                label="Chip Border Radius (px)"
                type="number"
                value={themeConfig.componentStyles?.chipBorderRadius || 16}
                onChange={(e) => setThemeConfig(prev => ({
                  ...prev,
                  componentStyles: { 
                    ...prev.componentStyles,
                    chipBorderRadius: Number(e.target.value)
                  }
                }))}
                fullWidth
                helperText="Chip/tag roundness (default: 16px for pill shape)"
              />
              <TextField
                label="Card Border Radius (px)"
                type="number"
                value={themeConfig.componentStyles?.cardBorderRadius || 8}
                onChange={(e) => setThemeConfig(prev => ({
                  ...prev,
                  componentStyles: { 
                    ...prev.componentStyles,
                    cardBorderRadius: Number(e.target.value)
                  }
                }))}
                fullWidth
                helperText="Card corners roundness (default: 8px)"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
              },
            }}
          >
            <Typography variant="h6">Component Styles</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Button Variant</InputLabel>
                <Select
                  value={themeConfig.componentStyles?.buttonVariant || 'contained'}
                  onChange={(e) => setThemeConfig(prev => ({
                    ...prev,
                    componentStyles: { 
                      ...prev.componentStyles,
                      buttonVariant: e.target.value as 'text' | 'outlined' | 'contained'
                    }
                  }))}
                  label="Button Variant"
                  sx={{
                    '& .MuiSelect-icon': {
                      color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                    },
                  }}
                >
                  <MenuItem value="contained">Contained (Filled)</MenuItem>
                  <MenuItem value="outlined">Outlined</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Button Text Transform</InputLabel>
                <Select
                  value={themeConfig.componentStyles?.buttonTextTransform || 'none'}
                  onChange={(e) => setThemeConfig(prev => ({
                    ...prev,
                    componentStyles: { 
                      ...prev.componentStyles,
                      buttonTextTransform: e.target.value as 'none' | 'capitalize' | 'uppercase' | 'lowercase'
                    }
                  }))}
                  label="Button Text Transform"
                  sx={{
                    '& .MuiSelect-icon': {
                      color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                    },
                  }}
                >
                  <MenuItem value="none">None (Normal Case)</MenuItem>
                  <MenuItem value="capitalize">Capitalize</MenuItem>
                  <MenuItem value="uppercase">UPPERCASE</MenuItem>
                  <MenuItem value="lowercase">lowercase</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Button Elevation</InputLabel>
                <Select
                  value={themeConfig.componentStyles?.buttonElevation !== false ? 'yes' : 'no'}
                  onChange={(e) => setThemeConfig(prev => ({
                    ...prev,
                    componentStyles: { 
                      ...prev.componentStyles,
                      buttonElevation: e.target.value === 'yes'
                    }
                  }))}
                  label="Button Elevation"
                  sx={{
                    '& .MuiSelect-icon': {
                      color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                    },
                  }}
                >
                  <MenuItem value="yes">With Shadow</MenuItem>
                  <MenuItem value="no">Flat (No Shadow)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Chip Variant</InputLabel>
                <Select
                  value={themeConfig.componentStyles?.chipVariant || 'filled'}
                  onChange={(e) => setThemeConfig(prev => ({
                    ...prev,
                    componentStyles: { 
                      ...prev.componentStyles,
                      chipVariant: e.target.value as 'filled' | 'outlined'
                    }
                  }))}
                  label="Chip Variant"
                  sx={{
                    '& .MuiSelect-icon': {
                      color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                    },
                  }}
                >
                  <MenuItem value="filled">Filled</MenuItem>
                  <MenuItem value="outlined">Outlined</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: themeConfig.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
              },
            }}
          >
            <Typography variant="h6">Spacing</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <TextField
                label="Spacing Unit (px)"
                type="number"
                value={themeConfig.spacing || 8}
                onChange={(e) => setThemeConfig(prev => ({
                  ...prev,
                  spacing: Number(e.target.value)
                }))}
                fullWidth
                helperText="Base spacing unit (default: 8px). Multiplied for spacing values (e.g., 2 = 16px, 3 = 24px)"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 2 }} fontWeight={600}>
          3. Save Your Theme
        </Typography>
        <MuiThemeProvider theme={previewTheme}>
          <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Preview (using your custom colors):
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" color="primary">
                Primary Button
              </Button>
              <Button variant="contained" color="secondary">
                Secondary Button
              </Button>
              <Chip label="Sample Chip" color="primary" />
            </Stack>
          </Box>
        </MuiThemeProvider>
        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          onClick={handleSaveTheme}
          fullWidth
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {editingThemeId ? 'Update & Apply Theme' : 'Save & Apply Theme'}
        </Button>
      </Paper>

      <Dialog open={showThemesList} onClose={() => setShowThemesList(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Saved Themes
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {userThemes.length === 0 ? (
            <Alert severity="info">No saved themes yet. Create one to get started!</Alert>
          ) : (
            <List>
              {userThemes.map((theme) => (
                <ListItem key={theme.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {theme.themeName}
                        {theme.isActive && (
                          <Chip icon={<CheckCircleIcon />} label="Active" color="primary" size="small" />
                        )}
                      </Box>
                    }
                    secondary={`Last updated: ${new Date(theme.updatedAt).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditTheme(theme)}
                        title="Edit theme"
                      >
                        <EditIcon />
                      </IconButton>
                      {!theme.isActive && (
                        <>
                          <IconButton
                            edge="end"
                            onClick={() => handleActivateTheme(theme.id)}
                            title="Activate theme"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteTheme(theme.id)}
                            title="Delete theme"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowThemesList(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ThemeSettingsTab;
