import express, { Request, Response } from 'express';
import cors from 'cors';
import { XMLParser } from 'fast-xml-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// In-Memory Stale-While-Revalidate Cache
// ==========================================
interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
}

const cacheStore = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): { data: T; isStale: boolean } | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  const isStale = Date.now() - entry.cachedAt > entry.ttlMs;
  return { data: entry.data, isStale };
}

function setInCache<T>(key: string, data: T, ttlMs: number): void {
  cacheStore.set(key, { data, cachedAt: Date.now(), ttlMs });
}

// Weather WMO Code to description and icon mapping
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

// Helper to format day of week
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ==========================================
// 1. WEATHER ENDPOINT (Open-Meteo)
// ==========================================
app.get('/api/weather', async (req: Request, res: Response) => {
  try {
    const lat = req.query.latitude ? String(req.query.latitude) : '40.7128';
    const lon = req.query.longitude ? String(req.query.longitude) : '-74.0060';
    const locationName = req.query.name ? String(req.query.name) : 'New York';
    const country = req.query.country ? String(req.query.country) : 'United States';

    const cacheKey = `weather_${lat}_${lon}`;
    const cached = getFromCache(cacheKey);
    if (cached && !cached.isStale) {
      return res.json({ success: true, data: cached.data, cached: true, timestamp: new Date().toISOString() });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7`;

    const fetchController = new AbortController();
    const timeout = setTimeout(() => fetchController.abort(), 8000);

    const resp = await fetch(url, { signal: fetchController.signal });
    clearTimeout(timeout);

    if (!resp.ok) {
      if (cached) {
        return res.json({ success: true, data: cached.data, cached: true, warning: 'Using cached weather due to upstream delay' });
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

    setInCache(cacheKey, weatherData, 10 * 60 * 1000); // 10 mins cache
    return res.json({ success: true, data: weatherData, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Weather error:', err.message);
    const cached = getFromCache(`weather_${req.query.latitude}_${req.query.longitude}`);
    if (cached) {
      return res.json({ success: true, data: cached.data, cached: true, warning: 'Stale cache served' });
    }
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch weather data' });
  }
});

// Weather location search
app.get('/api/weather/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : '';
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'WorldPulseDashboard/1.0' },
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      throw new Error(`Geocoding error: ${resp.status}`);
    }
    const data = await resp.json();
    return res.json({ success: true, data: data.results || [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. NETFLIX TOP 10 ENDPOINT (Official Tudum TSV)
// ==========================================
const WIKI_POSTER_CACHE = new Map<string, { posterUrl?: string; overview?: string; releaseYear?: string }>();

async function fetchWikiMovieInfo(title: string): Promise<{ posterUrl?: string; overview?: string; releaseYear?: string }> {
  const cached = WIKI_POSTER_CACHE.get(title);
  if (cached) return cached;

  try {
    // Clean title for Wikipedia search
    const cleanTitle = title.replace(/\s*\([^)]*\)/g, '').trim();
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle)}`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'WorldPulseDashboard/1.0 (worldpulse@example.com)' },
    });

    if (resp.ok) {
      const data = await resp.json();
      const posterUrl = data.thumbnail?.source || data.originalimage?.source;
      const overview = data.extract;
      // Extract year from extract or description if possible
      const yearMatch = data.description?.match(/\b(19\d\d|20\d\d)\b/) || data.extract?.match(/\b(19\d\d|20\d\d)\b/);
      const releaseYear = yearMatch ? yearMatch[1] : undefined;

      const result = { posterUrl, overview, releaseYear };
      WIKI_POSTER_CACHE.set(title, result);
      return result;
    }
  } catch {
    // Ignore Wikipedia lookup failure
  }

  const fallback = { posterUrl: undefined, overview: undefined, releaseYear: undefined };
  WIKI_POSTER_CACHE.set(title, fallback);
  return fallback;
}

