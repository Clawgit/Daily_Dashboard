import {
  getWeatherData,
  searchWeatherLocation,
  getNetflixTop10,
  getGlobalNews,
  getWorldEvents,
  getCacheSize,
} from './apiHandlers';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(body: any, status: number = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Only process /api routes directly in Worker
    if (url.pathname.startsWith('/api/')) {
      try {
        if (url.pathname === '/api/health') {
          return jsonResponse({
            status: 'ok',
            name: 'World Pulse API Worker',
            time: new Date().toISOString(),
            cacheEntries: getCacheSize(),
          });
        }

        if (url.pathname === '/api/weather') {
          const lat = url.searchParams.get('latitude') || '40.7128';
          const lon = url.searchParams.get('longitude') || '-74.0060';
          const name = url.searchParams.get('name') || 'New York';
          const country = url.searchParams.get('country') || 'United States';
          const result = await getWeatherData(lat, lon, name, country);
          return jsonResponse({ success: true, ...result, timestamp: new Date().toISOString() });
        }

        if (url.pathname === '/api/weather/search') {
          const q = url.searchParams.get('q') || '';
          const data = await searchWeatherLocation(q);
          return jsonResponse({ success: true, data });
        }

        if (url.pathname === '/api/netflix') {
          const category = url.searchParams.get('category') || 'Films (English)';
          const country = url.searchParams.get('country') || 'Global';
          const result = await getNetflixTop10(category, country);
          return jsonResponse({ success: true, ...result, timestamp: new Date().toISOString() });
        }

        if (url.pathname === '/api/news') {
          const category = url.searchParams.get('category') || 'World';
          const result = await getGlobalNews(category);
          return jsonResponse({ success: true, ...result, timestamp: new Date().toISOString() });
        }

        if (url.pathname === '/api/events') {
          const result = await getWorldEvents();
          return jsonResponse({ success: true, ...result, timestamp: new Date().toISOString() });
        }

        return jsonResponse({ success: false, error: `Endpoint not found: ${url.pathname}` }, 404);
      } catch (err: any) {
        console.error('Worker API error:', err);
        return jsonResponse(
          {
            success: false,
            error: err.message || 'Internal Server Error',
          },
          500
        );
      }
    }

    // Fallback to static assets if request is not an /api route
    if (env?.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};
