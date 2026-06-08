import type { AreaSourceRow } from "@/annexure/annexConditionedSpacesCalculations";
import {
  computeNaturalVentilationState,
  emptyNaturalVentilationRow,
  filterNonAcAreaSourceRows,
  sqftToSqm,
  type NaturalVentilationRow,
  type NaturalVentilationState,
} from "@/annexure/annexNaturalVentilationCalculations";
import { loadAreaSourceRows } from "@/annexure/annexConditionedSpacesStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ROW_PARAMS = [
  "reqularly_occupied_spaces",
  "carpet_area_non_ac",
  "openable_window_area",
  "openable_door_area",
  "total_openable_area",
  "percent_openable_area",
  "meets_mandatory",
  "meets_point_one",
  "meets_point_two",
  "co2_meets_point_one",
  "co2_meets_point_two",
] as const;

const SUMMARY_PARAMS = [
  "total_regularly_occupied_area_natural",
  "minimum_percentage_opening",
  "regularly_occupied_area_air",
  "meets_mandatory_all",
  "meets_enhanced_one",
  "meets_enhanced_two",
  "fresh_air_meet_space",
  "fresh_air_meet_1_point",
  "fresh_air_meet_2_point",
  "co2_meets_all_one_point",
  "co2_meets_all_two_point",
  "meets_6_percent_opening",
  "meets_7_percent_opening",
  "meets_8_percent_opening",
  "meets_9_percent_opening",
  "meets_10_percent_opening",
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

function hydrateRows(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  sources: AreaSourceRow[],
): NaturalVentilationRow[] {
  const filtered = filterNonAcAreaSourceRows(sources);
  const saved: Record<string, string[]> = {};
  for (const p of ROW_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  return filtered.map((src, displayIdx) => ({
    sourceIndex: src.sourceIndex,
    reqularly_occupied_spaces:
      saved.reqularly_occupied_spaces[displayIdx] || src.reqularly_occupied_spaces,
    carpet_area_non_ac:
      saved.carpet_area_non_ac[displayIdx] || sqftToSqm(src.total_carpet_area_circulation),
    openable_window_area: saved.openable_window_area[displayIdx] ?? "",
    openable_door_area: saved.openable_door_area[displayIdx] ?? "",
    total_openable_area: saved.total_openable_area[displayIdx] ?? "",
    percent_openable_area: saved.percent_openable_area[displayIdx] ?? "",
    meets_mandatory: saved.meets_mandatory[displayIdx] ?? "",
    meets_point_one: saved.meets_point_one[displayIdx] ?? "",
    meets_point_two: saved.meets_point_two[displayIdx] ?? "",
    co2_meets_point_one: saved.co2_meets_point_one[displayIdx] ?? "",
    co2_meets_point_two: saved.co2_meets_point_two[displayIdx] ?? "",
  }));
}

export function hydrateNaturalVentilationAnnex(
  _schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): NaturalVentilationState {
  const sources = loadAreaSourceRows(form);
  const rows = hydrateRows(form, tab, subtab, sources);

  const draft: NaturalVentilationState = {
    rows: rows.length ? rows : [],
    total_regularly_occupied_area_natural: parseSummaryScalar(
      getParam(form, tab, subtab, "total_regularly_occupied_area_natural"),
    ),
    minimum_percentage_opening: parseSummaryScalar(
      getParam(form, tab, subtab, "minimum_percentage_opening"),
    ),
    regularly_occupied_area_air: parseSummaryScalar(
      getParam(form, tab, subtab, "regularly_occupied_area_air"),
    ),
    meets_mandatory_all: parseSummaryScalar(getParam(form, tab, subtab, "meets_mandatory_all")),
    meets_enhanced_one: parseSummaryScalar(getParam(form, tab, subtab, "meets_enhanced_one")),
    meets_enhanced_two: parseSummaryScalar(getParam(form, tab, subtab, "meets_enhanced_two")),
    fresh_air_meet_space: parseSummaryScalar(getParam(form, tab, subtab, "fresh_air_meet_space")),
    fresh_air_meet_1_point: parseSummaryScalar(getParam(form, tab, subtab, "fresh_air_meet_1_point")),
    fresh_air_meet_2_point: parseSummaryScalar(getParam(form, tab, subtab, "fresh_air_meet_2_point")),
    co2_meets_all_one_point: parseSummaryScalar(
      getParam(form, tab, subtab, "co2_meets_all_one_point"),
    ),
    co2_meets_all_two_point: parseSummaryScalar(
      getParam(form, tab, subtab, "co2_meets_all_two_point"),
    ),
    meets_6_percent_opening: parseSummaryScalar(
      getParam(form, tab, subtab, "meets_6_percent_opening"),
      "No",
    ),
    meets_7_percent_opening: parseSummaryScalar(
      getParam(form, tab, subtab, "meets_7_percent_opening"),
      "No",
    ),
    meets_8_percent_opening: parseSummaryScalar(
      getParam(form, tab, subtab, "meets_8_percent_opening"),
      "No",
    ),
    meets_9_percent_opening: parseSummaryScalar(
      getParam(form, tab, subtab, "meets_9_percent_opening"),
      "No",
    ),
    meets_10_percent_opening: parseSummaryScalar(
      getParam(form, tab, subtab, "meets_10_percent_opening"),
      "No",
    ),
  };

  return computeNaturalVentilationState(draft);
}

export function buildSavePayloadFromNaturalVentilation(state: NaturalVentilationState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const p of ROW_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(state.rows.map((r) => (r as Record<string, string>)[p] ?? "")),
    });
  }

  for (const p of SUMMARY_PARAMS) {
    const val = state[p as keyof NaturalVentilationState] as string;
    fields.push({ paramName: p, type: "t", value: JSON.stringify([val]) });
  }

  return fields;
}

export function mergeNaturalVentilationRowsFromSource(
  prev: NaturalVentilationRow[],
  sources: AreaSourceRow[],
): NaturalVentilationRow[] {
  const filtered = filterNonAcAreaSourceRows(sources);
  const prevBySource = new Map(prev.map((r) => [r.sourceIndex, r]));
  return filtered.map((src) => {
    const existing = prevBySource.get(src.sourceIndex);
    if (existing) {
      return {
        ...existing,
        reqularly_occupied_spaces: src.reqularly_occupied_spaces,
        carpet_area_non_ac: sqftToSqm(src.total_carpet_area_circulation),
      };
    }
    const row = emptyNaturalVentilationRow(src.sourceIndex);
    row.reqularly_occupied_spaces = src.reqularly_occupied_spaces;
    row.carpet_area_non_ac = sqftToSqm(src.total_carpet_area_circulation);
    return row;
  });
}

export { loadAreaSourceRows };
