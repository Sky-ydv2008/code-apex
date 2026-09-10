import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  Users,
  Terminal,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Zap,
  Wrench,
  Bot,
  Play,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    if (!user) {
      await loginAsDemo();
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-cyan-500/20 blur-[140px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 md:px-8 max-w-6xl mx-auto text-center space-y-8 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Crafted by Apex Innovators for Developers & Students</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
          AI-Powered Collaborative <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            Coding & Learning Platform
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          CodeCraft AI enables teams and students to code together in real-time, execute programs safely in isolated sandboxes, and solve problems with an 8-in-1 AI Assistant.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleDemoClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Coding Now (Demo)</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <Link
            to="/challenges"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base transition flex items-center justify-center space-x-2"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Explore Challenges</span>
          </Link>
        </div>

        {/* Live IDE Interface Preview Mockup */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden glass-panel">
            {/* Mock Top Bar */}
            <div className="h-10 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-xs font-mono text-slate-400 pl-2">Apex Innovators Studio • APEX01</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>2 Users Online</span>
              </div>
            </div>

            {/* Mock IDE Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 h-72 text-left font-mono text-xs">
              <div className="p-4 bg-slate-950/60 border-r border-slate-800 text-slate-300 space-y-1.5 overflow-hidden">
                <p className="text-slate-500">// Real-Time Collaborative Workspace</p>
                <p className="text-indigo-400">function calculateFibonacci(n) &#123;</p>
                <p className="pl-4 text-slate-300">if (n &lt;= 1) return n;</p>
                <p className="pl-4 text-slate-300">let a = 0, b = 1;</p>
                <p className="pl-4 text-slate-300">for (let i = 2; i &lt;= n; i++) &#123;</p>
                <p className="pl-8 text-slate-300">let temp = a + b;</p>
                <p className="pl-8 text-cyan-300">a = b; b = temp; <span className="bg-indigo-600 text-white px-1 text-[10px] rounded">Alex 🟢</span></p>
                <p className="pl-4 text-slate-300">&#125;</p>
                <p className="pl-4 text-slate-300">return b;</p>
                <p className="text-indigo-400">&#125;</p>
              </div>

              <div className="p-4 bg-slate-900/40 border-r border-slate-800 text-slate-300 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-300 flex items-center space-x-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>AI Copilot: 1-Click Fix</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold">95/100 Score</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Identified O(N) iterative logic with zero recursion stack risk. Space complexity optimized to O(1).
                </p>
                <div className="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded text-emerald-300 font-semibold text-[11px]">
                  ✓ Click "Apply Fix" to update Monaco Editor directly.
                </div>
              </div>

              <div className="p-4 bg-slate-950 text-slate-400 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-bold border-b border-slate-800 pb-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Execution Sandbox</span>
                </div>
                <p className="text-emerald-400">$ node index.js</p>
                <p className="text-slate-200">Fibonacci(10) = 55</p>
                <p className="text-slate-200">Fibonacci(20) = 6765</p>
                <p className="text-slate-500 text-[10px] pt-4">[Process exited with status 0 in 14ms]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-white">Everything You Need to Build & Learn Together</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Engineered for frictionless real-time collaboration and student learning.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Collaboration</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Synchronized typing, live cursors, presence indicators, multi-file management, team chat, and collaborative tasks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">8-in-1 AI Assistant</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Explain, Debug, 1-Click Fix & Apply, Code Generation, Optimization, Test Case Generation, Progressive Hints, and Quality Review.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Secure Sandbox Execution</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Execute JavaScript and Python code inside isolated process workers with memory and CPU resource limits.
            </p>
          </div>
        </div>
      </section>

      {/* Pitch Footer Quote */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">
          “CodeCraft AI is an AI-powered collaborative programming environment designed for students and teams to learn, build, debug, and solve coding problems together in real time.”
        </p>
        <p>© 2026 Apex Innovators. All rights reserved.</p>
      </footer>
    </div>
  );
};
