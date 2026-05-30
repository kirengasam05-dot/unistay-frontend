import api from '../../lib/api';

export const housingApi = {
<<<<<<< Updated upstream
  list: () => api.get('/housing'),
  get: (id: string) => api.get('/housing/' + id),
  create: (data: unknown) => api.post('/housing', data),
  update: (id: string, data: unknown) => api.put('/housing/' + id, data),
  remove: (id: string) => api.delete('/housing/' + id),
=======
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

  async getMine(): Promise<Housing[]> {
    const response = await api.get('/listings/mine');
    return extractList<Housing>(response.data);
  },

  async update(id: string, data: Partial<CreateHousingPayload & { availability: boolean }>): Promise<Housing> {
    const response = await api.patch(`/listings/${id}`, data);
    return extractOne<Housing>(response.data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/listings/${id}`);
  },
>>>>>>> Stashed changes
};
