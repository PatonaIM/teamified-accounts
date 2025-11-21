import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  LocationOn as LocationOnIcon,
  Work as WorkIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import { getJobs, getJobDetails } from '../services/workableService';
import type { WorkableJob } from '../services/workableService';
import { useAuth } from '../hooks/useAuth';

const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<WorkableJob[]>([]);
  const [allJobs, setAllJobs] = useState<WorkableJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<WorkableJob | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<WorkableJob | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const hasJobsAccess = React.useMemo(() => {
    if (!user) return false;
    const userRoles = user.roles || [];
    return userRoles.some((role: string) =>
      ['candidate', 'admin'].includes(role.toLowerCase())
    );
  }, [user]);

  const canApply = React.useMemo(() => {
    if (!user) return false;
    const userRoles = user.roles || [];
    return userRoles.some((role: string) => 
      ['candidate', 'admin'].includes(role.toLowerCase())
    );
  }, [user]);

  if (user && !hasJobsAccess) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const [filters, setFilters] = useState<{
    location: string;
    department: string;
  }>({
    location: '',
    department: '',
  });
  
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  
  const limit = 20;

  const loadJobDetails = async (job: WorkableJob) => {
    try {
      setLoadingDetails(true);
      const details = await getJobDetails(job.shortcode);
      setSelectedJobDetails(details);
    } catch (err) {
      console.error('Failed to load job details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleJobSelect = (job: WorkableJob) => {
    setSelectedJob(job);
    loadJobDetails(job);
  };

  const loadJobs = async (loadMore: boolean = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      setError(null);

      const currentOffset = loadMore ? offset : 0;
      const response = await getJobs({
        offset: currentOffset,
        limit,
        search: searchQuery || undefined,
      });

      const loadedJobs = response.jobs;

      if (loadMore) {
        setAllJobs(prev => [...prev, ...loadedJobs]);
      } else {
        setAllJobs(loadedJobs);
        
        const locations = Array.from(new Set(
          loadedJobs
            .filter(job => job.location && job.location.location_str)
            .map(job => job.location.location_str)
        )).sort();
        
        const departments = Array.from(new Set(
          loadedJobs
            .filter(job => job.department)
            .map(job => job.department)
        )).sort();
        
        setAvailableLocations(locations);
        setAvailableDepartments(departments);
      }

      const filteredJobs = applyClientFilters(loadMore ? [...jobs, ...loadedJobs] : loadedJobs);
      setJobs(filteredJobs);

      if (filteredJobs.length > 0 && !selectedJob) {
        handleJobSelect(filteredJobs[0]);
      }

      setOffset(currentOffset + limit);
      setHasMore(response.paging.next !== null);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Failed to load job listings. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const applyClientFilters = (jobsList: WorkableJob[]) => {
    return jobsList.filter(job => {
      if (filters.location && job.location?.location_str !== filters.location) {
        return false;
      }
      
      if (filters.department && job.department !== filters.department) {
        return false;
      }
      
      return true;
    });
  };

  useEffect(() => {
    if (allJobs.length > 0) {
      const filteredJobs = applyClientFilters(allJobs);
      setJobs(filteredJobs);
      if (filteredJobs.length > 0 && !filteredJobs.find(j => j.id === selectedJob?.id)) {
        handleJobSelect(filteredJobs[0]);
      }
    }
  }, [filters]);

  useEffect(() => {
    loadJobs();
  }, []);

  const handleSearch = () => {
    setOffset(0);
    setJobs([]);
    setSelectedJob(null);
    setSelectedJobDetails(null);
    loadJobs(false);
  };

  const handleLoadMore = () => {
    loadJobs(true);
  };

  const handleFilterChange = (filterType: 'location' | 'department', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      location: '',
      department: '',
    });
    loadJobs();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.department) count++;
    if (searchQuery) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const formatEmploymentType = (type: string) => {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Full Time';
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  };

  const getJobSummary = (description: string, maxLength: number = 120) => {
    const text = stripHtml(description);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <LayoutMUI>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search jobs by title, location, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterIcon />}
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <Chip
                    label={activeFiltersCount}
                    size="small"
                    sx={{
                      ml: 1,
                      height: 18,
                      fontSize: '0.7rem',
                    }}
                    color="primary"
                  />
                )}
              </Button>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearFilters}
                  sx={{
                    borderRadius: 2,
                    minWidth: 'auto',
                    px: 2,
                    textTransform: 'none',
                  }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              )}
            </Box>
          </Box>

          <Collapse in={filtersExpanded}>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200, flex: '1 1 auto' }} size="small">
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    label="Location"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="">All Locations</MenuItem>
                    {availableLocations.map(location => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200, flex: '1 1 auto' }} size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    label="Department"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {availableDepartments.map(department => (
                      <MenuItem key={department} value={department}>
                        {department}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Collapse>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && jobs.length > 0 && (
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            {/* Job List - Left Side */}
            <Box sx={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
                {jobs.length} job{jobs.length !== 1 ? 's' : ''}
              </Typography>
              
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  elevation={0}
                  onClick={() => handleJobSelect(job)}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: selectedJob?.id === job.id ? 'primary.main' : '#E5E7EB',
                    bgcolor: selectedJob?.id === job.id ? 'action.selected' : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1,
                        fontSize: '1.1rem',
                      }}
                    >
                      {job.title}
                    </Typography>

                    {job.department && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                        {job.department}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                      {job.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {job.location.location_str || job.location.city}
                          </Typography>
                        </Box>
                      )}

                      {job.employment_type && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatEmploymentType(job.employment_type)}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {job.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                        }}
                      >
                        {getJobSummary(job.description)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}

              {hasMore && (
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  fullWidth
                  sx={{ 
                    borderRadius: 2, 
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {loadingMore ? <CircularProgress size={24} /> : 'Load More Jobs'}
                </Button>
              )}
            </Box>

            {/* Job Details - Right Side */}
            <Box sx={{ flex: 1 }}>
              {loadingDetails ? (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #E5E7EB',
                    p: 8,
                    textAlign: 'center',
                  }}
                >
                  <CircularProgress />
                </Paper>
              ) : selectedJobDetails ? (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #E5E7EB',
                    position: 'sticky',
                    top: 20,
                  }}
                >
                  <Box sx={{ p: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                      {selectedJobDetails.title}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                      {selectedJobDetails.department && (
                        <Chip
                          label={selectedJobDetails.department}
                          icon={<BusinessIcon />}
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            fontWeight: 600,
                          }}
                        />
                      )}
                      
                      {selectedJobDetails.location && (
                        <Chip
                          label={selectedJobDetails.location.location_str || selectedJobDetails.location.city}
                          icon={<LocationOnIcon />}
                          variant="outlined"
                        />
                      )}
                      
                      {selectedJobDetails.employment_type && (
                        <Chip
                          label={formatEmploymentType(selectedJobDetails.employment_type)}
                          icon={<WorkIcon />}
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {selectedJobDetails.created_at && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Posted {new Date(selectedJobDetails.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}

                    {canApply && (
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => window.location.href = `/jobs/${selectedJobDetails.shortcode}/apply`}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          px: 4,
                          mb: 4,
                          fontWeight: 600,
                          textTransform: 'none',
                        }}
                      >
                        Apply Now
                      </Button>
                    )}

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      About the Role
                    </Typography>

                    {selectedJobDetails.description && (
                      <Box
                        sx={{
                          mb: 3,
                          '& p': { mb: 2 },
                          '& ul': { mb: 2, pl: 3 },
                          '& li': { mb: 1 },
                          '& h1, & h2, & h3, & h4, & h5, & h6': { fontWeight: 600, mb: 2, mt: 3 },
                          color: 'text.secondary',
                          lineHeight: 1.7,
                        }}
                        dangerouslySetInnerHTML={{ __html: selectedJobDetails.description }}
                      />
                    )}

                    {selectedJobDetails.requirements && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Requirements
                        </Typography>
                        <Box
                          sx={{
                            mb: 3,
                            '& p': { mb: 2 },
                            '& ul': { mb: 2, pl: 3 },
                            '& li': { mb: 1 },
                            color: 'text.secondary',
                            lineHeight: 1.7,
                          }}
                          dangerouslySetInnerHTML={{ __html: selectedJobDetails.requirements }}
                        />
                      </>
                    )}

                    {selectedJobDetails.benefits && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Benefits
                        </Typography>
                        <Box
                          sx={{
                            '& p': { mb: 2 },
                            '& ul': { mb: 2, pl: 3 },
                            '& li': { mb: 1 },
                            color: 'text.secondary',
                            lineHeight: 1.7,
                          }}
                          dangerouslySetInnerHTML={{ __html: selectedJobDetails.benefits }}
                        />
                      </>
                    )}

                    {/* Additional Details */}
                    {(selectedJobDetails.experience || selectedJobDetails.education || selectedJobDetails.function || selectedJobDetails.industry) && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Job Details
                        </Typography>
                        <Stack spacing={2}>
                          {selectedJobDetails.experience && (
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Experience Level
                              </Typography>
                              <Typography variant="body1">{selectedJobDetails.experience}</Typography>
                            </Box>
                          )}

                          {selectedJobDetails.education && (
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Education
                              </Typography>
                              <Typography variant="body1">{selectedJobDetails.education}</Typography>
                            </Box>
                          )}

                          {selectedJobDetails.function && (
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Function
                              </Typography>
                              <Typography variant="body1">{selectedJobDetails.function}</Typography>
                            </Box>
                          )}

                          {selectedJobDetails.industry && (
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Industry
                              </Typography>
                              <Typography variant="body1">{selectedJobDetails.industry}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </>
                    )}
                  </Box>
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #E5E7EB',
                    p: 8,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Select a job
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                    Click on a job from the list to view details
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        )}

        {!loading && jobs.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderRadius: 3,
              border: '1px solid #E5E7EB',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              No jobs found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Check back soon for new opportunities'}
            </Typography>
            {searchQuery && (
              <Button
                variant="contained"
                onClick={() => {
                  setSearchQuery('');
                  setOffset(0);
                  setJobs([]);
                  loadJobs(false);
                }}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Clear Search
              </Button>
            )}
          </Paper>
        )}
      </Container>
    </LayoutMUI>
  );
};

export default JobsPage;
