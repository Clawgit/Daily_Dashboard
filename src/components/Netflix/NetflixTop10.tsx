import React, { useRef } from 'react';
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
} from 'lucide-react';

interface NetflixTop10Props {
  data: NetflixDataResponse | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  category: string;
  onSelectCategory: (cat: 'Films (English)' | 'Films (Non-English)' | 'TV (English)' | 'TV (Non-English)') => void;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-md shadow-red-950/20">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide font-mono">
                TOP 10 ON NETFLIX
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-red-500/10 text-red-400 border border-red-500/20">
                Official Tudum Data
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {data?.week ? `Official Week Ending ${data.week}` : 'Weekly Global Viewership Leaderboard'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Scroll Controls */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <LastUpdatedBadge
            timestamp={data?.lastUpdated}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            cached={data?.cached}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['Films (English)', 'Films (Non-English)', 'TV (English)', 'TV (Non-English)'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              category === cat
                ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-950/40 font-semibold'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && !data && <LoadingSkeleton variant="netflix" count={5} />}

      {error && !data && (
        <ErrorState
          title="Netflix Feed Offline"
          message={error}
          onRetry={onRefresh}
          isRetrying={isRefreshing}
        />
      )}

      {/* Horizontal Carousel */}
      {data && (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        >
          {data.movies.map((movie) => {
            return (
              <div
                key={`${movie.rank}-${movie.title}`}
                className="min-w-[240px] w-[240px] sm:min-w-[260px] sm:w-[260px] rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-red-500/30 transition-all p-3.5 flex flex-col justify-between flex-shrink-0 group relative overflow-hidden snap-start shadow-lg"
              >
                {/* Poster or Backdrop */}
                <div className="w-full h-[220px] rounded-xl overflow-hidden relative bg-gradient-to-b from-slate-800 to-slate-900 border border-white/5 mb-3">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      <Film className="w-10 h-10 text-slate-600 mb-2" />
                      <span className="text-xs text-slate-400 line-clamp-2 font-medium">
                        {movie.title}
                      </span>
                    </div>
                  )}

                  {/* Top Rank Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 shadow-lg">
                    <span className="text-xs font-mono text-red-400 font-bold">#</span>
                    <span className="text-sm font-black font-mono text-white">{movie.rank}</span>
                  </div>

                  {/* Rank Trend Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono flex items-center gap-1 shadow-lg">
                    {movie.change === 'up' && (
                      <span className="text-emerald-400 flex items-center font-bold">
                        <TrendingUp className="w-3 h-3 mr-0.5" />+{movie.rankChange}
                      </span>
                    )}
                    {movie.change === 'down' && (
                      <span className="text-rose-400 flex items-center font-bold">
                        <TrendingDown className="w-3 h-3 mr-0.5" />-{movie.rankChange}
                      </span>
                    )}
                    {movie.change === 'same' && (
                      <span className="text-slate-400 flex items-center">
                        <Minus className="w-3 h-3 mr-0.5" />Same
                      </span>
                    )}
                    {movie.change === 'new' && (
                      <span className="text-amber-300 flex items-center font-bold">
                        <Sparkles className="w-3 h-3 mr-0.5" />NEW
                      </span>
                    )}
                  </div>

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                  {/* Weeks in Top 10 overlay tag */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-md px-2 py-1 rounded">
                    <span>
                      {movie.cumulativeWeeks} {movie.cumulativeWeeks === 1 ? 'Week' : 'Weeks'} in Top 10
                    </span>
                    {movie.releaseYear && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-2.5 h-2.5" />
                        {movie.releaseYear}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1 mb-1">
                      {movie.title}
                    </h3>
                    {movie.seasonTitle && (
                      <div className="text-xs text-red-300/80 line-clamp-1 mb-1 font-mono">
                        {movie.seasonTitle}
                      </div>
                    )}
                    {movie.overview && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {movie.overview}
                      </p>
                    )}
                  </div>

                  {/* Stats & Netflix Link */}
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                      {movie.weeklyViews ? (
                        <div className="flex items-center gap-1" title="Weekly Views">
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>{formatNumber(movie.weeklyViews)} views</span>
                        </div>
                      ) : null}

                      {movie.runtimeHours ? (
                        <div className="flex items-center gap-1 text-right justify-end" title="Runtime">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{Math.floor(movie.runtimeHours)}h {Math.round((movie.runtimeHours % 1) * 60)}m</span>
                        </div>
                      ) : null}
                    </div>

                    <a
                      href={movie.netflixUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/25 text-red-300 hover:text-white border border-red-500/20 text-xs font-mono transition-all"
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
    </Card>
  );
};

