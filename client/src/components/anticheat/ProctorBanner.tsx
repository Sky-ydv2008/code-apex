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
      className={`px-4 py-2 flex items-center justify-between border-b transition-colors ${
        isDisqualified
          ? 'bg-rose-950/90 border-rose-800 text-rose-200'
          : strikes > 0
          ? 'bg-amber-950/80 border-amber-800 text-amber-200'
          : 'bg-slate-900/90 border-slate-800 text-slate-300'
      }`}
    >
      <div className="flex items-center space-x-3 text-xs md:text-sm">
        <div className="flex items-center space-x-1.5 font-bold tracking-wide text-cyan-400">
          <ShieldAlert className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>PROCTOR ANTI-CHEAT: ACTIVE</span>
        </div>

        <span className="text-slate-600">|</span>

        <div className="flex items-center space-x-1 font-mono">
          <span>STRIKES:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold ${
              strikes === 0
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : strikes >= maxStrikes
                ? 'bg-rose-900 text-rose-200 animate-bounce'
                : 'bg-amber-900 text-amber-300'
            }`}
          >
            {strikes} / {maxStrikes}
          </span>
        </div>

        <span className="hidden sm:inline text-slate-600">|</span>

        <div className="hidden sm:flex items-center space-x-1 font-mono text-xs">
          <span>TAB SWITCHING:</span>
          <span className="text-rose-400 font-semibold">NOT ALLOWED</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-xs">
        {!isFullscreen && !isDisqualified && (
          <button
            onClick={onRequestFullscreen}
            className="flex items-center space-x-1 px-3 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition font-medium"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Enter Fullscreen</span>
          </button>
        )}

        {isFullscreen && (
          <span className="flex items-center space-x-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fullscreen Enforced</span>
          </span>
        )}

        {isDisqualified && (
          <span className="flex items-center space-x-1 text-rose-400 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>DISQUALIFIED</span>
          </span>
        )}
      </div>
    </div>
  );
};
