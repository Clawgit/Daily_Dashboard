import { fetchApi } from './apiClient';
import { NetflixDataResponse } from '../types';

export const netflixService = {
  async getTop10(category: string = 'Films (English)', country: string = 'Global', signal?: AbortSignal): Promise<NetflixDataResponse> {
    const params = new URLSearchParams({
      category,
      country,
    });
    return fetchApi<NetflixDataResponse>(`/netflix?${params.toString()}`, { signal, timeoutMs: 12000 });
  },
};

