import { fetchApi } from './apiClient';
import { WeatherData, GeoLocationResult } from '../types';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function mapWeatherCode(code: number, isDay: boolean): { condition: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', icon: isDay ? 'Sun' : 'Moon' };
    case 1:
      return { condition: 'Mainly Clear', icon: isDay ? 'SunDim' : 'Moon' };
    case 2:
      return { condition: 'Partly Cloudy', icon: isDay ? 'CloudSun' : 'CloudMoon' };
    case 3:
      return { condition: 'Overcast', icon: 'Cloud' };
    case 45:
    case 48:
      return { condition: 'Foggy / Hazy', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', icon: 'CloudDrizzle' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Rain', icon: 'CloudRain' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall', icon: 'CloudSnow' };
    case 77:
      return { condition: 'Snow Grains', icon: 'CloudSnow' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', icon: 'CloudRain' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', icon: 'CloudSnow' };
    case 95:
      return { condition: 'Thunderstorm', icon: 'CloudLightning' };
    case 96:
    case 99:
      return { condition: 'Severe Thunderstorm', icon: 'CloudLightning' };
    default:
      return { condition: 'Partly Cloudy', icon: 'Cloud' };
  }
}

async function fetchDirectWeather(latitude: number, longitude: number, name?: string, country?: string, signal?: AbortSignal): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7`;

  const resp = await fetch(url, { signal });
  if (!resp.ok) {
    throw new Error(`Direct Open-Meteo failed: ${resp.status}`);
  }

  const raw: any = await resp.json();
  const current = raw.current || {};
  const daily = raw.daily || {};
  const isDay = current.is_day === 1;
  const weatherCode = current.weather_code ?? 0;
  const { condition } = mapWeatherCode(weatherCode, isDay);

  const forecast = [];
  const dates = daily.time || [];
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    const code = daily.weather_code?.[i] ?? 0;
    const cond = mapWeatherCode(code, true).condition;
    forecast.push({
      date: dates[i],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
      weatherCode: code,
      condition: cond,
      maxTemp: Math.round(daily.temperature_2m_max?.[i] ?? 0),
      minTemp: Math.round(daily.temperature_2m_min?.[i] ?? 0),
      precipitationProbability: daily.precipitation_probability_max?.[i] ?? 0,
      uvIndex: daily.uv_index_max?.[i] ?? 0,
    });
  }

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

  return {
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
      locationName: name || 'Current Location',
      country: country || '',
      latitude,
      longitude,
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
}

export const weatherService = {
  async getWeather(latitude: number, longitude: number, name?: string, country?: string, signal?: AbortSignal): Promise<WeatherData> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        name: name || 'Current Location',
        country: country || '',
      });
      return await fetchApi<WeatherData>(`/weather?${params.toString()}`, { signal, timeoutMs: 9000 });
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      console.warn('Backend /api/weather unavailable, using direct Open-Meteo fallback:', err.message);
      return await fetchDirectWeather(latitude, longitude, name, country, signal);
    }
  },

  async searchLocation(query: string, signal?: AbortSignal): Promise<GeoLocationResult[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      return await fetchApi<GeoLocationResult[]>(`/weather/search?q=${encodeURIComponent(query)}`, { signal, timeoutMs: 6000 });
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      console.warn('Backend /api/weather/search unavailable, using direct Geocoding fallback:', err.message);
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
      const resp = await fetch(url, { signal });
      if (!resp.ok) return [];
      const data: any = await resp.json();
      return data.results || [];
    }
  },
};
