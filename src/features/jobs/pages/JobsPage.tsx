import { useEffect, useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, Briefcase, ChevronDown, Loader2, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jobsApi } from '../jobsApi';
import type { Job } from '../jobsApi';

const SCHEDULE_LABELS: Record<string, string> = {
  INTERNSHIP: 'Internship',
  PART_TIME: 'Part Time',
  FULL_TIME: 'Full Time',
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export default function JobsPage() {
  const [jobs, setJobs]               = useState<Job[]>([]);
  const [loading, setLoading]         = useState(true);
  const [keyword, setKeyword]         = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter]   = useState('ALL');
  const [saved, setSaved]             = useState<Set<string>>(new Set());
  const [showMoreLocations, setShowMoreLocations] = useState(false);
  const [showMoreCompanies, setShowMoreCompanies] = useState(false);
  const [email, setEmail]             = useState('');

  useEffect(() => {
    jobsApi.getAll().then(setJobs).catch(() => setJobs([])).finally(() => setLoading(false));
  }, []);

  const locations = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => { if (j.location) counts[j.location] = (counts[j.location] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const companies = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => { if (j.company) counts[j.company] = (counts[j.company] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const scheduleCounts = useMemo(() => {
    const counts: Record<string, number> = { INTERNSHIP: 0, PART_TIME: 0, FULL_TIME: 0 };
    jobs.forEach(j => { if (j.scheduleType in counts) counts[j.scheduleType]++; });
    return counts;
  }, [jobs]);

  const filtered = useMemo(() =>
    jobs.filter(j => {
      const text = `${j.title} ${j.company ?? ''} ${j.category ?? ''} ${(j.requiredSkills ?? []).join(' ')}`.toLowerCase();
      return (
        text.includes(keyword.toLowerCase()) &&
        (!locationSearch || j.location.toLowerCase().includes(locationSearch.toLowerCase())) &&
        (scheduleFilter === 'ALL' || j.scheduleType === scheduleFilter) &&
        (locationFilter === 'ALL' || j.location === locationFilter) &&
        (companyFilter === 'ALL' || j.company === companyFilter)
      );
    }),
    [jobs, keyword, locationSearch, scheduleFilter, locationFilter, companyFilter]
  );

  function toggleSave(id: string) {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearAll() {
    setScheduleFilter('ALL');
    setLocationFilter('ALL');
    setCompanyFilter('ALL');
  }

  const visibleLocations = showMoreLocations ? locations : locations.slice(0, 5);
  const visibleCompanies = showMoreCompanies ? companies : companies.slice(0, 8);
  const popularCompanies = companies.slice(0, 8);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
<section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-slate-950 px-4 py-16 text-white sm:px-6 lg:py-20">
        <img
          src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1800&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-blue-300">Student opportunities</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Find jobs and internships that match your skills.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
            Search verified opportunities, save roles, and apply with the profile and certificates you build on UniStay+.
          </p>
          <div className="mt-8 flex max-w-5xl flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-2xl backdrop-blur sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-neutral-900">
              <Search size={16} className="shrink-0 text-neutral-400" />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Search job title, keywords or company"
              />
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-neutral-900">
              <MapPin size={16} className="shrink-0 text-neutral-400" />
              <input
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Location"
              />
            </div>
            <button className="rounded-xl bg-neutral-900 px-8 py-3 text-sm font-black text-white transition hover:bg-neutral-800">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="grid place-items-center py-32">
            <Loader2 className="animate-spin text-neutral-400" size={32} />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[220px_1fr_260px]">

            {/* ── Left: Filters ────────────────────────────────────── */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Filter jobs</p>
                    <h2 className="mt-1 text-lg font-black text-neutral-900 dark:text-white">Refine results</h2>
                  </div>
                  <button onClick={() => { setKeyword(''); setLocationSearch(''); clearAll(); }} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-black text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                    Reset
                  </button>
                </div>
                <p className="mt-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  {filtered.length} of {jobs.length} jobs match your search.
                </p>
              </div>

              {/* Job Type */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Job Type</p>
                  <button onClick={() => setScheduleFilter('ALL')} className="text-xs text-neutral-400 hover:text-neutral-600">Clear</button>
                </div>
                <ul className="flex flex-wrap gap-2">
                  <li>
                    <button
                      onClick={() => setScheduleFilter('ALL')}
                      className={`rounded-xl px-3 py-2 text-xs font-black transition ${scheduleFilter === 'ALL' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}
                    >
                      All ({jobs.length})
                    </button>
                  </li>
                  {Object.entries(SCHEDULE_LABELS).map(([key, label]) => (
                    <li key={key}>
                      <button
                        onClick={() => setScheduleFilter(key)}
                        className={`rounded-xl px-3 py-2 text-xs font-black transition ${scheduleFilter === key ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}
                      >
                        {label} ({scheduleCounts[key] ?? 0})
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Location */}
              {locations.length > 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Location</p>
                    <button onClick={() => setLocationFilter('ALL')} className="text-xs text-neutral-400 hover:text-neutral-600">Clear</button>
                  </div>
                  <ul className="space-y-2.5">
                    <li>
                      <button
                        onClick={() => setLocationFilter('ALL')}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-black transition ${locationFilter === 'ALL' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}
                      >
                        <span>All locations</span><span>{jobs.length}</span>
                      </button>
                    </li>
                    {visibleLocations.map(([loc, count]) => (
                      <li key={loc}>
                        <button
                          onClick={() => setLocationFilter(loc)}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-black transition ${locationFilter === loc ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}
                        >
                          <span className="truncate">{loc}</span><span>{count}</span>
                        </button>
                      </li>
                    ))}
                    {locations.length > 5 && (
                      <li>
                        <button
                          onClick={() => setShowMoreLocations(v => !v)}
                          className="flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-700"
                        >
                          {showMoreLocations ? 'Less' : 'More'}
                          <ChevronDown size={12} className={`transition-transform ${showMoreLocations ? 'rotate-180' : ''}`} />
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Company */}
              {companies.length > 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Company</p>
                    <button onClick={() => setCompanyFilter('ALL')} className="text-xs text-neutral-400 hover:text-neutral-600">Clear</button>
                  </div>
                  <ul className="space-y-2.5">
                    <li>
                      <button
                        onClick={() => setCompanyFilter('ALL')}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-black transition ${companyFilter === 'ALL' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}
                      >
                        <span>All companies</span><span>{jobs.length}</span>
                      </button>
                    </li>
                    {visibleCompanies.map(([company, count]) => (
                      <li key={company}>
                        <button
                          onClick={() => setCompanyFilter(company)}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-black transition ${companyFilter === company ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}
                        >
                          <span className="truncate">{company}</span><span>{count}</span>
                        </button>
                      </li>
                    ))}
                    {companies.length > 8 && (
                      <li>
                        <button
                          onClick={() => setShowMoreCompanies(v => !v)}
                          className="flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-700"
                        >
                          {showMoreCompanies ? 'Less' : 'More'}
                          <ChevronDown size={12} className={`transition-transform ${showMoreCompanies ? 'rotate-180' : ''}`} />
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </aside>

            {/* ── Center: Job listings ──────────────────────────────── */}
            <main className="min-w-0 space-y-4">

              {/* Profile CTA banner */}
              <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-5 py-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-900 text-white">
                  <Briefcase size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-neutral-900 dark:text-white">Complete your profile</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Earn skills and certificates — employers will see your verified UniStay profile.
                  </p>
                </div>
                <Link
                  to="/skills"
                  className="shrink-0 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-black text-white transition hover:bg-neutral-800"
                >
                  Explore skills
                </Link>
              </div>

              {/* Results bar */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
                </p>
                <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Sort By:
                  <span className="font-bold text-neutral-900 dark:text-white"> Date Posted</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Cards */}
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
                  <Briefcase size={32} className="mx-auto text-neutral-300 dark:text-neutral-600" />
                  <p className="mt-4 font-black text-neutral-900 dark:text-white">No jobs found</p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Try a different keyword or clear the filters.
                  </p>
                  <button
                    onClick={() => { setKeyword(''); setLocationSearch(''); clearAll(); }}
                    className="mt-4 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(j => (
                    <div
                      key={j.id}
                      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 dark:border-neutral-700 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <div className="flex gap-4">
                        {/* Company logo / initial */}
                        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 text-lg font-black text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                          {j.companyLogo
                            ? <img src={j.companyLogo} alt={j.company} className="h-full w-full object-contain p-1.5" />
                            : (j.company?.[0]?.toUpperCase() ?? <Briefcase size={20} />)
                          }
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h2 className="text-base font-black text-neutral-900 dark:text-white">{j.title}</h2>
                              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                                {[j.company, j.location].filter(Boolean).join(' · ')}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleSave(j.id)}
                              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                                saved.has(j.id)
                                  ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300'
                                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-700'
                              }`}
                            >
                              {saved.has(j.id) ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                              {saved.has(j.id) ? 'Saved' : 'Save Job'}
                            </button>
                          </div>

                          {/* Meta columns */}
                          <div className="mt-3 flex flex-wrap gap-6 text-xs">
                            <div>
                              <p className="font-bold uppercase tracking-wide text-neutral-400">Job Type</p>
                              <p className="mt-0.5 font-black text-neutral-900 dark:text-white">
                                {SCHEDULE_LABELS[j.scheduleType] ?? j.scheduleType}
                              </p>
                            </div>
                            {j.salary && (
                              <div>
                                <p className="font-bold uppercase tracking-wide text-neutral-400">Salary</p>
                                <p className="mt-0.5 font-black text-neutral-900 dark:text-white">
                                  RWF {j.salary.toLocaleString()}
                                  <span className="font-normal text-neutral-400"> per year</span>
                                </p>
                              </div>
                            )}
                            {j.deadline && (
                              <div>
                                <p className="font-bold uppercase tracking-wide text-neutral-400">Deadline</p>
                                <p className="mt-0.5 font-black text-neutral-900 dark:text-white">{j.deadline}</p>
                              </div>
                            )}
                          </div>

                          {/* Required skills */}
                          {j.requiredSkills && j.requiredSkills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {j.requiredSkills.map(s => (
                                <span
                                  key={s}
                                  className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Posted time */}
                          {j.createdAt && (
                            <p className="mt-3 text-xs text-neutral-400">
                              Posted {timeAgo(j.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>

            {/* ── Right: Subscribe + Popular companies ──────────────── */}
            <aside className="space-y-6">

              {/* Job alert subscription */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm font-black text-neutral-900 dark:text-white">
                  Be the first to see new jobs
                  {locationFilter !== 'ALL' && (
                    <span className="text-neutral-900 dark:text-white"> in {locationFilter}</span>
                  )}
                </p>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="your@email.com"
                  className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
                />
                <button
                  onClick={() => {
                    if (!email) return;
                    toast.success('Subscribed! You\'ll be notified of new jobs.');
                    setEmail('');
                  }}
                  className="mt-2 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 py-2.5 text-sm font-black text-neutral-900 dark:text-white transition hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800/50"
                >
                  Subscribe Now
                </button>
                <p className="mt-2 text-center text-xs text-neutral-400">
                  Not interested.{' '}
                  <button className="underline hover:text-neutral-600">Hide now</button>
                </p>
              </div>

              {/* Popular companies */}
              {popularCompanies.length > 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                  <p className="text-sm font-black text-neutral-900 dark:text-white">
                    Popular
                    {locationFilter !== 'ALL'
                      ? <span className="text-neutral-900 dark:text-white"> in {locationFilter}</span>
                      : ' companies'
                    }
                  </p>
                  <ul className="mt-4 space-y-3">
                    {popularCompanies.map(([company, count]) => (
                      <li key={company}>
                        <button
                          onClick={() => setCompanyFilter(company)}
                          className="flex w-full items-center gap-3 text-left transition hover:opacity-70"
                        >
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-neutral-100 bg-neutral-50 text-sm font-black text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                            {company[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-neutral-900 dark:text-white">{company}</p>
                            <p className="text-xs text-neutral-400">{count} Job{count !== 1 ? 's' : ''}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setCompanyFilter('ALL')}
                    className="mt-4 text-xs font-bold text-neutral-900 dark:text-white hover:underline"
                  >
                    See all jobs &rsaquo;
                  </button>
                </div>
              )}
            </aside>

          </div>
        )}
      </div>
    </div>
  );
}
