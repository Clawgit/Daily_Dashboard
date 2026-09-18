import { useState, useEffect, useCallback, useRef } from 'react';
import { netflixService } from '../services/netflixService';
import { NetflixDataResponse } from '../types';
import { useTabVisibility } from './useTabVisibility';

interface UseNetflixProps {
  category?: string;
  country?: string;
  autoRefresh?: boolean;
  intervalMinutes?: number;
}

export function useNetflix({
  category = 'Films (English)',
  country = 'Global',
  autoRefresh = true,
  intervalMinutes = 60,
}: UseNetflixProps = {}) {
  const [data, setData] = useState<NetflixDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const lastFetchedRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const dataRef = useRef<NetflixDataResponse | null>(null);
  dataRef.current = data;

  const fetchNetflix = useCallback(async (isManual: boolean = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else if (!dataRef.current) {
      setLoading(true);
    }
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const result = await netflixService.getTop10(category, country, abortControllerRef.current.signal);
      setData(result);
      lastFetchedRef.current = Date.now();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load Netflix Top 10:', err);
        setError(err.message || 'Unable to retrieve Netflix rankings');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [category, country]);

  useEffect(() => {
    fetchNetflix();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNetflix]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const intervalMs = Math.max(intervalMinutes, 10) * 60 * 1000;
    const timer = setInterval(() => {
      if (!document.hidden) {
        fetchNetflix(true);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoRefresh, intervalMinutes, fetchNetflix]);

  // Tab return revalidation
  useTabVisibility(() => {
    const staleThreshold = Math.max(intervalMinutes, 30) * 60 * 1000;
    if (Date.now() - lastFetchedRef.current > staleThreshold) {
      fetchNetflix(true);
    }
  });

  return {
    data,
    loading,
    error,
    isRefreshing,
    refresh: () => fetchNetflix(true),
  };
}

