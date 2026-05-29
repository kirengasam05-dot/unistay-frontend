import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CheckCircle2 } from 'lucide-react';
import { jobsApi } from '../jobs/jobsApi';
import { applications } from '../../data/mockData';
import { extractList } from '../../types/api';

export default function EmployerDashboard() {
  const [jobCount, setJobCount] = useState<number | null>(null);

  useEffect(() => {
    jobsApi.list()
      .then((res) => setJobCount(extractList(res.data).length))
      .catch(() => setJobCount(0));
  }, []);

  const stats = [
    { label: 'Published jobs', value: jobCount === null ? '…' : String(jobCount), color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30', icon: Briefcase },
    { label: 'Pending applications', value: String(applications.length), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: Users },
    { label: 'Compatibility checks', value: 'Active', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white dark:bg-neutral-800 sm:p-8">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative">
          <h2 className="text-2xl font-black leading-tight sm:text-3xl">Create jobs &amp; review student compatibility.</h2>
          <p className="mt-3 max-w-lg text-sm text-neutral-400">Job creation and application review. Courses, exams and assignments are managed by admin.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-white rounded-xl" to="/employer/jobs">Create job</Link>
            <Link className="btn rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" to="/employer/applications">Review applications</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{s.label}</p>
                <p className={`mt-0.5 text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 className="text-xl font-black text-neutral-900 dark:text-white">Application decision flow</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {['Receive application', 'Check required skills', 'Accept or reject', 'Send email result'].map((x, i) => (
            <div key={x} className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
              <p className="text-2xl font-black text-neutral-900 dark:text-white">0{i + 1}</p>
              <p className="mt-2 font-semibold text-neutral-700 dark:text-neutral-300">{x}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
