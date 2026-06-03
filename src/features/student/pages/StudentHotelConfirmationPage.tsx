import { useNavigate, useParams } from "react-router-dom";
import { useBookingQuery } from "../../bookings/hooks/useBookingQuery";

export default function StudentHotelConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError } = useBookingQuery(id ?? "");

  if (isLoading) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Loading booking confirmation…</div>;
  }

  if (isError || !booking) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Unable to find your booking confirmation.</div>;
  }

  const downloadConfirmation = () => {
    const text = `Booking Confirmation\n\nBooking ID: ${booking.id}\nStatus: ${booking.status}\nHostel: ${booking.housing?.title ?? booking.hotel?.title ?? booking.housingId}\nCheck-in: ${booking.checkIn}\nCheck-out: ${booking.checkOut}\nAmount: ${booking.totalAmount ?? 0}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `booking-confirmation-${booking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Booking confirmed</h1>
        <p className="mt-2 text-slate-600">Your accommodation booking is now confirmed. Keep this confirmation for your records.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 text-slate-700">
            <div>
              <div className="text-sm text-slate-500">Booking ID</div>
              <div className="text-lg font-semibold text-slate-900">{booking.id}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Hostel</div>
              <div className="text-lg font-semibold text-slate-900">{booking.housing?.title ?? booking.hotel?.title ?? booking.housingId}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-sm text-slate-500">Check-in</div>
                <div className="text-slate-900">{booking.checkIn}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Check-out</div>
                <div className="text-slate-900">{booking.checkOut}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Status</div>
              <div className="text-slate-900">{booking.status}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Amount</div>
              <div className="text-slate-900">{(booking.totalAmount ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={downloadConfirmation}
              className="inline-flex min-w-[180px] items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Download confirmation
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex min-w-[180px] items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Print confirmation
            </button>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
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
