import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Temporarily Unavailable',
  message,
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-xl border border-rose-500/20 bg-rose-950/10 backdrop-blur-sm flex flex-col items-center justify-center text-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mb-3 border border-rose-500/20">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-200 mb-1">{title}</h4>
      <p className="text-xs text-rose-300/80 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium transition-all border border-rose-500/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry Now'}
        </button>
      )}
    </div>
  );
};

