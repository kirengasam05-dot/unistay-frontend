import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, Loader2, PlayCircle, Search } from 'lucide-react';
import { useCoursesQuery } from '../../courses/hooks/useCoursesQueries';
import { useLearningProfileQuery } from '../hooks/useLearningProfileQuery';
import { courseEnrollment } from '../learningProfileApi';

export default function StudentLearningPage() {
  const [search, setSearch] = useState('');
  const { data: courses = [], isPending: loading } = useCoursesQuery();
  const { data: learningProfile } = useLearningProfileQuery();

  const visibleCourses = courses.filter((course) =>
    `${course.title} ${course.category || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <section className="overflow-hidden rounded-xl bg-slate-950 p-7 text-white sm:p-9">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">Learn at your pace</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-black sm:text-4xl">Skills that move your career forward.</h1>
          <p className="mt-3 max-w-xl text-sm text-slate-300">Watch lessons, use study materials, take the exam, and earn verified skills for your profile.</p>
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="What do you want to learn?" className="w-full rounded-xl bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none" />
          </div>
        </section>

        {loading ? (
          <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
        ) : visibleCourses.length === 0 ? (
          <div className="card py-12 text-center"><p className="font-black">No courses found</p><p className="mt-1 text-sm text-neutral-500">Try another search or check back soon.</p></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <article key={course.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                <div className="relative h-40 bg-gradient-to-br from-violet-700 to-slate-950">
                  {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />}
                  <PlayCircle className="absolute bottom-3 right-3 text-white drop-shadow" size={34} />
                  {(courseEnrollment(learningProfile, course.id)?.progress || 0) >= 100 && <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white"><CheckCircle2 size={14} /> Completed</span>}
                </div>
                <div className="p-5">
                  {course.category && <span className="text-xs font-black uppercase tracking-wide text-violet-600 dark:text-violet-300">{course.category}</span>}
                  <h2 className="mt-2 text-lg font-black text-neutral-900 dark:text-white">{course.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">{course.description || 'Build practical skills with guided lessons and a final assessment.'}</p>
                  <p className="mt-3 flex items-center gap-1 text-xs font-bold text-neutral-500"><Clock3 size={13} /> Self-paced course</p>
                  <Link to={`/student/learning/${course.id}`} className="btn-black mt-5 block w-full rounded-xl text-center">{(courseEnrollment(learningProfile, course.id)?.progress || 0) >= 100 ? 'View completed course' : 'View course'}</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
  );
}
