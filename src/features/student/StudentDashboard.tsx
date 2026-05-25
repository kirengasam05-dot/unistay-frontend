import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Briefcase, Building2, CheckCircle2 } from 'lucide-react';
import { courses, housings, jobs } from '../../data/mockData';

function Stat({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon size={19} /></div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white dark:bg-neutral-800 sm:p-8">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 right-20 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative">
          <h2 className="text-2xl font-black leading-tight sm:text-3xl">Book housing, apply for jobs,<br className="hidden sm:block" /> learn and earn certificates.</h2>
          <p className="mt-3 max-w-lg text-sm text-neutral-400">Payment is only released after your host confirms. Applications are matched by skill compatibility.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-white rounded-xl" to="/student/booking">Start housing booking</Link>
            <Link className="btn rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" to="/student/learning">Continue learning</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Available housing" value={String(housings.filter((h) => h.availability).length)} icon={Building2} color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" />
        <Stat label="Matched jobs" value={String(jobs.length)} icon={Briefcase} color="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" />
        <Stat label="Course progress" value="80%" icon={BookOpen} color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" />
        <Stat label="Certificates" value="1" icon={CheckCircle2} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-neutral-900 dark:text-white">Booking process</h3>
            <Link to="/student/booking" className="flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Start <ArrowRight size={13} /></Link>
          </div>
          <div className="mt-5 space-y-3">
            {['Choose verified housing', 'Send booking request', 'Wait for host confirmation', 'Pay only after confirmed', 'Move in safely'].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">{i + 1}</span>
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-neutral-900 dark:text-white">Learning path</h3>
            <Link to="/student/learning" className="flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">All courses <ArrowRight size={13} /></Link>
          </div>
          <div className="mt-5 space-y-4">
            {courses.slice(0, 3).map((c) => (
              <div key={c.id} className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-neutral-900 dark:text-white">{c.title}</p>
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{c.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
