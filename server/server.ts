import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getWeatherData,
  searchWeatherLocation,
  getNetflixTop10,
  getGlobalNews,
  getWorldEvents,
  getCacheSize,
} from './apiHandlers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. WEATHER ENDPOINTS (Open-Meteo)
// ==========================================
app.get('/api/weather', async (req: Request, res: Response) => {
  try {
    const lat = req.query.latitude ? String(req.query.latitude) : '40.7128';
    const lon = req.query.longitude ? String(req.query.longitude) : '-74.0060';
    const locationName = req.query.name ? String(req.query.name) : 'New York';
    const country = req.query.country ? String(req.query.country) : 'United States';

    const result = await getWeatherData(lat, lon, locationName, country);
    return res.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Weather error:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch weather data' });
  }
});

app.get('/api/weather/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : '';
    const results = await searchWeatherLocation(q);
    return res.json({ success: true, data: results });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. NETFLIX TOP 10 ENDPOINT (Official Tudum TSV)
// ==========================================
app.get('/api/netflix', async (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : 'Films (English)';
    const country = req.query.country ? String(req.query.country) : 'Global';

    const result = await getNetflixTop10(category, country);
    return res.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Netflix API error:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch Netflix top 10' });
  }
});

// ==========================================
// 3. GLOBAL NEWS ENDPOINT (Google News RSS)
// ==========================================
app.get('/api/news', async (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : 'World';
    const result = await getGlobalNews(category);
    return res.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('News error:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch news' });
  }
});

// ==========================================
// 4. TODAY AROUND THE WORLD (Wikimedia On This Day)
// ==========================================
app.get('/api/events', async (_req: Request, res: Response) => {
  try {
    const result = await getWorldEvents();
    return res.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Events error:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch daily world events' });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'World Pulse API Proxy',
    time: new Date().toISOString(),
    cacheEntries: getCacheSize(),
  });
});

// Production: serve built static files
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌐 World Pulse Server running on http://localhost:${PORT}`);
});
