import api from "../../shared/lib/api";
import type { Housing, VerificationStatus } from "../../shared/types/api";
import { extractList, extractOne } from "../../shared/types/api";

/**
 * Hostels API — mirrors the UniStay+ backend
 * (see https://cdn-unistay.onrender.com/api-docs)
 *   GET    /hostels                  (public)            — all hostels
 *   GET    /hostels/:id              (public)            — single hostel
 *   GET    /hostels/me/hostels       (host)              — my hostels
 *   POST   /hostels                  (host, multipart)   — create hostel  { name, location, description }
 *   PUT    /hostels/:id              (host, multipart)   — update hostel
 *   DELETE /hostels/:id              (host)              — delete
 *   PATCH  /hostels/:id/verify       (admin only)        — verify
 *
 * Responses are wrapped as { success, data } (verified against the live API).
 */

/** Fields accepted by POST /hostels and PUT /hostels/:id */
export type ListingPayload = {
  name: string;          // backend field — was erroneously `title` before
  location: string;
  description?: string;
  price?: number;
  category?: "VIP" | "Standard" | "Budget";
  roomName?: string;
  bedrooms?: number;
  capacity?: number;
  roomNumberStart?: number;
  roomNumberEnd?: number;
  amenities?: string[];
  availability?: boolean;
};

/** Kept for backwards-compatibility with earlier imports. */
export type CreateHousingPayload = ListingPayload;

function toFormData(data: Partial<ListingPayload>, files: File[] = []): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) value.forEach((item) => fd.append(key, String(item)));
    else fd.append(key, String(value));
  });
  files.forEach((file) => fd.append("images", file));
  return fd;
}

export const housingApi = {
  async getAll(): Promise<Housing[]> {
    const res = await api.get("/hostels");
    return extractList<Housing>(res.data);
  },

  async getMyListings(): Promise<Housing[]> {
    const res = await api.get("/hostels/me/hostels");
    return extractList<Housing>(res.data);
  },

  async getOne(id: string): Promise<Housing> {
    const res = await api.get(`/hostels/${id}`);
    return extractOne<Housing>(res.data);
  },

  /**
   * Create a hostel listing.
   */
  async create(data: ListingPayload, files: File[] = []): Promise<Housing> {
    const res = await api.post("/hostels", toFormData(data, files));
    return extractOne<Housing>(res.data);
  },

  /** Alias kept for readability at call sites that always have images. */
  async createWithImages(data: ListingPayload, files: File[]): Promise<Housing> {
    const res = await api.post("/hostels", toFormData(data, files));
    return extractOne<Housing>(res.data);
  },

  /** Partial update. */
  async update(
    id: string,
    data: Partial<ListingPayload> & { verificationStatus?: VerificationStatus }
  ): Promise<Housing> {
    const res = await api.put(`/hostels/${id}`, data);
    return extractOne<Housing>(res.data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/hostels/${id}`);
  },

  /**
   * Admin-only — approve or reject a listing.
   */
  async setVerification(id: string, status: "VERIFIED" | "REJECTED"): Promise<Housing> {
    const res = await api.patch(`/hostels/${id}/verify`, { status });
    return extractOne<Housing>(res.data);
  },

  /**
   * Add image URLs to a listing.
   */
  async addImages(id: string, imageUrls: string[]): Promise<Housing> {
    const current = await housingApi.getOne(id);
    const merged = [...(current.images ?? []), ...imageUrls];
    return housingApi.update(id, { images: merged } as any);
  },

  /**
   * Remove a single image URL from a listing.
   */
  async removeImage(id: string, imageUrl: string): Promise<Housing> {
    const current = await housingApi.getOne(id);
    const filtered = (current.images ?? []).filter((u) => u !== imageUrl);
    return housingApi.update(id, { images: filtered } as any);
  },
};
