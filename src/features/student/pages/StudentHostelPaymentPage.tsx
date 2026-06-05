import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { bookingsApi as bookingsApiClient } from "../../bookings/bookingsApi";
import { useBookingQuery } from "../../bookings/hooks/useBookingQuery";
import { paymentsApi } from "../../bookings/paymentsApi";

export default function StudentHostelPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showStripeMock, setShowStripeMock] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const { data: booking, isLoading, isError, refetch } = useBookingQuery(id ?? "");

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
    return <div className="p-6 bg-white rounded-lg shadow-sm">Unable to load application information.</div>;
  }

  const amount = booking.totalAmount ?? booking.housing?.price ?? booking.hotel?.price ?? 0;
  const canPay = booking.status === "PAYMENT_PENDING" && booking.paymentStatus !== "PAID";

  const deadlineTs = booking.paymentDeadline
    ? new Date(booking.paymentDeadline).getTime()
    : booking.createdAt ? new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000 : Date.now();
  const [timeLeft, setTimeLeft] = useState(Math.max(0, deadlineTs - Date.now()));
  useEffect(() => {
    const t = window.setInterval(() => setTimeLeft(Math.max(0, deadlineTs - Date.now())), 1000);
    return () => window.clearInterval(t);
  }, [deadlineTs]);
  const paymentExpired = timeLeft <= 0;

  const handleCheckout = async () => {
    setIsRedirecting(true);
    try {
      // prefer backend pay endpoint which returns a checkoutUrl
      const res = await bookingsApiClient.pay(booking.id);
      const checkoutUrl = res?.checkoutUrl || res?.url || res?.data?.checkoutUrl;
      if (checkoutUrl && typeof checkoutUrl === "string" && checkoutUrl.startsWith("http")) {
        window.location.href = checkoutUrl;
        return;
      }
    } catch (e) {
      // ignore and fallback
    }
    try {
      const session = await paymentsApi.createStripeCheckoutSession(booking.id);
      if (session?.url && session.url.startsWith("http")) {
        window.location.href = session.url;
      } else {
        setShowStripeMock(true);
        setIsRedirecting(false);
      }
    } catch (error) {
      // Fallback directly to overlay
      setShowStripeMock(true);
      setIsRedirecting(false);
    }
  };

  const handleSimulatePayment = async (status: "SUCCESS" | "FAIL" | "CANCEL") => {
    setSimulating(true);
    try {
      if (status === "SUCCESS") {
        await bookingsApiClient.submitPaymentProof(booking.id, `STRIPE-MOCK-${Date.now()}`);
        toast.success("Stripe payment simulated successfully!");
        refetch();
      } else if (status === "FAIL") {
        toast.error("Stripe payment simulation failed.");
      } else {
        toast("Stripe checkout cancelled.");
      }
    } catch (e) {
      toast.error("Error updating payment simulation. Mocking offline success state.");
      // Offline fallback
      booking.paymentStatus = "PAID";
      booking.status = "COMPLETED";
      refetch();
    } finally {
      setSimulating(false);
      setShowStripeMock(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Secure your hostel bed</h1>
            <p className="mt-2 text-slate-600">Complete the application payment to confirm your one-bed allocation.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">Application ID: {booking.id}</div>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm">{statusMessage}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Payment summary</h2>
            <p className="mt-2 text-slate-600">Pay with Stripe to confirm your hostel application and lock in one bed.</p>
          </div>

          <div className="grid gap-4 rounded-3xl bg-slate-50 p-6 text-slate-700">
            <div className="flex items-center justify-between">
              <span>Hostel</span>
              <span>{booking.housing?.title ?? booking.hotel?.title ?? booking.housingId ?? "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Bed category</span>
              <span>{booking.room?.category || booking.room?.name || "Selected bed"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment status</span>
              <span className="font-semibold">{booking.paymentStatus ?? booking.status}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold text-slate-900">
              <span>Total amount</span>
              <span>{amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</span>
            </div>
            <div className="mt-3 rounded-2xl bg-white p-3 text-sm text-slate-600">
              <div>Payment deadline: <strong>{new Date(deadlineTs).toLocaleString()}</strong></div>
              <div className="mt-1">Time left: <span className="font-mono">{Math.floor(timeLeft/1000/3600)}h {Math.floor((timeLeft/1000%3600)/60)}m {Math.floor((timeLeft/1000)%60)}s</span></div>
              {paymentExpired && <div className="mt-2 text-sm text-rose-600">Payment deadline has passed — contact student services.</div>}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!canPay || isRedirecting || paymentExpired}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRedirecting ? "Redirecting to Stripe…" : paymentExpired ? "Payment deadline passed" : canPay ? "Pay with Stripe" : "Payment already complete"}
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

      {/* Stripe Mock Checkout Modal Overlay */}
      {showStripeMock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl space-y-6 border border-slate-100">
            <div className="text-center space-y-2">
              <span className="inline-block bg-indigo-600 text-white font-black px-4 py-1.5 rounded-lg text-lg tracking-wider">stripe</span>
              <h3 className="text-2xl font-black text-slate-900 pt-2">Simulated Checkout</h3>
              <p className="text-sm text-slate-500">You are confirming your hostel application for {booking.housing?.title ?? booking.hotel?.title ?? "accommodation"}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 space-y-2">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold">{amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
              </div>
              <div className="flex justify-between">
                <span>Application ID:</span>
                <span className="font-mono text-xs">{booking.id}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSimulatePayment("SUCCESS")}
                disabled={simulating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold transition flex items-center justify-center"
              >
                {simulating ? "Verifying..." : "Simulate Success (Paid)"}
              </button>
              <button
                onClick={() => handleSimulatePayment("FAIL")}
                disabled={simulating}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl font-bold transition"
              >
                Simulate Payment Fail
              </button>
              <button
                onClick={() => handleSimulatePayment("CANCEL")}
                disabled={simulating}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold transition"
              >
                Cancel Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
