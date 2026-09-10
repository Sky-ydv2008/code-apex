import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import {
  Sparkles,
  Bug,
  Wrench,
  Code,
  Zap,
  TestTube,
  Lightbulb,
  CheckSquare,
  ArrowRight,
  Check,
  Send,
  Loader2,
  Award,
} from 'lucide-react';

export const AIAssistantPanel: React.FC = () => {
  const { activeFile, aiResponse, isAILoading, activeAITab, setActiveAITab, runAI, applyAIFix } = useRoom();
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (aiResponse?.fixedCode) {
      applyAIFix(aiResponse.fixedCode);
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
    }
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatePrompt.trim()) return;
    runAI('generate', generatePrompt.trim());
  };

  const tabs = [
    { id: 'explain', label: 'Explain', icon: Sparkles },
    { id: 'debug', label: 'Debug', icon: Bug },
    { id: 'fix', label: 'Fix Code', icon: Wrench },
    { id: 'generate', label: 'Generate', icon: Code },
    { id: 'optimize', label: 'Optimize', icon: Zap },
    { id: 'testcase', label: 'Test Cases', icon: TestTube },
    { id: 'hint', label: 'Hints', icon: Lightbulb },
    { id: 'review', label: 'Review', icon: CheckSquare },
  ];

  return (
    <div className="w-80 bg-slate-900/90 border-l border-slate-800 flex flex-col h-full select-none">
      {/* Header */}
      <div className="h-10 px-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Copilot</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
          8 Tools
        </span>
      </div>

      {/* AI Action Tabs */}
      <div className="p-2 border-b border-slate-800 bg-slate-950/40 grid grid-cols-4 gap-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeAITab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveAITab(t.id);
                if (t.id !== 'generate') runAI(t.id);
              }}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mb-0.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Custom Prompt for Generate */}
        {activeAITab === 'generate' && (
          <form onSubmit={handleGenerateSubmit} className="space-y-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-300">Describe code requirement:</label>
            <div className="relative">
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder="e.g. Write a function to check if binary tree is balanced..."
                rows={3}
                className="w-full p-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                type="submit"
                disabled={isAILoading || !generatePrompt.trim()}
                className="mt-1 w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>Generate Code</span>
              </button>
            </div>
          </form>
        )}

        {/* Loading Spinner */}
        {isAILoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-indigo-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs font-medium text-slate-400">Processing with AI Assistant...</p>
          </div>
        ) : aiResponse && aiResponse.type === activeAITab ? (
          <div className="space-y-3">
            {/* Score Ring / Meter for Review */}
            {activeAITab === 'review' && aiResponse.score !== undefined && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 text-center space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Code Quality Rating</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  <span className="text-indigo-400">{aiResponse.score}</span>
                  <span className="text-slate-500 text-lg"> / 100</span>
                </div>

                {aiResponse.breakdown && (
                  <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] text-left">
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">Readability</span>
                      <span className="font-bold text-emerald-400">{aiResponse.breakdown.readability}%</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">Correctness</span>
                      <span className="font-bold text-indigo-400">{aiResponse.breakdown.correctness}%</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">Performance</span>
                      <span className="font-bold text-amber-400">{aiResponse.breakdown.performance}%</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">Maintainability</span>
                      <span className="font-bold text-cyan-400">{aiResponse.breakdown.maintainability}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 1-CLICK APPLY FIX BUTTON */}
            {aiResponse.fixedCode && (
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300">Suggested Code Solution</span>
                <button
                  onClick={handleApply}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-lg ${
                    applied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  {applied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-3.5 h-3.5" />
                      <span>1-Click Apply Fix</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Markdown Text Response */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
              {aiResponse.result.split('\n').map((paragraph, idx) => {
                if (paragraph.startsWith('###') || paragraph.startsWith('####')) {
                  return (
                    <h4 key={idx} className="font-bold text-indigo-300 text-xs mt-2 mb-1">
                      {paragraph.replace(/#/g, '').trim()}
                    </h4>
                  );
                } else if (paragraph.startsWith('- ') || paragraph.startsWith('1.')) {
                  return (
                    <p key={idx} className="pl-2 border-l-2 border-indigo-500/40 my-1 text-slate-200">
                      {paragraph}
                    </p>
                  );
                }
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-center text-slate-500">
            <Sparkles className="w-8 h-8 text-slate-700" />
            <p className="text-xs">Select any AI tool above to analyze active code.</p>
          </div>
        )}
      </div>
    </div>
  );
};
