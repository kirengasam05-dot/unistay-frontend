import api from "../../lib/api";
import type { Housing } from "../../types/api";
import { extractList, extractOne } from "../../types/api";

export type CreateHousingPayload = {
  title: string;
  location: string;
  description?: string;
  bedrooms?: number;
  amenities?: string[];
  price: number;
  images?: string[];
};

export const housingApi = {
  async getAll(): Promise<Housing[]> {
    const response = await api.get("/listings");
    return extractList<Housing>(response.data);
  },

  async create(data: CreateHousingPayload): Promise<Housing> {
    const response = await api.post("/listings", data);
    return extractOne<Housing>(response.data);
  },

  async createWithImages(data: CreateHousingPayload, files: File[]): Promise<Housing> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) value.forEach((item) => formData.append(key, item));
      else formData.append(key, String(value));
    });

    files.forEach((file) => formData.append("images", file));

    const response = await api.post("/listings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return extractOne<Housing>(response.data);
  },

  async verify(id: string): Promise<Housing> {
    const response = await api.patch(`/listings/${id}/verify`);
    return extractOne<Housing>(response.data);
  },

  async reject(id: string): Promise<Housing> {
    const response = await api.patch(`/listings/${id}/reject`);
    return extractOne<Housing>(response.data);
  },
};
