import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Home, Loader2, MapPin, RefreshCcw, ShieldCheck, X, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "../../bookings/bookingsApi";
import { housingApi } from "../../housing/housingApi";
import type { Booking } from "../../../types/api";

const money = (v?: number | null) => `RWF ${Number(v || 0).toLocaleString()}`;
const pill = (status: string) =>
  ["CONFIRMED", "COMPLETED", "PAID"].includes(status) ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
  ["CANCELLED", "REJECTED", "REFUNDED"].includes(status) ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";

const FALLBACK = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=70";

export default function HostBookingsPage() {
  const [items, setItems]       = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busyId, setBusyId]     = useState<string | null>(null);
  /** ID of booking whose rejection form is open */
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function fetchBookings(showSpinner = false) {
    if (showSpinner) setLoading(true);
    try {
      const listings = await housingApi.getMyListings();
      if (!listings.length) { setItems([]); return; }
      const results = await Promise.all(
        listings.map(l => bookingsApi.getByListing(l.id).catch(() => [] as Booking[]))
      );
      setItems(results.flat().sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()));
    } catch (err) {
      if (showSpinner) toast.error(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings(true);
    const id = window.setInterval(() => fetchBookings(false), 10000);
    return () => window.clearInterval(id);
  }, []);

  const stats = useMemo(() => ({
    pending:   items.filter(i => i.status === "PENDING").length,
    confirmed: items.filter(i => i.status === "CONFIRMED").length,
    completed: items.filter(i => i.status === "COMPLETED").length,
    cancelled: items.filter(i => i.status === "CANCELLED").length,
  }), [items]);

  async function confirm(id: string) {
    setBusyId(id);
    try {
      await bookingsApi.confirm(id);
      toast.success("Booking confirmed — the student can now pay.");
      await fetchBookings(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  async function submitReject(id: string) {
    const reason = rejectReason.trim();
    if (!reason) { toast.error("Please enter a rejection reason."); return; }
    setBusyId(id);
    try {
      await bookingsApi.reject(id, reason);
      toast.success("Booking rejected. Student has been notified.");
      setRejectingId(null);
      setRejectReason("");
      await fetchBookings(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  const statRows: [string, number, LucideIcon, string][] = [
    ["Pending",   stats.pending,   Clock3,        "text-yellow-600 dark:text-yellow-400"],
    ["Confirmed", stats.confirmed, ShieldCheck,   "text-blue-600 dark:text-blue-400"],
    ["Completed", stats.completed, CheckCircle2,  "text-green-600 dark:text-green-400"],
    ["Cancelled", stats.cancelled, XCircle,       "text-red-600 dark:text-red-400"],
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Booking Requests</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Confirm available rooms. Students pay automatically once you confirm — no manual verification needed.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {statRows.map(([label, value, Icon, color]) => (
          <div key={label} className="card flex items-center gap-4 !p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{label}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-black text-neutral-900 dark:text-white">All bookings</h2>
          <button onClick={() => fetchBookings(false)} className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-sm font-bold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
            <RefreshCcw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid min-h-60 place-items-center py-12"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 p-12 text-center dark:border-neutral-700">
            <Home size={32} className="mx-auto text-neutral-300 dark:text-neutral-600" />
            <p className="mt-4 font-black text-neutral-900 dark:text-white">No booking requests yet</p>
            <p className="mt-1 text-sm text-neutral-500">Student requests will appear here.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {items.map(booking => {
              const img = booking.housing?.images?.[0] ?? FALLBACK;
              return (
                <article key={booking.id} className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  {/* Top row — image + details + actions */}
                  <div className="flex flex-wrap gap-0">
                    {/* Image */}
                    <div className="w-full sm:w-40 shrink-0">
                      <img src={img} alt={booking.housing?.title} className="h-40 w-full object-cover sm:h-full" />
                    </div>
                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-black text-neutral-900 dark:text-white">{booking.housing?.title || booking.housingId}</h3>
                            {booking.housing?.location && (
                              <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                                <MapPin size={13} />{booking.housing.location}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${pill(booking.status)}`}>{booking.status}</span>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-xs font-bold text-neutral-400">Student</p>
                            <p className="font-semibold text-neutral-900 dark:text-white">{booking.user?.fullName || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-400">Dates</p>
                            <p className="font-semibold text-neutral-900 dark:text-white">
                              {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-400">Total</p>
                            <p className="font-black text-neutral-900 dark:text-white">{money(booking.totalAmount)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons — PENDING only */}
                      {booking.status === "PENDING" && rejectingId !== booking.id && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            disabled={busyId === booking.id}
                            onClick={() => confirm(booking.id)}
                            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-black text-white transition hover:bg-green-700 disabled:opacity-60"
                          >
                            {busyId === booking.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                            Confirm
                          </button>
                          <button
                            disabled={busyId === booking.id}
                            onClick={() => { setRejectingId(booking.id); setRejectReason(""); }}
                            className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400"
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection reason form — inline below the card row */}
                  {booking.status === "PENDING" && rejectingId === booking.id && (
                    <div className="border-t border-neutral-200 bg-red-50 p-4 dark:border-neutral-800 dark:bg-red-900/10">
                      <p className="mb-2 text-sm font-black text-red-800 dark:text-red-400">Enter a reason for rejection</p>
                      <textarea
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="e.g. Room is no longer available for those dates."
                        rows={2}
                        className="w-full resize-none rounded-xl border border-red-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 dark:border-red-800/60 dark:bg-neutral-900 dark:text-white"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          disabled={busyId === booking.id}
                          onClick={() => submitReject(booking.id)}
                          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {busyId === booking.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
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
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
