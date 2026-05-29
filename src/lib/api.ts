import axios from "axios";
import type { AxiosInstance } from "axios";

/**
 * Global Axios instance for the entire app.
 *
 * Every feature module imports this single client (`import api from "../../lib/api"`)
 * so that base URL, auth token injection, multipart handling and error normalisation
 * are configured in exactly one place. Do not call `axios` directly anywhere else.
 */

const TOKEN_KEYS = ["unistay_token", "token", "accessToken"] as const;

export function getAuthToken(): string | null {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  // The backend is a free-tier instance that can cold-start; give it room.
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 60000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// --- Request: attach bearer token + correct multipart handling ---
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // For file uploads, let the browser set `multipart/form-data` together with the
  // correct boundary — a hard-coded Content-Type would break the upload.
  if (config.data instanceof FormData) {
    const headers = config.headers as any;
    if (typeof headers?.delete === "function") headers.delete("Content-Type");
    else if (headers) delete headers["Content-Type"];
  }

  return config;
});

// --- Response: normalise errors so callers can rely on error.message / error.status ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    const message =
      (typeof data === "string" && data) ||
      data?.message ||
      data?.error ||
      (Array.isArray(data?.errors) &&
        data.errors.map((e: any) => e?.message || e).join(", ")) ||
      (error?.code === "ECONNABORTED" ? "The server took too long to respond. Please try again." : "") ||
      error?.message ||
      "Something went wrong. Please try again.";

    const normalized = new Error(message);
    (normalized as any).status = error?.response?.status;
    (normalized as any).original = error;
    return Promise.reject(normalized);
  }
);

export { api };
export default api;
