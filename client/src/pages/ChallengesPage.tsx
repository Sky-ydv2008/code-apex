import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Challenge, LeaderboardUser } from '../types';
import { Trophy, Award, Flame, Code } from 'lucide-react';

export const ChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cRes = await api.getChallenges(difficultyFilter !== 'ALL' ? difficultyFilter : undefined);
        setChallenges(cRes.challenges);

        const lRes = await api.getLeaderboard();
        setLeaderboard(lRes.leaderboard);
      } catch (err) {
        console.error('Failed to load challenges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [difficultyFilter]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 text-white shadow-md space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-white text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5 text-amber-300" />
          <span>CodeApex Learning & Rank Hub</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Coding Challenges & Leaderboard</h1>
        <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
          Solve algorithmic problems, run automated test suites, earn points, maintain daily streaks, and request progressive AI hints!
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 pt-4">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'challenges'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'bg-indigo-800/60 text-indigo-100 hover:bg-indigo-800'
            }`}
          >
            <Code className="w-4 h-4 text-indigo-600" />
            <span>All Challenges</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'leaderboard'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'bg-indigo-800/60 text-indigo-100 hover:bg-indigo-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Global Leaderboard</span>
          </button>
        </div>
      </div>

      {activeTab === 'challenges' ? (
        <div className="space-y-6">
          {/* Difficulty Filter Bar */}
          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-xs w-fit">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  difficultyFilter === diff
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {challenges.map((c) => {
              const diffColor =
                c.difficulty === 'EASY'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : c.difficulty === 'MEDIUM'
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200';

              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/challenges/${c.slug}`)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition cursor-pointer space-y-4 group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${diffColor}`}>
                      {c.difficulty}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>+{c.points} pts</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-base">
                      {c.title}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono mt-1 block">{c.category}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {c._count?.submissions || 0} Submissions
                    </span>
                    <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition flex items-center space-x-1">
                      <span>Solve Challenge</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Leaderboard Table */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Top Developers & Apex Students</span>
          </h2>

          <div className="space-y-2">
            {leaderboard.map((user, idx) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${
                      idx === 0
                        ? 'bg-amber-500 text-white'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-900'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white"
                  />

                  <div>
                    <span className="font-bold text-slate-900 block">{user.name}</span>
                    <span className="text-[11px] text-slate-500">{user._count?.submissions || 0} solved</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-amber-600 font-bold text-xs">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{user.streakCount}d Streak</span>
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
                    {user.points} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
