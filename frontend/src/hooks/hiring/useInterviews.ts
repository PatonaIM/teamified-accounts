import { useState, useEffect, useCallback, useRef } from 'react';
import interviewService from '../../services/hiring/interviewService';

export function useInterviews(filters: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const prevFiltersRef = useRef<string>('');

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const result = await interviewService.getAllMeetings(filters);
      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Use ref-based comparison to prevent infinite loops from filters object recreation
    const filtersStr = JSON.stringify(filters);
    if (prevFiltersRef.current !== filtersStr) {
      prevFiltersRef.current = filtersStr;
      fetchInterviews();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Only depend on filters, not fetchInterviews to avoid dependency cycle

  return { data, loading, error, refetch: fetchInterviews };
}

export function useInterviewSlots(userId: string, startDate: string, endDate: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!userId || !startDate || !endDate) return;

    try {
      setLoading(true);
      const result = await interviewService.getSlotsForEmployer(userId, startDate, endDate);
      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, startDate, endDate]);

  useEffect(() => {
    fetchSlots();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, startDate, endDate]); // Only depend on actual parameters, not fetchSlots

  return { data, loading, error, refetch: fetchSlots };
}
