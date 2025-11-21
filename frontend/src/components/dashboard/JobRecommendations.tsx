import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Avatar,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getJobs, type WorkableJob } from '../../services/workableService';

const JobRecommendations: React.FC = () => {
  const [jobs, setJobs] = useState<WorkableJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendedJobs();
  }, []);

  const loadRecommendedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all jobs and take the first 2-3 (will be refined with profile matching)
      const response = await getJobs({ limit: 3 });
      const recommendedJobs = response.jobs.slice(0, 3);
      setJobs(recommendedJobs);
    } catch (err: any) {
      console.error('Failed to load recommended jobs:', err);
      setError('Unable to load job recommendations');
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = (location: WorkableJob['location']): string => {
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }
    return location.country || 'Remote';
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #E5E7EB' }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
            <WorkIcon />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Recommended Jobs for You
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error || jobs.length === 0) {
    return null; // Silently fail - don't show error or empty state on dashboard
  }

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #E5E7EB' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
            <WorkIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Recommended Jobs for You
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Based on your profile and experience
            </Typography>
          </Box>
        </Box>
        <Button
          component={Link}
          to="/jobs"
          endIcon={<ArrowForwardIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          View All
        </Button>
      </Box>

      {/* Job Cards Grid - Matching JobsPage layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {jobs.map((job) => (
          <Box key={job.shortcode}>
            <Card
              component={Link}
              to={`/jobs/${job.shortcode}`}
              sx={{
                height: 320, // Fixed height matching JobsPage
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: 2,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                {/* Job Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '3.2em',
                  }}
                >
                  {job.title}
                </Typography>

                {/* Department Badge */}
                {job.department && (
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={job.department}
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                )}

                {/* Job Details */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatLocation(job.location)}
                    </Typography>
                  </Box>

                  {/* Employment Type */}
                  {job.employment_type && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {job.employment_type}
                      </Typography>
                    </Box>
                  )}

                  {/* Posted Time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {getTimeAgo(job.created_at)}
                    </Typography>
                  </Box>
                </Box>

                {/* Apply Button */}
                <Button
                  component={Link}
                  to={`/jobs/${job.shortcode}/apply`}
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/jobs/${job.shortcode}/apply`;
                  }}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default JobRecommendations;
