import { useState, useEffect, useCallback, useRef } from 'react';
import { eventsService } from '../services/eventsService';
import { EventsDataResponse } from '../types';
import { useTabVisibility } from './useTabVisibility';

interface UseEventsProps {
  autoRefresh?: boolean;
  intervalMinutes?: number;
}

export function useEvents({
  autoRefresh = true,
  intervalMinutes = 60,
}: UseEventsProps = {}) {
  const [data, setData] = useState<EventsDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const lastFetchedRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const dataRef = useRef<EventsDataResponse | null>(null);
  dataRef.current = data;

  const fetchEvents = useCallback(async (isManual: boolean = false) => {
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
      const result = await eventsService.getDailyEvents(abortControllerRef.current.signal);
      setData(result);
      lastFetchedRef.current = Date.now();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load events:', err);
        setError(err.message || 'Unable to retrieve today in history events');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchEvents]);

  useEffect(() => {
    if (!autoRefresh) return;
    const intervalMs = Math.max(intervalMinutes, 10) * 60 * 1000;
    const timer = setInterval(() => {
      if (!document.hidden) {
        fetchEvents(true);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoRefresh, intervalMinutes, fetchEvents]);

  useTabVisibility(() => {
    const staleThreshold = Math.max(intervalMinutes, 30) * 60 * 1000;
    if (Date.now() - lastFetchedRef.current > staleThreshold) {
      fetchEvents(true);
    }
  });

  return {
    data,
    loading,
    error,
    isRefreshing,
    refresh: () => fetchEvents(true),
  };
}

