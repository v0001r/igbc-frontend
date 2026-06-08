import {
  computeConditionedSpacesState,
  emptyAreaSubRow,
  emptySystemRow,
  filterAreaSourceRows,
  type AreaSourceRow,
  type ConditionedAreaRow,
  type ConditionedSpacesState,
} from "@/annexure/annexConditionedSpacesCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const SYSTEM_PARAMS = [
  "air_condition_sys",
  "other_space_condition",
  "air_qty",
  "air_capacity",
  "actual_efficiency_unit",
  "actual_efficiency_value",
  "regestration_type",
  "regestration_gwp",
  "baseline_unit",
  "baseline_value",
  "meet_credit_comp",
] as const;

const AREA_PARAMS = [
  "reqularly_occupied_air_spaces",
  "air_condition_sys_type",
  "other_area_condition",
  "scope_air_condition",
  "area_space_air",
  "area_meet_credit",
  "air_regestration_gwp",
] as const;

const SUMMARY_PARAMS = [
  "air_total_air_conditioned_area",
  "air_efficiently_area",
  "air_percentage_area",
  "air_meeting_gwp",
] as const;

const SUB_PARAMS = [
  "air_condition_sys_type_sub",
  "scope_air_condition_sub",
  "air_regestration_gwp_sub",
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

function parseSummaryScalar(raw: string | undefined, fallback = ""): string {
  const arr = parseJsonArray(raw);
  return arr[0] ?? fallback;
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

export function loadAreaSourceRows(form: CertificationFormResponse): AreaSourceRow[] {
  const tab = "sustainable_design";
  const subtab = "area_space_circulation";
  const spaces = parseJsonArray(getParam(form, tab, subtab, "reqularly_occupied_spaces"));
  const occupancy = parseJsonArray(getParam(form, tab, subtab, "reqularly_non_occupied_spaces"));
  const ac = parseJsonArray(getParam(form, tab, subtab, "air_condition_spaces"));
  const areas = parseJsonArray(getParam(form, tab, subtab, "total_carpet_area_circulation"));
  const len = Math.max(spaces.length, occupancy.length, ac.length, areas.length);
  const rows: AreaSourceRow[] = [];
  for (let i = 0; i < len; i++) {
    rows.push({
      sourceIndex: i + 1,
      reqularly_occupied_spaces: spaces[i] ?? "",
      reqularly_non_occupied_spaces: occupancy[i] ?? "",
      air_condition_spaces: ac[i] ?? "",
      total_carpet_area_circulation: areas[i] ?? "",
    });
  }
  return rows;
}

function hydrateAreaRows(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  sources: AreaSourceRow[],
): ConditionedAreaRow[] {
  const filtered = filterAreaSourceRows(sources);
  const saved: Record<string, string[]> = {};
  for (const p of AREA_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const subType = parseNestedSubMap(getParam(form, tab, subtab, "air_condition_sys_type_sub"));
  const subScope = parseNestedSubMap(getParam(form, tab, subtab, "scope_air_condition_sub"));
  const subGwp = parseNestedSubMap(getParam(form, tab, subtab, "air_regestration_gwp_sub"));

  return filtered.map((src, displayIdx) => {
    const key = String(src.sourceIndex);
    const typeList = subType[key] ?? [];
    const scopeList = subScope[key] ?? [];
    const gwpList = subGwp[key] ?? [];
    const subLen = Math.max(typeList.length, scopeList.length, gwpList.length);
    const subRows = [];
    for (let s = 0; s < subLen; s++) {
      subRows.push({
        air_condition_sys_type: typeList[s] ?? "",
        scope_air_condition: scopeList[s] ?? "",
        air_regestration_gwp: gwpList[s] ?? "",
      });
    }

    return {
      sourceIndex: src.sourceIndex,
      reqularly_occupied_air_spaces:
        saved.reqularly_occupied_air_spaces[displayIdx] || src.reqularly_occupied_spaces,
      air_condition_sys_type: saved.air_condition_sys_type[displayIdx] ?? "",
      other_area_condition: saved.other_area_condition[displayIdx] ?? "",
      scope_air_condition: saved.scope_air_condition[displayIdx] ?? "",
      area_space_air: saved.area_space_air[displayIdx] || src.total_carpet_area_circulation,
      area_meet_credit: saved.area_meet_credit[displayIdx] ?? "",
      air_regestration_gwp: saved.air_regestration_gwp[displayIdx] ?? "",
      expanded: subRows.length > 0,
      subRows: subRows.length ? subRows : [],
    };
  });
}

export function hydrateConditionedSpacesAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): ConditionedSpacesState {
  const minRows = schema.conditionedSpacesLayout?.systemMinRows ?? 5;
  const arrays: Record<string, string[]> = {};
  for (const p of SYSTEM_PARAMS) {
    arrays[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }
  const rowCount = Math.max(minRows, ...SYSTEM_PARAMS.map((p) => arrays[p].length));
  const systemRows = [];
  for (let i = 0; i < rowCount; i++) {
    const row = emptySystemRow();
    for (const p of SYSTEM_PARAMS) {
      if (arrays[p][i] != null) (row as Record<string, string>)[p] = arrays[p][i];
    }
    systemRows.push(row);
  }

  const sources = loadAreaSourceRows(form);
  const areaRows = hydrateAreaRows(form, tab, subtab, sources);

  const draft: ConditionedSpacesState = {
    systemRows,
    areaRows,
    air_total_air_conditioned_area: parseSummaryScalar(
      getParam(form, tab, subtab, "air_total_air_conditioned_area"),
    ),
    air_efficiently_area: parseSummaryScalar(getParam(form, tab, subtab, "air_efficiently_area")),
    air_percentage_area: parseSummaryScalar(getParam(form, tab, subtab, "air_percentage_area")),
    air_meeting_gwp: parseSummaryScalar(getParam(form, tab, subtab, "air_meeting_gwp"), "0"),
  };

  return computeConditionedSpacesState(draft);
}

export function buildSavePayloadFromConditionedSpaces(state: ConditionedSpacesState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const p of SYSTEM_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(state.systemRows.map((r) => (r as Record<string, string>)[p] ?? "")),
    });
  }

  for (const p of AREA_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(state.areaRows.map((r) => (r as Record<string, string>)[p] ?? "")),
    });
  }

  const subType: Record<string, string[]> = {};
  const subScope: Record<string, string[]> = {};
  const subGwp: Record<string, string[]> = {};
  for (const row of state.areaRows) {
    if (!row.subRows.length) continue;
    const key = String(row.sourceIndex);
    subType[key] = row.subRows.map((s) => s.air_condition_sys_type);
    subScope[key] = row.subRows.map((s) => s.scope_air_condition);
    subGwp[key] = row.subRows.map((s) => s.air_regestration_gwp);
  }

  fields.push({
    paramName: "air_condition_sys_type_sub",
    type: "t",
    value: JSON.stringify(subType),
  });
  fields.push({
    paramName: "scope_air_condition_sub",
    type: "t",
    value: JSON.stringify(subScope),
  });
  fields.push({
    paramName: "air_regestration_gwp_sub",
    type: "t",
    value: JSON.stringify(subGwp),
  });

  for (const p of SUMMARY_PARAMS) {
    const val = state[p as keyof ConditionedSpacesState] as string;
    fields.push({ paramName: p, type: "t", value: JSON.stringify([val]) });
  }

  return fields;
}

