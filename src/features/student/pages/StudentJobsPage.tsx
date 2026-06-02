<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Briefcase, CheckCircle2, Clock3, Loader2, MapPin, Search, Wallet, X } from 'lucide-react';
=======
import { useEffect, useState } from 'react';
import { Briefcase, Clock3, Loader2, MapPin, Search, Wallet } from 'lucide-react';
>>>>>>> main
import toast from 'react-hot-toast';
import { jobsApi } from '../../jobs/jobsApi';
import { applicationsApi } from '../../applications/applicationsApi';
import type { Job } from '../../jobs/jobsApi';

<<<<<<< HEAD
const money = (v?: number) => v ? `RWF ${v.toLocaleString()}` : null;
=======
export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
>>>>>>> main

const scheduleColor: Record<string, string> = {
  INTERNSHIP: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  PART_TIME:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  FULL_TIME:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

<<<<<<< HEAD
// ─── Application slide-over panel ────────────────────────────────────────────
=======
  const filtered = jobs.filter((job) =>
    `${job.title} ${job.location} ${job.scheduleType} ${(job.requiredSkills ?? []).join(' ')}`.toLowerCase().includes(search.toLowerCase())
  );
>>>>>>> main

function ApplicationPanel({
  job,
  applied,
  onClose,
  onSuccess,
}: {
  job: Job;
  applied: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
}) {
  const [whyFit, setWhyFit]           = useState('');
  const [confirmedSkills, setConfirmedSkills] = useState<Set<string>>(new Set());
  const [confirmedReqs, setConfirmedReqs]     = useState<Set<number>>(new Set());
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [errors, setErrors]           = useState<string[]>([]);

  const skills = job.requiredSkills ?? [];
  const reqs   = job.requirements ?? [];

  function toggleSkill(s: string) {
    setConfirmedSkills(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function toggleReq(i: number) {
    setConfirmedReqs(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function validate(): string[] {
    const e: string[] = [];
    if (whyFit.trim().length < 30)   e.push("Tell us why you're a good fit (at least 30 characters).");
    if (skills.length > 0 && confirmedSkills.size < skills.length)
      e.push('Please confirm you have all the required skills.');
    if (reqs.length > 0 && confirmedReqs.size < reqs.length)
      e.push('Please confirm you meet all requirements.');
    if (!agreedTerms) e.push('Please agree to submit your application.');
    return e;
  }

  async function submit() {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setSubmitting(true);
    try {
<<<<<<< HEAD
      await applicationsApi.apply(job.id);
      onSuccess(job.id);
      toast.success('Application submitted! The employer will review and contact you by email.');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit application.');
=======
      await applicationsApi.apply(jobId);
      setApplied((previous) => new Set(previous).add(jobId));
      toast.success('Application submitted. The employer will review your profile.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit application.');
>>>>>>> main
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-neutral-900 sm:border-l sm:border-neutral-200 sm:dark:border-neutral-800">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-5 dark:border-neutral-800">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Applying for</p>
            <h2 className="mt-1 truncate text-xl font-black text-neutral-900 dark:text-white">{job.title}</h2>
            {job.company && <p className="text-sm text-neutral-500 dark:text-neutral-400">{job.company}</p>}
          </div>
          <button onClick={onClose} className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Already applied */}
          {applied ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800/40 dark:bg-emerald-900/20">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600 dark:text-emerald-400" />
              <h3 className="mt-3 font-black text-emerald-800 dark:text-emerald-400">Already applied</h3>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-500">You've already submitted an application for this job. The employer will reach out by email.</p>
            </div>
          ) : (
            <>
              {/* Job overview */}
              <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
                <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
                  {money(job.salary) && <span className="flex items-center gap-1.5"><Wallet size={14} />{money(job.salary)}</span>}
                  <span className="flex items-center gap-1.5"><Clock3 size={14} />{job.scheduleType.replace('_', ' ')}</span>
                  {job.deadline && <span className="flex items-center gap-1.5"><Clock3 size={14} />Deadline: {job.deadline}</span>}
                </div>
                {job.description && <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{job.description}</p>}
              </div>

              {/* Step 1 — Skill checkboxes */}
              {skills.length > 0 && (
                <div>
                  <h3 className="mb-1 font-black text-neutral-900 dark:text-white">
                    Step 1 — Confirm your skills
                  </h3>
                  <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
                    Check each skill you genuinely have. The employer will verify during interview.
                  </p>
                  <div className="space-y-2">
                    {skills.map(s => (
                      <label key={s} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${confirmedSkills.has(s) ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800'}`}>
                        <input type="checkbox" checked={confirmedSkills.has(s)} onChange={() => toggleSkill(s)} className="h-4 w-4 accent-emerald-600" />
                        <span className={`text-sm font-semibold ${confirmedSkills.has(s) ? 'text-emerald-800 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'}`}>{s}</span>
                        {confirmedSkills.has(s) && <CheckCircle2 size={15} className="ml-auto text-emerald-600 dark:text-emerald-400" />}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 — Requirements */}
              {reqs.length > 0 && (
                <div>
                  <h3 className="mb-1 font-black text-neutral-900 dark:text-white">
                    Step {skills.length > 0 ? 2 : 1} — Confirm requirements
                  </h3>
                  <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
                    Tick each requirement you meet. Incomplete applications may be rejected.
                  </p>
                  <div className="space-y-2">
                    {reqs.map((req, i) => (
                      <label key={i} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${confirmedReqs.has(i) ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800'}`}>
                        <input type="checkbox" checked={confirmedReqs.has(i)} onChange={() => toggleReq(i)} className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
                        <span className={`text-sm ${confirmedReqs.has(i) ? 'text-emerald-800 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'}`}>{req}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 — Why are you a good fit */}
              <div>
                <h3 className="mb-1 font-black text-neutral-900 dark:text-white">
                  Step {[skills.length > 0, reqs.length > 0].filter(Boolean).length + 1} — Why are you a good fit?
                </h3>
                <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
                  Tell the employer what makes you a strong candidate. Minimum 30 characters.
                </p>
                <textarea
                  value={whyFit}
                  onChange={e => setWhyFit(e.target.value)}
                  rows={4}
                  placeholder="e.g. I have 2 years of experience in React and have completed 3 freelance projects. I'm available 20 hours per week and eager to grow in a professional environment."
                  className="input resize-none"
                />
                <p className={`mt-1 text-right text-xs ${whyFit.trim().length >= 30 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}>
                  {whyFit.trim().length} / 30+ characters
                </p>
              </div>

              {/* Final agreement */}
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${agreedTerms ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white' : 'border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800'}`}>
                <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-neutral-900 dark:accent-white" />
                <span className={`text-sm font-semibold leading-relaxed ${agreedTerms ? 'text-white dark:text-neutral-900' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  I confirm that all information above is accurate and I meet the requirements for this position.
                </span>
              </label>

              {/* Validation errors */}
              {errors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800/40 dark:bg-red-900/20">
                  <ul className="space-y-1">
                    {errors.map(e => (
                      <li key={e} className="text-xs font-semibold text-red-700 dark:text-red-400">• {e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — submit */}
        {!applied && (
          <div className="border-t border-neutral-200 p-5 dark:border-neutral-800">
            <button
              onClick={submit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-base font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : <><ArrowRight size={18} /> Submit application</>}
            </button>
            <p className="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-500">
              The employer will review your profile and contact you by email.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentJobsPage() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [schedule, setSchedule] = useState('ALL');
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Job | null>(null);

  useEffect(() => {
    jobsApi.getAll()
      .then(setJobs)
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    jobs.filter(j => {
      const text = `${j.title} ${j.company ?? ''} ${j.location} ${j.scheduleType} ${(j.requiredSkills ?? []).join(' ')}`.toLowerCase();
      return text.includes(search.toLowerCase()) && (schedule === 'ALL' || j.scheduleType === schedule);
    }),
    [jobs, search, schedule]
  );

  const categories = useMemo(() => [...new Set(jobs.map(j => j.category).filter(Boolean))], [jobs]);

  return (
    <div className="space-y-6">
<<<<<<< HEAD
      {/* Header + search */}
      <div className="card space-y-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Search Jobs</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Find opportunities that match your skills. Complete the application form to apply.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Job title, skill, company or location…"
            />
          </div>
          <select
            value={schedule}
            onChange={e => setSchedule(e.target.value)}
            className="input sm:w-44"
          >
            <option value="ALL">All schedules</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="PART_TIME">Part time</option>
            <option value="FULL_TIME">Full time</option>
          </select>
        </div>

        {/* Category quick-filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSearch('')} className={`rounded-full px-3 py-1 text-xs font-bold transition ${!search ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'border border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'}`}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSearch(cat!)} className={`rounded-full px-3 py-1 text-xs font-bold transition ${search === cat ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'border border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'}`}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
=======
      <section className="rounded-3xl bg-[#0a66c2] p-7 text-white sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">Student opportunities</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black sm:text-4xl">Find work that fits your next step.</h1>
        <p className="mt-3 max-w-xl text-sm text-blue-100">Discover internships and jobs, then apply with the skills you earn on UniStay+.</p>
        <div className="relative mt-6 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-neutral-900 outline-none" placeholder="Search title, location, schedule, or skill" />
        </div>
      </section>
>>>>>>> main

      {/* Results count */}
      {!loading && (
        <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          {filtered.length} {filtered.length === 1 ? 'job' : 'jobs'} found
          {applied.size > 0 && ` · ${applied.size} applied`}
        </p>
      )}

      {/* Job cards */}
      {loading ? (
        <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="card py-12 text-center">
          <Briefcase size={36} className="mx-auto text-neutral-300 dark:text-neutral-600" />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">No jobs match your search</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Try a different keyword or filter.</p>
          <button onClick={() => { setSearch(''); setSchedule('ALL'); }} className="btn-white mt-4 rounded-xl text-sm">Clear filters</button>
        </div>
      ) : (
<<<<<<< HEAD
        <div className="grid gap-4">
          {filtered.map(j => (
            <div
              key={j.id}
              className={`card cursor-pointer transition hover:shadow-md hover:-translate-y-0.5 ${selected?.id === j.id ? 'ring-2 ring-neutral-900 dark:ring-white' : ''}`}
              onClick={() => setSelected(j)}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-neutral-900 dark:text-white">{j.title}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${scheduleColor[j.scheduleType] ?? 'bg-neutral-100 text-neutral-600'}`}>
                      {j.scheduleType.replace('_', ' ')}
                    </span>
                    {j.category && (
                      <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">{j.category}</span>
                    )}
                  </div>

                  {j.company && <p className="mt-0.5 text-sm font-semibold text-neutral-500 dark:text-neutral-400">{j.company}</p>}

                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1"><MapPin size={13} />{j.location}</span>
                    {money(j.salary) && <span className="flex items-center gap-1"><Wallet size={13} />{money(j.salary)}</span>}
                    {j.deadline && <span className="flex items-center gap-1"><Clock3 size={13} />Deadline {j.deadline}</span>}
                  </div>

                  {j.requiredSkills && j.requiredSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {j.requiredSkills.map(s => (
                        <span key={s} className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{s}</span>
                      ))}
=======
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <p className="text-sm font-bold text-neutral-500">{filtered.length} opportunities found</p>
            {filtered.map((job) => (
              <article key={job.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition hover:border-blue-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#0a66c2] dark:bg-blue-900/30"><Briefcase size={21} /></span>
                    <div>
                      <h2 className="text-lg font-black text-neutral-900 dark:text-white">{job.title}</h2>
                      <p className="mt-0.5 text-sm font-semibold text-neutral-500">{job.company || 'UniStay+ employer'}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-neutral-500">
                        <span className="flex items-center gap-1"><MapPin size={13} />{job.location}</span>
                        <span className="flex items-center gap-1"><Clock3 size={13} />{job.scheduleType}</span>
                        {job.salary && <span className="flex items-center gap-1"><Wallet size={13} />RWF {job.salary.toLocaleString()}</span>}
                      </div>
>>>>>>> main
                    </div>
                  </div>
                  {applied.has(job.id) ? (
                    <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Applied</span>
                  ) : (
                    <button disabled={applying === job.id} onClick={() => apply(job.id)} className="rounded-full bg-[#0a66c2] px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60">
                      {applying === job.id ? 'Applying...' : 'Apply now'}
                    </button>
                  )}
                </div>
<<<<<<< HEAD

                <div className="shrink-0">
                  {applied.has(j.id) ? (
                    <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CheckCircle2 size={15} /> Applied
                    </span>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(j); }}
                      className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                    >
                      Apply now <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
=======
                {job.description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-neutral-500">{job.description}</p>}
                {job.requiredSkills && job.requiredSkills.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{job.requiredSkills.map((skill) => <span key={skill} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{skill}</span>)}</div>}
              </article>
            ))}
            {filtered.length === 0 && <div className="card py-10 text-center"><p className="font-black">No jobs match your search</p><button onClick={() => setSearch('')} className="btn-white mt-4">Clear search</button></div>}
          </div>
          <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-24">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-[#0a66c2] dark:bg-blue-900/30"><Briefcase size={20} /></span>
            <h2 className="mt-4 font-black text-neutral-900 dark:text-white">Make your profile stand out</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">Complete learning paths and earn verified skills before applying. Employers can review your compatibility.</p>
          </aside>
>>>>>>> main
        </div>
      )}

      {/* Application slide-over */}
      {selected && (
        <ApplicationPanel
          job={selected}
          applied={applied.has(selected.id)}
          onClose={() => setSelected(null)}
          onSuccess={id => setApplied(prev => new Set(prev).add(id))}
        />
      )}
    </div>
  );
}
