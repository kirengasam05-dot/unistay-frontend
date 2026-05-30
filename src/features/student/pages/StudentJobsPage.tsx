import { useEffect, useState } from 'react';
import { MapPin, Wallet, Clock3, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsApi } from '../../jobs/jobsApi';
import { applicationsApi } from '../../applications/applicationsApi';
import type { Job } from '../../jobs/jobsApi';

export default function StudentJobsPage() {
  const [jobs, setJobs]         = useState<Job[]>([]);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied]   = useState<Set<string>>(new Set());
  const [search, setSearch]     = useState('');

  useEffect(() => {
    jobsApi.getAll()
      .then(setJobs)
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j =>
    (j.title + j.location + j.scheduleType + (j.requiredSkills ?? []).join(' '))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function apply(jobId: string) {
    setApplying(jobId);
    try {
      await applicationsApi.apply(jobId);
      setApplied(prev => new Set(prev).add(jobId));
      toast.success('Application submitted! The employer will review compatibility.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Search Jobs</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Apply to jobs that match your skills. The employer will review compatibility and send you the result by email.
        </p>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input mt-5"
          placeholder="Search by title, location, schedule or skill…"
        />
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(j => (
            <div key={j.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white">{j.title}</h2>
                  {j.company && <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{j.company}</p>}
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1"><MapPin size={13} />{j.location}</span>
                    <span className="flex items-center gap-1"><Clock3 size={13} />{j.scheduleType}</span>
                    {j.salary && <span className="flex items-center gap-1"><Wallet size={13} />RWF {j.salary.toLocaleString()}</span>}
                  </div>
                  {j.requiredSkills && j.requiredSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {j.requiredSkills.map(s => (
                        <span key={s} className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {applied.has(j.id) ? (
                  <span className="shrink-0 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Applied — email pending
                  </span>
                ) : (
                  <button
                    disabled={applying === j.id}
                    onClick={() => apply(j.id)}
                    className="btn-black shrink-0 rounded-xl disabled:opacity-60 flex items-center gap-2"
                  >
                    {applying === j.id && <Loader2 size={14} className="animate-spin" />}
                    Apply now
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="card py-10 text-center">
              <p className="font-black text-neutral-900 dark:text-white">No jobs match your search</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Try a different keyword.</p>
              <button onClick={() => setSearch('')} className="btn-white mt-4">Clear search</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
