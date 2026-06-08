import {
  computeAcFreshAirState,
  emptyFreshAirSystemRow,
  type AcFreshAirState,
  type FreshAirAreaRow,
  type SpaceTypeDef,
} from "@/annexure/annexAcFreshAirCalculations";
import { filterAreaSourceRows } from "@/annexure/annexConditionedSpacesCalculations";
import { loadAreaSourceRows } from "@/annexure/annexConditionedSpacesStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const SYSTEM_PARAMS = ["type_of_fresh_air_sys", "air_space_baseline_capacity"] as const;

const AREA_PARAMS = [
  "air_space_regular_occ",
  "air_type_of_spaces",
  "type_of_fresh_air",
  "air_space_baseline_lpd",
  "air_design_occupancy",
  "air_space_outdoor",
  "air_space_minimum",
  "air_space_ventilation",
] as const;

const SUMMARY_SCALAR_PARAMS = [
  "air_fresh_mandatory_all",
  "total_meets_supplied_air",
  "meets_occupancy",
  "meets_regulary_area_space",
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

function parseNestedSubMap(raw: string | undefined): Record<string, string[]> {
  if (!raw?.trim()) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    const out: Record<string, string[]> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (Array.isArray(val)) out[k] = val.map((x) => (x == null ? "" : String(x)));
      else if (val != null) out[k] = [String(val)];
    }
    return out;
  } catch {
    return {};
  }
}

function spaceTypesFromSchema(schema: AnnexureSchemaDefinition): Record<string, SpaceTypeDef> {
  const raw = schema.acFreshAirLayout?.spaceTypeOptions ?? {};
  const out: Record<string, SpaceTypeDef> = {};
  for (const [key, def] of Object.entries(raw)) {
    out[key] = {
      label: def.label,
      baseline: def.baseline,
      outdoor: def.outdoor ?? null,
    };
  }
  return out;
}

function hydrateAreaRows(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  sources: ReturnType<typeof loadAreaSourceRows>,
): FreshAirAreaRow[] {
  const saved: Record<string, string[]> = {};
  for (const p of AREA_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }
  const subMap = parseNestedSubMap(getParam(form, tab, subtab, "type_of_fresh_air_sub"));

  const filtered = filterAreaSourceRows(sources);

  return filtered.map((src, displayIdx) => {
    const key = String(src.sourceIndex);
    const subList = subMap[key] ?? [];
    const subRows = subList.length
      ? subList.map((v) => ({ type_of_fresh_air: v }))
      : [];

    return {
      sourceIndex: src.sourceIndex,
      reqularly_occupied_spaces: src.reqularly_occupied_spaces,
      air_space_regular_occ:
        saved.air_space_regular_occ[displayIdx] || src.total_carpet_area_circulation,
      air_type_of_spaces: saved.air_type_of_spaces[displayIdx] ?? "",
      type_of_fresh_air: saved.type_of_fresh_air[displayIdx] ?? "",
      air_space_baseline_lpd: saved.air_space_baseline_lpd[displayIdx] ?? "",
      air_design_occupancy: saved.air_design_occupancy[displayIdx] ?? "",
      air_space_outdoor: saved.air_space_outdoor[displayIdx] ?? "",
      air_space_minimum: saved.air_space_minimum[displayIdx] ?? "0.00",
      air_space_ventilation: saved.air_space_ventilation[displayIdx] ?? "0.00",
      expanded: subRows.length > 0,
      subRows: subRows.length ? subRows : [],
    };
  });
}

export function hydrateAcFreshAirAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): AcFreshAirState {
  const minRows = schema.acFreshAirLayout?.systemMinRows ?? 5;
  const spaceTypes = spaceTypesFromSchema(schema);
  const sources = loadAreaSourceRows(form);

  const sysArrays: Record<string, string[]> = {};
  for (const p of SYSTEM_PARAMS) {
    sysArrays[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }
  const sysLen = Math.max(minRows, ...SYSTEM_PARAMS.map((p) => sysArrays[p].length));
  const systemRows = [];
  for (let i = 0; i < sysLen; i++) {
    systemRows.push({
      type_of_fresh_air_sys: sysArrays.type_of_fresh_air_sys[i] ?? "",
      air_space_baseline_capacity: sysArrays.air_space_baseline_capacity[i] ?? "",
    });
  }
  if (!systemRows.length) {
    for (let i = 0; i < minRows; i++) systemRows.push(emptyFreshAirSystemRow());
  }

  const areaRows = hydrateAreaRows(form, tab, subtab, sources);

  const draft: AcFreshAirState = {
    systemRows,
    areaRows,
    air_fresh_mandatory_all: parseScalar(getParam(form, tab, subtab, "air_fresh_mandatory_all")),
    meets_ventilation_project: parseScalar(
      parseJsonArray(getParam(form, tab, subtab, "meets_ventilation_project"))[0] ??
        getParam(form, tab, subtab, "meets_ventilation_project"),
    ),
    total_meets_supplied_air: parseScalar(getParam(form, tab, subtab, "total_meets_supplied_air")),
    meets_occupancy: parseScalar(getParam(form, tab, subtab, "meets_occupancy")),
    meets_regulary_area_space: parseScalar(
      getParam(form, tab, subtab, "meets_regulary_area_space"),
    ),
  };

  return computeAcFreshAirState(draft, spaceTypes);
}

export function buildSavePayloadFromAcFreshAir(state: AcFreshAirState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const p of SYSTEM_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(
        state.systemRows.map((r) => (r as unknown as Record<string, string>)[p] ?? ""),
      ),
    });
  }

  for (const p of AREA_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(
        state.areaRows.map((r) => (r as unknown as Record<string, string>)[p] ?? ""),
      ),
    });
  }

  const subMap: Record<string, string[]> = {};
  for (const row of state.areaRows) {
    if (row.subRows.length) {
      subMap[String(row.sourceIndex)] = row.subRows.map((s) => s.type_of_fresh_air);
    }
  }
  fields.push({
    paramName: "type_of_fresh_air_sub",
    type: "t",
    value: JSON.stringify(subMap),
  });

  for (const p of SUMMARY_SCALAR_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify([state[p as keyof AcFreshAirState] as string]),
    });
  }

  fields.push({
    paramName: "meets_ventilation_project",
    type: "t",
    value: JSON.stringify([state.meets_ventilation_project]),
  });

  return fields;
}

export { emptyFreshAirSystemRow, loadAreaSourceRows };
