import { CheckCircle2 } from 'lucide-react';
import { courses, assignments, certificates } from '../../../data/mockData';
import Badge from '../../../components/ui/Badge';

export default function SkillsPage() {
  return (
    <div className="dark:bg-neutral-950">
      <section className="page-hero">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-black text-white sm:text-5xl">Skills, courses & certificates</h1>
          <p className="mt-3 max-w-xl text-neutral-400">Study courses, take exams and earn certificates that strengthen your job profile.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Available learning paths</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900">
              <div className="overflow-hidden">
                <img className="h-44 w-full object-cover transition duration-300 group-hover:scale-105" src={c.thumbnail} alt={c.title} />
              </div>
              <div className="p-5">
                <Badge>{c.category}</Badge>
                <h3 className="mt-3 font-black text-neutral-900 dark:text-white">{c.title}</h3>
                <p className="mt-1 text-sm text-neutral-500 line-clamp-2 dark:text-neutral-400">{c.description}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    <span>Progress</span><span>{c.progress}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
                <button className="btn-black mt-4 w-full rounded-xl">Continue learning</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">Available exams</h2>
            <div className="mt-5 space-y-3">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white">{a.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{a.questionCount} questions · Pass {a.passingScore}%</p>
                  </div>
                  <button className="btn-black rounded-lg px-3 py-1.5 text-xs">Take exam</button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">Your certificates</h2>
            <div className="mt-5 space-y-3">
              {certificates.length ? certificates.map((c) => (
                <div key={c.id} className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white">Certificate #{c.id}</p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Issued {c.issuedAt}</p>
                  </div>
                </div>
              )) : (
                <p className="py-4 text-center text-sm text-neutral-400">Complete a course to earn your first certificate.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
