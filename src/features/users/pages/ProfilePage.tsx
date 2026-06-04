import { useEffect, useState } from 'react';
import { Award, Briefcase, Camera, Download, Eye, Loader2, Lock, Mail, MapPin, Pencil, Phone, Save, Sparkles, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import { useConfirm } from '../../../shared/components/ui/ConfirmDialog';
import { applicationsApi } from '../../applications/applicationsApi';
import type { Application } from '../../applications/applicationsApi';
import CertificatePreview, { downloadCertificatePdf, type CertificateData } from '../../student/components/CertificatePreview';
import { useLearningProfileQuery } from '../../student/hooks/useLearningProfileQuery';

type Tab = 'activity' | 'profile' | 'security' | 'certificates' | 'applications' | 'skills';

function fmt(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProfilePage() {
  const { user, updateProfile, uploadAvatar, deleteAvatar, changePassword } = useAuth();
  const [tab, setTab]           = useState<Tab>('activity');
  const [form, setForm]         = useState({ fullName: user?.fullName || '', phone: user?.phone || '', location: user?.location || '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const confirm = useConfirm();
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [applications, setApplications] = useState<Application[]>([]);
  const [saving, setSaving]     = useState(false);
  const [certPreview, setCertPreview] = useState<CertificateData | null>(null);
  const { data: learning }      = useLearningProfileQuery(user?.role === 'STUDENT');

  useEffect(() => {
    if (user?.role !== 'STUDENT') return;
    applicationsApi.getMine().then(setApplications).catch(() => {});
  }, [user?.role]);

  if (!user) return null;
  const isStudent = user.role === 'STUDENT';

  const tabs: [Tab, string][] = [
    ['activity', 'Activity'],
    ['profile',  'Edit Profile'],
    ['security', 'Security'],
    ...(isStudent ? [
      ['certificates', 'Certificates'] as [Tab, string],
      ['applications', 'Applications'] as [Tab, string],
      ['skills',       'Skills']       as [Tab, string],
    ] : []),
  ];

  async function saveProfile() {
    if (!form.fullName.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file?: File) {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update avatar');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleAvatarDelete() {
    const ok = await confirm({
      title: 'Delete avatar?',
      description: 'This will remove your current profile photo.',
      confirmText: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;

    setDeletingAvatar(true);
    try {
      await deleteAvatar();
      toast.success('Avatar removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove avatar');
    } finally {
      setDeletingAvatar(false);
    }
  }

  async function savePassword() {
    if (!password.current || password.next.length < 6 || password.next !== password.confirm)
      return toast.error('Check your current password and ensure the new passwords match.');
    setSaving(true);
    try {
      await changePassword({ currentPassword: password.current, newPassword: password.next });
      setPassword({ current: '', next: '', confirm: '' });
      toast.success('Password updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update password');
    } finally {
      setSaving(false);
    }
  }

  const initials = user.fullName
    ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : user.email[0].toUpperCase();

  // Build activity feed from real data
  const activityItems: { icon: typeof Briefcase; title: string; sub?: string; date?: string }[] = [
    ...(applications.map(a => ({
      icon: Briefcase,
      title: `Applied to "${a.job?.title ?? 'a job'}"`,
      sub: `Status: ${a.status}`,
      date: undefined,
    }))),
    ...(learning?.certificates.map(c => ({
      icon: Award,
      title: `Certificate earned — "${c.course.title}"`,
      sub: 'Course completion certificate',
      date: fmt(c.issuedAt),
    })) ?? []),
    { icon: User, title: 'Account created', sub: `Joined as ${user.role}`, date: undefined },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

      {/* ── Left panel ────────────────────────────────────────────── */}
      <aside className="h-fit lg:sticky lg:top-24">

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || user.email}
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md dark:border-neutral-800"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-white bg-neutral-900 text-2xl font-black text-white shadow-md dark:border-neutral-800 dark:bg-white dark:text-neutral-900">
                {initials}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-black text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900">
              {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              {user.avatar ? 'Change avatar' : 'Upload avatar'}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                handleAvatarUpload(file);
              }}
              disabled={uploadingAvatar || deletingAvatar}
            />
            {user.avatar && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                disabled={uploadingAvatar || deletingAvatar}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-900"
              >
                {deletingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Remove
              </button>
            )}
          </div>
          <h1 className="mt-4 text-xl font-black text-neutral-900 dark:text-white">
            {user.fullName || user.email}
          </h1>
          <p className="mt-0.5 text-sm text-neutral-400">{user.email}</p>
          <span className="mt-2 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {user.role}
          </span>
        </div>

        {/* About */}
        <div className="mt-6 border-t border-neutral-100 pt-5 dark:border-neutral-800">
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-neutral-400">About</p>
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {form.location || 'No bio added yet.'}
          </p>
          <button
            onClick={() => setTab('profile')}
            className="mt-3 flex items-center gap-1.5 text-sm font-bold text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <Pencil size={13} /> Edit page
          </button>
        </div>

        {/* Connect */}
        <div className="mt-5 border-t border-neutral-100 pt-5 dark:border-neutral-800">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-neutral-400">Connect</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={14} className="shrink-0 text-neutral-400" />
              <span className="w-16 shrink-0 font-semibold text-neutral-500">Email</span>
              <span className="truncate text-neutral-700 dark:text-neutral-300">{user.email}</span>
            </div>
            {form.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone size={14} className="shrink-0 text-neutral-400" />
                <span className="w-16 shrink-0 font-semibold text-neutral-500">Phone</span>
                <span className="text-neutral-700 dark:text-neutral-300">{form.phone}</span>
              </div>
            )}
            {form.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={14} className="shrink-0 text-neutral-400" />
                <span className="w-16 shrink-0 font-semibold text-neutral-500">Location</span>
                <span className="truncate text-neutral-700 dark:text-neutral-300">{form.location}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setTab('profile')}
            className="mt-4 flex items-center gap-1.5 text-sm font-bold text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <Pencil size={13} /> Edit services
          </button>
        </div>
      </aside>

      {/* ── Right panel ───────────────────────────────────────────── */}
      <main>
        {/* Tab bar */}
        <div className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-bold transition ${
                  tab === id
                    ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">

          {/* ── Activity ── */}
          {tab === 'activity' && (
            <div className="space-y-1">
              {activityItems.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-400">No activity yet.</p>
              ) : activityItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4 border-b border-neutral-100 py-4 dark:border-neutral-800">
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      <Icon size={15} className="text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">{item.title}</p>
                      {item.sub && <p className="mt-0.5 text-xs text-neutral-400">{item.sub}</p>}
                    </div>
                    {item.date && (
                      <span className="shrink-0 text-xs text-neutral-400">{item.date}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Edit Profile ── */}
          {tab === 'profile' && (
            <div className="max-w-lg space-y-5">
              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">Full name</label>
                <input className="input mt-2" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">Phone</label>
                <div className="relative mt-2">
                  <Phone size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input className="input pl-10" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+250 7XX XXX XXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">Location / Bio</label>
                <div className="relative mt-2">
                  <MapPin size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input className="input pl-10" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
                </div>
              </div>
              <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save changes
              </button>
            </div>
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
            <div className="max-w-lg space-y-5">
              <div>
                <h2 className="text-lg font-black text-neutral-900 dark:text-white">Change password</h2>
                <p className="mt-1 text-sm text-neutral-400">Use a strong password with at least 6 characters.</p>
              </div>
              {(['current', 'next', 'confirm'] as const).map(key => (
                <div key={key}>
                  <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    {key === 'current' ? 'Current password' : key === 'next' ? 'New password' : 'Confirm new password'}
                  </label>
                  <div className="relative mt-2">
                    <Lock size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input type="password" className="input pl-10" value={password[key]} onChange={e => setPassword({ ...password, [key]: e.target.value })} />
                  </div>
                </div>
              ))}
              <button onClick={savePassword} disabled={saving} className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900">
                {saving ? <Loader2 size={15} className="animate-spin" /> : null} Update password
              </button>
            </div>
          )}

          {/* ── Certificates ── */}
          {tab === 'certificates' && (
            <div className="space-y-3">
              {!learning?.certificates.length ? (
                <p className="py-10 text-center text-sm text-neutral-400">Pass a course exam to earn your first certificate.</p>
              ) : learning.certificates.map(cert => {
                const data: CertificateData = { id: cert.id, studentName: user.fullName, courseTitle: cert.course.title, issuedAt: cert.issuedAt, skills: cert.skills?.map(({ skill }) => skill.name) };
                return (
                  <div key={cert.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 py-4 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <Award size={18} className="text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <div>
                        <p className="font-black text-neutral-900 dark:text-white">{cert.course.title}</p>
                        <p className="text-xs text-neutral-400">Issued {fmt(cert.issuedAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setCertPreview(data)} className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                        <Eye size={13} /> Preview
                      </button>
                      <button onClick={() => downloadCertificatePdf(data)} className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-black text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">
                        <Download size={13} /> Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Applications ── */}
          {tab === 'applications' && (
            <div className="space-y-1">
              {!applications.length ? (
                <p className="py-10 text-center text-sm text-neutral-400">Your job applications will appear here.</p>
              ) : applications.map(app => (
                <div key={app.id} className="flex items-center justify-between gap-4 border-b border-neutral-100 py-4 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      <Briefcase size={16} className="text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-black text-neutral-900 dark:text-white">{app.job?.title ?? 'Job application'}</p>
                      {app.job?.company && <p className="text-xs text-neutral-400">{app.job.company}</p>}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${
                    app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                  }`}>{app.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Skills ── */}
          {tab === 'skills' && (
            <div className="space-y-1">
              {!learning?.userSkills.length ? (
                <p className="py-10 text-center text-sm text-neutral-400">Earn skills by passing course exams.</p>
              ) : learning.userSkills.map(({ skill, completionStatus }) => (
                <div key={skill.id} className="flex items-center justify-between gap-4 border-b border-neutral-100 py-4 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      <Sparkles size={16} className="text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-black text-neutral-900 dark:text-white">{skill.name}</p>
                      <p className="text-xs text-neutral-400">{skill.category} · {skill.level}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${completionStatus ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                    {completionStatus ? 'Verified' : 'In progress'}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {certPreview && <CertificatePreview certificate={certPreview} onClose={() => setCertPreview(null)} />}
    </div>
  );
}
