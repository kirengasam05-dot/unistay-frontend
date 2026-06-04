import { useEffect, useState } from "react";
import { Loader2, Download, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
import { bookingsApi } from "../../bookings/bookingsApi";
import type { Housing, Booking } from "../../../shared/types/api";

export default function HostReportsPage() {
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

  const metrics = (() => {
    let totalRevenue = 0;
    let occupancySum = 0;
    let totalBeds = 0;

    bookings.forEach((b) => {
      if (b.status === "COMPLETED" || b.paymentStatus === "PAID") {
        totalRevenue += b.totalAmount ?? 0;
      }
    });

    listings.forEach((h) => {
      const cap = h.capacity ?? 2;
      const avail = h.availableBeds ?? 0;
      totalBeds += cap;
      occupancySum += Math.max(0, cap - avail);
    });

    const averageOccupancy = totalBeds > 0 ? Math.round((occupancySum / totalBeds) * 100) : 0;

    return { totalRevenue, averageOccupancy, allocationHistory: bookings.length };
  })();

  const downloadCSVReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Booking ID,Hostel,Student Name,Check In,Check Out,Rent Paid,Status\n";

    bookings.forEach((b) => {
      const hostelTitle = b.housing?.title ?? "Unknown";
      const studentName = b.user?.fullName ?? "Unknown";
      csvContent += `${b.id},"${hostelTitle}","${studentName}",${b.checkIn},${b.checkOut},${b.totalAmount ?? 0},${b.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hostel-occupancy-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("CSV Report downloaded successfully!");
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Hostel Reports & Analytics</h1>
          <p className="mt-2 text-slate-600">Analyze monthly performance, revenue indicators, and download official reports.</p>
        </div>
        <button
          onClick={downloadCSVReport}
          className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 self-start sm:self-center"
        >
          <Download size={16} />
          Export CSV Report
        </button>
      </div>

      {/* Analytics KPI Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
          <DollarSign className="text-indigo-600" size={24} />
          <h3 className="text-sm font-bold text-slate-500 uppercase">Gross Revenue</h3>
          <p className="text-3xl font-black text-slate-900">
            {metrics.totalRevenue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
          <TrendingUp className="text-emerald-600" size={24} />
          <h3 className="text-sm font-bold text-slate-500 uppercase">Average Occupancy</h3>
          <p className="text-3xl font-black text-emerald-600">{metrics.averageOccupancy}%</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
          <Calendar className="text-neutral-900 dark:text-white" size={24} />
          <h3 className="text-sm font-bold text-slate-500 uppercase">All Allocations</h3>
          <p className="text-3xl font-black text-neutral-900 dark:text-white">{metrics.allocationHistory} bookings</p>
        </div>
      </div>

      {/* Allocation History Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Hostel Allocation History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Hostel</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500 italic">No bookings recorded.</td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono text-xs">{b.id}</td>
                    <td className="py-3.5 px-4 font-semibold">{b.housing?.title ?? "Standard Room"}</td>
                    <td className="py-3.5 px-4">{b.user?.fullName ?? "Aline Student"}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{b.checkIn} → {b.checkOut}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {(b.totalAmount ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        ["CONFIRMED", "PAID", "COMPLETED"].includes(b.status)
                          ? "bg-green-100 text-green-800"
                          : b.status === "WAITLISTED"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
