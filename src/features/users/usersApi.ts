import api from '../../lib/api';
import type { User, UserRole } from '../../types/api';
import { extractList, extractOne } from '../../types/api';

/**
 * Users API (admin) — mirrors the UniStay+ backend
 *   GET    /users              — list (admin only)
 *   GET    /users/:id
 *   DELETE /users/:id
 *   PATCH  /users/:id/role     — { role }
 *   PATCH  /users/:id/active   — toggle active
 */
export const usersApi = {
  async list(): Promise<User[]> {
    const res = await api.get('/users');
    return extractList<User>(res.data);
  },
  async get(id: string): Promise<User> {
    const res = await api.get(`/users/${id}`);
    return extractOne<User>(res.data);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
  async setRole(id: string, role: UserRole): Promise<User> {
    const res = await api.patch(`/users/${id}/role`, { role });
    return extractOne<User>(res.data);
  },
  async toggleActive(id: string): Promise<User> {
    const res = await api.patch(`/users/${id}/active`);
    return extractOne<User>(res.data);
  },
};
