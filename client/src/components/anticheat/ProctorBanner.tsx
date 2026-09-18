import React from 'react';
import { ShieldAlert, Maximize2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ProctorBannerProps {
  enabled: boolean;
  strikes: number;
  maxStrikes: number;
  isFullscreen: boolean;
  isDisqualified: boolean;
  onRequestFullscreen: () => void;
}

export const ProctorBanner: React.FC<ProctorBannerProps> = ({
  enabled,
  strikes,
  maxStrikes,
  isFullscreen,
  isDisqualified,
  onRequestFullscreen,
}) => {
  if (!enabled) return null;

  return (
    <div
      className={`px-4 py-2 flex items-center justify-between border-b transition-colors shadow-xs ${
        isDisqualified
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : strikes > 0
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex items-center space-x-3 text-xs md:text-sm">
        <div className="flex items-center space-x-1.5 font-bold tracking-wide text-indigo-600">
          <ShieldAlert className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span>PROCTOR ANTI-CHEAT: ACTIVE</span>
        </div>

        <span className="text-slate-300">|</span>

        <div className="flex items-center space-x-1 font-mono">
          <span>STRIKES:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold ${
              strikes === 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : strikes >= maxStrikes
                ? 'bg-rose-600 text-white animate-bounce'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {strikes} / {maxStrikes}
          </span>
        </div>

        <span className="hidden sm:inline text-slate-300">|</span>

        <div className="hidden sm:flex items-center space-x-1 font-mono text-xs">
          <span>TAB SWITCHING:</span>
          <span className="text-rose-600 font-semibold">NOT ALLOWED</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-xs">
        {!isFullscreen && !isDisqualified && (
          <button
            onClick={onRequestFullscreen}
            className="flex items-center space-x-1 px-3 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition font-semibold"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Enter Fullscreen</span>
          </button>
        )}

        {isFullscreen && (
          <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fullscreen Enforced</span>
          </span>
        )}

        {isDisqualified && (
          <span className="flex items-center space-x-1 text-rose-600 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>DISQUALIFIED</span>
          </span>
        )}
      </div>
    </div>
  );
};
