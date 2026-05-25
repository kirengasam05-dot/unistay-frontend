import { Award, Download } from 'lucide-react';

export default function StudentCertificatesPage() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Certificates</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Certificates strengthen your student profile and improve job compatibility scoring.
        </p>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Award size={22} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Issued certificate</p>
              <h2 className="mt-0.5 font-black text-neutral-900 dark:text-white">React Fundamentals for Student Jobs</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Issued by UniStay+ Learning</p>
            </div>
          </div>
          <button className="btn-black shrink-0 rounded-xl flex items-center gap-2">
            <Download size={15} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
