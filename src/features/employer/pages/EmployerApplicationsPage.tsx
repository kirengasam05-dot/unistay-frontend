import { useEffect, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MoreHorizontal,
  Search,
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { applicationsApi } from "../../applications/applicationsApi";
import type { Application } from "../../applications/applicationsApi";

type Filter = "ALL" | "PENDING" | "ACCEPTED" | "REJECTED";

type ApplicationSubmissionData = {
  dateOfBirth?: string;
  nationality?: string;
  idType?: string;
  phone?: string;
  address?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  coverLetter?: string;
  confirmedSkills?: string[];
  resumeName?: string;
  rejectionReason?: string;
};

function parseApplicationSubmission(
  app: Application,
): ApplicationSubmissionData | null {
  const direct = app as Application & ApplicationSubmissionData;
  const rawMessage = (app as any).message;

  if (rawMessage && typeof rawMessage === "object") {
    return rawMessage as ApplicationSubmissionData;
  }

  if (typeof rawMessage === "string" && rawMessage.trim()) {
    try {
      const parsed = JSON.parse(rawMessage);
      if (parsed && typeof parsed === "object")
        return parsed as ApplicationSubmissionData;
    } catch {
      return null;
    }
  }

  const hasDirectFields = [
    direct.dateOfBirth,
    direct.nationality,
    direct.idType,
    direct.phone,
    direct.address,
    direct.location,
    direct.linkedin,
    direct.portfolio,
    direct.coverLetter,
    direct.confirmedSkills,
  ].some(Boolean);

  return hasDirectFields ? direct : null;
}

function formatApplicationValue(value: unknown) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "string") return value.trim() || "—";
  if (typeof value === "number") return String(value);
  return "—";
}

