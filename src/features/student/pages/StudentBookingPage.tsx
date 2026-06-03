import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, CreditCard, Eye, EyeOff, Loader2, Lock, MapPin, RefreshCcw, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "../../bookings/bookingsApi";
import { useConfirm } from "../../../shared/components/ui/ConfirmDialog";
import type { Booking, BookingStatus, PaymentStatus } from "../../../shared/types/api";

const money = (v?: number | null) => `RWF ${Number(v || 0).toLocaleString()}`;

function pill(status: BookingStatus | PaymentStatus | null | undefined) {
  if (!status) return "bg-neutral-100 text-neutral-500";
  if (["CONFIRMED", "COMPLETED", "PAID"].includes(status)) return "bg-green-100 text-green-700";
  if (["REJECTED", "CANCELLED", "REFUNDED"].includes(status)) return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

// ─── Payment panel ────────────────────────────────────────────────────────────

function PaymentPanel({ booking, onSubmit }: {
  booking: Booking;
  onSubmit: (b: Booking, ref: string) => Promise<void>;
}) {
  const [cardName, setCardName]     = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv]               = useState("");
  const [expiry, setExpiry]         = useState("");
  const [showCvv, setShowCvv]       = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const canPay = booking.status === "CONFIRMED" &&
    (booking.paymentStatus === "UNPAID" || booking.paymentStatus == null);

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!cardName.trim())                           e.cardName   = "Name is required";
    if (cardNumber.replace(/\s/g, "").length < 16)  e.cardNumber = "Enter a valid 16-digit card number";
    if (cvv.length < 3)                             e.cvv        = "CVV must be 3–4 digits";
    const [mm, yy] = expiry.split("/");
    if (!mm || !yy || new Date(2000 + +yy, +mm - 1) < new Date()) e.expiry = "Invalid or expired date";
    return e;
  }

  async function pay() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setProcessing(true);
    const last4 = cardNumber.replace(/\s/g, "").slice(-4);
    try {
      await onSubmit(booking, `CARD-${last4}-${Date.now()}`);
    } finally {
      setProcessing(false);
    }
  }

  const field = (key: string) =>
    `w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400
     ${errors[key]
       ? "border-red-400 bg-red-50 text-red-900"
       : "border-neutral-200 bg-white text-neutral-900 focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400"}`;

  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">Payment center</p>
          <h2 className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">Secure payment</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Payment unlocks after host confirmation.</p>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-neutral-900">
          <CreditCard size={24} />
        </div>
      </div>

      {/* Booking summary */}
      <div className="mt-5 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Selected housing</p>
        <h3 className="mt-1 text-lg font-black text-neutral-900 dark:text-white">{booking.housing?.name || booking.housing?.title || booking.housingId}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {booking.housing?.location} • {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {([["Rent", money(Math.max(0, Number(booking.totalAmount || 0) - 5000))], ["Service fee", "RWF 5,000"], ["Total due", money(booking.totalAmount)]] as [string, string][]).map(([label, val]) => (
            <div key={label} className="rounded-xl bg-white p-3 dark:bg-neutral-700">
              <p className="text-xs font-bold text-neutral-400">{label}</p>
              <p className="mt-0.5 text-sm font-black text-neutral-900 dark:text-white">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending */}
      {booking.status === "PENDING" && (
        <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800/40 dark:bg-yellow-900/20">
          <h4 className="font-black text-yellow-800 dark:text-yellow-400">Waiting for host confirmation</h4>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-500">The payment form will appear once the host confirms your request.</p>
        </div>
      )}

      {/* Card form */}
      {canPay && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Lock size={13} />
            <span className="text-xs font-bold">Encrypted & secure</span>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Cardholder name</label>
            <input
              value={cardName}
              onChange={e => { setCardName(e.target.value); setErrors(v => ({ ...v, cardName: "" })); }}
              placeholder="Name on card"
              className={field("cardName")}
            />
            {errors.cardName && <p className="mt-1 text-xs text-red-500">{errors.cardName}</p>}
          </div>

          {/* Card number */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Card number</label>
            <input
              value={cardNumber}
              onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setErrors(v => ({ ...v, cardNumber: "" })); }}
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              className={field("cardNumber")}
            />
            {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Expiration date</label>
              <input
                value={expiry}
                onChange={e => { setExpiry(formatExpiry(e.target.value)); setErrors(v => ({ ...v, expiry: "" })); }}
                placeholder="MM/YY"
                inputMode="numeric"
                maxLength={5}
                className={field("expiry")}
              />
              {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">CVV</label>
              <div className="relative">
                <input
                  value={cvv}
                  onChange={e => { setCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setErrors(v => ({ ...v, cvv: "" })); }}
                  placeholder="•••"
                  inputMode="numeric"
                  type={showCvv ? "text" : "password"}
                  className={field("cvv")}
                />
                <button type="button" onClick={() => setShowCvv(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                  {showCvv ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
            </div>
          </div>

          <button onClick={pay} disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-base font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
            {processing
              ? <><Loader2 size={18} className="animate-spin" /> Processing…</>
              : <><Lock size={15} /> Pay {money(booking.totalAmount)}</>}
          </button>

          <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
            Card details are not stored. Payment is verified by the host.
          </p>
        </div>
      )}

      {/* Completed — payment auto-confirms the booking */}
      {booking.status === "COMPLETED" && booking.paymentStatus === "PAID" && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800/40 dark:bg-green-900/20">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" size={20} />
            <div>
              <h4 className="font-black text-green-800 dark:text-green-400">Booking confirmed — You're all set!</h4>
              <p className="mt-1 text-sm text-green-700 dark:text-green-500">Your payment was received and the booking is confirmed. The host has been notified.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function BookingTimeline({ booking }: { booking: Booking }) {
  if (booking.status === "REJECTED" || booking.status === "CANCELLED") {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 dark:border-red-800/40 dark:bg-red-900/20">
        <div className="flex gap-3">
          <XCircle className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-black text-red-800 dark:text-red-400">Booking {booking.status.toLowerCase()}</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-500">This booking cannot continue to payment.</p>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted  = booking.status === "COMPLETED";
  const isConfirmed  = booking.status === "CONFIRMED" || isCompleted;
  const isPending    = booking.status === "PENDING";
  const paymentMade  = isCompleted || booking.paymentStatus === "PAID";
  const awaitingPay  = isConfirmed && !isCompleted && (booking.paymentStatus === "UNPAID" || booking.paymentStatus == null);

  const steps: [string, boolean, boolean, string][] = [
    [
      "Request sent",
      true,
      false,
      "Your booking request was sent to the host.",
    ],
    [
      "Host confirmation",
      isConfirmed,
      isPending,
      isPending ? "Waiting for host confirmation." : "The host confirmed room availability.",
    ],
    [
      "Payment",
      paymentMade,
      awaitingPay,
      awaitingPay
        ? "Payment is unlocked — enter your card details on the right."
        : paymentMade
          ? "Payment received and confirmed."
          : "Payment will be unlocked once the host confirms.",
    ],
    [
      "Booking confirmed",
      isCompleted,
      paymentMade && !isCompleted,
      isCompleted
        ? "All done — your housing is secured. Move in!"
        : "Your booking will be confirmed once payment is processed.",
    ],
  ];

  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Booking progress</h2>
      <div className="mt-6 space-y-5">
        {steps.map(([title, done, active, description], index) => {
          const nextDone = index < steps.length - 1 && steps[index + 1][1];
          return (
          <div key={title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`grid h-11 w-11 place-items-center rounded-2xl transition-colors ${done ? "bg-green-600 text-white" : active ? "bg-black text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"}`}>
                {done ? <CheckCircle2 size={20} /> : active ? <Clock3 size={20} /> : <span className="text-sm font-black">{index + 1}</span>}
              </div>
              {index !== steps.length - 1 && (
                <div className={`mt-2 h-10 w-[2px] transition-colors ${done && nextDone ? "bg-green-500" : done ? "bg-green-300" : "bg-neutral-200 dark:bg-neutral-700"}`} />
              )}
            </div>
            <div className="pt-1.5">
              <p className="font-black text-neutral-900 dark:text-white">{title}</p>
              <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{description}</p>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function StudentBookingPage() {
  const confirm = useConfirm();
  const [bookings, setBookings]         = useState<Booking[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  /** Silent fetch — never shows the full-page spinner; used by the interval. */
  async function fetchBookings() {
    try {
      const data = await bookingsApi.getMyBookings();
      setBookings(data);
    } catch {
      // Swallow polling errors — don't toast on every tick
    }
  }

  /** First load + manual refresh button */
  async function refresh() {
    setRefreshing(true);
    try {
      const data = await bookingsApi.getMyBookings();
      setBookings(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load bookings");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    // Initial load — shows spinner only this once
    bookingsApi.getMyBookings()
      .then(setBookings)
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setInitialLoading(false));

    // Background poll — silent, never resets loading state → no page jump
    const interval = window.setInterval(fetchBookings, 10000);
    return () => window.clearInterval(interval);
  }, []);

  async function submitPayment(booking: Booking, txRef: string) {
    const ok = await confirm({
      title: "Confirm payment?",
      description: `You're about to pay ${money(booking.totalAmount)} for "${booking.housing?.name || booking.housing?.title || "this listing"}". The host will verify and confirm your booking.`,
      confirmText: "Confirm payment",
    });
    if (!ok) return;
    try {
      await bookingsApi.submitPaymentProof(booking.id, txRef);
      toast.success("Payment successful! Your booking is now confirmed.");
      await fetchBookings(); // silent update after submit — no spinner
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit payment");
    }
  }

  const activeBooking = useMemo(
    () => bookings.find(b => !["CANCELLED", "COMPLETED"].includes(b.status)) ?? bookings[0],
    [bookings]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">My Bookings</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Track your housing requests and submit payment after host confirmation.</p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <RefreshCcw size={15} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {initialLoading ? (
        <div className="grid min-h-60 place-items-center rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <Loader2 className="animate-spin text-neutral-400" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <CreditCard size={24} className="text-neutral-400" />
          </div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">No bookings yet</h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Browse housing and send a booking request to get started.</p>
        </div>
      ) : (
        <>
          {/* Active booking — timeline + payment side by side */}
          {activeBooking && (
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <BookingTimeline booking={activeBooking} />
              <PaymentPanel booking={activeBooking} onSubmit={submitPayment} />
            </div>
          )}

          {/* Booking history — all bookings with image and full details */}
          {bookings.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-black text-neutral-900 dark:text-white">All bookings</h2>
              <div className="mt-4 space-y-4">
                {bookings.map(booking => {
                  const img = booking.housing?.images?.[0] ?? booking.housing?.image ?? "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=70";
                  const showPayBadge = booking.paymentStatus === "PAID";
                  return (
                    <article key={booking.id} className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
                      <div className="flex flex-wrap">
                        <img src={img} alt={booking.housing?.name || booking.housing?.title} className="h-36 w-full object-cover sm:h-auto sm:w-36 sm:shrink-0" />
                        <div className="flex flex-1 flex-col justify-between gap-2 p-4">
                          <div>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="font-black text-neutral-900 dark:text-white">{booking.housing?.name || booking.housing?.title || booking.housingId}</p>
                              <div className="flex flex-wrap gap-1.5">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${pill(booking.status)}`}>{booking.status}</span>
                                {showPayBadge && (
                                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-black text-green-700 dark:bg-green-900/30 dark:text-green-400">PAID</span>
                                )}
                              </div>
                            </div>
                            {booking.housing?.location && (
                              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                <MapPin size={11} />{booking.housing.location}
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="font-bold text-neutral-400">Check-in</p>
                              <p className="font-semibold text-neutral-900 dark:text-white">{new Date(booking.checkIn).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="font-bold text-neutral-400">Check-out</p>
                              <p className="font-semibold text-neutral-900 dark:text-white">{new Date(booking.checkOut).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="font-bold text-neutral-400">Total</p>
                              <p className="font-black text-neutral-900 dark:text-white">{money(booking.totalAmount)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
