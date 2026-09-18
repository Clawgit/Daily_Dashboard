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
    <div className={`p-6 rounded-xl border border-rose-500/20 bg-rose-50 dark:bg-rose-950/20 backdrop-blur-sm flex flex-col items-center justify-center text-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3 border border-rose-500/20">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200 mb-1">{title}</h4>
      <p className="text-xs text-rose-700 dark:text-rose-300/80 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="touch-target inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold transition-all border border-rose-600 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Retry Now'}</span>
        </button>
      )}
    </div>
  );
};
