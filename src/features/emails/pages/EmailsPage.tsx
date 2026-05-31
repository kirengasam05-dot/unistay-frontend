import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Building2, CheckCircle2, Clock3, CreditCard, Loader2, Mail, ShieldCheck, XCircle } from "lucide-react";
import { bookingsApi } from "../../bookings/bookingsApi";
import { housingApi } from "../../housing/housingApi";
import { useAuth } from "../../../context/AuthContext";
import type { Booking, Housing } from "../../../types/api";

// Platform sender address (from .env: VITE_SUPPORT_EMAIL).
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@unistay.com";

type Tone = "info" | "success" | "warning" | "danger";
type Item = { id: string; subject: string; body: string; date?: string; tone: Tone; icon: typeof Bell };

const toneClass: Record<Tone, string> = {
  info: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const range = (b: Booking) => `${new Date(b.checkIn).toLocaleDateString()} → ${new Date(b.checkOut).toLocaleDateString()}`;

function hostItems(bookings: Booking[], listings: Housing[]): Item[] {
  const items: Item[] = [];
  bookings.forEach((b) => {
    const where = b.housing?.title || "a listing";
    const who = b.user?.fullName || "A student";
    if (b.status === "PENDING")
      items.push({ id: b.id + "-req", subject: "New booking request", body: `${who} requested ${where} (${range(b)}). Confirm availability in Bookings.`, date: b.createdAt, tone: "warning", icon: Clock3 });
    if (b.status === "CONFIRMED")
      items.push({ id: b.id + "-conf", subject: "You confirmed a booking", body: `${who}'s booking for ${where} is confirmed. Awaiting their payment proof.`, date: b.updatedAt, tone: "success", icon: CheckCircle2 });
    if (b.status === "CANCELLED" || b.status === "REJECTED")
      items.push({ id: b.id + "-can", subject: "Booking cancelled", body: `The booking for ${where} from ${who} was cancelled.`, date: b.updatedAt, tone: "danger", icon: XCircle });
    if (b.paymentStatus === "PENDING_VERIFICATION")
      items.push({ id: b.id + "-pay", subject: "Payment proof submitted", body: `${who} submitted payment for ${where}${b.paymentEmail ? ` — reach them at ${b.paymentEmail}` : ""}. Verify it in Bookings.`, date: b.updatedAt, tone: "info", icon: CreditCard });
  });
  listings.forEach((l) => {
    if (l.verificationStatus === "VERIFIED")
      items.push({ id: l.id + "-v", subject: "Listing verified", body: `${l.title} passed moderation and is now visible to students.`, tone: "success", icon: ShieldCheck });
    if (l.verificationStatus === "REJECTED")
      items.push({ id: l.id + "-r", subject: "Listing rejected", body: `${l.title} was rejected by moderation. Edit it and resubmit for review.`, tone: "danger", icon: ShieldCheck });
  });
  return items;
}

function studentItems(bookings: Booking[]): Item[] {
  return bookings.map((b) => {
    const where = b.housing?.title || "a listing";
    if (b.status === "REJECTED" || b.status === "CANCELLED")
      return { id: b.id, subject: "Booking declined", body: `${where} is no longer available for ${range(b)}.`, date: b.updatedAt, tone: "danger" as Tone, icon: XCircle };
    if (b.status === "COMPLETED")
      return { id: b.id, subject: "Booking completed", body: `${where} is confirmed and paid. You're all set!`, date: b.updatedAt, tone: "success" as Tone, icon: CheckCircle2 };
    if (b.paymentStatus === "PENDING_VERIFICATION")
      return { id: b.id, subject: "Payment under review", body: `Your payment proof for ${where} is being verified by the host.`, date: b.updatedAt, tone: "warning" as Tone, icon: CreditCard };
    if (b.status === "CONFIRMED")
      return { id: b.id, subject: "Booking confirmed — submit payment", body: `The host confirmed ${where}. Open Bookings to submit your payment proof.`, date: b.updatedAt, tone: "success" as Tone, icon: CheckCircle2 };
    return { id: b.id, subject: "Booking request sent", body: `Waiting for the host to confirm ${where} (${range(b)}).`, date: b.createdAt, tone: "info" as Tone, icon: Clock3 };
  });
}

export default function EmailsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (user?.role === "HOST") {
          const [bookings, listings] = await Promise.all([
            bookingsApi.getHostBookings().catch(() => []),
            housingApi.getMyListings().catch(() => []),
          ]);
          if (active) setItems(hostItems(bookings, listings));
        } else {
          const bookings = await bookingsApi.getMyBookings().catch(() => []);
          if (active) setItems(studentItems(bookings));
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user?.role]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()),
    [items]
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="flex items-center gap-2 text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl"><Mail size={24} /> Emails</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Booking updates, payment notices, and verification results — built from your live activity.</p>
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
      ) : sorted.length === 0 ? (
        <div className="card py-12 text-center">
          <Mail size={40} className="mx-auto text-neutral-300 dark:text-neutral-700" />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">No emails yet</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {user?.role === "HOST"
              ? "Booking requests and verification results for your listings will appear here."
              : "Updates about your bookings will appear here."}
          </p>
          <Link to={user?.role === "HOST" ? "/host/listings" : "/housing"} className="btn-black mt-5 inline-flex rounded-xl">
            {user?.role === "HOST" ? "Manage listings" : "Browse housing"}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((e) => {
            const Icon = e.icon;
            return (
              <div key={e.id} className="card flex items-start gap-4 !p-5">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${toneClass[e.tone]}`}><Icon size={20} /></div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black text-neutral-900 dark:text-white">{e.subject}</h2>
                    {e.date && <span className="text-xs text-neutral-400">{new Date(e.date).toLocaleDateString()}</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    From <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-neutral-500 hover:underline dark:text-neutral-400">{SUPPORT_EMAIL}</a>
                  </p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{e.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
