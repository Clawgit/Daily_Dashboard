export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type ThemeMode = 'dark' | 'light';

export interface WeatherCondition {
  code: number;
  label: string;
  icon: string;
  isDay: boolean;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  isDay: boolean;
  uvIndex: number;
  visibilityKm: number;
  sunrise: string;
  sunset: string;
  precipitation: number;
  locationName: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
  };
}

export interface DailyForecastDay {
  date: string;
  dayName: string;
  weatherCode: number;
  condition: string;
  maxTemp: number;
  minTemp: number;
  precipitationProbability: number;
  uvIndex: number;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecastDay[];
  lastUpdated: string;
  cached?: boolean;
}

export interface GeoLocationResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
}

export interface NetflixMovie {
  rank: number;
  title: string;
  seasonTitle?: string;
  category: string;
  cumulativeWeeks: number;
  weeklyHoursViewed?: number;
  runtimeHours?: number;
  weeklyViews?: number;
  change: 'up' | 'down' | 'same' | 'new';
  rankChange?: number;
  posterUrl?: string;
  releaseYear?: string;
  overview?: string;
  genre?: string[];
  netflixUrl?: string;
}

export interface NetflixDataResponse {
  week: string;
  category: string;
  country: string;
  movies: NetflixMovie[];
  lastUpdated: string;
  cached?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  url: string;
  publishedAt: string;
  thumbnailUrl?: string;
  category: string;
}

export interface NewsDataResponse {
  category: string;
  articles: NewsArticle[];
  lastUpdated: string;
  cached?: boolean;
}

export interface WorldEvent {
  id: string;
  year?: number;
  title: string;
  description: string;
  category: 'historical' | 'observance' | 'holiday' | 'global';
  wikipediaUrl?: string;
  thumbnailUrl?: string;
  location?: string;
}

export interface EventsDataResponse {
  dateStr: string;
  events: WorldEvent[];
  lastUpdated: string;
  cached?: boolean;
}

export interface WorldClockCity {
  city: string;
  country: string;
  timezone: string;
  flag: string;
}

export interface UserSettings {
  weatherLocation: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  temperatureUnit: TemperatureUnit;
  newsCategory: string;
  netflixCategory: 'Films (English)' | 'Films (Non-English)' | 'TV (English)' | 'TV (Non-English)';
  netflixCountry: string;
  autoRefresh: boolean;
  refreshIntervalMinutes: {
    weather: number;
    news: number;
    netflix: number;
    events: number;
  };
  reducedMotion: boolean;
  theme: ThemeMode;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  cached?: boolean;
}

