const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type PublicSupportContact = {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
};

type SupportListResponse = {
  items: PublicSupportContact[];
};

export async function getPublicSupportContacts(params?: {
  search?: string;
  department?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.department) query.set("department", params.department);
  query.set("limit", String(Math.min(100, Math.max(1, params?.limit ?? 100))));

  const response = await fetch(`${API_URL}/support?${query.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Unable to load support contacts");
  }

  const data = (await response.json()) as SupportListResponse | PublicSupportContact[];
  return Array.isArray(data) ? data : data.items ?? [];
}
