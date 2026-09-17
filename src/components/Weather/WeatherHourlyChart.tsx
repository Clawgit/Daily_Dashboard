import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TemperatureUnit } from '../../types';

interface WeatherHourlyChartProps {
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
  };
  unit: TemperatureUnit;
}

export const WeatherHourlyChart: React.FC<WeatherHourlyChartProps> = ({ hourly, unit }) => {
  if (!hourly || !hourly.time || hourly.time.length === 0) {
    return null;
  }

  const toDisplayTemp = (celsius: number) => {
    return unit === 'fahrenheit' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
  };

  const chartData = hourly.time.slice(0, 16).map((timeStr, idx) => {
    const d = new Date(timeStr);
    const hourFormatted = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    return {
      time: hourFormatted,
      temp: toDisplayTemp(hourly.temperature_2m[idx]),
      precipitation: hourly.precipitation_probability[idx] || 0,
    };
  });

  return (
    <div className="w-full mt-4 pt-4 border-t border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          24h Temperature & Rain Forecast
        </span>
        <span className="text-[11px] text-cyan-400 font-mono">
          Hover for hourly details
        </span>
      </div>
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              unit={unit === 'fahrenheit' ? '°F' : '°C'}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-2 rounded-lg bg-[#0f172a]/95 border border-white/20 shadow-xl backdrop-blur-md text-xs space-y-1">
                      <div className="font-semibold text-slate-200">{data.time}</div>
                      <div className="text-cyan-400 font-mono">
                        Temp: {data.temp}°{unit === 'fahrenheit' ? 'F' : 'C'}
                      </div>
                      <div className="text-blue-400 font-mono">
                        Rain: {data.precipitation}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#00f2fe"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#tempGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

