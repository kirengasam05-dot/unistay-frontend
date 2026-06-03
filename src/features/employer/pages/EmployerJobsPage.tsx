import { useEffect, useRef, useState } from 'react';
import { Briefcase, Calendar, ChevronDown, Loader2, MapPin, Pencil, Trash2, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsApi } from '../../jobs/jobsApi';
import type { Job, CreateJobPayload } from '../../jobs/jobsApi';

const CATEGORIES = ['Software Development', 'Marketing', 'Sales & Communication', 'Administration', 'Design', 'Finance', 'Operations'];
const SCHEDULE_TYPES = [
  { value: 'PART_TIME',  label: 'Part-time' },
  { value: 'FULL_TIME',  label: 'Full-time' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const emptyForm = {
  title: '',
  category: 'Software Development',
  scheduleType: 'INTERNSHIP',
  deadline: '',
  openings: '1',
  locationType: 'Remote / Hybrid',
  locationDetail: '',
  company: '',
  contactPerson: '',
  phone: '',
  address: '',
  skills: '',
  description: '',
};

function parseLocation(location: string) {
  const sep = ' · ';
  const idx = location.indexOf(sep);
  if (idx !== -1) return { locationType: location.slice(0, idx), locationDetail: location.slice(idx + sep.length) };
  return { locationType: location, locationDetail: '' };
}

export default function EmployerJobsPage() {
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]           = useState(emptyForm);
  const formRef                   = useRef<HTMLDivElement>(null);

  const set = (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    jobsApi.getMine().catch(() => [] as Job[]).then(setJobs).finally(() => setLoading(false));
  }, []);

  function startEdit(j: Job) {
    const { locationType, locationDetail } = parseLocation(j.location ?? '');
    setForm({
      title:          j.title,
      category:       j.category ?? 'Software Development',
      scheduleType:   j.scheduleType ?? 'INTERNSHIP',
      deadline:       j.deadline ?? '',
      openings:       '1',
      locationType,
      locationDetail,
      company:        j.company ?? '',
      contactPerson:  '',
      phone:          '',
      address:        '',
      skills:         (j.requiredSkills ?? []).join(', '),
      description:    j.description ?? '',
    });
    setEditingId(j.id);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function publish() {
    if (!form.title.trim()) return toast.error('Job title is required');
    setSaving(true);
    try {
      const location = form.locationDetail.trim()
        ? `${form.locationType} · ${form.locationDetail.trim()}`
        : form.locationType;

      if (editingId) {
        const updated = await jobsApi.update(editingId, {
          title: form.title.trim(),
          location,
          scheduleType: form.scheduleType,
        });
        setJobs(prev => prev.map(j => j.id === editingId ? { ...j, ...updated } : j));
        setEditingId(null);
        setForm(emptyForm);
        toast.success('Job updated successfully');
      } else {
        const payload: CreateJobPayload = {
          title: form.title.trim(),
          location,
          scheduleType: form.scheduleType,
          category: form.category,
          deadline: form.deadline || undefined,
          description: form.description || undefined,
          requiredSkills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        };
        const newJob = await jobsApi.create(payload);
        setJobs(prev => [newJob, ...prev]);
        setForm(emptyForm);
        toast.success('Job published successfully');
      }
    } catch (err: any) {
      toast.error(err?.message || (editingId ? 'Failed to update job' : 'Failed to create job'));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await jobsApi.remove(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      if (editingId === id) cancelEdit();
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete job');
    } finally {
      setDeletingId(null);
    }
  }

  const isEditing = editingId !== null;

  return (
    <div className="space-y-8">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4">
        {isEditing ? (
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            Editing — <span className="font-black text-neutral-900 dark:text-white">{form.title || '…'}</span>
          </p>
        ) : <div />}
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <X size={14} /> Cancel
            </button>
          )}
          {!isEditing && (
            <button
              onClick={() => toast('Draft saved', { icon: '📝' })}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Save as Draft
            </button>
          )}
          <button
            onClick={publish}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2 text-sm font-black text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {isEditing ? 'Save Changes' : 'Publish Now'}
          </button>
        </div>
      </div>

      {/* ── Two-column form ── */}
      <div ref={formRef} className="grid gap-8 lg:grid-cols-[1fr_300px]">

        {/* Left: Job fields */}
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white">
            {isEditing ? 'Edit Job' : 'Create Job'}
          </h1>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-neutral-700 dark:text-neutral-300">Job Title</label>
            <input value={form.title} onChange={set('title')} placeholder="e.g. Frontend Internship" className="input" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-neutral-700 dark:text-neutral-300">Job Category</label>
            <div className="relative">
              <select value={form.category} onChange={set('category')} className="input appearance-none pr-10">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold text-neutral-700 dark:text-neutral-300">Employment Type</label>
            <div className="flex flex-wrap gap-6">
              {SCHEDULE_TYPES.map(t => (
                <label key={t.value} className="flex cursor-pointer items-center gap-2">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition ${form.scheduleType === t.value ? 'border-neutral-900 dark:border-white' : 'border-neutral-300 dark:border-neutral-600'}`}>
                    {form.scheduleType === t.value && <span className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-white" />}
                  </span>
                  <input type="radio" name="scheduleType" value={t.value} checked={form.scheduleType === t.value} onChange={set('scheduleType')} className="sr-only" />
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-neutral-700 dark:text-neutral-300">Deadline</label>
              <div className="relative">
                <Calendar size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="date" value={form.deadline} onChange={set('deadline')} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-neutral-700 dark:text-neutral-300">Number of Openings</label>
              <input type="number" min="1" value={form.openings} onChange={set('openings')} className="input" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-neutral-700 dark:text-neutral-300">Required Skills</label>
            <input value={form.skills} onChange={set('skills')} placeholder="e.g. React, Node.js, SQL (comma separated)" className="input" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-neutral-700 dark:text-neutral-300">Job Description</label>
            <textarea value={form.description} onChange={set('description')} rows={6}
              placeholder="Describe the role, responsibilities, and what you're looking for…"
              className="input resize-none" />
          </div>
        </div>

        {/* Right: Employer Details */}
        <aside className="space-y-5">
          <h2 className="font-black text-neutral-900 dark:text-white">Employer Details</h2>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-neutral-400">Company</label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <Briefcase size={13} className="text-neutral-500" />
              </div>
              <input value={form.company} onChange={set('company')} placeholder="Company name" className="input pl-12" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-neutral-400">Location</label>
            <div className="relative mb-2">
              <select value={form.locationType} onChange={set('locationType')} className="input appearance-none pr-10">
                <option>Remote / Hybrid</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
            <div className="relative">
              <MapPin size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={form.locationDetail} onChange={set('locationDetail')} placeholder="Physical address (optional)" className="input pl-10" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-neutral-400">Contact Person</label>
            <div className="relative">
              <User size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={form.contactPerson} onChange={set('contactPerson')} placeholder="Full name" className="input pl-10" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-neutral-400">Phone Number</label>
            <input value={form.phone} onChange={set('phone')} placeholder="+250 7XX XXX XXX" className="input" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-neutral-400">Address Location</label>
            <div className="relative">
              <MapPin size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={form.address} onChange={set('address')} placeholder="Street, City, Country" className="input pl-10" />
            </div>
          </div>
        </aside>
      </div>

      {/* ── Published jobs list ── */}
      <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
          <h2 className="font-black text-neutral-900 dark:text-white">Published Jobs</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-neutral-400" size={28} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center">
            <Briefcase size={28} className="mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="mt-3 font-black text-neutral-900 dark:text-white">No jobs yet</p>
            <p className="mt-1 text-sm text-neutral-400">Fill in the form above and click Publish Now.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {jobs.map(j => (
              <div
                key={j.id}
                className={`flex flex-wrap items-start justify-between gap-4 px-6 py-4 transition ${editingId === j.id ? 'bg-neutral-50 dark:bg-neutral-800/50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${editingId === j.id ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                    <Briefcase size={16} className={editingId === j.id ? 'text-white dark:text-neutral-900' : 'text-neutral-500 dark:text-neutral-400'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-neutral-900 dark:text-white">{j.title}</p>
                      {editingId === j.id && (
                        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-black text-white dark:bg-white dark:text-neutral-900">
                          Editing
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                      {[j.category, j.scheduleType?.replace('_', ' '), j.location].filter(Boolean).join(' · ')}
                    </p>
                    {j.requiredSkills && j.requiredSkills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {j.requiredSkills.map(s => (
                          <span key={s} className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingId === j.id ? (
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      <X size={12} /> Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(j)}
                      className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  )}
                  <button
                    disabled={deletingId === j.id}
                    onClick={() => remove(j.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800/40 dark:hover:bg-red-900/20"
                  >
                    {deletingId === j.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
