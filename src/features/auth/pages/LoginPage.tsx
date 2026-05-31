import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();
  const location              = useLocation();
  const { login }             = useAuth();

  const from = (location.state as { from?: string } | null)?.from || '/dashboard';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email: email.trim(), password });
      toast.success(`Welcome back${user.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid email or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 block text-center text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
          UniStay+
        </Link>

        <div className="auth-card">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign in to continue to your dashboard</p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-7 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Email address
              </label>
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" type="email" required
                className="auth-input"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" type={showPw ? 'text' : 'password'} required
                  className="auth-input pr-12"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-neutral-900 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
