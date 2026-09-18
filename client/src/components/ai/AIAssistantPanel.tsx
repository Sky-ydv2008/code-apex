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
  Check,
  Send,
  Loader2,
} from 'lucide-react';

export const AIAssistantPanel: React.FC = () => {
  const { activeFile, aiResponse, isAILoading, activeAITab, setActiveAITab, runAI, applyAIFix } = useRoom();
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [applied, setApplied] = useState(false);

  // Helper to extract code block or fixedCode from AIResponse
  const getAIContent = () => {
    if (!aiResponse) return '';
    const text = aiResponse.output || '';
    if (aiResponse.fixedCode) return aiResponse.fixedCode;

    const codeMatch = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (codeMatch && codeMatch[1]) {
      return codeMatch[1].trim();
    }
    return text;
  };

  const handleApply = () => {
    const codeToApply = getAIContent();
    if (codeToApply) {
      applyAIFix(codeToApply);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
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
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full select-none shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-slate-900 text-sm">Apex AI Assistant</h3>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 border-b border-slate-200 text-[10px]">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveAITab(t.id);
                if (t.id !== 'generate') {
                  runAI(t.id);
                }
              }}
              className={`p-2 rounded-lg flex flex-col items-center space-y-1 transition ${
                activeAITab === t.id
                  ? 'bg-white text-indigo-700 border border-slate-200 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeAITab === 'generate' && (
          <form onSubmit={handleGenerateSubmit} className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Prompt / Feature Request:</label>
            <textarea
              rows={3}
              placeholder="e.g. Write a binary search function in TypeScript..."
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isAILoading}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1"
            >
              {isAILoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Generate Code</span>
                </>
              )}
            </button>
          </form>
        )}

        {isAILoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3 text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono">Analyzing code & synthesizing intelligence...</span>
          </div>
        ) : aiResponse ? (
          <div className="space-y-4">
            {/* Display AI Output text */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 space-y-2 leading-relaxed">
              <div className="flex items-center justify-between text-[10px] text-indigo-700 font-bold border-b border-slate-200 pb-1 uppercase">
                <span>AI {aiResponse.type} Output</span>
              </div>
              <div className="whitespace-pre-wrap">{aiResponse.output}</div>
            </div>

            {/* Apply Code Button if relevant */}
            {(activeAITab === 'fix' || activeAITab === 'generate' || activeAITab === 'optimize') && (
              <button
                onClick={handleApply}
                className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                  applied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-slate-200'
                }`}
              >
                {applied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Applied to Active File!</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4" />
                    <span>Apply Code to Editor</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs italic">
            Select an AI action above to analyze <span className="font-mono text-slate-700 font-semibold">{activeFile?.name || 'current file'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
