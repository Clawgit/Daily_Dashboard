import React from 'react';
import { RefreshCw, Settings, Sun, Moon, Globe2 } from 'lucide-react';
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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#090d16]/80 light:bg-white/80 border-b border-white/10 light:border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              <Globe2 className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  WORLD PULSE
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  LIVE DASHBOARD
                </span>
              </div>
              {/* Connection Status indicator */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  {isConnected ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  )}
                </span>
                <span className="text-xs font-mono tracking-wide text-slate-400">
                  {isConnected ? 'Live data connected' : 'Connecting data feeds...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Date & Clock */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="text-xs font-medium text-slate-400 tracking-wide uppercase">
            {formattedDate}
          </div>
          <div className="text-2xl font-mono font-bold tracking-tight text-cyan-400 drop-shadow-[0_0_12px_rgba(0,242,254,0.3)]">
            {formattedTime}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Time */}
          <div className="md:hidden text-right mr-1">
            <div className="text-xs font-mono font-semibold text-cyan-400">
              {formattedTime}
            </div>
            <div className="text-[10px] text-slate-400">
              Live Local
            </div>
          </div>

          {/* Global Refresh Button */}
          <button
            onClick={onGlobalRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh all feeds now"
            aria-label="Refresh all dashboard feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title="Dashboard Settings"
            aria-label="Open settings modal"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
