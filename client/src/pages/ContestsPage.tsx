import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ShieldAlert, Plus, Users, Clock, ArrowRight, Search } from 'lucide-react';
import { api } from '../services/api';
import { Contest } from '../types';

export const ContestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'UPCOMING' | 'PAST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating contest
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRules, setNewRules] = useState('Tab switching triggers anti-cheat strikes. Fullscreen mode required.');
  const [newDuration, setNewDuration] = useState(60);
  const [antiCheat, setAntiCheat] = useState(true);
  const [maxStrikes, setMaxStrikes] = useState(3);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const data = await api.getContests();
      setContests(data.contests);
    } catch (err) {
      console.error('Failed to load contests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + newDuration * 60000).toISOString();

    try {
      const data = await api.createContest({
        title: newTitle,
        description: newDesc,
        rules: newRules,
        startTime,
        endTime,
        durationMinutes: Number(newDuration),
        antiCheatEnabled: antiCheat,
        maxStrikes: Number(maxStrikes),
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      navigate(`/contests/${data.contest.slug}`);
    } catch (err: unknown) {
      alert(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to create contest');
    } finally {
      setCreating(false);
    }
  };

  const getContestStatus = (contest: Contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now >= start && now <= end) return 'LIVE';
    if (now < start) return 'UPCOMING';
    return 'PAST';
  };

  const filteredContests = contests.filter((c) => {
    const status = getContestStatus(c);
    const matchesFilter = filter === 'ALL' || status === filter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono font-bold">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>CODEAPEX CONTEST ARENA</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tight">
              Competitive Coding Contests
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base">
              Compete in real-time programming tournaments with multi-language execution and tab-switching proctoring anti-cheat technology.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition flex items-center space-x-2 border border-cyan-400/20 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Host Contest</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-full md:w-auto">
          {(['ALL', 'LIVE', 'UPCOMING', 'PAST'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === tab
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab === 'LIVE' && <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1.5" />}
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search contests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Contest Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 animate-pulse">Loading Contests...</div>
      ) : filteredContests.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No Contests Found</h3>
          <p className="text-xs text-slate-500 mt-1">Host your own contest or try clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => {
            const status = getContestStatus(contest);
            return (
              <div
                key={contest.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition flex flex-col justify-between group shadow-xl relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider ${
                        status === 'LIVE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                          : status === 'UPCOMING'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {status === 'LIVE' ? '🔴 LIVE NOW' : status}
                    </span>

                    {contest.antiCheatEnabled && (
                      <span className="flex items-center space-x-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/80">
                        <ShieldAlert className="w-3 h-3 text-cyan-400" />
                        <span>PROCTORED</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition mb-2">
                    {contest.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {contest.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{contest.durationMinutes} mins</span>
                    </div>
                    <div className="flex items-center space-x-1.5 justify-end">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{contest._count?.participants || 0} Registered</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/contests/${contest.slug}`)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center space-x-2 group-hover:shadow-lg group-hover:shadow-cyan-600/20"
                  >
                    <span>Enter Contest Arena</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Host Contest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Create New Coding Contest</h3>
            <form onSubmit={handleCreateContest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contest Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Speedrun Championship"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the contest goals and problem categories..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Strikes</label>
                  <input
                    type="number"
                    value={maxStrikes}
                    onChange={(e) => setMaxStrikes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="antiCheatToggle"
                  checked={antiCheat}
                  onChange={(e) => setAntiCheat(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                />
                <label htmlFor="antiCheatToggle" className="text-xs text-slate-300 font-medium">
                  Enable Proctor Anti-Cheat (Strict Tab Switching Enforcement)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/20"
                >
                  {creating ? 'Creating...' : 'Launch Contest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
