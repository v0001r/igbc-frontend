const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

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

export type RegisterApExamPayload = {
  personalInformation: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
  };
  addressDetails: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  educationalDetails: {
    highestQualification: string;
    yearsOfExperience: number;
  };
  organizationDetails?: {
    organizationName?: string;
    designation?: string;
  };
  examSlotSelection: {
    examDate: string;
  };
};

export type ApExamRegistrationResponse = {
  registrationId: string;
  personalInformation?: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
  };
  addressDetails?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  educationalDetails?: {
    highestQualification: string;
    yearsOfExperience: number;
  };
  organizationDetails?: {
    organizationName?: string;
    designation?: string;
  };
  examSlotSelection?: {
    examDate: string;
    examTime: string;
    validUntil: string;
  };
  paymentStatus: "pending" | "success" | "failure";
  examId?: string;
};

export type PaymentUpdateResponse = {
  registrationId: string;
  examId?: string;
  paymentStatus: "success" | "failure";
  message: string;
  notifications: {
    email: "triggered" | "not_triggered";
    sms: "triggered" | "not_triggered";
  };
};

export type SelectableSlotsResponse = {
  year: number;
  month: number;
  selectableDates: string[];
  fixedTime: string;
  feeAmount: number;
};

export type UserExamListResponse = {
  email: string;
  exams: Array<{
    registrationId: string;
    examId?: string;
    examDate: string;
    examTime: string;
    validUntil: string;
    paymentStatus: "success";
    feeAmount: number;
    status: "upcoming" | "past";
    rescheduleCount: number;
    rescheduleFeeAmount?: number;
    actions: { reschedule: boolean };
  }>;
};

export type RescheduleApExamPayload = {
  type: "prepone" | "postpone";
  examDate: string;
  transactionId?: string;
};

export type RescheduleOptionsResponse = {
  registrationId: string;
  examId?: string;
  currentExamDate: string;
  type: "prepone" | "postpone";
  feeAmount: number;
  selectableDates: string[];
};

export async function registerApExam(payload: RegisterApExamPayload) {
  return request<ApExamRegistrationResponse>("/ap-exam/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateApExamRegistration(registrationId: string, payload: RegisterApExamPayload) {
  return request<ApExamRegistrationResponse>(`/ap-exam/${registrationId}/register`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getApExamRegistrationByEmail(email: string) {
  return request<ApExamRegistrationResponse>(
    `/ap-exam/by-email?email=${encodeURIComponent(email)}`,
    {
      method: "GET",
    },
  );
}

export async function getApExamReview(registrationId: string) {
  return request<unknown>(`/ap-exam/${registrationId}/review`, {
    method: "GET",
  });
}

export async function updateApExamPayment(
  registrationId: string,
  payload: { status: "success" | "failure"; transactionId?: string },
) {
  return request<PaymentUpdateResponse>(`/ap-exam/${registrationId}/payment`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSelectableApExamSlots(year: number, month: number) {
  return request<SelectableSlotsResponse>(`/ap-exam/slots/${year}/${month}`, {
    method: "GET",
  });
}

export async function getUserApExamList(email: string) {
  return request<UserExamListResponse>(`/ap-exam/list?email=${encodeURIComponent(email)}`, {
    method: "GET",
  });
}

export async function getApExamRescheduleOptions(
  registrationId: string,
  type: "prepone" | "postpone",
) {
  return request<RescheduleOptionsResponse>(
    `/ap-exam/${registrationId}/reschedule/options?type=${encodeURIComponent(type)}`,
    { method: "GET" },
  );
}

export async function rescheduleApExam(registrationId: string, payload: RescheduleApExamPayload) {
  return request<unknown>(`/ap-exam/${registrationId}/reschedule`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
