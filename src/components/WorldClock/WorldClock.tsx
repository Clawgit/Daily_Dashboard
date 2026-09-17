import React from 'react';
import { Card } from '../Common/Card';
import { Sun, Moon, Clock } from 'lucide-react';
import { WorldClockCity } from '../../types';

interface WorldClockProps {
  getTimeForTimezone: (tz: string) => { timeStr: string; dayStr: string; isDay: boolean; hour24: number };
}

const CITIES: WorldClockCity[] = [
  { city: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { city: 'London', country: 'United Kingdom', timezone: 'Europe/London', flag: '🇬🇧' },
  { city: 'New York', country: 'United States', timezone: 'America/New_York', flag: '🇺🇸' },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬' },
  { city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', flag: '🇦🇪' },
];

export const WorldClock: React.FC<WorldClockProps> = ({ getTimeForTimezone }) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold tracking-wide text-white uppercase font-mono">
            World Clock & Global Financial Hubs
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          IANA Dynamic Astronomical Time
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CITIES.map((item) => {
          const { timeStr, dayStr, isDay } = getTimeForTimezone(item.timezone);

          return (
            <div
              key={item.timezone}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base" role="img" aria-label={item.country}>
                  {item.flag}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isDay
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                      : 'bg-indigo-400/10 text-indigo-300 border border-indigo-400/20'
                  }`}
                >
                  {isDay ? <Sun className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
                  {isDay ? 'DAY' : 'NIGHT'}
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-white truncate">
                  {item.city}
                </div>
                <div className="text-[10px] text-slate-400">
                  {item.country}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-white/5">
                <div className="text-sm font-mono font-bold text-cyan-400 tracking-tight">
                  {timeStr}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {dayStr}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

