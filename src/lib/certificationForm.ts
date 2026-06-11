import { getAccessToken } from "@/lib/auth";
import type { GreenHomesFieldDef } from "@/lib/greenHomesConfig";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type RatingDocumentDto = {
  id: string;
  tab: string;
  subtab: string;
  paramName: string;
  fileName: string;
  filePath: string;
  fileType: string | null;
  updatedAt?: string;
};

export type RatingDataRowDto = {
  id: string;
  tab: string;
  subtab: string;
  paramName: string;
  value: string | null;
  updatedAt?: string;
};

export type CertificationFormResponse = {
  projectId: string;
  ratingType: string;
  versionType: string;
  currentTab: string | null;
  currentSubtab: string | null;
  data: RatingDataRowDto[];
  documents: RatingDocumentDto[];
};

export type CertificationFieldPayload = {
  paramName: string;
  type: string;
  value?: string;
};

export const FILE_FIELD_TYPES = new Set(["u", "M"]);

export function isFileFieldType(type: string | undefined): boolean {
  return FILE_FIELD_TYPES.has(type ?? "");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
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

export async function fetchCertificationForm(projectId: string): Promise<CertificationFormResponse> {
  return request<CertificationFormResponse>(`/projects/${projectId}/certification-form`);
}

export async function saveCertificationSection(
  projectId: string,
  payload: {
    tab: string;
    subtab: string;
    currentTab?: string;
    currentSubtab?: string;
    fields: CertificationFieldPayload[];
  }
): Promise<CertificationFormResponse> {
  return request<CertificationFormResponse>(`/projects/${projectId}/certification-form`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function uploadCertificationDocuments(
  projectId: string,
  payload: {
    tab: string;
    subtab: string;
    paramName: string;
    files: File[];
    replaceExisting?: boolean;
  }
): Promise<CertificationFormResponse> {
  const form = new FormData();
  form.append("tab", payload.tab);
  form.append("subtab", payload.subtab);
  form.append("paramName", payload.paramName);
  form.append("replaceExisting", payload.replaceExisting === false ? "false" : "true");
  for (const file of payload.files) {
    form.append("files", file);
  }
  return request<CertificationFormResponse>(`/projects/${projectId}/certification-form/upload`, {
    method: "POST",
    body: form,
  });
}

/** Build field values for the current tab/subtab from normalized API rows. */
export function sectionFieldValues(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  fields: GreenHomesFieldDef[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of fields) {
    const name = field.name ?? "";
    if (!name) continue;
    if (isFileFieldType(field.type)) {
      const docs = form.documents.filter(
        (d) => d.tab === tab && d.subtab === subtab && d.paramName === name
      );
      out[name] = docs.map((d) => d.fileName).join(", ");
    } else {
      const row = form.data.find(
        (d) => d.tab === tab && d.subtab === subtab && d.paramName === name
      );
      out[name] = row?.value ?? "";
    }
  }
  return out;
}

/** Map dynamic config fields → API save payload (skips file types; those use upload). */
export function buildNonFileSaveFields(
  fields: GreenHomesFieldDef[],
  values: Record<string, string>
): CertificationFieldPayload[] {
  return fields
    .filter((f) => f.name && f.type !== "hr" && !isFileFieldType(f.type))
    .map((f) => ({
      paramName: f.name!,
      type: f.type ?? "t",
      value: values[f.name!] ?? "",
    }));
}
