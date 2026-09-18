import { useState, useCallback } from 'react';
import { Header } from './components/Header/Header';
import { WeatherHero } from './components/Weather/WeatherHero';
import { WorldClock } from './components/WorldClock/WorldClock';
import { NetflixTop10 } from './components/Netflix/NetflixTop10';
import { GlobalNews } from './components/News/GlobalNews';
import { AroundIndia } from './components/Events/AroundIndia';
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
    country: settings.netflixCountry || 'India',
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
    <div className="min-h-screen flex flex-col selection:bg-cyan-500/30 selection:text-cyan-800 dark:selection:text-cyan-200">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Responsive Dashboard Grid:
            Desktop: 2 Columns:
              Row 1: [WEATHER] | [WORLD CLOCK]
              Row 2: [NETFLIX + PRIME] | [TOP WORLD NEWS]
              Row 3: [AROUND INDIA] (spans full 2 columns)
            Mobile: 1 Column:
              Weather -> World Clock -> Netflix + Prime -> Top World News -> Around India
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch">
          {/* 1. Weather */}
          <section aria-label="Current Weather & Forecast" className="flex flex-col">
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
          <section aria-label="World Financial Centers Live Analog Clocks" className="flex flex-col">
            <WorldClock getTimeForTimezone={getTimeForTimezone} />
          </section>

          {/* 3. Top 10 Netflix & Amazon Prime India */}
          <section aria-label="Netflix & Amazon Prime India Rankings" className="flex flex-col">
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

          {/* 4. Top 10 World News (AI-First & India News) */}
          <section aria-label="Top 10 World News Headlines" className="flex flex-col">
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

          {/* 5. Around India (Festivals & Cultural Events - Full Width) */}
          <section aria-label="Around India Cultural Festivals & Traditions" className="lg:col-span-2">
            <AroundIndia
              data={events.data}
              loading={events.loading}
              error={events.error}
              isRefreshing={events.isRefreshing}
              onRefresh={events.refresh}
            />
          </section>
        </div>
      </main>

      {/* Modern High-Contrast Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-white/10 py-5 sm:py-6 text-xs font-mono text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-extrabold tracking-wider text-slate-900 dark:text-white font-mono">
              MADHUR DASHBOARD
            </span>
            <span>—</span>
            <span className="text-slate-600 dark:text-slate-400 font-sans">
              Your world at a glance
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
            <span>Verified Feeds: Open-Meteo • Netflix Tudum • BBC News Wire • Indian Heritage Calendar</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="touch-target hover:text-cyan-600 dark:hover:text-cyan-400 underline underline-offset-2 transition-colors font-bold"
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
