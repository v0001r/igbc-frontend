import {
  computeOccupantWellbeingState,
  emptyOccupantWellbeingRow,
  type OccupantWellbeingState,
} from "@/annexure/annexOccupantWellbeingCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ROW_PARAMS = [
  "wellbeign_facilities_provide",
  "wellbeing_served",
  "wellbeing_facility",
  "wellbeing_total",
] as const;

const SUMMARY_PARAMS = [
  "total_occupant_access",
  "total_permanent_occupancy",
  "total_recreational",
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
    return String(v);
  } catch {
    return raw;
  }
}

export type OccupantWellbeingHydrateContext = {
  permanentOccupancy?: string;
};

export function hydrateOccupantWellbeingAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  ctx: OccupantWellbeingHydrateContext = {},
): OccupantWellbeingState {
  const minRows = schema.occupantWellbeingLayout?.minRows ?? 5;
  const globalKey =
    schema.occupantWellbeingLayout?.permanentOccupancyGlobalKey ??
    "projects_details_permanent_occupancy";

  const saved: Record<(typeof ROW_PARAMS)[number], string[]> = {} as Record<
    (typeof ROW_PARAMS)[number],
    string[]
  >;
  for (const p of ROW_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const savedLen = Math.max(...ROW_PARAMS.map((p) => saved[p].length), 0);
  const targetLen = Math.max(savedLen, minRows);
  const rows = [];
  for (let i = 0; i < targetLen; i++) {
    const pick = (p: (typeof ROW_PARAMS)[number]) => saved[p][i] ?? "";
    rows.push({
      rowId: i + 1,
      wellbeign_facilities_provide: pick("wellbeign_facilities_provide"),
      wellbeing_served: pick("wellbeing_served"),
      wellbeing_facility: pick("wellbeing_facility"),
      wellbeing_total: pick("wellbeing_total") || "0.00",
    });
  }
  if (!rows.length) {
    for (let i = 0; i < minRows; i++) rows.push(emptyOccupantWellbeingRow(i + 1));
  }

  const permanentFromSaved = parseScalar(getParam(form, tab, subtab, "total_permanent_occupancy"));
  const permanent =
    ctx.permanentOccupancy?.trim() ||
    permanentFromSaved ||
    parseScalar(getParam(form, "project_details", "project_details", globalKey));

  const draft: OccupantWellbeingState = {
    rows,
    total_occupant_access: parseScalar(getParam(form, tab, subtab, "total_occupant_access")),
    total_permanent_occupancy: permanent,
    total_recreational: parseScalar(getParam(form, tab, subtab, "total_recreational")),
  };

  return computeOccupantWellbeingState(draft);
}

export function buildSavePayloadFromOccupantWellbeing(state: OccupantWellbeingState): {
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
    const val = state[p as keyof OccupantWellbeingState] as string;
    fields.push({ paramName: p, type: "t", value: JSON.stringify([val]) });
  }

  return fields;
}

export { emptyOccupantWellbeingRow };
