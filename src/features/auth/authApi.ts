import api from "../../lib/api";
import type { AuthUser, UserRole } from "../../lib/authStorage";

/**
 * Auth API — mirrors the UniStay+ backend (see https://cdn-unistay.onrender.com/api-docs)
 *   POST /auth/register        -> { token, user }
 *   POST /auth/login           -> { token, user }
 *   GET  /auth/me              -> current user (protected)
 *   PUT  /auth/me              -> updated user (protected)
 *   POST /auth/change-password (protected)
 *   POST /auth/forgot-password
 *   POST /auth/reset-password
 */

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  role: UserRole;
};

export type LoginPayload = { email: string; password: string };

export type UpdateProfilePayload = Partial<{
  fullName: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  skillsProfile: string;
}>;

export type ChangePasswordPayload = { currentPassword: string; newPassword: string };

export type ResetPasswordPayload = { token: string; password: string };

export type AuthResult = { token: string | null; user: AuthUser };

/** Backends vary in how they nest the user — unwrap defensively and normalise the id. */
function normalizeUser(raw: any): AuthUser {
  const u = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw ?? {};
  return { ...u, id: u.id ?? u._id ?? "" };
}

/** Pull a token out of any of the common response shapes. */
function normalizeAuth(payload: any): AuthResult {
  const token =
    payload?.token ??
    payload?.accessToken ??
    payload?.data?.token ??
    payload?.data?.accessToken ??
    null;
  return { token, user: normalizeUser(payload) };
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResult> {
    const res = await api.post("/auth/register", payload);
    return normalizeAuth(res.data);
  },

  async login(payload: LoginPayload): Promise<AuthResult> {
    const res = await api.post("/auth/login", payload);
    return normalizeAuth(res.data);
  },

  async me(): Promise<AuthUser> {
    const res = await api.get("/auth/me");
    return normalizeUser(res.data);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    const res = await api.put("/auth/me", payload);
    return normalizeUser(res.data);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post("/auth/change-password", payload);
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    // Send both spellings so we work whether the backend expects `password` or `newPassword`.
    await api.post("/auth/reset-password", {
      token: payload.token,
      password: payload.password,
      newPassword: payload.password,
    });
  },
};
