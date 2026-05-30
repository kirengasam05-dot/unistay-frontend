import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { coursesApi } from '../../courses/coursesApi';
import { skillsApi } from '../skillsApi';
import type { Course } from '../../courses/coursesApi';
import type { Certificate, Assignment } from '../skillsApi';
import Badge from '../../../components/ui/Badge';

export default function SkillsPage() {
  const [courses, setCourses]           = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [assignments, setAssignments]   = useState<Assignment[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      coursesApi.getAll().catch(() => [] as Course[]),
      skillsApi.getCertificates().catch(() => [] as Certificate[]),
      skillsApi.getAssignments().catch(() => [] as Assignment[]),
    ]).then(([c, certs, assign]) => {
      setCourses(c);
      setCertificates(certs);
      setAssignments(assign);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dark:bg-neutral-950">
      <section className="border-b border-neutral-200 bg-neutral-950 px-4 py-16 text-white dark:border-neutral-800 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow text-neutral-400">Learning & certification</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Skills, courses & certificates</h1>
          <p className="mt-4 max-w-xl text-base text-neutral-400">
            Study employer-uploaded courses, complete exams, and earn certificates that strengthen your job profile score.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {loading ? (
          <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
        ) : (
          <>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="eyebrow">Courses</p>
                <h2 className="mt-1 text-2xl font-black text-neutral-900 dark:text-white">Available learning paths</h2>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 py-12 text-center dark:border-neutral-800">
                <p className="font-black text-neutral-900 dark:text-white">No courses available yet</p>
                <p className="mt-1 text-sm text-neutral-500">Check back soon for new learning content.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map(c => (
                  <div key={c.id} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900">
                    {c.thumbnail && (
                      <div className="relative overflow-hidden">
                        <img className="h-44 w-full object-cover transition duration-300 group-hover:scale-105" src={c.thumbnail} alt={c.title} />
                      </div>
                    )}
                    <div className="p-5">
                      {c.category && <Badge>{c.category}</Badge>}
                      <h3 className="mt-3 text-lg font-black text-neutral-900 dark:text-white">{c.title}</h3>
                      {c.description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{c.description}</p>}
                      {c.progress !== undefined && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            <span>Progress</span><span>{c.progress}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${c.progress}%` }} />
                          </div>
                        </div>
                      )}
                      <button className="btn-black mt-4 w-full rounded-xl">Continue learning</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-16 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
                <p className="eyebrow">Assessments</p>
                <h2 className="mt-1 text-xl font-black text-neutral-900 dark:text-white">Available exams</h2>
                <div className="mt-5 space-y-3">
                  {assignments.length === 0 && (
                    <p className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">No exams available yet.</p>
                  )}
                  {assignments.map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">{a.title}</p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                          {a.questionCount} questions · Pass {a.passingScore}%
                        </p>
                      </div>
                      <button className="btn-black rounded-lg px-3 py-1.5 text-xs">Take exam</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
                <p className="eyebrow">Achievements</p>
                <h2 className="mt-1 text-xl font-black text-neutral-900 dark:text-white">Your certificates</h2>
                <div className="mt-5 space-y-3">
                  {certificates.length === 0 && (
                    <p className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">Complete a course to earn your first certificate.</p>
                  )}
                  {certificates.map(c => (
                    <div key={c.id} className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">{c.title || `Certificate #${c.id}`}</p>
                        {c.issuedAt && <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Issued {c.issuedAt}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
