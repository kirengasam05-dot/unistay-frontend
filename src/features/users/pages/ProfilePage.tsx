import { useEffect, useState } from 'react';
import { Award, Briefcase, Download, Eye, Loader2, Lock, MapPin, Phone, Save, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import { applicationsApi } from '../../applications/applicationsApi';
import type { Application } from '../../applications/applicationsApi';
import CertificatePreview, { downloadCertificatePdf, type CertificateData } from '../../student/components/CertificatePreview';
import { useLearningProfileQuery } from '../../student/hooks/useLearningProfileQuery';

type Section = 'profile' | 'password' | 'certificates' | 'jobs' | 'skills';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [section, setSection] = useState<Section>('profile');
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', location: user?.location || '' });
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [applications, setApplications] = useState<Application[]>([]);
  const [saving, setSaving] = useState(false);
  const [certificatePreview, setCertificatePreview] = useState<CertificateData | null>(null);
  const { data: learning } = useLearningProfileQuery(user?.role === 'STUDENT');

  useEffect(() => {
    if (user?.role !== 'STUDENT') return;
    applicationsApi.getMine().then(setApplications).catch(() => setApplications([]));
  }, [user?.role]);

  if (!user) return null;
  const student = user.role === 'STUDENT';
  const links = [
    ['profile', 'Update profile', User],
    ['password', 'Change password', Lock],
    ...(student ? [['certificates', 'Certificates', Award], ['jobs', 'Job history', Briefcase], ['skills', 'Earned skills', Sparkles]] : []),
  ] as [Section, string, typeof User][];

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

  async function savePassword() {
    if (!password.current || password.next.length < 6 || password.next !== password.confirm) return toast.error('Check your current password and ensure the new passwords match.');
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

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-24">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-neutral-950 text-xl font-black text-white dark:bg-white dark:text-neutral-950">{(user.fullName || user.email)[0]}</div>
        <h1 className="mt-4 font-black text-neutral-900 dark:text-white">{user.fullName}</h1>
        <p className="text-xs text-neutral-500">{user.email}</p>
        <span className="mt-3 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{user.role}</span>
        <nav className="mt-5 space-y-1">{links.map(([id, label, Icon]) => <button key={id} onClick={() => setSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold ${section === id ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'}`}><Icon size={16} />{label}</button>)}</nav>
      </aside>
      <main>
        {section === 'profile' && <section className="card"><h2 className="text-2xl font-black">Update profile</h2><p className="mt-1 text-sm text-neutral-500">Keep your account details current.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Full name<input className="input mt-2" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label><label className="text-sm font-bold">Phone<div className="relative mt-2"><Phone className="absolute left-3 top-3.5 text-neutral-400" size={15} /><input className="input pl-9" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div></label><label className="text-sm font-bold sm:col-span-2">Location<div className="relative mt-2"><MapPin className="absolute left-3 top-3.5 text-neutral-400" size={15} /><input className="input pl-9" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div></label></div><button onClick={saveProfile} disabled={saving} className="btn-black mt-6 rounded-xl">{saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save changes</button></section>}
        {section === 'password' && <section className="card"><h2 className="text-2xl font-black">Change password</h2><div className="mt-6 grid gap-4">{(['current', 'next', 'confirm'] as const).map((key) => <label key={key} className="text-sm font-bold">{key === 'current' ? 'Current password' : key === 'next' ? 'New password' : 'Confirm new password'}<input type="password" className="input mt-2" value={password[key]} onChange={(e) => setPassword({ ...password, [key]: e.target.value })} /></label>)}</div><button onClick={savePassword} disabled={saving} className="btn-black mt-6 rounded-xl">Update password</button></section>}
        {section === 'certificates' && <section className="space-y-3"><h2 className="text-2xl font-black">Certificate achievements</h2>{learning?.certificates.map((certificate) => { const data: CertificateData = { id: certificate.id, studentName: user.fullName, courseTitle: certificate.course.title, issuedAt: certificate.issuedAt, skills: certificate.skills?.map(({ skill }) => skill.name) }; return <article key={certificate.id} className="card flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-600">Achievement</p><h3 className="mt-1 font-black">{certificate.course.title}</h3><p className="text-sm text-neutral-500">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setCertificatePreview(data)} className="btn-white rounded-lg"><Eye size={15} /> Preview</button><button onClick={() => downloadCertificatePdf(data)} className="btn-black rounded-lg"><Download size={15} /> Download PDF</button></div></article>; })}{!learning?.certificates.length && <div className="card text-sm text-neutral-500">Pass a course exam to unlock your first certificate.</div>}</section>}
        {section === 'jobs' && <section className="space-y-3"><h2 className="text-2xl font-black">Job application history</h2>{applications.map((application) => <article key={application.id} className="card flex items-center justify-between gap-3"><div><h3 className="font-black">{application.job?.title || application.jobId}</h3><p className="text-sm text-neutral-500">Application submitted</p></div><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black dark:bg-neutral-800">{application.status}</span></article>)}{applications.length === 0 && <div className="card text-sm text-neutral-500">Your submitted job applications will appear here.</div>}</section>}
        {section === 'skills' && <section><h2 className="text-2xl font-black">Skills added to your profile</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{learning?.userSkills.map(({ skill, completionStatus }) => <article key={skill.id} className="card"><Sparkles className="text-violet-600" size={19} /><h3 className="mt-3 font-black">{skill.name}</h3><p className="text-sm text-neutral-500">{skill.category} - {skill.level}</p><span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{completionStatus ? 'Verified skill' : 'In progress'}</span></article>)}</div>{!learning?.userSkills.length && <div className="card mt-4 text-sm text-neutral-500">Earn skills by passing course exams.</div>}</section>}
      </main>
      {certificatePreview && <CertificatePreview certificate={certificatePreview} onClose={() => setCertificatePreview(null)} />}
    </div>
  );
}
