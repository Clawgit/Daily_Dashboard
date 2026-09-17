import type { Config } from '@netlify/functions';
import { cacheKey, getFromCache, setInCache } from '../lib/cache.mjs';
import { errorMessage, fail, ok } from '../lib/http.mjs';

const TTL_MS = 60 * 60 * 1000;
const WIKI_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface WikiInfo {
  posterUrl?: string;
  overview?: string;
  releaseYear?: string;
}

interface Top10Record {
  week: string;
  category: string;
  weekly_rank: number;
  show_title: string;
  season_title: string;
  weekly_hours_viewed: number;
  runtime: number;
  weekly_views: number;
  cumulative_weeks_in_top_10: number;
}

/** Looks up poster art and a synopsis on Wikipedia, cached for a week. */
async function fetchWikiMovieInfo(title: string): Promise<WikiInfo> {
  const key = cacheKey('wiki', title);
  const cached = await getFromCache<WikiInfo>(key);
  if (cached && !cached.isStale) return cached.data;

  let info: WikiInfo = {};
  try {
    // Wikipedia titles do not carry the parenthetical qualifiers Netflix uses
    const cleanTitle = title.replace(/\s*\([^)]*\)/g, '').trim();
    const resp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle)}`, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WorldPulseDashboard/1.0 (worldpulse@example.com)' },
    });

    if (resp.ok) {
      const data = await resp.json();
      const yearMatch = data.description?.match(/\b(19\d\d|20\d\d)\b/) || data.extract?.match(/\b(19\d\d|20\d\d)\b/);
      info = {
        posterUrl: data.thumbnail?.source || data.originalimage?.source,
        overview: data.extract,
        releaseYear: yearMatch ? yearMatch[1] : undefined,
      };
    }
  } catch {
    // A failed enrichment lookup must not fail the whole ranking
    if (cached) return cached.data;
  }

  await setInCache(key, info, WIKI_TTL_MS);
  return info;
}

function parseTsv(tsvText: string): Top10Record[] {
  const lines = tsvText.split('\n');
  const records: Top10Record[] = [];
  // The first ~300 lines cover the latest few weeks, which is all this view needs
  const limitLines = Math.min(lines.length, 300);
  for (let i = 1; i < limitLines; i++) {
    const parts = lines[i].trim().split('\t');
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
  return records;
}

export default async (req: Request) => {
  const params = new URL(req.url).searchParams;
  const category = params.get('category') || 'Films (English)';
  const country = params.get('country') || 'Global';
  const key = cacheKey('netflix', category, country);

  try {
    const cached = await getFromCache<unknown>(key);
    if (cached && !cached.isStale) {
      return ok(cached.data, { cached: true });
    }

    const resp = await fetch('https://www.netflix.com/tudum/top10/data/all-weeks-global.tsv', {
      signal: AbortSignal.timeout(9000),
    });

    if (!resp.ok) {
      if (cached) {
        return ok(cached.data, { cached: true, warning: 'Serving cached Netflix data' });
      }
      throw new Error(`Netflix Tudum returned ${resp.status}`);
    }

    const records = parseTsv(await resp.text());

    // Determine the most recent week in the dataset
    const weeks = Array.from(new Set(records.map(r => r.week))).sort().reverse();
    const [latestWeek, prevWeek] = weeks;

    const top10 = records
      .filter(r => r.week === latestWeek && r.category === category)
      .sort((a, b) => a.weekly_rank - b.weekly_rank)
      .slice(0, 10);

    // Previous week ranks, for the trend indicator
    const prevWeekMap = new Map<string, number>();
    if (prevWeek) {
      records
        .filter(r => r.week === prevWeek && r.category === category)
        .forEach(r => prevWeekMap.set(r.show_title.toLowerCase(), r.weekly_rank));
    }

    const movies = await Promise.all(
      top10.map(async item => {
        const prevRank = prevWeekMap.get(item.show_title.toLowerCase());
        let change: 'up' | 'down' | 'same' | 'new' = 'new';
        let rankChange = 0;

        if (prevRank !== undefined) {
          rankChange = prevRank - item.weekly_rank;
          change = rankChange > 0 ? 'up' : rankChange < 0 ? 'down' : 'same';
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

    const result = { week: latestWeek, category, country, movies, lastUpdated: new Date().toISOString() };

    await setInCache(key, result, TTL_MS);
    return ok(result);
  } catch (err) {
    console.error('Netflix API error:', errorMessage(err));
    const cached = await getFromCache<unknown>(key);
    if (cached) {
      return ok(cached.data, { cached: true, warning: 'Stale cache served' });
    }
    return fail(errorMessage(err) || 'Failed to fetch Netflix top 10');
  }
};

export const config: Config = {
  path: '/api/netflix',
};
