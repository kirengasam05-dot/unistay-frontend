import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Users } from 'lucide-react';
import { jobsApi } from '../jobs/jobsApi';
import { applicationsApi } from '../applications/applicationsApi';
import type { Job } from '../jobs/jobsApi';
import type { Application } from '../applications/applicationsApi';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthlyBuckets(apps: Application[], count = 8) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    const year  = d.getFullYear();
    const month = d.getMonth();
    const inMonth = apps.filter(a => {
      if (!a.createdAt) return false;
      const c = new Date(a.createdAt);
      return c.getFullYear() === year && c.getMonth() === month;
    });
    return {
      label:    MONTH_LABELS[month],
      total:    inMonth.length,
      accepted: inMonth.filter(a => a.status === 'ACCEPTED').length,
    };
  });
}

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

function LineGraph({ buckets }: { buckets: { label: string; total: number; accepted: number }[] }) {
  const W = 560, H = 220;
  const PAD = { top: 16, right: 20, bottom: 36, left: 38 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const s1 = buckets.map(b => b.total);
  const s2 = buckets.map(b => b.accepted);
  const maxV = Math.max(...s1, ...s2, 1); // floor at 1 to avoid division by zero
  const gridCount = 5;

  const toX = (i: number) => PAD.left + (i / Math.max(buckets.length - 1, 1)) * iW;
  const toY = (v: number) => PAD.top + iH - (v / maxV) * iH;

  const pts1: [number, number][] = s1.map((v, i) => [toX(i), toY(v)]);
  const pts2: [number, number][] = s2.map((v, i) => [toX(i), toY(v)]);

  const line1 = smoothPath(pts1);
  const line2 = smoothPath(pts2);
  const baseY = PAD.top + iH;
  const area1 = `${line1} L${pts1[pts1.length - 1][0]},${baseY} L${pts1[0][0]},${baseY} Z`;
  const area2 = `${line2} L${pts2[pts2.length - 1][0]},${baseY} L${pts2[0][0]},${baseY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1e3a8a" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#06b6d4" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines + Y labels */}
      {Array.from({ length: gridCount + 1 }, (_, i) => {
        const frac = i / gridCount;
        const y    = PAD.top + iH * (1 - frac);
        const val  = Math.round(maxV * frac);
        return (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">{val}</text>
          </g>
        );
      })}

      <path d={area1} fill="url(#g1)" />
      <path d={area2} fill="url(#g2)" />
      <path d={line1} fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={line2} fill="none" stroke="#06b6d4" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round" />

      {pts1.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4"   fill="#1e3a8a" stroke="white" strokeWidth="2" />)}
      {pts2.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#06b6d4" stroke="white" strokeWidth="2" />)}

      {buckets.map((b, i) => (
        <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="sans-serif" fontWeight="600">
          {b.label}
        </text>
      ))}
    </svg>
  );
}

function DonutChart({ applied, accepted, pending }: { applied: number; accepted: number; pending: number }) {
  const total = Math.max(applied, 1);
  const r = 54;
  const circ = 2 * Math.PI * r;

  const acceptedPct = accepted / total;
  const pendingPct  = pending  / total;
  const rejectedPct = Math.max(0, 1 - acceptedPct - pendingPct);

  const acceptedLen  = acceptedPct  * circ;
  const pendingLen   = pendingPct   * circ;
  const rejectedLen  = rejectedPct  * circ;

  const acceptedOff  = 0;
  const pendingOff   = circ - acceptedLen;
  const rejectedOff  = circ - acceptedLen - pendingLen;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        {/* track */}
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f3f4f6" strokeWidth="16" />
        {/* rejected */}
        {rejectedLen > 0 && (
          <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="16"
            strokeDasharray={`${rejectedLen} ${circ - rejectedLen}`}
            strokeDashoffset={circ - rejectedOff}
          />
        )}
        {/* pending */}
        {pendingLen > 0 && (
          <circle cx="70" cy="70" r={r} fill="none" stroke="#fbbf24" strokeWidth="16"
            strokeDasharray={`${pendingLen} ${circ - pendingLen}`}
            strokeDashoffset={circ - pendingOff}
          />
        )}
        {/* accepted */}
        {acceptedLen > 0 && (
          <circle cx="70" cy="70" r={r} fill="none" stroke="#171717" strokeWidth="16"
            strokeDasharray={`${acceptedLen} ${circ - acceptedLen}`}
            strokeDashoffset={circ - acceptedOff}
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        <p className="text-xs font-semibold text-neutral-400">Total</p>
        <p className="text-2xl font-black text-neutral-900 dark:text-white">{applied}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Application['status'] }) {
  if (status === 'ACCEPTED') return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700 dark:bg-green-900/20 dark:text-green-400">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Approved
    </span>
  );
  if (status === 'REJECTED') return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700 dark:bg-red-900/20 dark:text-red-400">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Awaiting Review
    </span>
  );
}

export default function EmployerDashboard() {
  const [jobs, setJobs]                   = useState<Job[]>([]);
  const [applications, setApplications]   = useState<Application[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([
      jobsApi.getMine(),
      applicationsApi.getForEmployer(),
    ])
      .then(([fetchedJobs, fetchedApps]) => {
        setJobs(fetchedJobs);
        setApplications(fetchedApps);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalApps  = applications.length;
  const pending    = applications.filter(a => a.status === 'PENDING').length;
  const accepted   = applications.filter(a => a.status === 'ACCEPTED').length;
  const buckets    = buildMonthlyBuckets(applications, 8);

  const stats = [
    { label: 'Active Job Listings',   value: loading ? '…' : String(jobs.length) },
    { label: 'Total Applications',    value: loading ? '…' : String(totalApps)   },
    { label: 'Shortlisted Candidates', value: loading ? '…' : String(accepted)   },
  ];

  return (
    <div className="space-y-8">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Job Portal Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Monitor job listings, applications, and recruitment performance
        </p>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{s.label}</p>
            <p className="mt-3 text-4xl font-black text-neutral-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ──────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* Application Trend */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-black text-neutral-900 dark:text-white">Application Trend</h2>
              <p className="mt-0.5 text-xs text-neutral-400">Monthly overview</p>
            </div>
            <span className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-bold text-neutral-500 dark:border-neutral-700">
              Monthly
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-neutral-900 dark:text-white">{totalApps}</p>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4">
            <span className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1e3a8a]" /> All Applications
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#06b6d4]" /> Accepted
            </span>
          </div>

          <div className="mt-2">
            <LineGraph buckets={buckets} />
          </div>
        </div>

        {/* Hiring Funnel */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-black text-neutral-900 dark:text-white">Hiring Funnel</h2>
              <p className="mt-0.5 text-xs text-neutral-400">All time</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <DonutChart applied={totalApps} accepted={accepted} pending={pending} />
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-neutral-600 dark:text-neutral-400">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-900 dark:bg-white" />
                Applied
              </span>
              <span className="font-black text-neutral-900 dark:text-white">{totalApps}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-neutral-600 dark:text-neutral-400">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Pending
              </span>
              <span className="font-black text-neutral-900 dark:text-white">{pending}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-neutral-600 dark:text-neutral-400">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                Hired
              </span>
              <span className="font-black text-neutral-900 dark:text-white">{accepted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recently Submitted ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div>
            <h2 className="font-black text-neutral-900 dark:text-white">Recently Submitted</h2>
            <p className="mt-0.5 text-xs text-neutral-400">Total applications submitted by candidates at your organisation</p>
          </div>
          <Link
            to="/employer/applications"
            className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-neutral-400">Loading applications…</div>
        ) : applications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users size={28} className="mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="mt-3 font-black text-neutral-900 dark:text-white">No applications yet</p>
            <p className="mt-1 text-sm text-neutral-400">Applications will appear here once students apply to your jobs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">Current Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wide text-neutral-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {applications.slice(0, 8).map(app => (
                  <tr key={app.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-100 text-sm font-black text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {app.user?.fullName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-black text-neutral-900 dark:text-white">
                            {app.user?.fullName ?? 'Unknown applicant'}
                          </p>
                          <p className="text-xs text-neutral-400">#{app.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-neutral-900 dark:text-white">{app.job?.title ?? '—'}</p>
                      {app.job?.company && (
                        <p className="text-xs text-neutral-400">{app.job.company}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/employer/applications"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      >
                        <MoreHorizontal size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
