#developed by madhur
# 🌐 WORLD PULSE — Real-Time World Intelligence Dashboard

A production-quality, responsive **dynamic real-time information dashboard** built with React, Vite, TypeScript, Tailwind CSS, and a lightweight Node.js/Express data proxy.

**WORLD PULSE** is designed like a modern intelligence dashboard (inspired by Linear, Vercel, and modern financial terminals) providing live, verified global information with zero mock data.

---


## ⚡ Live Features

1. **Header & Live World Clock**
   - Live local digital clock updating every second without API overhead.
   - Dynamic pulsing status indicator (`Live data connected`).
   - Global manual refresh button with spinning state indicator.
   - Theme toggle (Dark Intelligence by default, Clean Light mode).
   - Global preferences modal.

2. **Hero Weather & 7-Day Atmospheric Outlook**
   - Current weather conditions: temperature, condition name, feels-like, humidity, wind speed, UV index, visibility, and sunrise/sunset.
   - Interactive 24-hour temperature & rain probability sparkline (powered by Recharts).
   - 7-day forecast cards with high/low temperature ranges and precipitation chances.
   - Location changer with live global autocomplete powered by Open-Meteo Geocoding.
   - Browser geolocation detection with gentle one-time prompt and fallback.
   - Unit toggle between Celsius (°C) and Fahrenheit (°F).

3. **World Financial Centers Clock**
   - Real-time time display for 6 major global hubs: **New Delhi**, **London**, **New York**, **Tokyo**, **Singapore**, and **Dubai**.
   - Astronomical day/night indicators based on local solar hour.
   - Native browser IANA time zone calculations handling Daylight Saving Time (DST) changes automatically.

4. **Official Top 10 on Netflix**
   - Connected directly to official **Netflix Tudum** weekly viewership datasets (`all-weeks-global.tsv`).
   - Category toggles: *Films (English)*, *Films (Non-English)*, *TV (English)*, *TV (Non-English)*.
   - Metric displays: Rank (#1 to #10), weekly views, total viewing hours, runtime, and cumulative weeks in top 10.
   - Weekly rank change indicators: ▲ up, ▼ down, = same, or NEW.
   - Enriched with official movie posters and synopses from the Wikimedia REST API.
   - Smooth horizontal scrolling card deck with navigation arrows.

5. **Top 10 Global News Headlines**
   - Live international news aggregated and parsed from Google News RSS & BBC Wire feeds.
   - Category filters: **World** (default), **Technology**, **Science**, **Business**, **Politics**, **Sports**, **Entertainment**.
   - Intelligent story deduplication.
   - Source badges (Reuters, AP, BBC, Bloomberg, Washington Post, etc.), relative timestamps ("15m ago"), and direct dispatch links.

6. **Today Around the World (Daily Events)**
   - Historical milestones and international observances for today's date powered by the official Wikimedia "On This Day" API.
   - Category filters: All, Historical Milestones, and Observances & Holidays.
   - Includes historical year badges, event summaries, and direct Wikipedia reference links.

7. **Intelligent Caching & Auto-Refresh**
   - Stale-while-revalidate caching on server proxy (Weather: 10m, News: 5m, Netflix: 60m, Events: 60m).
   - Tab visibility awareness: pauses background polling when the browser tab is hidden; automatically revalidates when returning to the tab if data is stale.
   - Relative "Updated X min ago" badges on every section with individual retry buttons.

8. **Settings & Customization**
   - Configurable default weather location.
   - Temperature units (°C / °F).
   - Default news and Netflix categories.
   - Auto-refresh toggle.
   - Reduced motion accessibility toggle.
   - Preferences automatically persist in `localStorage`.

---

## 🏗️ Architecture & Technology Stack

```text
├── server/
│   └── server.ts          # Express API proxy, RSS/TSV parsing, in-memory caching
├── src/
│   ├── components/
│   │   ├── Common/        # Card, LastUpdatedBadge, LoadingSkeleton, ErrorState
│   │   ├── Events/        # WorldEvents component
│   │   ├── Header/        # Header with live ticking clock & controls
│   │   ├── Netflix/       # NetflixTop10 card carousel
│   │   ├── News/          # GlobalNews with topic filters
│   │   ├── Settings/      # SettingsModal with localStorage persistence
│   │   ├── Weather/       # WeatherHero, WeatherForecast, WeatherHourlyChart, LocationModal
│   │   └── WorldClock/    # WorldClock for 6 global hubs
│   ├── hooks/             # useWeather, useNetflix, useNews, useEvents, useLiveClock, etc.
│   ├── services/          # apiClient, weatherService, netflixService, newsService, eventsService
│   ├── types/             # Strict TypeScript definitions
│   ├── App.tsx            # Main layout & dashboard state
│   ├── main.tsx           # React DOM root
│   └── index.css          # Glassmorphism, Tailwind directives, dark/light themes
├── index.html             # Shell with Inter & JetBrains Mono typography
├── vite.config.ts         # Vite bundler with /api proxy to Express server
└── package.json           # Dependencies and orchestration scripts
```

---

## 📡 Live Data Sources (Anti-Mockup Guarantee)

| Section | Data Source | Verification |
| :--- | :--- | :--- |
| **Weather** | [Open-Meteo Forecast & Geocoding API](https://open-meteo.com/) | Real-time global WMO forecast, hourly curves, 7-day daily predictions. No key required. |
| **Netflix Top 10** | [Netflix Tudum Official Data](https://top10.netflix.com/) + Wikimedia API | Official weekly TSV dataset published by Netflix; poster art retrieved via Wikipedia REST API. |
| **Global News** | Google News RSS & BBC News Feeds | Live international wires, parsed server-side via `fast-xml-parser`, deduplicated. |
| **World Events** | [Wikimedia "On This Day" API](https://api.wikimedia.org/) | Curated historical milestones and global observances for current calendar date. |
| **Live Clocks** | Native Browser Intl & IANA Time Zones | Second-accurate hardware clock with proper astronomical DST calculation. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x, 20.x, or later
- npm 9.x, 10.x, or later

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd Daily_Dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Review environment configuration:
   ```bash
   cp .env.example .env
   ```
   *Note: All APIs work immediately with zero configuration.*

---

## 💻 Running the Application

### Development Mode (Frontend + Backend Proxy)
To run both the Vite dev server (`http://localhost:5173`) and the Express proxy (`http://localhost:3001`) simultaneously:
```bash
npm run dev
```

Open your browser at **`http://localhost:5173`**.

### Production Build & Launch
To compile the TypeScript bundle and run the unified production server:
```bash
npm run build
npm start
```

Open your browser at **`http://localhost:3001`**. The Express server serves both the high-performance API endpoints and the static production React application.

---

## ♿ Accessibility & Performance

- **Reduced Motion Support**: Toggleable in Settings and honors the `prefers-reduced-motion` OS media query.
- **Contrast & Hierarchy**: Dark modern theme with strict contrast ratios and luminous neon indicators.
- **Micro-animations**: GPU-accelerated CSS transforms and opacity fades.
- **Request Cancellation**: Uses `AbortController` to cancel pending HTTP queries when parameters change or components unmount.
- **Resource Protection**: Tab visibility listeners pause background polling when the browser tab is hidden to save battery and network bandwidth.