export function listConditionedSpacesParams(schema: AnnexureSchemaDefinition): string[] {
  return [
    ...SYSTEM_PARAMS,
    ...AREA_PARAMS,
    ...SUB_PARAMS,
    ...SUMMARY_PARAMS,
  ];
}

export function mergeAreaRowsFromSource(
  prev: ConditionedAreaRow[],
  sources: AreaSourceRow[],
): ConditionedAreaRow[] {
  const filtered = filterAreaSourceRows(sources);
  const prevBySource = new Map(prev.map((r) => [r.sourceIndex, r]));
  return filtered.map((src) => {
    const existing = prevBySource.get(src.sourceIndex);
    if (existing) {
      return {
        ...existing,
        reqularly_occupied_air_spaces: src.reqularly_occupied_spaces,
        area_space_air: src.total_carpet_area_circulation,
      };
    }
    return {
      sourceIndex: src.sourceIndex,
      reqularly_occupied_air_spaces: src.reqularly_occupied_spaces,
      air_condition_sys_type: "",
      other_area_condition: "",
      scope_air_condition: "",
      area_space_air: src.total_carpet_area_circulation,
      area_meet_credit: "",
      air_regestration_gwp: "",
      expanded: false,
      subRows: [],
    };
  });
}

export { emptyAreaSubRow };