app.get('/api/netflix', async (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : 'Films (English)';
    const country = req.query.country ? String(req.query.country) : 'Global';

    const cacheKey = `netflix_${category}_${country}`;
    const cached = getFromCache(cacheKey);
    if (cached && !cached.isStale) {
      return res.json({ success: true, data: cached.data, cached: true, timestamp: new Date().toISOString() });
    }

    const tsvUrl = 'https://www.netflix.com/tudum/top10/data/all-weeks-global.tsv';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const resp = await fetch(tsvUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) {
      if (cached) {
        return res.json({ success: true, data: cached.data, cached: true, warning: 'Serving cached Netflix data' });
      }
      throw new Error(`Netflix Tudum returned ${resp.status}`);
    }

    const tsvText = await resp.text();
    const lines = tsvText.split('\n');

    // Parse header
    // week, category, weekly_rank, show_title, season_title, weekly_hours_viewed, runtime, weekly_views, cumulative_weeks_in_top_10
    const records: any[] = [];
    // Only parse the first 300 lines (contains the latest ~4 weeks)
    const limitLines = Math.min(lines.length, 300);
    for (let i = 1; i < limitLines; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split('\t');
      if (parts.length < 9) continue;
      records.push({
        week: parts[0],
        category: parts[1],
        weekly_rank: parseInt(parts[2], 10),
        show_title: parts[3],
        season_title: parts[4],
        weekly_hours_viewed: parseInt(parts[5], 10) || 0,
        runtime: parseFloat(parts[6]) || 0,
        weekly_views: parseInt(parts[7], 10) || 0,
        cumulative_weeks_in_top_10: parseInt(parts[8], 10) || 1,
      });
    }

    // Determine the most recent week in the dataset
    const weeks = Array.from(new Set(records.map(r => r.week))).sort().reverse();
    const latestWeek = weeks[0];
    const prevWeek = weeks[1];

    // Filter current week and requested category
    const currentWeekItems = records.filter(r => r.week === latestWeek && r.category === category);
    // Sort by rank 1..10
    currentWeekItems.sort((a, b) => a.weekly_rank - b.weekly_rank);
    const top10 = currentWeekItems.slice(0, 10);

    // Prev week map for trend calculation
    const prevWeekMap = new Map<string, number>();
    if (prevWeek) {
      records
        .filter(r => r.week === prevWeek && r.category === category)
        .forEach(r => prevWeekMap.set(r.show_title.toLowerCase(), r.weekly_rank));
    }

    // Enrich with Wikipedia images and rank changes
    const enrichedMovies = await Promise.all(
      top10.map(async item => {
        const prevRank = prevWeekMap.get(item.show_title.toLowerCase());
        let change: 'up' | 'down' | 'same' | 'new' = 'new';
        let rankChange = 0;

        if (prevRank !== undefined) {
          rankChange = prevRank - item.weekly_rank;
          if (rankChange > 0) change = 'up';
          else if (rankChange < 0) change = 'down';
          else change = 'same';
        }

        const wikiInfo = await fetchWikiMovieInfo(item.show_title);

        return {
          rank: item.weekly_rank,
          title: item.show_title,
          seasonTitle: item.season_title !== 'N/A' ? item.season_title : undefined,
          category: item.category,
          cumulativeWeeks: item.cumulative_weeks_in_top_10,
          weeklyHoursViewed: item.weekly_hours_viewed,
          runtimeHours: item.runtime,
          weeklyViews: item.weekly_views,
          change,
          rankChange: Math.abs(rankChange),
          posterUrl: wikiInfo.posterUrl,
          releaseYear: wikiInfo.releaseYear,
          overview: wikiInfo.overview,
          netflixUrl: `https://www.netflix.com/search?q=${encodeURIComponent(item.show_title)}`,
        };
      })
    );

    const result = {
      week: latestWeek,
      category,
      country,
      movies: enrichedMovies,
      lastUpdated: new Date().toISOString(),
    };

    setInCache(cacheKey, result, 60 * 60 * 1000); // 1 hour cache
    return res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Netflix API error:', err.message);
    const cached = getFromCache(`netflix_${req.query.category}_${req.query.country}`);
    if (cached) {
      return res.json({ success: true, data: cached.data, cached: true, warning: 'Stale cache served' });
    }
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch Netflix top 10' });
  }
});

// ==========================================
// 3. GLOBAL NEWS ENDPOINT (Google News RSS & BBC RSS)
// ==========================================
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: false,
  htmlEntities: false,
});

