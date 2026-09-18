import { useState, useEffect, useCallback, useRef } from 'react';
import { weatherService } from '../services/weatherService';
import { WeatherData } from '../types';
import { useTabVisibility } from './useTabVisibility';

interface UseWeatherProps {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  autoRefresh?: boolean;
  intervalMinutes?: number;
  onLocationDetected?: (loc: { latitude: number; longitude: number; name: string; country: string }) => void;
}

export function useWeather({
  latitude,
  longitude,
  name,
  country,
  autoRefresh = true,
  intervalMinutes = 10,
  onLocationDetected,
}: UseWeatherProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const lastFetchedRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const geolocationAttempted = useRef<boolean>(false);

  const dataRef = useRef<WeatherData | null>(null);
  dataRef.current = data;

  const fetchWeather = useCallback(async (isManual: boolean = false) => {
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
      const result = await weatherService.getWeather(
        latitude,
        longitude,
        name,
        country,
        abortControllerRef.current.signal
      );
      setData(result);
      lastFetchedRef.current = Date.now();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load weather:', err);
        setError(err.message || 'Unable to load weather forecast');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [latitude, longitude, name, country]);

  // Try geolocation once on mount if enabled and not previously attempted
  useEffect(() => {
    if (geolocationAttempted.current) return;
    geolocationAttempted.current = true;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: geoLat, longitude: geoLon } = position.coords;
          // Reverse geocode to get city name
          try {
            const resp = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?latitude=${geoLat}&longitude=${geoLon}&count=1&language=en&format=json`
            );
            if (resp.ok) {
              const res = await resp.json();
              const found = res.results?.[0];
              if (found && onLocationDetected) {
                onLocationDetected({
                  latitude: geoLat,
                  longitude: geoLon,
                  name: found.name || 'Local Area',
                  country: found.country || '',
                });
                return;
              }
            }
          } catch {
            // ignore geocode error, use coordinates directly
          }
          if (onLocationDetected) {
            onLocationDetected({
              latitude: geoLat,
              longitude: geoLon,
              name: 'My Location',
              country: '',
            });
          }
        },
        () => {
          // Geolocation denied or unavailable, use default location silently
        },
        { timeout: 6000, maximumAge: 3600000 }
      );
    }
  }, [onLocationDetected]);

  // Initial and param change fetch
  useEffect(() => {
    fetchWeather();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchWeather]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const intervalMs = Math.max(intervalMinutes, 1) * 60 * 1000;
    const timer = setInterval(() => {
      if (!document.hidden) {
        fetchWeather(true);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoRefresh, intervalMinutes, fetchWeather]);

  // Revalidate on tab visibility return if stale
  useTabVisibility(() => {
    const staleThreshold = Math.max(intervalMinutes, 5) * 60 * 1000;
    if (Date.now() - lastFetchedRef.current > staleThreshold) {
      fetchWeather(true);
    }
  });

  return {
    data,
    loading,
    error,
    isRefreshing,
    refresh: () => fetchWeather(true),
  };
}

