import { getAccessToken } from "@/lib/auth";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import type { GreenHomesRuntimeConfig } from "@/lib/greenHomesConfig";
import type { AnnexureBladeRoute } from "@/lib/annexureRegistry";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { FieldRuleSet } from "@/lib/fieldRules";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type CertificationWorkspaceResponse = {
  projectId: string;
  projectCode: string;
  projectName: string;
  projectLabel: string;
  ratingTypeId: number;
  ratingTypeName: string;
  ratingKey: string;
  ratingLabel: string;
  versionType: string;
  config: GreenHomesRuntimeConfig;
  form: CertificationFormResponse;
  annexureRoutes: AnnexureBladeRoute[];
  fieldRules: Record<string, FieldRuleSet>;
  annexureSchemas?: Record<string, AnnexureSchemaDefinition>;
};

export async function fetchCertificationWorkspace(
  projectId: string,
): Promise<CertificationWorkspaceResponse> {
  const headers = new Headers();
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}/projects/${projectId}/certification-workspace`, {
    headers,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(message ?? "Failed to load certification workspace");
  }

  return (await response.json()) as CertificationWorkspaceResponse;
}
