import { Box, CircularProgress } from '@mui/material';
import { useMemo } from 'react';
import LayoutMUI from '../../components/LayoutMUI';
import JobsContainer from './JobRequest/JobsContainer';
import { useAuth } from '../../contexts/AuthContext';

const JobRequestsPage = () => {
  console.log('[JobRequestsPage] START render');

  const { user, loading: authLoading } = useAuth();
  console.log('[JobRequestsPage] useAuth returned:', { user: !!user, authLoading });

  // Memoize clientId to prevent infinite re-renders from user object changes
  // Use 0 to fetch all open jobs (per API documentation)
  const clientId = useMemo(() => {
    const id = 0; // 0 = all jobs, null also works but 0 is more explicit
    console.log('[JobRequestsPage] clientId memoized:', id);
    return id;
  }, []);

  console.log('[JobRequestsPage] About to check authLoading');

  if (authLoading) {
    console.log('[JobRequestsPage] Showing loading spinner');
    return (
      <LayoutMUI>
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </LayoutMUI>
    );
  }

  console.log('[JobRequestsPage] About to render JobsContainer with clientId:', clientId);

  return (
    <LayoutMUI>
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          p: 1.5,
          backgroundColor: 'background.default',
        }}
      >
        <JobsContainer searchTerm="" clientCode={clientId} showActive={true} />
      </Box>
    </LayoutMUI>
  );
};

export default JobRequestsPage;
