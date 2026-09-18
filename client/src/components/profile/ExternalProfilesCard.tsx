import React from 'react';
import { ExternalLink, Edit3, Award, Trophy, Code2, Flame, Star, CheckCircle2 } from 'lucide-react';
import { CombinedProfileStats } from '../../types';

interface ExternalProfilesCardProps {
  stats: CombinedProfileStats | null;
  handles: {
    leetcodeHandle?: string | null;
    codeforcesHandle?: string | null;
    codechefHandle?: string | null;
    gfgHandle?: string | null;
  };
  onOpenEditModal: () => void;
}

export const ExternalProfilesCard: React.FC<ExternalProfilesCardProps> = ({
  stats,
  handles,
  onOpenEditModal,
}) => {
  const { leetcode, codeforces, codechef, gfg } = stats || {};

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>Connected Coding Platforms</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                LIVE STATS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              LeetCode, Codeforces, CodeChef & GeeksforGeeks Unified Developer Showcase
            </p>
          </div>
        </div>

        <button
          onClick={onOpenEditModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Link Handles</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LeetCode Card */}
        <div className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-4 hover:border-amber-500/40 transition group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
                LC
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">LeetCode</h4>
                <p className="text-xs text-slate-400 font-mono">
                  {handles.leetcodeHandle ? `@${handles.leetcodeHandle}` : 'Not Connected'}
                </p>
              </div>
            </div>
            {handles.leetcodeHandle && (
              <a
                href={`https://leetcode.com/${handles.leetcodeHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-amber-400 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {leetcode ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Solved:</span>
                <span className="font-bold font-mono text-amber-400 text-sm">{leetcode.totalSolved}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-center pt-1 font-mono">
                <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 py-1 rounded">
                  E: {leetcode.easySolved}
                </div>
                <div className="bg-amber-950/80 border border-amber-800 text-amber-300 py-1 rounded">
                  M: {leetcode.mediumSolved}
                </div>
                <div className="bg-rose-950/80 border border-rose-800 text-rose-300 py-1 rounded">
                  H: {leetcode.hardSolved}
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Acceptance:</span>
                <span className="font-mono text-slate-200">{leetcode.acceptanceRate}%</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-3">Add handle to sync live LeetCode stats</p>
          )}
        </div>

        {/* Codeforces Card */}
        <div className="bg-slate-950/80 border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                CF
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Codeforces</h4>
                <p className="text-xs text-slate-400 font-mono">
                  {handles.codeforcesHandle ? `@${handles.codeforcesHandle}` : 'Not Connected'}
                </p>
              </div>
            </div>
            {handles.codeforcesHandle && (
              <a
                href={`https://codeforces.com/profile/${handles.codeforcesHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-400 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {codeforces ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Rating:</span>
                <span className="font-bold font-mono text-blue-400 text-sm">
                  {codeforces.rating} <span className="text-[10px] text-slate-400">(Max: {codeforces.maxRating})</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Rank:</span>
                <span className="capitalize font-semibold text-cyan-300 text-xs">{codeforces.rank}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Contribution:</span>
                <span className="font-mono text-emerald-400">+{codeforces.contribution}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-3">Add handle to sync live Codeforces stats</p>
          )}
        </div>

        {/* CodeChef Card */}
        <div className="bg-slate-950/80 border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-sm">
                CC
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">CodeChef</h4>
                <p className="text-xs text-slate-400 font-mono">
                  {handles.codechefHandle ? `@${handles.codechefHandle}` : 'Not Connected'}
                </p>
              </div>
            </div>
            {handles.codechefHandle && (
              <a
                href={`https://www.codechef.com/users/${handles.codechefHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-orange-400 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {codechef ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Rating:</span>
                <span className="font-bold font-mono text-orange-400 text-sm flex items-center space-x-1">
                  <span>{codechef.rating}</span>
                  <span className="text-xs text-amber-300 font-bold">{codechef.stars}</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Global Rank:</span>
                <span className="font-mono text-slate-300">#{codechef.globalRank}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Fully Solved:</span>
                <span className="font-mono text-emerald-400">{codechef.problemsSolved}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-3">Add handle to sync live CodeChef stats</p>
          )}
        </div>

        {/* GeeksforGeeks Card */}
        <div className="bg-slate-950/80 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
                GFG
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">GeeksforGeeks</h4>
                <p className="text-xs text-slate-400 font-mono">
                  {handles.gfgHandle ? `@${handles.gfgHandle}` : 'Not Connected'}
                </p>
              </div>
            </div>
            {handles.gfgHandle && (
              <a
                href={`https://auth.geeksforgeeks.org/user/${handles.gfgHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-emerald-400 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {gfg ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Coding Score:</span>
                <span className="font-bold font-mono text-emerald-400 text-sm">{gfg.codingScore}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Problems Solved:</span>
                <span className="font-mono text-slate-300">{gfg.totalSolved}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Monthly Score:</span>
                <span className="font-mono text-cyan-400">{gfg.monthlyScore}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-3">Add handle to sync live GFG stats</p>
          )}
        </div>
      </div>
    </div>
  );
};
