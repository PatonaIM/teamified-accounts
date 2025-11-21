import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  Box,
  Container,
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { themesApi } from '../api/themes';
import type { ThemeConfig, UserTheme } from '../api/themes';
import { useTheme } from '../contexts/ThemeContext';
import LayoutMUI from '../components/LayoutMUI';

const CustomThemeEditorPage: React.FC = () => {
  const { loadCustomTheme, refreshActiveTheme } = useTheme();
  const [themeName, setThemeName] = useState('');
  const [userThemes, setUserThemes] = useState<UserTheme[]>([]);
  const [showThemesList, setShowThemesList] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    palette: {
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
  });

  useEffect(() => {
    loadUserThemes();
  }, []);

  const loadUserThemes = async () => {
    try {
      const themes = await themesApi.getAllThemes();
      setUserThemes(themes);
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  };

  const handleSaveTheme = async () => {
    if (!themeName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a theme name', severity: 'error' });
      return;
    }

    try {
      const newTheme = await themesApi.createTheme({
        themeName,
        themeConfig,
        isActive: true,
      });
      
      setSnackbar({ open: true, message: 'Theme saved successfully!', severity: 'success' });
      loadCustomTheme(newTheme);
      await loadUserThemes();
      setThemeName('');
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

  const updateColor = (category: string, shade: string, color: string) => {
    setThemeConfig((prev) => ({
      ...prev,
      palette: {
        ...prev.palette,
        [category]: {
          ...prev.palette[category as keyof typeof prev.palette],
          [shade]: color,
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
        <Typography variant="body2" sx={{ mb: 1 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              backgroundColor: value,
              border: '1px solid #ccc',
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

  return (
    <LayoutMUI>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Custom Theme Editor
          </Typography>
          <Button variant="outlined" onClick={() => setShowThemesList(true)}>
            My Themes
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Create and customize your own theme by adjusting colors and typography below. Your changes will be applied when you save.
        </Alert>

        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            label="Theme Name"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            fullWidth
            placeholder="e.g., My Custom Theme"
            sx={{ mb: 3 }}
          />

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Primary Color</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <ColorPickerField
                    label="Main"
                    value={themeConfig.palette.primary.main}
                    onChange={(color) => updateColor('primary', 'main', color)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <ColorPickerField
                    label="Light"
                    value={themeConfig.palette.primary.light || ''}
                    onChange={(color) => updateColor('primary', 'light', color)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <ColorPickerField
                    label="Dark"
                    value={themeConfig.palette.primary.dark || ''}
                    onChange={(color) => updateColor('primary', 'dark', color)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <ColorPickerField
                    label="Contrast Text"
                    value={themeConfig.palette.primary.contrastText || ''}
                    onChange={(color) => updateColor('primary', 'contrastText', color)}
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Secondary Color</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <ColorPickerField
                    label="Main"
                    value={themeConfig.palette.secondary.main}
                    onChange={(color) => updateColor('secondary', 'main', color)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <ColorPickerField
                    label="Light"
                    value={themeConfig.palette.secondary.light || ''}
                    onChange={(color) => updateColor('secondary', 'light', color)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <ColorPickerField
                    label="Dark"
                    value={themeConfig.palette.secondary.dark || ''}
                    onChange={(color) => updateColor('secondary', 'dark', color)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <ColorPickerField
                    label="Contrast Text"
                    value={themeConfig.palette.secondary.contrastText || ''}
                    onChange={(color) => updateColor('secondary', 'contrastText', color)}
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Typography</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="Font Family"
                  value={themeConfig.typography.fontFamily}
                  onChange={(e) =>
                    setThemeConfig((prev) => ({
                      ...prev,
                      typography: { ...prev.typography, fontFamily: e.target.value },
                    }))
                  }
                  fullWidth
                  placeholder="e.g., Roboto, Arial, sans-serif"
                />
                <TextField
                  label="Base Font Size (px)"
                  type="number"
                  value={themeConfig.typography.fontSize}
                  onChange={(e) =>
                    setThemeConfig((prev) => ({
                      ...prev,
                      typography: { ...prev.typography, fontSize: Number(e.target.value) },
                    }))
                  }
                  fullWidth
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSaveTheme} size="large">
              Save & Apply Theme
            </Button>
          </Box>
        </Paper>

        <Dialog open={showThemesList} onClose={() => setShowThemesList(false)} maxWidth="sm" fullWidth>
          <DialogTitle>My Saved Themes</DialogTitle>
          <DialogContent>
            {userThemes.length === 0 ? (
              <Typography>No saved themes yet. Create your first custom theme!</Typography>
            ) : (
              <List>
                {userThemes.map((theme) => (
                  <ListItem key={theme.id}>
                    <ListItemText
                      primary={theme.themeName}
                      secondary={theme.isActive ? 'Active' : 'Inactive'}
                    />
                    {theme.isActive && (
                      <ListItemSecondaryAction>
                        <IconButton edge="end" disabled>
                          <CheckCircleIcon color="success" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                    {!theme.isActive && (
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleActivateTheme(theme.id)}>
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteTheme(theme.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
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
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LayoutMUI>
  );
};

export default CustomThemeEditorPage;
