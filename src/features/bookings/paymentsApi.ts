import api from "../../shared/lib/api";
import type { Booking } from "../../shared/types/api";
import { extractOne } from "../../shared/types/api";

export const paymentsApi = {
  async createStripeCheckoutSession(bookingId: string): Promise<{ url: string }> {
    const res = await api.post(`/hostel-bookings/${bookingId}/pay`);
    // The backend returns { success: true, data: { checkoutUrl, sessionId } }
    const resData = extractOne<{ checkoutUrl: string }>(res.data);
    return { url: resData.checkoutUrl };
  },

  async confirmStripePayment(bookingId: string): Promise<Booking> {
    const res = await api.patch(`/hostel-bookings/${bookingId}/status`, { status: "COMPLETED" });
    return extractOne<Booking>(res.data);
  },
};
