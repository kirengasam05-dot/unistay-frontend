import api from "../../lib/api";
import type { Booking } from "../../types/api";
import { extractList, extractOne } from "../../types/api";

/**
 * Bookings API — current backend routes:
 *
 *   GET    /bookings/my                (STUDENT)  — student's own bookings
 *   POST   /bookings                   (STUDENT)  — create booking
 *   PATCH  /bookings/:id/payment-proof (STUDENT)  — submit payment proof URL
 *   PATCH  /bookings/:id/cancel        (STUDENT)  — cancel a booking
 *   PATCH  /bookings/:id/confirm       (HOST)     — confirm booking
 *   PATCH  /bookings/:id/reject        (HOST)     — reject booking
 *   PATCH  /bookings/:id/complete      (HOST)     — complete / verify payment
 *   GET    /bookings/listing/:id       (HOST)     — all bookings for a listing
 *   GET    /bookings/:id               (ALL)      — single booking detail
 *   GET    /bookings                   (ADMIN)    — all bookings (admin only)
 */

export type CreateBookingPayload = {
  housingId: string;
  checkIn: string;
  checkOut: string;
};

export const bookingsApi = {
  /** Student — their own bookings. GET /bookings/my */
  async getMyBookings(): Promise<Booking[]> {
    const res = await api.get("/bookings/my");
    return extractList<Booking>(res.data);
  },

  /** Host — bookings for a specific listing. GET /bookings/listing/:housingId */
  async getByListing(housingId: string): Promise<Booking[]> {
    const res = await api.get(`/bookings/listing/${housingId}`);
    return extractList<Booking>(res.data);
  },

  /** Student — create a booking. POST /bookings */
  async create(data: CreateBookingPayload): Promise<Booking> {
    const res = await api.post("/bookings", data);
    return extractOne<Booking>(res.data);
  },

  /**
   * Student — submit payment proof.
   * PATCH /bookings/:id/payment-proof { paymentProof: "url or reference string" }
   */
  async submitPaymentProof(id: string, paymentProof: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/payment-proof`, { paymentProof });
    return extractOne<Booking>(res.data);
  },

  /** Student — cancel a booking. PATCH /bookings/:id/cancel */
  async cancel(id: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/cancel`);
    return extractOne<Booking>(res.data);
  },

  /** Host — confirm a booking. PATCH /bookings/:id/confirm */
  async confirm(id: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/confirm`);
    return extractOne<Booking>(res.data);
  },

  /** Host — reject a booking. PATCH /bookings/:id/reject */
  async reject(id: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/reject`);
    return extractOne<Booking>(res.data);
  },

  /** Host — verify payment and complete. PATCH /bookings/:id/complete */
  async complete(id: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/complete`);
    return extractOne<Booking>(res.data);
  },

  /** Single booking detail. GET /bookings/:id */
  async getOne(id: string): Promise<Booking> {
    const res = await api.get(`/bookings/${id}`);
    return extractOne<Booking>(res.data);
  },
};
