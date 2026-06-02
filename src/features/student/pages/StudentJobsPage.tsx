import { useEffect, useState } from 'react';
import { Briefcase, Clock3, Loader2, MapPin, Search, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsApi } from '../../jobs/jobsApi';
import { applicationsApi } from '../../applications/applicationsApi';
import type { Job } from '../../jobs/jobsApi';

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    jobsApi.getAll().then(setJobs).catch(() => toast.error('Failed to load jobs')).finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((job) =>
    `${job.title} ${job.location} ${job.scheduleType} ${(job.requiredSkills ?? []).join(' ')}`.toLowerCase().includes(search.toLowerCase())
  );

  async function apply(jobId: string) {
    setApplying(jobId);
    try {
      await applicationsApi.apply(jobId);
      setApplied((previous) => new Set(previous).add(jobId));
      toast.success('Application submitted. The employer will review your profile.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit application.');
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#0a66c2] p-7 text-white sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">Student opportunities</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black sm:text-4xl">Find work that fits your next step.</h1>
        <p className="mt-3 max-w-xl text-sm text-blue-100">Discover internships and jobs, then apply with the skills you earn on UniStay+.</p>
        <div className="relative mt-6 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-neutral-900 outline-none" placeholder="Search title, location, schedule, or skill" />
        </div>
      </section>

      {loading ? (
        <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
      ) : (
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
        </div>
      )}
    </div>
  );
}
