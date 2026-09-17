import { useState, useEffect } from 'react';

export function useLiveClock() {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(now);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  const getTimeForTimezone = (timeZone: string) => {
    try {
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const hour24Formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        hour12: false,
      });

      const dayFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'short',
      });

      const hourNum = parseInt(hour24Formatter.format(now), 10);
      const isDay = hourNum >= 6 && hourNum < 19;

      return {
        timeStr: timeFormatter.format(now),
        dayStr: dayFormatter.format(now),
        isDay,
        hour24: hourNum,
      };
    } catch {
      return {
        timeStr: '--:--:--',
        dayStr: '',
        isDay: true,
        hour24: 12,
      };
    }
  };

  return {
    now,
    formattedDate,
    formattedTime,
    getTimeForTimezone,
  };
}

