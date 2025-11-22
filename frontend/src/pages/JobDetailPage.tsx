import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationOnIcon,
  Work as WorkIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import { getJobDetails } from '../services/workableService';
import type { WorkableJob } from '../services/workableService';
import { useAuth } from '../hooks/useAuth';

const JobDetailPage: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState<WorkableJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canApply = React.useMemo(() => {
    if (!user) return false;
    const userRoles = user.roles || [];
    return userRoles.some((role: string) => 
      ['candidate', 'admin'].includes(role.toLowerCase())
    );
  }, [user]);

  useEffect(() => {
    const loadJobDetails = async () => {
      if (!shortcode) {
        setError('Invalid job shortcode');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const jobData = await getJobDetails(shortcode);
        setJob(jobData);
      } catch (err: any) {
        console.error('Failed to load job details:', err);
        setError(err.response?.data?.message || 'Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [shortcode]);

  const formatEmploymentType = (type: string) => {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Full Time';
  };

  if (loading) {
    return (
      <LayoutMUI>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </LayoutMUI>
    );
  }

  if (error || !job) {
    return (
      <LayoutMUI>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error || 'Job not found'}
          </Alert>
          <Button
            variant="outlined"
            onClick={() => navigate('/jobs')}
            startIcon={<ArrowBackIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Back to Jobs
          </Button>
        </Container>
      </LayoutMUI>
    );
  }

  return (
    <LayoutMUI>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button
          variant="text"
          onClick={() => navigate('/jobs')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            mb: 3,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Back to Jobs
        </Button>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #E5E7EB',
          }}
        >
          <Box sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 3 }}>
              {job.title}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              {job.department && (
                <Chip
                  label={job.department}
                  icon={<BusinessIcon />}
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
              )}
              
              {job.location && (
                <Chip
                  label={job.location.location_str || job.location.city}
                  icon={<LocationOnIcon />}
                  variant="outlined"
                />
              )}
              
              {job.employment_type && (
                <Chip
                  label={formatEmploymentType(job.employment_type)}
                  icon={<WorkIcon />}
                  variant="outlined"
                />
              )}
            </Box>

            {job.created_at && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {canApply && (
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(`/jobs/${shortcode}/apply`)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 4,
                  mb: 4,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Apply for this Position
              </Button>
            )}

            <Divider sx={{ mb: 4 }} />

            {job.description && (
              <>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  About the Role
                </Typography>
                <Box
                  sx={{
                    mb: 4,
                    '& p': { mb: 2 },
                    '& ul': { mb: 2, pl: 3 },
                    '& li': { mb: 1 },
                    '& h1, & h2, & h3, & h4, & h5, & h6': { fontWeight: 600, mb: 2, mt: 3 },
                    color: 'text.secondary',
                    lineHeight: 1.7,
                  }}
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </>
            )}

            {job.requirements && (
              <>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Requirements
                </Typography>
                <Box
                  sx={{
                    mb: 4,
                    '& p': { mb: 2 },
                    '& ul': { mb: 2, pl: 3 },
                    '& li': { mb: 1 },
                    color: 'text.secondary',
                    lineHeight: 1.7,
                  }}
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </>
            )}

            {job.benefits && (
              <>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Benefits
                </Typography>
                <Box
                  sx={{
                    mb: 4,
                    '& p': { mb: 2 },
                    '& ul': { mb: 2, pl: 3 },
                    '& li': { mb: 1 },
                    color: 'text.secondary',
                    lineHeight: 1.7,
                  }}
                  dangerouslySetInnerHTML={{ __html: job.benefits }}
                />
              </>
            )}

            {(job.experience || job.education || job.function || job.industry) && (
              <>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Job Details
                </Typography>
                <Stack spacing={2.5}>
                  {job.experience && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Experience Level
                      </Typography>
                      <Typography variant="body1">{job.experience}</Typography>
                    </Box>
                  )}

                  {job.education && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Education
                      </Typography>
                      <Typography variant="body1">{job.education}</Typography>
                    </Box>
                  )}

                  {job.function && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Function
                      </Typography>
                      <Typography variant="body1">{job.function}</Typography>
                    </Box>
                  )}

                  {job.industry && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Industry
                      </Typography>
                      <Typography variant="body1">{job.industry}</Typography>
                    </Box>
                  )}

                  {job.location?.telecommuting && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Remote Work
                      </Typography>
                      <Chip label="Remote Available" size="small" color="success" />
                    </Box>
                  )}
                </Stack>
              </>
            )}

            {canApply && (
              <>
                <Divider sx={{ my: 4 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(`/jobs/${shortcode}/apply`)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      px: 6,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    Apply for this Position
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </LayoutMUI>
  );
};

export default JobDetailPage;
