import { useMemo } from "react";
import { useBookingsQuery } from "../../bookings/hooks/useBookingsQuery";

export default function MyAccommodationPage() {
  const { data: bookings, isLoading, isError } = useBookingsQuery();

  const activeBooking = useMemo(
    () => bookings?.find((booking) => ["CONFIRMED", "PAID", "COMPLETED", "WAITLISTED"].includes(booking.status)),
    [bookings]
  );

  if (isLoading) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Loading accommodation information…</div>;
  }

  if (isError) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Unable to load accommodation bookings.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">My accommodation</h1>
        <p className="mt-2 text-slate-600">Track your current hostel application, see your stay dates, and manage your reservations.</p>
      </div>

      {activeBooking ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                  <p className="text-sm text-slate-500">Current application</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activeBooking.housing?.name ?? activeBooking.housing?.title ?? activeBooking.hotel?.name ?? activeBooking.hotel?.title ?? "Current hostel"}</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{activeBooking.status}</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 text-slate-700">
              <div>
                <div className="text-sm text-slate-500">Check-in</div>
                <div className="text-lg font-semibold text-slate-900">{activeBooking.checkIn}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Check-out</div>
                <div className="text-lg font-semibold text-slate-900">{activeBooking.checkOut}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Amount</div>
                <div className="text-lg font-semibold text-slate-900">{(activeBooking.totalAmount ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Application ID</div>
                <div className="text-lg font-semibold text-slate-900">{activeBooking.id}</div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">What's next</h2>
            <div className="mt-4 space-y-3 text-slate-600">
              <p>Review your move-in instructions from the host and ensure your documents are ready.</p>
              <p>Check the application status regularly for any updates or payment confirmation.</p>
              <p>If you are on the waitlist, we will notify you as soon as a room becomes available.</p>
            </div>
          </aside>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">No active accommodation</h2>
          <p className="mt-2 text-slate-600">You do not have an active hostel application. Browse available hostels and apply to reserve a room.</p>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Recent applications</h2>
        {bookings && bookings.length > 0 ? (
          <div className="mt-4 space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{booking.housing?.name ?? booking.housing?.title ?? booking.hotel?.name ?? booking.hotel?.title ?? booking.housingId}</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.status}</p>
                  </div>
                  <div className="text-sm text-slate-600">{booking.checkIn} → {booking.checkOut}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-slate-600">You don't have any accommodation applications yet.</p>
        )}
      </div>
    </div>
  );
}
