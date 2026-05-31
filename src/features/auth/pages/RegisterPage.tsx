import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import type { UserRole } from '../../../lib/authStorage';

interface FormState { fullName: string; email: string; phone: string; location: string; role: UserRole; password: string; }
const BLANK: FormState = { fullName: '', email: '', phone: '', location: '', role: 'STUDENT', password: '' };

export default function RegisterPage() {
  const [form, setForm]       = useState<FormState>(BLANK);
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();
  const { register }          = useAuth();

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim())  e.fullName = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        location: form.location.trim() || undefined,
        role: form.role,
      });
      toast.success('Account created. Welcome to UniStay+!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  const label = 'block text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5';

  return (
    <div className="auth-page">
      <div className="w-full max-w-2xl">
        <Link to="/" className="mb-8 block text-center text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
          UniStay+
        </Link>

        <div className="auth-card">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Create your account</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign up as a student, host, or employer.</p>

          <form onSubmit={submit} className="mt-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Full name</label>
                <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your full name" className="auth-input" />
                {errors.fullName && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.fullName}</p>}
              </div>
              <div>
                <label className={label}>Email address</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className="auth-input" />
                {errors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.email}</p>}
              </div>
              <div>
                <label className={label}>Phone number</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+250 7XX XXX XXX" className="auth-input" />
              </div>
              <div>
                <label className={label}>Location</label>
                <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" className="auth-input" />
              </div>
              <div>
                <label className={label}>I am a</label>
                <select value={form.role} onChange={e => set('role', e.target.value)} className="auth-input">
                  <option value="STUDENT">Student</option>
                  <option value="HOST">Host</option>
                  <option value="EMPLOYER">Employer</option>
                </select>
              </div>
              <div>
                <label className={label}>Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" className="auth-input pr-12" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.password}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-neutral-900 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
