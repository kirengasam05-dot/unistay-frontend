import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function StudentAssignmentsPage() {
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Assignments & Exams</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Complete study materials first, then take the exam. A passing score unlocks your certificate.
        </p>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">React Practical Exam</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">20 questions · 45 minutes · Passing score 70%</p>
          </div>
          {done ? (
            <span className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle2 size={16} /> Passed · 86%
            </span>
          ) : (
            <button onClick={() => setDone(true)} className="btn-black rounded-xl">
              Take exam
            </button>
          )}
        </div>

        {done && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="font-bold text-emerald-800 dark:text-emerald-300">Congratulations!</p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
              Your certificate is now available and your profile score has increased.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
