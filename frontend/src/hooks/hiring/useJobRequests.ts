import { useState, useEffect, useCallback, useRef } from 'react';
import jobRequestService from '../../services/hiring/jobRequestService';

export function useJobRequests(filters: any) {
  console.log('[useJobRequests] Hook called with filters:', filters);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const requestIdRef = useRef(0);
  const prevFiltersRef = useRef<string>('');

  // Ensure pageSize has a default value
  const pageSize = filters.pageSize || 10;

  const fetchJobRequests = useCallback(async (page: number, append: boolean = false) => {
    console.log('[useJobRequests] fetchJobRequests called with page:', page, 'append:', append);
    // Increment and capture request ID to detect stale responses
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    try {
      if (append) {
        console.log('[useJobRequests] Setting isFetchingNextPage to true');
        setIsFetchingNextPage(true);
      } else {
        console.log('[useJobRequests] Setting loading to true, clearing data');
        setLoading(true);
        setData([]);
        setPageNumber(0);
      }

      // Explicitly include pageSize for hasMore calculation
      console.log('[useJobRequests] About to call jobRequestService.getJobRequests');
      console.log('[useJobRequests] Filters object:', { ...filters, pageNumber: page, pageSize: pageSize });

      const result = await jobRequestService.getJobRequests({
        ...filters,
        pageNumber: page,
        pageSize: pageSize
      });

      console.log('[useJobRequests] jobRequestService returned:', result);

      // Ignore stale responses - only update if this is still the latest request
      if (requestIdRef.current !== currentRequestId) {
        // Response is stale, discard it completely (don't update any state)
        return;
      }

      // Response is fresh, update state
      if (append) {
        setData(prev => [...prev, ...(result.data || [])]);
      } else {
        setData(result.data || []);
      }

      setHasMore(result.hasMore || false);
      setTotalCount(result.totalCount || 0);
      setError(null);
    } catch (err) {
      // Only set error if this request is still current
      if (requestIdRef.current === currentRequestId) {
        setError(err as Error);
      }
      // Rethrow to propagate error to caller (for page number rollback)
      throw err;
    } finally {
      // Only update loading states if this is still the current request
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
        setIsFetchingNextPage(false);
      }
    }
  }, [filters, pageSize]);

  const fetchNextPage = useCallback(async () => {
    if (!isFetchingNextPage && hasMore) {
      const nextPage = pageNumber + 1;
      try {
        await fetchJobRequests(nextPage, true);
        // Only increment page number on success
        setPageNumber(nextPage);
      } catch (err) {
        // Page number not incremented, so retry will use same page
        console.error('Failed to fetch next page:', err);
      }
    }
  }, [pageNumber, hasMore, isFetchingNextPage, fetchJobRequests]);

  useEffect(() => {
    // Use ref-based comparison to prevent infinite loops from filters object recreation
    const filtersStr = JSON.stringify(filters);
    console.log('[useJobRequests] Effect triggered. Comparing filters:', {
      prev: prevFiltersRef.current,
      current: filtersStr,
      changed: prevFiltersRef.current !== filtersStr
    });
    if (prevFiltersRef.current !== filtersStr) {
      prevFiltersRef.current = filtersStr;
      console.log('[useJobRequests] Filters changed! Calling fetchJobRequests(0, false)');
      fetchJobRequests(0, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Only depend on filters, not fetchJobRequests to avoid dependency cycle

  return { 
    data, 
    loading, 
    error, 
    hasMore, 
    totalCount,
    isFetchingNextPage,
    fetchNextPage,
    refetch: () => fetchJobRequests(0, false)
  };
}

export function useJobRequest(id: string) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchJobRequest = async () => {
      try {
        setLoading(true);
        const result = await jobRequestService.getJobRequestById(id);
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobRequest();
  }, [id]);

  return { data, loading, error };
}

export function useJobStats(jobId: string) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const result = await jobRequestService.getJobStats(jobId);
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [jobId]);

  return { data, loading, error };
}

export function useCandidatesByStage(jobId: string, stageId: string, page: number = 1) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchCandidates = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const result = await jobRequestService.getCandidatesByStage(jobId, stageId, page);
      setData(result.data || []);
      setHasMore(result.hasMore || false);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [jobId, stageId, page]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return { data, loading, error, hasMore, refetch: fetchCandidates };
}

export function useDynamicStages() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setLoading(true);
        const result = await jobRequestService.getAllDynamicStages();
        setData(result.data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, []);

  return { data: data, loading, error };
}
