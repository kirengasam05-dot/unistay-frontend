import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCircle2, Clock3, CreditCard, Loader2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "../../bookings/bookingsApi";
import type { Booking } from "../../../types/api";

type Notice = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "success" | "warning" | "danger";
  icon: typeof Bell;
};

const toneClass: Record<Notice["tone"], string> = {
  info: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function noticesFor(b: Booking): Notice {
  const where = b.housing?.title || "your booking";
  if (b.status === "REJECTED" || b.status === "CANCELLED")
    return { id: b.id, title: `Booking ${b.status.toLowerCase()}`, body: `${where} can no longer continue to payment.`, tone: "danger", icon: XCircle };
  if (b.status === "COMPLETED")
    return { id: b.id, title: "Booking completed", body: `${where} is confirmed and paid. You're all set!`, tone: "success", icon: CheckCircle2 };
  if (b.paymentStatus === "PENDING_VERIFICATION")
    return { id: b.id, title: "Payment under review", body: `Your payment proof for ${where} is being verified.`, tone: "warning", icon: CreditCard };
  if (b.status === "CONFIRMED")
    return { id: b.id, title: "Host confirmed — payment unlocked", body: `Submit payment proof for ${where} to secure it.`, tone: "success", icon: CheckCircle2 };
  return { id: b.id, title: "Booking request sent", body: `Waiting for the host to confirm ${where}.`, tone: "info", icon: Clock3 };
}

export default function StudentNotificationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setBookings(await bookingsApi.getMyBookings());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const notices = useMemo(() => bookings.map(noticesFor), [bookings]);

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="flex items-center gap-2 text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl"><Bell size={24} /> Notifications</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Live updates on your booking and payment activity.</p>
      </div>

      {loading ? (
        <div className="card grid min-h-48 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : notices.length === 0 ? (
        <div className="card py-12 text-center">
          <Bell size={40} className="mx-auto text-neutral-400" />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">You're all caught up</p>
          <p className="mt-1 text-sm text-neutral-500">Book a verified room and updates will show up here.</p>
          <Link to="/housing" className="btn-black mt-5 inline-block rounded-xl">Browse housing</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${toneClass[n.tone]}`}><Icon size={20} /></div>
                <div className="min-w-0">
                  <p className="font-black text-neutral-900 dark:text-white">{n.title}</p>
                  <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{n.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
