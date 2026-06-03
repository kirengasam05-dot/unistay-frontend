import { useEffect, useState } from "react";
import { Loader2, Users, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
import { bookingsApi } from "../../bookings/bookingsApi";
import type { Housing, Booking } from "../../../shared/types/api";

export default function HostWaitlistMonitoring() {
  const [listings, setListings] = useState<Housing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const ls = await housingApi.getMyListings();
      setListings(ls);
      const allBookings = await Promise.all(
        ls.map((l) => bookingsApi.getByListing(l.id).catch(() => [] as Booking[]))
      );
      setBookings(allBookings.flat());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Simulate cancellation of a confirmed student to trigger promotion
  const handleSimulatePromotion = async (hostelId: string) => {
    // Find first confirmed booking for this hostel
    const confirmedBooking = bookings.find(
      (b) => b.housingId === hostelId && ["CONFIRMED", "PAID", "COMPLETED"].includes(b.status)
    );

    // Find first waitlisted booking for this hostel
    const waitlistedBookings = bookings
      .filter((b) => b.housingId === hostelId && b.status === "WAITLISTED")
      .sort((a, b) => (a.queuePosition ?? 99) - (b.queuePosition ?? 99));

    if (!confirmedBooking) {
      toast.error("No confirmed bookings found to cancel for promotion simulation.");
      return;
    }

    if (waitlistedBookings.length === 0) {
      toast.error("No students on the waitlist for this hostel to promote.");
      return;
    }

    const firstInLine = waitlistedBookings[0];

    try {
      // Simulate cancelling the confirmed student
      await bookingsApi.cancel(confirmedBooking.id);
      
      // Simulate promoting the waitlisted student
      // In a real database this is handled in the controller.
      // We call confirm or complete to promote them.
      await bookingsApi.confirm(firstInLine.id);

      toast.success(
        `Simulation success! ${confirmedBooking.user?.fullName || "Student"} cancelled. ${
          firstInLine.user?.fullName || "Next student"
        } was automatically promoted to CONFIRMED.`,
        { duration: 6000 }
      );
      loadData();
    } catch (e) {
      toast.error("Failed to run promotion simulation.");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-60 place-items-center">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Waitlist Monitoring</h1>
        <p className="mt-2 text-slate-600">Monitor hostel waiting lists and test automatic queue promotion mechanisms.</p>
      </div>

      <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 text-indigo-900 shadow-sm space-y-3">
        <div className="flex items-center gap-2 font-bold text-lg">
          <AlertCircle size={20} />
          <span>Automatic Promotion Policy</span>
        </div>
        <p className="text-sm leading-relaxed max-w-3xl">
          Students are never immediately rejected when hostels are full. Instead, they are queued on a waiting list.
          When a confirmed student cancels, the system automatically reallocates the available bed to the first waitlisted student and triggers a notification.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {listings.map((h) => {
          const waitlist = bookings
            .filter((b) => b.housingId === h.id && b.status === "WAITLISTED")
            .sort((a, b) => (a.queuePosition ?? 99) - (b.queuePosition ?? 99));

          const confirmedCount = bookings.filter(
            (b) => b.housingId === h.id && ["CONFIRMED", "PAID", "COMPLETED"].includes(b.status)
          ).length;

          return (
            <div key={h.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{h.title}</h3>
                    <p className="text-xs text-slate-500">{h.location}</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-black">
                    {waitlist.length} Waitlisted
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Waiting Queue</span>
                  {waitlist.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No students currently on the waitlist.</p>
                  ) : (
                    <div className="space-y-2">
                      {waitlist.map((w, index) => (
                        <div key={w.id} className="flex justify-between items-center text-sm text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-indigo-600 bg-indigo-50 h-6 w-6 rounded-lg flex items-center justify-center text-xs">
                              #{index + 1}
                            </span>
                            <span className="font-semibold">{w.user?.fullName ?? "Aline Student"}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{w.id}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Simulation triggers */}
              {waitlist.length > 0 && confirmedCount > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleSimulatePromotion(h.id)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-2.5 text-sm font-bold transition shadow-sm"
                  >
                    <Sparkles size={16} />
                    Simulate Auto-Promotion Action
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
