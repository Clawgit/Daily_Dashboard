import { fetchApi } from './apiClient';
import { EventsDataResponse } from '../types';
import { FALLBACK_AROUND_INDIA_EVENTS } from './fallbackData';

export const eventsService = {
  async getDailyEvents(signal?: AbortSignal): Promise<EventsDataResponse> {
    try {
      return await fetchApi<EventsDataResponse>('/events', { signal, timeoutMs: 9000 });
    } catch (err: any) {
      if (signal?.aborted || (err.name === 'AbortError' && signal?.aborted)) throw err;
      console.warn('Backend /api/events unavailable, using Around India festival database fallback:', err.message);
      return FALLBACK_AROUND_INDIA_EVENTS;
    }
  },
};
