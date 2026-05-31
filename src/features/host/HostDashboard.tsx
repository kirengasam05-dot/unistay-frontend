import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarClock, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { housingApi } from '../housing/housingApi';
import { bookingsApi } from '../bookings/bookingsApi';
import type { Housing } from '../../types/api';

export default function HostDashboard() {
  const [listings, setListings] = useState<Housing[]>([]);
  const [pendingBookings, setPendingBookings] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    housingApi.getMyListings()
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
    // Load bookings by aggregating across all host's listings
    housingApi.getMyListings()
      .then(ls => Promise.all(ls.map(l => bookingsApi.getByListing(l.id).catch(() => []))))
      .then(all => setPendingBookings(all.flat().filter((b: { status: string }) => b.status === 'PENDING').length))
      .catch(() => setPendingBookings(0));
  }, []);

  const stats = useMemo(() => [
    { label: 'Total listings', value: listings.length, color: 'text-neutral-900 dark:text-white', bg: 'bg-neutral-100 dark:bg-neutral-800', icon: Building2 },
    { label: 'Available', value: listings.filter((h) => h.availability).length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: CheckCircle2 },
    { label: 'Booked', value: listings.filter((h) => !h.availability).length, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', icon: XCircle },
    { label: 'Pending requests', value: pendingBookings ?? '…', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: CalendarClock },
  ], [listings, pendingBookings]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white dark:bg-neutral-800 sm:p-8">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative">
          <h2 className="text-2xl font-black leading-tight sm:text-3xl">Manage housing, bookings &amp; availability.</h2>
          <p className="mt-3 max-w-lg text-sm text-neutral-400">Students cannot pay until you confirm the booking and room availability.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-white rounded-xl" to="/host/listings">Manage housing</Link>
            <Link className="btn rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" to="/host/bookings">Review bookings</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{s.label}</p>
                <p className={`mt-0.5 text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">Listing status</h2>
          <Link to="/host/listings" className="text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Manage</Link>
        </div>
        {loading ? (
          <div className="grid min-h-32 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : listings.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No listings yet. <Link to="/host/listings/new" className="font-bold underline">Add your first listing</Link>.</p>
        ) : (
          <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {listings.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-black text-neutral-900 dark:text-white">{h.title}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{h.location} · RWF {Number(h.price).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${h.availability ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {h.availability ? 'AVAILABLE' : 'BOOKED'}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${h.verificationStatus === 'VERIFIED' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : h.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {h.verificationStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
