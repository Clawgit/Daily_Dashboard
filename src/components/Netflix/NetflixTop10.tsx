import React, { useState, useRef } from 'react';
import { Card } from '../Common/Card';
import { LastUpdatedBadge } from '../Common/LastUpdatedBadge';
import { LoadingSkeleton } from '../Common/LoadingSkeleton';
import { ErrorState } from '../Common/ErrorState';
import { NetflixDataResponse } from '../../types';
import {
  Film,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Calendar,
  ExternalLink,
  Tv,
  AlertCircle,
} from 'lucide-react';

interface NetflixTop10Props {
  data: NetflixDataResponse | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  category: string;
  onSelectCategory: (cat: string) => void;
}

export const NetflixTop10: React.FC<NetflixTop10Props> = ({
  data,
  loading,
  error,
  isRefreshing,
  onRefresh,
  category,
  onSelectCategory,
}) => {
  const [platform, setPlatform] = useState<'netflix' | 'prime'>('netflix');
  const [subView, setSubView] = useState<'top10' | 'latest'>('top10');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const movies = data?.movies || [];
  const displayMovies = subView === 'latest' 
    ? [...movies].sort((a, b) => (Number(b.releaseYear) || 2026) - (Number(a.releaseYear) || 2026))
    : movies;

  return (
    <Card glow className="p-4 sm:p-5 glow-streaming flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2.5 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-500/20 flex-shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wider font-mono">
                TOP 10 ON NETFLIX & AMAZON PRIME
              </h2>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold">
                🇮🇳 India
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {platform === 'netflix' ? `Official Weekly Viewership • ${data?.week ? `Week of ${data.week}` : 'Current Week'}` : 'Prime Video India Track'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll Buttons */}
          {platform === 'netflix' && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                className="touch-target p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="touch-target p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <LastUpdatedBadge
            timestamp={data?.lastUpdated}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            cached={data?.cached}
          />
        </div>
      </div>

      {/* Platform & Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        {/* Primary Platform Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setPlatform('netflix')}
            className={`touch-target px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              platform === 'netflix'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            NETFLIX INDIA
          </button>
          <button
            onClick={() => setPlatform('prime')}
            className={`touch-target px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              platform === 'prime'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            AMAZON PRIME INDIA
          </button>
        </div>

        {/* View Switch: Top 10 vs Latest Releases */}
        {platform === 'netflix' && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-mono">
              <button
                onClick={() => setSubView('top10')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  subView === 'top10'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Top 10
              </button>
              <button
                onClick={() => setSubView('latest')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  subView === 'latest'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Latest Releases
              </button>
            </div>

            {/* Category toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelectCategory('Films')}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                  category === 'Films'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold'
                    : 'bg-transparent text-slate-500 border-transparent hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                Films
              </button>
              <button
                onClick={() => onSelectCategory('TV')}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                  category === 'TV'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold'
                    : 'bg-transparent text-slate-500 border-transparent hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                Series
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Platform: Amazon Prime Data Unavailable Banner */}
      {platform === 'prime' && (
        <div className="py-12 px-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
              Data unavailable
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              Official Amazon Prime India ranking data is currently unavailable. Amazon does not provide an open public weekly rankings API feed like Netflix Tudum. We avoid displaying fabricated data.
            </p>
          </div>
          <a
            href="https://www.primevideo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold shadow-md shadow-sky-600/25 transition-all mt-2"
          >
            <span>Browse Prime Video India</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Platform: Netflix India Cards */}
      {platform === 'netflix' && (
        <>
          {loading && !data && <LoadingSkeleton variant="netflix" count={5} />}

          {error && !data && (
            <ErrorState
              title="Netflix Feed Offline"
              message={error}
              onRetry={onRefresh}
              isRetrying={isRefreshing}
            />
          )}

          {data && (
            <div
              ref={scrollRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
            >
              {displayMovies.map((movie) => {
                return (
                  <div
                    key={`${movie.rank}-${movie.title}`}
                    className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] border border-slate-200/80 dark:border-white/10 hover:border-rose-500/40 transition-all p-3 flex flex-col justify-between flex-shrink-0 group relative overflow-hidden snap-start shadow-sm hover:shadow-md"
                  >
                    {/* Poster Card */}
                    <div className="w-full h-[180px] sm:h-[200px] rounded-xl overflow-hidden relative bg-slate-200 dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 mb-2.5">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-tr from-slate-900 to-slate-800 text-white">
                          <Tv className="w-8 h-8 text-rose-400 mb-1.5" />
                          <span className="text-xs font-semibold line-clamp-2">
                            {movie.title}
                          </span>
                        </div>
                      )}

                      {/* Rank Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 shadow-md">
                        <span className="text-[10px] font-mono text-rose-400 font-bold">#</span>
                        <span className="text-xs font-black font-mono text-white">{movie.rank}</span>
                      </div>

                      {/* Rank Trend Badge */}
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 text-[9px] font-mono flex items-center gap-1 shadow-md">
                        {movie.change === 'up' && (
                          <span className="text-emerald-400 flex items-center font-bold">
                            <TrendingUp className="w-2.5 h-2.5 mr-0.5" />+{movie.rankChange}
                          </span>
                        )}
                        {movie.change === 'down' && (
                          <span className="text-rose-400 flex items-center font-bold">
                            <TrendingDown className="w-2.5 h-2.5 mr-0.5" />-{movie.rankChange}
                          </span>
                        )}
                        {movie.change === 'same' && (
                          <span className="text-slate-400 flex items-center">
                            <Minus className="w-2.5 h-2.5 mr-0.5" />Same
                          </span>
                        )}
                        {movie.change === 'new' && (
                          <span className="text-amber-300 flex items-center font-bold">
                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />NEW
                          </span>
                        )}
                      </div>

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70"></div>

                      {/* Weeks in Top 10 overlay tag */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between items-center text-[9px] font-mono text-slate-200 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded">
                        <span>{movie.cumulativeWeeks}w in Top 10</span>
                        {movie.releaseYear && (
                          <span className="flex items-center gap-0.5 text-slate-300">
                            <Calendar className="w-2.5 h-2.5" />
                            {movie.releaseYear}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Movie Information */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1 mb-0.5">
                          {movie.title}
                        </h3>
                        {movie.seasonTitle && (
                          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-mono line-clamp-1 mb-1">
                            {movie.seasonTitle}
                          </div>
                        )}
                        {movie.overview && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-snug mb-2">
                            {movie.overview}
                          </p>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-200/80 dark:border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {movie.weeklyViews ? (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-cyan-500" />
                              {formatNumber(movie.weeklyViews)} views
                            </span>
                          ) : (
                            <span className="text-slate-400">Netflix India Official</span>
                          )}
                          {movie.runtimeHours ? (
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {Math.floor(movie.runtimeHours)}h {Math.round((movie.runtimeHours % 1) * 60)}m
                            </span>
                          ) : null}
                        </div>

                        <a
                          href={movie.netflixUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="touch-target w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-white border border-rose-500/20 text-[11px] font-mono font-bold transition-all"
                        >
                          <span>Watch on Netflix</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Card>
  );
};
