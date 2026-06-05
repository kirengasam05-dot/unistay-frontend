import { Fragment, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Home, Loader2, RefreshCcw, ShieldCheck, X, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "../../bookings/bookingsApi";
import { housingApi } from "../../housing/housingApi";
import type { Booking } from "../../../shared/types/api";

const money = (v?: number | null) => `RWF ${Number(v || 0).toLocaleString()}`;
const hostelName = (booking: Booking) =>
  booking.housing?.name ?? booking.housing?.title ?? booking.room?.hostel?.name ?? "Hostel";
const hostelLocation = (booking: Booking) =>
  booking.housing?.location ?? booking.room?.hostel?.location ?? "No location";
const statusLabel = (status: string) =>
  status === "PAYMENT_PENDING" || status === "CONFIRMED" ? "AWAITING PAYMENT" : status;
const pill = (status: string) =>
  ["COMPLETED", "PAID"].includes(status) ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
  ["PAYMENT_PENDING", "CONFIRMED"].includes(status) ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
  ["CANCELLED", "REJECTED", "REFUNDED"].includes(status) ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";

export default function HostBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function fetchBookings(showSpinner = false) {
    if (showSpinner) setLoading(true);
    try {
      const listings = await housingApi.getMyListings();
      if (!listings.length) {
        setItems([]);
        return;
      }
      const results = await Promise.all(
        listings.map((listing) => bookingsApi.getByListing(listing.id).catch(() => [] as Booking[])),
      );
      setItems(results.flat());
    } catch (err) {
      if (showSpinner) toast.error(err instanceof Error ? err.message : "Failed to load applications");
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
    pending: items.filter((i) => i.status === "PENDING").length,
    confirmed: items.filter((i) => i.status === "PAYMENT_PENDING" || i.status === "CONFIRMED").length,
    completed: items.filter((i) => i.status === "COMPLETED").length,
    cancelled: items.filter((i) => i.status === "CANCELLED" || i.status === "REJECTED").length,
  }), [items]);

  async function confirm(id: string) {
    setBusyId(id);
    try {
      await bookingsApi.confirm(id);
      toast.success("Application approved. The student has 24 hours to pay.");
      await fetchBookings(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  async function submitReject(id: string) {
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    setBusyId(id);
    try {
      await bookingsApi.reject(id, reason);
      toast.success("Application rejected. Student has been notified.");
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
    ["Pending", stats.pending, Clock3, "text-yellow-600 dark:text-yellow-400"],
    ["Awaiting payment", stats.confirmed, ShieldCheck, "text-blue-600 dark:text-blue-400"],
    ["Completed", stats.completed, CheckCircle2, "text-green-600 dark:text-green-400"],
    ["Rejected/Cancelled", stats.cancelled, XCircle, "text-red-600 dark:text-red-400"],
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Hostel Applications</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Approve applications by hostel and room category. Approved students have 24 hours to pay before the next waiting student is promoted.
        </p>
      </div>

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

      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-black text-neutral-900 dark:text-white">All applications</h2>
          <button onClick={() => fetchBookings(false)} className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-sm font-bold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
            <RefreshCcw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid min-h-60 place-items-center py-12"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 p-12 text-center dark:border-neutral-700">
            <Home size={32} className="mx-auto text-neutral-300 dark:text-neutral-600" />
            <p className="mt-4 font-black text-neutral-900 dark:text-white">No application requests yet</p>
            <p className="mt-1 text-sm text-neutral-500">Student applications will appear here.</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-black uppercase tracking-wide text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Hostel</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applied</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {items.map((booking) => (
                  <Fragment key={booking.id}>
                    <tr className="bg-white align-top dark:bg-neutral-950">
                      <td className="px-4 py-4">
                        <p className="font-black text-neutral-900 dark:text-white">{hostelName(booking)}</p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{hostelLocation(booking)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-neutral-900 dark:text-white">{booking.user?.fullName || "Unknown student"}</p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{booking.user?.email || "No email"}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-neutral-800 dark:text-neutral-200">
                        {booking.room?.category || booking.room?.name || "Selected room"}
                      </td>
                      <td className="px-4 py-4 font-black text-neutral-900 dark:text-white">{money(booking.totalAmount)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${pill(booking.status)}`}>
                          {statusLabel(booking.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-neutral-600 dark:text-neutral-300">
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-4">
                        {booking.status === "PENDING" && rejectingId !== booking.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={busyId === booking.id}
                              onClick={() => confirm(booking.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-black text-white transition hover:bg-green-700 disabled:opacity-60"
                            >
                              {busyId === booking.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                              Approve
                            </button>
                            <button
                              disabled={busyId === booking.id}
                              onClick={() => { setRejectingId(booking.id); setRejectReason(""); }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <p className="text-right text-xs font-semibold text-neutral-400">No action</p>
                        )}
                      </td>
                    </tr>

                    {booking.status === "PENDING" && rejectingId === booking.id && (
                      <tr>
                        <td colSpan={7} className="bg-red-50 px-4 py-4 dark:bg-red-900/10">
                          <p className="mb-2 text-sm font-black text-red-800 dark:text-red-400">Enter a reason for rejection</p>
                          <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="e.g. Room is no longer available."
                            rows={2}
                            className="w-full resize-none rounded-xl border border-red-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 dark:border-red-800/60 dark:bg-neutral-900 dark:text-white"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              disabled={busyId === booking.id}
                              onClick={() => submitReject(booking.id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              {busyId === booking.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                              Confirm rejection
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectReason(""); }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                            >
                              <X size={14} /> Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
