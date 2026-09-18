import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { weatherService } from '../../services/weatherService';
import { GeoLocationResult } from '../../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: { name: string; country: string; latitude: number; longitude: number }) => void;
}

const POPULAR_CITIES = [
  { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await weatherService.searchLocation(query.trim());
        setResults(data);
      } catch (err) {
        console.error('Location search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Select Weather Location</h3>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search worldwide city (e.g. New Delhi, Tokyo, London)..."
              autoFocus
              className="touch-target w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin" />
            )}
          </div>
        </div>

        {/* Results / Popular Cities */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {results.length > 0 ? (
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-bold">
                Search Results
              </div>
              <div className="space-y-1.5">
                {results.map((loc) => (
                  <button
                    key={`${loc.id}-${loc.latitude}`}
                    onClick={() => {
                      onSelectLocation({
                        name: loc.name,
                        country: loc.country || '',
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                      });
                      onClose();
                    }}
                    className="touch-target w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-between group border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {loc.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : query.length >= 2 && !isSearching ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              No matching locations found for "{query}".
            </div>
          ) : (
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-bold">
                Quick Select Cities
              </div>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      onSelectLocation(city);
                      onClose();
                    }}
                    className="touch-target text-left p-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-center"
                  >
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {city.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {city.country}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
