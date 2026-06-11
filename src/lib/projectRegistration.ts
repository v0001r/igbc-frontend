import { getAccessToken } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export type ProjectRegistrationFeeMasters = {
  compatibilityMap?: Record<string, string[]>;
  feesByRatingSystem?: Record<
    string,
    {
      registrationFee?: number;
      fee?: number;
      gstPercent?: number;
      projectTypeFees?: Record<string, number>;
      compatibleConstructionTypes?: string[];
    }
  >;
  couponCodes?: Array<{
    code: string;
    type?: "flat" | "percentage";
    value?: number;
    expiresAt?: string;
    usageLimit?: number;
  }>;
  [key: string]: unknown;
};

export type ProjectRegistrationMasterItem = {
  id: number | string;
  name: string;
  code?: string;
  description?: string;
};

export type ProjectCategoryResponse = {
  categories: ProjectRegistrationMasterItem[];
};

export type ProjectCategoryRatingSystem = {
  id: number;
  categoryId: number;
  ratingName: string;
  shortRatingName?: string;
  type?: string[];
  specifics?: string[];
  configKey?: string | null;
  versionTypes?: string[];
  defaultVersion?: string | null;
  hasCertificationConfig?: boolean;
  fees?: {
    annual?: number;
    founding?: number;
    nonMember?: number;
  };
};

export type ProjectCategoryRatingSystemsResponse = {
  categoryId: number;
  categoryName?: string;
  ratingSystems: ProjectCategoryRatingSystem[];
};

export type ProjectRegistrationMastersResponse = {
  categories?: ProjectRegistrationMasterItem[];
  projectCategories?: ProjectRegistrationMasterItem[];
  ratingSystems?: ProjectRegistrationMasterItem[];
  [key: string]: unknown;
};

export type ProjectMasterMembershipTier = "annual" | "founding" | "non_member";

export type ProjectMasterRatingOption = {
  label?: string;
  type?: string;
  specifics?: string;
  price?: number;
};

export type ProjectMasterRatingSystem = {
  id?: number | string;
  name?: string;
  rating?: string;
  options?: ProjectMasterRatingOption[];
  variations?: ProjectMasterRatingOption[];
};

export type ProjectMasterProjectTypeHint = {
  placeholder?: string;
  examples?: string[];
};

export type ProjectMastersApiResponse = {
  categories?: ProjectRegistrationMasterItem[];
  selectedCategoryId?: number;
  membershipTier?: ProjectMasterMembershipTier;
  projectType?: ProjectMasterProjectTypeHint;
  ratingSystems?: Array<ProjectMasterRatingSystem | string>;
  groupedRatingSystems?: Record<string, ProjectMasterRatingOption[]>;
  [key: string]: unknown;
};

export type ProjectRegistrationRecord = {
  id: string;
  temporaryProjectId?: string;
  status?: string;
  paymentStatus?: string;
  invoiceBreakdown?: {
    registrationFee?: number;
    gstAmount?: number;
    totalPayable?: number;
  };
  [key: string]: unknown;
};

export type ProjectStepOnePayload = {
  projectId?: number;
  temporaryProjectId?: string;
  category: number;
  ratingSystem: string;
  ratingTypeId?: number;
  subRatingType?: string;
  projectType: string;
  constructionType: string;
};

export type ProjectStepOneResponse = {
  id: number;
  temporaryProjectId?: string;
  createdByUserId?: string;
  status?: string;
  stepOne?: ProjectStepOnePayload;
  createdAt?: string;
};

export type ProjectStepTwoPayload = {
  projectName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  siteAreaSqm: number;
  siteAreaSqft: number;
  numberOfBuildings: number;
  totalBuiltUpAreaSqm: number;
  totalBuiltUpAreaSqft: number;
  constructionStartDate?: string;
  targetCertificationDate?: string;
};

export type ProjectResumeStepOne = {
  category?: number;
  ratingSystem?: string;
  subRatingType?: string;
  projectType?: string;
  constructionType?: string;
};

export type ProjectResumeStepTwo = {
  projectName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  siteAreaSqm?: number;
  siteAreaSqft?: number;
  numberOfBuildings?: number;
  totalBuiltUpAreaSqm?: number;
  totalBuiltUpAreaSqft?: number;
  constructionStartDate?: string;
  targetCertificationDate?: string;
};

export type ProjectResumeStepThree = {
  formData?: Record<string, unknown>;
};

export type ProjectResumeStepFour = {
  organizationName?: string;
  organizationAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  panNumber?: string;
  hasGst?: boolean;
  gstNumber?: string;
  sezSelected?: boolean;
  tdsSelected?: boolean;
  couponCode?: string;
  registrationFee?: number;
  gstAmount?: number;
  tdsAmount?: number;
  totalPayable?: number;
};

