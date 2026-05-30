import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { authApi } from "../features/auth/authApi";
import type {
  AuthResult,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from "../features/auth/authApi";
import {
  getToken,
  getUser,
  logoutUser,
  saveToken,
  saveUser,
} from "../lib/authStorage";
import type { AuthUser } from "../lib/authStorage";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  /** True only during the initial token validation on app boot. */
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthResult>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());
  const [token, setToken] = useState<string | null>(() => getToken());
  const [loading, setLoading] = useState<boolean>(() => !!getToken());

  // On boot, if a token is stored, validate it and refresh the profile.
  useEffect(() => {
    let active = true;
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const fresh = await authApi.me();
        if (!active) return;
        setUser(fresh);
        saveUser(fresh);
      } catch (err) {
        // Only force a logout when the token is actually rejected (401).
        // Tolerate transient/network errors (e.g. a cold-starting backend).
        if ((err as any)?.status === 401) {
          logoutUser();
          if (active) {
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { token: t, user: u } = await authApi.login(payload);
    if (t) {
      saveToken(t);
      setToken(t);
    }
    // The login response only carries id/email/role — hydrate the full
    // profile (fullName, phone, location, …) from /auth/me.
    let profile = u;
    try {
      profile = await authApi.me();
    } catch {
      /* fall back to the basic user from the login response */
    }
    saveUser(profile);
    setUser(profile);
    return profile;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authApi.register(payload);
    if (result.token) {
      saveToken(result.token);
      setToken(result.token);
      saveUser(result.user);
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await authApi.me();
    setUser(fresh);
    saveUser(fresh);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await authApi.updateProfile(payload);
    // The API may return only the changed fields — merge over what we already have.
    const merged = { ...(getUser() || {}), ...updated } as AuthUser;
    saveUser(merged);
    setUser(merged);
    return merged;
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    await authApi.changePassword(payload);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      changePassword,
    }),
    [user, token, loading, login, register, logout, refreshUser, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
