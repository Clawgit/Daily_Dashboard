import { fetchApi } from './apiClient';
import { EventsDataResponse, WorldEvent } from '../types';

async function fetchDirectEvents(signal?: AbortSignal): Promise<EventsDataResponse> {
  const now = new Date();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');

  const eventsUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${mm}/${dd}`;
  const holidaysUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/holidays/${mm}/${dd}`;

  const [eventsResp, holidaysResp] = await Promise.allSettled([
    fetch(eventsUrl, { signal }),
    fetch(holidaysUrl, { signal }),
  ]);

  const formattedEvents: WorldEvent[] = [];

  if (eventsResp.status === 'fulfilled' && eventsResp.value.ok) {
    const json: any = await eventsResp.value.json();
    const rawEvents = json.selected || [];
    for (const ev of rawEvents.slice(0, 15)) {
      const page = ev.pages?.[0];
      formattedEvents.push({
        id: `hist_${ev.year}_${Math.random().toString(36).substring(2, 8)}`,
        year: ev.year,
        title: page?.titles?.normalized || `Historical Milestone (${ev.year})`,
        description: ev.text,
        category: 'historical',
        wikipediaUrl: page?.content_urls?.desktop?.page,
        thumbnailUrl: page?.thumbnail?.source,
      });
    }
  }

  if (holidaysResp.status === 'fulfilled' && holidaysResp.value.ok) {
    const json: any = await holidaysResp.value.json();
    const rawHolidays = json.holidays || [];
    for (const hol of rawHolidays.slice(0, 8)) {
      const page = hol.pages?.[0];
      formattedEvents.push({
        id: `hol_${Math.random().toString(36).substring(2, 8)}`,
        title: hol.text,
        description: page?.extract || 'Annual global observance and celebration celebrated on this calendar date.',
        category: 'observance',
        wikipediaUrl: page?.content_urls?.desktop?.page,
        thumbnailUrl: page?.thumbnail?.source,
      });
    }
  }

  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return {
    dateStr,
    events: formattedEvents,
    lastUpdated: new Date().toISOString(),
  };
}

export const eventsService = {
  async getDailyEvents(signal?: AbortSignal): Promise<EventsDataResponse> {
    try {
      return await fetchApi<EventsDataResponse>('/events', { signal, timeoutMs: 9000 });
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      console.warn('Backend /api/events unavailable, using direct Wikimedia fallback:', err.message);
      return await fetchDirectEvents(signal);
    }
  },
};
