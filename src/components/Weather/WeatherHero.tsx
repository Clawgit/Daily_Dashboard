import React, { useState } from 'react';
import { Card } from '../Common/Card';
import { LastUpdatedBadge } from '../Common/LastUpdatedBadge';
import { LoadingSkeleton } from '../Common/LoadingSkeleton';
import { ErrorState } from '../Common/ErrorState';
import { LocationModal } from './LocationModal';
import { WeatherData, TemperatureUnit } from '../../types';
import {
  MapPin,
  Wind,
  Droplets,
  Sun,
  Sunrise,
  Thermometer,
  CloudSun,
  CloudRain,
  Cloud,
  CloudLightning,
  CloudSnow,
  CloudDrizzle,
  Moon,
} from 'lucide-react';

interface WeatherHeroProps {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  unit: TemperatureUnit;
  onLocationChange: (loc: { name: string; country: string; latitude: number; longitude: number }) => void;
}

function getWeatherIcon(code: number, isDay: boolean) {
  switch (code) {
    case 0:
      return isDay ? (
        <Sun className="w-9 h-9 text-amber-500 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
      ) : (
        <Moon className="w-9 h-9 text-cyan-400 drop-shadow-[0_0_12px_rgba(0,242,254,0.5)]" />
      );
    case 1:
    case 2:
      return <CloudSun className="w-9 h-9 text-amber-500 dark:text-amber-400" />;
    case 3:
      return <Cloud className="w-9 h-9 text-slate-500 dark:text-slate-300" />;
    case 51:
    case 53:
    case 55:
      return <CloudDrizzle className="w-9 h-9 text-cyan-500 dark:text-cyan-400" />;
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return <CloudRain className="w-9 h-9 text-blue-500 dark:text-blue-400" />;
    case 71:
    case 73:
    case 75:
      return <CloudSnow className="w-9 h-9 text-indigo-400" />;
    case 95:
    case 96:
    case 99:
      return <CloudLightning className="w-9 h-9 text-purple-500" />;
    default:
      return <CloudSun className="w-9 h-9 text-slate-400" />;
  }
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({
  data,
  loading,
  error,
  isRefreshing,
  onRefresh,
  unit,
  onLocationChange,
}) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const toDisplayTemp = (celsius: number) => {
    return unit === 'fahrenheit' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return '--:--';
    }
  };

  const todayForecast = data?.forecast?.[0];

  return (
    <Card glow className="p-4 sm:p-5 glow-weather flex flex-col justify-between h-full">
      {/* Header with Location & Refresh */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200/80 dark:border-white/10">
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="group touch-target flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-left transition-all max-w-[70%]"
          title="Click to search city"
        >
          <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div className="truncate">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
              {data?.current.locationName || 'Location'}
            </span>
            {data?.current.country && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1">
                ({data.current.country})
              </span>
            )}
          </div>
          <span className="text-[9px] uppercase font-mono px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 ml-1 flex-shrink-0">
            Edit
          </span>
        </button>

        <LastUpdatedBadge
          timestamp={data?.lastUpdated}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          cached={data?.cached}
        />
      </div>

      {loading && !data && <LoadingSkeleton variant="hero" />}

      {error && !data && (
        <ErrorState
          title="Weather Offline"
          message={error}
          onRetry={onRefresh}
          isRetrying={isRefreshing}
        />
      )}

      {data && (
        <div className="space-y-3.5 flex-1 flex flex-col justify-between">
          {/* Main Temp & Key Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Temp, Icon, Condition */}
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                {getWeatherIcon(data.current.weatherCode, data.current.isDay)}
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {toDisplayTemp(data.current.temperature)}°
                  </span>
                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                    {unit === 'fahrenheit' ? 'F' : 'C'}
                  </span>
                  {todayForecast && (
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 ml-2">
                      H: {toDisplayTemp(todayForecast.maxTemp)}° L: {toDisplayTemp(todayForecast.minTemp)}°
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {data.current.condition}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <Thermometer className="w-3 h-3 text-cyan-500" />
                  <span>Feels like {toDisplayTemp(data.current.apparentTemperature)}°</span>
                </div>
              </div>
            </div>

            {/* Right: 4 Compact Metrics */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <div className="px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Humidity</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">{data.current.humidity}%</div>
                </div>
              </div>

              <div className="px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-center gap-2">
                <Wind className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Wind</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">{data.current.windSpeed} km/h</div>
                </div>
              </div>

              <div className="px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">UV Index</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">{data.current.uvIndex} <span className="text-[9px] font-normal text-slate-400">/ 11</span></div>
                </div>
              </div>

              <div className="px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-center gap-2">
                <Sunrise className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Sun</div>
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white font-mono">{formatTime(data.current.sunrise)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Compact Forecast Strip */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-white/10">
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">
              5-Day Outlook
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {data.forecast.slice(0, 5).map((day, idx) => (
                <div
                  key={day.date}
                  className={`p-1.5 sm:p-2 rounded-xl text-center flex flex-col items-center justify-between border ${
                    idx === 0
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-slate-100/60 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/5'
                  }`}
                >
                  <span className={`text-[10px] font-semibold truncate ${idx === 0 ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                    {idx === 0 ? 'Today' : day.dayName.slice(0, 3)}
                  </span>
                  <div className="my-1 scale-90">
                    {getWeatherIcon(day.weatherCode, true)}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-900 dark:text-white">
                    {toDisplayTemp(day.maxTemp)}°
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                    {toDisplayTemp(day.minTemp)}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* City Search Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={onLocationChange}
      />
    </Card>
  );
};
