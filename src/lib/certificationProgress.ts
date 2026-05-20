import type { CertificationFormResponse } from "@/lib/certificationForm";
import { isFileFieldType } from "@/lib/certificationForm";
import {
  getFieldsForTabSubtab,
  type GreenHomesRuntimeConfig,
  type GreenHomesSubtab,
} from "@/lib/greenHomesConfig";
import { fieldIsRequiredWhenVisible, isFieldVisible } from "@/lib/fieldVisibility";

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

function sectionValuesFromForm(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  fields: { name?: string; type?: string }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const name = f.name ?? "";
    if (!name) continue;
    if (isFileFieldType(f.type)) {
      const docs = form.documents.filter(
        (d) => d.tab === tab && d.subtab === subtab && d.paramName === name,
      );
      out[name] = docs.map((d) => d.fileName).join(", ");
    } else {
      const row = form.data.find(
        (d) => d.tab === tab && d.subtab === subtab && d.paramName === name,
      );
      out[name] = row?.value ?? "";
    }
  }
  return out;
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

  const values = sectionValuesFromForm(form, tab, subtab.sub_slug, fields);
  const visible = fields.filter((f) => isFieldVisible(f, values));
  if (visible.length === 0) return null;

  const required = visible.filter((f) => fieldIsRequiredWhenVisible(f, values));
  const tracked = required.length > 0 ? required : visible;
  let filled = 0;
  for (const f of tracked) {
    if (fieldHasValue(form, tab, subtab.sub_slug, f.name!, f.type)) filled += 1;
  }
  return Math.round((filled / tracked.length) * 100);
}
