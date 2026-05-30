export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED" | "COMPLETED";
export type PaymentStatus = "UNPAID" | "PENDING_VERIFICATION" | "PAID" | "REFUNDED";

export type UserRole = "STUDENT" | "HOST" | "EMPLOYER" | "ADMIN";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role?: UserRole;
  phone?: string | null;
  location?: string | null;
  active?: boolean;
  isActive?: boolean;
  createdAt?: string;
};

export type Housing = {
  id: string;
  title: string;
  location: string;
  description?: string | null;
  bedrooms?: number | null;
  amenities?: string[];
  images?: string[];
  image?: string;
  price: number;
  availability: boolean;
  verificationStatus: VerificationStatus;
  hostId: string;
  host?: User;
};

export type Booking = {
  id: string;
  userId: string;
  housingId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentProof?: string | null;
  paymentRef?: string | null;
  totalAmount?: number | null;
  checkIn: string;
  checkOut: string;
  user?: User;
  housing?: Housing;
};

export function extractList<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

export function extractOne<T>(payload: any): T {
  return payload?.data?.data || payload?.data || payload;
}
