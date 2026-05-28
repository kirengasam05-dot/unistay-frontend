import { getUser } from '../../lib/authStorage';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PAID';

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  housingId: string;
  housingTitle: string;
  hostId: string;
  price: number;
  status: BookingStatus;
  createdAt: string;
}

const KEY = 'unistay_bookings';

export function getBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Booking[];
  } catch { /* ignore */ }
  return [];
}

function saveBookings(items: Booking[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getStudentBookings(studentId: string): Booking[] {
  return getBookings().filter(b => b.studentId === studentId);
}

export function getHostBookings(hostId: string): Booking[] {
  return getBookings().filter(b => b.hostId === hostId);
}

export function createBooking(params: Omit<Booking, 'id' | 'createdAt'>): Booking {
  const booking: Booking = {
    ...params,
    id: `b-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveBookings([booking, ...getBookings()]);
  return booking;
}

export function updateBookingStatus(id: string, status: BookingStatus): void {
  saveBookings(getBookings().map(b => b.id === id ? { ...b, status } : b));
}

export function getMyBookingForHousing(housingId: string): Booking | undefined {
  const user = getUser();
  if (!user) return undefined;
  return getBookings().find(b => b.housingId === housingId && b.studentId === user.id);
}
