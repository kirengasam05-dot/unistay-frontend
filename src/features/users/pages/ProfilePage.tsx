import { useState, useRef } from 'react';
import { Camera, CheckCircle2, Eye, EyeOff, Lock, Mail, MapPin, Phone, Sparkles, User } from 'lucide-react';
import { getUser, saveUser } from '../../../lib/authStorage';
import type { AuthUser } from '../../../lib/authStorage';

const roleColors: Record<string, string> = {
  STUDENT:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  HOST:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  EMPLOYER: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  ADMIN:    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
};
const avatarBg: Record<string, string> = {
  STUDENT: 'bg-blue-600', HOST: 'bg-emerald-600', EMPLOYER: 'bg-violet-600', ADMIN: 'bg-rose-600',
};

interface FormState { fullName: string; email: string; phone: string; location: string; bio: string; skillsProfile: string; }
interface PwState   { current: string; next: string; confirm: string; }

function Field({ label, value, onChange, placeholder, icon: Icon, type = 'text', error }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon: React.ElementType; type?: string; error?: string; }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input pl-10" />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const stored = getUser();
  const [form, setForm]         = useState<FormState>({ fullName: stored?.fullName ?? '', email: stored?.email ?? '', phone: stored?.phone ?? '', location: stored?.location ?? '', bio: stored?.bio ?? '', skillsProfile: stored?.skillsProfile ?? '' });
  const [pw, setPw]             = useState<PwState>({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [pwSaved, setPwSaved]   = useState(false);
  const [errors, setErrors]     = useState<Partial<FormState>>({});
  const [pwError, setPwError]   = useState('');
  const timerRef                = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash(setter: (v: boolean) => void) { setter(true); if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setter(false), 3000); }

  function saveInfo() {
    const e: Partial<FormState> = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!stored) return;
    saveUser({ ...stored, ...form } as AuthUser);
    setErrors({}); flash(setSaved);
  }

  function savePassword() {
    setPwError('');
    if (!pw.current.trim())    { setPwError('Enter your current password'); return; }
    if (pw.next.length < 6)    { setPwError('New password must be at least 6 characters'); return; }
    if (pw.next !== pw.confirm) { setPwError('Passwords do not match'); return; }
    if (!stored) return;
    saveUser({ ...stored, password: pw.next });
    setPw({ current: '', next: '', confirm: '' }); flash(setPwSaved);
  }

  if (!stored) return <div className="card py-16 text-center"><p className="font-black text-neutral-900 dark:text-white">Not logged in</p></div>;

  const initials = stored.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const role = stored.role;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative shrink-0">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white ${avatarBg[role] ?? 'bg-neutral-700'}`}>{initials}</div>
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-neutral-900 text-white hover:bg-neutral-700 dark:border-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition">
              <Camera size={13} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl truncate">{stored.fullName}</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{stored.email}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${roleColors[role] ?? ''}`}>{role.charAt(0) + role.slice(1).toLowerCase()}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-black text-neutral-900 dark:text-white">Personal Information</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Update your name, contact details and location.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name *"     value={form.fullName} onChange={v => setForm({ ...form, fullName: v })}  placeholder="Your full name"    icon={User}   error={errors.fullName} />
          <Field label="Email address *" value={form.email}    onChange={v => setForm({ ...form, email: v })}     placeholder="you@example.com"   icon={Mail}   error={errors.email} />
          <Field label="Phone number"    value={form.phone}    onChange={v => setForm({ ...form, phone: v })}     placeholder="+250 7XX XXX XXX" icon={Phone} />
          <Field label="Location"        value={form.location} onChange={v => setForm({ ...form, location: v })}  placeholder="City, Country"     icon={MapPin} />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Short bio</label>
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell us a bit about yourself…" className="input resize-none" />
        </div>
        {(role === 'STUDENT' || role === 'EMPLOYER') && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">{role === 'STUDENT' ? 'Skills profile' : 'Industry / expertise'}</label>
            <div className="relative">
              <Sparkles size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={form.skillsProfile} onChange={e => setForm({ ...form, skillsProfile: e.target.value })} placeholder={role === 'STUDENT' ? 'e.g. React, Communication' : 'e.g. Fintech, Software Development'} className="input pl-10" />
            </div>
          </div>
        )}
        <div className="mt-6 flex items-center gap-3">
          <button onClick={saveInfo} className="btn-black rounded-xl">Save changes</button>
          {saved && <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={15} /> Saved successfully</span>}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-black text-neutral-900 dark:text-white">Change Password</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Choose a strong password of at least 6 characters.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(['current', 'next', 'confirm'] as const).map(key => (
            <div key={key}>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">{key === 'current' ? 'Current password' : key === 'next' ? 'New password' : 'Confirm new'}</label>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type={showPw ? 'text' : 'password'} value={pw[key]} onChange={e => setPw({ ...pw, [key]: e.target.value })} placeholder="••••••••" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
        {pwError && <p className="mt-3 text-sm text-red-500">{pwError}</p>}
        <div className="mt-6 flex items-center gap-3">
          <button onClick={savePassword} className="btn-black rounded-xl">Update password</button>
          {pwSaved && <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={15} /> Password updated</span>}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-black text-neutral-900 dark:text-white">Account Details</h2>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[{ label: 'Account ID', value: stored.id }, { label: 'Role', value: role.charAt(0) + role.slice(1).toLowerCase() }].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</dt>
              <dd className="mt-0.5 font-semibold text-neutral-900 dark:text-white break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
