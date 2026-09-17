import { fetchApi } from './apiClient';
import { EventsDataResponse } from '../types';

export const eventsService = {
  async getDailyEvents(signal?: AbortSignal): Promise<EventsDataResponse> {
    return fetchApi<EventsDataResponse>('/events', { signal, timeoutMs: 9000 });
  },
};

