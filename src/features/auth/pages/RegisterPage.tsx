import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { saveUser, saveToken } from '../../../lib/authStorage';
import type { UserRole } from '../../../lib/authStorage';

interface FormState { fullName: string; email: string; phone: string; location: string; role: UserRole; password: string; }
const BLANK: FormState = { fullName: '', email: '', phone: '', location: '', role: 'STUDENT', password: '' };

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
  };

  const inputClass = 'w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white/30 dark:focus:bg-white/15';
  const labelClass = 'block text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-16 dark:bg-transparent">
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800" />
      <div className="absolute -left-32 -top-32 hidden h-[600px] w-[600px] rounded-full bg-white opacity-[0.03] blur-3xl dark:block" />
      <div className="absolute -bottom-32 -right-32 hidden h-[500px] w-[500px] rounded-full bg-white opacity-[0.04] blur-3xl dark:block" />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:hidden" />

      <div className="relative z-10 w-full max-w-2xl">
        <Link to="/" className="mb-8 block text-center text-3xl font-black tracking-tight text-neutral-900 dark:text-white">UniStay+</Link>

        <form onSubmit={submit} className="w-full rounded-2xl border border-neutral-200 bg-white p-10 shadow-xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-2xl dark:backdrop-blur-2xl">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Create your account</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign up as a student, host, or employer.</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full name</label>
              <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your full name" className={inputClass} />
              {errors.fullName && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.fullName}</p>}
            </div>
            <div>
              <label className={labelClass}>Email address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className={inputClass} />
              {errors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.email}</p>}
            </div>
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
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.password}</p>}
            </div>
          </div>

          <button type="submit" className="mt-6 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
            Create account
          </button>

          <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-neutral-900 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-200">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
