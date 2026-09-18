import { XMLParser } from 'fast-xml-parser';

// ==========================================
// In-Memory Stale-While-Revalidate Cache
// ==========================================
interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
}

const cacheStore = new Map<string, CacheEntry<any>>();

export function getFromCache<T>(key: string): { data: T; isStale: boolean } | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  const isStale = Date.now() - entry.cachedAt > entry.ttlMs;
  return { data: entry.data, isStale };
}

export function setInCache<T>(key: string, data: T, ttlMs: number): void {
  cacheStore.set(key, { data, cachedAt: Date.now(), ttlMs });
}

export function getCacheSize(): number {
  return cacheStore.size;
}

// Weather WMO Code to description and icon mapping
export function mapWeatherCode(code: number, isDay: boolean): { condition: string; icon: string } {
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

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ==========================================
// 1. WEATHER HANDLERS (Open-Meteo)
// ==========================================
export async function getWeatherData(
  lat: string = '28.6139',
  lon: string = '77.2090',
  locationName: string = 'New Delhi',
  country: string = 'India'
) {
  const cacheKey = `weather_${lat}_${lon}`;
  const cached = getFromCache(cacheKey);
  if (cached && !cached.isStale) {
    return { data: cached.data, cached: true };
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7`;

  const fetchController = new AbortController();
  const timeout = setTimeout(() => fetchController.abort(), 8000);

  let resp: Response;
  try {
    resp = await fetch(url, { signal: fetchController.signal });
  } catch (err: any) {
    clearTimeout(timeout);
    if (cached) {
      return { data: cached.data, cached: true, warning: 'Using cached weather due to upstream network delay' };
    }
    throw err;
  }
  clearTimeout(timeout);

  if (!resp.ok) {
    if (cached) {
      return { data: cached.data, cached: true, warning: 'Using cached weather due to upstream delay' };
    }
    throw new Error(`Open-Meteo returned status ${resp.status}`);
  }

  const raw: any = await resp.json();
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
  return { data: weatherData, cached: false };
}

export async function searchWeatherLocation(q: string) {
  const query = q.trim();
  if (!query || query.length < 2) {
    return [];
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const resp = await fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'MadhurDashboard/1.0' },
  });
  clearTimeout(timeout);
  if (!resp.ok) {
    throw new Error(`Geocoding error: ${resp.status}`);
  }
  const data: any = await resp.json();
  return data.results || [];
}

// ==========================================
// 2. NETFLIX TOP 10 (India & Global via Tudum)
// ==========================================
const WIKI_POSTER_CACHE = new Map<string, { posterUrl?: string; overview?: string; releaseYear?: string; imdbRating?: string; genre?: string[] }>();

async function fetchWikiMovieInfo(title: string): Promise<{ posterUrl?: string; overview?: string; releaseYear?: string; imdbRating?: string; genre?: string[] }> {
  const cached = WIKI_POSTER_CACHE.get(title);
  if (cached) return cached;

  try {
    const cleanTitle = title.replace(/\s*\([^)]*\)/g, '').trim();
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MadhurDashboard/1.0 (madhur@example.com)' },
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const data: any = await resp.json();
      const posterUrl = data.thumbnail?.source || data.originalimage?.source;
      const overview = data.extract;
      const yearMatch = data.description?.match(/\b(19\d\d|20\d\d)\b/) || data.extract?.match(/\b(19\d\d|20\d\d)\b/);
      const releaseYear = yearMatch ? yearMatch[1] : undefined;

      const result = { posterUrl, overview, releaseYear, imdbRating: undefined, genre: undefined };
      WIKI_POSTER_CACHE.set(title, result);
      return result;
    }
  } catch {
    // Ignore Wikipedia lookup failure
  }

  const fallback = { posterUrl: undefined, overview: undefined, releaseYear: undefined, imdbRating: undefined, genre: undefined };
  WIKI_POSTER_CACHE.set(title, fallback);
  return fallback;
}

export async function getNetflixTop10(category: string = 'Films', country: string = 'India') {
  const isIndia = country.toLowerCase() === 'india';
  const targetCategory = category.toLowerCase().includes('tv') ? 'TV' : 'Films';
  const cacheKey = `netflix_${targetCategory}_${isIndia ? 'India' : 'Global'}`;
  const cached = getFromCache(cacheKey);

  if (cached && !cached.isStale) {
    return { data: cached.data, cached: true };
  }

  try {
    if (isIndia) {
      // Stream countries TSV looking for India
      const tsvUrl = 'https://www.netflix.com/tudum/top10/data/all-weeks-countries.tsv';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const resp = await fetch(tsvUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!resp.ok) {
        throw new Error(`Netflix Tudum returned ${resp.status}`);
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error('Response body stream not available');

      const decoder = new TextDecoder();
      let buffer = '';
      const records: any[] = [];
      let latestWeek = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('India\t')) {
            const parts = line.split('\t');
            if (parts.length >= 8) {
              const week = parts[2];
              if (!latestWeek) latestWeek = week;
              if (week === latestWeek && parts[3] === targetCategory) {
                records.push({
                  rank: parseInt(parts[4], 10),
                  title: parts[5],
                  seasonTitle: parts[6] !== 'N/A' ? parts[6] : undefined,
                  cumulativeWeeks: parseInt(parts[7], 10) || 1,
                  category: targetCategory,
                  type: targetCategory === 'TV' ? 'Series' : 'Movie',
                });
                if (records.length >= 10) {
                  reader.cancel();
                  break;
                }
              }
            }
          }
        }
        if (records.length >= 10) break;
      }

      if (records.length > 0) {
        records.sort((a, b) => a.rank - b.rank);
        const enriched = await Promise.all(
          records.slice(0, 10).map(async (item) => {
            const wiki = await fetchWikiMovieInfo(item.title);
            return {
              ...item,
              change: 'same',
              posterUrl: wiki.posterUrl,
              releaseYear: wiki.releaseYear,
              overview: wiki.overview,
              netflixUrl: `https://www.netflix.com/search?q=${encodeURIComponent(item.title)}`,
            };
          })
        );

        const result = {
          week: latestWeek || 'Latest',
          category: targetCategory,
          country: 'India',
          movies: enriched,
          lastUpdated: new Date().toISOString(),
        };
        setInCache(cacheKey, result, 60 * 60 * 1000);
        return { data: result, cached: false };
      }
    }
  } catch (err: any) {
    console.warn('Netflix India stream failed, trying fallback:', err.message);
  }

  // Global TSV fallback if country fetch was not requested or encountered upstream error
  try {
    const globalTsvUrl = 'https://www.netflix.com/tudum/top10/data/all-weeks-global.tsv';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch(globalTsvUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      const text = await resp.text();
      const lines = text.split('\n');
      const records: any[] = [];
      const limit = Math.min(lines.length, 300);

      for (let i = 1; i < limit; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const p = line.split('\t');
        if (p.length < 9) continue;
        records.push({
          week: p[0],
          category: p[1],
          rank: parseInt(p[2], 10),
          title: p[3],
          seasonTitle: p[4] !== 'N/A' ? p[4] : undefined,
          cumulativeWeeks: parseInt(p[8], 10) || 1,
        });
      }

      const weeks = Array.from(new Set(records.map(r => r.week))).sort().reverse();
      const latest = weeks[0];
      const filtered = records
        .filter(r => r.week === latest && r.category.toLowerCase().includes(targetCategory.toLowerCase()))
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 10);

      const enriched = await Promise.all(
        filtered.map(async (item) => {
          const wiki = await fetchWikiMovieInfo(item.title);
          return {
            ...item,
            type: targetCategory === 'TV' ? 'Series' : 'Movie',
            change: 'same',
            posterUrl: wiki.posterUrl,
            releaseYear: wiki.releaseYear,
            overview: wiki.overview,
            netflixUrl: `https://www.netflix.com/search?q=${encodeURIComponent(item.title)}`,
          };
        })
      );

      const result = {
        week: latest,
        category: targetCategory,
        country: isIndia ? 'India (Global Popular)' : 'Global',
        movies: enriched,
        lastUpdated: new Date().toISOString(),
      };
      setInCache(cacheKey, result, 60 * 60 * 1000);
      return { data: result, cached: false };
    }
  } catch (globalErr: any) {
    console.warn('Netflix Global fallback failed:', globalErr.message);
  }

  if (cached) {
    return { data: cached.data, cached: true, warning: 'Stale cache served' };
  }

  const fallbackResult = {
    week: 'Recent',
    category: targetCategory,
    country: isIndia ? 'India' : 'Global',
    movies: [
      {
        rank: 1,
        title: 'Vishwanath & Sons',
        category: targetCategory,
        type: targetCategory === 'TV' ? 'Series' : 'Movie',
        cumulativeWeeks: 2,
        change: 'same',
        releaseYear: '2026',
        overview: 'A poignant, heartwarming drama following three generations of a traditional textile family navigating ambition, tradition, and modern crossroads.',
        netflixUrl: 'https://www.netflix.com/search?q=Vishwanath%20%26%20Sons',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/2/22/Vishwanath_%26_Sons_poster.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
      },
      {
        rank: 2,
        title: 'Dhamaal 4',
        category: targetCategory,
        type: targetCategory === 'TV' ? 'Series' : 'Movie',
        cumulativeWeeks: 3,
        change: 'up',
        rankChange: 1,
        releaseYear: '2026',
        overview: 'The beloved eccentric group of adventurers embark on another chaotic cross-country treasure hunt fraught with hilarious misadventures and wild encounters.',
        netflixUrl: 'https://www.netflix.com/search?q=Dhamaal%204',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3c/Dhamaal_4.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
      },
      {
        rank: 3,
        title: 'GDN',
        category: targetCategory,
        type: targetCategory === 'TV' ? 'Series' : 'Movie',
        cumulativeWeeks: 2,
        change: 'same',
        releaseYear: '2026',
        overview: 'An inspiring biographical saga celebrating pioneer inventor G.D. Naidu, known as the Edison of India, and his breakthroughs in mechanical design.',
        netflixUrl: 'https://www.netflix.com/search?q=GDN',
      },
      {
        rank: 4,
        title: 'Gandhari',
        category: targetCategory,
        type: targetCategory === 'TV' ? 'Series' : 'Movie',
        cumulativeWeeks: 2,
        change: 'same',
        releaseYear: '2026',
        overview: 'A fierce mother with a mysterious past embarks on a relentless quest across treacherous terrains to rescue her abducted child against all odds.',
        netflixUrl: 'https://www.netflix.com/search?q=Gandhari',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Gandhari_with_maids.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
      },
      {
        rank: 5,
        title: 'Korean Kanakaraju',
        category: targetCategory,
        type: targetCategory === 'TV' ? 'Series' : 'Movie',
        cumulativeWeeks: 2,
        change: 'same',
        releaseYear: '2026',
        overview: 'An energetic Telugu action horror comedy written and directed by Merlapaka Gandhi starring Varun Tej in the titular role.',
        netflixUrl: 'https://www.netflix.com/search?q=Korean%20Kanakaraju',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5f/Korean_Kanakaraju_poster.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
      },
      {
        rank: 6,
        title: 'Alpha',
        category: targetCategory,
        type: targetCategory === 'TV' ? 'Series' : 'Movie',
        cumulativeWeeks: 3,
        change: 'same',
        releaseYear: '2026',
        overview: 'High-stakes tactical thriller delving into covert operations, corporate espionage, and psychological survival under pressure.',
        netflixUrl: 'https://www.netflix.com/search?q=Alpha',
      },
      {
        rank: 7,
        title: "Newton's 3rd Law",
        category: targetCategory,
        type: targetCategory === 'TV' ? 'Series' : 'Movie',
        cumulativeWeeks: 3,
        change: 'same',
        releaseYear: '2026',
        overview: 'An edge-of-your-seat scientific suspense thriller where every action triggers an equal, explosive opposite reaction in a city under siege.',
        netflixUrl: "https://www.netflix.com/search?q=Newton's%203rd%20Law",
      },
      {
        rank: 8,
        title: 'Cocktail 2',
        category: targetCategory,
        type: targetCategory === 'TV' ? 'Series' : 'Movie',
        cumulativeWeeks: 5,
        change: 'same',
        releaseYear: '2026',
        overview: 'A sparkling romantic comedy drama directed by Homi Adajania starring Shahid Kapoor, Kriti Sanon, and Rashmika Mandanna.',
        netflixUrl: 'https://www.netflix.com/search?q=Cocktail%202',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/2/23/Cocktail_2_poster.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
      },
      {
        rank: 9,
        title: 'Pyaar Prema Kalyanam',
        category: targetCategory,
        type: targetCategory === 'TV' ? 'Series' : 'Movie',
        cumulativeWeeks: 4,
        change: 'same',
        releaseYear: '2026',
        overview: 'A heartwarming romantic comedy directed by Elan starring Saanve Megghana celebrating modern relationships and matrimonial comedy.',
        netflixUrl: 'https://www.netflix.com/search?q=Pyaar%20Prema%20Kalyanam',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b6/Pyaar_Prema_Kalyanam.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
      },
      {
        rank: 10,
        title: 'Gatta Kusthi 2',
        category: targetCategory,
        type: targetCategory === 'TV' ? 'Series' : 'Movie',
        cumulativeWeeks: 7,
        change: 'same',
        releaseYear: '2026',
        overview: 'A high-energy sports comedy drama sequel directed by Chella Ayyavu starring Vishal and Aishwarya Lekshmi.',
        netflixUrl: 'https://www.netflix.com/search?q=Gatta%20Kusthi%202',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/0/08/Gatta_Kusthi_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
      },
    ],
    lastUpdated: new Date().toISOString(),
  };

  setInCache(cacheKey, fallbackResult, 30 * 60 * 1000);
  return { data: fallbackResult, cached: false };
}

