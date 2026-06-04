import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useBookingQuery } from "../../bookings/hooks/useBookingQuery";

export default function StudentHostelConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError } = useBookingQuery(id ?? "");

  if (isLoading) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Loading application confirmation…</div>;
  }

  if (isError || !booking) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Unable to find your application confirmation.</div>;
  }

  const downloadConfirmation = () => {
    const text = `UniStay Accommodation Confirmation\n\nApplication ID: ${booking.id}\nStatus: ${booking.status}\nHostel: ${booking.housing?.title ?? booking.hotel?.title ?? booking.housingId}\nCheck-in: ${booking.checkIn}\nCheck-out: ${booking.checkOut}\nAmount: ${booking.totalAmount ?? 0}\nMove-in Date: ${booking.moveInDate ?? booking.checkIn}\nBed Assignment: ${booking.bedAssignment ?? "Auto-assigned on Check-in"}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `application-confirmation-${booking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // payment deadline: prefer backend-provided `paymentDeadline`, otherwise fallback to createdAt + 24h
  const deadlineTs = booking.paymentDeadline ? new Date(booking.paymentDeadline).getTime() : ((booking.createdAt ? new Date(booking.createdAt).getTime() : Date.now()) + 24 * 60 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(Math.max(0, deadlineTs - Date.now()));

  useEffect(() => {
    const id = window.setInterval(() => setRemainingMs(Math.max(0, deadlineTs - Date.now())), 1000);
    return () => window.clearInterval(id);
  }, [deadlineTs]);

  function formatRemaining(ms: number) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  }
  const expired = remainingMs <= 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900 font-sans tracking-tight">Application Confirmation</h1>
        <p className="mt-2 text-slate-600">Your accommodation application is now confirmed. Keep this voucher for check-in.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        {/* Payment deadline countdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {(() => {
            const created = booking.createdAt ? new Date(booking.createdAt).getTime() : Date.now();
            const deadline = new Date(created + 24 * 60 * 60 * 1000);
            return (
              <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-semibold">Payment deadline</div>
                <div className="mt-1">Please complete your payment within 24 hours of application.</div>
                <div className="mt-2 font-mono text-sm">Due: {deadline.toLocaleString()}</div>
              </div>
            );
          })()}
        </div>
        {/* Premium Voucher Display */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm print:border-none print:shadow-none space-y-6">
          <div className="border-b border-dashed border-slate-200 pb-6 flex justify-between items-start">
            <div>
              <span className="text-xs font-black tracking-widest text-neutral-400 uppercase">UNISTAY HOSTEL ALLOCATION VOUCHER</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{booking.housing?.title ?? booking.hotel?.title ?? "Verified Room Allocation"}</h2>
              <p className="text-sm text-slate-500">{booking.housing?.location ?? "On-Campus Hostel"}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2 text-right">
              <span className="block text-xs font-bold text-emerald-800">Status</span>
              <span className="text-sm font-black text-emerald-600 uppercase">{booking.status}</span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 text-slate-700 text-sm">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Application Reference</div>
              <div className="text-base font-semibold text-slate-900 mt-1">{booking.bookingReference ?? booking.id}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Student Name</div>
              <div className="text-base font-semibold text-slate-900 mt-1">{booking.user?.fullName ?? "Aline Student"}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Check-in Date</div>
              <div className="text-base font-semibold text-slate-900 mt-1">{booking.checkIn}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Check-out Date</div>
              <div className="text-base font-semibold text-slate-900 mt-1">{booking.checkOut}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Bed Assignment</div>
              <div className="text-base font-semibold text-slate-900 mt-1">{booking.bedAssignment ?? "Room 104 - Bed B"}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Total Rent Paid</div>
              <div className="text-base font-semibold text-slate-900 mt-1">{(booking.totalAmount ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}</div>
            </div>
          </div>

          {/* Barcode Mockup */}
          <div className="pt-6 border-t border-slate-100 flex flex-col items-center justify-center space-y-2">
            <div className="h-10 w-2/3 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_6px)]" />
            <span className="text-xs font-mono text-slate-400">{booking.id}</span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-center pt-2">
            <button
              onClick={downloadConfirmation}
              className="inline-flex min-w-[180px] items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Download Voucher
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex min-w-[180px] items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Print Document
            </button>
            <button
              onClick={() => navigate(`/student/booking/${booking.id}/payment`)}
              disabled={expired}
              className="inline-flex min-w-[180px] items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {expired ? "Payment deadline passed" : "Proceed to payment"}
            </button>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm self-start">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Want to manage your stay?</p>
              <button
                onClick={() => navigate("/student/accommodation")}
                className="mt-3 inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                View my accommodation
              </button>
            </div>
            <div className="rounded-3xl bg-white p-4 text-sm text-slate-600">
              Keep your guest details up to date and check the dashboard for move-in instructions.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
