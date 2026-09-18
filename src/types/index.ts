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
  type?: 'Movie' | 'Series' | string;
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
  imdbRating?: string;
  publicRating?: string;
  releaseDate?: string;
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

export interface IndianFestivalEvent {
  id: string;
  title: string;
  date: string;
  region: string;
  imageUrl: string;
  description: string;
  culturalSignificance: string;
  category?: 'festival' | 'observance' | 'harvest' | 'national';
}

export interface EventsDataResponse {
  dateStr: string;
  events: IndianFestivalEvent[];
  lastUpdated: string;
  cached?: boolean;
}

// Alias for backward compatibility
export type WorldEvent = IndianFestivalEvent;

export interface WorldClockCity {
  city: string;
  country: string;
  timezone: string;
  flag: string;
  offsetLabel: string;
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
  netflixCategory: string;
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
