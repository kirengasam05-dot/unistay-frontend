import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock3, User, CalendarDays } from 'lucide-react';
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8757ee0 (feat(bookings): wire booking flow to shared storage and real API)
import { getUser } from '../../../lib/authStorage';
import {
  getHostBookings,
  updateBookingStatus,
  type Booking,
  type BookingStatus,
} from '../../bookings/bookingsStorage';
import { bookingsApi } from '../../bookings/bookingsApi';
<<<<<<< HEAD
=======

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
interface Booking { id: string; student: string; housing: string; dates: string; status: BookingStatus; }

const initial: Booking[] = [
  { id: 'b1', student: 'Aline Uwase',        housing: 'Kacyiru Student Residence', dates: '10 Jun – 10 Aug 2025', status: 'PENDING' },
  { id: 'b2', student: 'Claude Nkurunziza',  housing: 'Remera Shared Apartment',   dates: '15 Jun – 15 Sep 2025', status: 'PENDING' },
  { id: 'b3', student: 'Marie Ingabire',     housing: 'Nyamirambo Budget Room',    dates: '1 Jul – 1 Oct 2025',  status: 'PENDING' },
];
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
=======
>>>>>>> 8757ee0 (feat(bookings): wire booking flow to shared storage and real API)

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Awaiting confirmation', className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  CONFIRMED: { label: 'Confirmed — payment unlocked', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
<<<<<<< HEAD
<<<<<<< HEAD
  CANCELLED: { label: 'Rejected', className: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  PAID:      { label: 'Payment received', className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

export default function HostBookingsPage() {
  const user = getUser();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;
    setBookings(getHostBookings(user.id));
  }, [user?.id]);

  function update(id: string, status: BookingStatus) {
    updateBookingStatus(id, status);
    bookingsApi.update(id, { status }).catch(() => {});
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

=======
  CANCELLED: { label: 'Rejected',                   className: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
=======
  CANCELLED: { label: 'Rejected', className: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  PAID:      { label: 'Payment received', className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
>>>>>>> 8757ee0 (feat(bookings): wire booking flow to shared storage and real API)
};

export default function HostBookingsPage() {
  const user = getUser();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;
    setBookings(getHostBookings(user.id));
  }, [user?.id]);

  function update(id: string, status: BookingStatus) {
    updateBookingStatus(id, status);
    bookingsApi.update(id, { status }).catch(() => {});
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

>>>>>>> afb76de (feat: enhance host dashboard and booking management)
  const pending  = bookings.filter(b => b.status === 'PENDING');
  const resolved = bookings.filter(b => b.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Booking Requests</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Confirm only when your housing is available. Payment for the student unlocks after your confirmation.
        </p>

        <div className="mt-5 flex gap-4 text-sm">
          <span className="rounded-xl bg-amber-50 px-4 py-2 font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {pending.length} pending
          </span>
          <span className="rounded-xl bg-emerald-50 px-4 py-2 font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {bookings.filter(b => b.status === 'CONFIRMED').length} confirmed
          </span>
          <span className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {bookings.filter(b => b.status === 'CANCELLED').length} rejected
          </span>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Awaiting your action</p>
          {pending.map(b => (
            <div key={b.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8757ee0 (feat(bookings): wire booking flow to shared storage and real API)
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white">{b.housingTitle}</h2>
                  <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                    <User size={13} /> {b.studentName}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                    <CalendarDays size={13} /> Requested {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusConfig[b.status].className}`}>
                    <Clock3 size={12} /> {statusConfig[b.status].label}
                  </span>
<<<<<<< HEAD
=======
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white">{b.housing}</h2>
                  <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400"><User size={13} /> {b.student}</p>
                  <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400"><CalendarDays size={13} /> {b.dates}</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusConfig[b.status].className}`}><Clock3 size={12} /> {statusConfig[b.status].label}</span>
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
=======
>>>>>>> 8757ee0 (feat(bookings): wire booking flow to shared storage and real API)
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => update(b.id, 'CONFIRMED')}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle2 size={15} /> Confirm
                  </button>
                  <button
                    onClick={() => update(b.id, 'CANCELLED')}
                    className="flex items-center gap-2 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Resolved</p>
          {resolved.map(b => (
            <div key={b.id} className="card opacity-80">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8757ee0 (feat(bookings): wire booking flow to shared storage and real API)
                  <h2 className="font-black text-neutral-900 dark:text-white">{b.housingTitle}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                    <User size={13} /> {b.studentName} · <CalendarDays size={13} /> {new Date(b.createdAt).toLocaleDateString()}
                  </p>
<<<<<<< HEAD
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${statusConfig[b.status].className}`}>
                  {b.status === 'CONFIRMED' || b.status === 'PAID' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {statusConfig[b.status].label}
=======
                  <h2 className="font-black text-neutral-900 dark:text-white">{b.housing}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400"><User size={13} /> {b.student} · <CalendarDays size={13} /> {b.dates}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${statusConfig[b.status].className}`}>
                  {b.status === 'CONFIRMED' ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {statusConfig[b.status].label}
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
=======
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${statusConfig[b.status].className}`}>
                  {b.status === 'CONFIRMED' || b.status === 'PAID' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {statusConfig[b.status].label}
>>>>>>> 8757ee0 (feat(bookings): wire booking flow to shared storage and real API)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookings.length === 0 && (
        <div className="card py-12 text-center">
          <p className="font-black text-neutral-900 dark:text-white">No booking requests yet</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Students who request your listings will appear here.</p>
        </div>
      )}
    </div>
  );
}
