import type { Config } from '@netlify/functions';
import { cacheKey, getFromCache, setInCache } from '../lib/cache.mjs';
import { errorMessage, fail, ok } from '../lib/http.mjs';
import { dayNames, mapWeatherCode } from '../lib/weather-codes.mjs';

const TTL_MS = 10 * 60 * 1000;

export default async (req: Request) => {
  const params = new URL(req.url).searchParams;
  const lat = params.get('latitude') || '40.7128';
  const lon = params.get('longitude') || '-74.0060';
  const locationName = params.get('name') || 'New York';
  const country = params.get('country') || 'United States';
  const key = cacheKey('weather', lat, lon);

  try {
    const cached = await getFromCache<unknown>(key);
    if (cached && !cached.isStale) {
      return ok(cached.data, { cached: true });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!resp.ok) {
      if (cached) {
        return ok(cached.data, { cached: true, warning: 'Using cached weather due to upstream delay' });
      }
      throw new Error(`Open-Meteo returned status ${resp.status}`);
    }

    const raw = await resp.json();
    const current = raw.current || {};
    const daily = raw.daily || {};
    const isDay = current.is_day === 1;
    const weatherCode = current.weather_code ?? 0;
    const { condition } = mapWeatherCode(weatherCode, isDay);

    // Build 7-day forecast array
    const forecast = [];
    const dates: string[] = daily.time || [];
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const code = daily.weather_code?.[i] ?? 0;
      forecast.push({
        date: dates[i],
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
        weatherCode: code,
        condition: mapWeatherCode(code, true).condition,
        maxTemp: Math.round(daily.temperature_2m_max?.[i] ?? 0),
        minTemp: Math.round(daily.temperature_2m_min?.[i] ?? 0),
        precipitationProbability: daily.precipitation_probability_max?.[i] ?? 0,
        uvIndex: daily.uv_index_max?.[i] ?? 0,
      });
    }

    // Hourly forecast for the next 24 hours
    const hourlyTimes: string[] = [];
    const hourlyTemps: number[] = [];
    const hourlyPrecip: number[] = [];
    if (raw.hourly?.time) {
      const now = new Date();
      let count = 0;
      for (let i = 0; i < raw.hourly.time.length && count < 24; i++) {
        const t = new Date(raw.hourly.time[i]);
        if (t >= now || i === 0) {
          hourlyTimes.push(raw.hourly.time[i]);
          hourlyTemps.push(Math.round(raw.hourly.temperature_2m[i]));
          hourlyPrecip.push(raw.hourly.precipitation_probability[i] || 0);
          count++;
        }
      }
    }

    const weatherData = {
      current: {
        temperature: Math.round(current.temperature_2m ?? 0),
        apparentTemperature: Math.round(current.apparent_temperature ?? 0),
        humidity: Math.round(current.relative_humidity_2m ?? 0),
        windSpeed: Math.round(current.wind_speed_10m ?? 0),
        weatherCode,
        condition,
        isDay,
        uvIndex: daily.uv_index_max?.[0] ?? 5,
        visibilityKm: 10,
        sunrise: daily.sunrise?.[0] || '',
        sunset: daily.sunset?.[0] || '',
        precipitation: current.precipitation ?? 0,
        locationName,
        country,
        latitude: Number(lat),
        longitude: Number(lon),
        timezone: raw.timezone || 'UTC',
        hourly: {
          time: hourlyTimes,
          temperature_2m: hourlyTemps,
          precipitation_probability: hourlyPrecip,
        },
      },
      forecast,
      lastUpdated: new Date().toISOString(),
    };

    await setInCache(key, weatherData, TTL_MS);
    return ok(weatherData);
  } catch (err) {
    console.error('Weather error:', errorMessage(err));
    const cached = await getFromCache<unknown>(key);
    if (cached) {
      return ok(cached.data, { cached: true, warning: 'Stale cache served' });
    }
    return fail(errorMessage(err) || 'Failed to fetch weather data');
  }
};

export const config: Config = {
  path: '/api/weather',
};
