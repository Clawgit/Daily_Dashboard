import { fetchApi } from './apiClient';
import { NetflixDataResponse } from '../types';
import { FALLBACK_NETFLIX_DATA } from './fallbackData';

export const netflixService = {
  async getTop10(category: string = 'Films (English)', country: string = 'Global', signal?: AbortSignal): Promise<NetflixDataResponse> {
    try {
      const params = new URLSearchParams({
        category,
        country,
      });
      return await fetchApi<NetflixDataResponse>(`/netflix?${params.toString()}`, { signal, timeoutMs: 12000 });
    } catch (err: any) {
      if (signal?.aborted || (err.name === 'AbortError' && signal?.aborted)) throw err;
      console.warn('Backend /api/netflix unavailable, using cached fallback snapshot:', err.message);
      const fallback = FALLBACK_NETFLIX_DATA.default;
      return {
        ...fallback,
        category,
        country,
      };
    }
  },
};
