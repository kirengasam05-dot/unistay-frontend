export type UserRole =
  | "STUDENT"
  | "HOST"
  | "EMPLOYER"
  | "ADMIN";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  password?: string;
  phone?: string;
  location?: string;
  avatar?: string;
};

const USER_KEY = "unistay_user";
const TOKEN_KEY = "unistay_token";

export function saveUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  const data = localStorage.getItem(USER_KEY);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function logoutUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}