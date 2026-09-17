import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types';

const STORAGE_KEY = 'world_pulse_settings_v1';

const DEFAULT_SETTINGS: UserSettings = {
  weatherLocation: {
    name: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.0060,
  },
  temperatureUnit: 'celsius',
  newsCategory: 'World',
  netflixCategory: 'Films (English)',
  netflixCountry: 'Global',
  autoRefresh: true,
  refreshIntervalMinutes: {
    weather: 10,
    news: 5,
    netflix: 60,
    events: 60,
  },
  reducedMotion: false,
  theme: 'dark',
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to parse stored settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist settings
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save settings to localStorage:', e);
      }
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (e) {
      console.warn('Failed to reset settings:', e);
    }
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}

