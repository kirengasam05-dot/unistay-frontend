import api from "../../shared/lib/api";
import type { Booking } from "../../shared/types/api";
import { extractOne } from "../../shared/types/api";

export const paymentsApi = {
  async createStripeCheckoutSession(bookingId: string): Promise<{ url: string }> {
    const res = await api.post(`/bookings/${bookingId}/stripe-checkout-session`);
    return extractOne<{ url: string }>(res.data);
  },

  async confirmStripePayment(bookingId: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${bookingId}/payment/stripe-confirm`);
    return extractOne<Booking>(res.data);
  },
};