function StatusPill({ status }: { status: Application["status"] }) {
  if (status === "ACCEPTED")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-400">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Completed
      </span>
    );
  if (status === "REJECTED")
    return (
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

function Avatar({
  name,
  avatar,
  size = "sm",
}: {
  name: string;
  avatar?: string;
  size?: "sm" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const cls =
    size === "lg"
      ? "h-16 w-16 text-xl rounded-2xl"
      : "h-9 w-9 text-xs rounded-full";
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-neutral-200 font-black text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 ${cls}`}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

// ── Applicant detail modal ────────────────────────────────────────────────────
function ApplicantPanel({
  app, onClose, onDecide, busy,
}: {
  app: Application;
  onClose: () => void;
  onDecide: (id: string, action: "accept" | "reject", reason?: string) => void;
  busy: boolean;
}) {
  const name = app.user?.fullName ?? `Applicant #${app.id.slice(0, 6)}`;
  const submission = parseApplicationSubmission(app);
  const [rejectStep, setRejectStep] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const fieldRows = [
    ["Date of birth",  submission?.dateOfBirth],
    ["ID Type",        submission?.idType],
    ["Phone",          submission?.phone || (app.user as any)?.phone],
    ["Address",        submission?.address],
    ["Location",       submission?.location || (app.user as any)?.location],
    ["Applied on",     app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined],
  ].filter(([, v]) => v) as [string, string][];

  const ext = submission?.resumeName?.split('.').pop()?.toUpperCase() ?? 'CV';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-900">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">Applicant Profile</p>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700">
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 divide-y divide-neutral-100 overflow-y-auto dark:divide-neutral-800">

          {/* Identity */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-600 text-lg font-black text-white">
              {app.user?.avatar
                ? <img src={app.user.avatar} alt={name} className="h-full w-full rounded-full object-cover" />
                : initials}
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900 dark:text-white">{name}</h2>
              {app.user?.email && (
                <div className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  <Mail size={12} /> {app.user.email}
                </div>
              )}
            </div>
          </div>

          {/* Applied for */}
          <div className="px-6 py-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">Applied for</p>
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neutral-200 dark:bg-neutral-700">
                <Briefcase size={14} className="text-neutral-500 dark:text-neutral-400" />
              </div>
              <p className="font-black text-neutral-900 dark:text-white">{app.job?.title ?? "—"}</p>
            </div>
          </div>

          {/* Personal details */}
          {fieldRows.length > 0 && (
            <div className="px-6 py-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">Personal Details</p>
              <div className="space-y-3">
                {fieldRows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
                    <span className="text-right text-sm font-semibold text-neutral-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed skills */}
          {submission?.confirmedSkills?.length ? (
            <div className="px-6 py-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">Confirmed Skills</p>
              <div className="flex flex-wrap gap-2">
                {submission.confirmedSkills.map((s: string) => (
                  <span key={s} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{s}</span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Resume */}
          {(app.resumeUrl || submission?.resumeName) && (
            <div className="px-6 py-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">Resume</p>
              <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 dark:bg-red-900/30">
                    <FileText size={16} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                      {submission?.resumeName || 'Resume'}
                    </p>
                    <p className="text-xs text-neutral-400">{ext}</p>
                  </div>
                  {app.resumeUrl ? (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="shrink-0 text-xs text-neutral-400">File pending upload</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Missing skills */}
          {app.compatible === false && app.missing && app.missing.length > 0 && (
            <div className="px-6 py-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/20">
                <div className="mb-2 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                  <p className="text-sm font-black text-red-700 dark:text-red-400">Missing requirements</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {app.missing.map(m => (
                    <span key={m} className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-red-600 dark:bg-neutral-800 dark:text-red-400">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compatibility */}
          {app.score !== undefined && (
            <div className="px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Match score</span>
                <span className={`font-black ${app.score >= 70 ? "text-green-600 dark:text-green-400" : app.score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>{app.score}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className={`h-full rounded-full ${app.score >= 70 ? "bg-green-500" : app.score >= 40 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${app.score}%` }} />
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-3 px-6 py-4">
            <StatusPill status={app.status} />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {app.status === "ACCEPTED" ? "Acceptance email sent."
               : app.status === "REJECTED" ? "Rejection email sent."
               : "Awaiting your decision"}
            </p>
          </div>

          {/* Rejection reason */}
          {app.status === "REJECTED" && submission?.rejectionReason && (
            <div className="px-6 py-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">
                Reason for Rejection
              </p>
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/40 dark:bg-red-900/10">
                <p className="text-sm leading-relaxed text-red-700 dark:text-red-400">
                  {submission.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* App ID */}
          <div className="px-6 py-4">
            <p className="text-xs text-neutral-400 dark:text-neutral-600">Application ID</p>
            <p className="mt-0.5 font-mono text-xs text-neutral-500">{app.id}</p>
          </div>
        </div>

        {/* Footer */}
        {app.status === "PENDING" && (
          <div className="border-t border-neutral-100 p-4 dark:border-neutral-800">
            {!rejectStep ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onDecide(app.id, "accept")}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-black text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  Accept
                </button>
                <button
                  onClick={() => setRejectStep(true)}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  <XCircle size={15} /> Reject
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-black text-neutral-900 dark:text-white">Reason for rejection <span className="font-normal text-red-500">*</span></p>
                <p className="text-xs text-neutral-400">This will be included in the rejection email.</p>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Your profile does not meet the required experience level at this time…"
                  className="input resize-none"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setRejectStep(false); setRejectReason(""); }}
                    className="rounded-xl border border-neutral-200 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onDecide(app.id, "reject", rejectReason); setRejectStep(false); }}
                    disabled={busy || !rejectReason.trim()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                    Confirm rejection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EmployerApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    applicationsApi
      .getForEmployer()
      .then(setItems)
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  async function decide(id: string, action: "accept" | "reject", reason?: string) {
    setBusyId(id);
    setActionMenuId(null);
    try {
      const updated =
        action === "accept"
          ? await applicationsApi.accept(id)
          : await applicationsApi.reject(id, reason);
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSelected((prev) => (prev?.id === id ? updated : prev));
      toast.success(action === "accept" ? "Application accepted." : "Application rejected.");
    } catch (err: any) {
      toast.error(err?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = items.filter((a) => {
    const matchFilter = filter === "ALL" || a.status === filter;
    const matchSearch =
      !search ||
      (a.user?.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.user?.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.job?.title ?? "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const FILTERS: [Filter, string][] = [
    ["ALL", "All"],
    ["ACCEPTED", "Completed"],
    ["PENDING", "Pending"],
    ["REJECTED", "Rejected"],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
        Applications
      </h1>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-1 rounded-xl border border-neutral-200 p-1 dark:border-neutral-700">
            {FILTERS.map(([val, label]) => (
              <button
                key={val}
                onClick={() => {
                  setFilter(val);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filter === val
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
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
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400">
            No applications match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="w-8 px-5 py-3">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Applied For
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Compatibility
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td
                      className="px-5 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={a.user?.fullName ?? "U"}
                          avatar={a.user?.avatar}
                        />
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">
                            {a.user?.fullName ??
                              `Applicant #${a.id.slice(0, 6)}`}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {a.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {a.job?.title ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      {a.score !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <div
                              className={`h-full rounded-full ${a.score >= 70 ? "bg-green-500" : a.score >= 40 ? "bg-amber-400" : "bg-red-400"}`}
                              style={{ width: `${a.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-neutral-500">
                            {a.score}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-300 dark:text-neutral-600">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={a.status} />
                    </td>
                    <td
                      className="px-4 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setActionMenuId((v) => (v === a.id ? null : a.id))
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          {busyId === a.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <MoreHorizontal size={15} />
                          )}
                        </button>
                        {actionMenuId === a.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActionMenuId(null)}
                            />
                            <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                              {a.status === "PENDING" ? (
                                <>
                                  <button
                                    onClick={() => decide(a.id, "accept")}
                                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => decide(a.id, "reject")}
                                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <p className="px-4 py-2.5 text-xs text-neutral-400">
                                  No actions available
                                </p>
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
      </div>

      {/* Applicant detail panel */}
      {selected && (
        <ApplicantPanel
          app={selected}
          onClose={() => setSelected(null)}
          onDecide={(id, action, reason) => decide(id, action, reason)}
          busy={busyId === selected.id}
        />
      )}
    </div>
  );
}
