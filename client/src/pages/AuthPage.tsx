import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, LogIn, UserPlus, Sparkles } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Code2 className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isLogin ? 'Welcome Back to CodeCraft' : 'Join CodeCraft AI'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLogin ? 'Log in to access your rooms and challenges' : 'Create an account to save projects and track streaks'}
          </p>
        </div>

        {/* Quick Demo Shortcut */}
        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Login as Demo Apex Student</span>
        </button>

        <div className="flex items-center space-x-2 text-slate-600">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] font-bold uppercase">or email</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Apex Student"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="student@codecraft.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {error && <p className="text-xs text-rose-400 font-medium text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-slate-400 hover:text-indigo-400 transition"
          >
            {isLogin ? "Don't have an account? Register here" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
