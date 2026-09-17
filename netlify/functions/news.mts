import type { Config } from '@netlify/functions';
import { XMLParser } from 'fast-xml-parser';
import { cacheKey, getFromCache, setInCache } from '../lib/cache.mjs';
import { errorMessage, fail, ok } from '../lib/http.mjs';

const TTL_MS = 5 * 60 * 1000;

const GOOGLE_NEWS_TOPICS: Record<string, string> = {
  world: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en',
  technology: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
  science: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en',
  business: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
  sports: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en',
  entertainment: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en',
  politics: 'https://news.google.com/rss/search?q=politics&hl=en-US&gl=US&ceid=US:en',
};

export default async (req: Request) => {
  const category = new URL(req.url).searchParams.get('category') || 'World';
  const key = cacheKey('news', category);

  try {
    const cached = await getFromCache<unknown>(key);
    if (cached && !cached.isStale) {
      return ok(cached.data, { cached: true });
    }

    const rssUrl = GOOGLE_NEWS_TOPICS[category.toLowerCase()] || GOOGLE_NEWS_TOPICS.world;
    const resp = await fetch(rssUrl, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!resp.ok) {
      if (cached) {
        return ok(cached.data, { cached: true, warning: 'Stale cache served' });
      }
      throw new Error(`Google News RSS returned ${resp.status}`);
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      processEntities: false,
      htmlEntities: false,
    });
    const parsed = parser.parse(await resp.text());
    const rawItems = parsed?.rss?.channel?.item || [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    const articles: unknown[] = [];
    const seenTitles = new Set<string>();

    for (const item of items) {
      if (articles.length >= 10) break;

      const rawTitle: string = item.title || '';
      // Strip the source suffix (e.g. " - Reuters", " - BBC News")
      const dashIdx = rawTitle.lastIndexOf(' - ');
      const cleanTitle = dashIdx > 0 ? rawTitle.substring(0, dashIdx).trim() : rawTitle.trim();
      const sourceName = item.source?.['#text'] || (dashIdx > 0 ? rawTitle.substring(dashIdx + 3).trim() : 'Global News');

      // Simple deduplication key
      const normKey = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 35);
      if (seenTitles.has(normKey)) continue;
      seenTitles.add(normKey);

      // Clean HTML from description
      let cleanDesc = '';
      if (typeof item.description === 'string') {
        cleanDesc = item.description.replace(/<[^>]*>?/gm, '').trim();
        // If the description just repeats the title or is very short, use a teaser
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
        sourceUrl: item.source?.['@_url'],
        url: item.link || '#',
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        category,
      });
    }

    const result = { category, articles, lastUpdated: new Date().toISOString() };

    await setInCache(key, result, TTL_MS);
    return ok(result);
  } catch (err) {
    console.error('News error:', errorMessage(err));
    const cached = await getFromCache<unknown>(key);
    if (cached) {
      return ok(cached.data, { cached: true, warning: 'Stale cache served' });
    }
    return fail(errorMessage(err) || 'Failed to fetch news');
  }
};

export const config: Config = {
  path: '/api/news',
};
