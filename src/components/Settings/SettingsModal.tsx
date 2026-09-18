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
      <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Dashboard Preferences</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Settings are auto-persisted locally</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-sm text-slate-700 dark:text-slate-300">
          {/* Temperature Unit */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-bold">
              Temperature Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ temperatureUnit: 'celsius' })}
                className={`touch-target py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                  settings.temperatureUnit === 'celsius'
                    ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ temperatureUnit: 'fahrenheit' })}
                className={`touch-target py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                  settings.temperatureUnit === 'fahrenheit'
                    ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-bold">
              Display Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`touch-target py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                Dark Theme
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`touch-target py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                  settings.theme === 'light'
                    ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                Light Theme
              </button>
            </div>
          </div>

          {/* Default News Topic */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-bold">
              Default News Topic
            </label>
            <select
              value={settings.newsCategory}
              onChange={(e) => onUpdateSettings({ newsCategory: e.target.value })}
              className="touch-target w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {['AI & Technology', 'World', 'India', 'Business'].map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-xs">Automatic Live Refresh</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Polls fresh data automatically (pauses when tab is hidden)
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ autoRefresh: !settings.autoRefresh })}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                settings.autoRefresh ? 'bg-cyan-600' : 'bg-slate-400 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.autoRefresh ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset to Defaults */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onResetSettings}
              className="touch-target flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All to Defaults</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Madhur Dashboard Privacy First
          </span>
          <button
            onClick={onClose}
            className="touch-target px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
