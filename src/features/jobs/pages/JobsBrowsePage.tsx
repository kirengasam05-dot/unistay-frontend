import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Bookmark, BookmarkCheck, Briefcase,
  CheckCircle2, ChevronDown, Clock3, Loader2, MapPin,
  Search, Trash2, UploadCloud, Wallet, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { jobsApi } from '../jobsApi';
import { applicationsApi } from '../../applications/applicationsApi';
import type { ApplicationFormData } from '../../applications/applicationsApi';
import type { Job } from '../jobsApi';
import { useAuth } from '../../auth/context/AuthContext';

export type JobsBrowseRole = 'STUDENT' | 'ADMIN' | 'HOST';

const SCHEDULE_LABELS: Record<string, string> = {
  INTERNSHIP: 'Internship',
  PART_TIME:  'Part Time',
  FULL_TIME:  'Full Time',
};

const SCHEDULE_COLOR: Record<string, string> = {
  INTERNSHIP: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  PART_TIME:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  FULL_TIME:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const APPLICATION_STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: 'PENDING',
  ACCEPTED: 'CONFIRMED',
  REJECTED: 'REJECTED',
};

function money(v?: number | null) {
  return v ? `RWF ${v.toLocaleString()}` : null;
}

function timeAgo(d?: string) {
  if (!d) return null;
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Application centered modal (STUDENT only) ────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-neutral-700 dark:text-neutral-300">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function ApplicationPanel({
  job, applied, onClose, onSuccess,
}: {
  job: Job; applied: boolean; onClose: () => void; onSuccess: (id: string) => void;
}) {
  const { user } = useAuth();
  const skills   = job.requiredSkills ?? [];

  const [form, setForm] = useState({
    fullName:    user?.fullName ?? '',
    dateOfBirth: '',
    idType:      '',
    phone:       user?.phone ?? '',
    email:       user?.email ?? '',
    address:     '',
    location:    user?.location ?? '',
  });
  const [confirmedSkills, setCS] = useState<Set<string>>(new Set());
  const [resumeFile, setResume]  = useState<File | null>(null);
  const [agreed, setAgreed]      = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]      = useState<string[]>([]);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  function toggleSkill(s: string) {
    setCS(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });
  }

  function validate() {
    const e: string[] = [];
    if (!form.fullName.trim()) e.push('Full name is required.');
    if (!form.dateOfBirth)     e.push('Date of birth is required.');
    if (!form.phone.trim())    e.push('Mobile number is required.');
    if (!form.email.trim())    e.push('Email is required.');
    if (!resumeFile)           e.push('Resume is required (PDF or DOCX).');
    if (skills.length > 0 && confirmedSkills.size < skills.length) e.push('Please confirm all required skills.');
    if (!agreed) e.push('Please confirm the agreement.');
    return e;
  }

  async function submit() {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setSubmitting(true);
    try {
      const formData: ApplicationFormData = {
        dateOfBirth:     form.dateOfBirth,
        nationality:     '',
        idType:          form.idType,
        phone:           form.phone,
        address:         form.address,
        location:        form.location,
        linkedin:        '',
        portfolio:       '',
        coverLetter:     '',
        confirmedSkills: Array.from(confirmedSkills),
        resumeName:      resumeFile?.name ?? '',
      };
      const application = await applicationsApi.apply(job.id, formData);

      // Upload the actual resume file to Cloudinary
      if (resumeFile && application?.id) {
        try {
          await applicationsApi.uploadResume(application.id, resumeFile);
        } catch {
          // Application submitted — resume upload failed silently
          console.warn('[apply] Resume upload failed after application creation');
        }
      }

      onSuccess(job.id);
      toast.success('Application submitted! The employer will contact you by email.');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-900">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-7 py-5 dark:border-neutral-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Applying for</p>
            <h2 className="mt-1 text-xl font-black text-neutral-900 dark:text-white">{job.title}</h2>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-500">
              {job.location && <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>}
              <span className="flex items-center gap-1"><Clock3 size={12} />{SCHEDULE_LABELS[job.scheduleType] ?? job.scheduleType}</span>
              {money(job.salary) && <span className="flex items-center gap-1"><Wallet size={12} />{money(job.salary)}</span>}
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {applied ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-800/40 dark:bg-emerald-900/20">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600 dark:text-emerald-400" />
              <h3 className="mt-3 text-lg font-black text-emerald-800 dark:text-emerald-400">Already applied</h3>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-500">The employer will reach out by email.</p>
            </div>
          ) : (
            <div className="space-y-8">

              {/* ── Personal Information ── */}
              <div>
                <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-neutral-400">Personal Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required>
                    <input value={form.fullName} onChange={set('fullName')} className="input" placeholder="Your full name" />
                  </Field>
                  <Field label="Date of Birth" required>
                    <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className="input" />
                  </Field>
                  <Field label="Identification Type">
                    <select value={form.idType} onChange={set('idType')} className="input">
                      <option value="">Select type</option>
                      <option>National ID</option>
                      <option>Passport</option>
                      <option>Student ID</option>
                    </select>
                  </Field>
                  <Field label="Mobile" required>
                    <input value={form.phone} onChange={set('phone')} className="input" placeholder="+250 7XX XXX XXX" />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@email.com" />
                  </Field>
                  <Field label="Address">
                    <input value={form.address} onChange={set('address')} className="input" placeholder="Your address" />
                  </Field>
                  <Field label="Location">
                    <input value={form.location} onChange={set('location')} className="input" placeholder="City, Country" />
                  </Field>
                </div>
              </div>

              {/* ── Resume Upload ── */}
              <div>
                <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-neutral-400">Resume <span className="text-red-500">*</span></h3>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-8 transition hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800">
                  <UploadCloud size={28} className="text-neutral-400" />
                  <p className="mt-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    {resumeFile ? resumeFile.name : 'Drop file here or browse'}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">Max 4 MB · PDF, DOCX</p>
                  <input type="file" accept=".pdf,.docx" className="hidden" onChange={e => setResume(e.target.files?.[0] ?? null)} />
                </label>
              </div>

              {/* ── Required Skills ── */}
              {skills.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-neutral-400">Required Skills — confirm what you have</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {skills.map(s => (
                      <label key={s} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${confirmedSkills.has(s) ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800'}`}>
                        <input type="checkbox" checked={confirmedSkills.has(s)} onChange={() => toggleSkill(s)} className="h-4 w-4 accent-emerald-600" />
                        <span className={`text-sm font-semibold ${confirmedSkills.has(s) ? 'text-emerald-800 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'}`}>{s}</span>
                        {confirmedSkills.has(s) && <CheckCircle2 size={14} className="ml-auto shrink-0 text-emerald-600 dark:text-emerald-400" />}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Agreement ── */}
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${agreed ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white' : 'border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800'}`}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-neutral-900 dark:accent-white" />
                <span className={`text-sm font-semibold leading-relaxed ${agreed ? 'text-white dark:text-neutral-900' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  I confirm all information provided is accurate and I meet the requirements for this position.
                </span>
              </label>

              {errors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/20">
                  {errors.map(e => <p key={e} className="text-xs font-semibold text-red-700 dark:text-red-400">• {e}</p>)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!applied && (
          <div className="border-t border-neutral-100 px-7 py-5 dark:border-neutral-800">
            <button onClick={submit} disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-4 text-base font-black text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900">
              {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : <><ArrowRight size={18} /> Submit application</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main shared page ──────────────────────────────────────────────────────────

export default function JobsBrowsePage({ role }: { role: JobsBrowseRole }) {
  const { user } = useAuth();
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(true);
  const [keyword, setKeyword]     = useState('');
  const [locationSearch, setLS]   = useState('');
  const [scheduleFilter, setSF]   = useState('ALL');
  const [locationFilter, setLF]   = useState('ALL');
  const [companyFilter, setCF]    = useState('ALL');
  const [saved, setSaved]         = useState<Set<string>>(new Set());
  const [showMoreLoc, setShowMoreLoc] = useState(false);
  const [showMoreCo, setShowMoreCo]   = useState(false);
  const [email, setEmail]         = useState('');

  // Student state
  const [applied, setApplied]   = useState<Set<string>>(new Set());
  const [applicationStatus, setApplicationStatus] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Job | null>(null);

  // Admin state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    jobsApi.getAll().then(setJobs).catch(() => setJobs([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (role !== 'STUDENT' || !user) return;
    applicationsApi.getMine()
      .then(apps => {
        const statuses: Record<string, string> = {};
        apps.forEach(app => {
          if (app.jobId) statuses[app.jobId] = app.status;
        });
        setApplicationStatus(statuses);
        setApplied(new Set(Object.keys(statuses)));
      })
      .catch(() => {
        setApplicationStatus({});
        setApplied(new Set());
      });
  }, [role, user]);

  async function deleteJob(id: string) {
    setDeletingId(id);
    try {
      await jobsApi.remove(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      toast.success('Job deleted.');
    } catch {
      toast.error('Failed to delete job.');
    } finally {
      setDeletingId(null);
    }
  }

  const locations = useMemo(() => {
    const c: Record<string, number> = {};
    jobs.forEach(j => { if (j.location) c[j.location] = (c[j.location] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const companies = useMemo(() => {
    const c: Record<string, number> = {};
    jobs.forEach(j => { if (j.company) c[j.company] = (c[j.company] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const scheduleCounts = useMemo(() => {
    const c: Record<string, number> = { INTERNSHIP: 0, PART_TIME: 0, FULL_TIME: 0 };
    jobs.forEach(j => { if (j.scheduleType in c) c[j.scheduleType]++; });
    return c;
  }, [jobs]);

  const filtered = useMemo(() =>
    jobs.filter(j => {
      const text = `${j.title} ${j.company ?? ''} ${j.category ?? ''} ${(j.requiredSkills ?? []).join(' ')}`.toLowerCase();
      return (
        text.includes(keyword.toLowerCase()) &&
        (!locationSearch || j.location.toLowerCase().includes(locationSearch.toLowerCase())) &&
        (scheduleFilter === 'ALL' || j.scheduleType === scheduleFilter) &&
        (locationFilter === 'ALL' || j.location === locationFilter) &&
        (companyFilter === 'ALL' || j.company === companyFilter)
      );
    }),
    [jobs, keyword, locationSearch, scheduleFilter, locationFilter, companyFilter]
  );

  function toggleSave(id: string) {
    setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function clearAll() { setSF('ALL'); setLF('ALL'); setCF('ALL'); }

  const visibleLoc = showMoreLoc ? locations : locations.slice(0, 5);
  const visibleCo  = showMoreCo  ? companies : companies.slice(0, 8);

  const pageTitle = role === 'ADMIN' ? 'Manage Jobs' : 'Browse Jobs';

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-slate-950 px-4 py-14 text-white sm:px-6 lg:py-16">
        <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=85" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative mx-auto max-w-7xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-300">{role === 'ADMIN' ? 'Jobs control' : 'Student jobs'}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">{pageTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
            {role === 'ADMIN'
              ? 'View and manage all published job listings.'
              : 'Discover opportunities matched to your profile.'}
          </p>
        </div>
        {role === 'ADMIN' && (
          <a href="/employer/jobs"
            className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-slate-100">
            + Post a Job
          </a>
        )}
      </div>

      {/* ── Search bar ── */}
      <div className="mt-8 flex max-w-5xl flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-2xl backdrop-blur sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-neutral-900">
          <Search size={16} className="shrink-0 text-neutral-400" />
          <input value={keyword} onChange={e => setKeyword(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            placeholder="Job title, keyword, or company" />
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-neutral-900">
          <MapPin size={16} className="shrink-0 text-neutral-400" />
          <input value={locationSearch} onChange={e => setLS(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            placeholder="Location" />
        </div>
      </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-neutral-400" size={32} />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[220px_1fr_260px]">

          {/* ── Left: Filters ── */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Filter jobs</p>
                  <h2 className="mt-1 text-lg font-black text-neutral-900 dark:text-white">Refine results</h2>
                </div>
                <button onClick={() => { setKeyword(''); setLS(''); clearAll(); }} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-black text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">Reset</button>
              </div>
              <p className="mt-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {filtered.length} of {jobs.length} jobs match your search.
              </p>
            </div>

            {/* Job Type */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Job Type</p>
                <button onClick={() => setSF('ALL')} className="text-xs text-neutral-400 hover:text-neutral-600">Clear</button>
              </div>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <button onClick={() => setSF('ALL')} className={`rounded-xl px-3 py-2 text-xs font-black transition ${scheduleFilter === 'ALL' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}>
                    All ({jobs.length})
                  </button>
                </li>
                {Object.entries(SCHEDULE_LABELS).map(([key, label]) => (
                  <li key={key}>
                    <button onClick={() => setSF(key)} className={`rounded-xl px-3 py-2 text-xs font-black transition ${scheduleFilter === key ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}>
                      {label} ({scheduleCounts[key] ?? 0})
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location */}
            {locations.length > 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Location</p>
                  <button onClick={() => setLF('ALL')} className="text-xs text-neutral-400 hover:text-neutral-600">Clear</button>
                </div>
                <ul className="space-y-2.5">
                  <li>
                    <button onClick={() => setLF('ALL')} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-black transition ${locationFilter === 'ALL' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}>
                      <span>All locations</span><span>{jobs.length}</span>
                    </button>
                  </li>
                  {visibleLoc.map(([loc, count]) => (
                    <li key={loc}>
                      <button onClick={() => setLF(loc)} className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-black transition ${locationFilter === loc ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}>
                        <span className="truncate">{loc}</span><span>{count}</span>
                      </button>
                    </li>
                  ))}
                  {locations.length > 5 && (
                    <li>
                      <button onClick={() => setShowMoreLoc(v => !v)} className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-neutral-600">
                        {showMoreLoc ? 'Less' : 'More'}
                        <ChevronDown size={12} className={`transition-transform ${showMoreLoc ? 'rotate-180' : ''}`} />
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Company */}
            {companies.length > 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Company</p>
                  <button onClick={() => setCF('ALL')} className="text-xs text-neutral-400 hover:text-neutral-600">Clear</button>
                </div>
                <ul className="space-y-2.5">
                  <li>
                    <button onClick={() => setCF('ALL')} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-black transition ${companyFilter === 'ALL' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}>
                      <span>All companies</span><span>{jobs.length}</span>
                    </button>
                  </li>
                  {visibleCo.map(([co, count]) => (
                    <li key={co}>
                      <button onClick={() => setCF(co)} className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-black transition ${companyFilter === co ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}>
                        <span className="truncate">{co}</span><span>{count}</span>
                      </button>
                    </li>
                  ))}
                  {companies.length > 8 && (
                    <li>
                      <button onClick={() => setShowMoreCo(v => !v)} className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-neutral-600">
                        {showMoreCo ? 'Less' : 'More'}
                        <ChevronDown size={12} className={`transition-transform ${showMoreCo ? 'rotate-180' : ''}`} />
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </aside>

          {/* ── Center: Cards ── */}
          <main className="min-w-0 space-y-4">
            {role === 'STUDENT' && (
              <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-100 px-5 py-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-900 text-white">
                  <Briefcase size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-neutral-900 dark:text-white">Complete your profile</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Earn skills and certificates so employers can see your verified UniStay profile.
                  </p>
                </div>
                <Link to="/student/learning" className="shrink-0 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-black text-white transition hover:bg-neutral-800">
                  Explore skills
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                Sort By:
                <span className="font-bold text-neutral-900 dark:text-white"> Date Posted</span>
                <ChevronDown size={14} />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
                <Briefcase size={32} className="mx-auto text-neutral-300 dark:text-neutral-600" />
                <p className="mt-4 font-black text-neutral-900 dark:text-white">No jobs found</p>
                <button onClick={() => { setKeyword(''); setLS(''); clearAll(); }}
                  className="mt-4 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                  Clear filters
                </button>
              </div>
            ) : filtered.map(j => {
              const currentStatus = applicationStatus[j.id];
              const hasApplied = Boolean(currentStatus) || applied.has(j.id);
              return (
              <div
                key={j.id}
                className={`rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition dark:border-neutral-800 dark:bg-neutral-900 ${role === 'STUDENT' && !hasApplied ? 'cursor-pointer hover:border-neutral-300 hover:shadow-md' : 'hover:border-neutral-300'} ${selected?.id === j.id ? 'ring-2 ring-neutral-900 dark:ring-white' : ''}`}
                onClick={role === 'STUDENT' && !hasApplied ? () => setSelected(j) : undefined}
              >
                <div className="flex gap-4">
                  {/* Company avatar */}
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 text-lg font-black text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                    {j.companyLogo
                      ? <img src={j.companyLogo} alt={j.company} className="h-full w-full object-contain p-1.5" />
                      : (j.company?.[0]?.toUpperCase() ?? <Briefcase size={18} />)
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-black text-neutral-900 dark:text-white">{j.title}</h2>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${SCHEDULE_COLOR[j.scheduleType] ?? 'bg-neutral-100 text-neutral-600'}`}>
                            {SCHEDULE_LABELS[j.scheduleType] ?? j.scheduleType}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                          {[j.company, j.location].filter(Boolean).join(' · ')}
                        </p>
                      </div>

                      {/* Role-specific action */}
                      <div onClick={e => e.stopPropagation()}>
                        {role === 'STUDENT' && (
                          hasApplied ? (
                            <span className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black ${APPLICATION_STATUS_COLOR[currentStatus || 'PENDING'] ?? APPLICATION_STATUS_COLOR.PENDING}`}>
                              <CheckCircle2 size={13} /> {APPLICATION_STATUS_LABEL[currentStatus || 'PENDING'] ?? currentStatus ?? 'PENDING'}
                            </span>
                          ) : (
                            <button onClick={() => setSelected(j)}
                              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
                              Apply now <ArrowRight size={13} />
                            </button>
                          )
                        )}
                        {role === 'HOST' && (
                          <button onClick={() => toggleSave(j.id)}
                            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${saved.has(j.id) ? 'border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-700'}`}>
                            {saved.has(j.id) ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                            {saved.has(j.id) ? 'Saved' : 'Save'}
                          </button>
                        )}
                        {role === 'ADMIN' && (
                          <button
                            onClick={() => deleteJob(j.id)}
                            disabled={deletingId === j.id}
                            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400"
                          >
                            {deletingId === j.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="mt-3 flex flex-wrap gap-5 text-xs">
                      {money(j.salary) && (
                        <div>
                          <p className="font-bold uppercase tracking-wide text-neutral-400">Salary</p>
                          <p className="mt-0.5 font-black text-neutral-900 dark:text-white">{money(j.salary)}</p>
                        </div>
                      )}
                      {j.deadline && (
                        <div>
                          <p className="font-bold uppercase tracking-wide text-neutral-400">Deadline</p>
                          <p className="mt-0.5 font-black text-neutral-900 dark:text-white">{j.deadline}</p>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {j.requiredSkills && j.requiredSkills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {j.requiredSkills.map(s => (
                          <span key={s} className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{s}</span>
                        ))}
                      </div>
                    )}

                    {j.createdAt && (
                      <p className="mt-2 text-xs text-neutral-400">Posted {timeAgo(j.createdAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </main>

          {/* ── Right: Subscribe + Companies ── */}
          <aside className="space-y-5">
            {/* Email alert */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm font-black text-neutral-900 dark:text-white">Get job alerts</p>
              <p className="mt-1 text-xs text-neutral-400">Be first to see new openings.</p>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                placeholder="your@email.com"
                className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" />
              <button onClick={() => { if (!email) return; toast.success('Subscribed!'); setEmail(''); }}
                className="mt-2 w-full rounded-xl border border-neutral-200 py-2 text-sm font-black text-neutral-900 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800">
                Subscribe
              </button>
            </div>

            {/* Companies */}
            {companies.slice(0, 8).length > 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm font-black text-neutral-900 dark:text-white">Popular companies</p>
                <ul className="mt-4 space-y-3">
                  {companies.slice(0, 8).map(([co, count]) => (
                    <li key={co}>
                      <button onClick={() => setCF(co)} className="flex w-full items-center gap-3 text-left transition hover:opacity-70">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-neutral-100 bg-neutral-50 text-xs font-black text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                          {co[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-neutral-900 dark:text-white">{co}</p>
                          <p className="text-xs text-neutral-400">{count} job{count !== 1 ? 's' : ''}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

        </div>
      )}

      {/* ApplicationPanel — student only */}
      {role === 'STUDENT' && selected && (
        <ApplicationPanel
          job={selected}
          applied={Boolean(applicationStatus[selected.id]) || applied.has(selected.id)}
          onClose={() => setSelected(null)}
          onSuccess={id => {
            setApplied(prev => new Set(prev).add(id));
            setApplicationStatus(prev => ({ ...prev, [id]: 'PENDING' }));
          }}
        />
      )}
    </div>
  );
}
