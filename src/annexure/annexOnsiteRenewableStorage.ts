import {
  computeOnsiteRenewableState,
  emptyOnsiteRenewableRow,
  type OnsiteRenewableRow,
  type OnsiteRenewableState,
} from "@/annexure/annexOnsiteRenewableCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ROW_PARAMS = [
  "month_year",
  "energy_consumption",
  "on_site_renewable",
  "off_site_renewable",
] as const;

const SUMMARY_PARAMS = [
  "total_energy_consumption",
  "total_onsite_renewable",
  "total_offsite_renewable",
  "percentage_energy_consumption",
  "percentage_energy_consumption_offsite",
  "percentage_offsite_onsite",
  "saving_reneweable_energy",
] as const;

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map((x) => (x == null ? "" : String(x))) : [];
  } catch {
    return [];
  }
}

function parseScalar(raw: string | undefined, fallback = ""): string {
  if (!raw?.trim()) return fallback;
  try {
    const v = JSON.parse(raw) as unknown;
    if (Array.isArray(v)) return v[0] != null ? String(v[0]) : fallback;
  } catch {
    return raw;
  }
  return raw;
}

function hydrateRows(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  minRows: number,
): OnsiteRenewableRow[] {
  const saved: Record<(typeof ROW_PARAMS)[number], string[]> = {} as Record<
    (typeof ROW_PARAMS)[number],
    string[]
  >;
  for (const p of ROW_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const savedLen = Math.max(...ROW_PARAMS.map((p) => saved[p].length), 0);
  const targetLen = Math.max(savedLen, minRows);
  const rows: OnsiteRenewableRow[] = [];

  for (let i = 0; i < targetLen; i++) {
    rows.push({
      rowId: i + 1,
      month_year: saved.month_year[i] ?? "",
      energy_consumption: saved.energy_consumption[i] ?? "",
      on_site_renewable: saved.on_site_renewable[i] ?? "",
      off_site_renewable: saved.off_site_renewable[i] ?? "",
    });
  }

  return rows;
}

export function hydrateOnsiteRenewableAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): OnsiteRenewableState {
  const minRows = schema.onsiteRenewableLayout?.minRows ?? 5;
  const rows = hydrateRows(form, tab, subtab, minRows);

  const draft: OnsiteRenewableState = {
    rows,
    total_energy_consumption: parseScalar(getParam(form, tab, subtab, "total_energy_consumption")),
    total_onsite_renewable: parseScalar(getParam(form, tab, subtab, "total_onsite_renewable")),
    total_offsite_renewable: parseScalar(getParam(form, tab, subtab, "total_offsite_renewable")),
    percentage_energy_consumption: parseScalar(
      getParam(form, tab, subtab, "percentage_energy_consumption"),
    ),
    percentage_energy_consumption_offsite: parseScalar(
      getParam(form, tab, subtab, "percentage_energy_consumption_offsite"),
    ),
    percentage_offsite_onsite: parseScalar(getParam(form, tab, subtab, "percentage_offsite_onsite")),
    saving_reneweable_energy: parseScalar(getParam(form, tab, subtab, "saving_reneweable_energy")),
  };

  return computeOnsiteRenewableState(draft);
}

export function buildSavePayloadFromOnsiteRenewable(state: OnsiteRenewableState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const p of ROW_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(
        state.rows.map((r) => (r as unknown as Record<string, string>)[p] ?? ""),
      ),
    });
  }

  for (const p of SUMMARY_PARAMS) {
    const val = state[p as keyof OnsiteRenewableState] as string;
    fields.push({ paramName: p, type: "t", value: JSON.stringify([val]) });
  }

  return fields;
}

export { emptyOnsiteRenewableRow };
