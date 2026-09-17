import React, { useState } from 'react';
import { Card } from '../Common/Card';
import { LastUpdatedBadge } from '../Common/LastUpdatedBadge';
import { LoadingSkeleton } from '../Common/LoadingSkeleton';
import { ErrorState } from '../Common/ErrorState';
import { WeatherForecast } from './WeatherForecast';
import { WeatherHourlyChart } from './WeatherHourlyChart';
import { LocationModal } from './LocationModal';
import { WeatherData, TemperatureUnit } from '../../types';
import {
  MapPin,
  Wind,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Eye,
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
        <Sun className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]" />
      ) : (
        <Moon className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]" />
      );
    case 1:
    case 2:
      return (
        <CloudSun className="w-12 h-12 text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.3)]" />
      );
    case 3:
      return <Cloud className="w-12 h-12 text-slate-300" />;
    case 51:
    case 53:
    case 55:
      return <CloudDrizzle className="w-12 h-12 text-cyan-400" />;
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return (
        <CloudRain className="w-12 h-12 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]" />
      );
    case 71:
    case 73:
    case 75:
      return <CloudSnow className="w-12 h-12 text-indigo-300" />;
    case 95:
    case 96:
    case 99:
      return (
        <CloudLightning className="w-12 h-12 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
      );
    default:
      return <CloudSun className="w-12 h-12 text-slate-300" />;
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

  return (
    <Card glow className="p-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all text-left"
            title="Click to search worldwide city"
          >
            <MapPin className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                {data?.current.locationName || 'Detecting Location...'}
                {data?.current.country && (
                  <span className="text-xs text-slate-400 font-normal">
                    ({data.current.country})
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ml-1">
              Change
            </span>
          </button>
        </div>

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
          title="Weather Feed Offline"
          message={error}
          onRetry={onRefresh}
          isRetrying={isRefreshing}
        />
      )}

      {data && (
        <div className="space-y-6">
          {/* Main Weather Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Temp and Condition */}
            <div className="lg:col-span-6 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                {getWeatherIcon(data.current.weatherCode, data.current.isDay)}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-mono">
                    {toDisplayTemp(data.current.temperature)}°
                  </span>
                  <span className="text-xl font-semibold text-cyan-400">
                    {unit === 'fahrenheit' ? 'F' : 'C'}
                  </span>
                </div>
                <div className="text-lg font-medium text-slate-200 mt-1">
                  {data.current.condition}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Feels like {toDisplayTemp(data.current.apparentTemperature)}°</span>
                </div>
              </div>
            </div>

            {/* Right: Key Atmosphere Metrics */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Humidity */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>Humidity</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {data.current.humidity}%
                </div>
              </div>

              {/* Wind Speed */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Wind className="w-3.5 h-3.5 text-teal-400" />
                  <span>Wind Speed</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {data.current.windSpeed} km/h
                </div>
              </div>

              {/* UV Index */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>UV Index</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {data.current.uvIndex} <span className="text-xs font-normal text-slate-400">/ 11</span>
                </div>
              </div>

              {/* Visibility / Air */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Visibility</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {data.current.visibilityKm} km
                </div>
              </div>
            </div>
          </div>

          {/* Sunrise / Sunset bar */}
          <div className="flex flex-wrap items-center gap-6 py-2 px-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-amber-400" />
              <span>Sunrise: <strong className="text-white">{formatTime(data.current.sunrise)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="w-4 h-4 text-rose-400" />
              <span>Sunset: <strong className="text-white">{formatTime(data.current.sunset)}</strong></span>
            </div>
            <div className="text-slate-400 text-[11px] ml-auto">
              Timezone: {data.current.timezone}
            </div>
          </div>

          {/* Hourly Temperature Trend Visualization */}
          <WeatherHourlyChart hourly={data.current.hourly} unit={unit} />

          {/* 7-Day Forecast */}
          <WeatherForecast forecast={data.forecast} unit={unit} />
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

