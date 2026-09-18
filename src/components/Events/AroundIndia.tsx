import React from 'react';
import { Card } from '../Common/Card';
import { LastUpdatedBadge } from '../Common/LastUpdatedBadge';
import { LoadingSkeleton } from '../Common/LoadingSkeleton';
import { ErrorState } from '../Common/ErrorState';
import { EventsDataResponse } from '../../types';
import { Sparkles, MapPin, Calendar, Compass } from 'lucide-react';

interface AroundIndiaProps {
  data: EventsDataResponse | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const AroundIndia: React.FC<AroundIndiaProps> = ({
  data,
  loading,
  error,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <Card glow className="p-4 sm:p-6 glow-india">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wider font-mono flex items-center gap-1.5">
                <span>🇮🇳</span> AROUND INDIA
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                Festivals & Culture
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Major Festivals, Traditions & Cultural Calendar Milestones
            </div>
          </div>
        </div>

        <LastUpdatedBadge
          timestamp={data?.lastUpdated}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          cached={data?.cached}
        />
      </div>

      {loading && !data && <LoadingSkeleton variant="events" count={4} />}

      {error && !data && (
        <ErrorState
          title="Indian Calendar Feed Offline"
          message={error}
          onRetry={onRefresh}
          isRetrying={isRefreshing}
        />
      )}

      {/* Festivals Grid: Desktop 3-4 cols, Tablet 2 cols, Mobile 1 col */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] border border-slate-200/80 dark:border-white/10 hover:border-amber-500/40 transition-all p-3.5 flex flex-col justify-between group shadow-sm hover:shadow-md overflow-hidden"
            >
              <div>
                {/* Event Image */}
                <div className="w-full h-36 rounded-xl overflow-hidden mb-3 relative bg-slate-200 dark:bg-slate-800 border border-slate-200/80 dark:border-white/5">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-amber-400 border border-white/10 flex items-center gap-1 shadow">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{event.region}</span>
                  </div>
                  {event.category && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-emerald-600/90 text-[9px] font-mono text-white font-bold uppercase shadow">
                      {event.category}
                    </div>
                  )}
                </div>

                {/* Festival Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                  {event.title}
                </h3>

                {/* Date / Month */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-700 dark:text-amber-300 font-semibold mb-2">
                  <Calendar className="w-3 h-3 text-amber-500" />
                  <span>{event.date}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  {event.description}
                </p>
              </div>

              {/* Cultural Significance Box */}
              <div className="pt-2.5 border-t border-slate-200/80 dark:border-white/5">
                <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 text-[11px] leading-snug text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 mb-0.5 text-[10px] uppercase font-mono tracking-wider">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Cultural Significance</span>
                  </div>
                  <p className="line-clamp-2">
                    {event.culturalSignificance}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
