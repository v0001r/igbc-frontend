const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const LOCAL_EXAM_LISTINGS_KEY = "igbc_ap_exam_listings";

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

export type ApExamListing = {
  listingId: string;
  registrationId: string;
  examId: string;
  userEmail: string;
  userName: string;
  examDate: string;
  examTime: string;
  paymentStatus: "success";
  status: "registered" | "rescheduled";
  createdAt: string;
  updatedAt: string;
  rescheduleHistory?: Array<{
    fromDate: string;
    toDate: string;
    mode: "prepone" | "postpone";
    fee: number;
    changedAt: string;
  }>;
};

export type CreateApExamListingPayload = {
  registrationId: string;
  examId: string;
  userEmail: string;
  userName: string;
  examDate: string;
  examTime?: string;
};

export type RescheduleApExamPayload = {
  mode: "prepone" | "postpone";
  newExamDate: string;
  fee: number;
};

function readLocalListings(): ApExamListing[] {
  const raw = localStorage.getItem(LOCAL_EXAM_LISTINGS_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as ApExamListing[];
  } catch {
    return [];
  }
}

function writeLocalListings(listings: ApExamListing[]) {
  localStorage.setItem(LOCAL_EXAM_LISTINGS_KEY, JSON.stringify(listings));
}

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

export function cachePaidApExamListing(payload: CreateApExamListingPayload) {
  const now = new Date().toISOString();
  const fallbackListing: ApExamListing = {
    listingId: payload.examId || `listing_${Date.now()}`,
    registrationId: payload.registrationId,
    examId: payload.examId,
    userEmail: payload.userEmail,
    userName: payload.userName,
    examDate: payload.examDate,
    examTime: payload.examTime ?? "11:00 AM",
    paymentStatus: "success",
    status: "registered",
    createdAt: now,
    updatedAt: now,
    rescheduleHistory: [],
  };
  const existing = readLocalListings().filter((item) => item.examId !== payload.examId);
  writeLocalListings([fallbackListing, ...existing]);
  return fallbackListing;
}

export async function getMyApExamListings(userEmail: string) {
  try {
    const raw = await request<
      Array<{
        id?: string;
        examId?: string;
        registrationId?: string;
        email?: string;
        userEmail?: string;
        userName?: string;
        candidateName?: string;
        examDate?: string;
        examTime?: string;
        paymentStatus?: "success";
        status?: "registered" | "rescheduled";
        createdAt?: string;
        updatedAt?: string;
      }>
    >(`/ap-exam/user-exams?email=${encodeURIComponent(userEmail)}`, {
      method: "GET",
    });

    return raw.map((item) => ({
      listingId: item.id ?? item.examId ?? `listing_${Date.now()}`,
      registrationId: item.registrationId ?? "",
      examId: item.examId ?? item.id ?? "",
      userEmail: item.userEmail ?? item.email ?? userEmail,
      userName: item.userName ?? item.candidateName ?? "Candidate",
      examDate: item.examDate ?? new Date().toISOString().split("T")[0],
      examTime: item.examTime ?? "11:00 AM",
      paymentStatus: item.paymentStatus ?? "success",
      status: item.status ?? "registered",
      createdAt: item.createdAt ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? new Date().toISOString(),
      rescheduleHistory: [],
    }));
  } catch {
    return readLocalListings()
      .filter((item) => item.userEmail.toLowerCase() === userEmail.toLowerCase())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function rescheduleApExamListing(
  listingId: string,
  payload: RescheduleApExamPayload,
) {
  try {
    const raw = await request<{
      id?: string;
      examId?: string;
      registrationId?: string;
      email?: string;
      userEmail?: string;
      userName?: string;
      candidateName?: string;
      examDate?: string;
      examTime?: string;
      paymentStatus?: "success";
      status?: "registered" | "rescheduled";
      createdAt?: string;
      updatedAt?: string;
    }>(`/ap-exam/${listingId}/reschedule`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return {
      listingId: raw.id ?? raw.examId ?? listingId,
      registrationId: raw.registrationId ?? "",
      examId: raw.examId ?? raw.id ?? listingId,
      userEmail: raw.userEmail ?? raw.email ?? "",
      userName: raw.userName ?? raw.candidateName ?? "Candidate",
      examDate: raw.examDate ?? payload.newExamDate,
      examTime: raw.examTime ?? "11:00 AM",
      paymentStatus: raw.paymentStatus ?? "success",
      status: raw.status ?? "rescheduled",
      createdAt: raw.createdAt ?? new Date().toISOString(),
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
      rescheduleHistory: [
        {
          fromDate: "",
          toDate: payload.newExamDate,
          mode: payload.mode,
          fee: payload.fee,
          changedAt: new Date().toISOString(),
        },
      ],
    };
  } catch {
    const all = readLocalListings();
    const listing = all.find((item) => item.listingId === listingId);
    if (!listing) {
      throw new Error("Exam listing not found");
    }
    const updated: ApExamListing = {
      ...listing,
      examDate: payload.newExamDate,
      status: "rescheduled",
      updatedAt: new Date().toISOString(),
      rescheduleHistory: [
        ...(listing.rescheduleHistory ?? []),
        {
          fromDate: listing.examDate,
          toDate: payload.newExamDate,
          mode: payload.mode,
          fee: payload.fee,
          changedAt: new Date().toISOString(),
        },
      ],
    };
    writeLocalListings(all.map((item) => (item.listingId === listingId ? updated : item)));
    return updated;
  }
}
