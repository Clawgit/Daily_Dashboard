import { fetchApi } from './apiClient';
import { NewsDataResponse } from '../types';

export const newsService = {
  async getHeadlines(category: string = 'World', signal?: AbortSignal): Promise<NewsDataResponse> {
    const params = new URLSearchParams({ category });
    return fetchApi<NewsDataResponse>(`/news?${params.toString()}`, { signal, timeoutMs: 9000 });
  },
};

