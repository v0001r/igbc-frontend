import { getAccessToken, logout } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Unauthorized. Please login again.");
  }

  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  const auth = authHeaders() as Record<string, string>;
  if (auth.Authorization) {
    headers.set("Authorization", auth.Authorization);
  }
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    method: init?.method ?? "GET",
    headers,
    body: init?.body,
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

export type AdminPagination<T> = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: T[];
};

export type AdminApExamItem = {
  registrationId: string;
  examId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  examDate: string;
  examTime: string;
  paymentStatus: string;
  feeAmount: number;
  rescheduleCount: number;
  score?: number | null;
  reportUrl?: string | null;
  examScore?: number | null;
  resultStatus?: "pass" | "fail" | null;
  resultUpdatedAt?: string | null;
  actions?: {
    view?: boolean;
  };
};

export type AdminApExamDetails = Record<string, unknown> & {
  id?: string;
  registrationId?: string;
  examId?: string;
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  examDate?: string;
  examTime?: string;
  paymentStatus?: string;
  feeAmount?: number;
  assessment?: {
    reportUrl?: string | null;
    score?: number | null;
    resultStatus?: "pass" | "fail" | null;
    reportUploadedAt?: string | null;
    resultUpdatedAt?: string | null;
  };
  reportUrl?: string | null;
  examScore?: number | null;
  resultStatus?: "pass" | "fail" | null;
  reportUploadedAt?: string | null;
  resultUpdatedAt?: string | null;
};

export type AdminMembershipItem = {
  applicationId: string;
  membershipId?: string;
  userId: string;
  membershipType: string;
  membershipCategory: string;
  membershipPlan: string;
  membershipFee: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  isCertified?: boolean;
  certificateNumber?: string | null;
  certifiedAt?: string | null;
  paymentApprovalStatus?: "pending" | "approved";
  paymentApprovedAt?: string | null;
  actions?: {
    approvePayment?: boolean;
    viewCertificate?: boolean;
  };
};

export type AdminEventStatus = "active" | "draft" | "inactive";

