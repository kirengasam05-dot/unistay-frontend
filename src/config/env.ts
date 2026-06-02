const apiTimeout = Number(import.meta.env.VITE_API_TIMEOUT);

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  apiTimeout: Number.isFinite(apiTimeout) && apiTimeout > 0 ? apiTimeout : 60000,
} as const;
