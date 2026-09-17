import { fetchApi } from './apiClient';
import { NewsDataResponse } from '../types';
import { FALLBACK_NEWS_DATA } from './fallbackData';

export const newsService = {
  async getHeadlines(category: string = 'World', signal?: AbortSignal): Promise<NewsDataResponse> {
    try {
      const params = new URLSearchParams({ category });
      return await fetchApi<NewsDataResponse>(`/news?${params.toString()}`, { signal, timeoutMs: 9000 });
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      console.warn('Backend /api/news unavailable, using cached fallback snapshot:', err.message);
      const fallback = FALLBACK_NEWS_DATA.default;
      return {
        ...fallback,
        category,
      };
    }
  },
};
