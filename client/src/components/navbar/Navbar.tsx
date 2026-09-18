import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Flame, Award, Plus, LogIn, LogOut, Sparkles, Trophy, Code } from 'lucide-react';
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
      <nav className="h-16 border-b border-stone-200/80 bg-[#FBF9F5]/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 group-hover:bg-indigo-700 transition">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-stone-900 tracking-tight group-hover:text-indigo-600 transition">
              Code<span className="text-indigo-600">Apex</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/dashboard"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-[#F2ECE1] transition flex items-center space-x-1.5"
            >
              <Code className="w-4 h-4 text-indigo-600" />
              <span>Workspace</span>
            </Link>

            <Link
              to="/contests"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-[#F2ECE1] transition flex items-center space-x-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Contests</span>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-mono font-bold animate-pulse">
                LIVE
              </span>
            </Link>

            <Link
              to="/challenges"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-[#F2ECE1] transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Challenges</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#F2ECE1] hover:bg-[#EAE2D3] border border-stone-300/70 text-stone-800 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Join Room</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-xl bg-[#F2ECE1] border border-stone-300/70 text-xs font-mono">
                <div className="flex items-center space-x-1 text-amber-700 font-bold">
                  <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>{user.streakCount || 1}d</span>
                </div>
                <span className="text-stone-300">|</span>
                <div className="flex items-center space-x-1 text-indigo-600 font-bold">
                  <Award className="w-4 h-4" />
                  <span>{user.points || 0} pts</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pl-2 border-l border-stone-200">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-stone-900 hover:text-indigo-600 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold max-w-[100px] truncate text-stone-900">
                    {user.name}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-[#F2ECE1] transition"
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
                className="px-3.5 py-1.5 rounded-xl bg-[#F2ECE1] hover:bg-[#EAE2D3] text-stone-800 text-xs font-semibold border border-stone-300/70 transition"
              >
                Demo Account
              </button>

              <Link
                to="/auth"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-[#FBF9F5] border border-stone-300 rounded-2xl p-6 shadow-xl relative">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Join Collaborative Room</h3>
            <p className="text-xs text-stone-500 mb-4">Enter room code to join live coding session</p>

            {error && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                placeholder="Room Code (e.g. APEX01)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-sm font-mono focus:outline-none focus:border-indigo-600 uppercase"
              />

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F2ECE1] hover:bg-[#EAE2D3] text-stone-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
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