export type AdminEventItem = {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  startDateTime: string;
  endDateTime: string;
  status: AdminEventStatus;
  bannerUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminSupportStatus = "active" | "inactive";

export type AdminSupportItem = {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  status: AdminSupportStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminCertificationApplicationTab = "submitted" | "approved" | "rejected";

export type AdminCertificationApplicationItem = {
  certificationApplication: Record<string, unknown> & {
    id?: number | string;
    certificationApplicationId?: number | string;
    projectId?: number | string;
    igbcProjectId?: string | number;
    status?: string;
    paymentStatus?: string;
    certificationFee?: number;
    finalPayableAmount?: number;
    paymentMethod?: string;
    paymentType?: string;
    transactionReference?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
    amount?: number;
    paymentAmount?: number;
    paymentDate?: string;
    remarks?: string;
    paymentRemarks?: string;
  };
  project: Record<string, unknown> & {
    id?: number | string;
    projectName?: string;
    category?: string;
    ratingSystem?: string;
    subRatingType?: string;
    projectType?: string;
    constructionType?: string;
    status?: string;
    paymentStatus?: string;
    certificateAppliedStatus?: string | boolean;
    igbcProjectId?: string | number;
    igbcprojectid?: string | number;
    temporaryProjectId?: string;
  };
};

export type AdminCertificationApplicationListResponse = {
  counts: {
    submitted: number;
    approved: number;
    rejected: number;
  };
  tab: AdminCertificationApplicationTab;
  total: number;
  items: AdminCertificationApplicationItem[];
};

export async function getAdminCertificationApplicationList(tab: AdminCertificationApplicationTab) {
  const query = new URLSearchParams();
  query.set("tab", tab);
  return request<AdminCertificationApplicationListResponse>(
    `/certification-application/admin/list?${query.toString()}`,
  );
}

export async function getAdminCertificationApplicationTab(
  tab: AdminCertificationApplicationTab,
) {
  return request<AdminCertificationApplicationListResponse>(
    `/certification-application/admin/tabs/${tab}`,
  );
}

export type AdminCertificationApplicationViewResponse = {
  certificationApplicationId: number;
  projectId: number;
  igbcProjectId?: string | null;
  temporaryProjectId?: string | null;
  canApproveOrReject: boolean;
  certificationApplication: Record<string, unknown>;
  project: Record<string, unknown>;
  projectDetails: Record<string, unknown>;
  contacts: Record<string, unknown> | null;
  owner: { name?: string; email?: string; mobile?: string | null } | null;
  registrationPayment: Record<string, unknown> | null;
  registrationInvoice: Record<string, unknown> | null;
};

export async function getAdminCertificationApplicationView(applicationId: string | number) {
  return request<AdminCertificationApplicationViewResponse>(
    `/certification-application/admin/application/${applicationId}/view`,
  );
}

export async function approveAdminCertificationApplication(applicationId: string | number) {
  return request<{
    certificationApplicationId: number;
    projectId: number;
    status: string;
    paymentStatus: string;
    message: string;
  }>(`/certification-application/admin/application/${applicationId}/approve`, {
    method: "PATCH",
  });
}

export async function rejectAdminCertificationApplication(
  applicationId: string | number,
  remark: string,
) {
  return request<{
    certificationApplicationId: number;
    projectId: number;
    status: string;
    paymentStatus: string;
    rejectRemark: string | null;
    message: string;
  }>(`/certification-application/admin/application/${applicationId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ remark }),
  });
}

export async function getAdminApExamList(params: { page?: number; limit?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  return request<AdminPagination<AdminApExamItem>>(`/ap-exam/admin/list?${query.toString()}`);
}

export async function getAdminApExamManageCertificateList(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  return request<AdminPagination<AdminApExamItem>>(
    `/ap-exam/admin/tabs/manage-certificate?${query.toString()}`,
  );
}

export async function getAdminApExamDetails(id: string) {
  return request<AdminApExamDetails>(`/ap-exam/${id}/view`);
}

export async function uploadAdminApExamReport(
  id: string,
  payload: { report: File; score: number },
) {
  const formData = new FormData();
  formData.append("report", payload.report);
  formData.append("score", String(payload.score));

  return request<{ message?: string; data?: unknown }>(`/ap-exam/${id}/report`, {
    method: "POST",
    body: formData,
  });
}

export async function updateAdminApExamResult(id: string, payload: { result: "pass" | "fail" }) {
  return request<{ message?: string; data?: unknown }>(`/ap-exam/${id}/result`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getAdminMembershipList(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  return request<AdminPagination<AdminMembershipItem>>(
    `/membership/applications/admin/list?${query.toString()}`,
  );
}

export async function getAdminMembershipTabList(params: {
  tab: "saved" | "manage-membership" | "manage-certificate";
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  email?: string;
  organization?: string;
  membershipType?: string;
  verificationStatus?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.name) query.set("name", params.name);
  if (params.email) query.set("email", params.email);
  if (params.organization) query.set("organization", params.organization);
  if (params.membershipType) query.set("membershipType", params.membershipType);
  if (params.verificationStatus) query.set("verificationStatus", params.verificationStatus);
  return request<AdminPagination<AdminMembershipItem>>(
    `/membership/applications/admin/tabs/${params.tab}?${query.toString()}`,
  );
}

export async function approveMembershipPayment(applicationId: string) {
  return request<{ message?: string }>(`/membership/applications/admin/${applicationId}/approve-payment`, {
    method: "POST",
  });
}

export async function getAdminMembershipApplicationDetails(applicationId: string) {
  return request<Record<string, unknown>>(`/membership/applications/${applicationId}`);
}

export async function getAdminEvents(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminEventStatus | "";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  return request<AdminPagination<AdminEventItem>>(`/admin/events?${query.toString()}`);
}

export async function getAdminEventDetails(id: string) {
  return request<AdminEventItem>(`/admin/events/${id}`);
}

export async function createAdminEvent(formData: FormData) {
  return request<AdminEventItem>(`/admin/events`, {
    method: "POST",
    body: formData,
  });
}

export async function updateAdminEvent(id: string, formData: FormData) {
  return request<AdminEventItem>(`/admin/events/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export async function deleteAdminEvent(id: string) {
  return request<{ message?: string }>(`/admin/events/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminSupportList(params: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: AdminSupportStatus | "";
  sortBy?: "name" | "createdAt";
  sortOrder?: "ASC" | "DESC";
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.department) query.set("department", params.department);
  if (params.status) query.set("status", params.status);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  return request<AdminPagination<AdminSupportItem>>(`/admin/support?${query.toString()}`);
}

export async function getAdminSupportDetails(id: string) {
  return request<AdminSupportItem>(`/admin/support/${id}`);
}

export async function createAdminSupport(payload: {
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  status: AdminSupportStatus;
}) {
  return request<AdminSupportItem>(`/admin/support`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminSupport(
  id: string,
  payload: Partial<{
    name: string;
    designation: string;
    department: string;
    phone: string;
    email: string;
    status: AdminSupportStatus;
  }>,
) {
  return request<AdminSupportItem>(`/admin/support/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminSupport(id: string) {
  return request<{ message?: string }>(`/admin/support/${id}`, {
    method: "DELETE",
  });
}

export type AdminProjectItem = {
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
  ratingTypeName: string;
  hasConfig: boolean;
  createdAt: string;
};

export async function getAdminProjects(params?: {
  registrationStatus?: string;
  certificationStatus?: string;
}) {
  const query = new URLSearchParams();
  if (params?.registrationStatus) query.set("registrationStatus", params.registrationStatus);
  if (params?.certificationStatus) query.set("certificationStatus", params.certificationStatus);
  const qs = query.toString();
  return request<AdminProjectItem[]>(`/admin/projects${qs ? `?${qs}` : ""}`);
}

export async function getAdminProjectDetails(id: string) {
  return request<AdminProjectItem>(`/admin/projects/${id}`);
}

export async function approveAdminProjectRegistration(id: string) {
  return request<AdminProjectItem>(`/admin/projects/${id}/approve-registration`, {
    method: "POST",
  });
}

export async function rejectAdminProjectRegistration(id: string) {
  return request<AdminProjectItem>(`/admin/projects/${id}/reject-registration`, {
    method: "POST",
  });
}

export async function approveAdminProjectCertification(id: string) {
  return request<AdminProjectItem>(`/admin/projects/${id}/approve-certification`, {
    method: "POST",
  });
}
