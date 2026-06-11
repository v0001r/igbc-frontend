import { getAccessToken, logout } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error("Unauthorized. Please login again.");

  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401) {
    logout();
    window.location.replace("/admin/login");
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(message ?? "Request failed");
  }
  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
}

export type AdminUserRole = "IGBC_STAFF" | "TPA";

export type RatingTypeOption = {
  id: number;
  ratingName: string;
  shortRatingName: string;
};

export type AdminUserListItem = {
  id: string;
  displayName: string;
  email: string;
  phone: string | null;
  organization: string | null;
  roleName: AdminUserRole | null;
  userType: string;
  status: "active" | "inactive";
  isLead: boolean;
  assignedRatingTypes: RatingTypeOption[];
  createdAt: string | null;
};

export type AdminUserDetail = AdminUserListItem & {
  address: string | null;
  isFirstLogin: boolean;
  assignedProjects: Array<{
    projectId: number;
    igbcProjectId?: string | null;
    projectName: string;
    status: string;
  }>;
  updatedAt: string | null;
};

export type AdminUsersPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: AdminUserListItem[];
};

export type ListUsersParams = {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  ratingTypeId?: number;
  status?: "active" | "inactive" | "";
  role?: AdminUserRole;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "displayName";
  sortOrder?: "ASC" | "DESC";
};

export async function fetchRatingTypes(): Promise<RatingTypeOption[]> {
  const response = await fetch(`${API_URL}/rating-types`);
  if (!response.ok) throw new Error("Failed to load rating types");
  const rows = (await response.json()) as Array<{
    id: number;
    ratingName: string;
    shortRatingName: string;
  }>;
  return rows.map((r) => ({
    id: r.id,
    ratingName: r.ratingName,
    shortRatingName: r.shortRatingName,
  }));
}

function toQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return q.toString();
}

export async function getAdminUsers(params: ListUsersParams) {
  const query = toQuery(params as Record<string, string | number | undefined>);
  return request<AdminUsersPagination>(`/users?${query}`);
}

export async function getAdminUserById(id: string) {
  return request<AdminUserDetail>(`/users/${id}`);
}

export async function createAdminUser(payload: {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  address?: string;
  role: AdminUserRole;
  ratingTypeIds: number[];
  projectIds?: number[];
  status?: "active" | "inactive";
  isLead?: boolean;
}) {
  return request<AdminUserDetail>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(
  id: string,
  payload: Partial<{
    fullName: string;
    email: string;
    phone: string;
    organization: string;
    address: string;
    role: AdminUserRole;
    ratingTypeIds: number[];
    projectIds: number[];
    status: "active" | "inactive";
    isLead: boolean;
  }>,
) {
  return request<AdminUserDetail>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserStatus(id: string, status: "active" | "inactive") {
  return request<AdminUserDetail>(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function resetAdminUserPassword(id: string) {
  return request<{ message: string; userId: string }>(`/users/${id}/reset-password`, {
    method: "PATCH",
  });
}

export async function bulkUpdateAdminUserStatus(userIds: string[], status: "active" | "inactive") {
  return request<{ updated: number }>("/users/bulk/status", {
    method: "PATCH",
    body: JSON.stringify({ userIds, status }),
  });
}

export async function exportAdminUsers(params: ListUsersParams) {
  const query = toQuery(params as Record<string, string | number | undefined>);
  const token = getAccessToken();
  const response = await fetch(`${API_URL}/users/export?${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Export failed");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "users-export.csv";
  link.click();
  URL.revokeObjectURL(url);
}
