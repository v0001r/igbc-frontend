import {
  computeUrbanHeatNonRoofState,
  emptyUrbanHeatNonRoofRow,
  type UrbanHeatNonRoofRow,
  type UrbanHeatNonRoofState,
} from "@/annexure/annexUrbanHeatNonRoofCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ROW_ARRAY_PARAMS = [
  "non_roof_typo",
  "non_roof_values",
  "area_covered",
  "area_factor",
  "open_area_covered",
  "open_area_factor",
  "handscape_area_covered",
  "handscape_area_factor",
  "treated_roof_area",
] as const;

const SCALAR_PARAMS = [
  "covered_area_exempted",
  "total_non_roof",
  "total_treated_nonroof",
  "total_treated_percentage",
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

function loadTotalNon(form: CertificationFormResponse, schema: AnnexureSchemaDefinition): string {
  const src = schema.urbanHeatNonRoofLayout?.totalNonSource;
  const tab = src?.tab ?? "project_details";
  const subtab = src?.subtab ?? "project_details";
  const param = src?.param ?? "non_total";
  return parseScalar(getParam(form, tab, subtab, param));
}

export function hydrateUrbanHeatNonRoofAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): UrbanHeatNonRoofState {
  const minRows = schema.urbanHeatNonRoofLayout?.minRows ?? 5;
  const saved: Record<(typeof ROW_ARRAY_PARAMS)[number], string[]> = {} as Record<
    (typeof ROW_ARRAY_PARAMS)[number],
    string[]
  >;

  for (const param of ROW_ARRAY_PARAMS) {
    saved[param] = parseJsonArray(getParam(form, tab, subtab, param));
  }

  const maxLen = Math.max(minRows, ...ROW_ARRAY_PARAMS.map((p) => saved[p].length));
  const rows: UrbanHeatNonRoofRow[] = [];
  for (let i = 0; i < maxLen; i++) {
    const base = emptyUrbanHeatNonRoofRow();
    rows.push({
      ...base,
      non_roof_typo: saved.non_roof_typo[i] ?? "",
      non_roof_values: saved.non_roof_values[i] ?? "",
      area_covered: saved.area_covered[i] ?? "",
      area_factor: saved.area_factor[i] || base.area_factor,
      open_area_covered: saved.open_area_covered[i] ?? "",
      open_area_factor: saved.open_area_factor[i] || base.open_area_factor,
      handscape_area_covered: saved.handscape_area_covered[i] ?? "",
      handscape_area_factor: saved.handscape_area_factor[i] || base.handscape_area_factor,
      treated_roof_area: saved.treated_roof_area[i] ?? "",
    });
  }

  const draft: UrbanHeatNonRoofState = {
    total_non: loadTotalNon(form, schema),
    covered_area_exempted: parseScalar(getParam(form, tab, subtab, "covered_area_exempted")),
    rows,
    total_non_roof: parseScalar(getParam(form, tab, subtab, "total_non_roof")),
    total_treated_nonroof: parseScalar(getParam(form, tab, subtab, "total_treated_nonroof")),
    total_treated_percentage: parseScalar(getParam(form, tab, subtab, "total_treated_percentage")),
  };

  return computeUrbanHeatNonRoofState(draft);
}

export function buildSavePayloadFromUrbanHeatNonRoof(state: UrbanHeatNonRoofState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const computed = computeUrbanHeatNonRoofState(state);
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const param of ROW_ARRAY_PARAMS) {
    fields.push({
      paramName: param,
      type: "t",
      value: JSON.stringify(computed.rows.map((r) => r[param])),
    });
  }

  fields.push({
    paramName: "non_roof_types",
    type: "t",
    value: JSON.stringify(computed.rows.map((r) => r.non_roof_typo)),
  });
  fields.push({
    paramName: "area_desc",
    type: "t",
    value: JSON.stringify(computed.rows.map((r) => r.non_roof_values)),
  });

  for (const param of SCALAR_PARAMS) {
    fields.push({
      paramName: param,
      type: "t",
      value: JSON.stringify([computed[param]]),
    });
  }

  return fields;
}
