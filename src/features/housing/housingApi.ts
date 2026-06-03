import api from "../../shared/lib/api";
import type { Housing, VerificationStatus } from "../../shared/types/api";
import { extractList, extractOne } from "../../shared/types/api";

/**
 * Housing / Listings API — mirrors the UniStay+ backend
 * (see https://cdn-unistay.onrender.com/api-docs)
 *   GET    /listings                 (public)            — all listings
 *   GET    /listings/:id             (public)            — single listing
 *   GET    /listings/me/listings     (host)              — my listings
 *   POST   /listings                 (host, multipart)   — create
 *   PUT    /listings/:id             (host)              — update (supports partial)
 *   DELETE /listings/:id             (host)              — delete
 *   PATCH  /listings/:id/verify      (admin only)        — verify
 *   POST   /listings/:id/images      (host, multipart)   — add images
 *   DELETE /listings/:id/images      (host, ?imageUrl=)  — remove one image
 *
 * Responses are wrapped as { success, data } (verified against the live API).
 */

export type ListingPayload = {
  title: string;
  location: string;
  description?: string;
  bedrooms?: number;
  amenities?: string[];
  price: number;
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
