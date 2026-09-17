import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface LastUpdatedBadgeProps {
  timestamp?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  cached?: boolean;
}

export const LastUpdatedBadge: React.FC<LastUpdatedBadgeProps> = ({
  timestamp,
  onRefresh,
  isRefreshing = false,
  cached = false,
}) => {
  const [relativeTime, setRelativeTime] = useState<string>('Just now');

  useEffect(() => {
    if (!timestamp) return;

    const updateTime = () => {
      const diffSec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
      if (diffSec < 30) {
        setRelativeTime('Just now');
      } else if (diffSec < 60) {
        setRelativeTime(`${diffSec}s ago`);
      } else if (diffSec < 3600) {
        setRelativeTime(`${Math.floor(diffSec / 60)}m ago`);
      } else {
        setRelativeTime(`${Math.floor(diffSec / 3600)}h ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      {cached && (
        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
          Cached
        </span>
      )}
      <span className="font-mono text-[11px] opacity-80">
        Updated {relativeTime}
      </span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh section data"
          className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all disabled:opacity-50"
          title="Refresh section"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      )}
    </div>
  );
};

