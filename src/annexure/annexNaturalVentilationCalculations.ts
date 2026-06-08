import type { AreaSourceRow } from "@/annexure/annexConditionedSpacesCalculations";

export const SQFT_TO_SQM = 1 / 10.764;

export type NaturalVentilationRow = {
  sourceIndex: number;
  reqularly_occupied_spaces: string;
  carpet_area_non_ac: string;
  openable_window_area: string;
  openable_door_area: string;
  total_openable_area: string;
  percent_openable_area: string;
  meets_mandatory: string;
  meets_point_one: string;
  meets_point_two: string;
  co2_meets_point_one: string;
  co2_meets_point_two: string;
};

export type NaturalVentilationState = {
  rows: NaturalVentilationRow[];
  total_regularly_occupied_area_natural: string;
  minimum_percentage_opening: string;
  regularly_occupied_area_air: string;
  meets_mandatory_all: string;
  meets_enhanced_one: string;
  meets_enhanced_two: string;
  fresh_air_meet_space: string;
  fresh_air_meet_1_point: string;
  fresh_air_meet_2_point: string;
  co2_meets_all_one_point: string;
  co2_meets_all_two_point: string;
  meets_6_percent_opening: string;
  meets_7_percent_opening: string;
  meets_8_percent_opening: string;
  meets_9_percent_opening: string;
  meets_10_percent_opening: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function boolToken(yes: boolean): string {
  return yes ? "TRUE" : "FALSE";
}

function yesNo(yes: boolean): string {
  return yes ? "Yes" : "No";
}

function isTrueToken(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === "true" || s === "yes" || s === "1";
}

export function filterNonAcAreaSourceRows(sources: AreaSourceRow[]): AreaSourceRow[] {
  return sources.filter(
    (r) =>
      r.air_condition_spaces === "non_air_conditioned_space" &&
      r.reqularly_non_occupied_spaces === "regularly_occupied_spaces",
  );
}

export function sqftToSqm(sqft: string): string {
  const v = n(sqft);
  return v > 0 ? fmt2(v * SQFT_TO_SQM) : "";
}

function thresholdsForCarpet(carpetSqm: number): { mandatory: number; point1: number; point2: number } {
  if (carpetSqm > 100) return { mandatory: 12, point1: 12, point2: 14 };
  return { mandatory: 8, point1: 10, point2: 12 };
}

export function computeNaturalVentilationRow(row: NaturalVentilationRow): NaturalVentilationRow {
  const carpet = n(row.carpet_area_non_ac);
  const window = n(row.openable_window_area);
  const door = n(row.openable_door_area);
  const totalOpen = window + door;
  const percent = carpet > 0 ? (totalOpen / carpet) * 100 : 0;
  const percentRounded = !percent || !Number.isFinite(percent) ? 0 : Math.round(percent);

  if (carpet <= 0) {
    return {
      ...row,
      total_openable_area: totalOpen > 0 ? fmt2(totalOpen) : "0.00",
      percent_openable_area: "0",
      meets_mandatory: "",
      meets_point_one: "",
      meets_point_two: "",
    };
  }

  const { mandatory, point1, point2 } = thresholdsForCarpet(carpet);
  const pct = percentRounded;
  return {
    ...row,
    total_openable_area: fmt2(totalOpen),
    percent_openable_area: String(pct),
    meets_mandatory: boolToken(pct >= mandatory && pct > 0),
    meets_point_one: boolToken(pct >= point1 && pct > 0),
    meets_point_two: boolToken(pct >= point2 && pct > 0),
  };
}

function allRowsTrue(rows: NaturalVentilationRow[], field: keyof NaturalVentilationRow): boolean {
  if (!rows.length) return false;
  for (const r of rows) {
    const val = String(r[field] ?? "").trim();
    if (val === "") return false;
    if (!isTrueToken(val)) return false;
  }
  return true;
}

function allRowsYes(rows: NaturalVentilationRow[], field: keyof NaturalVentilationRow): boolean {
  if (!rows.length) return false;
  for (const r of rows) {
    const val = String(r[field] ?? "").trim().toLowerCase();
    if (val !== "yes") return false;
  }
  return true;
}

export function computeNaturalVentilationState(state: NaturalVentilationState): NaturalVentilationState {
  const rows = state.rows.map(computeNaturalVentilationRow);

  let totalCarpet = 0;
  let areaMeetingMandatory = 0;
  let minPct = Number.POSITIVE_INFINITY;

  for (const r of rows) {
    const carpet = n(r.carpet_area_non_ac);
    totalCarpet += carpet;
    if (isTrueToken(r.meets_mandatory)) areaMeetingMandatory += carpet;
    const pct = n(r.percent_openable_area);
    if (carpet > 0 && pct >= 0) minPct = Math.min(minPct, pct);
  }

  const minOpening = Number.isFinite(minPct) ? minPct : 0;
  const areaPct = totalCarpet > 0 ? (areaMeetingMandatory / totalCarpet) * 100 : 0;

  const mandatoryAll = allRowsTrue(rows, "meets_mandatory");
  const enhancedOne = allRowsTrue(rows, "meets_point_one");
  const enhancedTwo = allRowsTrue(rows, "meets_point_two");
  const co2One = allRowsYes(rows, "co2_meets_point_one");
  const co2Two = allRowsYes(rows, "co2_meets_point_two");

  return {
    rows,
    total_regularly_occupied_area_natural: fmt2(totalCarpet),
    minimum_percentage_opening: minOpening > 0 || rows.length ? String(minOpening) : "",
    regularly_occupied_area_air: fmt2(areaPct),
    meets_mandatory_all: boolToken(mandatoryAll),
    meets_enhanced_one: boolToken(enhancedOne),
    meets_enhanced_two: boolToken(enhancedTwo),
    fresh_air_meet_space: yesNo(mandatoryAll),
    fresh_air_meet_1_point: yesNo(enhancedOne),
    fresh_air_meet_2_point: yesNo(enhancedTwo),
    co2_meets_all_one_point: yesNo(co2One),
    co2_meets_all_two_point: yesNo(co2Two),
    meets_6_percent_opening: yesNo(minOpening >= 6),
    meets_7_percent_opening: yesNo(minOpening >= 7),
    meets_8_percent_opening: yesNo(minOpening >= 8),
    meets_9_percent_opening: yesNo(minOpening >= 9),
    meets_10_percent_opening: yesNo(minOpening >= 10),
  };
}

export function emptyNaturalVentilationRow(sourceIndex: number): NaturalVentilationRow {
  return {
    sourceIndex,
    reqularly_occupied_spaces: "",
    carpet_area_non_ac: "",
    openable_window_area: "",
    openable_door_area: "",
    total_openable_area: "0.00",
    percent_openable_area: "0",
    meets_mandatory: "",
    meets_point_one: "",
    meets_point_two: "",
    co2_meets_point_one: "",
    co2_meets_point_two: "",
  };
}

export function displayBoolToken(v: string): string {
  if (!v.trim()) return "";
  return isTrueToken(v) ? "Yes" : "No";
}
