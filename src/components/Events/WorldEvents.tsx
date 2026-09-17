import React, { useState } from 'react';
import { Card } from '../Common/Card';
import { LastUpdatedBadge } from '../Common/LastUpdatedBadge';
import { LoadingSkeleton } from '../Common/LoadingSkeleton';
import { ErrorState } from '../Common/ErrorState';
import { EventsDataResponse } from '../../types';
import {
  CalendarDays,
  ExternalLink,
  Milestone,
  PartyPopper,
  Sparkles,
} from 'lucide-react';

interface WorldEventsProps {
  data: EventsDataResponse | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const WorldEvents: React.FC<WorldEventsProps> = ({
  data,
  loading,
  error,
  isRefreshing,
  onRefresh,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'historical' | 'observance'>('all');

  const filteredEvents = data?.events.filter((ev) => {
    if (activeFilter === 'all') return true;
    return ev.category === activeFilter;
  }) || [];

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-md shadow-violet-950/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide font-mono">
                TODAY AROUND THE WORLD
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {data?.dateStr || 'Today'}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Curated Anniversaries & International Observances (Wikimedia Archives)
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
            activeFilter === 'all'
              ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-sm shadow-violet-950/40 font-semibold'
              : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
          }`}
        >
          All Today ({data?.events.length || 0})
        </button>
        <button
          onClick={() => setActiveFilter('historical')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
            activeFilter === 'historical'
              ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-sm shadow-violet-950/40 font-semibold'
              : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
          }`}
        >
          <Milestone className="w-3.5 h-3.5" />
          <span>Historical Milestones</span>
        </button>
        <button
          onClick={() => setActiveFilter('observance')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
            activeFilter === 'observance'
              ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-sm shadow-violet-950/40 font-semibold'
              : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
          }`}
        >
          <PartyPopper className="w-3.5 h-3.5" />
          <span>Observances & Holidays</span>
        </button>
      </div>

      {loading && !data && <LoadingSkeleton variant="events" count={4} />}

      {error && !data && (
        <ErrorState
          title="World Events Feed Offline"
          message={error}
          onRetry={onRefresh}
          isRetrying={isRefreshing}
        />
      )}

      {/* Events List */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-violet-500/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {ev.year ? (
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {ev.year}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Today
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      {ev.category === 'historical' ? 'Historical Milestone' : 'Global Observance'}
                    </span>
                  </div>

                  {ev.thumbnailUrl && (
                    <img
                      src={ev.thumbnailUrl}
                      alt={ev.title}
                      loading="lazy"
                      className="w-8 h-8 rounded-lg object-cover border border-white/10"
                    />
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors mb-1.5">
                  {ev.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {ev.description}
                </p>
              </div>

              {ev.wikipediaUrl && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-end">
                  <a
                    href={ev.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-violet-300 transition-colors"
                  >
                    <span>Read History</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

