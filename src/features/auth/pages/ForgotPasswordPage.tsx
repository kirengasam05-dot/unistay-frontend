import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      // Always show the same confirmation so we don't leak which emails exist.
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send the reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-transparent">
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800" />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:hidden" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        <Link to="/" className="mb-8 text-3xl font-black tracking-tight text-neutral-900 dark:text-white">UniStay+</Link>

        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-2xl dark:backdrop-blur-2xl">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400">
                <MailCheck size={26} />
              </div>
              <h2 className="mt-5 text-2xl font-black text-neutral-900 dark:text-white">Check your inbox</h2>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                If an account exists for <span className="font-bold text-neutral-700 dark:text-neutral-200">{email}</span>, we've sent a link to reset your password.
              </p>
              <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-neutral-900 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-200">
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Forgot password?</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Enter your email and we'll send you a reset link.</p>

              <div className="mt-7 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Email address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" required
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white/30 dark:focus:bg-white/15" />
              </div>

              <button type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Sending…' : 'Send reset link'}
              </button>

              <Link to="/login" className="mt-6 flex items-center justify-center gap-2 border-t border-neutral-200 pt-5 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:border-white/10 dark:text-neutral-400 dark:hover:text-white">
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </form>
          )}
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-xs text-neutral-400">
          <CheckCircle2 size={13} /> Reset links expire for your security.
        </p>
      </div>
    </div>
  );
}
