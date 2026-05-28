import { useState, useEffect, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { getUser } from '../../../lib/authStorage';
import { getListings, type Listing } from '../../../lib/listingsStorage';
import {
  getMyBookingForHousing,
  createBooking,
  updateBookingStatus,
  type Booking,
} from '../../bookings/bookingsStorage';
import { bookingsApi } from '../../bookings/bookingsApi';

type DisplayStatus = 'idle' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PAID';

const statusLabel: Record<DisplayStatus, string> = {
  idle: 'Ready to request',
  PENDING: 'Waiting for host confirmation…',
  CONFIRMED: 'Confirmed — payment unlocked',
  CANCELLED: 'Booking was rejected',
  PAID: 'Payment completed',
};

function getDisplayStatus(booking: Booking | undefined): DisplayStatus {
  if (!booking) return 'idle';
  return booking.status;
}

export default function StudentBookingPage() {
  const user = getUser();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Record<string, Booking>>({});

  const refreshBookings = useCallback(() => {
    if (!user) return;
    const updated: Record<string, Booking> = {};
    listings.forEach(l => {
      const b = getMyBookingForHousing(l.id);
      if (b) updated[l.id] = b;
    });
    setBookings(updated);
  }, [listings, user]);

  useEffect(() => {
    setListings(getListings());
  }, []);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  function handleRequest(listing: Listing) {
    if (!user) return;
    const booking = createBooking({
      studentId: user.id,
      studentName: user.fullName,
      housingId: listing.id,
      housingTitle: listing.title,
      hostId: listing.hostId,
      price: listing.price,
      status: 'PENDING',
    });
    bookingsApi.create({ studentId: user.id, housingId: listing.id, hostId: listing.hostId }).catch(() => {});
    setBookings(prev => ({ ...prev, [listing.id]: booking }));
  }

  function handlePay(booking: Booking, housingId: string) {
    updateBookingStatus(booking.id, 'PAID');
    bookingsApi.update(booking.id, { status: 'PAID' }).catch(() => {});
    setBookings(prev => ({ ...prev, [housingId]: { ...booking, status: 'PAID' } }));
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Housing Booking</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Check availability first. The payment button appears only after the host confirms your request.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {listings.map((listing) => {
          const booking = bookings[listing.id];
          const displayStatus = getDisplayStatus(booking);
          const unavailable = !listing.availability;

          return (
            <div key={listing.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900">
              <div className="relative">
                <img src={listing.image} className="h-48 w-full object-cover" alt={listing.title} />
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${listing.availability ? 'bg-emerald-500 text-white' : 'bg-neutral-500 text-white'}`}>
                  {listing.availability ? 'Available' : 'Booked'}
                </span>
              </div>

              <div className="p-5">
                <h2 className="font-black text-neutral-900 dark:text-white">{listing.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                  <MapPin size={13} />{listing.location}
                </p>
                <p className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">RWF {listing.price.toLocaleString()}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">per month</p>

                <div className="mt-4 rounded-xl bg-neutral-50 px-4 py-3 text-sm dark:bg-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">Status: </span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {unavailable && displayStatus === 'idle' ? 'Already booked' : statusLabel[displayStatus]}
                  </span>
                </div>

                <div className="mt-4 grid gap-2">
                  {unavailable && displayStatus === 'idle' ? (
                    <button disabled className="w-full rounded-xl bg-neutral-100 py-3 font-bold text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600">
                      Not available
                    </button>
                  ) : displayStatus === 'idle' ? (
                    <button
                      onClick={() => handleRequest(listing)}
                      className="btn-black w-full rounded-xl"
                    >
                      Request booking
                    </button>
                  ) : displayStatus === 'PENDING' ? (
                    <button disabled className="w-full rounded-xl bg-amber-50 py-3 font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Awaiting host confirmation…
                    </button>
                  ) : displayStatus === 'CONFIRMED' ? (
                    <button
                      onClick={() => handlePay(booking!, listing.id)}
                      className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700"
                    >
                      Pay now
                    </button>
                  ) : displayStatus === 'CANCELLED' ? (
                    <button disabled className="w-full rounded-xl bg-red-50 py-3 font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      Booking rejected
                    </button>
                  ) : (
                    <button disabled className="w-full rounded-xl bg-emerald-100 py-3 font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Payment completed ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
