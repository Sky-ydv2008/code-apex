import React from 'react';
import { ExternalLink, Edit3, Trophy } from 'lucide-react';
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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Connected Platform Profiles</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                LIVE SYNC
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              LeetCode, Codeforces, CodeChef & GeeksforGeeks Developer Ratings & Statistics
            </p>
          </div>
        </div>

        <button
          onClick={onOpenEditModal}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Link Handles</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LeetCode Card */}
        <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 hover:border-amber-400/80 transition group hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-600 text-sm">
                LC
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">LeetCode</h4>
                <p className="text-xs text-slate-500 font-mono">
                  {handles.leetcodeHandle ? `@${handles.leetcodeHandle}` : 'Not Connected'}
                </p>
              </div>
            </div>
            {handles.leetcodeHandle && (
              <a
                href={`https://leetcode.com/${handles.leetcodeHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-amber-600 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {leetcode ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Solved:</span>
                <span className="font-bold font-mono text-amber-600 text-sm">{leetcode.totalSolved}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-center pt-1 font-mono">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 py-1 rounded font-bold">
                  E: {leetcode.easySolved}
                </div>
                <div className="bg-amber-50 border border-amber-200 text-amber-700 py-1 rounded font-bold">
                  M: {leetcode.mediumSolved}
                </div>
                <div className="bg-rose-50 border border-rose-200 text-rose-700 py-1 rounded font-bold">
                  H: {leetcode.hardSolved}
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>Acceptance:</span>
                <span className="font-mono text-slate-700 font-semibold">{leetcode.acceptanceRate}%</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-3">Link handle to sync live LeetCode stats</p>
          )}
        </div>

        {/* Codeforces Card */}
        <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 hover:border-blue-400/80 transition group hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-sm">
                CF
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Codeforces</h4>
                <p className="text-xs text-slate-500 font-mono">
                  {handles.codeforcesHandle ? `@${handles.codeforcesHandle}` : 'Not Connected'}
                </p>
              </div>
            </div>
            {handles.codeforcesHandle && (
              <a
                href={`https://codeforces.com/profile/${handles.codeforcesHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-600 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {codeforces ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Rating:</span>
                <span className="font-bold font-mono text-blue-600 text-sm">
                  {codeforces.rating} <span className="text-[10px] text-slate-400 font-normal">(Max: {codeforces.maxRating})</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Rank:</span>
                <span className="capitalize font-semibold text-blue-700 text-xs">{codeforces.rank}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>Contribution:</span>
                <span className="font-mono text-emerald-600 font-bold">+{codeforces.contribution}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-3">Link handle to sync live Codeforces stats</p>
          )}
        </div>

        {/* CodeChef Card */}
        <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 hover:border-orange-400/80 transition group hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-sm">
                CC
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">CodeChef</h4>
                <p className="text-xs text-slate-500 font-mono">
                  {handles.codechefHandle ? `@${handles.codechefHandle}` : 'Not Connected'}
                </p>
              </div>
            </div>
            {handles.codechefHandle && (
              <a
                href={`https://www.codechef.com/users/${handles.codechefHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-orange-600 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {codechef ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Rating:</span>
                <span className="font-bold font-mono text-orange-600 text-sm flex items-center space-x-1">
                  <span>{codechef.rating}</span>
                  <span className="text-xs text-amber-600 font-bold">{codechef.stars}</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Global Rank:</span>
                <span className="font-mono text-slate-700 font-semibold">#{codechef.globalRank}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>Fully Solved:</span>
                <span className="font-mono text-emerald-600 font-bold">{codechef.problemsSolved}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-3">Link handle to sync live CodeChef stats</p>
          )}
        </div>

        {/* GeeksforGeeks Card */}
        <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 hover:border-emerald-400/80 transition group hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-600 text-sm">
                GFG
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">GeeksforGeeks</h4>
                <p className="text-xs text-slate-500 font-mono">
                  {handles.gfgHandle ? `@${handles.gfgHandle}` : 'Not Connected'}
                </p>
              </div>
            </div>
            {handles.gfgHandle && (
              <a
                href={`https://auth.geeksforgeeks.org/user/${handles.gfgHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-emerald-600 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {gfg ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Coding Score:</span>
                <span className="font-bold font-mono text-emerald-600 text-sm">{gfg.codingScore}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Problems Solved:</span>
                <span className="font-mono text-slate-700 font-semibold">{gfg.totalSolved}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>Monthly Score:</span>
                <span className="font-mono text-indigo-600 font-bold">{gfg.monthlyScore}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-3">Link handle to sync live GFG stats</p>
          )}
        </div>
      </div>
    </div>
  );
};
