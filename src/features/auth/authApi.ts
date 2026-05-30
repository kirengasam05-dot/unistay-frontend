import api from '../../lib/api';
import type { AuthUser } from '../../lib/authStorage';

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  role: string;
  password: string;
};
export type AuthResponse = { token: string; user: AuthUser };

function extractAuth(payload: any): AuthResponse {
  return payload?.data?.data || payload?.data || payload;
}

export const authApi = {
  async login(data: LoginPayload): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return extractAuth(response.data);
  },
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return extractAuth(response.data);
  },
};
