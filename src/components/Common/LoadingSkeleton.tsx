import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'hero' | 'forecast' | 'netflix' | 'news' | 'events' | 'clock';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'hero', count = 3 }) => {
  if (variant === 'hero') {
    return (
      <div className="animate-pulse p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col md:flex-row gap-6 justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-32 bg-white/10 rounded"></div>
          <div className="h-12 w-48 bg-white/10 rounded-lg"></div>
          <div className="h-4 w-40 bg-white/10 rounded"></div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="h-14 bg-white/10 rounded-lg"></div>
            <div className="h-14 bg-white/10 rounded-lg"></div>
            <div className="h-14 bg-white/10 rounded-lg"></div>
          </div>
        </div>
        <div className="w-full md:w-72 h-44 bg-white/10 rounded-xl"></div>
      </div>
    );
  }

  if (variant === 'forecast') {
    return (
      <div className="animate-pulse grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 flex flex-col items-center">
            <div className="h-3 w-12 bg-white/10 rounded"></div>
            <div className="w-8 h-8 rounded-full bg-white/10"></div>
            <div className="h-4 w-16 bg-white/10 rounded"></div>
            <div className="h-2 w-10 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'netflix') {
    return (
      <div className="animate-pulse flex gap-4 overflow-x-hidden py-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="min-w-[200px] w-[200px] h-[320px] rounded-xl bg-white/5 border border-white/5 p-3 flex flex-col justify-between flex-shrink-0">
            <div className="w-full h-[210px] bg-white/10 rounded-lg mb-2"></div>
            <div className="h-4 w-3/4 bg-white/10 rounded mb-1"></div>
            <div className="h-3 w-1/2 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'news') {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-4 items-start">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-3 w-20 bg-white/10 rounded"></div>
                <div className="h-3 w-16 bg-white/10 rounded"></div>
              </div>
              <div className="h-5 w-full bg-white/10 rounded"></div>
              <div className="h-3 w-4/5 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'events') {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex gap-3 items-center">
            <div className="w-12 h-10 rounded-lg bg-white/10"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-1/3 bg-white/10 rounded"></div>
              <div className="h-3 w-full bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse p-4 bg-white/5 rounded-xl border border-white/5 h-24"></div>
  );
};

