import api from '../../lib/api';
import { extractList, extractOne } from '../../types/api';

export type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
};

export type CreateUserPayload = {
  fullName: string;
  email: string;
  role: string;
  password?: string;
};

export const usersApi = {
  async getAll(): Promise<ApiUser[]> {
    const response = await api.get('/users');
    return extractList<ApiUser>(response.data);
  },
  async create(data: CreateUserPayload): Promise<ApiUser> {
    const response = await api.post('/users', data);
    return extractOne<ApiUser>(response.data);
  },
  async updateRole(id: string, role: string): Promise<ApiUser> {
    const response = await api.patch('/users/' + id + '/role', { role });
    return extractOne<ApiUser>(response.data);
  },
  async remove(id: string): Promise<void> {
    await api.delete('/users/' + id);
  },
};