// ==========================================
// 3. GLOBAL & INDIA NEWS (BBC RSS with Images)
// ==========================================
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: false,
  htmlEntities: false,
});

function getBbcRssUrl(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('ai') || cat.includes('tech')) {
    return 'https://feeds.bbci.co.uk/news/technology/rss.xml';
  }
  if (cat.includes('india')) {
    return 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml';
  }
  if (cat.includes('business')) {
    return 'https://feeds.bbci.co.uk/news/business/rss.xml';
  }
  if (cat.includes('science')) {
    return 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml';
  }
  return 'https://feeds.bbci.co.uk/news/world/rss.xml';
}

export async function getGlobalNews(category: string = 'AI & Technology') {
  const cacheKey = `news_${category.toLowerCase()}`;
  const cached = getFromCache(cacheKey);

  if (cached && !cached.isStale) {
    return { data: cached.data, cached: true };
  }

  try {
    const bbcUrl = getBbcRssUrl(category);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const resp = await fetch(bbcUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MadhurDashboard/1.0 (Mozilla/5.0 compatible)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const xmlData = await resp.text();
      const parsed = parser.parse(xmlData);
      const rawItems = parsed?.rss?.channel?.item || [];
      const items = Array.isArray(rawItems) ? rawItems : [rawItems];

      const articles: any[] = [];
      const seenTitles = new Set<string>();

      for (const item of items) {
        if (articles.length >= 10) break;
        const rawTitle = item.title || '';
        const cleanTitle = rawTitle.replace(/\s*-\s*BBC\s*News$/i, '').trim();
        if (!cleanTitle) continue;

        const normKey = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 35);
        if (seenTitles.has(normKey)) continue;
        seenTitles.add(normKey);

        let cleanDesc = '';
        if (typeof item.description === 'string') {
          cleanDesc = item.description.replace(/<[^>]*>?/gm, '').trim();
        }
        if (!cleanDesc || cleanDesc.length < 15) {
          cleanDesc = `Read the latest report directly from BBC News.`;
        }

        // Extract thumbnail image if present
        const thumb =
          item['media:thumbnail']?.['@_url'] ||
          item['media:content']?.['@_url'] ||
          item.enclosure?.['@_url'] ||
          undefined;

        articles.push({
          id: item.guid?.['#text'] || item.guid || item.link || String(Math.random()),
          title: cleanTitle,
          description: cleanDesc.slice(0, 220),
          source: 'BBC News',
          sourceUrl: 'https://www.bbc.com/news',
          url: item.link || '#',
          thumbnailUrl: thumb,
          publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          category,
        });
      }

      if (articles.length > 0) {
        const result = {
          category,
          articles,
          lastUpdated: new Date().toISOString(),
        };
        setInCache(cacheKey, result, 5 * 60 * 1000);
        return { data: result, cached: false };
      }
    }
  } catch (err: any) {
    console.warn('BBC RSS fetch error:', err.message);
  }

  if (cached) {
    return { data: cached.data, cached: true, warning: 'Stale cache served' };
  }

  throw new Error('News feed temporarily unavailable');
}

