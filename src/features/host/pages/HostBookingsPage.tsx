import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, CreditCard, Home, Loader2, RefreshCcw, ShieldCheck, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "../../bookings/bookingsApi";
import { useConfirm } from "../../../components/ui/ConfirmDialog";
import type { Booking } from "../../../types/api";

const money = (v?: number | null) => `RWF ${Number(v || 0).toLocaleString()}`;
const pill = (status: string) => ["CONFIRMED", "COMPLETED", "PAID"].includes(status) ? "bg-green-100 text-green-700" : ["REJECTED", "CANCELLED", "REFUNDED"].includes(status) ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

export default function HostBookingsPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadBookings() {
    try { setLoading(true); setItems(await bookingsApi.getHostBookings()); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Failed to load host bookings"); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadBookings(); const interval = window.setInterval(loadBookings, 8000); return () => window.clearInterval(interval); }, []);

  const stats = useMemo(() => ({
    pending: items.filter((i) => i.status === "PENDING").length,
    confirmed: items.filter((i) => i.status === "CONFIRMED").length,
    proofs: items.filter((i) => i.paymentStatus === "PENDING_VERIFICATION").length,
    completed: items.filter((i) => i.status === "COMPLETED").length,
  }), [items]);

  async function runAction(id: string, action: "confirm" | "reject" | "complete") {
    const prompts = {
      confirm: { title: "Confirm this booking?", description: "The student will be able to submit payment proof once you confirm room availability.", confirmText: "Confirm booking", variant: "default" as const },
      reject: { title: "Reject this booking?", description: "The student will be notified that this room is unavailable. This cannot continue to payment.", confirmText: "Reject booking", variant: "destructive" as const },
      complete: { title: "Verify payment & complete?", description: "Confirm you have received and verified the payment. The booking will be marked completed.", confirmText: "Verify & complete", variant: "default" as const },
    };
    if (!(await confirm(prompts[action]))) return;
    try {
      setBusyId(id);
      if (action === "confirm") await bookingsApi.confirm(id);
      if (action === "reject") await bookingsApi.reject(id);
      if (action === "complete") await bookingsApi.complete(id);
      toast.success(action === "confirm" ? "Booking confirmed. Student payment card is now unlocked." : action === "reject" ? "Booking rejected." : "Payment verified and booking completed.");
      await loadBookings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-black p-8 text-white"><p className="font-bold text-neutral-300">Host booking workflow</p><h1 className="mt-2 text-4xl font-black">Confirm bookings before students pay.</h1><p className="mt-3 max-w-3xl text-neutral-300">Review requests, confirm availability, reject unavailable rooms, and verify payment proof.</p></section>
      <section className="grid gap-4 md:grid-cols-4">{([["Pending", stats.pending, Clock3], ["Confirmed", stats.confirmed, ShieldCheck], ["Payment proofs", stats.proofs, CreditCard], ["Completed", stats.completed, CheckCircle2]] as [string, number, LucideIcon][]).map(([label, value, Icon]) => <div key={String(label)} className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-neutral-500">{String(label)}</p><h3 className="mt-2 text-3xl font-black">{Number(value)}</h3></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-white"><Icon size={20} /></div></div></div>)}</section>
      <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-black">Booking requests</h2><p className="mt-2 text-sm text-neutral-600">Host confirmation unlocks student payment.</p></div><button onClick={loadBookings} className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-black"><RefreshCcw className="mr-2 inline" size={15} />Refresh</button></div>
        {loading ? <div className="grid min-h-72 place-items-center"><Loader2 className="animate-spin" /></div> : <div className="mt-6 space-y-5">{items.length === 0 && <div className="rounded-3xl border border-dashed border-neutral-300 p-12 text-center"><h3 className="text-xl font-black">No booking requests yet</h3><p className="mt-2 text-sm text-neutral-500">Student booking requests will appear here.</p></div>}{items.map((booking) => <article key={booking.id} className="rounded-[1.5rem] border border-neutral-200 p-5 transition hover:shadow-md"><div className="flex flex-wrap items-start justify-between gap-5"><div className="flex gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-neutral-100"><Home size={24} /></div><div><h3 className="text-xl font-black">{booking.housing?.title || booking.housingId}</h3><p className="mt-1 text-sm text-neutral-500">Student: {booking.user?.fullName || booking.userId}</p><p className="mt-1 text-sm text-neutral-500">{new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}</p><p className="mt-2 text-lg font-black">{money(booking.totalAmount)}</p><div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${pill(booking.status)}`}>{booking.status}</span><span className={`rounded-full px-3 py-1 text-xs font-black ${pill(booking.paymentStatus)}`}>{booking.paymentStatus}</span></div></div></div><div className="flex flex-wrap gap-3">{booking.status === "PENDING" && <><button disabled={busyId === booking.id} onClick={() => runAction(booking.id, "confirm")} className="rounded-2xl bg-green-600 px-5 py-3 font-black text-white disabled:bg-neutral-400"><CheckCircle2 className="mr-2 inline" size={18} />Confirm</button><button disabled={busyId === booking.id} onClick={() => runAction(booking.id, "reject")} className="rounded-2xl bg-red-600 px-5 py-3 font-black text-white disabled:bg-neutral-400"><XCircle className="mr-2 inline" size={18} />Reject</button></>}{booking.status === "CONFIRMED" && booking.paymentStatus === "PENDING_VERIFICATION" && <button disabled={busyId === booking.id} onClick={() => runAction(booking.id, "complete")} className="rounded-2xl bg-black px-5 py-3 font-black text-white disabled:bg-neutral-400"><CreditCard className="mr-2 inline" size={18} />Verify payment</button>}</div></div>{booking.status === "CONFIRMED" && booking.paymentStatus === "UNPAID" && <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5"><p className="font-black text-green-800">Student payment unlocked</p><p className="mt-1 text-sm text-green-700">The student can now submit payment proof.</p></div>}{booking.paymentStatus === "PENDING_VERIFICATION" && <div className="mt-5 rounded-3xl border border-yellow-200 bg-yellow-50 p-5"><p className="font-black text-yellow-800">Payment proof submitted</p><p className="mt-1 text-sm text-yellow-700">Reference: {booking.paymentRef || booking.paymentProof || "No reference provided"}</p></div>}</article>)}</div>}
      </section>
    </div>
  );
}
