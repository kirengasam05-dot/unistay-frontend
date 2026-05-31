import api from "../../lib/api";
import type { Booking } from "../../types/api";
import { extractList, extractOne } from "../../types/api";
import { getUser } from "../../lib/authStorage";
import { housingApi } from "../housing/housingApi";

/**
 * Bookings API — verified against the running backend (localhost:3000).
 *
 *   GET    /bookings              — ALL bookings (not scoped); filter client-side
 *   GET    /bookings/:id          — single booking
 *   POST   /bookings              (student) — create { housingId, checkIn, checkOut }
 *   PUT    /bookings/approve/:id  (host)    — change status { status: PENDING|CONFIRMED|CANCELLED }
 *   PUT    /bookings/:id          — generic update
 *   DELETE /bookings/:id          — delete
 *
 * There is no /bookings/my or /bookings/host route, and no per-status routes —
 * the list endpoint returns every booking, so we filter by the current user:
 *   • students see bookings they created (userId === me)
 *   • hosts see bookings on listings they own (housingId ∈ my listings)
 *
 * A booking carries { userId, housingId, status, paymentStatus, totalAmount,
 * checkIn, checkOut, user:{fullName,email}, housing:{title,location,images} }.
 */

export type CreateBookingPayload = {
  housingId: string;
  checkIn: string;
  checkOut: string;
};

type HostStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

async function fetchAll(): Promise<Booking[]> {
  const res = await api.get("/bookings");
  return extractList<Booking>(res.data);
}

/** Host status change — PUT /bookings/approve/:id with { status }. */
async function changeStatus(id: string, status: HostStatus): Promise<Booking> {
  const res = await api.put(`/bookings/approve/${id}`, { status });
  // Controller responds with { message, updatedBooking }.
  return (res.data?.updatedBooking as Booking) ?? extractOne<Booking>(res.data);
}

/** Host — bookings on listings the current host owns. */
async function getHostBookings(): Promise<Booking[]> {
  const [all, listings] = await Promise.all([
    fetchAll(),
    housingApi.getMyListings().catch(() => []),
  ]);
  const mine = new Set(listings.map((l) => l.id));
  return all.filter((b) => mine.has(b.housingId));
}

export const bookingsApi = {
  /** Student — the bookings the current user created. */
  async getMyBookings(): Promise<Booking[]> {
    const all = await fetchAll();
    const me = getUser();
    return me?.id ? all.filter((b) => b.userId === me.id) : all;
  },

  getHostBookings,

  /** Bookings for one specific listing. */
  async getByListing(housingId: string): Promise<Booking[]> {
    const all = await fetchAll();
    return all.filter((b) => b.housingId === housingId);
  },

  /** Single booking detail. GET /bookings/:id */
  async getOne(id: string): Promise<Booking> {
    const res = await api.get(`/bookings/${id}`);
    return extractOne<Booking>(res.data);
  },

  /** Student — create a booking. POST /bookings */
  async create(data: CreateBookingPayload): Promise<Booking> {
    const res = await api.post("/bookings", data);
    return extractOne<Booking>(res.data);
  },

  /** Host — confirm a booking (CONFIRMED). */
  confirm: (id: string) => changeStatus(id, "CONFIRMED"),
  /** Host — reject a booking (no REJECTED status server-side → CANCELLED). */
  reject: (id: string) => changeStatus(id, "CANCELLED"),
  /** Cancel a booking. */
  cancel: (id: string) => changeStatus(id, "CANCELLED"),

  /** Host — verify payment / complete. No dedicated route; best-effort via generic update. */
  async complete(id: string): Promise<Booking> {
    const res = await api.put(`/bookings/${id}`, { status: "COMPLETED", paymentStatus: "PAID" });
    return extractOne<Booking>(res.data);
  },

  /**
   * Student — submit payment proof + the email the host should use to reach
   * them. No dedicated route yet; best-effort via generic update.
   */
  async submitPaymentProof(id: string, paymentProof: string, paymentEmail?: string): Promise<Booking> {
    const res = await api.put(`/bookings/${id}`, {
      paymentProof,
      paymentRef: paymentProof,
      paymentEmail,
      paymentStatus: "PENDING_VERIFICATION",
    });
    return extractOne<Booking>(res.data);
  },

  /** Delete a booking. DELETE /bookings/:id */
  async remove(id: string): Promise<void> {
    await api.delete(`/bookings/${id}`);
  },
};
