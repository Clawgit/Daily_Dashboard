import { getStore } from '@netlify/blobs';

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
}

export interface CacheHit<T> {
  data: T;
  isStale: boolean;
}

// Blob keys may not contain whitespace or reserved URL characters, so collapse
// anything unusual coming from query parameters down to a safe slug.
export function cacheKey(...parts: (string | number)[]): string {
  return parts
    .map(part => String(part).trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-'))
    .join('_');
}

function store() {
  return getStore('api-cache');
}

/**
 * Stale-while-revalidate read. A stale entry is still returned so callers can
 * fall back to it when an upstream provider is slow or unavailable.
 */
export async function getFromCache<T>(key: string): Promise<CacheHit<T> | null> {
  try {
    const entry = (await store().get(key, { type: 'json' })) as CacheEntry<T> | null;
    if (!entry) return null;
    return { data: entry.data, isStale: Date.now() - entry.cachedAt > entry.ttlMs };
  } catch {
    // A cache miss must never surface as a request failure
    return null;
  }
}

export async function setInCache<T>(key: string, data: T, ttlMs: number): Promise<void> {
  try {
    await store().setJSON(key, { data, cachedAt: Date.now(), ttlMs } satisfies CacheEntry<T>);
  } catch {
    // Cache writes are best effort
  }
}
