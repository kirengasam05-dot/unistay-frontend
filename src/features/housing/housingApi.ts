import api from "../../lib/api";
import type { Housing, VerificationStatus } from "../../types/api";
import { extractList, extractOne } from "../../types/api";

/**
 * Housing / Listings API — mirrors the UniStay+ backend
 * (see https://cdn-unistay.onrender.com/api-docs)
 *   GET    /listings                 (public)            — all listings
 *   GET    /listings/:id             (public)            — single listing
 *   GET    /listings/host/my-listings (host)              — my listings
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
    const res = await api.get("/listings");
    return extractList<Housing>(res.data);
  },

  async getMyListings(): Promise<Housing[]> {
    const res = await api.get("/listings/host/my-listings");
    return extractList<Housing>(res.data);
  },

  async getOne(id: string): Promise<Housing> {
    const res = await api.get(`/listings/${id}`);
    return extractOne<Housing>(res.data);
  },

  /**
   * Create a listing. Per the Swagger contract, POST /listings only accepts
   * multipart/form-data, so we always send FormData (the global instance sets
   * the boundary). `files` is optional.
   */
  async create(data: ListingPayload, files: File[] = []): Promise<Housing> {
    const res = await api.post("/listings", toFormData(data, files));
    return extractOne<Housing>(res.data);
  },

  /** Alias kept for readability at call sites that always have images. */
  async createWithImages(data: ListingPayload, files: File[]): Promise<Housing> {
    const res = await api.post("/listings", toFormData(data, files));
    return extractOne<Housing>(res.data);
  },

  /** Partial update is supported by the backend (verified). */
  async update(
    id: string,
    data: Partial<ListingPayload> & { verificationStatus?: VerificationStatus }
  ): Promise<Housing> {
    const res = await api.put(`/listings/${id}`, data);
    return extractOne<Housing>(res.data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/listings/${id}`);
  },

  /**
   * Admin-only — approve or reject a listing. Both use the same endpoint
   * (PATCH /listings/:id/verify) with a `status` of "VERIFIED" or "REJECTED".
   */
  async setVerification(id: string, status: "VERIFIED" | "REJECTED"): Promise<Housing> {
    const res = await api.patch(`/listings/${id}/verify`, { status });
    return extractOne<Housing>(res.data);
  },

  async addImages(id: string, files: File[]): Promise<Housing> {
    const fd = new FormData();
    files.forEach((file) => fd.append("images", file));
    const res = await api.post(`/listings/${id}/images`, fd);
    return extractOne<Housing>(res.data);
  },

  async removeImage(id: string, imageUrl: string): Promise<Housing> {
    const res = await api.delete(`/listings/${id}/images`, { params: { imageUrl } });
    return extractOne<Housing>(res.data);
  },
};
