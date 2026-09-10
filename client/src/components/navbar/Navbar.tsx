import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Flame, Award, Plus, LogIn, LogOut, User as UserIcon, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, logout, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    setError('');

    try {
      if (!user) {
        await loginAsDemo();
      }
      const res = await api.joinRoom(joinCode.trim());
      setShowJoinModal(false);
      navigate(`/room/${res.roomId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              CodeCraft <span className="text-indigo-400 font-mono">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800 text-sm font-medium">
            <Link to="/dashboard" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition">
              Dashboard
            </Link>
            <Link to="/challenges" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Challenges</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700/60 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Join Room</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              {/* Streak Badge */}
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold" title="Daily Coding Streak">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span>{user.streakCount}d</span>
              </div>

              {/* Points Badge */}
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold" title="Total Points">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.points} pts</span>
              </div>

              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-indigo-500/30 bg-slate-800"
                />
                <span className="hidden lg:inline text-xs font-medium text-slate-200">{user.name}</span>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/80 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={loginAsDemo}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Student</span>
              </button>
              <Link
                to="/auth"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center space-x-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <span>Join Coding Room</span>
              </h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Enter 6-Digit Room Code</label>
                <input
                  type="text"
                  placeholder="e.g. APEX01"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-center tracking-widest font-mono text-lg uppercase focus:outline-none focus:border-indigo-500"
                  maxLength={10}
                  required
                />
              </div>

              {error && <p className="text-xs text-rose-400 font-medium text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {loading ? 'Joining Room...' : 'Enter Workspace'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
