const TOKEN_KEY = "igbc_access_token";
const USER_KEY = "igbc_user";

export type AuthUser = {
  id: string;
  email: string;
  userType?: "m" | "s" | "a" | "T";
  roleName?: string | null;
  status?: "active" | "inactive";
  isFirstLogin?: boolean;
  isLead?: boolean;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  salutation: string;
  state: string;
  country: string;
  mobile?: string;
  telephone?: string;
  city?: string;
  pincode?: string;
  addressLine1?: string;
  addressLine2?: string;
  organizationName?: string;
  designation?: string;
  department?: string;
  yearsOfExperience?: string;
  employeeId?: string;
  organizationType?: string;
  prefEmailNotifications?: boolean;
  prefSmsAlerts?: boolean;
  prefNewsletter?: boolean;
  preferredLanguage?: string;
  prefShowProfilePublicly?: boolean;
  prefShowEmailToMembers?: boolean;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
  mustChangePassword?: boolean;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(message ?? "Request failed");
  }

  return (await response.json()) as T;
}

export async function register(payload: {
  salutation: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  email: string;
  state: string;
  mobile?: string;
  telephone?: string;
  password: string;
}) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function persistAuth(response: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, response.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }
  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function fetchMyProfile() {
  const user = await request<AuthUser>("/profile/me", {
    method: "GET",
    headers: authHeaders(),
  });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function updateMyProfile(payload: Partial<AuthUser>) {
  const user = await request<AuthUser>("/profile/update", {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  const result = await request<{ message: string; user: AuthUser }>("/auth/change-password", {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  localStorage.setItem(USER_KEY, JSON.stringify(result.user));
  return result;
}

export async function forgotPassword(email: string) {
  return request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function validateResetToken(token: string) {
  return request<{ valid: boolean }>(`/auth/reset-password/${encodeURIComponent(token)}`, {
    method: "GET",
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
) {
  return request<{ message: string; loginPath: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  });
}
