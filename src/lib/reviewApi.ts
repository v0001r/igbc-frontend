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

export type CreditReviewDto = {
  id?: string;
  tab: string;
  subtab: string;
  reviewerRole: string;
  awardedPoints: number;
  pendingPoints: number;
  deniedPoints: number;
  technicalAdvice: string | null;
  reviewRemarks: string | null;
  rowStatus: string;
  updatedAt?: string;
};

export type CreditListItem = {
  tab: string;
  subtab: string;
  tabTitle: string;
  subtabTitle: string;
  maxPoints: number;
  tpaReview: CreditReviewDto | null;
  coordinatorReview: CreditReviewDto | null;
  editable: boolean;
  reviewed: boolean;
};

export type ReviewCycleSummary = {
  id: string;
  submissionCount: number;
  cycleStatus: string;
  tpaLockedAt: string | null;
  coordinatorLockedAt: string | null;
  totalPendingPoints: number;
  certificateEligible: boolean;
  openedAt: string;
  closedAt: string | null;
};

export type SaveCreditReviewPayload = {
  awardedPoints?: number;
  pendingPoints?: number;
  deniedPoints?: number;
  technicalAdvice?: string;
  reviewRemarks?: string;
};

export async function fetchTpaCredits(projectId: string) {
  return request<{ cycle: ReviewCycleSummary | null; credits: CreditListItem[] }>(
    `/projects/${projectId}/reviews/credits`,
  );
}

export async function fetchCoordinatorCredits(projectId: string) {
  return request<{ cycle: ReviewCycleSummary | null; credits: CreditListItem[] }>(
    `/projects/${projectId}/reviews/coordinator/credits`,
  );
}