export type ProjectResumeStepFive = {
  paymentMethod?: "online" | "offline";
  gatewayResponse?: Record<string, unknown>;
  paymentType?: string;
  transactionReference?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
  amount?: number;
  paymentDate?: string;
  remarks?: string;
};

export type ProjectCertificationApplicationSummary = {
  id: number;
  status: string;
  paymentStatus: string;
  paymentRemarks?: string | null;
  currentStep?: number;
  certificationType?: number | null;
  certificationTypeLabel?: string | null;
  certificationFee?: number;
  finalPayableAmount?: number;
  paymentMethod?: "online" | "offline" | null;
  paymentType?: string | null;
  transactionReference?: string | null;
  ifscCode?: string | null;
  bankName?: string | null;
  branch?: string | null;
  paymentAmount?: number | null;
  paymentDate?: string | null;
  organizationName?: string | null;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  siteAreaSqm?: number;
  siteAreaSqft?: number;
  numberOfBuildings?: number;
  totalBuiltUpAreaSqm?: number;
  totalBuiltUpAreaSqft?: number;
};

export type ProjectFullDetailsResponse = {
  projectId: number;
  igbcProjectId?: string | number;
  igbcprojectid?: string | number;
  temporaryProjectId?: string;
  status?: string;
  paymentStatus?: string;
  currentStep?: number;
  registrationFee?: number;
  finalPayableAmount?: number;
  rejectRemark?: string | null;
  certificateAppliedStatus?: string | boolean;
  categoryName?: string | null;
  certificationApplication?: ProjectCertificationApplicationSummary | null;
  canReapplyCertification?: boolean;
  isCertificationWorkspaceReady?: boolean;
  stepOne?: Record<string, unknown> | null;
  stepTwo?: Record<string, unknown> | null;
  stepThree?: Record<string, unknown> | null;
  stepFour?: Record<string, unknown> | null;
  stepFive?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectResumeResponse = {
  projectId?: number;
  stepOne?: ProjectResumeStepOne | null;
  stepTwo?: ProjectResumeStepTwo | null;
  stepThree?: ProjectResumeStepThree | null;
  stepFour?: ProjectResumeStepFour | null;
  stepFive?: ProjectResumeStepFive | null;
  completedSteps?: number;
  totalSteps?: number;
  nextStep?: number | null;
  message?: string;
};

export type CertificationApplicationStepOnePrefillResponse = {
  projectId: number;
  igbcProjectId?: string | number;
  temporaryProjectId?: string;
  certificationApplicationStatus?: string | boolean;
  certificationApplicationId?: number | null;
  certificationStatus?: string | null;
  certificationPaymentStatus?: string | null;
  certificationRejectRemark?: string | null;
  certificationCurrentStep?: number | null;
  certificationType?: number | null;
  canReapplyCertification?: boolean;
  isCertificationWorkspaceReady?: boolean;
  status?: string;
  paymentStatus?: string;
  category?: number | string;
  ratingSystem?: string;
  subRatingType?: string;
  projectType?: string;
  constructionType?: string;
  projectName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  siteAreaSqm?: number;
  siteAreaSqft?: number;
  numberOfBuildings?: number;
  totalBuiltUpAreaSqft?: number;
  totalBuiltUpAreaSqm?: number;
  constructionStartDate?: string;
  targetCertificationDate?: string;
};

export type CertificationApplicationStepOneCreateResponse = {
  id?: number | string;
  projectId?: number;
  status?: string;
  currentStep?: number;
  stepOne?: {
    certificationType?: number;
    expediteReview?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type CertificationApplicationStepTwoPrefillResponse = {
  projectId?: number;
  organizationName?: string;
  organizationAddress?: string;
  organizationCity?: string;
  organizationState?: string;
  organizationPinCode?: string;
  panNumber?: string;
  hasGstNumber?: boolean;
  gstNumber?: string;
  sezSelected?: boolean;
  tdsSelected?: boolean;
  couponCode?: string;
  gstRate?: number;
  gstAmount?: number;
  tdsRate?: number;
  tdsAmount?: number;
  finalPayableAmount?: number;
  invoiceAdditionalData?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CertificationApplicationStepTwoPayload = {
  organizationName: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  panNumber: string;
  hasGstNumber: boolean;
  gstNumber?: string;
  sezSelected: boolean;
  tdsSelected: boolean;
  couponCode?: string;
  additionalData?: Record<string, unknown>;
};

export type CertificationApplicationStepThreePaymentPayload = {
  paymentMethod: "online" | "offline";
  gatewayResponse?: Record<string, unknown>;
  paymentType?: string;
  transactionReference?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
  amount: number;
  paymentDate: string;
  remarks?: string;
};

export type MyProjectListTab = "saved" | "submitted" | "approved" | "rejected";

export type MyProjectListItem = {
  id: number;
  igbcProjectId?: string | number;
  igbcprojectid?: string | number;
  certificateAppliedStatus?: string | boolean;
  temporaryProjectId?: string;
  status?: string;
  paymentStatus?: string;
  currentStep?: number;
  categoryId?: number;
  ratingSystem?: string;
  subRatingType?: string;
  projectType?: string;
  constructionType?: string;
  projectName?: string;
  city?: string;
  state?: string;
  rejectRemark?: string | null;
  certificationApplicationId?: number | null;
  certificationStatus?: string | null;
  certificationPaymentStatus?: string | null;
  certificationRejectRemark?: string | null;
  canReapplyCertification?: boolean;
  isCertificationWorkspaceReady?: boolean;
  rejectionType?: "certification" | "registration" | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MyProjectListResponse = {
  counts: {
    saved: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
  tab?: MyProjectListTab;
  total: number;
  items: MyProjectListItem[];
};

export type AdminProjectListTab = "saved" | "submitted" | "approved" | "rejected";

export type AdminProjectListItem = {
  id: number;
  projectId?: number;
  igbcProjectId?: string | number;
  igbcprojectid?: string | number;
  temporaryProjectId?: string;
  status?: string;
  paymentStatus?: string;
  currentStep?: number;
  ratingSystem?: string;
  subRatingType?: string;
  projectType?: string;
  constructionType?: string;
  projectName?: string;
  city?: string;
  state?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerMobile?: string;
  organisation?: string;
  paymentMethod?: string;
  registrationFee?: number;
  finalPayableAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminProjectListResponse = {
  counts: {
    saved: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
  tab?: AdminProjectListTab;
  total: number;
  items: AdminProjectListItem[];
};

export type ProjectRegistrationDetailsPayload = {
  categoryId?: number;
  category: string;
  constructionType: string;
  ratingSystem: string;
  projectType: string;
  projectName: string;
  siteAddress: string;
  city: string;
  state: string;
  pincode: string;
  siteAreaSqm?: number;
  siteAreaSqft?: number;
  numberOfBuildings: number;
  totalBuiltUpArea: number;
  timelineStartDate?: string;
  timelineCompletionDate?: string;
  userId?: string;
};

export type ProjectStepThreePayload = {
  formData: Record<string, unknown>;
};

export type ProjectRegistrationInvoicePayload = {
  organizationName: string;
  organizationAddress: string;
  city: string;
  state: string;
  pincode: string;
  panNumber: string;
  hasGst: boolean;
  gstNumber?: string;
  sezSelected: boolean;
  tdsSelected: boolean;
  registrationFee: number;
  couponCode?: string;
};

export type ProjectRegistrationPaymentPayload = {
  paymentMethod: "online" | "offline";
  gatewayResponse?: Record<string, unknown>;
  paymentType?: string;
  transactionReference?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
  amount: number;
  paymentDate: string;
  remarks?: string;
};

const BASE = "/project-registrations";
const PROJECT_MASTERS_BASE = "/project-masters";

export async function getProjectRegistrationFeeMasters() {
  return request<ProjectRegistrationFeeMasters>(`${BASE}/masters/fees`, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getProjectCategories() {
  return request<ProjectCategoryResponse>("/project-category", {
    method: "GET",
    headers: { Accept: "application/json" },
  });
}

export async function getProjectCategoryRatingSystems(categoryId: number) {
  return request<ProjectCategoryRatingSystemsResponse>(`/project-category/${categoryId}/rating-systems`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
}

export async function getProjectRegistrationMasters(categoryId?: number) {
  const query = new URLSearchParams();
  if (typeof categoryId === "number" && Number.isFinite(categoryId)) {
    query.set("categoryId", String(categoryId));
  }
  const queryString = query.toString();
  const path = queryString ? `${BASE}/masters?${queryString}` : `${BASE}/masters`;
  return request<ProjectRegistrationMastersResponse>(path, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getProjectMasters(params?: {
  categoryId?: number;
  membershipTier?: ProjectMasterMembershipTier;
}) {
  const query = new URLSearchParams();
  if (typeof params?.categoryId === "number" && Number.isFinite(params.categoryId)) {
    query.set("categoryId", String(params.categoryId));
  }
  if (params?.membershipTier) {
    query.set("membershipTier", params.membershipTier);
  }
  const queryString = query.toString();
  const path = queryString ? `${PROJECT_MASTERS_BASE}?${queryString}` : PROJECT_MASTERS_BASE;
  return request<ProjectMastersApiResponse>(path, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getProjectMastersByCategory(
  categoryId: number,
  membershipTier?: ProjectMasterMembershipTier,
) {
  const query = new URLSearchParams();
  if (membershipTier) {
    query.set("membershipTier", membershipTier);
  }
  const queryString = query.toString();
  const path = queryString
    ? `${PROJECT_MASTERS_BASE}/category/${categoryId}?${queryString}`
    : `${PROJECT_MASTERS_BASE}/category/${categoryId}`;
  return request<ProjectMastersApiResponse>(path, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function createProjectRegistration(payload: {
  userId?: string;
  categoryId?: number;
  category: string;
  constructionType: string;
  ratingSystem: string;
  projectType: string;
}) {
  return request<ProjectRegistrationRecord>(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function createProjectStepOne(payload: ProjectStepOnePayload) {
  return request<ProjectStepOneResponse>("/projects", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateProjectStepTwoDetails(projectId: string, payload: ProjectStepTwoPayload) {
  return request<ProjectRegistrationRecord>(`/projects/${projectId}/details`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getMyProjectsList(tab?: MyProjectListTab) {
  const query = new URLSearchParams();
  if (tab) {
    query.set("tab", tab);
  }
  const queryString = query.toString();
  const path = queryString ? `/projects/my/list?${queryString}` : "/projects/my/list";
  return request<MyProjectListResponse>(path, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getProjectResume(projectId: number | string) {
  return request<ProjectResumeResponse>(`/projects/${projectId}/resume`, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getProjectFullDetails(projectId: number | string) {
  return request<ProjectFullDetailsResponse>(`/projects/${projectId}/full-details`, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getCertificationApplicationStepOnePrefill(projectId: number | string) {
  return request<CertificationApplicationStepOnePrefillResponse>(
    `/projects/${projectId}/certification-application/step-one`,
    {
      method: "GET",
      headers: authHeaders(),
    },
  );
}

export async function createCertificationApplicationStepOne(payload: {
  projectId: number | string;
  certificationType?: number;
  expediteReview?: boolean;
}) {
  return request<CertificationApplicationStepOneCreateResponse>(
    "/certification-application/step-one",
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        projectId: Number(payload.projectId),
        certificationType: payload.certificationType,
        expediteReview: payload.expediteReview,
      }),
    },
  );
}

export async function getCertificationApplicationStepTwoPrefill(projectId: number | string) {
  return request<CertificationApplicationStepTwoPrefillResponse>(
    `/certification-application/${projectId}/step-two/prefill`,
    {
      method: "GET",
      headers: authHeaders(),
    },
  );
}

export async function updateCertificationApplicationStepTwo(
  projectId: number | string,
  payload: CertificationApplicationStepTwoPayload,
) {
  return request<CertificationApplicationStepTwoPrefillResponse>(
    `/certification-application/${projectId}/step-two`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );
}

export async function updateCertificationApplicationStepThreePayment(
  projectId: number | string,
  payload: CertificationApplicationStepThreePaymentPayload,
) {
  return request<CertificationApplicationStepTwoPrefillResponse>(
    `/certification-application/${projectId}/step-three/payment`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );
}

export async function getAdminProjectsList(tab?: AdminProjectListTab) {
  const query = new URLSearchParams();
  if (tab) {
    query.set("tab", tab);
  }
  const queryString = query.toString();
  const path = queryString ? `/projects/admin/list?${queryString}` : "/projects/admin/list";
  return request<AdminProjectListResponse>(path, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getAdminProjectView(projectId: number | string) {
  return request<ProjectFullDetailsResponse>(`/projects/admin/${projectId}/view`, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function updateProjectRegistrationDetails(registrationId: string, payload: ProjectRegistrationDetailsPayload) {
  return request<ProjectRegistrationRecord>(`${BASE}/${registrationId}/details`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateProjectStepThreeContacts(projectId: string, payload: ProjectStepThreePayload) {
  return request<ProjectRegistrationRecord>(`/projects/${projectId}/contacts`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateProjectRegistrationInvoice(registrationId: string, payload: ProjectRegistrationInvoicePayload) {
  return request<ProjectRegistrationRecord>(`/projects/${registrationId}/invoice`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateProjectRegistrationPayment(registrationId: string, payload: ProjectRegistrationPaymentPayload) {
  return request<ProjectRegistrationRecord>(`/projects/${registrationId}/payment`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function submitProjectRegistration(registrationId: string) {
  return request<ProjectRegistrationRecord>(`${BASE}/${registrationId}/submit`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function approveProjectRegistration(registrationId: string) {
  return request<ProjectRegistrationRecord>(`/projects/admin/${registrationId}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
}

export async function rejectProjectRegistration(projectId: string, remark: string) {
  return request<ProjectRegistrationRecord>(`/projects/admin/${projectId}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ remark }),
  });
}

export async function getProjectRegistrationById(registrationId: string) {
  return request<ProjectRegistrationRecord>(`${BASE}/${registrationId}`, {
    method: "GET",
    headers: authHeaders(),
  });
}
