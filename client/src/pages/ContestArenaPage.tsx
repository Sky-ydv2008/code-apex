import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Trophy,
  Play,
  Send,
  Clock,
  Terminal,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Contest, ContestProblem } from '../types';
import { useProctor } from '../hooks/useProctor';
import { ProctorBanner } from '../components/anticheat/ProctorBanner';
import { ProctorWarningModal } from '../components/anticheat/ProctorWarningModal';

const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python 3', defaultCode: 'def solve():\n    print("Hello Apex")\n\nsolve()' },
  { id: 'javascript', name: 'JavaScript (Node.js)', defaultCode: 'function solve() {\n  console.log("Hello Apex");\n}\nsolve();' },
  { id: 'typescript', name: 'TypeScript', defaultCode: 'function solve(): void {\n  console.log("Hello Apex");\n}\nsolve();' },
  { id: 'cpp', name: 'C++ 20', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello Apex" << endl;\n    return 0;\n}' },
  { id: 'java', name: 'Java 17', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Apex");\n    }\n}' },
  { id: 'go', name: 'Go 1.20', defaultCode: 'package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello Apex")\n}' },
  { id: 'rust', name: 'Rust 1.68', defaultCode: 'fn main() {\n    println!("Hello Apex");\n}' },
  { id: 'csharp', name: 'C# (.NET)', defaultCode: 'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello Apex");\n    }\n}' },
  { id: 'php', name: 'PHP 8', defaultCode: '<?php\necho "Hello Apex";\n?>' },
  { id: 'ruby', name: 'Ruby 3', defaultCode: 'puts "Hello Apex"' },
  { id: 'swift', name: 'Swift 5', defaultCode: 'print("Hello Apex")' },
  { id: 'kotlin', name: 'Kotlin 1.8', defaultCode: 'fun main() {\n    println("Hello Apex")\n}' },
];

export const ContestArenaPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();

  const [contest, setContest] = useState<Contest | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ContestProblem | null>(null);

  const [selectedLang, setSelectedLang] = useState('javascript');
  const [code, setCode] = useState('');
  const [stdinInput, setStdinInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<{
    stdout?: string;
    stderr?: string;
    executionTimeMs?: number;
    error?: string;
    isPassed?: boolean;
    passCount?: number;
    totalCount?: number;
    score?: number;
  } | null>(null);

  const [activeBottomTab, setActiveBottomTab] = useState<'console' | 'testcases' | 'leaderboard'>('console');

  // Proctor Anti-cheat hook
  const {
    strikes,
    isFullscreen,
    isDisqualified,
    showWarningModal,
    lastViolationMsg,
    requestFullscreen,
    closeWarningModal,
  } = useProctor({
    enabled: contest?.antiCheatEnabled ?? true,
    maxStrikes: contest?.maxStrikes ?? 3,
    onViolation: (eventType) => {
      if (contest?.id) {
        api.logContestAntiCheat(contest.id, eventType, `Proctor violation: ${eventType}`).catch(() => {});
      }
    },
    onDisqualified: () => {
      setExecutionOutput({
        error: 'DISQUALIFIED: Maximum anti-cheat tab-switching strikes exceeded.',
      });
    },
  });

  useEffect(() => {
    if (idOrSlug) {
      loadContestData();
    }
  }, [idOrSlug]);

  const loadContestData = async () => {
    try {
      const data = await api.getContest(idOrSlug!);
      setContest(data.contest);

      if (data.contest.problems && data.contest.problems.length > 0) {
        const prob = data.contest.problems[0];
        setSelectedProblem(prob);
        setCode(prob.starterCode || SUPPORTED_LANGUAGES[1].defaultCode);
      }

      // Join contest automatically if not registered
      if (!data.participant && data.contest.id) {
        await api.joinContest(data.contest.id);
      }
    } catch (err) {
      console.error('Failed to load contest:', err);
    }
  };

  const handleSelectProblem = (prob: ContestProblem) => {
    setSelectedProblem(prob);
    setCode(prob.starterCode || SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang)?.defaultCode || '');
    setExecutionOutput(null);
  };

  const handleRunCode = async () => {
    if (isDisqualified) return;
    setIsRunning(true);
    setExecutionOutput(null);

    try {
      const res = await api.runCode(code, selectedLang, stdinInput);
      setExecutionOutput({
        stdout: res.stdout,
        stderr: res.stderr,
        executionTimeMs: res.executionTimeMs,
        error: res.error,
      });
      setActiveBottomTab('console');
    } catch (err: unknown) {
      setExecutionOutput({
        error: err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Execution failed',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!contest || !selectedProblem || isDisqualified) return;
    setIsSubmitting(true);
    setExecutionOutput(null);

    try {
      const res = await api.submitContestProblem(contest.id, selectedProblem.id, code, selectedLang);
      setExecutionOutput({
        isPassed: res.isPassed,
        passCount: res.passCount,
        totalCount: res.totalCount,
        score: res.score,
        error: res.isPassed ? undefined : `Status: ${res.status} (${res.passCount}/${res.totalCount} Passed)`,
      });
      setActiveBottomTab('console');
    } catch (err: unknown) {
      setExecutionOutput({
        error: err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Submission failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contest) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex items-center justify-center">
        <div className="animate-pulse text-indigo-600 font-mono text-sm">Loading Contest Arena...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col font-sans select-none">
      {/* Proctor Anti-Cheat Banner */}
      <ProctorBanner
        enabled={contest.antiCheatEnabled}
        strikes={strikes}
        maxStrikes={contest.maxStrikes}
        isFullscreen={isFullscreen}
        isDisqualified={isDisqualified}
        onRequestFullscreen={requestFullscreen}
      />

      {/* Proctor Warning Modal */}
      <ProctorWarningModal
        isOpen={showWarningModal}
        strikes={strikes}
        maxStrikes={contest.maxStrikes}
        isDisqualified={isDisqualified}
        lastViolationMsg={lastViolationMsg}
        onClose={closeWarningModal}
        onRequestFullscreen={requestFullscreen}
      />

      {/* Header Bar */}
      <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-indigo-700 font-extrabold tracking-tight text-lg">
            <Trophy className="w-5 h-5 text-amber-600" />
            <span className="hidden sm:inline">{contest.title}</span>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
            {contest.problems?.map((prob, idx) => (
              <button
                key={prob.id}
                onClick={() => handleSelectProblem(prob)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                  selectedProblem?.id === prob.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-[#F2ECE1] text-stone-800 hover:bg-[#EAE2D3]'
                }`}
              >
                <span>P{idx + 1}</span>
                <span className="hidden md:inline font-semibold text-stone-500">({prob.points}pts)</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-[#F2ECE1] px-3 py-1 rounded-xl border border-stone-300 text-xs font-mono text-indigo-700 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{contest.durationMinutes}m Left</span>
          </div>
        </div>
      </div>

      {/* Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Problem Statement */}
        <div className="w-full md:w-1/2 border-r border-stone-200 flex flex-col overflow-y-auto p-6 bg-white">
          {selectedProblem ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">{selectedProblem.title}</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        selectedProblem.difficulty === 'EASY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedProblem.difficulty === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {selectedProblem.difficulty}
                    </span>
                    <span className="text-xs font-mono text-indigo-600 font-bold">
                      +{selectedProblem.points} Points
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-slate max-w-none text-stone-700 text-sm leading-relaxed whitespace-pre-line">
                {selectedProblem.description}
              </div>

              {/* Sample Test Cases */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <span>Sample Test Cases</span>
                </h4>
                {(() => {
                  try {
                    const cases = JSON.parse(selectedProblem.testCases || '[]');
                    return cases.map((tc: { input: string; expected: string }, idx: number) => (
                      <div key={idx} className="bg-[#FBF9F5] border border-stone-200 rounded-xl p-3 text-xs space-y-2 font-mono">
                        <div>
                          <span className="text-stone-500 font-semibold">Input:</span>
                          <pre className="text-stone-900 mt-1 bg-white p-2 rounded border border-stone-200">{tc.input}</pre>
                        </div>
                        <div>
                          <span className="text-stone-500 font-semibold">Expected Output:</span>
                          <pre className="text-emerald-700 mt-1 bg-white p-2 rounded border border-stone-200 font-bold">{tc.expected}</pre>
                        </div>
                      </div>
                    ));
                  } catch {
                    return <p className="text-xs text-stone-400">No test cases displayable</p>;
                  }
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-stone-400">Select a problem above to begin</div>
          )}
        </div>

        {/* Right Panel: Editor & Code Execution */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
          {/* Controls Bar */}
          <div className="bg-[#FBF9F5] border-b border-stone-200 px-4 py-2 flex items-center justify-between">
            {/* Language Dropdown */}
            <select
              value={selectedLang}
              onChange={(e) => {
                const lang = e.target.value;
                setSelectedLang(lang);
                const defaultC = SUPPORTED_LANGUAGES.find((l) => l.id === lang)?.defaultCode;
                if (defaultC && (!code || code.length < 20)) {
                  setCode(defaultC);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs font-mono font-semibold focus:outline-none focus:border-indigo-600"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting || isDisqualified}
                className="px-4 py-1.5 rounded-xl bg-[#F2ECE1] hover:bg-[#EAE2D3] text-stone-800 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting || isDisqualified}
                className="px-5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor (Standard Light Theme "vs") */}
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              language={selectedLang}
              theme="vs"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Bottom Terminal / Output Panel */}
          <div className="h-48 border-t border-stone-200 bg-[#FBF9F5] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-1.5 text-xs bg-white">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveBottomTab('console')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    activeBottomTab === 'console' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-stone-600'
                  }`}
                >
                  Console Output
                </button>
                <button
                  onClick={() => setActiveBottomTab('testcases')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    activeBottomTab === 'testcases' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-stone-600'
                  }`}
                >
                  Custom STDIN
                </button>
              </div>

              {executionOutput?.executionTimeMs !== undefined && (
                <span className="text-[11px] font-mono text-stone-500">
                  Execution Time: {executionOutput.executionTimeMs}ms
                </span>
              )}
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-[#FBF9F5]">
              {activeBottomTab === 'console' && (
                <div>
                  {executionOutput ? (
                    <div className="space-y-2">
                      {executionOutput.isPassed !== undefined && (
                        <div
                          className={`p-2 rounded-lg font-bold flex items-center space-x-2 ${
                            executionOutput.isPassed
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {executionOutput.isPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                          <span>
                            {executionOutput.isPassed ? 'ACCEPTED! All Test Cases Passed.' : 'WRONG ANSWER / REJECTED'}
                          </span>
                        </div>
                      )}

                      {executionOutput.error && (
                        <pre className="text-rose-700 whitespace-pre-wrap font-semibold">{executionOutput.error}</pre>
                      )}

                      {executionOutput.stdout && (
                        <div>
                          <span className="text-stone-500 text-[10px] uppercase font-bold">stdout:</span>
                          <pre className="text-stone-900 bg-white p-2 rounded border border-stone-200 whitespace-pre-wrap mt-0.5">{executionOutput.stdout}</pre>
                        </div>
                      )}

                      {executionOutput.stderr && (
                        <div>
                          <span className="text-stone-500 text-[10px] uppercase font-bold">stderr:</span>
                          <pre className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 whitespace-pre-wrap mt-0.5">{executionOutput.stderr}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-stone-400 italic">Run or Submit code to see live test case results...</div>
                  )}
                </div>
              )}

              {activeBottomTab === 'testcases' && (
                <div className="h-full flex flex-col">
                  <label className="text-stone-600 text-[11px] mb-1 font-semibold">Standard Input (stdin):</label>
                  <textarea
                    rows={4}
                    value={stdinInput}
                    onChange={(e) => setStdinInput(e.target.value)}
                    placeholder="Enter custom input values line by line..."
                    className="flex-1 p-2 rounded-xl bg-white border border-stone-300 text-stone-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
