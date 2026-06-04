export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "WAITLISTED" | "REJECTED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "UNPAID" | "PAYMENT_PENDING" | "PENDING_VERIFICATION" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
export type HotelCategory = "VIP" | "Standard" | "Budget";

export type UserRole = "STUDENT" | "HOST" | "EMPLOYER" | "INSTRUCTOR" | "ADMIN";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role?: UserRole;
  phone?: string | null;
  location?: string | null;
  avatar?: string | null;
  active?: boolean;
  isActive?: boolean;
  createdAt?: string;
};

export type Housing = {
  id: string;
  /** Backend field — the hostel's actual name stored in the DB */
  name?: string;
  /** UI alias — most components render `h.title`. On live data `title` is undefined
   *  so we fall back to `name`. Use the `hostelName(h)` helper for display. */
  title?: string;
  location: string;
  description?: string | null;
  category?: HotelCategory;
  bedrooms?: number | null;
  capacity?: number | null;
  availableBeds?: number | null;
  amenities?: string[];
  images?: string[];
  image?: string;
  price?: number | null;
  availability?: boolean;
  verificationStatus: VerificationStatus;
  hostId: string;
  host?: User;
  rooms?: HostelRoom[];
};

/** Helper — returns the display name regardless of whether the backend sent `name` or `title` */
export function hostelName(h: Housing): string {
  return h.name ?? h.title ?? 'Unnamed Hostel';
}

/** Minimal room shape returned by hostel responses */
export type HostelRoom = {
  id: string;
  name?: string;
  category?: string;
  price?: number | null;
  availableBeds?: number | null;
  capacity?: number | null;
};

export type Hotel = Housing;

export type Booking = {
  id: string;
  userId: string;
  housingId: string;
  status: BookingStatus;
  /** Defaults to UNPAID on the backend — may be null for legacy records */
  paymentStatus: PaymentStatus | null;
  /** Not stored in DB — kept for display compatibility only */
  paymentProof?: string | null;
  paymentRef?: string | null;
  totalAmount?: number | null;
  checkIn: string;
  checkOut: string;
  createdAt?: string;
  user?: User;
  hotel?: Hotel;
  housing?: Housing;
  queuePosition?: number | null;
  bedAssignment?: string | null;
  moveInDate?: string | null;
  bookingReference?: string | null;
  paymentMethod?: string | null;
  /** Optional backend-provided deadline for completing payment (ISO string) */
  paymentDeadline?: string | null;
};

export function extractList<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  // fallback: first array value found in the object
  if (payload && typeof payload === 'object') {
    for (const val of Object.values(payload)) {
      if (Array.isArray(val)) return val as T[];
    }
  }
  return [];
}

export function extractOne<T>(payload: any): T {
  return payload?.data?.data || payload?.data || payload;
}
