import React, { useState } from 'react';
import { X, Save, CheckCircle, Globe } from 'lucide-react';

interface EditHandlesModalProps {
  isOpen: boolean;
  initialHandles: {
    leetcodeHandle?: string | null;
    codeforcesHandle?: string | null;
    codechefHandle?: string | null;
    gfgHandle?: string | null;
    bio?: string | null;
  };
  onClose: () => void;
  onSave: (handles: {
    leetcodeHandle: string;
    codeforcesHandle: string;
    codechefHandle: string;
    gfgHandle: string;
    bio: string;
  }) => Promise<void>;
}

export const EditHandlesModal: React.FC<EditHandlesModalProps> = ({
  isOpen,
  initialHandles,
  onClose,
  onSave,
}) => {
  const [leetcode, setLeetcode] = useState(initialHandles.leetcodeHandle || '');
  const [codeforces, setCodeforces] = useState(initialHandles.codeforcesHandle || '');
  const [codechef, setCodechef] = useState(initialHandles.codechefHandle || '');
  const [gfg, setGfg] = useState(initialHandles.gfgHandle || '');
  const [bio, setBio] = useState(initialHandles.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave({
        leetcodeHandle: leetcode,
        codeforcesHandle: codeforces,
        codechefHandle: codechef,
        gfgHandle: gfg,
        bio,
      });
      onClose();
    } catch (err: unknown) {
      setError(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to save handles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-100">Connect Coding Profiles</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              LeetCode Handle
            </label>
            <input
              type="text"
              placeholder="e.g. sky_ydv"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Codeforces Username
            </label>
            <input
              type="text"
              placeholder="e.g. tourist"
              value={codeforces}
              onChange={(e) => setCodeforces(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              CodeChef Username
            </label>
            <input
              type="text"
              placeholder="e.g. sky_code"
              value={codechef}
              onChange={(e) => setCodechef(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              GeeksforGeeks Handle
            </label>
            <input
              type="text"
              placeholder="e.g. sky_apex"
              value={gfg}
              onChange={(e) => setGfg(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Developer Bio / Pitch
            </label>
            <textarea
              rows={2}
              placeholder="Tell others about your coding journey..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold shadow-lg shadow-cyan-600/20 transition flex items-center space-x-2"
            >
              {loading ? (
                <span>Syncing...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profiles</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
