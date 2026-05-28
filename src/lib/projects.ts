import { getAccessToken } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type ProjectDto = {
  id: string;
  projectCode: string;
  projectName: string;
  category?: string;
  constructionType?: string;
  city?: string;
  ownerName?: string;
  ownerMobile?: string;
  ownerEmail?: string;
  ownerOrg?: string;
  paymentMode: string;
  registrationStatus: string;
  certificationStatus: string;
  invoiceNo?: string;
  area?: string;
  ratingTypeId: number;
  ratingTypeName: string;
  ratingAbbreviation: string;
  configKey: string | null;
  hasConfig: boolean;
  versionTypes: string[];
  versionType: string;
  createdAt: string;
};

export type RatingTypeDto = {
  id: number;
  name: string;
  abbreviation: string;
  configKey: string | null;
  hasConfig: boolean;
  versionTypes: string[];
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(message ?? "Request failed");
  }
  return (await response.json()) as T;
}

export async function fetchRatingTypes(): Promise<RatingTypeDto[]> {
  return request<RatingTypeDto[]>("/rating-types");
}

export async function fetchMyProjects(): Promise<ProjectDto[]> {
  return request<ProjectDto[]>("/projects");
}

export async function fetchProjectById(id: string): Promise<ProjectDto> {
  return request<ProjectDto>(`/projects/${id}`);
}

export type CreateProjectPayload = {
  ratingTypeId: number;
  projectName: string;
  versionType?: string;
  category?: string;
  constructionType?: string;
  city?: string;
  ownerName?: string;
  ownerMobile?: string;
  ownerEmail?: string;
  ownerOrg?: string;
  paymentMode?: string;
};

export async function createProject(payload: CreateProjectPayload): Promise<ProjectDto> {
  return request<ProjectDto>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
