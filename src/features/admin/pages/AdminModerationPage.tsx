import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, MapPin, RefreshCcw, ShieldCheck, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
import { useConfirm } from "../../../components/ui/ConfirmDialog";
import type { Housing } from "../../../types/api";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80";
const firstImage = (h: Housing) => h.images?.[0] || h.image || FALLBACK_IMG;
const statusPill = (s: Housing["verificationStatus"]) =>
  s === "VERIFIED" ? "bg-emerald-100 text-emerald-700" : s === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";

export default function AdminModerationPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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
    pending: items.filter((i) => i.verificationStatus === "PENDING").length,
    verified: items.filter((i) => i.verificationStatus === "VERIFIED").length,
    rejected: items.filter((i) => i.verificationStatus === "REJECTED").length,
  }), [items]);

  async function approve(h: Housing) {
    const ok = await confirm({
      title: "Approve this listing?",
      description: `"${h.title}" will be marked VERIFIED and become visible and bookable to students.`,
      confirmText: "Approve & verify",
    });
    if (!ok) return;
    try {
      setBusyId(h.id);
      const updated = await housingApi.setVerification(h.id, "VERIFIED");
      setItems((prev) => prev.map((x) => (x.id === h.id ? { ...x, ...updated, verificationStatus: "VERIFIED" } : x)));
      toast.success("Listing approved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve listing");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(h: Housing) {
    const ok = await confirm({
      title: "Reject this listing?",
      description: `"${h.title}" will be marked REJECTED and stay hidden from students until the host updates and resubmits it.`,
      confirmText: "Reject listing",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      setBusyId(h.id);
      const updated = await housingApi.setVerification(h.id, "REJECTED");
      setItems((prev) => prev.map((x) => (x.id === h.id ? { ...x, ...updated, verificationStatus: "REJECTED" } : x)));
      toast.success("Listing rejected");
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
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Housing Moderation</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Approve verified listings and reject unsafe or incomplete content.</p>
          </div>
          <button onClick={load} className="btn-white rounded-xl flex items-center gap-2"><RefreshCcw size={15} /> Refresh</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {([["Pending", stats.pending, "text-amber-600"], ["Verified", stats.verified, "text-emerald-600"], ["Rejected", stats.rejected, "text-red-600"]] as const).map(([label, value, color]) => (
          <div key={label} className="card">
            <p className="text-sm font-bold text-neutral-500">{label}</p>
            <p className={`mt-1 text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="card grid min-h-60 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : items.length === 0 ? (
        <div className="card py-12 text-center">
          <ShieldCheck size={40} className="mx-auto text-neutral-400" />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">No listings to moderate</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((h) => (
            <div key={h.id} className="card">
              <div className="flex flex-wrap items-center gap-5">
                <img src={firstImage(h)} alt={h.title} className="h-24 w-32 shrink-0 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-neutral-900 dark:text-white">{h.title}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusPill(h.verificationStatus)}`}>{h.verificationStatus}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500"><MapPin size={14} />{h.location}</p>
                  <p className="mt-1 text-sm font-black text-neutral-900 dark:text-white">RWF {Number(h.price).toLocaleString()}/month</p>
                </div>
                <div className="flex gap-2">
                  <button disabled={busyId === h.id || h.verificationStatus === "VERIFIED"} onClick={() => approve(h)} className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-40">
                    {busyId === h.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Approve
                  </button>
                  <button disabled={busyId === h.id || h.verificationStatus === "REJECTED"} onClick={() => reject(h)} className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 font-bold text-white transition hover:bg-red-700 disabled:opacity-40">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
