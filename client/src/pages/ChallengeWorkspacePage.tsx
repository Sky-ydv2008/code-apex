import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { Challenge } from '../types';
import { Trophy, Play, CheckCircle2, XCircle, Lightbulb, Sparkles, ArrowLeft, Award, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ChallengeWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);

  useEffect(() => {
    if (slug) {
      api.getChallenge(slug).then((res) => {
        setChallenge(res.challenge);
        setCode(res.challenge.starterCode);
      });
    }
  }, [slug]);

  const handleSubmit = async () => {
    if (!challenge || !code.trim()) return;
    if (!user) {
      alert('Please log in or click Demo Student to submit challenge solutions!');
      return;
    }
    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await api.submitChallenge(challenge.id, code);
      setSubmissionResult(res);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!challenge) {
    return <div className="p-8 text-center text-slate-400">Loading Challenge...</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/challenges')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="font-bold text-white text-sm flex items-center space-x-2">
            <span>{challenge.title}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 text-[10px]">
              {challenge.difficulty}
            </span>
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHints(!showHints)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold transition flex items-center space-x-1"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>AI Hints ({challenge.hints?.length || 0})</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{submitting ? 'Testing Solution...' : 'Submit Code'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left: Problem Statement & Test Results */}
        <div className="border-r border-slate-800 flex flex-col h-full bg-slate-900/40 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
            <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
              <span>Category: {challenge.category}</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">Reward: +{challenge.points} Points</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-3 leading-relaxed">
            {challenge.description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Progressive AI Hints Panel */}
          {showHints && challenge.hints && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                  <Lightbulb className="w-4 h-4" />
                  <span>Progressive Hint #{hintIdx + 1}</span>
                </span>
                {hintIdx < challenge.hints.length - 1 && (
                  <button
                    onClick={() => setHintIdx(hintIdx + 1)}
                    className="text-[10px] text-amber-300 underline font-semibold"
                  >
                    Next Hint →
                  </button>
                )}
              </div>
              <p className="text-xs text-amber-200">{challenge.hints[hintIdx]}</p>
            </div>
          )}

          {/* Submission Output Results */}
          {submissionResult && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Automated Test Results</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    submissionResult.status === 'ACCEPTED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {submissionResult.status === 'ACCEPTED' ? '✓ Accepted (+ Points Awarded!)' : submissionResult.status}
                </span>
              </div>

              <div className="space-y-2">
                {submissionResult.testResults?.map((tr: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                      tr.passed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className={tr.passed ? 'text-emerald-400' : 'text-rose-400'}>
                        {tr.passed ? '✓ Test Case Passed' : '✗ Test Case Failed'}
                      </span>
                      <span className="text-slate-500 text-[10px]">{tr.input}</span>
                    </div>
                    <div className="text-slate-300">
                      Expected: <span className="text-emerald-300">{tr.expected}</span> | Actual:{' '}
                      <span className={tr.passed ? 'text-emerald-300' : 'text-rose-300'}>{tr.actual}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Monaco Editor */}
        <div className="flex flex-col h-full bg-slate-950">
          <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>solution.js</span>
            <span className="text-indigo-400">JavaScript</span>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language="javascript"
              value={code}
              onChange={(v) => setCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', monospace",
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
