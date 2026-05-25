import { Link } from 'react-router-dom';
import { applications, jobs } from '../../data/mockData';

export default function EmployerDashboard() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white dark:bg-neutral-800 sm:p-8">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative">
          <p className="eyebrow text-neutral-400">Employer workspace</p>
          <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">Create jobs & review student compatibility.</h2>
          <p className="mt-3 max-w-lg text-sm text-neutral-400">Job creation and application review. Courses, exams and assignments are managed by admin.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-white rounded-xl" to="/employer/jobs">Create job</Link>
            <Link className="btn rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" to="/employer/applications">Review applications</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Published jobs', value: jobs.length, color: 'text-neutral-900 dark:text-white' },
          { label: 'Pending applications', value: applications.length, color: 'text-violet-600 dark:text-violet-400' },
          { label: 'Compatibility checks', value: 'Active', color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{s.label}</p>
            <p className={`mt-2 text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-black text-neutral-900 dark:text-white">Application decision flow</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {['Receive application', 'Check required skills', 'Accept or reject', 'Send email result'].map((x, i) => (
            <div key={x} className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
              <p className="text-2xl font-black text-neutral-900 dark:text-white">0{i + 1}</p>
              <p className="mt-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">{x}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
