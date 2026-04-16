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

  return (await response.json()) as T;
}

export type MembershipMasterItem = {
  id: number;
  code?: string;
  name: string;
  isActive?: boolean;
};

export type MembershipPlan = MembershipMasterItem & {
  membershipTypeId?: number;
  membershipCategoryId?: number;
  fee?: number;
  amount?: number;
  gstPercent?: number;
};

export type MembershipMastersResponse = {
  membershipTypes: MembershipMasterItem[];
  membershipCategories: MembershipMasterItem[];
  membershipPlans: MembershipPlan[];
};

export type MembershipApplication = {
  id: string;
  applicationId?: string;
  membershipTypeId?: number;
  membershipCategoryId?: number;
  membershipPlanId?: number;
  status?: string;
  invoiceNumber?: string;
  membershipFee?: number;
  totalFee?: number;
  total_fee?: number;
  fee?: number;
  amount?: number;
  gstAmount?: number;
  totalPayable?: number;
  amounts?: {
    membershipFee?: number;
    gst?: number;
    total?: number;
  };
  details?: {
    amount?: number;
  };
};

export type MembershipContactPayload = {
  showInDirectory: boolean;
  salutation: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  organization: string;
  designation: string;
  department: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  mobile: string;
  telephone: string;
  email: string;
  pan: string;
  gst: string;
};

export type MembershipInvoicePayload = {
  organization: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  isSez: boolean;
  advanceTaxInvoice: boolean;
};

export type MembershipPaymentPayload = {
  paymentMode: "online" | "offline";
  gateway: string;
  status: "success" | "failure";
  transactionId: string;
  paymentMethod: string;
  ddChequeUtrNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
  amount: number;
  paymentDate: string;
  remarks?: string;
};

export async function getMembershipMasters() {
  return request<MembershipMastersResponse>("/membership/applications/masters", {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function createMembershipApplication(payload: {
  userId?: string;
  membershipTypeId: number;
  membershipCategoryId: number;
  membershipPlanId?: number;
}) {
  return request<MembershipApplication>("/membership/applications", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateMembershipDetails(
  applicationId: string,
  payload: {
    userId?: string;
    membershipTypeId: number;
    membershipCategoryId: number;
    membershipPlanId?: number;
  },
) {
  return request<MembershipApplication>(`/membership/applications/${applicationId}/details`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateMembershipContact(
  applicationId: string,
  payload: MembershipContactPayload,
) {
  return request<MembershipApplication>(`/membership/applications/${applicationId}/contact`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getMembershipReview(applicationId: string) {
  return request<unknown>(`/membership/applications/${applicationId}/review`, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function updateMembershipInvoice(
  applicationId: string,
  payload: MembershipInvoicePayload,
) {
  return request<MembershipApplication>(`/membership/applications/${applicationId}/invoice`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function generateMembershipProforma(applicationId: string) {
  return request<MembershipApplication>(`/membership/applications/${applicationId}/invoice/proforma`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function updateMembershipPayment(
  applicationId: string,
  payload: MembershipPaymentPayload,
) {
  return request<MembershipApplication>(`/membership/applications/${applicationId}/payment`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getMembershipApplicationById(applicationId: string) {
  return request<MembershipApplication>(`/membership/applications/${applicationId}`, {
    method: "GET",
    headers: authHeaders(),
  });
}
