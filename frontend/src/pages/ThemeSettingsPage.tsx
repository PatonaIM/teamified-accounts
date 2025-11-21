import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Paper,
  Chip,
  Stack,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Palette, Check } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeMode } from '../theme/themeConfig';
import { themeConfigs } from '../theme/themeConfig';
import LayoutMUI from '../components/LayoutMUI';

const ThemeSettingsPage: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();

  const handleThemeSelect = (themeId: ThemeMode) => {
    setTheme(themeId);
  };

  return (
    <LayoutMUI>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Palette sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight={600}>
            Theme Settings
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Customize the visual appearance of the Teamified portal. Choose from our preset themes
          or create your own color scheme.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <AlertTitle>Admin Only Feature</AlertTitle>
        Theme changes are saved to your browser and apply across all pages. Other users will need
        to select their own preferred theme.
      </Alert>

      <Typography variant="h5" sx={{ mb: 3 }} fontWeight={600}>
        Available Themes
      </Typography>

      <Grid container spacing={3}>
        {Object.values(themeConfigs).map((theme) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={theme.id}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                border: currentTheme === theme.id ? 2 : 0,
                borderColor: 'primary.main',
              }}
            >
              <CardActionArea onClick={() => handleThemeSelect(theme.id)}>
                <Box
                  sx={{
                    height: 120,
                    background: `linear-gradient(135deg, ${String(theme.palette?.primary?.main || '#1976d2')} 0%, ${String(theme.palette?.secondary?.main || '#9c27b0')} 100%)`,
                    position: 'relative',
                  }}
                >
                  {currentTheme === theme.id && (
                    <Chip
                      icon={<Check />}
                      label="Active"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {theme.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {theme.description}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Paper
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: String(theme.palette?.primary?.main || '#1976d2'),
                        borderRadius: 1,
                        border: '2px solid',
                        borderColor: 'divider',
                      }}
                      title="Primary"
                    />
                    <Paper
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: String(theme.palette?.secondary?.main || '#9c27b0'),
                        borderRadius: 1,
                        border: '2px solid',
                        borderColor: 'divider',
                      }}
                      title="Secondary"
                    />
                    <Paper
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette?.background?.default,
                        borderRadius: 1,
                        border: '2px solid',
                        borderColor: 'divider',
                      }}
                      title="Background"
                    />
                    <Paper
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette?.text?.primary,
                        borderRadius: 1,
                        border: '2px solid',
                        borderColor: 'divider',
                      }}
                      title="Text"
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }} fontWeight={600}>
          Current Theme Preview
        </Typography>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {themeConfigs[currentTheme].name} Theme
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {themeConfigs[currentTheme].description}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Typography
                    </Typography>
                    <Typography variant="h4">Heading 4</Typography>
                    <Typography variant="h6">Heading 6</Typography>
                    <Typography variant="body1">Body text primary</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Body text secondary
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Color Palette
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      <Chip label="Primary" color="primary" />
                      <Chip label="Secondary" color="secondary" />
                      <Chip label="Success" color="success" />
                      <Chip label="Warning" color="warning" />
                      <Chip label="Error" color="error" />
                      <Chip label="Info" color="info" />
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
    </LayoutMUI>
  );
};

export default ThemeSettingsPage;
