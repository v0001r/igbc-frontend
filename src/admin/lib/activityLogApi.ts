import { getAccessToken, logout } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type ActivityLogItem = {
  id: string;
  projectId: number | null;
  projectLabel: string | null;
  projectName: string | null;
  certificationApplicationId: number | null;
  userId: string | null;
  userDisplayName: string | null;
  userEmail: string | null;
  userRole: string | null;
  userRoleLabel: string | null;
  activityType: string;
  activityTypeLabel: string;
  module: string | null;
  tabName: string | null;
  subtabName: string | null;
  activityTitle: string;
  activityDescription: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  pointsAwarded: string | null;
  pointsDeducted: string | null;
  documentName: string | null;
  documentCount: number | null;
  submissionCount: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type ActivityLogQuery = {
  page?: number;
  limit?: number;
  projectId?: number;
  userId?: string;
  activityType?: string;
  module?: string;
  userRole?: string;
  from?: string;
  to?: string;
  search?: string;
};

export type ActivityLogResponse = {
  items: ActivityLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalAll: number;
    todayCount: number;
  };
};

async function request<T>(path: string): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Unauthorized. Please login again.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    logout();
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
    throw new Error("Unauthorized. Please login again.");
  }

  if (response.status === 403) {
    throw new Error("Forbidden. Admin access only.");
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(message ?? "Request failed");
  }

  return (await response.json()) as T;
}

function toQueryString(params: ActivityLogQuery): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchActivityLogs(params: ActivityLogQuery = {}) {
  return request<ActivityLogResponse>(`/admin/activity-logs${toQueryString(params)}`);
}
