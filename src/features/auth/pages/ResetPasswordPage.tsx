import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../authApi';

export default function ResetPasswordPage() {
  const [params]            = useSearchParams();
  const token               = params.get('token') || '';
  const navigate            = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset. Please sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset your password.');
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
          {!token ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                <ShieldAlert size={26} />
              </div>
              <h2 className="mt-5 text-2xl font-black text-neutral-900 dark:text-white">Invalid reset link</h2>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                This link is missing its reset token or has expired. Request a new one.
              </p>
              <Link to="/forgot-password" className="mt-7 inline-block rounded-xl bg-neutral-900 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-neutral-900">
                Request new link
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Set a new password</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Choose a strong password you haven't used before.
              </p>

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    New password
                  </label>
                  <div className="relative">
                    <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type={showPw ? 'text' : 'password'} required className="auth-input pr-12" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    Confirm new password
                  </label>
                  <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" type={showPw ? 'text' : 'password'} required className="auth-input" />
                </div>
                <button type="submit" disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                Remembered it?{' '}
                <Link to="/login" className="font-bold text-neutral-900 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
