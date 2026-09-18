import React from 'react';
import { Card } from '../Common/Card';
import { AnalogClock } from './AnalogClock';
import { Clock, Sun, Moon } from 'lucide-react';
import { WorldClockCity } from '../../types';

interface WorldClockProps {
  getTimeForTimezone: (tz: string) => { timeStr: string; dayStr: string; isDay: boolean; hour24: number };
}

const CITIES: WorldClockCity[] = [
  { city: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳', offsetLabel: 'IST UTC+5:30' },
  { city: 'London', country: 'UK', timezone: 'Europe/London', flag: '🇬🇧', offsetLabel: 'GMT UTC+1' },
  { city: 'New York', country: 'USA', timezone: 'America/New_York', flag: '🇺🇸', offsetLabel: 'EDT UTC-4' },
  { city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles', flag: '🇺🇸', offsetLabel: 'PDT UTC-7' },
  { city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', flag: '🇦🇪', offsetLabel: 'GST UTC+4' },
  { city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬', offsetLabel: 'SGT UTC+8' },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵', offsetLabel: 'JST UTC+9' },
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺', offsetLabel: 'AEST UTC+10' },
];

export const WorldClock: React.FC<WorldClockProps> = ({ getTimeForTimezone }) => {
  return (
    <Card glow className="p-4 sm:p-5 glow-clock flex flex-col h-full justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-2.5 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-bold tracking-wider text-slate-900 dark:text-white uppercase font-mono">
            World Clock & Financial Hubs
          </h2>
        </div>
        <span className="hidden sm:inline-block text-[10px] font-mono text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
          8 Hubs • Live Analog
        </span>
      </div>

      {/* Responsive Clock Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 flex-1">
        {CITIES.map((item) => {
          const { timeStr, dayStr, isDay } = getTimeForTimezone(item.timezone);

          return (
            <div
              key={item.timezone}
              className="p-2.5 sm:p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] border border-slate-200/80 dark:border-white/5 transition-all flex flex-col items-center text-center justify-between group"
            >
              {/* City & Day/Night Pill */}
              <div className="w-full flex items-center justify-between gap-1 mb-2">
                <span className="text-sm" role="img" aria-label={item.country}>
                  {item.flag}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded-full font-medium ${
                    isDay
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  {isDay ? <Sun className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
                  {isDay ? 'DAY' : 'NIGHT'}
                </span>
              </div>

              {/* Analog SVG Dial */}
              <div className="my-1">
                <AnalogClock timezone={item.timezone} size={64} isDay={isDay} />
              </div>

              {/* City details */}
              <div className="mt-2 w-full">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {item.city}
                </div>
                <div className="text-xs font-mono font-extrabold text-purple-700 dark:text-purple-300 tracking-tight mt-0.5">
                  {timeStr}
                </div>
                <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {dayStr} • {item.offsetLabel.split(' ')[0]}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
