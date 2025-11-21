import { useState, useCallback } from 'react';
import talentPoolService from '../../services/hiring/talentPoolService';

export function useAITalentSearch() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (searchParams: any) => {
    try {
      setLoading(true);
      const result = await talentPoolService.aiSearch(searchParams);
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, search };
}

export function useCandidateByEmail() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchByEmail = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const result = await talentPoolService.getCandidateByEmail(email);
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchByEmail };
}
