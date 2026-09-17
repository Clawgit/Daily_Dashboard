import React from 'react';
import { Card } from '../Common/Card';
import { LastUpdatedBadge } from '../Common/LastUpdatedBadge';
import { LoadingSkeleton } from '../Common/LoadingSkeleton';
import { ErrorState } from '../Common/ErrorState';
import { NewsDataResponse } from '../../types';
import {
  Newspaper,
  ExternalLink,
  Clock,
  Globe,
  Cpu,
  FlaskConical,
  Briefcase,
  Landmark,
  Trophy,
  Tv,
} from 'lucide-react';

interface GlobalNewsProps {
  data: NewsDataResponse | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  category: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { id: 'World', label: 'World', icon: Globe },
  { id: 'Technology', label: 'Tech', icon: Cpu },
  { id: 'Business', label: 'Business', icon: Briefcase },
  { id: 'Science', label: 'Science', icon: FlaskConical },
  { id: 'Politics', label: 'Politics', icon: Landmark },
  { id: 'Sports', label: 'Sports', icon: Trophy },
  { id: 'Entertainment', label: 'Entertainment', icon: Tv },
];

export const GlobalNews: React.FC<GlobalNewsProps> = ({
  data,
  loading,
  error,
  isRefreshing,
  onRefresh,
  category,
  onSelectCategory,
}) => {
  const formatTimeAgo = (publishedAt: string) => {
    try {
      const diffMs = Date.now() - new Date(publishedAt).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 60) return `${Math.max(1, diffMin)}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${Math.floor(diffHrs / 24)}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/20">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide font-mono">
                TOP 10 WORLD NEWS
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Live Wire
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Aggregated Global Wire Feeds (Reuters, AP, BBC, Bloomberg)
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

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = category.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-950/40 font-semibold'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {loading && !data && <LoadingSkeleton variant="news" count={5} />}

      {error && !data && (
        <ErrorState
          title="News Wire Offline"
          message={error}
          onRetry={onRefresh}
          isRetrying={isRefreshing}
        />
      )}

      {/* News List */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {data.articles.map((article, idx) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Meta info */}
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">#{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-medium">
                      {article.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(article.publishedAt)}</span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-1.5 leading-snug">
                  {article.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {article.description}
                </p>
              </div>

              {/* Bottom footer */}
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors">
                <span>Read Dispatch</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
};

