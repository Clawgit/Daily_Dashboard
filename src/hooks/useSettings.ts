import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types';

const STORAGE_KEY = 'madhur_dashboard_settings_v2';

const DEFAULT_SETTINGS: UserSettings = {
  weatherLocation: {
    name: 'New Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
  },
  temperatureUnit: 'celsius',
  newsCategory: 'AI & Technology',
  netflixCategory: 'Films',
  netflixCountry: 'India',
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
