import { Link } from 'react-router-dom';
import { courses } from '../../../data/mockData';

export default function StudentLearningPage() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Courses & Skills</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Study uploaded videos and materials, complete all lessons, take the exam, then receive your certificate to improve your profile.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {courses.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900">
            <img src={c.thumbnail} className="h-44 w-full object-cover" alt={c.title} />
            <div className="p-5">
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {c.category}
              </span>
              <h2 className="mt-3 text-lg font-black text-neutral-900 dark:text-white">{c.title}</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {c.materials} materials · Final exam: {c.exam}
              </p>

              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  <span>Progress</span><span>{c.progress}%</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${c.progress}%` }} />
                </div>
              </div>

              <Link to="/student/assignments" className="btn-black mt-5 w-full rounded-xl text-center">
                Continue course
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
