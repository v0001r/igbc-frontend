const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type DirectoryMembershipType =
  | "Founding Membership"
  | "Annual Membership"
  | "Individual Membership";

export type DirectoryMember = {
  id: string;
  logo: string;
  name: string;
  membershipType: DirectoryMembershipType;
  website: string;
  category: string;
  email: string;
  phone: string;
};

export type UpsertDirectoryMemberPayload = Omit<DirectoryMember, "id">;

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(message ?? "Request failed");
  }
  return (await response.json()) as T;
}

export async function listDirectoryMembers(params: {
  search?: string;
  category?: string;
  membershipType?: "All" | DirectoryMembershipType;
  startsWith?: string;
}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.membershipType) query.set("membershipType", params.membershipType);
  if (params.startsWith) query.set("startsWith", params.startsWith);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<DirectoryMember[]>(`/membership-directory${suffix}`, { method: "GET" });
}

export async function createDirectoryMember(payload: UpsertDirectoryMemberPayload) {
  return request<DirectoryMember>("/membership-directory", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDirectoryMember(id: string, payload: UpsertDirectoryMemberPayload) {
  return request<DirectoryMember>(`/membership-directory/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteDirectoryMember(id: string) {
  return request<{ success: boolean }>(`/membership-directory/${id}`, {
    method: "DELETE",
  });
}
