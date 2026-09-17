import { useState, useEffect, useCallback, useRef } from 'react';
import { newsService } from '../services/newsService';
import { NewsDataResponse } from '../types';
import { useTabVisibility } from './useTabVisibility';

interface UseNewsProps {
  category?: string;
  autoRefresh?: boolean;
  intervalMinutes?: number;
}

export function useNews({
  category = 'World',
  autoRefresh = true,
  intervalMinutes = 5,
}: UseNewsProps = {}) {
  const [data, setData] = useState<NewsDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const lastFetchedRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNews = useCallback(async (isManual: boolean = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else if (!data) {
      setLoading(true);
    }
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const result = await newsService.getHeadlines(category, abortControllerRef.current.signal);
      setData(result);
      lastFetchedRef.current = Date.now();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load news:', err);
        setError(err.message || 'Unable to fetch global news headlines');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [category, data]);

  useEffect(() => {
    fetchNews();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNews]);

  useEffect(() => {
    if (!autoRefresh) return;
    const intervalMs = Math.max(intervalMinutes, 2) * 60 * 1000;
    const timer = setInterval(() => {
      if (!document.hidden) {
        fetchNews(true);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoRefresh, intervalMinutes, fetchNews]);

  useTabVisibility(() => {
    const staleThreshold = Math.max(intervalMinutes, 5) * 60 * 1000;
    if (Date.now() - lastFetchedRef.current > staleThreshold) {
      fetchNews(true);
    }
  });

  return {
    data,
    loading,
    error,
    isRefreshing,
    refresh: () => fetchNews(true),
  };
}

