import { useMemo, useState } from 'react';
import { Briefcase, Clock3, MapPin, Search, Wallet } from 'lucide-react';
import { jobs, courses } from '../../../data/mockData';
import Badge from '../../../components/ui/Badge';

export default function JobsPage() {
  const [keyword, setKeyword] = useState('');
  const [schedule, setSchedule] = useState('ALL');

  const categories = [...new Set(jobs.map((j) => j.category))];

  const filtered = useMemo(
    () =>
      jobs.filter((job) => {
        const text = (job.title + ' ' + job.category + ' ' + job.requiredSkills.join(' ')).toLowerCase();
        return text.includes(keyword.toLowerCase()) && (schedule === 'ALL' || job.scheduleType === schedule);
      }),
    [keyword, schedule]
  );

  return (
    <div className="dark:bg-neutral-950">
      {/* hero + search */}
      <section className="border-b border-neutral-200 bg-neutral-950 px-4 py-16 text-white dark:border-neutral-800 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow text-neutral-400">Job marketplace</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
            Student jobs & internships
          </h1>
          <p className="mt-4 max-w-xl text-base text-neutral-400">
            Find opportunities matched to your skills and certificates. Employers review your profile for compatibility.
          </p>

          <div className="mt-8 grid gap-2 rounded-2xl bg-white p-2 sm:grid-cols-[1fr_180px_auto]">
            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-neutral-900">
              <Search size={16} className="shrink-0 text-neutral-400" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Job title, skill or category…"
              />
            </div>
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none"
            >
              <option value="ALL">All schedules</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="PART_TIME">Part time</option>
              <option value="FULL_TIME">Full time</option>
            </select>
            <button className="btn-black rounded-xl px-5 py-3">Search</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {/* categories */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setKeyword(cat)}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-left transition hover:border-neutral-400 hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <Briefcase size={18} className="text-neutral-700 dark:text-neutral-300" />
              </div>
              <div>
                <p className="font-black text-neutral-900 dark:text-white">{cat}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {jobs.filter((j) => j.category === cat).length} openings
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* job listings */}
        <div className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <p className="eyebrow">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="space-y-4">
            {filtered.map((j) => {
              const requiredCourses = courses.filter((c) => j.requiredCourseIds?.includes(c.id));
              return (
                <div
                  key={j.id}
                  className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-card transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2">
                        <Badge>{j.category}</Badge>
                        <Badge>{j.scheduleType}</Badge>
                      </div>

                      <h2 className="mt-3 text-xl font-black text-neutral-900 dark:text-white">
                        {j.title}
                      </h2>
                      <p className="mt-0.5 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                        {j.company}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1.5"><MapPin size={14} />{j.location}</span>
                        <span className="flex items-center gap-1.5"><Wallet size={14} />RWF {j.salary.toLocaleString()}</span>
                        <span className="flex items-center gap-1.5"><Clock3 size={14} />Deadline {j.deadline}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {j.requiredSkills.map((s: string) => (
                          <span key={s} className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            {s}
                          </span>
                        ))}
                      </div>

                      {requiredCourses.length > 0 && (
                        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="font-bold">Linked course:</span> {requiredCourses.map((c) => c.title).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 md:text-right">
                      <button className="btn-black w-full rounded-xl md:w-auto">
                        Apply now
                      </button>
                      <p className="mt-2 text-xs text-neutral-400">Employer reviews compatibility</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg font-black text-neutral-900 dark:text-white">No jobs found</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Try a different keyword or schedule filter.</p>
                <button onClick={() => { setKeyword(''); setSchedule('ALL'); }} className="btn-white mt-4">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
