import type { CertificationFieldPayload } from "@/lib/certificationForm";

export type AnnexureRendererHandle = {
  getSaveFields: () => CertificationFieldPayload[];
};
