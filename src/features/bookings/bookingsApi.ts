import api from "../../lib/api";
import type { Booking } from "../../types/api";
import { extractList, extractOne } from "../../types/api";

/**
 * Bookings API — routes on the backend:
 *
 *   POST   /bookings                        (STUDENT) create booking request
 *   GET    /bookings/my                     (STUDENT) student's own bookings
 *   PATCH  /bookings/:id/payment-proof      (STUDENT) submit payment reference
 *   PATCH  /bookings/:id/cancel             (STUDENT | ADMIN)
 *
 *   GET    /bookings/listing/:housing_id    (HOST | ADMIN) bookings for a listing
 *   PATCH  /bookings/:id/confirm            (HOST | ADMIN) confirm → locks listing
 *   PATCH  /bookings/:id/reject             (HOST | ADMIN) reject request
 *   PATCH  /bookings/:id/complete           (HOST | ADMIN) verify payment → unlocks listing
 *
 *   GET    /bookings/:id                    (STUDENT | HOST | ADMIN) single booking
 *   GET    /bookings                        (ADMIN) all bookings
 */

export type CreateBookingPayload = {
  housingId: string;
  checkIn: string;
  checkOut: string;
};

export const bookingsApi = {
  // ─── STUDENT ───────────────────────────────────────────────────────────────

  /** GET /bookings/my — student's own booking list */
  async getMyBookings(): Promise<Booking[]> {
    const res = await api.get("/bookings/my");
    return extractList<Booking>(res.data);
  },

  /** POST /bookings — create a new booking request */
  async create(data: CreateBookingPayload): Promise<Booking> {
    const res = await api.post("/bookings", data);
    return extractOne<Booking>(res.data);
  },

  /**
   * PATCH /bookings/:id/payment-proof — student submits payment reference.
   * Call this after the host confirms. The host will then verify and complete.
   */
  async submitPaymentProof(id: string, paymentProof: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/payment-proof`, { paymentProof, paymentRef: paymentProof });
    return extractOne<Booking>(res.data);
  },

  /** PATCH /bookings/:id/cancel — student cancels their own booking */
  async cancel(id: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/cancel`);
    return extractOne<Booking>(res.data);
  },

  // ─── HOST ──────────────────────────────────────────────────────────────────

  /**
   * GET /bookings/listing/:housing_id — all bookings for a specific listing.
   * HostBookingsPage calls this for each listing then merges the results.
   */
  async getByListing(housingId: string): Promise<Booking[]> {
    const res = await api.get(`/bookings/listing/${housingId}`);
    return extractList<Booking>(res.data);
  },

  /** PATCH /bookings/:id/confirm — host confirms → listing marked as booked */
  async confirm(id: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/confirm`);
    return extractOne<Booking>(res.data);
  },

  /** PATCH /bookings/:id/reject — host rejects the request */
  async reject(id: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/reject`);
    return extractOne<Booking>(res.data);
  },

  /** PATCH /bookings/:id/complete — host verifies payment → listing made available again */
  async complete(id: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/complete`);
    return extractOne<Booking>(res.data);
  },

  // ─── SHARED ────────────────────────────────────────────────────────────────

  /** GET /bookings/:id — single booking detail */
  async getOne(id: string): Promise<Booking> {
    const res = await api.get(`/bookings/${id}`);
    return extractOne<Booking>(res.data);
  },
};
