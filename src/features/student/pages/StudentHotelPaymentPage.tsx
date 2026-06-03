import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useBookingQuery } from "../../bookings/hooks/useBookingQuery";
import { paymentsApi } from "../../bookings/paymentsApi";

export default function StudentHotelPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { data: booking, isLoading, isError } = useBookingQuery(id ?? "");

  const statusMessage = useMemo(() => {
    const status = searchParams.get("status");
    if (status === "success") return "Your payment was received successfully.";
    if (status === "cancel") return "Payment was canceled. You can try again when you're ready.";
    return null;
  }, [searchParams]);

  if (isLoading) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Loading payment details…</div>;
  }

  if (isError || !booking) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Unable to load booking information.</div>;
  }

  const amount = booking.totalAmount ?? booking.housing?.price ?? booking.hotel?.price ?? 0;
  const canPay = booking.paymentStatus !== "PAID" && booking.status !== "COMPLETED";

  const handleCheckout = async () => {
    setIsRedirecting(true);

    try {
      const session = await paymentsApi.createStripeCheckoutSession(booking.id);
      window.location.href = session.url;
    } catch (error) {
      toast.error("Unable to start Stripe checkout. Please try again.");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Secure your accommodation</h1>
            <p className="mt-2 text-slate-600">Complete the booking payment to confirm your room.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">Booking ID: {booking.id}</div>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm">{statusMessage}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Payment summary</h2>
            <p className="mt-2 text-slate-600">Pay with Stripe to confirm your hostel booking and lock in your room reservation.</p>
          </div>

          <div className="grid gap-4 rounded-3xl bg-slate-50 p-6 text-slate-700">
            <div className="flex items-center justify-between">
              <span>Hostel</span>
              <span>{booking.housing?.title ?? booking.hotel?.title ?? booking.housingId ?? "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment status</span>
              <span className="font-semibold">{booking.paymentStatus ?? booking.status}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold text-slate-900">
              <span>Total amount</span>
              <span>{amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!canPay || isRedirecting}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRedirecting ? "Redirecting to Stripe…" : canPay ? "Pay with Stripe" : "Payment already complete"}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/student/booking/${booking.id}/confirmation`)}
            className="inline-flex w-full items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            View confirmation
          </button>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Need help?</h2>
          <p className="mt-3 text-slate-600">If you need support with payment, reach out to student services or refresh this page after completing checkout.</p>
        </aside>
      </div>
    </div>
  );
}
