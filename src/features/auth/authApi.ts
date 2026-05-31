import api from "../../lib/api";
import type { AuthUser, UserRole } from "../../lib/authStorage";

/**
 * Auth API — UniStay+ backend endpoints
 *
 *   POST /auth/register  -> { message, user }         (no token — auto-login follows)
 *   POST /auth/login     -> { message, token, user }
 *   GET  /auth/me        -> { user }                  (protected)
 *   PUT  /auth/me        -> { message, user }          (protected)
 *   POST /auth/change-password                         (protected)
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

/**
 * Unwrap the user from any backend response shape and normalise field names.
 * - Handles both { user } and flat objects.
 * - Maps profilePicture → avatar so the rest of the app can use user.avatar.
 */
function normalizeUser(raw: any): AuthUser {
  const u = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw ?? {};
  return {
    ...u,
    id: u.id ?? u._id ?? "",
    // Backend stores it as profilePicture; AuthUser calls it avatar
    avatar: u.avatar ?? u.profilePicture ?? undefined,
  };
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
  /**
   * Register a new account.
   * The backend does NOT issue a token — the AuthContext auto-calls login()
   * right after so the user lands on the dashboard without a manual sign-in step.
   */
  async register(payload: RegisterPayload): Promise<AuthResult> {
    const res = await api.post("/auth/register", payload);
    return normalizeAuth(res.data);
  },

  /** Login and receive a JWT. */
  async login(payload: LoginPayload): Promise<AuthResult> {
    const res = await api.post("/auth/login", payload);
    return normalizeAuth(res.data);
  },

  /** Fetch the full current-user profile (requires Bearer token). */
  async me(): Promise<AuthUser> {
    const res = await api.get("/auth/me");
    return normalizeUser(res.data);
  },

  /** Update name / phone / location (requires Bearer token). */
  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    const res = await api.put("/auth/me", payload);
    return normalizeUser(res.data);
  },

  /** Change password — accepts currentPassword or oldPassword (backend handles both). */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post("/auth/change-password", payload);
  },

  /** Send a password-reset link to the given email address. */
  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  /** Complete a password reset using the token from the reset email. */
  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    // Backend accepts both `password` and `newPassword` spellings.
    await api.post("/auth/reset-password", {
      token: payload.token,
      password: payload.password,
      newPassword: payload.password,
    });
  },
};
