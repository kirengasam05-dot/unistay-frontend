<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { saveUser, saveToken } from '../../../lib/authStorage';
import type { UserRole } from '../../../lib/authStorage';

interface FormState { fullName: string; email: string; phone: string; location: string; role: UserRole; password: string; }
const BLANK: FormState = { fullName: '', email: '', phone: '', location: '', role: 'STUDENT', password: '' };
<<<<<<< HEAD

export default function RegisterPage() {
  const [form, setForm]     = useState<FormState>(BLANK);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const navigate            = useNavigate();

  function set(key: keyof FormState, value: string) { setForm(f => ({ ...f, [key]: value })); setErrors(e => ({ ...e, [key]: undefined })); }

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.fullName.trim())  e.fullName = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveUser({ id: crypto.randomUUID(), fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), location: form.location.trim(), role: form.role, password: form.password });
    saveToken('demo-token');
    navigate('/dashboard');
=======
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { saveUser, saveToken } from "../../../lib/authStorage";
import type { AuthUser } from "../../../lib/authStorage";
import { useTheme } from "../../../lib/themeContext";
=======
>>>>>>> afb76de (feat: enhance host dashboard and booking management)

export default function RegisterPage() {
  const [form, setForm]     = useState<FormState>(BLANK);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const navigate            = useNavigate();

  function set(key: keyof FormState, value: string) { setForm(f => ({ ...f, [key]: value })); setErrors(e => ({ ...e, [key]: undefined })); }

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.fullName.trim())  e.fullName = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    setError("");
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      fullName,
      email,
      phone,
      location,
      role,
    };
    saveUser(newUser);
    saveToken("demo-token");
    navigate("/dashboard");
>>>>>>> 2c4e1f1 (feat: enhance user experience across multiple pages)
=======
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveUser({ id: crypto.randomUUID(), fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), location: form.location.trim(), role: form.role, password: form.password });
    saveToken('demo-token');
    navigate('/dashboard');
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
  };

  const inputClass = 'w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white/30 dark:focus:bg-white/15';
  const labelClass = 'block text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5';

  return (
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-16 dark:bg-transparent">
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800" />
      <div className="absolute -left-32 -top-32 hidden h-[600px] w-[600px] rounded-full bg-white opacity-[0.03] blur-3xl dark:block" />
      <div className="absolute -bottom-32 -right-32 hidden h-[500px] w-[500px] rounded-full bg-white opacity-[0.04] blur-3xl dark:block" />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:hidden" />
<<<<<<< HEAD

      <div className="relative z-10 w-full max-w-2xl">
        <Link to="/" className="mb-8 block text-center text-3xl font-black tracking-tight text-neutral-900 dark:text-white">UniStay+</Link>

        <form onSubmit={submit} className="w-full rounded-2xl border border-neutral-200 bg-white p-10 shadow-xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-2xl dark:backdrop-blur-2xl">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Create your account</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign up as a student, host, or employer.</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div>
=======
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden py-12 transition-colors duration-300 ${isDark ? "" : "bg-neutral-50"}`}>
=======
>>>>>>> afb76de (feat: enhance host dashboard and booking management)

      <div className="relative z-10 w-full max-w-2xl">
        <Link to="/" className="mb-8 block text-center text-3xl font-black tracking-tight text-neutral-900 dark:text-white">UniStay+</Link>

        <form onSubmit={submit} className="w-full rounded-2xl border border-neutral-200 bg-white p-10 shadow-xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-2xl dark:backdrop-blur-2xl">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Create your account</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign up as a student, host, or employer.</p>

<<<<<<< HEAD
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

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        <Link
          to="/"
          className={`mb-8 text-3xl font-black tracking-tight transition ${isDark ? "text-white" : "text-neutral-900"}`}
        >
          UniStay+
        </Link>

        <form
          onSubmit={submit}
          className={`w-full rounded-3xl p-8 shadow-2xl transition-all ${
            isDark
              ? "border border-white/10 bg-white/[0.07] backdrop-blur-2xl"
              : "border border-neutral-200 bg-white"
          }`}
        >
          <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-neutral-900"}`}>
            Create an account
          </h2>
          <p className={`mt-1 text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Open to students and hosts only
          </p>

          {error && (
            <div className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
              isDark
                ? "border border-red-400/20 bg-red-500/10 text-red-400"
                : "border border-red-200 bg-red-50 text-red-600"
            }`}>
              {error}
            </div>
          )}

          <div className="mt-7 space-y-4">
            <div className="space-y-1.5">
>>>>>>> 2c4e1f1 (feat: enhance user experience across multiple pages)
=======
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div>
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
              <label className={labelClass}>Full name</label>
              <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your full name" className={inputClass} />
              {errors.fullName && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.fullName}</p>}
            </div>
<<<<<<< HEAD
<<<<<<< HEAD
            <div>
=======

            <div className="space-y-1.5">
>>>>>>> 2c4e1f1 (feat: enhance user experience across multiple pages)
=======
            <div>
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
              <label className={labelClass}>Email address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className={inputClass} />
              {errors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.email}</p>}
            </div>
<<<<<<< HEAD
<<<<<<< HEAD
            <div>
              <label className={labelClass}>Phone number</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+250 7XX XXX XXX" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>I am a</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} className={inputClass}>
                <option value="STUDENT">Student</option>
                <option value="HOST">Host</option>
                <option value="EMPLOYER">Employer</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
=======

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 ..." className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" className={inputClass} />
              </div>
=======
            <div>
              <label className={labelClass}>Phone number</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+250 7XX XXX XXX" className={inputClass} />
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>I am a</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} className={inputClass}>
                <option value="STUDENT">Student</option>
                <option value="HOST">Host</option>
                <option value="EMPLOYER">Employer</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
<<<<<<< HEAD
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold transition ${
                    isDark ? "text-neutral-500 hover:text-white" : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {showPassword ? "Hide" : "Show"}
>>>>>>> 2c4e1f1 (feat: enhance user experience across multiple pages)
=======
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.password}</p>}
            </div>
          </div>

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
          <button type="submit" className="mt-6 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
            Create account
          </button>

          <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-neutral-900 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-200">Sign in</Link>
<<<<<<< HEAD
=======
          <div className={`mt-6 border-t pt-5 text-center text-sm ${isDark ? "border-white/10 text-neutral-400" : "border-neutral-100 text-neutral-500"}`}>
            Already have an account?{" "}
            <Link
              to="/login"
              className={`font-bold transition ${isDark ? "text-white hover:text-neutral-200" : "text-neutral-900 hover:underline"}`}
            >
              Log in
            </Link>
>>>>>>> 2c4e1f1 (feat: enhance user experience across multiple pages)
=======
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
          </div>
        </form>
      </div>
    </div>
  );
}
