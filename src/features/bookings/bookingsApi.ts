import api from "../../lib/api";
import type { Booking } from "../../types/api";
import { extractList, extractOne } from "../../types/api";

export type CreateBookingPayload = {
  housingId: string;
  checkIn: string;
  checkOut: string;
  totalAmount?: number;
};

export const bookingsApi = {
  async getMyBookings(): Promise<Booking[]> {
    const response = await api.get("/bookings/my");
    return extractList<Booking>(response.data);
  },

  async getHostBookings(): Promise<Booking[]> {
    const response = await api.get("/bookings/host");
    return extractList<Booking>(response.data);
  },

  async create(data: CreateBookingPayload): Promise<Booking> {
    const response = await api.post("/bookings", data);
    return extractOne<Booking>(response.data);
  },

  async confirm(id: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/confirm`);
    return extractOne<Booking>(response.data);
  },

  async reject(id: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/reject`);
    return extractOne<Booking>(response.data);
  },

  async submitPaymentProof(id: string, data: { paymentRef: string; paymentProof?: string }): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/payment-proof`, data);
    return extractOne<Booking>(response.data);
  },

  async submitPaymentProofFile(id: string, file: File, paymentRef: string): Promise<Booking> {
    const formData = new FormData();
    formData.append("paymentProof", file);
    formData.append("paymentRef", paymentRef);

    const response = await api.patch(`/bookings/${id}/payment-proof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return extractOne<Booking>(response.data);
  },

  async complete(id: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/complete`);
    return extractOne<Booking>(response.data);
  },
};
