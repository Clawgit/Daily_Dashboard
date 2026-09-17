import React from 'react';
import { DailyForecastDay, TemperatureUnit } from '../../types';
import { Cloud, CloudRain, CloudSun, Sun, CloudLightning, CloudSnow, CloudDrizzle, Droplets } from 'lucide-react';

interface WeatherForecastProps {
  forecast: DailyForecastDay[];
  unit: TemperatureUnit;
}

function getWeatherIcon(code: number) {
  switch (code) {
    case 0:
      return <Sun className="w-6 h-6 text-amber-400" />;
    case 1:
    case 2:
      return <CloudSun className="w-6 h-6 text-amber-300" />;
    case 3:
      return <Cloud className="w-6 h-6 text-slate-300" />;
    case 51:
    case 53:
    case 55:
      return <CloudDrizzle className="w-6 h-6 text-cyan-400" />;
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return <CloudRain className="w-6 h-6 text-blue-400" />;
    case 71:
    case 73:
    case 75:
      return <CloudSnow className="w-6 h-6 text-indigo-300" />;
    case 95:
    case 96:
    case 99:
      return <CloudLightning className="w-6 h-6 text-purple-400" />;
    default:
      return <CloudSun className="w-6 h-6 text-slate-300" />;
  }
}

export const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast, unit }) => {
  const toDisplayTemp = (celsius: number) => {
    return unit === 'fahrenheit' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
  };

  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          7-Day Weather Outlook
        </h4>
        <span className="text-[11px] font-mono text-slate-400">
          Open-Meteo Global Models
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {forecast.map((day, idx) => {
          const isToday = idx === 0;
          return (
            <div
              key={day.date}
              className={`p-3 rounded-xl transition-all border flex flex-col items-center text-center justify-between ${
                isToday
                  ? 'bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-950/20'
                  : 'bg-white/5 hover:bg-white/10 border-white/5'
              }`}
            >
              <div className="space-y-0.5">
                <div className={`text-xs font-semibold ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-200'}`}>
                  {day.dayName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {day.date.split('-').slice(1).join('/')}
                </div>
              </div>

              <div className="my-2 p-1.5 rounded-full bg-white/5">
                {getWeatherIcon(day.weatherCode)}
              </div>

              <div className="text-[11px] text-slate-300 font-medium truncate w-full mb-1">
                {day.condition}
              </div>

              {/* High / Low */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="font-bold text-slate-100">
                  {toDisplayTemp(day.maxTemp)}°
                </span>
                <span className="text-slate-400">
                  {toDisplayTemp(day.minTemp)}°
                </span>
              </div>

              {/* Precip chance */}
              <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-400 font-mono">
                <Droplets className="w-2.5 h-2.5" />
                <span>{day.precipitationProbability}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