export async function saveTpaCredit(
  projectId: string,
  tab: string,
  subtab: string,
  payload: SaveCreditReviewPayload,
) {
  return request<CreditReviewDto>(`/projects/${projectId}/reviews/credits/${tab}/${subtab}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function saveCoordinatorCredit(
  projectId: string,
  tab: string,
  subtab: string,
  payload: SaveCreditReviewPayload,
) {
  return request<CreditReviewDto>(
    `/projects/${projectId}/reviews/coordinator/credits/${tab}/${subtab}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function fetchTpaCompleteness(projectId: string) {
  return request<{
    total: number;
    reviewed: number;
    complete: boolean;
    optional: boolean;
    missing: Array<{ tab: string; subtab: string }>;
  }>(`/projects/${projectId}/reviews/completeness`);
}

export async function fetchCoordinatorCompleteness(projectId: string) {
  return request<{
    total: number;
    reviewed: number;
    complete: boolean;
    optional: boolean;
    missing: Array<{ tab: string; subtab: string }>;
  }>(`/projects/${projectId}/reviews/coordinator/completeness`);
}

export async function previewTpaReport(projectId: string, remark?: string) {
  return request<{ downloadUrl: string; versionNo: number }>(
    `/projects/${projectId}/reviews/preview-report`,
    { method: "POST", body: JSON.stringify({ remark }) },
  );
}

export async function previewCoordinatorReport(projectId: string, remark?: string) {
  return request<{ downloadUrl: string; versionNo: number }>(
    `/projects/${projectId}/reviews/coordinator/preview-report`,
    { method: "POST", body: JSON.stringify({ remark }) },
  );
}

export async function releaseTpaReport(projectId: string, remark?: string) {
  return request<{ message: string; downloadUrl: string; cycleStatus: string }>(
    `/projects/${projectId}/reviews/release-report`,
    { method: "POST", body: JSON.stringify({ remark }) },
  );
}

export async function rereleaseCoordinatorReport(projectId: string, remark?: string) {
  return request<{ message: string; downloadUrl: string; totalPendingPoints: number }>(
    `/projects/${projectId}/reviews/rerelease-report`,
    { method: "POST", body: JSON.stringify({ remark }) },
  );
}

export async function fetchCurrentReport(projectId: string) {
  return request<{
    available: boolean;
    downloadUrl?: string;
    versionNo?: number;
    generatedAt?: string;
    cycle: ReviewCycleSummary | null;
  }>(`/projects/${projectId}/reviews/current/report`);
}

export async function acceptReport(projectId: string, remark?: string) {
  return request<{ message: string; certificateEligible: boolean; totalPendingPoints: number }>(
    `/projects/${projectId}/reviews/current/accept`,
    { method: "POST", body: JSON.stringify({ remark }) },
  );
}

export async function rejectReport(projectId: string, remark?: string) {
  return request<{ message: string; isSubmitted: boolean }>(
    `/projects/${projectId}/reviews/current/reject`,
    { method: "POST", body: JSON.stringify({ remark }) },
  );
}

export async function fetchCertificateEligibility(projectId: string) {
  return request<{
    certificateEligible: boolean;
    totalPendingPoints: number;
    blockingCredits: Array<{ tab: string; subtab: string; pendingPoints: number }>;
    reason: string | null;
  }>(`/projects/${projectId}/certificate/eligibility`);
}

export type CertificateDetails = {
  projectId: number;
  isSubmitted: boolean;
  isPending: boolean;
  certificateStatus: string;
  clientReportStatus: string;
  canViewCertificateTab: boolean;
  canAcceptCertificate: boolean;
  canDownloadCertificate: boolean;
  totalAwardedPoints: number;
  level: string;
  unrated: boolean;
  ratingSystemName: string;
  versionLabel: string;
  registrationNo: string;
  projectName: string;
  address: string;
  certificateAcceptedAt: string | null;
};

export type CertificateLogItem = {
  id: string;
  action: string;
  remarks: string | null;
  createdBy: string;
  createdAt: string;
};

export async function fetchCertificateDetails(projectId: string) {
  return request<CertificateDetails>(`/projects/${projectId}/certificate/details`);
}

export async function fetchCertificateLogs(projectId: string) {
  return request<{ logs: CertificateLogItem[] }>(`/projects/${projectId}/certificate/logs`);
}

export async function previewCertificate(projectId: string) {
  return request<{
    downloadUrl: string;
    fileName: string;
    fileContentBase64: string;
  }>(`/projects/${projectId}/certificate/preview`);
}

export async function acceptCertificate(projectId: string, remark?: string) {
  return request<{ message: string; certificateStatus: string }>(
    `/projects/${projectId}/certificate/accept`,
    { method: "POST", body: JSON.stringify({ remark }) },
  );
}

export async function rejectCertificate(projectId: string, remarks: string) {
  return request<{ message: string; certificateStatus: string }>(
    `/projects/${projectId}/certificate/reject`,
    { method: "POST", body: JSON.stringify({ remarks }) },
  );
}

export async function editCertificate(
  projectId: string,
  payload: { projectName: string; address: string },
) {
  return request<{ message: string }>(`/projects/${projectId}/certificate/edit`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function downloadCertificate(projectId: string) {
  return request<{
    message: string;
    downloadUrl: string;
    fileName: string;
    fileContentBase64: string;
  }>(`/projects/${projectId}/certificate/download`, { method: "POST" });
}

export function createPdfBlobUrl(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

export function downloadBase64File(base64: string, fileName: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export async function generateCertificate(projectId: string) {
  return request<{ message: string; workflowStatus: string }>(
    `/projects/${projectId}/certificate/generate`,
    { method: "POST" },
  );
}

export async function initiateReappeal(projectId: string, tabs: string[], feeAmount?: number) {
  return request<{ message: string; reappealId: string }>(`/projects/${projectId}/reappeals`, {
    method: "POST",
    body: JSON.stringify({ tabs, feeAmount }),
  });
}

export function reportDownloadUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function triggerFileDownload(path: string, fileName: string) {
  const url = reportDownloadUrl(path);
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) {
    throw new Error("Download failed");
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
