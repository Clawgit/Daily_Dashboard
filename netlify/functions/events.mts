import type { Config } from '@netlify/functions';
import { cacheKey, getFromCache, setInCache } from '../lib/cache.mjs';
import { errorMessage, fail, ok } from '../lib/http.mjs';

const TTL_MS = 60 * 60 * 1000;

interface WorldEvent {
  id: string;
  year?: number;
  title: string;
  description: string;
  category: 'historical' | 'observance';
  wikipediaUrl?: string;
  thumbnailUrl?: string;
}

export default async () => {
  const now = new Date();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const key = cacheKey('events', mm, dd);

  try {
    const cached = await getFromCache<unknown>(key);
    if (cached && !cached.isStale) {
      return ok(cached.data, { cached: true });
    }

    const headers = { 'User-Agent': 'WorldPulseDashboard/1.0' };
    const signal = AbortSignal.timeout(8000);
    const [eventsResp, holidaysResp] = await Promise.allSettled([
      fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${mm}/${dd}`, { signal, headers }),
      fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/holidays/${mm}/${dd}`, { signal, headers }),
    ]);

    const formattedEvents: WorldEvent[] = [];

    // Historical events
    if (eventsResp.status === 'fulfilled' && eventsResp.value.ok) {
      const json = await eventsResp.value.json();
      for (const ev of (json.selected || []).slice(0, 15)) {
        const page = ev.pages?.[0];
        formattedEvents.push({
          id: `hist_${ev.year}_${Math.random().toString(36).slice(2, 8)}`,
          year: ev.year,
          title: page?.titles?.normalized || `Historical Milestone (${ev.year})`,
          description: ev.text,
          category: 'historical',
          wikipediaUrl: page?.content_urls?.desktop?.page,
          thumbnailUrl: page?.thumbnail?.source,
        });
      }
    }

    // International holidays & observances
    if (holidaysResp.status === 'fulfilled' && holidaysResp.value.ok) {
      const json = await holidaysResp.value.json();
      for (const hol of (json.holidays || []).slice(0, 8)) {
        const page = hol.pages?.[0];
        formattedEvents.push({
          id: `hol_${Math.random().toString(36).slice(2, 8)}`,
          title: hol.text,
          description: page?.extract || 'Annual global observance and celebration celebrated on this calendar date.',
          category: 'observance',
          wikipediaUrl: page?.content_urls?.desktop?.page,
          thumbnailUrl: page?.thumbnail?.source,
        });
      }
    }

    if (formattedEvents.length === 0) {
      throw new Error('Wikimedia On This Day returned no entries');
    }

    const result = {
      dateStr: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      events: formattedEvents,
      lastUpdated: new Date().toISOString(),
    };

    await setInCache(key, result, TTL_MS);
    return ok(result);
  } catch (err) {
    console.error('Events error:', errorMessage(err));
    const cached = await getFromCache<unknown>(key);
    if (cached) {
      return ok(cached.data, { cached: true, warning: 'Stale cache served' });
    }
    return fail(errorMessage(err) || 'Failed to fetch daily world events');
  }
};

export const config: Config = {
  path: '/api/events',
};
