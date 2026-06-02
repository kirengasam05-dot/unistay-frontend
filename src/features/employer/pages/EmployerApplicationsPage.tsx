import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, MoreHorizontal, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsApi } from '../../jobs/jobsApi';
import { applicationsApi } from '../../applications/applicationsApi';
import type { Application } from '../../applications/applicationsApi';

type Filter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
const PAGE_SIZE = 8;

function StatusPill({ status }: { status: Application['status'] }) {
  if (status === 'ACCEPTED') return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-400">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Completed
    </span>
  );
  if (status === 'REJECTED') return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Pending
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-200 text-xs font-black text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
      {initials}
    </div>
  );
}

export default function EmployerApplicationsPage() {
  const [items, setItems]           = useState<Application[]>([]);
  const [loading, setLoading]       = useState(true);
  const [busyId, setBusyId]         = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [filter, setFilter]         = useState<Filter>('ALL');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);

  useEffect(() => {
    jobsApi.getMine()
      .then(async jobs => {
        if (jobs.length === 0) return;
        const nested = await Promise.all(
          jobs.map(j =>
            applicationsApi.getForJob(j.id)
              .then(apps => apps.map(a => ({ ...a, job: { id: j.id, title: j.title, company: j.company } })))
              .catch(() => [] as Application[])
          )
        );
        setItems(nested.flat());
      })
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  async function decide(id: string, action: 'accept' | 'reject') {
    setBusyId(id);
    setActionMenuId(null);
    try {
      const updated = action === 'accept'
        ? await applicationsApi.accept(id)
        : await applicationsApi.reject(id);
      setItems(prev => prev.map(a => a.id === id ? updated : a));
      toast.success(action === 'accept' ? 'Application accepted.' : 'Application rejected.');
    } catch (err: any) {
      toast.error(err?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  }

  const filtered = items.filter(a => {
    const matchFilter = filter === 'ALL' || a.status === filter;
    const matchSearch = !search ||
      (a.user?.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.user?.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.job?.title ?? '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const FILTERS: [Filter, string][] = [
    ['ALL', 'All'],
    ['ACCEPTED', 'Completed'],
    ['PENDING', 'Pending'],
    ['REJECTED', 'Rejected'],
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Applications</h1>

      {/* ── Table card ── */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-neutral-200 p-1 dark:border-neutral-700">
            {FILTERS.map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setFilter(val); setPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filter === val
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search..."
              className="w-52 rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-neutral-400" size={28} />
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400">No applications match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="w-8 px-5 py-3">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">Applied For</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">Compatibility</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginated.map(a => (
                  <tr key={a.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    {/* Checkbox */}
                    <td className="px-5 py-3.5">
                      <input type="checkbox" className="rounded" />
                    </td>

                    {/* Name + email */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={a.user?.fullName ?? 'U'} />
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">
                            {a.user?.fullName ?? `Applicant #${a.id.slice(0, 6)}`}
                          </p>
                          <p className="text-xs text-neutral-400">{a.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Job title */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {a.job?.title ?? '—'}
                      </p>
                    </td>

                    {/* Compatibility */}
                    <td className="px-4 py-3.5">
                      {a.score !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <div
                              className={`h-full rounded-full ${a.score >= 70 ? 'bg-green-500' : a.score >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                              style={{ width: `${a.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-neutral-500">{a.score}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-300 dark:text-neutral-600">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusPill status={a.status} />
                    </td>

                    {/* Action menu */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActionMenuId(v => v === a.id ? null : a.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          {busyId === a.id
                            ? <Loader2 size={15} className="animate-spin" />
                            : <MoreHorizontal size={15} />
                          }
                        </button>
                        {actionMenuId === a.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActionMenuId(null)} />
                            <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                              {a.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => decide(a.id, 'accept')}
                                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => decide(a.id, 'reject')}
                                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {a.status !== 'PENDING' && (
                                <p className="px-4 py-2.5 text-xs text-neutral-400">No actions available</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
            >
              <ChevronLeft size={15} /> Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-lg text-sm font-bold transition ${
                    page === n
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {n}
                </button>
              ))}
              {totalPages > 5 && <span className="px-1 text-neutral-400">…</span>}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
