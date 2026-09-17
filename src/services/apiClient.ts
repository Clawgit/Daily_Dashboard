import { ApiEnvelope } from '../types';

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // If caller already provided a signal, link them
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error) errMsg = errorJson.error;
      } catch {
        // use status text
      }
      throw new ApiError(errMsg, response.status);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      const isHtml = text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
      throw new ApiError(
        isHtml
          ? 'API route returned HTML instead of JSON data. Verifying backend connection...'
          : `Unexpected response format (${contentType || 'non-JSON'}).`,
        response.status
      );
    }

    const json: ApiEnvelope<T> = await response.json();

    if (!json.success && json.error) {
      throw new ApiError(json.error);
    }

    if (json.data === undefined) {
      throw new ApiError('Received empty payload from server');
    }

    return json.data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection and retry.');
    }
    throw err instanceof ApiError ? err : new ApiError(err.message || 'Network request failed');
  }
}

