import api from "../../lib/api";
import type { Booking, BookingStatus } from "../../types/api";
import { extractList, extractOne } from "../../types/api";

/**
 * Bookings API — mirrors the UniStay+ backend (see https://cdn-unistay.onrender.com/api-docs)
 *   GET    /bookings            (query: status, page, limit) — scoped to the authenticated user
 *   POST   /bookings            (housingId, checkIn, checkOut)
 *   GET    /bookings/:id
 *   PUT    /bookings/:id        (update / payment proof)
 *   DELETE /bookings/:id
 *   PUT    /bookings/approve/:id  (host only) — body { status } where status is
 *                                 one of "PENDING" | "CONFIRMED" | "CANCELLED"
 *
 * Host status changes go through /bookings/approve/:id. There is no REJECTED or
 * COMPLETED status server-side — rejecting a request maps to CANCELLED.
 */

/** Statuses the host can set via the approve endpoint. */
export type ApprovableStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type CreateBookingPayload = {
  housingId: string;
  checkIn: string;
  checkOut: string;
  totalAmount?: number;
};

export type BookingQuery = {
  status?: BookingStatus;
  page?: number;
  limit?: number;
};

async function list(params?: BookingQuery): Promise<Booking[]> {
  const response = await api.get("/bookings", { params });
  return extractList<Booking>(response.data);
}

async function getOne(id: string): Promise<Booking> {
  const response = await api.get(`/bookings/${id}`);
  return extractOne<Booking>(response.data);
}

async function create(data: CreateBookingPayload): Promise<Booking> {
  // Only send the documented BookingInput fields; the server derives the amount.
  const response = await api.post("/bookings", {
    housingId: data.housingId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
  });
  return extractOne<Booking>(response.data);
}

async function update(id: string, data: Record<string, unknown>): Promise<Booking> {
  const response = await api.put(`/bookings/${id}`, data);
  return extractOne<Booking>(response.data);
}

/** Host-only status change — PUT /bookings/approve/:id with { status }. */
async function changeStatus(id: string, status: ApprovableStatus): Promise<Booking> {
  const response = await api.put(`/bookings/approve/${id}`, { status });
  // This endpoint responds with { message, updatedBooking }.
  return (response.data?.updatedBooking as Booking) ?? extractOne<Booking>(response.data);
}

async function remove(id: string): Promise<void> {
  await api.delete(`/bookings/${id}`);
}

export const bookingsApi = {
  list,
  getOne,
  create,
  update,
  remove,
  changeStatus,

  // Both student and host views read the same endpoint; the backend scopes the
  // results to the caller (their own bookings vs. bookings on their listings).
  getMyBookings: () => list(),
  getHostBookings: () => list(),

  // Host status changes via PUT /bookings/approve/:id.
  confirm: (id: string) => changeStatus(id, "CONFIRMED"),
  // Rejecting a request cancels it (no REJECTED status server-side).
  reject: (id: string) => changeStatus(id, "CANCELLED"),
  cancel: (id: string) => changeStatus(id, "CANCELLED"),
  complete: (id: string) =>
    update(id, { status: "COMPLETED" satisfies BookingStatus, paymentStatus: "PAID" }),

  // Payment proof (reference only) — flips payment status to pending verification.
  submitPaymentProof: (id: string, data: { paymentRef: string; paymentProof?: string }) =>
    update(id, {
      paymentRef: data.paymentRef,
      paymentProof: data.paymentProof ?? data.paymentRef,
      paymentStatus: "PENDING_VERIFICATION",
    }),

  // Payment proof with an uploaded file (multipart).
  async submitPaymentProofFile(id: string, file: File, paymentRef: string): Promise<Booking> {
    const formData = new FormData();
    formData.append("paymentProof", file);
    formData.append("paymentRef", paymentRef);
    formData.append("paymentStatus", "PENDING_VERIFICATION");

    const response = await api.put(`/bookings/${id}`, formData);
    return extractOne<Booking>(response.data);
  },
};
