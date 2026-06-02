import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, MapPin, RefreshCcw, ShieldCheck, X, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
<<<<<<< HEAD
import type { Housing } from "../../../types/api";
=======
import { useConfirm } from "../../../shared/components/ui/ConfirmDialog";
import type { Housing } from "../../../shared/types/api";
>>>>>>> main

const FALLBACK_IMG = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80";
const firstImage = (h: Housing) => h.images?.[0] || h.image || FALLBACK_IMG;
const statusPill = (s: Housing["verificationStatus"]) =>
  s === "VERIFIED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
  s === "REJECTED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

export default function AdminModerationPage() {
  const [items, setItems]             = useState<Housing[]>([]);
  const [loading, setLoading]         = useState(true);
  const [busyId, setBusyId]           = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    try {
      setLoading(true);
      setItems(await housingApi.getAll());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    pending:  items.filter(i => i.verificationStatus === "PENDING").length,
    verified: items.filter(i => i.verificationStatus === "VERIFIED").length,
    rejected: items.filter(i => i.verificationStatus === "REJECTED").length,
  }), [items]);

  async function approve(h: Housing) {
    setBusyId(h.id);
    try {
      const updated = await housingApi.setVerification(h.id, "VERIFIED");
      setItems(prev => prev.map(x => x.id === h.id ? { ...x, ...updated, verificationStatus: "VERIFIED" } : x));
      toast.success("Listing approved and visible to students.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve listing");
    } finally {
      setBusyId(null);
    }
  }

  async function submitReject(h: Housing) {
    const reason = rejectReason.trim();
    if (!reason) { toast.error("Please enter a rejection reason."); return; }
    setBusyId(h.id);
    try {
      const updated = await housingApi.setVerification(h.id, "REJECTED");
      setItems(prev => prev.map(x => x.id === h.id ? { ...x, ...updated, verificationStatus: "REJECTED" } : x));
      toast.success("Listing rejected. Host has been notified.");
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reject listing");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
<<<<<<< HEAD
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Housing Moderation</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Review listings before they become visible to students. Always provide a reason when rejecting.</p>
=======
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Hostel Moderation</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Approve verified listings and reject unsafe or incomplete content.</p>
>>>>>>> main
          </div>
          <button onClick={load} className="btn-white rounded-xl flex items-center gap-2 text-sm">
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {([
          ["Pending",  stats.pending,  "text-amber-600 dark:text-amber-400"],
          ["Verified", stats.verified, "text-emerald-600 dark:text-emerald-400"],
          ["Rejected", stats.rejected, "text-red-600 dark:text-red-400"],
        ] as const).map(([label, value, color]) => (
          <div key={label} className="card !p-4">
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{label}</p>
            <p className={`mt-1 text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="card grid min-h-60 place-items-center">
          <Loader2 className="animate-spin text-neutral-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="card py-12 text-center">
          <ShieldCheck size={40} className="mx-auto text-neutral-300 dark:text-neutral-600" />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">No listings to moderate</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(h => (
            <div key={h.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              {/* Listing row */}
              <div className="flex flex-wrap gap-0">
                <img src={firstImage(h)} alt={h.title} className="h-36 w-full object-cover sm:h-auto sm:w-44 sm:shrink-0" />
                <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-black text-neutral-900 dark:text-white">{h.title}</h2>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${statusPill(h.verificationStatus)}`}>{h.verificationStatus}</span>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                          <MapPin size={13} />{h.location}
                        </p>
                      </div>
                      <p className="font-black text-neutral-900 dark:text-white">RWF {Number(h.price).toLocaleString()}<span className="text-xs font-normal text-neutral-400">/mo</span></p>
                    </div>
                    {h.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{h.description}</p>
                    )}
                  </div>

                  {/* Action buttons — only when not yet decided or when showing rejection form */}
                  {rejectingId !== h.id && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={busyId === h.id || h.verificationStatus === "VERIFIED"}
                        onClick={() => approve(h)}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-40"
                      >
                        {busyId === h.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Approve
                      </button>
                      <button
                        disabled={busyId === h.id || h.verificationStatus === "REJECTED"}
                        onClick={() => { setRejectingId(h.id); setRejectReason(""); }}
                        className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:opacity-40 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection reason form */}
              {rejectingId === h.id && (
                <div className="border-t border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                  <p className="mb-2 text-sm font-black text-red-800 dark:text-red-400">Reason for rejection <span className="font-normal text-red-600">(required)</span></p>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="e.g. Images do not match the description, incomplete address, pricing inconsistency…"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-red-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 dark:border-red-800/60 dark:bg-neutral-900 dark:text-white"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      disabled={busyId === h.id}
                      onClick={() => submitReject(h)}
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {busyId === h.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Confirm rejection
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectReason(""); }}
                      className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
