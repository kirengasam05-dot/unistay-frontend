import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '../authApi';
import { saveUser, saveToken } from '../../../lib/authStorage';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
<<<<<<< HEAD
    setError('');
<<<<<<< Updated upstream
    const user = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password);
    if (!user) { setError('Invalid email or password.'); return; }
=======
    setError("");
    const user = users.find(
      (u) =>
        u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        u.password === password
    );
    if (!user) {
      setError("Invalid email or password.");
      return;
    }
>>>>>>> 2c4e1f1 (feat: enhance user experience across multiple pages)
=======
    setError('');
    const user = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password);
    if (!user) { setError('Invalid email or password.'); return; }
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
    saveUser(user);
    saveToken('demo-token');
    navigate('/dashboard');
=======
    setLoading(true);
    try {
      const { token, user } = await authApi.login({ email: email.trim(), password });
      saveUser(user);
      saveToken(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
>>>>>>> Stashed changes
  };

  return (
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-transparent">
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800" />
      <div className="absolute -left-32 -top-32 hidden h-[600px] w-[600px] rounded-full bg-white opacity-[0.03] blur-3xl dark:block" />
      <div className="absolute -bottom-32 -right-32 hidden h-[500px] w-[500px] rounded-full bg-white opacity-[0.04] blur-3xl dark:block" />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:hidden" />
<<<<<<< HEAD

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        <Link to="/" className="mb-8 text-3xl font-black tracking-tight text-neutral-900 dark:text-white">UniStay+</Link>

        <form onSubmit={submit} className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-2xl dark:backdrop-blur-2xl">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign in to continue to your dashboard</p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>
=======
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden transition-colors duration-300 ${isDark ? "" : "bg-neutral-50"}`}>

      {/* light mode background */}
      {!isDark && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white via-neutral-50 to-neutral-100" />
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-neutral-200 opacity-60 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-neutral-300 opacity-40 blur-3xl" />
        </>
      )}

      {/* dark mode background */}
      {isDark && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800" />
          <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-white opacity-[0.03] blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-white opacity-[0.04] blur-3xl" />
          <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-neutral-600 opacity-20 blur-[80px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </>
      )}

      {/* theme toggle */}
      <button
        onClick={toggle}
        className={`absolute right-6 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition ${
          isDark
            ? "border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
        }`}
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
=======
>>>>>>> afb76de (feat: enhance host dashboard and booking management)

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        <Link to="/" className="mb-8 text-3xl font-black tracking-tight text-neutral-900 dark:text-white">UniStay+</Link>

        <form onSubmit={submit} className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-2xl dark:backdrop-blur-2xl">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign in to continue to your dashboard</p>

          {error && (
<<<<<<< HEAD
            <div className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
              isDark
                ? "border border-red-400/20 bg-red-500/10 text-red-400"
                : "border border-red-200 bg-red-50 text-red-600"
            }`}>
              {error}
            </div>
>>>>>>> 2c4e1f1 (feat: enhance user experience across multiple pages)
=======
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
          )}

          <div className="mt-7 space-y-4">
            <div className="space-y-1.5">
<<<<<<< HEAD
<<<<<<< HEAD
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Email address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" required
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white/30 dark:focus:bg-white/15" />
=======
              <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Email address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                required
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                  isDark
                    ? "border-white/10 bg-white/10 text-white placeholder-neutral-500 focus:border-white/30 focus:bg-white/15"
                    : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white"
                }`}
              />
>>>>>>> 2c4e1f1 (feat: enhance user experience across multiple pages)
            </div>
            <div className="space-y-1.5">
<<<<<<< HEAD
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Password</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type={showPw ? 'text' : 'password'} required
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white/30 dark:focus:bg-white/15" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
<<<<<<< Updated upstream
            <button type="submit" className="mt-2 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
=======
              <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Password
              </label>
=======
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Email address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" required
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white/30 dark:focus:bg-white/15" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Password</label>
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type={showPw ? 'text' : 'password'} required
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white/30 dark:focus:bg-white/15" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
<<<<<<< HEAD

            <button
              type="submit"
              className={`mt-2 w-full rounded-xl py-3.5 text-sm font-black transition active:scale-[0.98] ${
                isDark
                  ? "bg-white text-neutral-900 hover:bg-neutral-100"
                  : "bg-neutral-900 text-white hover:bg-neutral-700"
              }`}
            >
>>>>>>> 2c4e1f1 (feat: enhance user experience across multiple pages)
=======
            <button type="submit" className="mt-2 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
              Log in
=======
            <button type="submit" disabled={loading} className="mt-2 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Log in'}
>>>>>>> Stashed changes
            </button>
          </div>

<<<<<<< HEAD
<<<<<<< HEAD
          <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-neutral-900 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-200">Create account</Link>
=======
          <div className={`mt-6 border-t pt-5 text-center text-sm ${isDark ? "border-white/10 text-neutral-400" : "border-neutral-100 text-neutral-500"}`}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className={`font-bold transition ${isDark ? "text-white hover:text-neutral-200" : "text-neutral-900 hover:underline"}`}
            >
              Create account
            </Link>
>>>>>>> 2c4e1f1 (feat: enhance user experience across multiple pages)
=======
          <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-neutral-900 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-200">Create account</Link>
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
          </div>
        </form>
      </div>
    </div>
  );
}
