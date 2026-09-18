import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Trophy,
  Play,
  Send,
  Clock,
  ShieldAlert,
  Terminal,
  CheckCircle2,
  XCircle,
  Award,
  ChevronRight,
  Maximize2,
  HelpCircle,
  ListOrdered,
  FileCode,
} from 'lucide-react';
import { api } from '../services/api';
import { Contest, ContestProblem, ContestParticipant } from '../types';
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
  const navigate = useNavigate();

  const [contest, setContest] = useState<Contest | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ContestProblem | null>(null);
  const [participant, setParticipant] = useState<ContestParticipant | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<unknown>>([]);

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
  const [showLeaderboardDrawer, setShowLeaderboardDrawer] = useState(false);

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
    onViolation: (eventType, currentStrikes) => {
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
      setParticipant(data.participant);

      if (data.contest.problems && data.contest.problems.length > 0) {
        const prob = data.contest.problems[0];
        setSelectedProblem(prob);
        setCode(prob.starterCode || SUPPORTED_LANGUAGES[1].defaultCode);
      }

      // Join contest automatically if not registered
      if (!data.participant && data.contest.id) {
        const joined = await api.joinContest(data.contest.id);
        setParticipant(joined.participant);
      }

      // Load Leaderboard
      if (data.contest.id) {
        const lbData = await api.getContestLeaderboard(data.contest.id);
        setLeaderboard(lbData.leaderboard);
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

      // Refresh Leaderboard
      const lbData = await api.getContestLeaderboard(contest.id);
      setLeaderboard(lbData.leaderboard);
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-cyan-400 font-mono text-sm">Loading Contest Arena...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
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
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-cyan-400 font-black tracking-tight text-lg">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="hidden sm:inline">{contest.title}</span>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
            {contest.problems?.map((prob, idx) => (
              <button
                key={prob.id}
                onClick={() => handleSelectProblem(prob)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                  selectedProblem?.id === prob.id
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>P{idx + 1}</span>
                <span className="hidden md:inline font-normal">({prob.points}pts)</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowLeaderboardDrawer(!showLeaderboardDrawer)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 transition"
          >
            <ListOrdered className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>

          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{contest.durationMinutes}m Left</span>
          </div>
        </div>
      </div>

      {/* Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Problem Statement */}
        <div className="w-full md:w-1/2 border-r border-slate-800 flex flex-col overflow-y-auto p-6 bg-slate-900/60">
          {selectedProblem ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">{selectedProblem.title}</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        selectedProblem.difficulty === 'EASY'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : selectedProblem.difficulty === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {selectedProblem.difficulty}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      +{selectedProblem.points} Points
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {selectedProblem.description}
              </div>

              {/* Sample Test Cases */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Sample Test Cases</span>
                </h4>
                {(() => {
                  try {
                    const cases = JSON.parse(selectedProblem.testCases || '[]');
                    return cases.map((tc: { input: string; expected: string }, idx: number) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-2 font-mono">
                        <div>
                          <span className="text-slate-500">Input:</span>
                          <pre className="text-slate-200 mt-1 bg-slate-900 p-2 rounded">{tc.input}</pre>
                        </div>
                        <div>
                          <span className="text-slate-500">Expected Output:</span>
                          <pre className="text-emerald-400 mt-1 bg-slate-900 p-2 rounded">{tc.expected}</pre>
                        </div>
                      </div>
                    ));
                  } catch {
                    return <p className="text-xs text-slate-500">No test cases displayable</p>;
                  }
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">Select a problem above to begin</div>
          )}
        </div>

        {/* Right Panel: Editor & Code Execution */}
        <div className="w-full md:w-1/2 flex flex-col bg-slate-950">
          {/* Controls Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
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
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono font-semibold focus:outline-none focus:border-cyan-500"
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
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting || isDisqualified}
                className="px-5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              language={selectedLang}
              theme="vs-dark"
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
          <div className="h-48 border-t border-slate-800 bg-slate-900/90 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-1.5 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveBottomTab('console')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    activeBottomTab === 'console' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'text-slate-400'
                  }`}
                >
                  Console Output
                </button>
                <button
                  onClick={() => setActiveBottomTab('testcases')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    activeBottomTab === 'testcases' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'text-slate-400'
                  }`}
                >
                  Custom STDIN
                </button>
              </div>

              {executionOutput?.executionTimeMs !== undefined && (
                <span className="text-[11px] font-mono text-slate-500">
                  Execution Time: {executionOutput.executionTimeMs}ms
                </span>
              )}
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-slate-950">
              {activeBottomTab === 'console' && (
                <div>
                  {executionOutput ? (
                    <div className="space-y-2">
                      {executionOutput.isPassed !== undefined && (
                        <div
                          className={`p-2 rounded-lg font-bold flex items-center space-x-2 ${
                            executionOutput.isPassed
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {executionOutput.isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>
                            {executionOutput.isPassed ? 'ACCEPTED! All Test Cases Passed.' : 'WRONG ANSWER / REJECTED'}
                          </span>
                        </div>
                      )}

                      {executionOutput.error && (
                        <pre className="text-rose-400 whitespace-pre-wrap">{executionOutput.error}</pre>
                      )}

                      {executionOutput.stdout && (
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase">stdout:</span>
                          <pre className="text-emerald-400 whitespace-pre-wrap mt-0.5">{executionOutput.stdout}</pre>
                        </div>
                      )}

                      {executionOutput.stderr && (
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase">stderr:</span>
                          <pre className="text-amber-400 whitespace-pre-wrap mt-0.5">{executionOutput.stderr}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-600 italic">Run or Submit code to see live test case results...</div>
                  )}
                </div>
              )}

              {activeBottomTab === 'testcases' && (
                <div className="h-full flex flex-col">
                  <label className="text-slate-400 text-[11px] mb-1">Standard Input (stdin):</label>
                  <textarea
                    rows={4}
                    value={stdinInput}
                    onChange={(e) => setStdinInput(e.target.value)}
                    placeholder="Enter custom input values line by line..."
                    className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
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
