import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { users } from '../../../data/mockData';
import { saveUser, saveToken } from '../../../lib/authStorage';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const user = users.find(
      u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
    );
    if (!user) { setError('Invalid email or password.'); return; }
    saveUser(user);
    saveToken('demo-token');
    navigate('/dashboard');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-transparent">

      {/* Dark-mode background */}
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800" />
      <div className="absolute -left-32 -top-32 hidden h-[600px] w-[600px] rounded-full bg-white opacity-[0.03] blur-3xl dark:block" />
      <div className="absolute -bottom-32 -right-32 hidden h-[500px] w-[500px] rounded-full bg-white opacity-[0.04] blur-3xl dark:block" />

      {/* Light-mode soft background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:hidden" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">

        {/* Brand */}
        <Link to="/" className="mb-8 text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
          UniStay+
        </Link>

        {/* Card */}
        <form
          onSubmit={submit}
          className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-2xl dark:backdrop-blur-2xl"
        >
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to continue to your dashboard
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Email address
              </label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                required
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white/30 dark:focus:bg-white/15"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPw ? 'text' : 'password'}
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-400 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white/30 dark:focus:bg-white/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-white"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              Log in
            </button>
          </div>

          <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-neutral-900 transition hover:text-neutral-600 dark:text-white dark:hover:text-neutral-200">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