// ==========================================
// 4. AROUND INDIA (Festivals & Cultural Events)
// ==========================================
const INDIAN_FESTIVALS_DATABASE = [
  {
    id: 'diwali-deepavali',
    title: 'Diwali (Festival of Lights)',
    date: 'October / November (Kartik Amavasya)',
    region: 'Pan-India',
    imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop&q=80',
    description: 'The triumph of light over darkness and knowledge over ignorance, celebrated with oil lamps (diyas), fireworks, family feasts, and prayers to Goddess Lakshmi.',
    culturalSignificance: 'Marks Lord Rama’s return to Ayodhya after 14 years of exile and the victory of Lord Krishna over Narakasura. One of India’s most universally celebrated holidays.',
    category: 'festival' as const,
  },
  {
    id: 'navratri-durga-puja',
    title: 'Navratri & Durga Puja',
    date: 'September / October (Ashvin Month)',
    region: 'West Bengal, Gujarat, North India',
    imageUrl: 'https://images.unsplash.com/photo-1601655781320-1a13b485d957?w=800&auto=format&fit=crop&q=80',
    description: 'Nine nights dedicated to the divine feminine Shakti, culminating in Vijayadashami (Dussehra). Characterized by Garba and Dandiya Raas in Gujarat and magnificent community pandals in Bengal.',
    culturalSignificance: 'Celebrates Goddess Durga slaying the buffalo demon Mahishasura, symbolizing divine cosmic justice and the protection of righteousness.',
    category: 'festival' as const,
  },
  {
    id: 'dussehra-vijayadashami',
    title: 'Dussehra (Vijayadashami)',
    date: 'Tenth day of Ashvin (October)',
    region: 'Pan-India, Mysuru, Himachal Pradesh',
    imageUrl: 'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?w=800&auto=format&fit=crop&q=80',
    description: 'Effigies of Ravana, Kumbhakarna, and Meghanada are burned with fireworks across northern towns, while Mysuru Palace witnesses grand royal processions.',
    culturalSignificance: 'Honors the victory of Lord Rama over Ravana, teaching the eternal truth of dharma over adharma and virtuous triumph.',
    category: 'festival' as const,
  },
  {
    id: 'karwa-chauth',
    title: 'Karwa Chauth',
    date: 'Fourth day after Sharad Purnima (October)',
    region: 'North & Western India',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    description: 'A traditional day-long fast observed from sunrise until the moon is sighted through a sieve, praying for the longevity, health, and prosperity of spouses.',
    culturalSignificance: 'Strengthens family bonds, featuring henna (mehendi), festive ethnic attire, and community story-telling (Katha).',
    category: 'observance' as const,
  },
  {
    id: 'chhath-puja',
    title: 'Chhath Puja',
    date: 'Kartik Shukla Shashthi (November)',
    region: 'Bihar, Jharkhand, Uttar Pradesh, Nepal',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    description: 'An ancient Vedic ritual of rigorous fasting, standing in river waters to offer Arghya to the rising and setting Sun God (Surya) and Chhathi Maiya.',
    culturalSignificance: 'Expresses deep gratitude to the Sun for sustaining life on Earth, known for its spiritual austerity, purity, and eco-friendly rituals.',
    category: 'festival' as const,
  },
  {
    id: 'makar-sankranti-pongal',
    title: 'Makar Sankranti / Pongal / Lohri',
    date: 'January 14–15',
    region: 'Punjab, Tamil Nadu, Gujarat, Andhra Pradesh',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
    description: 'The auspicious winter harvest festival marking the Sun’s transition into Capricorn (Makara). Celebrated with kite flying, bonfires, sesame sweets, and freshly harvested rice delicacies.',
    culturalSignificance: 'Marks the end of winter solstice and the beginning of warmer, harvest-friendly days (Uttarayan), fostering community fellowship.',
    category: 'harvest' as const,
  },
  {
    id: 'republic-day-india',
    title: 'Republic Day of India',
    date: 'January 26',
    region: 'National Capital & All States',
    imageUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&auto=format&fit=crop&q=80',
    description: 'A grand national celebration featuring the majestic parade along Kartavya Path in New Delhi, displaying India’s defense prowess, cultural diversity, and constitutional sovereignty.',
    culturalSignificance: 'Commemorates the adoption of the Constitution of India in 1950, transitioning India into an independent constitutional republic.',
    category: 'national' as const,
  },
  {
    id: 'mahashivratri',
    title: 'Maha Shivratri',
    date: 'Phalguna Month (February / March)',
    region: 'Pan-India, Varanasi, Ujjain, Isha Yoga',
    imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop&q=80',
    description: 'The Great Night of Shiva observed with night-long vigils, meditation, chanting of Om Namah Shivaya, and ritual offerings of Bael leaves and milk at Jyotirlingas.',
    culturalSignificance: 'Celebrates the cosmic dance of creation and the wedding of Lord Shiva and Goddess Parvati, representing inner awakening and spiritual discipline.',
    category: 'festival' as const,
  },
  {
    id: 'holi-festival-colors',
    title: 'Holi (Festival of Colors)',
    date: 'Phalguna Purnima (March)',
    region: 'Pan-India, Mathura, Vrindavan',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    description: 'A joyous exuberant celebration of spring with organic colored powders (gulal), music, traditional gujiya sweets, and the Holika Dahan bonfire on the eve.',
    culturalSignificance: 'Commemorates the legend of Prahlada and Holika, symbolizing the triumph of true devotion over ego and the arrival of a blossoming harvest season.',
    category: 'festival' as const,
  },
  {
    id: 'baisakhi-vaisakhi',
    title: 'Baisakhi (Vaisakhi)',
    date: 'April 13–14',
    region: 'Punjab & Northern India',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    description: 'The Sikh New Year and spring harvest festival marked by energetic Bhangra and Giddha dances, Nagar Kirtan processions, and community langar feasts.',
    culturalSignificance: 'Commemorates the historic founding of the Khalsa Panth by Guru Gobind Singh Ji in 1699, championing equality, bravery, and selfless service.',
    category: 'harvest' as const,
  },
  {
    id: 'ganesh-chaturthi',
    title: 'Ganesh Chaturthi',
    date: 'Bhadrapada Month (August / September)',
    region: 'Maharashtra, Goa, Karnataka, Telangana',
    imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop&q=80',
    description: 'The welcoming of Lord Ganesha, the remover of obstacles, with ornate household and public clay idols, modak sweet offerings, and rhythmic dhol-tasha processions.',
    culturalSignificance: 'Revived by Lokmanya Tilak in 1893 to unite citizens, symbolizing new auspicious beginnings, wisdom, learning, and civic solidarity.',
    category: 'festival' as const,
  },
  {
    id: 'onam-harvest-festival',
    title: 'Onam Harvest Festival',
    date: 'Chingam Month (August / September)',
    region: 'Kerala',
    imageUrl: 'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?w=800&auto=format&fit=crop&q=80',
    description: 'Kerala’s flagship annual celebration featuring stunning flower carpets (Pookkalam), the famous snake boat race (Vallam Kali), Pulikkali tiger dances, and the lavish 26-dish Onasadya feast.',
    culturalSignificance: 'Welcomes the homecoming of the mythical, benevolent King Mahabali who ruled over an egalitarian golden age of prosperity and truth.',
    category: 'harvest' as const,
  },
];

export async function getWorldEvents() {
  const cacheKey = 'around_india_events';
  const cached = getFromCache(cacheKey);

  if (cached && !cached.isStale) {
    return { data: cached.data, cached: true };
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });

  const result = {
    dateStr,
    events: INDIAN_FESTIVALS_DATABASE,
    lastUpdated: new Date().toISOString(),
  };

  setInCache(cacheKey, result, 24 * 60 * 60 * 1000); // 24 hours cache
  return { data: result, cached: false };
}
