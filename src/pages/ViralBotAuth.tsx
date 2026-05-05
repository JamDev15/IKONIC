import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { signUp, login } from '../lib/viralbot-auth';

export default function ViralBotAuth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const switchTab = (t: 'signup' | 'login') => { setTab(t); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (tab === 'signup') {
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirm) { setError('Passwords do not match'); return; }
        signUp(name, email, password);
      } else {
        login(email, password);
      }
      navigate('/viral-bot/app');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative bg-charcoal min-h-screen">
      <Navigation />

      <div className="min-h-screen bg-black flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-4">
              <Zap className="w-3.5 h-3.5" />
              ViralBot
            </div>
            <h1 className="text-2xl font-bold text-white">
              {tab === 'signup' ? 'Start your free trial' : 'Welcome back'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {tab === 'signup' ? '3 days free — no credit card required' : 'Sign in to your ViralBot account'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            {/* Tabs */}
            <div className="flex bg-zinc-800 rounded-lg p-1 mb-6">
              {(['signup', 'login'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === t ? 'bg-zinc-700 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {t === 'signup' ? 'Sign Up' : 'Log In'}
                </button>
              ))}
            </div>

            {/* Trial badge */}
            {tab === 'signup' && (
              <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 rounded-lg px-3 py-2.5 mb-5">
                <Zap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <p className="text-xs text-purple-300">3-day free trial — full access, cancel anytime</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Full Name</label>
                  <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Carter"
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-gray-400 block mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {tab === 'signup' && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Confirm Password</label>
                  <input
                    required
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
                  />
                </div>
              )}

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {tab === 'signup' ? 'Start Free Trial' : 'Log In'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-5">
              {tab === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => switchTab(tab === 'signup' ? 'login' : 'signup')}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {tab === 'signup' ? 'Log in' : 'Sign up free'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
