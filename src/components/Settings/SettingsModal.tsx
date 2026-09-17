import React from 'react';
import { X, Settings, RotateCcw, ShieldCheck } from 'lucide-react';
import { UserSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dashboard Preferences</h3>
              <p className="text-xs text-slate-400">Settings are auto-persisted locally</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {/* Temperature Unit */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Temperature Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ temperatureUnit: 'celsius' })}
                className={`py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                  settings.temperatureUnit === 'celsius'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ temperatureUnit: 'fahrenheit' })}
                className={`py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                  settings.temperatureUnit === 'fahrenheit'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Display Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                Dark Intelligence (Default)
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                  settings.theme === 'light'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                Clean Light
              </button>
            </div>
          </div>

          {/* Default News Topic */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Default News Category
            </label>
            <select
              value={settings.newsCategory}
              onChange={(e) => onUpdateSettings({ newsCategory: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {['World', 'Technology', 'Science', 'Business', 'Politics', 'Sports', 'Entertainment'].map((c) => (
                <option key={c} value={c} className="bg-[#0f172a] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Default Netflix Category */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Default Netflix Category
            </label>
            <select
              value={settings.netflixCategory}
              onChange={(e) => onUpdateSettings({ netflixCategory: e.target.value as any })}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {['Films (English)', 'Films (Non-English)', 'TV (English)', 'TV (Non-English)'].map((c) => (
                <option key={c} value={c} className="bg-[#0f172a] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="font-semibold text-white text-xs">Automatic Live Refresh</div>
              <div className="text-[11px] text-slate-400">
                Polls fresh data automatically (pauses when tab is hidden)
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ autoRefresh: !settings.autoRefresh })}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                settings.autoRefresh ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.autoRefresh ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="font-semibold text-white text-xs">Reduced Motion</div>
              <div className="text-[11px] text-slate-400">
                Disables transitions and micro-animations for accessibility
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                settings.reducedMotion ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset to Defaults */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onResetSettings}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-slate-400 hover:text-white transition-all font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All to Defaults</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/30 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Zero Key Tracking
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
