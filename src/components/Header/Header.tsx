import React from 'react';
import { RefreshCw, Settings, Sun, Moon, Sparkles } from 'lucide-react';
import { ThemeMode } from '../../types';

interface HeaderProps {
  formattedDate: string;
  formattedTime: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onGlobalRefresh: () => void;
  isRefreshing: boolean;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  formattedDate,
  formattedTime,
  theme,
  onToggleTheme,
  onOpenSettings,
  onGlobalRefresh,
  isRefreshing,
  isConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 dark:bg-[#090d16]/85 border-b border-slate-200/80 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-extrabold tracking-wider bg-gradient-to-r from-slate-900 via-cyan-800 to-slate-700 dark:from-white dark:via-cyan-200 dark:to-slate-300 bg-clip-text text-transparent truncate">
                MADHUR DASHBOARD
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-semibold">
                LIVE
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                {isConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                )}
              </span>
              <p className="text-[11px] sm:text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                Your world at a glance
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Date & Clock (Desktop/Tablet) */}
        <div className="hidden md:flex flex-col items-center justify-center px-4">
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 tracking-wider uppercase">
            {formattedDate}
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_12px_rgba(0,242,254,0.25)]">
            {formattedTime}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Mobile Time / Subtitle */}
          <div className="md:hidden text-right mr-1">
            <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
              {formattedTime}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[75px]">
              {formattedDate.split(',')[0] || 'Today'}
            </div>
          </div>

          {/* Global Refresh Button */}
          <button
            onClick={onGlobalRefresh}
            disabled={isRefreshing}
            className="touch-target p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh all feeds now"
            aria-label="Refresh all dashboard feeds"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 dark:text-slate-300 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
            <span className="hidden lg:inline ml-1.5">{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="touch-target p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all active:scale-95"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="touch-target p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all active:scale-95"
            title="Dashboard Settings"
            aria-label="Open settings modal"
          >
            <Settings className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
