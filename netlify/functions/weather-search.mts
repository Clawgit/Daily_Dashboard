import type { Config } from '@netlify/functions';
import { errorMessage, fail, ok } from '../lib/http.mjs';

export default async (req: Request) => {
  try {
    const q = (new URL(req.url).searchParams.get('q') || '').trim();
    if (q.length < 2) {
      return ok([]);
    }

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WorldPulseDashboard/1.0' },
    });
    if (!resp.ok) {
      throw new Error(`Geocoding error: ${resp.status}`);
    }

    const data = await resp.json();
    return ok(data.results || []);
  } catch (err) {
    console.error('Geocoding error:', errorMessage(err));
    return fail(errorMessage(err));
  }
};

export const config: Config = {
  path: '/api/weather/search',
};
