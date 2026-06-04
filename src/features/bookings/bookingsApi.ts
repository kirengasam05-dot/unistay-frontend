import api from "../../shared/lib/api";
import type { Booking } from "../../shared/types/api";
import { extractList, extractOne } from "../../shared/types/api";

export type CreateBookingPayload = {
  roomId: string;
  checkIn: string;
  checkOut: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

export const bookingsApi = {
  // ─── STUDENT ───────────────────────────────────────────────────────────────

  /** GET /hostel-bookings — student's own booking list */
  async getMyBookings(): Promise<Booking[]> {
    const res = await api.get("/hostel-bookings");
    return extractList<Booking>(res.data);
  },

  /** POST /hostel-bookings — create a new booking request */
  async create(data: CreateBookingPayload): Promise<Booking> {
    const res = await api.post("/hostel-bookings", data);
    return extractOne<Booking>(res.data);
  },

  /** GET /hostel-bookings/application-data?roomId=... — returns autofill data for application form */
  async getApplicationData(roomId: string): Promise<any> {
    const res = await api.get(`/hostel-bookings/application-data`, { params: { roomId } });
    return extractOne<any>(res.data);
  },

  /**
   * Submit payment. In backend, this calls pay booking which creates Stripe Checkout.
   */
  async submitPaymentProof(id: string, paymentProof: string): Promise<Booking> {
    const res = await api.post(`/hostel-bookings/${id}/pay`, { paymentProof, paymentRef: paymentProof });
    return extractOne<Booking>(res.data);
  },

  /** POST /hostel-bookings/:id/pay — request a checkout url for this booking */
  async pay(id: string): Promise<any> {
    const res = await api.post(`/hostel-bookings/${id}/pay`);
    return res.data;
  },

  /** POST /hostel-bookings/:id/cancel — student/staff cancels booking */
  async cancel(id: string): Promise<Booking> {
    const res = await api.post(`/hostel-bookings/${id}/cancel`);
    return extractOne<Booking>(res.data);
  },

  // ─── HOST ──────────────────────────────────────────────────────────────────

  /**
   * GET /hostel-bookings — all bookings filtered by hostelId.
   */
  async getByListing(hostelId: string): Promise<Booking[]> {
    const res = await api.get(`/hostel-bookings`, { params: { hostelId } });
    return extractList<Booking>(res.data);
  },

  /** PATCH /hostel-bookings/:id/status — host confirms status */
  async confirm(id: string): Promise<Booking> {
    const res = await api.patch(`/hostel-bookings/${id}/status`, { status: "CONFIRMED" });
    return extractOne<Booking>(res.data);
  },

  /** PATCH /hostel-bookings/:id/status — host rejects status */
  async reject(id: string, reason: string): Promise<Booking> {
    const res = await api.patch(`/hostel-bookings/${id}/status`, { status: "REJECTED", reason });
    return extractOne<Booking>(res.data);
  },

  /** PATCH /hostel-bookings/:id/status — host completes status */
  async complete(id: string): Promise<Booking> {
    const res = await api.patch(`/hostel-bookings/${id}/status`, { status: "COMPLETED" });
    return extractOne<Booking>(res.data);
  },

  // ─── SHARED ────────────────────────────────────────────────────────────────

  /** GET /hostel-bookings/:id — single booking detail */
  async getOne(id: string): Promise<Booking> {
    const res = await api.get(`/hostel-bookings/${id}`);
    return extractOne<Booking>(res.data);
  },
};
