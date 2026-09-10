import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Room } from '../types';
import {
  Plus,
  Code2,
  Globe,
  Users,
  Flame,
  Award,
  ArrowRight,
  Sparkles,
  Search,
  Lock,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Room Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      if (user) {
        const myRes = await api.getUserRooms();
        setMyRooms(myRes.rooms);
      }
      const pubRes = await api.getPublicRooms();
      setPublicRooms(pubRes.rooms);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [user?.id]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreating(true);

    try {
      const res = await api.createRoom(roomName.trim(), description.trim(), language, isPublic);
      setShowCreateModal(false);
      navigate(`/room/${res.room.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-indigo-400">{user?.name || 'Developer'}</span>! 👋
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Collaborate in coding rooms, execute code safely, or solve AI-assisted challenges.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Room</span>
          </button>
        </div>
      </div>

      {/* User Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Daily Streak</span>
            <p className="text-lg font-bold text-white">{user?.streakCount || 1} Days 🔥</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Points</span>
            <p className="text-lg font-bold text-white">{user?.points || 0} pts</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">My Rooms</span>
            <p className="text-lg font-bold text-white">{myRooms.length} Active</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Public Hubs</span>
            <p className="text-lg font-bold text-white">{publicRooms.length} Available</p>
          </div>
        </div>
      </div>

      {/* My Joined / Owned Coding Rooms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span>My Active Rooms</span>
          </h2>
        </div>

        {myRooms.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
            <p className="text-xs text-slate-400">You are not a member of any coding room yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
            >
              Create Your First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate(`/room/${room.id}`)}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600/10 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                    {room.roomCode}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">{room.language}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 group-hover:text-indigo-300 transition text-base">
                    {room.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {room.description || 'Collaborative coding room'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room._count?.members || 1} Members</span>
                  </span>
                  <span className="text-indigo-400 font-semibold flex items-center space-x-1">
                    <span>Enter Room</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public Rooms Discovery */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <span>Public Coding Hubs</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {publicRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => navigate(`/room/${room.id}`)}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 transition cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-600/10 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  {room.roomCode}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-mono">{room.language}</span>
              </div>

              <div>
                <h3 className="font-bold text-slate-100 group-hover:text-cyan-300 transition text-base">
                  {room.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {room.description || 'Public programming space'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{room._count?.members || 1} Members</span>
                </span>
                <span className="text-cyan-400 font-semibold flex items-center space-x-1">
                  <span>Join Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Create Coding Room</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Room Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Algorithm Practice"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description of this room's goal"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="typescript">TypeScript</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Privacy</label>
                  <select
                    value={isPublic ? 'public' : 'private'}
                    onChange={(e) => setIsPublic(e.target.value === 'public')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Launch Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
