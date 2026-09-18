import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Room, CombinedProfileStats } from '../types';
import {
  Plus,
  Code2,
  Globe,
  ArrowRight,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ExternalProfilesCard } from '../components/profile/ExternalProfilesCard';
import { EditHandlesModal } from '../components/profile/EditHandlesModal';

export const DashboardPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // External Platform Stats state
  const [externalStats, setExternalStats] = useState<CombinedProfileStats | null>(null);
  const [showEditHandlesModal, setShowEditHandlesModal] = useState(false);

  // Create Room Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchRoomsAndStats = async () => {
    setLoading(true);
    try {
      const [myRes, pubRes] = await Promise.all([
        user ? api.getUserRooms() : Promise.resolve({ rooms: [] }),
        api.getPublicRooms(),
      ]);
      setMyRooms(myRes.rooms);
      setPublicRooms(pubRes.rooms);

      if (user) {
        try {
          const profileData = await api.getMyExternalProfile();
          setExternalStats(profileData.stats);
        } catch {
          // ignore profile fetch errors
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndStats();
  }, [user?.id]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreating(true);

    try {
      const res = await api.createRoom(roomName.trim(), description.trim(), language, isPublic);
      setShowCreateModal(false);
      setRoomName('');
      setDescription('');
      navigate(`/room/${res.room.id}`);
    } catch (err: unknown) {
      alert(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveHandles = async (handles: {
    leetcodeHandle: string;
    codeforcesHandle: string;
    codechefHandle: string;
    gfgHandle: string;
    bio: string;
  }) => {
    const res = await api.updateExternalHandles(handles);
    setExternalStats(res.stats);
    if (setUser) {
      setUser(res.user);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FBF9F5] p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-white text-xs font-mono font-medium border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>CODEAPEX DEVELOPER WORKSPACE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Welcome back, <span>{user?.name || 'Developer'}</span>! 👋
            </h1>
            <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
              Collaborate in real time, run code in 40+ languages, join proctored contest arenas, and showcase connected LeetCode & Codeforces statistics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-stone-100 text-indigo-800 font-bold text-sm shadow-md transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Create New Room</span>
            </button>

            <Link
              to="/contests"
              className="px-5 py-3 rounded-2xl bg-indigo-900/80 hover:bg-indigo-900 text-amber-300 font-bold text-sm transition flex items-center space-x-2 border border-indigo-500/40"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Contest Arena</span>
            </Link>
          </div>
        </div>
      </div>

      {/* External Platforms Profile Live Showcase */}
      {user && (
        <ExternalProfilesCard
          stats={externalStats}
          handles={{
            leetcodeHandle: user.leetcodeHandle,
            codeforcesHandle: user.codeforcesHandle,
            codechefHandle: user.codechefHandle,
            gfgHandle: user.gfgHandle,
          }}
          onOpenEditModal={() => setShowEditHandlesModal(true)}
        />
      )}

      {/* Edit Handles Modal */}
      {showEditHandlesModal && user && (
        <EditHandlesModal
          isOpen={showEditHandlesModal}
          initialHandles={{
            leetcodeHandle: user.leetcodeHandle,
            codeforcesHandle: user.codeforcesHandle,
            codechefHandle: user.codechefHandle,
            gfgHandle: user.gfgHandle,
            bio: user.bio,
          }}
          onClose={() => setShowEditHandlesModal(false)}
          onSave={handleSaveHandles}
        />
      )}

      {/* Rooms Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Collaborative Rooms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <span>My Active Rooms</span>
            </h3>
            <span className="text-xs font-mono text-stone-500 font-semibold">{myRooms.length} Active</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-stone-400 animate-pulse">Loading rooms...</div>
          ) : myRooms.length === 0 ? (
            <div className="p-8 text-center bg-white border border-stone-200/80 rounded-2xl shadow-xs">
              <p className="text-sm text-stone-500">You have no active rooms yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
              >
                + Create your first room
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigate(`/room/${room.id}`)}
                  className="p-4 bg-white border border-stone-200/80 hover:border-indigo-300 rounded-2xl transition cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-stone-900 group-hover:text-indigo-600 transition">
                        {room.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2ECE1] text-stone-700 font-mono font-semibold">
                        {room.language}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 font-mono">Code: {room.roomCode}</p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Public Rooms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span>Public Coding Hubs</span>
            </h3>
            <span className="text-xs font-mono text-stone-500 font-semibold">{publicRooms.length} Hubs</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-stone-400 animate-pulse">Loading hub rooms...</div>
          ) : (
            <div className="space-y-3">
              {publicRooms.slice(0, 5).map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigate(`/room/${room.id}`)}
                  className="p-4 bg-white border border-stone-200/80 hover:border-purple-300 rounded-2xl transition cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-stone-900 group-hover:text-purple-600 transition">
                        {room.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2ECE1] text-stone-700 font-mono font-semibold">
                        {room.language}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-1">{room.description || 'Public collaborative workspace'}</p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-[#FBF9F5] border border-stone-300 rounded-3xl p-6 shadow-xl relative">
            <h3 className="text-xl font-bold text-stone-900 mb-4">Create Collaborative Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Algo Studio"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your session project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none focus:border-indigo-600 font-mono"
                >
                  <option value="javascript">JavaScript (Node.js)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ 20</option>
                  <option value="java">Java 17</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F2ECE1] hover:bg-[#EAE2D3] text-stone-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm"
                >
                  {creating ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
