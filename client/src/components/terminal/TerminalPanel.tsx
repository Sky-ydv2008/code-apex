import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { Terminal, CheckCircle2, AlertTriangle, Clock, Trash2 } from 'lucide-react';

export const TerminalPanel: React.FC = () => {
  const { executionResult, isExecuting } = useRoom();

  return (
    <div className="h-48 border-t border-slate-800 bg-slate-950 flex flex-col font-mono text-xs select-none">
      {/* Header */}
      <div className="h-8 border-b border-slate-800/80 bg-slate-900/60 px-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Execution Console</span>

          {executionResult && (
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
              {executionResult.exitCode === 0 ? (
                <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Success (0)</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-rose-400 font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Failed ({executionResult.exitCode})</span>
                </span>
              )}

              <span className="flex items-center space-x-1 text-slate-500 text-[10px]">
                <Clock className="w-3 h-3" />
                <span>{executionResult.executionTimeMs}ms</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Output Content */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-slate-300 space-y-1">
        {isExecuting ? (
          <div className="flex items-center space-x-2 text-indigo-400 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            <span>Executing code in isolated container sandbox...</span>
          </div>
        ) : executionResult ? (
          <>
            {executionResult.stdout && (
              <pre className="text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">{executionResult.stdout}</pre>
            )}
            {executionResult.stderr && (
              <pre className="text-rose-400 whitespace-pre-wrap font-mono leading-relaxed bg-rose-950/20 p-2 rounded border border-rose-900/30">
                {executionResult.stderr}
              </pre>
            )}
            {!executionResult.stdout && !executionResult.stderr && (
              <p className="text-slate-500 italic">[Program exited with no standard output]</p>
            )}
          </>
        ) : (
          <p className="text-slate-600 italic">Press "Run Code" above to execute current file.</p>
        )}
      </div>
    </div>
  );
};
