import { getAccessToken } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function authHeaders() {
  const headers = new Headers({ Accept: "application/json" });
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = authHeaders();
  if (init?.body && !headers.has("Content-Type")) {
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

export type WorkflowAssignee = {
  id: string;
  displayName: string;
  assignedAt?: string;
};

export type ProjectWorkflowResponse = {
  isSubmitted: boolean;
  workflowStatus: string;
  submittedAt: string | null;
  assignedStaff: WorkflowAssignee | null;
  assignedTpa: WorkflowAssignee | null;
  timeline: Array<{
    id: string;
    action: string;
    actorUserId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  }>;
};

export type LeadSubmittedProject = {
  projectId: number;
  igbcProjectId: string;
  projectName: string;
  clientName: string;
  ratingType: string;
  ratingTypeId: number | null;
  submissionDate: string | null;
  workflowStatus: string;
  assignedStaff: { id: string; displayName: string } | null;
};

export async function finalSubmitProject(projectId: string) {
  return request<{ message: string; isSubmitted: boolean; workflowStatus: string }>(
    `/projects/${projectId}/certification/final-submit`,
    { method: "POST" },
  );
}

export async function fetchProjectWorkflow(projectId: string) {
  return request<ProjectWorkflowResponse>(`/projects/${projectId}/workflow`);
}

export async function fetchLeadSubmittedProjects() {
  return request<{ items: LeadSubmittedProject[] }>("/projects/lead/submitted");
}

export async function fetchEligibleStaff(projectId: number) {
  return request<{ items: Array<{ id: string; displayName: string; email: string }> }>(
    `/projects/${projectId}/eligible-staff`,
  );
}

export async function fetchEligibleTpas(projectId: number) {
  return request<{ items: Array<{ id: string; displayName: string; email: string }> }>(
    `/projects/${projectId}/eligible-tpas`,
  );
}

export async function assignStaffToProject(projectId: number, staffId: string) {
  return request<{ message: string }>(`/projects/${projectId}/assign-staff`, {
    method: "POST",
    body: JSON.stringify({ staffId }),
  });
}

export async function assignTpaToProject(projectId: number, tpaId: string) {
  return request<{ message: string }>(`/projects/${projectId}/assign-tpa`, {
    method: "POST",
    body: JSON.stringify({ tpaId }),
  });
}

export async function fetchLeadDashboardStats() {
  return request<{
    submittedProjects: number;
    unassignedStaff: number;
    assignedStaff: number;
  }>("/dashboard/lead");
}

export async function fetchStaffDashboardStats() {
  return request<{
    assignedProjects: number;
    pendingProjects: number;
    assignedToTpa: number;
    completedProjects: number;
  }>("/dashboard/staff");
}

export async function fetchTpaDashboardStats() {
  return request<{
    assignedProjects: number;
    underReview: number;
    completedProjects: number;
  }>("/dashboard/tpa");
}
