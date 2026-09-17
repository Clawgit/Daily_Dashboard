import { fetchApi } from './apiClient';
import { WeatherData, GeoLocationResult } from '../types';

export const weatherService = {
  async getWeather(latitude: number, longitude: number, name?: string, country?: string, signal?: AbortSignal): Promise<WeatherData> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      name: name || 'Current Location',
      country: country || '',
    });
    return fetchApi<WeatherData>(`/weather?${params.toString()}`, { signal, timeoutMs: 9000 });
  },

  async searchLocation(query: string, signal?: AbortSignal): Promise<GeoLocationResult[]> {
    if (!query || query.trim().length < 2) return [];
    return fetchApi<GeoLocationResult[]>(`/weather/search?q=${encodeURIComponent(query)}`, { signal, timeoutMs: 6000 });
  },
};

