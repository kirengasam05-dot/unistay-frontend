import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useBookingQuery } from "../../bookings/hooks/useBookingQuery";

function formatRemaining(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${hours}h ${minutes}m ${rest}s`;
}

export default function StudentHostelConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError } = useBookingQuery(id ?? "");
  const deadlineTs = useMemo(() => {
    if (!booking) return 0;
    if (booking.paymentDeadline) return new Date(booking.paymentDeadline).getTime();
    return booking.status === "PAYMENT_PENDING" && booking.createdAt
      ? new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000
      : 0;
  }, [booking]);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!deadlineTs) return;
    setRemainingMs(Math.max(0, deadlineTs - Date.now()));
    const timer = window.setInterval(() => setRemainingMs(Math.max(0, deadlineTs - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [deadlineTs]);

  if (isLoading) return <div className="rounded-lg bg-white p-6 shadow-sm">Loading application confirmation...</div>;
  if (isError || !booking) return <div className="rounded-lg bg-white p-6 shadow-sm">Unable to find your application confirmation.</div>;

  const currentBooking = booking;
  const hostelName = currentBooking.housing?.title ?? currentBooking.housing?.name ?? currentBooking.room?.hostel?.name ?? "Verified Hostel";
  const allocation = currentBooking.bedAssignment ?? currentBooking.room?.name ?? "Assigned after payment";
  const expired = Boolean(deadlineTs && remainingMs <= 0 && currentBooking.status === "PAYMENT_PENDING");

  function downloadConfirmation() {
    const text = `UniStay Hostel Application Receipt

Application ID: ${currentBooking.id}
Reference: ${currentBooking.bookingReference ?? currentBooking.id}
Status: ${currentBooking.status}
Hostel: ${hostelName}
Bed category: ${currentBooking.room?.category || currentBooking.room?.name || "Selected bed"}
Allocation: ${allocation}
Amount: ${currentBooking.totalAmount ?? 0}
Payment deadline: ${currentBooking.paymentDeadline ?? "After host approval"}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hostel-application-${currentBooking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Application Confirmation</h1>
        <p className="mt-2 text-slate-600">
          Your hostel application was submitted. Payment becomes available after host approval.
        </p>
      </div>

      {booking.status === "PAYMENT_PENDING" && (
        <div className={`rounded-3xl border p-5 shadow-sm ${expired ? "border-rose-200 bg-rose-50 text-rose-800" : "border-blue-200 bg-blue-50 text-blue-900"}`}>
          <div className="font-black">{expired ? "Payment deadline passed" : "Payment deadline"}</div>
          <div className="mt-1 text-sm">
            {expired ? "This application may be rejected automatically." : `Time left: ${formatRemaining(remainingMs)}`}
          </div>
          {deadlineTs ? <div className="mt-2 font-mono text-xs">Due: {new Date(deadlineTs).toLocaleString()}</div> : null}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm print:border-none print:shadow-none">
          <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-200 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-neutral-400">UNISTAY HOSTEL APPLICATION VOUCHER</span>
              <h2 className="mt-1 text-2xl font-black text-slate-900">{hostelName}</h2>
              <p className="text-sm text-slate-500">{booking.housing?.location ?? booking.room?.hostel?.location ?? "Student hostel"}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-right">
              <span className="block text-xs font-bold text-emerald-800">Status</span>
              <span className="text-sm font-black uppercase text-emerald-600">{booking.status}</span>
            </div>
          </div>

          <div className="grid gap-6 text-sm text-slate-700 sm:grid-cols-2">
            <div><div className="text-xs font-bold uppercase text-slate-400">Application Reference</div><div className="mt-1 text-base font-semibold text-slate-900">{booking.bookingReference ?? booking.id}</div></div>
            <div><div className="text-xs font-bold uppercase text-slate-400">Student Name</div><div className="mt-1 text-base font-semibold text-slate-900">{booking.user?.fullName ?? "Student"}</div></div>
            <div><div className="text-xs font-bold uppercase text-slate-400">Bed Category</div><div className="mt-1 text-base font-semibold text-slate-900">{booking.room?.category || booking.room?.name || "Selected bed"}</div></div>
            <div><div className="text-xs font-bold uppercase text-slate-400">Allocation</div><div className="mt-1 text-base font-semibold text-slate-900">{allocation}</div></div>
            <div><div className="text-xs font-bold uppercase text-slate-400">Payment Deadline</div><div className="mt-1 text-base font-semibold text-slate-900">{deadlineTs ? new Date(deadlineTs).toLocaleString() : "After approval"}</div></div>
            <div><div className="text-xs font-bold uppercase text-slate-400">Total Amount</div><div className="mt-1 text-base font-semibold text-slate-900">{(booking.totalAmount ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}</div></div>
          </div>

          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <button onClick={downloadConfirmation} className="inline-flex min-w-[180px] items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Download Voucher</button>
            <button onClick={() => window.print()} className="inline-flex min-w-[180px] items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">Print Document</button>
            <button onClick={() => navigate(`/student/booking/${booking.id}/payment`)} disabled={booking.status !== "PAYMENT_PENDING" || expired} className="inline-flex min-w-[180px] items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60">
              {booking.status === "PAYMENT_PENDING" ? "Proceed to payment" : "Waiting for approval"}
            </button>
          </div>
        </div>

        <aside className="self-start rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <strong className="block text-slate-900">What happens next?</strong>
          <p className="mt-2 text-sm text-slate-600">After approval, pay within 24 hours. Once payment is confirmed, your bed and room allocation appears on this voucher and is emailed to you.</p>
        </aside>
      </div>
    </div>
  );
}
