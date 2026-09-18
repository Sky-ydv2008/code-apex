import React from 'react';
import { AlertOctagon, ShieldX, CheckCircle, Maximize2 } from 'lucide-react';

interface ProctorWarningModalProps {
  isOpen: boolean;
  strikes: number;
  maxStrikes: number;
  isDisqualified: boolean;
  lastViolationMsg?: string;
  onClose: () => void;
  onRequestFullscreen: () => void;
}

export const ProctorWarningModal: React.FC<ProctorWarningModalProps> = ({
  isOpen,
  strikes,
  maxStrikes,
  isDisqualified,
  lastViolationMsg,
  onClose,
  onRequestFullscreen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isDisqualified ? 'bg-rose-500' : 'bg-amber-500'
          }`}
        />

        <div className="flex items-center space-x-3 mb-4">
          <div
            className={`p-3 rounded-xl ${
              isDisqualified
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
          >
            {isDisqualified ? <ShieldX className="w-8 h-8" /> : <AlertOctagon className="w-8 h-8 animate-bounce" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">
              {isDisqualified ? 'Contest Disqualification' : 'Proctor Anti-Cheat Warning!'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Tab switching & window blur are prohibited
            </p>
          </div>
        </div>

        <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          {lastViolationMsg && (
            <p className="text-sm font-medium text-amber-300 flex items-center space-x-2">
              <span>⚠️</span>
              <span>{lastViolationMsg}</span>
            </p>
          )}

          <div className="flex items-center justify-between text-sm py-2 border-t border-slate-800">
            <span className="text-slate-400">Total Violation Strikes:</span>
            <span
              className={`px-3 py-1 rounded-md font-mono font-bold ${
                isDisqualified
                  ? 'bg-rose-900/90 text-rose-200 border border-rose-700'
                  : 'bg-amber-900/90 text-amber-200 border border-amber-700'
              }`}
            >
              {strikes} / {maxStrikes}
            </span>
          </div>

          {isDisqualified && (
            <p className="text-xs text-rose-400 leading-relaxed font-semibold">
              You have exceeded the maximum strike limit allowed for this proctored contest. Your current submissions have been locked.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          {!isDisqualified && (
            <>
              <button
                onClick={() => {
                  onRequestFullscreen();
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-600/20"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Return to Fullscreen</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition"
              >
                Acknowledge
              </button>
            </>
          )}

          {isDisqualified && (
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Close & View Results</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
