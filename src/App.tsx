import { useState, useCallback } from 'react';
import { Header } from './components/Header/Header';
import { WeatherHero } from './components/Weather/WeatherHero';
import { WorldClock } from './components/WorldClock/WorldClock';
import { NetflixTop10 } from './components/Netflix/NetflixTop10';
import { GlobalNews } from './components/News/GlobalNews';
import { WorldEvents } from './components/Events/WorldEvents';
import { SettingsModal } from './components/Settings/SettingsModal';

import { useSettings } from './hooks/useSettings';
import { useLiveClock } from './hooks/useLiveClock';
import { useWeather } from './hooks/useWeather';
import { useNetflix } from './hooks/useNetflix';
import { useNews } from './hooks/useNews';
import { useEvents } from './hooks/useEvents';

export function App() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { formattedDate, formattedTime, getTimeForTimezone } = useLiveClock();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Active category states
  const [newsCategory, setNewsCategory] = useState(settings.newsCategory);
  const [netflixCategory, setNetflixCategory] = useState(settings.netflixCategory);

  // Geolocation detected callback
  const handleLocationDetected = useCallback(
    (loc: { latitude: number; longitude: number; name: string; country: string }) => {
      updateSettings({
        weatherLocation: loc,
      });
    },
    [updateSettings]
  );

  // Data Hooks
  const weather = useWeather({
    latitude: settings.weatherLocation.latitude,
    longitude: settings.weatherLocation.longitude,
    name: settings.weatherLocation.name,
    country: settings.weatherLocation.country,
    autoRefresh: settings.autoRefresh,
    intervalMinutes: settings.refreshIntervalMinutes.weather,
    onLocationDetected: handleLocationDetected,
  });

  const netflix = useNetflix({
    category: netflixCategory,
    country: settings.netflixCountry,
    autoRefresh: settings.autoRefresh,
    intervalMinutes: settings.refreshIntervalMinutes.netflix,
  });

  const news = useNews({
    category: newsCategory,
    autoRefresh: settings.autoRefresh,
    intervalMinutes: settings.refreshIntervalMinutes.news,
  });

  const events = useEvents({
    autoRefresh: settings.autoRefresh,
    intervalMinutes: settings.refreshIntervalMinutes.events,
  });

  // Global manual refresh handler
  const handleGlobalRefresh = useCallback(() => {
    weather.refresh();
    netflix.refresh();
    news.refresh();
    events.refresh();
  }, [weather, netflix, news, events]);

  const isGlobalRefreshing =
    weather.isRefreshing || netflix.isRefreshing || news.isRefreshing || events.isRefreshing;

  const isConnected = !!(weather.data || netflix.data || news.data || events.data);

  return (
    <div className="min-h-screen flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sticky Top Header */}
      <Header
        formattedDate={formattedDate}
        formattedTime={formattedTime}
        theme={settings.theme}
        onToggleTheme={() =>
          updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGlobalRefresh={handleGlobalRefresh}
        isRefreshing={isGlobalRefreshing}
        isConnected={isConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* 1. Hero: Weather & Forecast Overview */}
        <section aria-label="Current Weather & Forecast">
          <WeatherHero
            data={weather.data}
            loading={weather.loading}
            error={weather.error}
            isRefreshing={weather.isRefreshing}
            onRefresh={weather.refresh}
            unit={settings.temperatureUnit}
            onLocationChange={(newLoc) => updateSettings({ weatherLocation: newLoc })}
          />
        </section>

        {/* 2. World Clock */}
        <section aria-label="World Financial Centers Live Clock">
          <WorldClock getTimeForTimezone={getTimeForTimezone} />
        </section>

        {/* 3. Top 10 on Netflix */}
        <section aria-label="Netflix Global Top 10 Rankings">
          <NetflixTop10
            data={netflix.data}
            loading={netflix.loading}
            error={netflix.error}
            isRefreshing={netflix.isRefreshing}
            onRefresh={netflix.refresh}
            category={netflixCategory}
            onSelectCategory={(cat) => setNetflixCategory(cat)}
          />
        </section>

        {/* 4. Global News & World Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 10 Global News */}
          <section aria-label="Top 10 Global News Headlines">
            <GlobalNews
              data={news.data}
              loading={news.loading}
              error={news.error}
              isRefreshing={news.isRefreshing}
              onRefresh={news.refresh}
              category={newsCategory}
              onSelectCategory={(cat) => setNewsCategory(cat)}
            />
          </section>

          {/* Today Around the World */}
          <section aria-label="Today in World History and Observances">
            <WorldEvents
              data={events.data}
              loading={events.loading}
              error={events.error}
              isRefreshing={events.isRefreshing}
              onRefresh={events.refresh}
            />
          </section>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="mt-auto border-t border-white/10 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold tracking-wider text-white">WORLD PULSE</span>
            <span>—</span>
            <span>Dynamic Real-Time Intelligence Dashboard</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Live APIs: Open-Meteo • Netflix Tudum • Google Wire • Wikimedia</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-cyan-400 underline underline-offset-2 transition-colors"
            >
              Configure
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
      />
    </div>
  );
}

export default App;
