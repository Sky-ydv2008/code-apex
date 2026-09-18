import React, { useState } from 'react';
import { X, Save, Globe } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Connect Coding Profiles</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              LeetCode Handle
            </label>
            <input
              type="text"
              placeholder="e.g. sky_ydv"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Codeforces Username
            </label>
            <input
              type="text"
              placeholder="e.g. tourist"
              value={codeforces}
              onChange={(e) => setCodeforces(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              CodeChef Username
            </label>
            <input
              type="text"
              placeholder="e.g. sky_code"
              value={codechef}
              onChange={(e) => setCodechef(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-orange-500 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              GeeksforGeeks Handle
            </label>
            <input
              type="text"
              placeholder="e.g. sky_apex"
              value={gfg}
              onChange={(e) => setGfg(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Developer Bio / Pitch
            </label>
            <textarea
              rows={2}
              placeholder="Tell others about your coding journey..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm transition flex items-center space-x-2"
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
