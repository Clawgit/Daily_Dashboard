import React from 'react';

interface AnalogClockProps {
  timezone: string;
  size?: number;
  isDay?: boolean;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ timezone, size = 80, isDay = true }) => {
  // Get time in the specified timezone
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });

  const [hours, minutes, seconds] = timeStr.split(':').map(Number);

  // Calculate hand angles in degrees
  const secondAngle = (seconds || 0) * 6;
  const minuteAngle = ((minutes || 0) + (seconds || 0) / 60) * 6;
  const hourAngle = (((hours || 0) % 12) + (minutes || 0) / 60) * 30;

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Current time in ${timezone}: ${hours}:${minutes}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        {/* Outer Dial Glow / Border */}
        <circle
          cx="50"
          cy="50"
          r="46"
          className="fill-slate-100/90 dark:fill-slate-900/90 stroke-slate-300/80 dark:stroke-white/10"
          strokeWidth="2"
        />

        {/* Inner subtle decorative ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          className={isDay ? "stroke-amber-500/20 dark:stroke-amber-400/15" : "stroke-indigo-500/20 dark:stroke-indigo-400/20"}
          strokeWidth="1"
          fill="none"
          strokeDasharray="2 3"
        />

        {/* 12 Hour Ticks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const isMajor = i % 3 === 0;
          const r1 = 44;
          const r2 = isMajor ? 36 : 39;
          const x1 = 50 + r1 * Math.sin(angle);
          const y1 = 50 - r1 * Math.cos(angle);
          const x2 = 50 + r2 * Math.sin(angle);
          const y2 = 50 - r2 * Math.cos(angle);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={
                isMajor
                  ? 'stroke-slate-700 dark:stroke-slate-200 stroke-[2]'
                  : 'stroke-slate-400 dark:stroke-slate-500 stroke-[1]'
              }
              strokeLinecap="round"
            />
          );
        })}

        {/* Hour Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="26"
          className="stroke-slate-800 dark:stroke-slate-100 stroke-[3.5]"
          strokeLinecap="round"
          transform={`rotate(${hourAngle} 50 50)`}
        />

        {/* Minute Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="16"
          className="stroke-cyan-600 dark:stroke-cyan-400 stroke-[2.2]"
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} 50 50)`}
        />

        {/* Second Hand */}
        <line
          x1="50"
          y1="58"
          x2="50"
          y2="14"
          className="stroke-rose-500 stroke-[1.2]"
          strokeLinecap="round"
          transform={`rotate(${secondAngle} 50 50)`}
        />

        {/* Center Hub / Pin */}
        <circle cx="50" cy="50" r="3.5" className="fill-rose-500 stroke-white dark:stroke-slate-900 stroke-1" />
      </svg>
    </div>
  );
};

