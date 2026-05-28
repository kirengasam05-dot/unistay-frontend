import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, CreditCard, Loader2, RefreshCcw, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "../../bookings/bookingsApi";
import type { Booking, BookingStatus, PaymentStatus } from "../../../types/api";

const money = (v?: number | null) => `RWF ${Number(v || 0).toLocaleString()}`;

function pill(status: BookingStatus | PaymentStatus) {
  if (["CONFIRMED", "COMPLETED", "PAID"].includes(status)) return "bg-green-100 text-green-700";
  if (["REJECTED", "CANCELLED", "REFUNDED"].includes(status)) return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

function BookingTimeline({ booking }: { booking: Booking }) {
  if (booking.status === "REJECTED" || booking.status === "CANCELLED") {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5">
        <div className="flex gap-3"><XCircle className="text-red-700" /><div>
          <h3 className="font-black text-red-800">Booking {booking.status.toLowerCase()}</h3>
          <p className="mt-1 text-sm text-red-700">This booking cannot continue to payment.</p>
        </div></div>
      </div>
    );
  }

  const steps = [
    ["Request sent", true, booking.status === "PENDING", "Your booking request was sent to the host."],
    ["Host confirmation", booking.status === "CONFIRMED" || booking.status === "COMPLETED", booking.status === "PENDING", booking.status === "PENDING" ? "Waiting for host confirmation." : "The host confirmed room availability."],
    ["Payment proof", booking.paymentStatus === "PENDING_VERIFICATION" || booking.paymentStatus === "PAID", booking.status === "CONFIRMED" && booking.paymentStatus === "UNPAID", booking.paymentStatus === "UNPAID" ? "Payment is unlocked after host confirmation." : "Payment proof was submitted."],
    ["Final verification", booking.status === "COMPLETED" && booking.paymentStatus === "PAID", booking.paymentStatus === "PENDING_VERIFICATION", booking.paymentStatus === "PAID" ? "Payment verified and booking completed." : "Waiting for host/admin verification."],
  ] as const;

  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black">Booking progress</h2>
      <div className="mt-6 space-y-5">
        {steps.map(([title, done, active, description], index) => (
          <div key={title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`grid h-11 w-11 place-items-center rounded-2xl ${done ? "bg-green-600 text-white" : active ? "bg-black text-white" : "bg-neutral-100 text-neutral-400"}`}>
                {done ? <CheckCircle2 size={20} /> : active ? <Clock3 size={20} /> : <CalendarDays size={20} />}
              </div>
              {index !== steps.length - 1 && <div className={`mt-2 h-10 w-[2px] ${done ? "bg-green-500" : "bg-neutral-200"}`} />}
            </div>
            <div><p className="font-black">{title}</p><p className="mt-1 text-sm leading-6 text-neutral-600">{description}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentPanel({ booking, onSubmit }: { booking: Booking; onSubmit: (b: Booking, ref: string, file?: File | null) => void }) {
  const [paymentRef, setPaymentRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const canPay = booking.status === "CONFIRMED" && booking.paymentStatus === "UNPAID";

  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-black uppercase tracking-[0.25em] text-neutral-500">Payment center</p><h2 className="mt-2 text-3xl font-black">Secure payment</h2><p className="mt-2 text-sm text-neutral-600">Upload payment proof only after host confirmation.</p></div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-black text-white"><CreditCard size={24} /></div>
      </div>

      <div className="mt-6 rounded-[1.5rem] bg-neutral-50 p-5">
        <p className="text-sm font-bold text-neutral-500">Selected housing</p>
        <h3 className="mt-1 text-2xl font-black">{booking.housing?.title || booking.housingId}</h3>
        <p className="mt-1 text-sm text-neutral-600">{booking.housing?.location || "Housing location"} • {new Date(booking.checkIn).toLocaleDateString()} to {new Date(booking.checkOut).toLocaleDateString()}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-neutral-500">Rent</p><p className="mt-1 font-black">{money(Number(booking.totalAmount || 0) - 5000)}</p></div>
          <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-neutral-500">Service</p><p className="mt-1 font-black">RWF 5,000</p></div>
          <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-neutral-500">Total</p><p className="mt-1 font-black">{money(booking.totalAmount)}</p></div>
        </div>
      </div>

      {booking.status === "PENDING" && <div className="mt-5 rounded-3xl border border-yellow-200 bg-yellow-50 p-5"><h4 className="font-black text-yellow-800">Waiting for host confirmation</h4><p className="mt-1 text-sm text-yellow-700">Payment is locked until the host confirms room availability.</p></div>}

      {canPay && (
        <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5">
          <div className="flex gap-3"><ShieldCheck className="text-green-700" /><div><h4 className="font-black text-green-800">Payment unlocked</h4><p className="mt-1 text-sm text-green-700">Submit your MoMo/Card/Bank reference and optional proof file.</p></div></div>
          <div className="mt-5 rounded-3xl bg-white p-5">
            <input className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-black" placeholder="Payment reference e.g. MOMO123456" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
            <label className="mt-4 block rounded-2xl border border-dashed border-neutral-300 p-5 text-center"><UploadCloud className="mx-auto" /><span className="mt-2 block text-sm font-bold">{file ? file.name : "Upload payment proof image or PDF"}</span><input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
            <button className="mt-4 w-full rounded-2xl bg-black px-5 py-4 font-black text-white" onClick={() => onSubmit(booking, paymentRef, file)}>Submit payment proof</button>
          </div>
        </div>
      )}

      {booking.paymentStatus === "PENDING_VERIFICATION" && <div className="mt-5 rounded-3xl border border-yellow-200 bg-yellow-50 p-5"><h4 className="font-black text-yellow-800">Payment proof submitted</h4><p className="mt-1 text-sm text-yellow-700">Reference: {booking.paymentRef || booking.paymentProof}. Waiting for verification.</p></div>}
      {booking.status === "COMPLETED" && booking.paymentStatus === "PAID" && <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5"><h4 className="font-black text-green-800">Booking completed</h4><p className="mt-1 text-sm text-green-700">Payment verified. Your housing is secured.</p></div>}
    </div>
  );
}

export default function StudentBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    try { setLoading(true); setBookings(await bookingsApi.getMyBookings()); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Failed to load bookings"); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadBookings();
    const interval = window.setInterval(loadBookings, 5000);
    return () => window.clearInterval(interval);
  }, []);

  async function submitPayment(booking: Booking, paymentRef: string, file?: File | null) {
    if (!paymentRef.trim()) return toast.error("Enter payment reference");
    try {
      if (file) await bookingsApi.submitPaymentProofFile(booking.id, file, paymentRef);
      else await bookingsApi.submitPaymentProof(booking.id, { paymentRef, paymentProof: paymentRef });
      toast.success("Payment proof submitted for verification");
      await loadBookings();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not submit payment proof"); }
  }

  const activeBooking = useMemo(() => bookings.find((b) => !["REJECTED", "CANCELLED", "COMPLETED"].includes(b.status)) || bookings[0], [bookings]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-black p-8 text-white"><p className="font-bold text-neutral-300">Student booking center</p><h1 className="mt-2 text-4xl font-black">Track booking and payment professionally.</h1><p className="mt-3 max-w-3xl text-neutral-300">Your payment card appears after the host confirms availability. This page refreshes automatically.</p></section>
      {loading ? <div className="grid min-h-72 place-items-center rounded-[2rem] border border-neutral-200 bg-white"><Loader2 className="animate-spin" /></div> : bookings.length === 0 ? <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-12 text-center"><h2 className="text-2xl font-black">No booking requests yet</h2><p className="mt-2 text-neutral-600">Go to Housing and send a booking request for a verified available room.</p></div> : <>
        {activeBooking && <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><BookingTimeline booking={activeBooking} /><PaymentPanel booking={activeBooking} onSubmit={submitPayment} /></section>}
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h2 className="text-2xl font-black">My booking history</h2><p className="mt-1 text-sm text-neutral-500">Live bookings from the backend.</p></div><button onClick={loadBookings} className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-black"><RefreshCcw className="mr-2 inline" size={15} />Refresh</button></div><div className="mt-5 space-y-4">{bookings.map((booking) => <article key={booking.id} className="rounded-3xl border border-neutral-200 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">{booking.housing?.title || booking.housingId}</p><p className="mt-1 text-sm text-neutral-500">{new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()} • {money(booking.totalAmount)}</p></div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${pill(booking.status)}`}>{booking.status}</span><span className={`rounded-full px-3 py-1 text-xs font-black ${pill(booking.paymentStatus)}`}>{booking.paymentStatus}</span></div></div></article>)}</div></section>
      </>}
    </div>
  );
}
