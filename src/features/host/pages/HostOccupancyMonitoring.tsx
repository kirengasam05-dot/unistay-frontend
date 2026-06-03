import { useEffect, useState } from "react";
import { Loader2, Users, Home, TrendingUp } from "lucide-react";
import { housingApi } from "../../housing/housingApi";
import { bookingsApi } from "../../bookings/bookingsApi";
import type { Housing, Booking } from "../../../shared/types/api";

export default function HostOccupancyMonitoring() {
  const [listings, setListings] = useState<Housing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    loadData();
  }, []);

  const stats = (() => {
    let totalCapacity = 0;
    let occupiedBeds = 0;

    listings.forEach((h) => {
      const cap = h.capacity ?? (h.bedrooms ? h.bedrooms * 2 : 2);
      const avail = h.availableBeds ?? (h.availability ? cap : 0);
      totalCapacity += cap;
      occupiedBeds += Math.max(0, cap - avail);
    });

    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;

    return { totalCapacity, occupiedBeds, occupancyRate };
  })();

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
        <h1 className="text-3xl font-semibold text-slate-900">Occupancy Monitoring</h1>
        <p className="mt-2 text-slate-600">Track real-time bed allocations, vacancy counts, and student hostel assignments.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-neutral-100 text-neutral-900">
            <Home size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Beds</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalCapacity}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Occupied Beds</p>
            <p className="text-2xl font-black text-emerald-600">{stats.occupiedBeds}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Occupancy Rate</p>
            <p className="text-2xl font-black text-indigo-600">{stats.occupancyRate}%</p>
          </div>
        </div>
      </div>

      {/* Rooms Allocation Grid */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Bed Assignments & Vacancies</h2>

        {listings.length === 0 ? (
          <p className="text-sm text-slate-500">You don't have any hostels listed yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {listings.map((h) => {
              const cap = h.capacity ?? (h.bedrooms ? h.bedrooms * 2 : 2);
              const avail = h.availableBeds ?? (h.availability ? cap : 0);
              const occ = Math.max(0, cap - avail);
              const activeAssignments = bookings.filter(
                (b) => b.housingId === h.id && ["CONFIRMED", "PAID", "COMPLETED"].includes(b.status)
              );

              return (
                <div key={h.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{h.title}</h3>
                      <p className="text-xs text-slate-500">{h.location}</p>
                    </div>
                    <span className="text-xs font-bold bg-neutral-900 text-white px-2.5 py-1 rounded-full">
                      {occ} / {cap} Occupied
                    </span>
                  </div>

                  {/* Bed layout visualisation */}
                  <div className="flex gap-2">
                    {Array.from({ length: cap }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-3 rounded-full ${
                          idx < occ ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                        title={idx < occ ? "Occupied bed" : "Vacant bed"}
                      />
                    ))}
                  </div>

                  {/* Active Student List */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Assigned Students</span>
                    {activeAssignments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No students currently assigned.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {activeAssignments.map((a) => (
                          <div key={a.id} className="flex justify-between items-center text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                            <span className="font-semibold">{a.user?.fullName ?? "Aline Student"}</span>
                            <span className="text-slate-400 font-mono">{a.bedAssignment ?? "Bed B"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
