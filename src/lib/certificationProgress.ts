import type { CertificationFormResponse } from "@/lib/certificationForm";
import { isFileFieldType } from "@/lib/certificationForm";
import {
  fieldIsRequired,
  getFieldsForTabSubtab,
  type GreenHomesRuntimeConfig,
  type GreenHomesSubtab,
} from "@/lib/greenHomesConfig";

function fieldHasValue(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  paramName: string,
  type: string | undefined,
): boolean {
  if (isFileFieldType(type)) {
    return form.documents.some(
      (d) => d.tab === tab && d.subtab === subtab && d.paramName === paramName,
    );
  }
  const row = form.data.find(
    (d) => d.tab === tab && d.subtab === subtab && d.paramName === paramName,
  );
  return Boolean((row?.value ?? "").trim());
}

/** Subtab completion % from config fields vs saved rows (Laravel checklist approximation). */
export function subtabCompletionPercent(
  config: GreenHomesRuntimeConfig,
  form: CertificationFormResponse,
  tab: string,
  subtab: GreenHomesSubtab,
): number | null {
  const fields = getFieldsForTabSubtab(config, tab, subtab.sub_slug).filter(
    (f) => f.name && f.type !== "hr",
  );
  if (fields.length === 0) return null;

  const required = fields.filter((f) => fieldIsRequired(f));
  const tracked = required.length > 0 ? required : fields;
  let filled = 0;
  for (const f of tracked) {
    if (fieldHasValue(form, tab, subtab.sub_slug, f.name!, f.type)) filled += 1;
  }
  return Math.round((filled / tracked.length) * 100);
}
