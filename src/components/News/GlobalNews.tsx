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
  Bot,
  Briefcase,
  Layers,
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
  { id: 'AI & Technology', label: '🤖 AI & Tech', icon: Bot, badge: 'Priority' },
  { id: 'World', label: '🌎 World', icon: Globe },
  { id: 'India', label: '🇮🇳 India', icon: Layers },
  { id: 'Business', label: '💼 Business', icon: Briefcase },
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
    <Card glow className="p-4 sm:p-5 glow-news flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2.5 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wider font-mono">
                TOP 10 WORLD NEWS
              </h2>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                Visual Wire
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              AI & Tech First • BBC Verified Global Feeds
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

      {/* Category Tabs: AI & Tech first! */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = category.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30 font-bold'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              {cat.badge && (
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-400/20 text-amber-900 dark:text-amber-200 ml-0.5 font-semibold">
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && !data && <LoadingSkeleton variant="news" count={4} />}

      {error && !data && (
        <ErrorState
          title="News Wire Offline"
          message={error}
          onRetry={onRefresh}
          isRetrying={isRefreshing}
        />
      )}

      {/* Visual News List */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {data.articles.slice(0, 8).map((article, idx) => (
            <a
              key={article.id || idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target group p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] border border-slate-200/80 dark:border-white/5 hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-sm hover:shadow-md overflow-hidden text-left"
            >
              <div>
                {/* Article Image if available */}
                {article.thumbnailUrl && (
                  <div className="w-full h-28 sm:h-32 rounded-lg overflow-hidden mb-2.5 bg-slate-200 dark:bg-slate-800 relative flex-shrink-0">
                    <img
                      src={article.thumbnailUrl}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[9px] font-mono text-white font-bold">
                      #{idx + 1}
                    </div>
                  </div>
                )}

                {/* Meta info */}
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    {!article.thumbnailUrl && (
                      <span className="text-blue-600 dark:text-blue-400 font-bold">#{idx + 1}</span>
                    )}
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold truncate">
                      {article.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] flex-shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatTimeAgo(article.publishedAt)}</span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1 leading-snug">
                  {article.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {article.description}
                </p>
              </div>

              {/* Bottom Read link */}
              <div className="mt-2.5 pt-1.5 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <span className="font-semibold">Read Full Coverage</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
};
