import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Flame, Award, Plus, LogIn, LogOut, User as UserIcon, Sparkles, Trophy, Globe, Code } from 'lucide-react';
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
    } catch (err: unknown) {
      setError(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-100 tracking-tight group-hover:text-cyan-400 transition">
              Code<span className="text-cyan-400">Apex</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/dashboard"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition flex items-center space-x-1.5"
            >
              <Code className="w-4 h-4 text-cyan-400" />
              <span>Workspace</span>
            </Link>

            <Link
              to="/contests"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition flex items-center space-x-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Contests</span>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-mono font-bold animate-pulse">
                LIVE
              </span>
            </Link>

            <Link
              to="/challenges"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Challenges</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Join Room</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                <div className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                  <span>{user.streakCount || 1}d</span>
                </div>
                <span className="text-slate-700">|</span>
                <div className="flex items-center space-x-1 text-cyan-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>{user.points || 0} pts</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-slate-200 hover:text-cyan-400 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold max-w-[100px] truncate">
                    {user.name}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
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
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition"
              >
                Demo Account
              </button>

              <Link
                to="/auth"
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition flex items-center space-x-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Join Collaborative Room</h3>
            <p className="text-xs text-slate-400 mb-4">Enter room code to join live coding session</p>

            {error && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                placeholder="Room Code (e.g. APEX01)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-500 uppercase"
              />

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20"
                >
                  {loading ? 'Joining...' : 'Enter Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
