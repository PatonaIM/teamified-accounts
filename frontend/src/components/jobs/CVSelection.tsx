import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import {
  FileText,
  CheckCircle,
  Upload,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import axios from 'axios';

interface CV {
  id: string;
  versionId: string;
  fileName: string;
  isCurrent: boolean;
  uploadedAt: string;
}

interface CVSelectionProps {
  onCVSelect: (cv: CV | null) => void;
  selectedCVId: string | null;
}

const CVSelection: React.FC<CVSelectionProps> = ({
  onCVSelect,
  selectedCVId,
}) => {
  const [cvs, setCVs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('teamified_access_token');
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

      const response = await axios.get<{ cvs: CV[] }>(
        `${API_BASE_URL}/v1/users/me/profile/cv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setCVs(response.data.cvs || []);

      // Auto-select the current CV if one exists and none is selected
      if (!selectedCVId && response.data.cvs?.length > 0) {
        const currentCV = response.data.cvs.find((cv) => cv.isCurrent);
        if (currentCV) {
          onCVSelect(currentCV);
        }
      }
           } catch (err: any) {
             console.error('Failed to fetch CVs:', err);
             setError(
               'Failed to load your CVs. Please refresh the page and try again.'
             );
           } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 2 }}
        action={
          <Button color="inherit" size="small" onClick={fetchCVs}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (cvs.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: '1px dashed #E5E7EB',
          textAlign: 'center',
        }}
      >
        <Upload size={48} style={{ color: '#9CA3AF', marginBottom: 16 }} />
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          No CV Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You haven't uploaded a CV yet. Upload one to apply for this position.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Upload size={20} />}
          href="/cv"
          sx={{ borderRadius: 2 }}
        >
          Upload CV
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Select Your CV
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose which CV you'd like to submit with your application
        </Typography>
      </Box>

      <RadioGroup
        value={selectedCVId || ''}
        onChange={(e) => {
          const selected = cvs.find((cv) => cv.id === e.target.value);
          onCVSelect(selected || null);
        }}
      >
        <Grid container spacing={2}>
          {cvs.map((cv) => (
            <Grid item xs={12} sm={6} md={4} key={cv.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  borderRadius: 3,
                  border: selectedCVId === cv.id ? 2 : 1,
                  borderColor:
                    selectedCVId === cv.id ? 'primary.main' : '#E5E7EB',
                  bgcolor:
                    selectedCVId === cv.id
                      ? 'rgba(161, 106, 232, 0.05)'
                      : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => onCVSelect(cv)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <FormControlLabel
                      value={cv.id}
                      control={<Radio />}
                      label=""
                      sx={{ m: 0 }}
                    />
                    {cv.isCurrent && (
                      <Chip
                        label="Current"
                        color="primary"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <FileText size={24} style={{ color: '#A16AE8' }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {cv.fileName}
                    </Typography>
                  </Box>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={14} style={{ color: '#6B7280' }} />
                      <Typography variant="caption" color="text.secondary">
                        Uploaded: {formatDate(cv.uploadedAt)}
                      </Typography>
                    </Box>

                    {selectedCVId === cv.id && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={14} style={{ color: '#10B981' }} />
                        <Typography
                          variant="caption"
                          sx={{ color: '#10B981', fontWeight: 600 }}
                        >
                          Selected for application
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    v{cv.versionId.slice(0, 8)}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>

      {/* Manage CVs Link */}
      <Box
        sx={{
          mt: 3,
          pt: 3,
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Need to upload a new CV or manage existing ones?
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ExternalLink size={16} />}
          href="/cv"
          target="_blank"
          sx={{ borderRadius: 2 }}
        >
          Manage CVs
        </Button>
      </Box>
    </Box>
  );
};

export default CVSelection;

