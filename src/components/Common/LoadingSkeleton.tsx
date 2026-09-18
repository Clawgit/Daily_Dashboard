import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'hero' | 'forecast' | 'netflix' | 'news' | 'events' | 'clock';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'hero', count = 3 }) => {
  if (variant === 'hero') {
    return (
      <div className="animate-pulse p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 w-24 bg-slate-200 dark:bg-white/10 rounded"></div>
            <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'netflix') {
    return (
      <div className="animate-pulse flex gap-3 overflow-x-hidden py-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="min-w-[180px] w-[180px] h-[260px] rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 flex flex-col justify-between flex-shrink-0">
            <div className="w-full h-[160px] bg-slate-200 dark:bg-white/10 rounded-lg mb-2"></div>
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/10 rounded mb-1"></div>
            <div className="h-3 w-1/2 bg-slate-200 dark:bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'news') {
    return (
      <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col gap-2">
            <div className="h-24 w-full bg-slate-200 dark:bg-white/10 rounded-lg"></div>
            <div className="h-4 w-4/5 bg-slate-200 dark:bg-white/10 rounded"></div>
            <div className="h-3 w-full bg-slate-200 dark:bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'events') {
    return (
      <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col gap-2">
            <div className="w-full h-28 rounded-lg bg-slate-200 dark:bg-white/10"></div>
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-white/10 rounded"></div>
            <div className="h-3 w-full bg-slate-200 dark:bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 h-20"></div>
  );
};