app.get('/api/news', async (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : 'World';
    const cacheKey = `news_${category.toLowerCase()}`;
    const cached = getFromCache(cacheKey);

    if (cached && !cached.isStale) {
      return res.json({ success: true, data: cached.data, cached: true, timestamp: new Date().toISOString() });
    }

    let rssUrl = 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en';
    const catLower = category.toLowerCase();
    if (catLower === 'technology') {
      rssUrl = 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en';
    } else if (catLower === 'science') {
      rssUrl = 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en';
    } else if (catLower === 'business') {
      rssUrl = 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en';
    } else if (catLower === 'sports') {
      rssUrl = 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en';
    } else if (catLower === 'entertainment') {
      rssUrl = 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en';
    } else if (catLower === 'politics') {
      rssUrl = 'https://news.google.com/rss/search?q=politics&hl=en-US&gl=US&ceid=US:en';
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch(rssUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      if (cached) {
        return res.json({ success: true, data: cached.data, cached: true, warning: 'Stale cache served' });
      }
      throw new Error(`Google News RSS returned ${resp.status}`);
    }

    const xmlData = await resp.text();
    const parsed = parser.parse(xmlData);
    const rawItems = parsed?.rss?.channel?.item || [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    const articles: any[] = [];
    const seenTitles = new Set<string>();

    for (const item of items) {
      if (articles.length >= 10) break;

      const rawTitle = item.title || '';
      // Strip source suffix (e.g. " - Reuters", " - BBC News")
      const dashIdx = rawTitle.lastIndexOf(' - ');
      const cleanTitle = dashIdx > 0 ? rawTitle.substring(0, dashIdx).trim() : rawTitle.trim();
      const sourceName = item.source?.['#text'] || (dashIdx > 0 ? rawTitle.substring(dashIdx + 3).trim() : 'Global News');
      const sourceUrl = item.source?.['@_url'];

      // Simple deduplication key
      const normKey = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 35);
      if (seenTitles.has(normKey)) continue;
      seenTitles.add(normKey);

      // Clean HTML from description
      let cleanDesc = '';
      if (typeof item.description === 'string') {
        cleanDesc = item.description.replace(/<[^>]*>?/gm, '').trim();
        // If description equals title or is super short, provide brief teaser
        if (cleanDesc.length < 20 || cleanDesc.includes(cleanTitle)) {
          cleanDesc = `Latest reporting on this developing story from ${sourceName}.`;
        }
      } else {
        cleanDesc = `Read the full report directly from ${sourceName}.`;
      }

      articles.push({
        id: item.guid?.['#text'] || item.guid || String(Math.random()),
        title: cleanTitle,
        description: cleanDesc.slice(0, 220),
        source: sourceName,
        sourceUrl: sourceUrl,
        url: item.link || '#',
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        category,
      });
    }

    const result = {
      category,
      articles,
      lastUpdated: new Date().toISOString(),
    };

    setInCache(cacheKey, result, 5 * 60 * 1000); // 5 mins cache
    return res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('News error:', err.message);
    const cached = getFromCache(`news_${req.query.category?.toString().toLowerCase()}`);
    if (cached) {
      return res.json({ success: true, data: cached.data, cached: true, warning: 'Stale cache served' });
    }
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch news' });
  }
});

// ==========================================
// 4. TODAY AROUND THE WORLD (Wikimedia On This Day)
// ==========================================
app.get('/api/events', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const cacheKey = `events_${mm}_${dd}`;
    const cached = getFromCache(cacheKey);

    if (cached && !cached.isStale) {
      return res.json({ success: true, data: cached.data, cached: true, timestamp: new Date().toISOString() });
    }

    const eventsUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${mm}/${dd}`;
    const holidaysUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/holidays/${mm}/${dd}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const [eventsResp, holidaysResp] = await Promise.allSettled([
      fetch(eventsUrl, { signal: controller.signal, headers: { 'User-Agent': 'WorldPulseDashboard/1.0' } }),
      fetch(holidaysUrl, { signal: controller.signal, headers: { 'User-Agent': 'WorldPulseDashboard/1.0' } }),
    ]);
    clearTimeout(timeout);

    const formattedEvents: any[] = [];

    // Parse historical events
    if (eventsResp.status === 'fulfilled' && eventsResp.value.ok) {
      const json = await eventsResp.value.json();
      const rawEvents = json.selected || [];
      for (const ev of rawEvents.slice(0, 15)) {
        const page = ev.pages?.[0];
        formattedEvents.push({
          id: `hist_${ev.year}_${Math.random().toString(36).substr(2, 6)}`,
          year: ev.year,
          title: page?.titles?.normalized || `Historical Milestone (${ev.year})`,
          description: ev.text,
          category: 'historical',
          wikipediaUrl: page?.content_urls?.desktop?.page,
          thumbnailUrl: page?.thumbnail?.source,
        });
      }
    }

    // Parse international holidays & observances
    if (holidaysResp.status === 'fulfilled' && holidaysResp.value.ok) {
      const json = await holidaysResp.value.json();
      const rawHolidays = json.holidays || [];
      for (const hol of rawHolidays.slice(0, 8)) {
        const page = hol.pages?.[0];
        formattedEvents.push({
          id: `hol_${Math.random().toString(36).substr(2, 6)}`,
          title: hol.text,
          description: page?.extract || `Annual global observance and celebration celebrated on this calendar date.`,
          category: 'observance',
          wikipediaUrl: page?.content_urls?.desktop?.page,
          thumbnailUrl: page?.thumbnail?.source,
        });
      }
    }

    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const result = {
      dateStr,
      events: formattedEvents,
      lastUpdated: new Date().toISOString(),
    };

    setInCache(cacheKey, result, 60 * 60 * 1000); // 1 hour cache
    return res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Events error:', err.message);
    const cached = getFromCache(`events`);
    if (cached) {
      return res.json({ success: true, data: cached.data, cached: true, warning: 'Stale cache served' });
    }
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch daily world events' });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'World Pulse API Proxy',
    time: new Date().toISOString(),
    cacheEntries: cacheStore.size,
  });
});

// Production: serve built static files
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌐 World Pulse Server running on http://localhost:${PORT}`);
});
